'use client';

import { useState, useMemo } from 'react';
import { Globe, Search, Shield, MapPin, Plane, Calendar, TrendingDown, Loader2, ExternalLink, Wifi } from 'lucide-react';
import { airports, homeAirports, destAirports } from '../../data/airports';
import { useGeoArbitrage } from '../../lib/hooks/useFlightSearch';
import { formatPrice, cn } from '../../lib/utils';
import { generateAllLinks } from '../../lib/api/deepLinks';

const vpnColors = {
  'Saudi Arabia': 'bg-accent-amber/10 text-accent-amber border-accent-amber/20',
  'India': 'bg-accent-green/10 text-accent-green border-accent-green/20',
  'Turkey': 'bg-accent-red/10 text-accent-red border-accent-red/20',
  'Egypt': 'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
  'Israel': 'bg-brand-400/10 text-brand-400 border-brand-400/20',
  'Pakistan': 'bg-accent-green/10 text-accent-green border-accent-green/20',
  'Philippines': 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20',
  'United States': 'bg-blue-400/10 text-blue-400 border-blue-400/20',
};

export default function GeoArbitrage() {
  const [origin, setOrigin] = useState('RUH');
  const [destination, setDestination] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [searchParams, setSearchParams] = useState(null);

  const { data: results, isLoading } = useGeoArbitrage(searchParams);

  function handleSearch(e) {
    e.preventDefault();
    if (!destination || !departDate) return;
    setSearchParams({ origin, destination, departDate });
  }

  const basePrice = results?.[0]?.cheapestPrice || 0;
  const cheapestMarket = results?.[0];

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-cyan/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-accent-cyan" />
          </div>
          Geo-Pricing Arbitrage
        </h2>
        <p className="text-sm text-gray-500 mt-1 ml-[52px]">Compare prices across regional markets — find the cheapest point-of-sale</p>
      </div>

      {/* Explainer */}
      <div className="glass rounded-xl p-4 flex items-start gap-3 border border-accent-cyan/20">
        <Shield className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-white font-medium">How Regional Price Arbitrage Works</p>
          <p className="text-xs text-gray-400 mt-1">
            Airlines price flights differently based on the buyer's country/currency. By setting your VPN to a "Low-Cost POS" country
            and searching in their local currency, you can find fares 15-35% cheaper than your home market.
          </p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="glass rounded-xl p-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Origin</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select value={origin} onChange={e => setOrigin(e.target.value)}
                className="w-full bg-surface-hover border border-border-subtle rounded-lg pl-9 pr-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-brand-500/50">
                {homeAirports.map(a => <option key={a.code} value={a.code}>{a.code} — {a.city}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Destination</label>
            <div className="relative">
              <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select value={destination} onChange={e => setDestination(e.target.value)}
                className="w-full bg-surface-hover border border-border-subtle rounded-lg pl-9 pr-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-brand-500/50">
                <option value="">Select destination</option>
                {destAirports.map(a => <option key={a.code} value={a.code}>{a.code} — {a.city}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Departure</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="date" value={departDate} onChange={e => setDepartDate(e.target.value)}
                className="w-full bg-surface-hover border border-border-subtle rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50" />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button type="submit" className="px-6 py-2.5 bg-accent-cyan hover:bg-accent-cyan/80 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Globe className="w-4 h-4" /> Run Geo-Scan
          </button>
        </div>
      </form>

      {/* Loading */}
      {isLoading && (
        <div className="glass rounded-xl p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent-cyan mx-auto mb-3" />
          <p className="text-sm text-gray-400">Scanning 8 regional markets simultaneously...</p>
        </div>
      )}

      {/* Results */}
      {results && !isLoading && (
        <>
          {/* Winner Banner */}
          {cheapestMarket && (
            <div className="glass rounded-xl p-5 border border-accent-green/30 glow-green">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-accent-green uppercase tracking-wider font-semibold mb-1">Cheapest Market Found</div>
                  <div className="text-xl font-bold text-white">{cheapestMarket.market} ({cheapestMarket.currency})</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {formatPrice(cheapestMarket.cheapestPrice)} — Save up to {cheapestMarket.savings}% vs other markets
                  </div>
                </div>
                {cheapestMarket.vpnLocation && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-green/10 border border-accent-green/20">
                    <Wifi className="w-4 h-4 text-accent-green" />
                    <div>
                      <div className="text-[10px] text-accent-green uppercase tracking-wider">Set VPN to</div>
                      <div className="text-sm text-white font-medium">{cheapestMarket.vpnLocation}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Market Comparison Table */}
          <div className="glass rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border-subtle">
              <h3 className="text-sm font-semibold text-white">Market Comparison — {origin} → {destination}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left px-4 py-2.5 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Market</th>
                    <th className="text-center px-4 py-2.5 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Currency</th>
                    <th className="text-center px-4 py-2.5 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Cheapest Price</th>
                    <th className="text-center px-4 py-2.5 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Savings</th>
                    <th className="text-center px-4 py-2.5 text-[10px] text-gray-500 uppercase tracking-wider font-medium">VPN Location</th>
                    <th className="text-center px-4 py-2.5 text-[10px] text-gray-500 uppercase tracking-wider font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => {
                    const isCheapest = i === 0;
                    const colorClass = vpnColors[r.market] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
                    const links = generateAllLinks({ origin, destination, departDate, cabin: 'economy' });
                    return (
                      <tr key={r.market} className={cn('border-b border-border-subtle transition-colors', isCheapest ? 'bg-accent-green/5' : 'hover:bg-surface-hover')}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getFlag(r.countryCode)}</span>
                            <span className={cn('font-medium', isCheapest ? 'text-accent-green' : 'text-white')}>{r.market}</span>
                            {isCheapest && <span className="text-[9px] bg-accent-green/20 text-accent-green px-1.5 py-0.5 rounded font-bold">BEST</span>}
                          </div>
                        </td>
                        <td className="text-center px-4 py-3 text-gray-300 font-mono text-xs">{r.currency}</td>
                        <td className="text-center px-4 py-3">
                          <span className={cn('font-bold', isCheapest ? 'text-accent-green' : 'text-white')}>
                            {formatPrice(r.cheapestPrice)}
                          </span>
                        </td>
                        <td className="text-center px-4 py-3">
                          <span className={cn('text-xs font-medium', r.savings > 0 ? 'text-accent-green' : 'text-gray-500')}>
                            {r.savings > 0 ? `${r.savings}%` : 'Base'}
                          </span>
                        </td>
                        <td className="text-center px-4 py-3">
                          {r.vpnLocation ? (
                            <span className={cn('px-2 py-1 rounded-lg text-[10px] font-medium border', colorClass)}>
                              {r.vpnLocation}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-600">Home market</span>
                          )}
                        </td>
                        <td className="text-center px-4 py-3">
                          <a href={links.google} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-hover text-[10px] text-gray-400 hover:text-white transition-colors">
                            <ExternalLink className="w-3 h-3" /> Search
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* VPN Guide */}
          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-accent-amber" />
              VPN Setup Guide
            </h3>
            <div className="grid grid-cols-3 gap-3 text-xs text-gray-400">
              <div className="bg-surface-hover rounded-lg p-3 border border-border-subtle">
                <div className="text-white font-medium mb-1">1. Connect VPN</div>
                <p>Set your VPN server to the recommended country shown above</p>
              </div>
              <div className="bg-surface-hover rounded-lg p-3 border border-border-subtle">
                <div className="text-white font-medium mb-1">2. Incognito Mode</div>
                <p>Open a new incognito/private window and clear cookies first</p>
              </div>
              <div className="bg-surface-hover rounded-lg p-3 border border-border-subtle">
                <div className="text-white font-medium mb-1">3. Search & Book</div>
                <p>Search on the airline's local site for that country to get regional pricing</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getFlag(code) {
  const flags = { SA: '🇸🇦', IN: '🇮🇳', TR: '🇹🇷', EG: '🇪🇬', IL: '🇮🇱', PK: '🇵🇰', PH: '🇵🇭', US: '🇺🇸' };
  return flags[code] || '🌍';
}
