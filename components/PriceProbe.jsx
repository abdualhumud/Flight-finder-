'use client';

/**
 * PriceProbe — "No API Key" price intelligence component
 *
 * Demonstrates the no-API approach:
 * 1. Generates pre-filled deep-links for 5 booking platforms
 * 2. Probes each URL with a no-cors HEAD request to confirm reachability
 * 3. Tests iframe embeddability (X-Frame-Options detection)
 * 4. Scans the generated URL for any price params (useful for GDS deeplinks)
 *
 * Expected result for major OTAs: reachable, NOT iframe-embeddable,
 * no price params in URL (prices are JS-loaded). Deep-links still work
 * perfectly for sending the user directly to a pre-filled search.
 */

import { useState } from 'react';
import { runPriceIntelligence } from '../lib/api/priceProbe';

const PLATFORM_COLORS = {
  'Google Flights': 'text-blue-400',
  'Skyscanner': 'text-cyan-400',
  'Kayak': 'text-orange-400',
  'Trip.com': 'text-red-400',
  'Momondo': 'text-purple-400',
};

function Badge({ children, color = 'gray' }) {
  const colors = {
    green: 'bg-green-900/40 text-green-400 border-green-800',
    red: 'bg-red-900/40 text-red-400 border-red-800',
    blue: 'bg-blue-900/40 text-blue-400 border-blue-800',
    gray: 'bg-gray-800 text-gray-400 border-gray-700',
    yellow: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border ${colors[color]}`}>
      {children}
    </span>
  );
}

function PlatformRow({ result }) {
  const color = PLATFORM_COLORS[result.platform] || 'text-gray-300';
  return (
    <div className="border border-gray-800 rounded-lg p-4 bg-gray-900/50">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0 flex-wrap">
          <span className={`font-semibold text-sm ${color}`}>{result.platform}</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {result.reachable ? (
              <Badge color="green">reachable</Badge>
            ) : (
              <Badge color="red">unreachable</Badge>
            )}
            {result.iframe?.embeddable ? (
              <Badge color="blue">iframe ok</Badge>
            ) : (
              <Badge color="gray">no iframe</Badge>
            )}
            {result.hasPriceData && <Badge color="yellow">price params in URL</Badge>}
          </div>
        </div>
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-3 py-1 rounded border border-gray-700 text-xs text-gray-300 hover:border-gray-500 hover:text-white transition-colors font-mono"
        >
          open ↗
        </a>
      </div>

      {/* Reach note */}
      {result.reachNote && (
        <p className="mt-1.5 text-xs text-gray-600 font-mono">{result.reachNote}</p>
      )}

      {/* Iframe note */}
      {result.iframe?.reason && (
        <p className="text-xs text-gray-600 font-mono">iframe: {result.iframe.reason}</p>
      )}

      {/* Price signals */}
      {result.hasPriceData && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {Object.entries(result.priceSignals).map(([k, v]) => (
            <span key={k} className="font-mono text-xs bg-yellow-900/30 text-yellow-300 px-2 py-0.5 rounded border border-yellow-900">
              {k}={v}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PriceProbe({ searchParams }) {
  const [status, setStatus] = useState('idle');
  const [results, setResults] = useState(null);

  const canRun = searchParams?.origin && searchParams?.destination && searchParams?.departDate;

  async function handleRun() {
    if (!canRun) return;
    setStatus('loading');
    setResults(null);
    try {
      const data = await runPriceIntelligence(searchParams);
      setResults(data);
      setStatus('done');
    } catch (err) {
      setStatus('error');
      console.error(err);
    }
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
        <div>
          <h3 className="font-semibold text-gray-100 text-sm">
            Price Probe
            <span className="ms-2 text-xs font-normal text-gray-500 font-mono">[no-API-key mode]</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Probes booking platforms via no-cors fetch + iframe checks
          </p>
        </div>
        <button
          onClick={handleRun}
          disabled={!canRun || status === 'loading'}
          className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          {status === 'loading' ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
              Probing…
            </span>
          ) : 'Run Probe'}
        </button>
      </div>

      {/* How it works */}
      <details className="border-b border-gray-800">
        <summary className="px-5 py-3 text-xs text-gray-500 cursor-pointer hover:text-gray-400 select-none">
          How does this work? (click to expand)
        </summary>
        <div className="px-5 pb-4 text-xs text-gray-400 space-y-2 font-mono leading-relaxed">
          <p><span className="text-gray-300">Step 1:</span> Build a pre-filled search URL for each booking platform using your origin, destination, date, and cabin class.</p>
          <p><span className="text-gray-300">Step 2:</span> Send a <code className="text-cyan-400">fetch(url, {'{'} mode: "no-cors" {'}'})</code> HEAD request from the browser. A response (even opaque) = reachable. A TypeError = blocked.</p>
          <p><span className="text-gray-300">Step 3:</span> Inject a hidden 1×1 iframe pointing at the URL. If it loads without error → the site allows iframe embedding (most don't — they send <code className="text-red-400">X-Frame-Options: DENY</code>).</p>
          <p><span className="text-gray-300">Step 4:</span> Scan the generated deep-link URL itself for price params. Most OTAs don't encode prices in URLs, but some airline GDS deeplinks do (e.g. <code className="text-yellow-400">?price=450&currency=USD</code>).</p>
          <p><span className="text-yellow-400">Result:</span> Major booking sites (Google, Skyscanner, Kayak) will show "reachable" + "no iframe" + no price params. Prices are loaded by their own JavaScript — not visible without Skyscanner/Amadeus API keys or a headless browser (Playwright).</p>
        </div>
      </details>

      {/* Results */}
      <div className="p-5">
        {status === 'idle' && (
          <p className="text-center text-gray-600 text-sm py-8 font-mono">
            {canRun ? 'Click "Run Probe" to test all booking platforms' : 'Enter a flight search above first'}
          </p>
        )}

        {status === 'loading' && (
          <div className="text-center py-8 space-y-2">
            <div className="flex justify-center gap-1">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <p className="text-gray-500 text-sm">Probing 5 platforms…</p>
          </div>
        )}

        {status === 'error' && (
          <p className="text-center text-red-400 text-sm py-8 font-mono">Probe failed — check console</p>
        )}

        {status === 'done' && results && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center gap-3 flex-wrap text-xs text-gray-400 font-mono bg-gray-900 rounded-lg px-4 py-2.5 border border-gray-800">
              <span className="text-gray-300 font-semibold">Summary:</span>
              <span>{results.summary.reachable}/{results.summary.total} reachable</span>
              <span className="text-gray-700">|</span>
              <span className={results.summary.withPriceSignals > 0 ? 'text-yellow-400' : 'text-gray-500'}>
                {results.summary.withPriceSignals} with price params
              </span>
              <span className="text-gray-700">|</span>
              <span className={results.summary.iframeEmbeddable > 0 ? 'text-blue-400' : 'text-gray-500'}>
                {results.summary.iframeEmbeddable} iframe-embeddable
              </span>
            </div>

            {/* Platform rows */}
            <div className="space-y-3">
              {results.platforms.map(p => (
                <PlatformRow key={p.platform} result={p} />
              ))}
            </div>

            {/* Reality check */}
            {results.summary.withPriceSignals === 0 && (
              <div className="rounded-lg border border-yellow-900/50 bg-yellow-950/30 p-4 text-xs text-yellow-300 font-mono">
                <p className="font-semibold mb-1">No price data in URLs (expected for major OTAs)</p>
                <p className="text-yellow-500">
                  Google Flights, Skyscanner, and Kayak all load prices via JavaScript after page load.
                  Click any "open ↗" button to go directly to the pre-filled search.
                  For automated price extraction: add a <code className="text-yellow-300">NEXT_PUBLIC_RAPIDAPI_KEY</code> or <code className="text-yellow-300">NEXT_PUBLIC_AMADEUS_API_KEY</code> to your <code className="text-yellow-300">.env.local</code>.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
