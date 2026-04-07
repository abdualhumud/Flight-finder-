'use client';

import { useState } from 'react';
import { Globe, Shield, Plane, Calendar, Loader2, ExternalLink, Wifi } from 'lucide-react';
import { useGeoArbitrage } from '../../lib/hooks/useFlightSearch';
import { formatPrice, cn } from '../../lib/utils';
import { generateAllLinks } from '../../lib/api/deepLinks';
import AirportSearch from '../../components/AirportSearch';
import GeoProxy from '../../components/GeoProxy';
import { useI18n } from '../../lib/i18n';
import { MapPin } from 'lucide-react';

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

function getFlag(code) {
  const flags = { SA: '🇸🇦', IN: '🇮🇳', TR: '🇹🇷', EG: '🇪🇬', IL: '🇮🇱', PK: '🇵🇰', PH: '🇵🇭', US: '🇺🇸' };
  return flags[code] || '🌍';
}

export default function GeoArbitrage() {
  const { t } = useI18n();
  const [originAirport, setOriginAirport] = useState({ iata: 'RUH', name: 'King Khalid Intl (RUH)', entityId: '95673635' });
  const [destAirport, setDestAirport] = useState(null);
  const [departDate, setDepartDate] = useState('');
  const [searchParams, setSearchParams] = useState(null);

  const { data: results, isLoading } = useGeoArbitrage(searchParams);

  function handleSearch(e) {
    e.preventDefault();
    if (!destAirport || !departDate) return;
    setSearchParams({
      origin: originAirport.iata,
      destination: destAirport.iata,
      originEntityId: originAirport.entityId,
      destinationEntityId: destAirport.entityId,
      departDate,
    });
  }

  const cheapestMarket = results?.[0];

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-cyan/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-accent-cyan" />
          </div>
          {t('geo.title')}
        </h2>
        <p className="text-sm text-gray-500 mt-1 ms-[52px]">{t('geo.subtitle')}</p>
      </div>

      <div className="glass rounded-xl p-4 flex items-start gap-3 border border-accent-cyan/20">
        <Shield className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-white font-medium">{t('geo.howTitle')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('geo.howDesc')}</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="glass rounded-xl p-6">
        <div className="grid grid-cols-3 gap-4">
          <AirportSearch label={t('search.origin')} value={originAirport} onChange={setOriginAirport} icon={MapPin} placeholder={t('search.typeToSearch')} />
          <AirportSearch label={t('search.destination')} value={destAirport} onChange={setDestAirport} icon={Plane} placeholder={t('search.typeToSearch')} />
          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">{t('search.departure')}</label>
            <div className="relative">
              <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="date" value={departDate} onChange={e => setDepartDate(e.target.value)}
                className="w-full bg-surface-hover border border-border-subtle rounded-lg ps-9 pe-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50" />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button type="submit" disabled={isLoading}
            className="px-6 py-2.5 bg-accent-cyan hover:bg-accent-cyan/80 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            {t('geo.runScan')}
          </button>
        </div>
      </form>

      {isLoading && (
        <div className="glass rounded-xl p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent-cyan mx-auto mb-3" />
          <p className="text-sm text-gray-400">{t('geo.scanning')}</p>
        </div>
      )}

      {results && !isLoading && (
        <>
          {cheapestMarket && (
            <div className="glass rounded-xl p-5 border border-accent-green/30 glow-green">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-accent-green uppercase tracking-wider font-semibold mb-1">{t('geo.cheapestFound')}</div>
                  <div className="text-xl font-bold text-white">{cheapestMarket.market} ({cheapestMarket.currency})</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {formatPrice(cheapestMarket.cheapestPrice)} — {t('geo.saveUpTo')} {cheapestMarket.savings}% {t('geo.vsOther')}
                  </div>
                </div>
                {cheapestMarket.vpnLocation && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-green/10 border border-accent-green/20">
                    <Wifi className="w-4 h-4 text-accent-green" />
                    <div>
                      <div className="text-[10px] text-accent-green uppercase tracking-wider">{t('geo.setVpn')}</div>
                      <div className="text-sm text-white font-medium">{cheapestMarket.vpnLocation}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="glass rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border-subtle">
              <h3 className="text-sm font-semibold text-white">{t('geo.marketComparison')} — {searchParams?.origin} → {searchParams?.destination}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-start px-4 py-2.5 text-[10px] text-gray-500 uppercase tracking-wider font-medium">{t('geo.market')}</th>
                    <th className="text-center px-4 py-2.5 text-[10px] text-gray-500 uppercase tracking-wider font-medium">{t('geo.currency')}</th>
                    <th className="text-center px-4 py-2.5 text-[10px] text-gray-500 uppercase tracking-wider font-medium">{t('geo.cheapestPrice')}</th>
                    <th className="text-center px-4 py-2.5 text-[10px] text-gray-500 uppercase tracking-wider font-medium">{t('geo.savings')}</th>
                    <th className="text-center px-4 py-2.5 text-[10px] text-gray-500 uppercase tracking-wider font-medium">{t('geo.vpnLocation')}</th>
                    <th className="text-center px-4 py-2.5 text-[10px] text-gray-500 uppercase tracking-wider font-medium">{t('geo.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => {
                    const isCheapest = i === 0;
                    const colorClass = vpnColors[r.market] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
                    const links = generateAllLinks({ origin: searchParams.origin, destination: searchParams.destination, departDate: searchParams.departDate, cabin: 'economy' });
                    return (
                      <tr key={r.market} className={cn('border-b border-border-subtle transition-colors', isCheapest ? 'bg-accent-green/5' : 'hover:bg-surface-hover')}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getFlag(r.countryCode)}</span>
                            <span className={cn('font-medium', isCheapest ? 'text-accent-green' : 'text-white')}>{r.market}</span>
                            {isCheapest && <span className="text-[9px] bg-accent-green/20 text-accent-green px-1.5 py-0.5 rounded font-bold">{t('geo.best')}</span>}
                          </div>
                        </td>
                        <td className="text-center px-4 py-3 text-gray-300 font-mono text-xs">{r.currency}</td>
                        <td className="text-center px-4 py-3">
                          <span className={cn('font-bold', isCheapest ? 'text-accent-green' : 'text-white')}>{formatPrice(r.cheapestPrice)}</span>
                        </td>
                        <td className="text-center px-4 py-3">
                          <span className={cn('text-xs font-medium', r.savings > 0 ? 'text-accent-green' : 'text-gray-500')}>
                            {r.savings > 0 ? `${r.savings}%` : t('geo.base')}
                          </span>
                        </td>
                        <td className="text-center px-4 py-3">
                          {r.vpnLocation ? (
                            <span className={cn('px-2 py-1 rounded-lg text-[10px] font-medium border', colorClass)}>{r.vpnLocation}</span>
                          ) : (
                            <span className="text-[10px] text-gray-600">{t('geo.homeMarket')}</span>
                          )}
                        </td>
                        <td className="text-center px-4 py-3">
                          <a href={links['Google Flights']} target="_blank" rel="noopener noreferrer"
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

          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-accent-amber" /> {t('geo.vpnGuide')}
            </h3>
            <div className="grid grid-cols-3 gap-3 text-xs text-gray-400">
              <div className="bg-surface-hover rounded-lg p-3 border border-border-subtle">
                <div className="text-white font-medium mb-1">{t('geo.step1Title')}</div>
                <p>{t('geo.step1Desc')}</p>
              </div>
              <div className="bg-surface-hover rounded-lg p-3 border border-border-subtle">
                <div className="text-white font-medium mb-1">{t('geo.step2Title')}</div>
                <p>{t('geo.step2Desc')}</p>
              </div>
              <div className="bg-surface-hover rounded-lg p-3 border border-border-subtle">
                <div className="text-white font-medium mb-1">{t('geo.step3Title')}</div>
                <p>{t('geo.step3Desc')}</p>
              </div>
            </div>
          </div>

          {/* Geo-Proxy Navigator — appears when cheapest market is found */}
          {cheapestMarket && searchParams && (
            <GeoProxy
              searchParams={{
                origin: searchParams.origin,
                destination: searchParams.destination,
                departDate: searchParams.departDate,
                returnDate: searchParams.returnDate,
              }}
              marketCode={cheapestMarket.countryCode}
            />
          )}
        </>
      )}
    </div>
  );
}
