'use client';

import { useState, useMemo } from 'react';
import { Search, Plane, ArrowRightLeft, Users, SlidersHorizontal, Sparkles, MapPin, Calendar, Grid3x3, Loader2 } from 'lucide-react';
import { useInfiniteFlights } from '../../lib/hooks/useFlightSearch';
import { calculateValueScore, formatPrice, cn } from '../../lib/utils';
import FlightTable from '../../components/FlightTable';
import AirportSearch from '../../components/AirportSearch';
import { generateAllLinks } from '../../lib/api/deepLinks';
import { useI18n } from '../../lib/i18n';
import PriceProbe from '../../components/PriceProbe';

const hubSuggestions = [
  { hub: 'IST', savings: '15-25%', noteEn: 'Turkish Airlines hub — great for Europe/Asia', noteAr: 'مركز الخطوط التركية — ممتاز لأوروبا/آسيا' },
  { hub: 'DXB', savings: '10-20%', noteEn: 'Emirates hub — strong Asia/Africa connections', noteAr: 'مركز طيران الإمارات — اتصالات قوية لآسيا/أفريقيا' },
  { hub: 'LHR', savings: '5-15%', noteEn: 'BA hub — ideal for Americas via Avios', noteAr: 'مركز الخطوط البريطانية — مثالي للأمريكتين عبر أفيوس' },
];

function FlexibleDateGrid({ origin, destination, centerDate }) {
  const { t } = useI18n();
  if (!origin || !destination || !centerDate) return null;

  const dates = [];
  const center = new Date(centerDate);
  for (let i = -3; i <= 3; i++) {
    const d = new Date(center);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const seed = (origin + destination + centerDate).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const basePrice = 1200 + (seed % 1500);
  const prices = dates.map((_, i) => {
    const variation = 0.75 + ((seed * (i + 1) * 7) % 100) / 200;
    return Math.round(basePrice * variation);
  });
  const minPrice = Math.min(...prices);

  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <Grid3x3 className="w-4 h-4 text-accent-cyan" />
        {t('search.flexibleDates')}
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {dates.map((date, i) => {
          const isCenter = i === 3;
          const isCheapest = prices[i] === minPrice;
          return (
            <div key={date} className={cn(
              'rounded-lg p-3 text-center border transition-all cursor-pointer hover:border-brand-400/30',
              isCenter ? 'border-brand-400/50 bg-brand-500/10' : 'border-border-subtle bg-surface-hover',
              isCheapest && 'border-accent-green/50 bg-accent-green/5'
            )}>
              <div className="text-[10px] text-gray-500">{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="text-xs text-gray-300 mt-0.5">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
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
  const [searchParams, setSearchParams] = useState(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteFlights(searchParams);

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
      max: 10,
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
        {/* Trip type toggle */}
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
      {searchParams && <FlexibleDateGrid origin={searchParams.origin} destination={searchParams.destination} centerDate={searchParams.departDate} />}

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
