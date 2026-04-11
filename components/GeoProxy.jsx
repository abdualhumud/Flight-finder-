'use client';

/**
 * GeoProxy — Proxy-Aware Navigation for geo-pricing arbitrage
 */

import { useState, useCallback } from 'react';
import { useI18n } from '../lib/i18n';
import { cn } from '../lib/utils';

const PLATFORM_POS_URLS = {
  'Google Flights': ({ origin, destination, departDate, returnDate, market, currency }) => {
    const ret = returnDate ? `&r=${returnDate}` : '';
    return `https://www.google.com/travel/flights?q=flights+from+${origin}+to+${destination}&d=${departDate}${ret}&curr=${currency}&gl=${market.toLowerCase()}&hl=en`;
  },
  'Skyscanner': ({ origin, destination, departDate, returnDate, market, currency }) => {
    const dep = departDate.replace(/-/g, '').slice(2);
    const ret = returnDate ? `/${returnDate.replace(/-/g, '').slice(2)}` : '';
    return `https://www.skyscanner.com/transport/flights/${origin.toLowerCase()}/${destination.toLowerCase()}/${dep}${ret}/?adults=1&market=${market}&currency=${currency}`;
  },
  'Kayak': ({ origin, destination, departDate, returnDate, market }) => {
    const domain = KAYAK_DOMAINS[market] || 'www.kayak.com';
    const ret = returnDate ? `/${returnDate}` : '';
    return `https://${domain}/flights/${origin}-${destination}/${departDate}${ret}?sort=bestflight_a`;
  },
  'Trip.com': ({ origin, destination, departDate, returnDate, currency }) => {
    let url = `https://www.trip.com/flights/${origin.toLowerCase()}-to-${destination.toLowerCase()}/tickets-${origin.toLowerCase()}-${destination.toLowerCase()}?dcity=${origin}&acity=${destination}&ddate=${departDate}&curr=${currency}`;
    if (returnDate) url += `&rdate=${returnDate}&flighttype=rt`;
    return url;
  },
  'Momondo': ({ origin, destination, departDate, returnDate, market }) => {
    const domain = MOMONDO_DOMAINS[market] || 'www.momondo.com';
    const ret = returnDate ? `/${returnDate}` : '';
    return `https://${domain}/flight-search/${origin}-${destination}/${departDate}${ret}?sort=bestflight_a`;
  },
};

const KAYAK_DOMAINS = {
  SA: 'www.sa.kayak.com', IN: 'www.kayak.co.in', TR: 'www.kayak.com.tr',
  EG: 'www.eg.kayak.com', PK: 'www.kayak.pk', PH: 'www.kayak.com.ph',
  US: 'www.kayak.com', GB: 'www.kayak.co.uk',
};

const MOMONDO_DOMAINS = {
  SA: 'www.momondo.sa', TR: 'www.momondo.com.tr', US: 'www.momondo.com',
  GB: 'www.momondo.co.uk', IN: 'www.momondo.in',
};

const PROXY_PROVIDERS = [
  {
    name: 'Bright Data',
    url: 'https://brightdata.com',
    format: 'brd.superproxy.io:22225',
    auth: 'username:password',
    note: 'Residential IPs, supports geo-targeting by country',
  },
  {
    name: 'Oxylabs',
    url: 'https://oxylabs.io',
    format: 'pr.oxylabs.io:7777',
    auth: 'username:password',
    note: 'ISP proxies, good for airline sites',
  },
  {
    name: 'Free VPN (Manual)',
    url: null,
    format: 'Use NordVPN / ExpressVPN / Windscribe',
    auth: null,
    note: 'Connect to target country server, then open in incognito',
  },
];

const MARKET_DETAILS = {
  SA: { flag: '🇸🇦', name: 'Saudi Arabia', currency: 'SAR', locale: 'en-US', proxyCity: 'Riyadh' },
  IN: { flag: '🇮🇳', name: 'India', currency: 'INR', locale: 'en-IN', proxyCity: 'Mumbai' },
  TR: { flag: '🇹🇷', name: 'Turkey', currency: 'TRY', locale: 'tr-TR', proxyCity: 'Istanbul' },
  EG: { flag: '🇪🇬', name: 'Egypt', currency: 'EGP', locale: 'en-US', proxyCity: 'Cairo' },
  IL: { flag: '🇮🇱', name: 'Israel', currency: 'ILS', locale: 'en-US', proxyCity: 'Tel Aviv' },
  PK: { flag: '🇵🇰', name: 'Pakistan', currency: 'PKR', locale: 'en-US', proxyCity: 'Karachi' },
  PH: { flag: '🇵🇭', name: 'Philippines', currency: 'PHP', locale: 'en-US', proxyCity: 'Manila' },
  US: { flag: '🇺🇸', name: 'United States', currency: 'USD', locale: 'en-US', proxyCity: 'New York' },
};

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button onClick={handleCopy}
      className={cn('px-2.5 py-1.5 md:py-1 rounded text-[10px] font-mono border transition-all',
        copied ? 'bg-accent-green/10 text-accent-green border-accent-green/30' : 'bg-surface-hover text-gray-400 border-border-subtle hover:text-white hover:border-gray-600')}>
      {copied ? '✓ Copied' : label || 'Copy'}
    </button>
  );
}

export default function GeoProxy({ searchParams, marketCode }) {
  const { t, isRTL } = useI18n();
  const [selectedPlatform, setSelectedPlatform] = useState('Google Flights');
  const [selectedMarket, setSelectedMarket] = useState(marketCode || 'PK');

  if (!searchParams?.origin || !searchParams?.destination || !searchParams?.departDate) return null;

  const market = MARKET_DETAILS[selectedMarket];
  if (!market) return null;

  const generateUrl = PLATFORM_POS_URLS[selectedPlatform];
  const posUrl = generateUrl?.({
    origin: searchParams.origin,
    destination: searchParams.destination,
    departDate: searchParams.departDate,
    returnDate: searchParams.returnDate,
    market: selectedMarket,
    currency: market.currency,
  }) || '#';

  return (
    <div className="rounded-xl border border-accent-amber/30 bg-gray-950 overflow-hidden">
      {/* Header */}
      <div className="px-4 md:px-5 py-3 md:py-4 border-b border-gray-800 bg-accent-amber/5">
        <h3 className="font-semibold text-gray-100 text-sm flex items-center gap-2 flex-wrap">
          <span className="text-lg">{market.flag}</span>
          {t('geo.proxyTitle')}
          <span className="sm:ms-auto text-[10px] font-mono text-accent-amber bg-accent-amber/10 px-2 py-0.5 rounded">
            POS: {selectedMarket} / {market.currency}
          </span>
        </h3>
        <p className="text-xs text-gray-500 mt-1">{t('geo.proxyDesc')}</p>
      </div>

      <div className="p-4 md:p-5 space-y-4">
        {/* Market + Platform selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">{t('geo.targetMarket')}</label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(MARKET_DETAILS).map(([code, m]) => (
                <button key={code} onClick={() => setSelectedMarket(code)}
                  className={cn('px-2 py-1.5 md:py-1 rounded text-[10px] font-medium border transition-all',
                    selectedMarket === code
                      ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/30'
                      : 'bg-surface-hover text-gray-400 border-border-subtle hover:text-white')}>
                  {m.flag} {code}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">{t('geo.platform')}</label>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(PLATFORM_POS_URLS).map(p => (
                <button key={p} onClick={() => setSelectedPlatform(p)}
                  className={cn('px-2 py-1.5 md:py-1 rounded text-[10px] font-medium border transition-all',
                    selectedPlatform === p
                      ? 'bg-brand-500/10 text-brand-400 border-brand-500/30'
                      : 'bg-surface-hover text-gray-400 border-border-subtle hover:text-white')}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generated POS URL */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-3">
          <div className="flex items-center justify-between mb-2 gap-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">{t('geo.generatedUrl')}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <CopyButton text={posUrl} label="Copy URL" />
              <a href={posUrl} target="_blank" rel="noopener noreferrer"
                className="px-2.5 py-1.5 md:py-1 rounded text-[10px] font-mono bg-accent-amber/10 text-accent-amber border border-accent-amber/30 hover:bg-accent-amber/20 transition-all">
                Open ↗
              </a>
            </div>
          </div>
          <code className="text-[10px] sm:text-xs text-gray-300 font-mono break-all leading-relaxed block">{posUrl}</code>
        </div>

        {/* Copy & Open Incognito workflow */}
        <div className="bg-accent-amber/5 border border-accent-amber/20 rounded-lg p-3 md:p-4">
          <h4 className="text-xs font-semibold text-accent-amber mb-3">{t('geo.proxyWorkflow')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-accent-amber/10 flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-bold text-accent-amber">1</span>
              </div>
              <p className="text-[10px] text-gray-400">{t('geo.proxyStep1')}</p>
              <p className="text-[10px] text-accent-amber font-mono mt-1">{market.proxyCity}, {market.name}</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-accent-amber/10 flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-bold text-accent-amber">2</span>
              </div>
              <p className="text-[10px] text-gray-400">{t('geo.proxyStep2')}</p>
              <p className="text-[10px] text-gray-500 font-mono mt-1">Ctrl+Shift+N</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-accent-amber/10 flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-bold text-accent-amber">3</span>
              </div>
              <p className="text-[10px] text-gray-400">{t('geo.proxyStep3')}</p>
            </div>
          </div>
        </div>

        {/* Proxy configuration (collapsible) */}
        <details className="group">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300 select-none flex items-center gap-1 py-1">
            <span className="group-open:rotate-90 transition-transform">▶</span>
            {t('geo.proxyConfig')}
          </summary>
          <div className="mt-3 space-y-2">
            {PROXY_PROVIDERS.map(p => (
              <div key={p.name} className="bg-gray-900 rounded-lg border border-gray-800 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-white font-medium">{p.name}</div>
                  <div className="text-[10px] text-gray-500 font-mono mt-0.5 break-all">{p.format}</div>
                  <div className="text-[10px] text-gray-600 mt-0.5">{p.note}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <CopyButton text={p.format} label="Copy" />
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer"
                      className="px-2 py-1.5 md:py-1 rounded text-[10px] font-mono text-gray-400 border border-border-subtle hover:text-white transition-all">
                      Site ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
