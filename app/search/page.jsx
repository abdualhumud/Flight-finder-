'use client';

import { useState, useMemo } from 'react';
import { Search, Plane, ArrowRightLeft, Users, SlidersHorizontal, Sparkles, MapPin, Calendar, Grid3x3, Loader2, Globe, Wifi } from 'lucide-react';
import { useInfiniteFlights, useGeoArbitrage } from '../../lib/hooks/useFlightSearch';
import { calculateValueScore, formatPrice, cn } from '../../lib/utils';
import FlightTable from '../../components/FlightTable';
import AirportSearch from '../../components/AirportSearch';
import { generateAllLinks } from '../../lib/api/deepLinks';
import { useI18n } from '../../lib/i18n';
import PriceProbe from '../../components/PriceProbe';
import GeoProxy from '../../components/GeoProxy';

const hubSuggestions = [
  { hub: 'IST', savings: '15-25%', noteEn: 'Turkish Airlines hub — great for Europe/Asia', noteAr: 'مركز الخطوط التركية — ممتاز لأوروبا/آسيا' },
  { hub: 'DOH', savings: '10-20%', noteEn: 'Qatar Airways hub — strong global connections', noteAr: 'مركز الخطوط القطرية — اتصالات عالمية قوية' },
  { hub: 'LHR', savings: '5-15%', noteEn: 'BA hub — ideal for Americas via Avios', noteAr: 'مركز الخطوط البريطانية — مثالي للأمريكتين عبر أفيوس' },
];

function FlexibleDateGrid({ origin, destination, centerDate, flexibility = 'pm3' }) {
  const { t } = useI18n();
  if (!origin || !destination || !centerDate) return null;
  if (flexibility === 'exact') return null; // no grid for exact dates

  const seed = (origin + destination + centerDate).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const basePrice = 1200 + (seed % 1500);

  // Generate dates based on flexibility mode
  let dates = [];
  const center = new Date(centerDate);

  if (flexibility === 'pm3') {
    for (let i = -3; i <= 3; i++) {
      const d = new Date(center);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
  } else if (flexibility === 'month') {
    const year = center.getFullYear();
    const month = center.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      dates.push(new Date(year, month, d).toISOString().split('T')[0]);
    }
  } else if (flexibility === 'anytime') {
    // Show 12 months from now
    const today = new Date();
    for (let m = 0; m < 12; m++) {
      const d = new Date(today.getFullYear(), today.getMonth() + m, 15);
      dates.push(d.toISOString().split('T')[0]);
    }
  }

  const prices = dates.map((_, i) => {
    const variation = 0.65 + ((seed * (i + 1) * 7) % 100) / 200;
    return Math.round(basePrice * variation);
  });
  const minPrice = Math.min(...prices);

  const isMonth = flexibility === 'month';
  const isAnytime = flexibility === 'anytime';

  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <Grid3x3 className="w-4 h-4 text-accent-cyan" />
        {isAnytime ? t('search.cheapestInYear') : isMonth ? t('search.monthView') : t('search.flexibleDates')}
      </h3>
      <div className={cn('grid gap-2',
        isAnytime ? 'grid-cols-4 lg:grid-cols-6' :
        isMonth ? 'grid-cols-7' :
        'grid-cols-7'
      )}>
        {dates.map((date, i) => {
          const isCenter = !isAnytime && !isMonth && i === 3;
          const isCheapest = prices[i] === minPrice;
          const d = new Date(date);
          return (
            <div key={date} className={cn(
              'rounded-lg p-2 text-center border transition-all cursor-pointer hover:border-brand-400/30',
              isCenter ? 'border-brand-400/50 bg-brand-500/10' : 'border-border-subtle bg-surface-hover',
              isCheapest && 'border-accent-green/50 bg-accent-green/5'
            )}>
              {isAnytime ? (
                <div className="text-[10px] text-gray-500">{d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}</div>
              ) : (
                <>
                  <div className="text-[10px] text-gray-500">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className="text-xs text-gray-300 mt-0.5">{d.toLocaleDateString('en-US', isMonth ? { day: 'numeric' } : { month: 'short', day: 'numeric' })}</div>
                </>
              )}
              <div className={cn('text-sm font-bold mt-1', isCheapest ? 'text-accent-green' : 'text-white')}>{formatPrice(prices[i])}</div>
              {isCheapest && <div className="text-[8px] text-accent-green font-medium mt-0.5">{t('search.cheapest')}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HackerLab() {
  const { t, locale } = useI18n();
  const [originAirport, setOriginAirport] = useState({ iata: 'RUH', name: 'King Khalid Intl (RUH)', entityId: '95673635' });
  const [destAirport, setDestAirport] = useState(null);
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [tripType, setTripType] = useState('oneway');
  const [cabin, setCabin] = useState('economy');
  const [passengers, setPassengers] = useState(1);
  const [sortBy, setSortBy] = useState('value');
  const [flexibility, setFlexibility] = useState('exact'); // exact | pm3 | month | anytime
  const [selectedGeoMarket, setSelectedGeoMarket] = useState(null);
  const [searchParams, setSearchParams] = useState(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteFlights(searchParams);
  const { data: geoData, isLoading: geoLoading } = useGeoArbitrage(searchParams);

  const allFlights = useMemo(() => {
    if (!data?.pages) return [];
    const flights = data.pages.flatMap(p => p.flights).map(f => ({
      ...f, valueScore: f.valueScore || calculateValueScore(f),
    }));
    return [...flights].sort((a, b) => {
      if (sortBy === 'value') return (b.valueScore || 0) - (a.valueScore || 0);
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'duration') return a.duration - b.duration;
      return 0;
    });
  }, [data, sortBy]);

  function handleSearch(e) {
    e.preventDefault();
    if (!destAirport || !departDate) return;
    setSearchParams({
      origin: originAirport.iata,
      destination: destAirport.iata,
      originEntityId: originAirport.entityId,
      destinationEntityId: destAirport.entityId,
      departDate,
      returnDate: tripType === 'roundtrip' ? returnDate : undefined,
      cabin: cabin.toUpperCase(),
      max: 25,
    });
  }

  const deepLinks = searchParams ? generateAllLinks({
    origin: searchParams.origin, destination: searchParams.destination,
    departDate: searchParams.departDate, returnDate: searchParams.returnDate,
    cabin,
  }) : null;

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-purple/20 flex items-center justify-center">
            <Search className="w-5 h-5 text-accent-purple" />
          </div>
          {t('nav.hackerLab')}
        </h2>
        <p className="text-sm text-gray-500 mt-1 ms-[52px]">{t('search.valueFormula')}</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="glass rounded-xl p-6 space-y-4">
        {/* Trip type + Flexibility toggle */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 uppercase tracking-wider">{t('search.tripType')}:</span>
            <button type="button" onClick={() => setTripType('oneway')}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', tripType === 'oneway' ? 'bg-brand-500/20 text-brand-400' : 'text-gray-400 hover:text-gray-200')}>
              {t('search.oneWay')}
            </button>
            <button type="button" onClick={() => setTripType('roundtrip')}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', tripType === 'roundtrip' ? 'bg-brand-500/20 text-brand-400' : 'text-gray-400 hover:text-gray-200')}>
              {t('search.roundTrip')}
            </button>
          </div>
          <div className="flex items-center gap-2 border-s border-border-subtle ps-4">
            <span className="text-[11px] text-gray-500 uppercase tracking-wider">{t('search.flexibility')}:</span>
            {[
              { key: 'exact', labelKey: 'search.exact' },
              { key: 'pm3', labelKey: 'search.pm3Days' },
              { key: 'month', labelKey: 'search.wholeMonth' },
              { key: 'anytime', labelKey: 'search.anytime' },
            ].map(f => (
              <button key={f.key} type="button" onClick={() => setFlexibility(f.key)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  flexibility === f.key ? 'bg-accent-cyan/20 text-accent-cyan' : 'text-gray-400 hover:text-gray-200')}>
                {t(f.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div className={cn('grid gap-4', tripType === 'roundtrip' ? 'grid-cols-2 lg:grid-cols-6' : 'grid-cols-2 lg:grid-cols-5')}>
          <AirportSearch
            label={t('search.origin')}
            value={originAirport}
            onChange={setOriginAirport}
            icon={MapPin}
            placeholder={t('search.typeToSearch')}
          />
          <AirportSearch
            label={t('search.destination')}
            value={destAirport}
            onChange={setDestAirport}
            icon={Plane}
            placeholder={t('search.typeToSearch')}
          />
          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">{t('search.departure')}</label>
            <div className="relative">
              <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="date" value={departDate} onChange={e => setDepartDate(e.target.value)}
                className="w-full bg-surface-hover border border-border-subtle rounded-lg ps-9 pe-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50" />
            </div>
          </div>
          {tripType === 'roundtrip' && (
            <div>
              <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">{t('search.return')}</label>
              <div className="relative">
                <Calendar className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)}
                  className="w-full bg-surface-hover border border-border-subtle rounded-lg ps-9 pe-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50" />
              </div>
            </div>
          )}
          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">{t('search.cabin')}</label>
            <div className="relative">
              <SlidersHorizontal className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select value={cabin} onChange={e => setCabin(e.target.value)}
                className="w-full bg-surface-hover border border-border-subtle rounded-lg ps-9 pe-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-brand-500/50">
                <option value="economy">{t('search.economy')}</option>
                <option value="business">{t('search.business')}</option>
                <option value="first">{t('search.first')}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">{t('search.passengers')}</label>
            <div className="relative">
              <Users className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="number" min="1" max="9" value={passengers} onChange={e => setPassengers(Number(e.target.value))}
                className="w-full bg-surface-hover border border-border-subtle rounded-lg ps-9 pe-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-gray-500">
            <Sparkles className="w-3 h-3 inline me-1" />
            {t('search.valueFormula')}
          </p>
          <button type="submit" disabled={isLoading}
            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {isLoading ? t('search.searching') : t('search.searchFlights')}
          </button>
        </div>
      </form>

      {/* Flexible Dates */}
      {searchParams && <FlexibleDateGrid origin={searchParams.origin} destination={searchParams.destination} centerDate={searchParams.departDate} flexibility={flexibility} />}

      {/* Positioning Flights */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-accent-cyan" />
          {t('search.positioningTitle')}
        </h3>
        <p className="text-xs text-gray-500 mb-4">{t('search.positioningDesc')}</p>
        <div className="grid grid-cols-3 gap-3">
          {hubSuggestions.map(hub => (
            <div key={hub.hub} className="bg-surface-hover rounded-lg p-3 border border-border-subtle">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-white">{originAirport?.iata || 'RUH'} → {hub.hub} → Dest</span>
                <span className="text-xs text-accent-green font-medium">{hub.savings}</span>
              </div>
              <p className="text-[11px] text-gray-400">{locale === 'ar' ? hub.noteAr : hub.noteEn}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Deep-links */}
      {deepLinks && (
        <div className="glass rounded-xl p-4 flex items-center gap-3 flex-wrap">
          <span className="text-[11px] text-gray-500 uppercase tracking-wider">{t('search.alsoSearchOn')}</span>
          {Object.entries(deepLinks).map(([name, url]) => (
            <a key={name} href={url} target="_blank" rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-surface-hover border border-border-subtle text-xs text-gray-300 hover:text-white hover:border-brand-400/30 transition-all">
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </a>
          ))}
        </div>
      )}

      {/* Geo-Pricing Summary — inline POS comparison (clickable → opens GeoProxy) */}
      {searchParams && geoData && !geoLoading && (
        <div className="glass rounded-xl p-4">
          <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-accent-cyan" />
            {t('geo.title')} — {searchParams.origin} → {searchParams.destination}
            <span className="ms-auto text-[9px] text-gray-600 font-normal">{t('search.clickMarket')}</span>
          </h3>
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
            {geoData.slice(0, 8).map((m, i) => {
              const isCheapest = i === 0;
              const isSelected = selectedGeoMarket === m.countryCode;
              return (
                <button key={m.market} type="button"
                  onClick={() => setSelectedGeoMarket(isSelected ? null : m.countryCode)}
                  className={cn(
                    'rounded-lg p-2.5 text-center border transition-all cursor-pointer',
                    isSelected ? 'border-accent-amber/50 bg-accent-amber/10 ring-1 ring-accent-amber/30' :
                    isCheapest ? 'border-accent-green/40 bg-accent-green/5 hover:border-accent-green/60' :
                    'border-border-subtle bg-surface-hover hover:border-gray-600'
                  )}>
                  <div className="text-[10px] text-gray-500 truncate">{m.market}</div>
                  <div className={cn('text-sm font-bold mt-0.5', isCheapest ? 'text-accent-green' : 'text-white')}>
                    {formatPrice(m.cheapestPrice)}
                  </div>
                  {m.savings > 0 && (
                    <div className="text-[9px] text-accent-green font-medium mt-0.5">-{m.savings}%</div>
                  )}
                  {m.vpnLocation && (
                    <div className="text-[8px] text-gray-600 mt-0.5 flex items-center justify-center gap-0.5">
                      <Wifi className="w-2.5 h-2.5" /> VPN
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {searchParams && geoLoading && (
        <div className="glass rounded-xl p-3 flex items-center gap-2 text-xs text-gray-500">
          <Loader2 className="w-3 h-3 animate-spin" /> {t('geo.scanning')}
        </div>
      )}

      {/* GeoProxy Navigator — shown when user clicks a market */}
      {searchParams && selectedGeoMarket && (
        <GeoProxy
          searchParams={{
            origin: searchParams.origin,
            destination: searchParams.destination,
            departDate: searchParams.departDate,
            returnDate: searchParams.returnDate,
          }}
          marketCode={selectedGeoMarket}
        />
      )}

      {/* Price Probe — no-API-key mode */}
      {searchParams && (
        <PriceProbe searchParams={{
          origin: searchParams.origin,
          destination: searchParams.destination,
          departDate: searchParams.departDate,
          returnDate: searchParams.returnDate,
          cabin,
        }} />
      )}

      {/* Sort Controls */}
      {allFlights.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">{allFlights.length} {t('search.results')}</span>
          <div className="flex items-center gap-2">
            {[
              { key: 'value', labelKey: 'sort.bestValue' },
              { key: 'price', labelKey: 'sort.cheapest' },
              { key: 'duration', labelKey: 'sort.fastest' },
            ].map(s => (
              <button key={s.key} onClick={() => setSortBy(s.key)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  sortBy === s.key ? 'bg-brand-500/20 text-brand-400' : 'text-gray-500 hover:text-gray-300')}>
                {t(s.labelKey)}
              </button>
            ))}
          </div>
        </div>
      )}

      <FlightTable flights={allFlights} loading={isLoading} showLoadMore={hasNextPage} onLoadMore={() => fetchNextPage()}
        flags={data?.pages?.[0]?.flags || []} />

      {isFetchingNextPage && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> {t('search.loadingMore')}
        </div>
      )}
    </div>
  );
}
