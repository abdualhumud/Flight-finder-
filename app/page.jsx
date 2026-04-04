'use client';

import { useState, useMemo } from 'react';
import { Radar, TrendingDown, Zap, Tag, Filter, ArrowUpDown, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import FlightTable from '../components/FlightTable';
import { useLiveDeals } from '../lib/hooks/useFlightSearch';
import { calculateValueScore } from '../lib/utils';
import { useI18n } from '../lib/i18n';

const monitoredRoutes = [
  { origin: 'RUH', destination: 'LHR', departDate: '2026-05-15' },
  { origin: 'JED', destination: 'IST', departDate: '2026-05-18' },
  { origin: 'RUH', destination: 'BKK', departDate: '2026-05-22' },
  { origin: 'RUH', destination: 'CDG', departDate: '2026-05-25' },
  { origin: 'JED', destination: 'KUL', departDate: '2026-06-01' },
  { origin: 'RUH', destination: 'DXB', departDate: '2026-05-10' },
];

export default function MissionControl() {
  const { t } = useI18n();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('value');
  const { data: deals = [], isLoading, isFetching, refetch } = useLiveDeals(monitoredRoutes);

  const enrichedDeals = useMemo(() =>
    deals.map(d => ({ ...d, valueScore: d.valueScore || calculateValueScore(d) })),
    [deals]
  );

  const filtered = useMemo(() => {
    let list = enrichedDeals;
    if (filter !== 'all') list = list.filter(d => d.type === filter);
    return [...list].sort((a, b) => {
      if (sortBy === 'value') return (b.valueScore || 0) - (a.valueScore || 0);
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'duration') return a.duration - b.duration;
      if (sortBy === 'savings') return ((b.originalPrice || b.price) - b.price) - ((a.originalPrice || a.price) - a.price);
      return 0;
    });
  }, [enrichedDeals, filter, sortBy]);

  const errorFares = enrichedDeals.filter(d => d.type === 'error_fare').length;
  const priceDrops = enrichedDeals.filter(d => d.type === 'price_drop').length;
  const avgSavings = enrichedDeals.length > 0
    ? Math.round(enrichedDeals.reduce((acc, d) => acc + (d.originalPrice ? ((d.originalPrice - d.price) / d.originalPrice * 100) : 0), 0) / enrichedDeals.length)
    : 0;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
              <Radar className="w-5 h-5 text-brand-400" />
            </div>
            {t('mc.title')}
          </h2>
          <p className="text-sm text-gray-500 mt-1 ms-[52px]">{t('mc.subtitle')} — {monitoredRoutes.length} {t('mc.routesMonitored')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => refetch()} disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-hover border border-border-subtle text-xs text-gray-400 hover:text-white transition-all disabled:opacity-50">
            {isFetching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {t('mc.refresh')}
          </button>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-accent-green/10 text-accent-green text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            {t('mc.liveRefresh')}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Radar, label: t('mc.activeDeals'), value: enrichedDeals.length, color: 'text-white' },
          { icon: AlertTriangle, label: t('mc.errorFares'), value: errorFares, color: 'text-accent-red', iconColor: 'text-accent-red' },
          { icon: TrendingDown, label: t('mc.priceDrops'), value: priceDrops, color: 'text-accent-green', iconColor: 'text-accent-green' },
          { icon: Zap, label: t('mc.avgSavings'), value: `${avgSavings}%`, color: 'text-accent-amber', iconColor: 'text-accent-amber' },
        ].map(stat => (
          <div key={stat.label} className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <stat.icon className={`w-3.5 h-3.5 ${stat.iconColor || ''}`} /> {stat.label}
            </div>
            <div className={`text-2xl font-bold ${stat.color}`}>{isLoading ? '...' : stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters + Sort */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          {[
            { key: 'all', labelKey: 'filter.all' },
            { key: 'error_fare', labelKey: 'filter.errorFare' },
            { key: 'price_drop', labelKey: 'filter.priceDrop' },
            { key: 'deal', labelKey: 'filter.deal' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f.key ? 'bg-brand-500/20 text-brand-400' : 'text-gray-400 hover:text-gray-200 hover:bg-surface-hover'}`}>
              {t(f.labelKey)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-gray-500" />
          {[
            { key: 'value', labelKey: 'sort.valueScore' },
            { key: 'price', labelKey: 'sort.cheapest' },
            { key: 'duration', labelKey: 'sort.fastest' },
            { key: 'savings', labelKey: 'sort.biggestSavings' },
          ].map(s => (
            <button key={s.key} onClick={() => setSortBy(s.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sortBy === s.key ? 'bg-surface-elevated text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              {t(s.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <FlightTable flights={filtered} loading={isLoading} />
    </div>
  );
}
