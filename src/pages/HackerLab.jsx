import { useState } from 'react';
import { Search, Plane, ArrowRightLeft, Calendar, Users, SlidersHorizontal, Sparkles, MapPin } from 'lucide-react';
import { airports, liveDeals } from '../data/mockData';
import { calculateValueScore, getValueRating, formatPrice, formatDuration } from '../utils/valueScore';

const hubSuggestions = [
  { hub: 'IST', savings: '15-25%', note: 'Turkish Airlines hub — great for Europe/Asia' },
  { hub: 'DXB', savings: '10-20%', note: 'Emirates hub — strong Asia/Africa connections' },
  { hub: 'LHR', savings: '5-15%', note: 'BA hub — ideal for Americas via Avios' },
];

export default function HackerLab() {
  const [origin, setOrigin] = useState('RUH');
  const [destination, setDestination] = useState('');
  const [cabin, setCabin] = useState('economy');
  const [passengers, setPassengers] = useState(1);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  function handleSearch(e) {
    e.preventDefault();
    const mockResults = liveDeals
      .filter(d => (!origin || d.origin === origin) && (!destination || d.destination === destination))
      .map(d => ({ ...d, valueScore: calculateValueScore(d) }))
      .sort((a, b) => b.valueScore - a.valueScore);

    if (mockResults.length === 0 && destination) {
      const generated = [{
        id: 100, origin: origin || 'RUH', destination, airline: 'Simulated Route',
        price: 1200 + Math.floor(Math.random() * 2000), originalPrice: 2500 + Math.floor(Math.random() * 2000),
        currency: 'SAR', departure: '2026-05-01T10:00', arrival: '2026-05-01T18:00',
        duration: 300 + Math.floor(Math.random() * 300), stops: Math.random() > 0.5 ? 1 : 0,
        cabin, comfort: 7, loyaltyPoints: 2000, type: 'deal', expiresIn: '3d',
      }];
      generated[0].valueScore = calculateValueScore(generated[0]);
      setResults(generated);
    } else {
      setResults(mockResults);
    }
    setSearched(true);
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-purple/20 flex items-center justify-center">
            <Search className="w-5 h-5 text-accent-purple" />
          </div>
          The Hacker Lab
        </h2>
        <p className="text-sm text-gray-500 mt-1 ml-[52px]">Value-first search engine with positioning flight intelligence</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="glass rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Origin</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                className="w-full bg-surface-hover border border-border-subtle rounded-lg pl-9 pr-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-brand-500/50"
              >
                {airports.filter(a => ['RUH', 'JED'].includes(a.code)).map(a => (
                  <option key={a.code} value={a.code}>{a.code} — {a.city}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Destination</label>
            <div className="relative">
              <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full bg-surface-hover border border-border-subtle rounded-lg pl-9 pr-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-brand-500/50"
              >
                <option value="">Any destination</option>
                {airports.filter(a => a.code !== origin).map(a => (
                  <option key={a.code} value={a.code}>{a.code} — {a.city}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-gray-500 uppercase tracking-wider mb-1 block">Cabin</label>
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                value={cabin}
                onChange={e => setCabin(e.target.value)}
                className="w-full bg-surface-hover border border-border-subtle rounded-lg pl-9 pr-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-brand-500/50"
              >
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
              <input
                type="number"
                min="1"
                max="9"
                value={passengers}
                onChange={e => setPassengers(Number(e.target.value))}
                className="w-full bg-surface-hover border border-border-subtle rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-gray-500">
            <Sparkles className="w-3 h-3 inline mr-1" />
            Results ranked by Value Score: (Comfort + Loyalty) / (Price x Duration)
          </p>
          <button
            type="submit"
            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search Flights
          </button>
        </div>
      </form>

      {/* Positioning Flight Suggestions */}
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

      {/* Search Results */}
      {searched && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">
            {results.length} result{results.length !== 1 ? 's' : ''} ranked by Value Score
          </h3>
          {results.length > 0 ? (
            <div className="space-y-3">
              {results.map(r => {
                const rating = getValueRating(r.valueScore);
                return (
                  <div key={r.id} className="glass glass-hover rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{r.origin}</div>
                        <div className="text-[10px] text-gray-500">{new Date(r.departure).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-[10px] text-gray-500">{formatDuration(r.duration)}</div>
                        <div className="w-24 h-px bg-border-subtle relative">
                          <Plane className="w-3 h-3 text-brand-400 absolute -top-1.5 left-1/2 -translate-x-1/2" />
                        </div>
                        <div className="text-[10px] text-gray-500">{r.stops === 0 ? 'Direct' : `${r.stops} stop`}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{r.destination}</div>
                        <div className="text-[10px] text-gray-500">{new Date(r.arrival).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      </div>
                      <div className="ml-4 text-xs text-gray-400">{r.airline}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`px-2 py-1 rounded-lg text-xs font-medium ${rating.bg} ${rating.color}`}>
                        VS: {r.valueScore}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{formatPrice(r.price)}</div>
                        {r.originalPrice > r.price && (
                          <div className="text-[10px] text-gray-500 line-through">{formatPrice(r.originalPrice)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass rounded-xl p-8 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No results found. Try a different route.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
