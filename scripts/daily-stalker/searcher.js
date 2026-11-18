/**
 * Multi-source flight searcher.
 *
 * Sources:
 *   - Skyscanner (RapidAPI "Sky Scrapper")  — live prices, needs RAPIDAPI_KEY
 *   - Amadeus Self-Service                  — live prices, needs AMADEUS_API_KEY/SECRET
 *   - Google Flights / Trip.com             — NO public price API: deep-links only
 *
 * Rules that protect the user from bad prices:
 *   1. Live and simulated data are NEVER mixed. Simulation is OFF unless ALLOW_SIMULATION=true,
 *      and simulated rows are always flagged.
 *   2. Prices <= 0, non-SAR currencies and non-finite numbers are discarded.
 *   3. Suspiciously low fares (<40% of the median) and cross-source disagreements (>30%)
 *      are flagged "verify before booking".
 *   4. Every failure is recorded (never swallowed) and surfaced in the report.
 *   5. All HTTP goes through one global concurrency limiter + retry/backoff on 429/5xx.
 */

const RAPIDAPI_HOST = 'sky-scrapper.p.rapidapi.com';

// ─── Config (read lazily so tests / CI can set env at runtime) ───

const int = (v, d) => { const n = parseInt(v, 10); return Number.isFinite(n) && n >= 0 ? n : d; };

export function getConfig() {
  const e = process.env;
  return {
    rapidKey: e.RAPIDAPI_KEY || '',
    amaKey: e.AMADEUS_API_KEY || '',
    amaSecret: e.AMADEUS_API_SECRET || '',
    amaBase: e.AMADEUS_ENV === 'test' ? 'https://test.api.amadeus.com' : 'https://api.amadeus.com',
    allowSim: e.ALLOW_SIMULATION === 'true',
    concurrency: Math.max(1, int(e.CONCURRENCY, 4)),
    skyBudget: int(e.SKYSCANNER_MAX_CALLS, 45),
    retryBaseMs: int(e.RETRY_BASE_MS, 1000),
    timeoutMs: int(e.HTTP_TIMEOUT_MS, 20000),
  };
}

// ─── Run statistics (surfaced in the report) ───

const stats = { skyCalls: 0, skyBudgetHit: false, amaCalls: 0, idsUnverified: new Set() };
export function getRunStats() { return { ...stats, idsUnverified: [...stats.idsUnverified] }; }

// ─── Global concurrency limiter ───

let limiter = null;
function limit(fn) {
  if (!limiter) {
    const max = getConfig().concurrency;
    let active = 0;
    const queue = [];
    const next = () => {
      if (active >= max || !queue.length) return;
      active++;
      const { fn, resolve, reject } = queue.shift();
      fn().then(resolve, reject).finally(() => { active--; next(); });
    };
    limiter = (f) => new Promise((resolve, reject) => { queue.push({ fn: f, resolve, reject }); next(); });
  }
  return limiter(fn);
}

// ─── HTTP with retry/backoff (keys never appear in thrown messages) ───

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function httpJson(url, init, label) {
  const { retryBaseMs, timeoutMs } = getConfig();
  let lastErr;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
      if (res.ok) return await res.json();
      const retryable = res.status === 429 || res.status >= 500;
      const body = (await res.text().catch(() => '')).replace(/\s+/g, ' ').slice(0, 140);
      lastErr = new Error(`${label}: HTTP ${res.status}${body ? ` — ${body}` : ''}`);
      if (!retryable) throw Object.assign(lastErr, { fatal: true });
      const ra = Number(res.headers.get('retry-after'));
      await sleep(Number.isFinite(ra) && ra > 0 ? Math.min(ra * 1000, 30000) : retryBaseMs * 2 ** attempt + Math.random() * 200);
    } catch (e) {
      if (e.fatal) throw e;
      lastErr = lastErr && lastErr.message.startsWith(label) ? lastErr : new Error(`${label}: ${e.name === 'TimeoutError' ? 'timeout' : e.message}`);
      await sleep(retryBaseMs * 2 ** attempt);
    }
  }
  throw lastErr;
}

// ─── Result validation ───

function clean(results) {
  return (results || []).filter(r =>
    r && Number.isFinite(r.price) && r.price > 0 && (r.currency || 'SAR') === 'SAR'
  );
}

// ─── Skyscanner (RapidAPI) ───

const idCache = new Map();

/** Entity IDs must be real Skyscanner IDs. Resolve them live; fall back to the static table (flagged). */
function resolveSkyIds(place) {
  if (idCache.has(place.code)) return idCache.get(place.code);
  const p = (async () => {
    const { rapidKey } = getConfig();
    try {
      const data = await limit(() => httpJson(
        `https://${RAPIDAPI_HOST}/api/v1/flights/searchAirport?query=${encodeURIComponent(place.name)}&locale=en-US`,
        { headers: { 'x-rapidapi-key': rapidKey, 'x-rapidapi-host': RAPIDAPI_HOST } },
        `Skyscanner lookup ${place.code}`,
      ));
      const top = data?.data?.[0];
      const rp = top?.navigation?.relevantFlightParams || {};
      const skyId = rp.skyId || top?.skyId;
      const entityId = rp.entityId || top?.entityId;
      if (skyId && entityId) return { skyId, entityId };
    } catch { /* fall back below */ }
    stats.idsUnverified.add(place.code);
    return { skyId: place.skyId, entityId: place.entityId };
  })();
  idCache.set(place.code, p);
  return p;
}

async function searchSkyscanner(origin, dest, date) {
  const { rapidKey, skyBudget } = getConfig();
  if (!rapidKey) return null;
  if (stats.skyCalls >= skyBudget) { stats.skyBudgetHit = true; return null; }
  stats.skyCalls++;

  const [o, d] = await Promise.all([resolveSkyIds(origin), resolveSkyIds(dest)]);
  const url = new URL(`https://${RAPIDAPI_HOST}/api/v2/flights/searchFlightsComplete`);
  const q = {
    originSkyId: o.skyId, destinationSkyId: d.skyId,
    originEntityId: o.entityId, destinationEntityId: d.entityId,
    date, cabinClass: 'economy', adults: '1', currency: 'SAR', market: 'en-US', countryCode: 'SA',
  };
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, v);

  const data = await limit(() => httpJson(
    url.toString(),
    { headers: { 'x-rapidapi-key': rapidKey, 'x-rapidapi-host': RAPIDAPI_HOST } },
    `Skyscanner ${dest.code} ${date}`,
  ));

  return clean((data?.data?.itineraries || []).map(itin => {
    const leg = itin.legs?.[0];
    if (!leg) return null;
    const seg = leg.segments?.[0];
    return {
      source: 'Skyscanner',
      date,
      price: Number(itin.price?.raw),
      currency: 'SAR',
      airline: seg?.marketingCarrier?.name || seg?.operatingCarrier?.name || 'Unknown',
      duration: leg.durationInMinutes || 0,
      stops: leg.stopCount || 0,
      departure: leg.departure || '',
      arrival: leg.arrival || '',
      deepLink: null,
    };
  }));
}

// ─── Amadeus ───

let tokenPromise = null;
let tokenExpiry = 0;

function getAmadeusToken() {
  if (tokenPromise && Date.now() < tokenExpiry) return tokenPromise;
  const { amaKey, amaSecret, amaBase } = getConfig();
  if (!amaKey || !amaSecret) return Promise.resolve(null);
  tokenExpiry = Date.now() + 60_000; // provisional; replaced when the response arrives
  // One shared in-flight promise → 15 parallel destinations make ONE token request, not 15.
  tokenPromise = limit(() => httpJson(`${amaBase}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: amaKey, client_secret: amaSecret }),
  }, 'Amadeus auth')).then(d => {
    tokenExpiry = Date.now() + Math.max((d.expires_in || 1800) - 60, 60) * 1000;
    return d.access_token;
  }).catch(e => { tokenPromise = null; tokenExpiry = 0; throw e; });
  return tokenPromise;
}

async function amadeusGet(path, params, label) {
  const token = await getAmadeusToken();
  if (!token) return null;
  stats.amaCalls++;
  const { amaBase } = getConfig();
  return limit(() => httpJson(`${amaBase}${path}?${new URLSearchParams(params)}`, { headers: { Authorization: `Bearer ${token}` } }, label));
}

/** ONE call returns the cheapest fare per departure date across the whole window. */
async function amadeusCheapestDates(origin, dest, fromDate, toDate) {
  const data = await amadeusGet('/v1/shopping/flight-dates', {
    origin: origin.code, destination: dest.code, departureDate: `${fromDate},${toDate}`, oneWay: 'true',
  }, `Amadeus calendar ${dest.code}`);
  return (data?.data || [])
    .map(x => ({ date: x.departureDate, price: Number(x.price?.total) }))
    .filter(x => x.date && x.price > 0)
    .sort((a, b) => a.price - b.price);
}

async function searchAmadeus(origin, dest, date) {
  const data = await amadeusGet('/v2/shopping/flight-offers', {
    originLocationCode: origin.code, destinationLocationCode: dest.code, departureDate: date,
    adults: '1', travelClass: 'ECONOMY', currencyCode: 'SAR', max: '10', nonStop: 'false',
  }, `Amadeus offers ${dest.code} ${date}`);
  if (!data) return null;

  return clean((data.data || []).map(offer => {
    const outbound = offer.itineraries?.[0];
    const segs = outbound?.segments || [];
    const first = segs[0] || {};
    const last = segs[segs.length - 1] || {};
    const m = (outbound?.duration || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    return {
      source: 'Amadeus',
      date,
      price: parseFloat(offer.price?.grandTotal || offer.price?.total),
      currency: offer.price?.currency || 'SAR',
      airline: data.dictionaries?.carriers?.[first.carrierCode] || first.carrierCode || 'Unknown',
      duration: m ? parseInt(m[1] || 0, 10) * 60 + parseInt(m[2] || 0, 10) : 0,
      stops: Math.max(segs.length - 1, 0),
      departure: first.departure?.at || '',
      arrival: last.arrival?.at || '',
      deepLink: null,
    };
  }));
}

// ─── Simulation (OFF by default — only for demos/dry-runs) ───

const hashCode = (str) => { let h = 0; for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; } return h; };
const seeded = (seed) => { let s = Math.abs(seed) || 1; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };

function simulate(origin, dest, date) {
  const rand = seeded(hashCode(`${date}${origin.code}${dest.code}`));
  const base = 1200 + Math.abs(hashCode(dest.code)) % 1800;
  return Array.from({ length: 5 }, () => {
    const stops = rand() > 0.55 ? 0 : rand() > 0.4 ? 1 : 2;
    const duration = Math.round((300 + Math.abs(hashCode(dest.code)) % 300) * (0.85 + rand() * 0.35)) + stops * 90;
    return {
      source: 'Simulated', date, simulated: true,
      price: Math.round(base * (0.55 + rand())), currency: 'SAR',
      airline: 'Estimate', duration, stops, departure: date, arrival: '', deepLink: null,
    };
  });
}

// ─── Booking / verification links (these are search links, not price sources) ───

export function buildLinks(origin, dest, date) {
  const o = origin.code, d = dest.code;
  const dep = date.replace(/-/g, '').slice(2);
  return {
    'Google Flights': `https://www.google.com/travel/flights?q=flights+from+${o}+to+${d}+on+${date}+one+way`,
    'Skyscanner': `https://www.skyscanner.com/transport/flights/${o.toLowerCase()}/${d.toLowerCase()}/${dep}/?adults=1&cabinclass=economy&currency=SAR`,
    'Trip.com': `https://www.trip.com/flights/${o.toLowerCase()}-to-${d.toLowerCase()}/tickets-${o.toLowerCase()}-${d.toLowerCase()}?dcity=${o}&acity=${d}&ddate=${date}&cabin=Economy&flighttype=ow`,
  };
}

function primaryLink(source, links) {
  if (source === 'Skyscanner') return { label: 'Skyscanner', url: links['Skyscanner'] };
  // Amadeus has no consumer booking site → send the user to Google Flights to verify and book
  return { label: 'Google Flights', url: links['Google Flights'] };
}

// ─── Per-destination search ───

const median = (arr) => { const s = [...arr].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

/**
 * @param {string[]} dates  sampled YYYY-MM-DD dates (used for Skyscanner and as Amadeus fallback)
 * @param {{from:string,to:string}} window  full date window (used for the Amadeus calendar call)
 */
export async function searchDestination(origin, dest, dates, window) {
  const errors = [];
  const sources = [];
  const cfg = getConfig();
  const jobs = [];

  const track = (name, promise) => jobs.push(
    promise.then(r => { if (r?.length) sources.push(name); return r || []; })
           .catch(e => { errors.push(e.message); return []; })
  );

  // Skyscanner: one call per sampled date
  if (cfg.rapidKey) for (const date of dates) track('Skyscanner', searchSkyscanner(origin, dest, date));

  // Amadeus: calendar call finds the cheapest days in the whole window, then price-check the best 2
  if (cfg.amaKey && cfg.amaSecret) {
    track('Amadeus', (async () => {
      let pick = [];
      try { pick = (await amadeusCheapestDates(origin, dest, window.from, window.to)).slice(0, 2).map(x => x.date); }
      catch (e) { errors.push(e.message); }
      if (!pick.length) pick = dates.slice(0, 2);
      return (await Promise.all(pick.map(d => searchAmadeus(origin, dest, d).catch(e => { errors.push(e.message); return []; })))).flat();
    })());
  }

  let results = (await Promise.all(jobs)).flat();
  let simulated = false;

  if (!results.length && cfg.allowSim) {
    results = dates.flatMap(d => simulate(origin, dest, d));
    simulated = true;
  }

  results.sort((a, b) => a.price - b.price);
  const cheapest = results[0] || null;
  const date = cheapest?.date || dates[Math.floor(dates.length / 2)];
  const links = buildLinks(origin, dest, date);

  // Sanity checks
  const flags = [];
  if (cheapest && !simulated) {
    if (results.length >= 4 && cheapest.price < 0.4 * median(results.map(r => r.price))) {
      flags.push('Unusually low vs. other fares — may be an error fare or stale cache; verify before booking');
    }
    const bySource = {};
    for (const r of results) bySource[r.source] = Math.min(bySource[r.source] ?? Infinity, r.price);
    const mins = Object.values(bySource);
    if (mins.length > 1 && Math.max(...mins) / Math.min(...mins) > 1.3) {
      flags.push(`Sources disagree by >30% (${Object.entries(bySource).map(([k, v]) => `${k} ${Math.round(v)}`).join(' vs ')})`);
    }
  }

  return {
    destination: dest,
    cheapest,
    bestDate: date,
    simulated,
    resultCount: results.length,
    sources: [...new Set(sources)],
    link: cheapest ? primaryLink(cheapest.source, links) : { label: 'Google Flights', url: links['Google Flights'] },
    links,
    flags,
    errors,
  };
}

/** All destinations in parallel (Promise.all). One failure never stops the others. */
export async function searchAllDestinations(origin, destinations, dates, window) {
  return Promise.all(destinations.map(dest =>
    searchDestination(origin, dest, dates, window).catch(e => {
      console.error(`  [ERROR] ${dest.code}: ${e.message}`);
      return {
        destination: dest, cheapest: null, bestDate: dates[0], simulated: false, resultCount: 0, sources: [],
        link: { label: 'Google Flights', url: buildLinks(origin, dest, dates[0])['Google Flights'] },
        links: buildLinks(origin, dest, dates[0]), flags: [], errors: [e.message],
      };
    })
  ));
}
