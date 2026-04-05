/**
 * Price Probe — no-API-key, fully client-side flight price intelligence
 *
 * Strategy (no server required):
 *
 * 1. Generate deep-links for the user's search across 5 booking platforms
 *    (Google Flights, Skyscanner, Kayak, Trip.com, Momondo)
 *
 * 2. "Reachability probe" — try a no-cors fetch to each URL.
 *    - If it returns an opaque response → site is reachable (we just can't read it)
 *    - If it throws a TypeError → blocked (DNS failure or hard CORS rejection)
 *    This is the client-side equivalent of a HEAD request.
 *
 * 3. iframe embedding check — inject a hidden iframe and see if it loads.
 *    Most booking sites return X-Frame-Options: DENY, so this fails for them.
 *    But some affiliate/redirect links do allow framing.
 *
 * 4. URL param scanning — even before opening a site, scan the generated
 *    deep-link URL itself for any price signals embedded by our own link
 *    generator (useful for future airline GDS deeplinks that encode price).
 *
 * Honest expectation:
 * - Google Flights, Skyscanner, Kayak: reachable but NOT iframe-embeddable
 * - No prices in URL params (JS-loaded client-side)
 * - This feature's real value: instant pre-qualified deep-links while
 *   the actual API results load in the background
 */

import { generateAllLinks } from './deepLinks';

// Price-related query param names used by some booking platforms / GDS deeplinks
const PRICE_PARAM_PATTERNS = [
  /price/i, /fare/i, /amount/i, /cost/i, /total/i,
  /rate/i, /fee/i, /tarif/i,
];

function extractPriceSignals(url) {
  try {
    const u = new URL(url);
    const signals = {};
    for (const [key, val] of u.searchParams.entries()) {
      if (PRICE_PARAM_PATTERNS.some(p => p.test(key)) && val) {
        signals[key] = val;
      }
    }
    return signals;
  } catch {
    return {};
  }
}

/**
 * Probe reachability using a no-cors fetch.
 * Returns: { reachable, status, note }
 *
 * With mode:'no-cors', a successful opaque response means the site answered.
 * A TypeError means blocked (network error / hard CORS rejection).
 */
async function probeReachability(url, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // no-cors: we can't read the response, but lack of error = reachable
    await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    });
    clearTimeout(timer);
    return { reachable: true, note: 'Responded (opaque — CORS blocked read)' };
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      return { reachable: false, note: 'Timeout after ' + timeoutMs + 'ms' };
    }
    // TypeError = network/CORS hard block
    return { reachable: false, note: err.message };
  }
}

/**
 * Check if a URL can be embedded in an iframe.
 * Detects X-Frame-Options: DENY/SAMEORIGIN blocks.
 */
export function checkIframeEmbeddable(url, timeoutMs = 5000) {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve({ embeddable: false, reason: 'server-side' });
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
    iframe.sandbox = 'allow-scripts allow-same-origin';

    let settled = false;
    const done = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { document.body.removeChild(iframe); } catch {}
      resolve(result);
    };

    const timer = setTimeout(() => {
      // Still loading after timeout = likely embeddable but slow
      done({ embeddable: true, reason: 'loaded (slow)' });
    }, timeoutMs);

    iframe.onload = () => {
      // Loaded, but check if content is accessible (SAMEORIGIN blocks read, not load)
      try {
        // This throws if X-Frame-Options: SAMEORIGIN blocked the frame
        const _ = iframe.contentDocument?.title;
        done({ embeddable: true, reason: 'loaded + readable' });
      } catch {
        done({ embeddable: false, reason: 'loaded but frame-busted (SAMEORIGIN)' });
      }
    };
    iframe.onerror = () => done({ embeddable: false, reason: 'load error (DENY)' });

    iframe.src = url;
    document.body.appendChild(iframe);
  });
}

/**
 * Probe all booking platforms for a given search
 */
export async function probeAllPlatforms(searchParams) {
  const links = generateAllLinks(searchParams);

  const results = await Promise.allSettled(
    Object.entries(links).map(async ([platform, url]) => {
      const priceSignals = extractPriceSignals(url);

      // Run reachability + iframe checks in parallel
      const [reach, iframe] = await Promise.all([
        probeReachability(url),
        checkIframeEmbeddable(url, 4000),
      ]);

      return {
        platform,
        url,
        reachable: reach.reachable,
        reachNote: reach.note,
        iframe,
        priceSignals,
        hasPriceData: Object.keys(priceSignals).length > 0,
      };
    })
  );

  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
}

/**
 * Full price intelligence run
 */
export async function runPriceIntelligence(searchParams) {
  const platforms = await probeAllPlatforms(searchParams);
  return {
    platforms,
    summary: {
      total: platforms.length,
      reachable: platforms.filter(p => p.reachable).length,
      withPriceSignals: platforms.filter(p => p.hasPriceData).length,
      iframeEmbeddable: platforms.filter(p => p.iframe?.embeddable).length,
    },
  };
}
