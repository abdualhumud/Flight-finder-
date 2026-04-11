'use client';

/**
 * PriceProbe — "No API Key" price intelligence component
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
    <div className="border border-gray-800 rounded-lg p-3 md:p-4 bg-gray-900/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-wrap">
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
          className="shrink-0 px-3 py-2 sm:py-1 rounded border border-gray-700 text-xs text-gray-300 hover:border-gray-500 hover:text-white transition-colors font-mono text-center"
        >
          open ↗
        </a>
      </div>

      {result.reachNote && (
        <p className="mt-1.5 text-xs text-gray-600 font-mono break-all">{result.reachNote}</p>
      )}

      {result.iframe?.reason && (
        <p className="text-xs text-gray-600 font-mono break-all">iframe: {result.iframe.reason}</p>
      )}

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-5 py-3 md:py-4 border-b border-gray-800">
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
          className="w-full sm:w-auto px-4 py-2.5 sm:py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          {status === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
              Probing…
            </span>
          ) : 'Run Probe'}
        </button>
      </div>

      {/* How it works */}
      <details className="border-b border-gray-800">
        <summary className="px-4 md:px-5 py-3 text-xs text-gray-500 cursor-pointer hover:text-gray-400 select-none">
          How does this work? (click to expand)
        </summary>
        <div className="px-4 md:px-5 pb-4 text-xs text-gray-400 space-y-2 font-mono leading-relaxed">
          <p><span className="text-gray-300">Step 1:</span> Build a pre-filled search URL for each booking platform using your origin, destination, date, and cabin class.</p>
          <p><span className="text-gray-300">Step 2:</span> Send a <code className="text-cyan-400">fetch(url, {'{'} mode: "no-cors" {'}'})</code> HEAD request from the browser. A response (even opaque) = reachable. A TypeError = blocked.</p>
          <p><span className="text-gray-300">Step 3:</span> Inject a hidden 1×1 iframe pointing at the URL. If it loads without error → the site allows iframe embedding (most don't — they send <code className="text-red-400">X-Frame-Options: DENY</code>).</p>
          <p><span className="text-gray-300">Step 4:</span> Scan the generated deep-link URL itself for price params. Most OTAs don't encode prices in URLs, but some airline GDS deeplinks do (e.g. <code className="text-yellow-400">?price=450&currency=USD</code>).</p>
          <p><span className="text-yellow-400">Result:</span> Major booking sites (Google, Skyscanner, Kayak) will show "reachable" + "no iframe" + no price params. Prices are loaded by their own JavaScript — not visible without Skyscanner/Amadeus API keys or a headless browser (Playwright).</p>
        </div>
      </details>

      {/* Results */}
      <div className="p-4 md:p-5">
        {status === 'idle' && (
          <p className="text-center text-gray-600 text-sm py-6 md:py-8 font-mono">
            {canRun ? 'Click "Run Probe" to test all booking platforms' : 'Enter a flight search above first'}
          </p>
        )}

        {status === 'loading' && (
          <div className="text-center py-6 md:py-8 space-y-2">
            <div className="flex justify-center gap-1">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <p className="text-gray-500 text-sm">Probing 5 platforms…</p>
          </div>
        )}

        {status === 'error' && (
          <p className="text-center text-red-400 text-sm py-6 md:py-8 font-mono">Probe failed — check console</p>
        )}

        {status === 'done' && results && (
          <div className="space-y-3 md:space-y-4">
            {/* Summary */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs text-gray-400 font-mono bg-gray-900 rounded-lg px-3 md:px-4 py-2.5 border border-gray-800">
              <span className="text-gray-300 font-semibold">Summary:</span>
              <span>{results.summary.reachable}/{results.summary.total} reachable</span>
              <span className="text-gray-700 hidden sm:inline">|</span>
              <span className={results.summary.withPriceSignals > 0 ? 'text-yellow-400' : 'text-gray-500'}>
                {results.summary.withPriceSignals} with price params
              </span>
              <span className="text-gray-700 hidden sm:inline">|</span>
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
              <div className="rounded-lg border border-yellow-900/50 bg-yellow-950/30 p-3 md:p-4 text-xs text-yellow-300 font-mono">
                <p className="font-semibold mb-1">No price data in URLs (expected for major OTAs)</p>
                <p className="text-yellow-500 break-all">
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
