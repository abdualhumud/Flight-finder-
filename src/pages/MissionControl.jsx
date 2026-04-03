import { useState } from 'react';
import { Radar, TrendingDown, Zap, Tag, Filter, ArrowUpDown, AlertTriangle } from 'lucide-react';
import DealCard from '../components/DealCard';
import { liveDeals } from '../data/mockData';

export default function MissionControl() {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('valueScore');

  const filtered = liveDeals
    .filter(d => filter === 'all' || d.type === filter)
    .sort((a, b) => {
      if (sortBy === 'valueScore') return b.valueScore - a.valueScore;
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'savings') return (b.originalPrice - b.price) - (a.originalPrice - a.price);
      return 0;
    });

  const errorFares = liveDeals.filter(d => d.type === 'error_fare').length;
  const priceDrops = liveDeals.filter(d => d.type === 'price_drop').length;
  const avgSavings = Math.round(liveDeals.reduce((acc, d) => acc + ((d.originalPrice - d.price) / d.originalPrice * 100), 0) / liveDeals.length);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
              <Radar className="w-5 h-5 text-brand-400" />
            </div>
            Mission Control
          </h2>
          <p className="text-sm text-gray-500 mt-1 ml-[52px]">Real-time flight deal intelligence feed</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-accent-green/10 text-accent-green text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-slow" />
            Live Scanning
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Radar className="w-3.5 h-3.5" /> Active Deals
          </div>
          <div className="text-2xl font-bold text-white">{liveDeals.length}</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-accent-red" /> Error Fares
          </div>
          <div className="text-2xl font-bold text-accent-red">{errorFares}</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-accent-green" /> Price Drops
          </div>
          <div className="text-2xl font-bold text-accent-green">{priceDrops}</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Zap className="w-3.5 h-3.5 text-accent-amber" /> Avg Savings
          </div>
          <div className="text-2xl font-bold text-accent-amber">{avgSavings}%</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          {[
            { key: 'all', label: 'All Deals', icon: null },
            { key: 'error_fare', label: 'Error Fares', icon: Zap },
            { key: 'price_drop', label: 'Price Drops', icon: TrendingDown },
            { key: 'deal', label: 'Deals', icon: Tag },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.key
                  ? 'bg-brand-500/20 text-brand-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-surface-hover'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-gray-500" />
          {[
            { key: 'valueScore', label: 'Value Score' },
            { key: 'price', label: 'Price' },
            { key: 'savings', label: 'Savings' },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === s.key
                  ? 'bg-surface-elevated text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deal Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(deal => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </div>
  );
}
