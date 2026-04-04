'use client';

import { useState, useMemo } from 'react';
import { Search, Plane, ArrowRightLeft, Users, SlidersHorizontal, Sparkles, MapPin, Calendar, Grid3x3, Loader2 } from 'lucide-react';
import { airports, homeAirports, destAirports } from '../../data/airports';
import { useInfiniteFlights } from '../../lib/hooks/useFlightSearch';
import { calculateValueScore, formatPrice, cn } from '../../lib/utils';
import FlightTable from '../../components/FlightTable';
import { generateAllLinks } from '../../lib/api/deepLinks';

const hubSuggestions = [
  { hub: 'IST', savings: '15-25%', note: 'Turkish Airlines hub — great for Europe/Asia' },
  { hub: 'DXB', savings: '10-20%', note: 'Emirates hub — strong Asia/Africa connections' },
  { hub: 'LHR', savings: '5-15%', note: 'BA hub — ideal for Americas via Avios' },
];

function FlexibleDateGrid({ origin, destination, centerDate }) {
  if (!origin || !destination || !centerDate) return null;

  const dates = [];
  const center = new Date(centerDate);
  for (let i = -3; i <= 3; i++) {
    const d = new Date(center);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }

  // Generate simulated prices for the grid
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
        Flexible Dates (+/- 3 days)
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {dates.map((date, i) => {
          const isCenter = i === 3;
          const isCheapest = prices[i] === minPrice;
          return (
            <div
              key={date}
              className={cn(
                'rounded-lg p-3 text-center border transition-all cursor-pointer hover:border-brand-400/30',
                isCenter ? 'border-brand-400/50 bg-brand-500/10' : 'border-border-subtle bg-surface-hover',
                isCheapest && 'border-accent-green/50 bg-accent-green/5'
              )}
            >
              <div className="text-[10px] text-gray-500">{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="text-xs text-gray-300 mt-0.5">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              <div className={cn('text-sm font-bold mt-1', isCheapest ? 'text-accent-green' : 'text-white')}>
                {formatPrice(prices[i])}
              </div>
              {isCheapest && <div className="text-[8px] text-accent-green font-medium mt-0.5">CHEAPEST</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HackerLab() {
  const [origin, setOrigin] = useState('RUH');
  const [destination, setDestination] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [cabin, setCabin] = useState('economy');
  const [passengers, setPassengers] = useState(1);
  const [sortBy, setSortBy] = useState('value');
  const [searchParams, setSearchParams] = useState(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteFlights(searchParams);

  const allFlights = useMemo(() => {
    if (!data?.pages) return [];
    const flights = data.pages.flatMap(p => p.flights).map(f => ({
      ...f,
      valueScore: f.valueScore || calculateValueScore(f),
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
    if (!destination || !departDate) return;
    setSearchParams({ origin, destination, departDate, cabin: cabin.toUpperCase(), max: 10 });
  }

  const deepLinks = searchParams ? generateAllLinks({ ...searchParams, cabin }) : null;

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-purple/20 flex items-center justify-center">
            <Search className="w-5 h-5 text-accent-purple" />
          </div>
          The Hacker Lab
        </h2>
        <p className="text-sm text-gray-500 mt-1 ml-[52px]">Value-first search with flexible dates and positioning intelligence</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="glass rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Cabin</label>
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select value={cabin} onChange={e => setCabin(e.target.value)}
                className="w-full bg-surface-hover border border-border-subtle rounded-lg pl-9 pr-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-brand-500/50">
                <option value="economy">Economy</option>
                <option value="business">Business</option>
                <option value="first">First</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Passengers</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="number" min="1" max="9" value={passengers} onChange={e => setPassengers(Number(e.target.value))}
                className="w-full bg-surface-hover border border-border-subtle rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-gray-500">
            <Sparkles className="w-3 h-3 inline mr-1" />
            Value Score = (Comfort + Loyalty) / (Price x Duration) — higher is better
          </p>
          <button type="submit" className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search Flights
          </button>
        </div>
      </form>

      {/* Flexible Dates */}
      {searchParams && (
        <FlexibleDateGrid origin={searchParams.origin} destination={searchParams.destination} centerDate={searchParams.departDate} />
      )}

      {/* Positioning Flights */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-accent-cyan" />
          Positioning Flight Suggestions
        </h3>
        <p className="text-xs text-gray-500 mb-4">Flying to a hub first could save you money on your final destination</p>
        <div className="grid grid-cols-3 gap-3">
          {hubSuggestions.map(hub => (
            <div key={hub.hub} className="bg-surface-hover rounded-lg p-3 border border-border-subtle">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-white">{origin} → {hub.hub} → Dest</span>
                <span className="text-xs text-accent-green font-medium">{hub.savings}</span>
              </div>
              <p className="text-[11px] text-gray-400">{hub.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Deep-links */}
      {deepLinks && (
        <div className="glass rounded-xl p-4 flex items-center gap-3 flex-wrap">
          <span className="text-[11px] text-gray-500 uppercase tracking-wider">Also search on:</span>
          {Object.entries(deepLinks).map(([name, url]) => (
            <a key={name} href={url} target="_blank" rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-surface-hover border border-border-subtle text-xs text-gray-300 hover:text-white hover:border-brand-400/30 transition-all">
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </a>
          ))}
        </div>
      )}

      {/* Sort Controls */}
      {allFlights.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">{allFlights.length} results</span>
          <div className="flex items-center gap-2">
            {[
              { key: 'value', label: 'Best Value' },
              { key: 'price', label: 'Cheapest' },
              { key: 'duration', label: 'Fastest' },
            ].map(s => (
              <button key={s.key} onClick={() => setSortBy(s.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sortBy === s.key ? 'bg-brand-500/20 text-brand-400' : 'text-gray-500 hover:text-gray-300'
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <FlightTable
        flights={allFlights}
        loading={isLoading}
        showLoadMore={hasNextPage}
        onLoadMore={() => fetchNextPage()}
      />

      {isFetchingNextPage && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading more flights...
        </div>
      )}
    </div>
  );
}
