'use client';

import { useState } from 'react';
import { Plane, Clock, Zap, TrendingDown, Tag, ExternalLink, ChevronDown, Diamond, Users, AlertTriangle, ArrowLeftRight } from 'lucide-react';
import { cn, formatPrice, formatDuration, calculateValueScore, getValueRating } from '../lib/utils';
import { generateAllLinks } from '../lib/api/deepLinks';
import { useI18n } from '../lib/i18n';

const typeConfig = {
  error_fare: { labelKey: 'flight.errorFare', icon: Zap, color: 'text-accent-red', bg: 'bg-accent-red/10', border: 'border-accent-red/30' },
  price_drop: { labelKey: 'flight.priceDrop', icon: TrendingDown, color: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/30' },
  deal: { labelKey: 'flight.deal', icon: Tag, color: 'text-accent-amber', bg: 'bg-accent-amber/10', border: 'border-accent-amber/30' },
};

function FlightRow({ flight, rank }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useI18n();
  const config = typeConfig[flight.type] || typeConfig.deal;
  const TypeIcon = config.icon;
  const vs = flight.valueScore || calculateValueScore(flight);
  const rating = getValueRating(vs);
  const savings = flight.originalPrice ? Math.round(((flight.originalPrice - flight.price) / flight.originalPrice) * 100) : 0;
  const isLive = flight.source === 'amadeus' || flight.source === 'skyscanner';
  const sourceLabels = {
    amadeus: 'Amadeus',
    skyscanner: 'Skyscanner',
    google_flights: 'Google',
    trip_com: 'Trip.com',
    kayak: 'Kayak',
    simulated: 'SIM',
  };
  const sourceLabel = sourceLabels[flight.source] || flight.source;

  const links = flight.deepLink
    ? { provider: flight.deepLink }
    : generateAllLinks({
        origin: flight.origin,
        destination: flight.destination,
        departDate: flight.departure?.split('T')[0] || '',
        returnDate: flight.returnDeparture?.split('T')[0] || undefined,
        cabin: (flight.cabin || 'economy').toLowerCase(),
      });

  return (
    <div className={cn('glass glass-hover rounded-xl overflow-hidden transition-all animate-slide-up', config.border)}>
      <div className="p-3 md:p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        {/* ===== DESKTOP LAYOUT (md+) ===== */}
        <div className="hidden md:flex items-center gap-4">
          {/* Rank + Badges */}
          <div className="w-16 flex-shrink-0 flex flex-col items-center gap-1">
            {rank === 0 && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-accent-amber flex items-center gap-0.5">
                <Diamond className="w-3 h-3" /> {t('flight.best')}
              </span>
            )}
            {rank === 'fastest' && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-accent-cyan flex items-center gap-0.5">
                <Zap className="w-3 h-3" /> {t('flight.fast')}
              </span>
            )}
            <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider flex items-center gap-1', config.color, config.bg)}>
              <TypeIcon className="w-2.5 h-2.5" />
              {t(config.labelKey)}
            </span>
            <span className={cn('text-[8px] font-mono px-1.5 py-0.5 rounded',
              isLive ? 'bg-accent-green/10 text-accent-green' :
              flight.source === 'google_flights' ? 'bg-blue-500/10 text-blue-400' :
              flight.source === 'trip_com' ? 'bg-red-500/10 text-red-400' :
              flight.source === 'kayak' ? 'bg-orange-500/10 text-orange-400' :
              'bg-gray-700/30 text-gray-500'
            )}>
              {sourceLabel}
            </span>
          </div>

          {/* Route */}
          <div className="flex items-center gap-3 flex-1">
            <div className="text-center min-w-[48px]">
              <div className="text-base font-bold text-white">{flight.origin}</div>
              <div className="text-[10px] text-gray-500">
                {flight.departure ? new Date(flight.departure).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center gap-0.5 min-w-[100px]">
              <span className="text-[10px] text-gray-500">{formatDuration(flight.duration)}</span>
              <div className="w-full flex items-center">
                <div className="h-px flex-1 bg-border-subtle" />
                <div className="px-2 py-0.5 rounded-full bg-surface-hover text-[9px] text-gray-400 flex items-center gap-1">
                  <Plane className="w-2.5 h-2.5" />
                  {flight.stops === 0 ? t('flight.direct') : `${flight.stops} ${flight.stops > 1 ? t('flight.stops') : t('flight.stop')}`}
                </div>
                <div className="h-px flex-1 bg-border-subtle" />
              </div>
              <span className="text-[10px] text-gray-500">{flight.airlineName || flight.airline}</span>
            </div>
            <div className="text-center min-w-[48px]">
              <div className="text-base font-bold text-white">{flight.destination}</div>
              <div className="text-[10px] text-gray-500">
                {flight.arrival ? new Date(flight.arrival).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </div>
            </div>
          </div>

          {/* Return indicator */}
          {flight.hasReturn && (
            <div className="flex items-center gap-1 text-[10px] text-accent-cyan">
              <ArrowLeftRight className="w-3 h-3" />
              R/T
            </div>
          )}

          {/* Value Score */}
          <div className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold', rating.bg, rating.color)}>
            {t('flight.vs')} {vs.toFixed(1)}
          </div>

          {/* Seats */}
          {flight.seatsRemaining && (
            <div className="flex items-center gap-1 text-[10px] text-accent-amber">
              <Users className="w-3 h-3" />
              {flight.seatsRemaining} {t('flight.left')}
            </div>
          )}

          {/* Price */}
          <div className="text-end min-w-[100px]">
            <div className="text-lg font-bold text-white">{formatPrice(flight.price, flight.currency)}</div>
            {savings > 0 && (
              <div className="flex items-center justify-end gap-1">
                <span className="text-[10px] text-gray-500 line-through">{formatPrice(flight.originalPrice, flight.currency)}</span>
                <span className="text-[10px] text-accent-green font-medium">-{savings}%</span>
              </div>
            )}
          </div>

          <ChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform', expanded && 'rotate-180')} />
        </div>

        {/* ===== MOBILE LAYOUT (< md) ===== */}
        <div className="md:hidden space-y-2.5">
          {/* Top row: badges + price */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {rank === 0 && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-accent-amber flex items-center gap-0.5">
                  <Diamond className="w-3 h-3" /> {t('flight.best')}
                </span>
              )}
              {rank === 'fastest' && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-accent-cyan flex items-center gap-0.5">
                  <Zap className="w-3 h-3" /> {t('flight.fast')}
                </span>
              )}
              <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider flex items-center gap-1', config.color, config.bg)}>
                <TypeIcon className="w-2.5 h-2.5" />
                {t(config.labelKey)}
              </span>
              <span className={cn('text-[8px] font-mono px-1.5 py-0.5 rounded',
                isLive ? 'bg-accent-green/10 text-accent-green' :
                flight.source === 'google_flights' ? 'bg-blue-500/10 text-blue-400' :
                flight.source === 'trip_com' ? 'bg-red-500/10 text-red-400' :
                flight.source === 'kayak' ? 'bg-orange-500/10 text-orange-400' :
                'bg-gray-700/30 text-gray-500'
              )}>
                {sourceLabel}
              </span>
            </div>
            <div className="text-end flex-shrink-0">
              <div className="text-lg font-bold text-white">{formatPrice(flight.price, flight.currency)}</div>
              {savings > 0 && (
                <div className="flex items-center justify-end gap-1">
                  <span className="text-[10px] text-gray-500 line-through">{formatPrice(flight.originalPrice, flight.currency)}</span>
                  <span className="text-[10px] text-accent-green font-medium">-{savings}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Route row */}
          <div className="flex items-center gap-2">
            <div className="text-center">
              <div className="text-sm font-bold text-white">{flight.origin}</div>
              <div className="text-[10px] text-gray-500">
                {flight.departure ? new Date(flight.departure).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center gap-0.5">
              <span className="text-[10px] text-gray-500">{formatDuration(flight.duration)}</span>
              <div className="w-full flex items-center">
                <div className="h-px flex-1 bg-border-subtle" />
                <div className="px-1.5 py-0.5 rounded-full bg-surface-hover text-[9px] text-gray-400 flex items-center gap-0.5">
                  <Plane className="w-2.5 h-2.5" />
                  {flight.stops === 0 ? t('flight.direct') : `${flight.stops}${flight.stops > 1 ? t('flight.stops') : t('flight.stop')}`}
                </div>
                <div className="h-px flex-1 bg-border-subtle" />
              </div>
              <span className="text-[10px] text-gray-500 truncate max-w-[120px]">{flight.airlineName || flight.airline}</span>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-white">{flight.destination}</div>
              <div className="text-[10px] text-gray-500">
                {flight.arrival ? new Date(flight.arrival).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </div>
            </div>
          </div>

          {/* Bottom row: VS, seats, return, chevron */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={cn('px-2 py-0.5 rounded-lg text-[10px] font-semibold', rating.bg, rating.color)}>
                {t('flight.vs')} {vs.toFixed(1)}
              </div>
              {flight.hasReturn && (
                <div className="flex items-center gap-1 text-[10px] text-accent-cyan">
                  <ArrowLeftRight className="w-3 h-3" /> R/T
                </div>
              )}
              {flight.seatsRemaining && (
                <div className="flex items-center gap-1 text-[10px] text-accent-amber">
                  <Users className="w-3 h-3" />
                  {flight.seatsRemaining} {t('flight.left')}
                </div>
              )}
            </div>
            <ChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform', expanded && 'rotate-180')} />
          </div>
        </div>

        {/* Return leg summary — shared between mobile and desktop */}
        {flight.hasReturn && flight.returnDeparture && (
          <div className="mt-2 pt-2 border-t border-border-subtle/50 flex items-center gap-3 text-[10px] text-gray-500 ps-0 md:ps-16">
            <ArrowLeftRight className="w-3 h-3 text-accent-cyan" />
            <span>Return: {flight.destination} → {flight.origin}</span>
            <span>{new Date(flight.returnDeparture).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            {flight.returnDuration && <span className="hidden sm:inline">{formatDuration(flight.returnDuration)}</span>}
          </div>
        )}
      </div>

      {/* Expanded: Deep-links */}
      {expanded && (
        <div className="px-3 md:px-4 pb-3 md:pb-4 border-t border-border-subtle pt-3 flex items-center gap-2 md:gap-3 flex-wrap">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider w-full sm:w-auto">{t('flight.bookOn')}</span>
          {Object.entries(links).map(([name, url]) => (
            <a key={name} href={url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-2 md:py-1.5 rounded-lg bg-surface-hover border border-border-subtle text-xs text-gray-300 hover:text-white hover:border-brand-400/30 transition-all">
              <ExternalLink className="w-3 h-3" />
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </a>
          ))}
          {flight.expiresIn && (
            <span className="ms-auto text-[10px] text-accent-amber flex items-center gap-1">
              <Clock className="w-3 h-3" /> {t('flight.expires')} {flight.expiresIn}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function FlightTable({ flights, loading, sortBy = 'value', showLoadMore = false, onLoadMore, flags = [] }) {
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass rounded-xl p-3 md:p-4 animate-pulse">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 md:w-16 h-6 bg-surface-hover rounded" />
              <div className="flex-1 h-10 bg-surface-hover rounded" />
              <div className="w-16 md:w-20 h-6 bg-surface-hover rounded" />
              <div className="w-20 md:w-24 h-8 bg-surface-hover rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!flights || flights.length === 0) {
    return (
      <div className="glass rounded-xl p-8 md:p-12 text-center">
        <Plane className="w-10 h-10 mx-auto mb-3 text-gray-600" />
        <p className="text-sm text-gray-500">{t('search.noResults')}</p>
      </div>
    );
  }

  const fastestId = [...flights].sort((a, b) => a.duration - b.duration)[0]?.id;

  return (
    <div className="space-y-3">
      {/* Cross-verification flags */}
      {flags.length > 0 && (
        <div className="glass rounded-xl p-3 border border-accent-amber/20 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-accent-amber flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            {flags.map((f, i) => (
              <p key={i} className="text-xs text-accent-amber">{f.message}</p>
            ))}
          </div>
        </div>
      )}

      {flights.map((flight, i) => (
        <FlightRow key={flight.id} flight={flight} rank={i === 0 ? 0 : flight.id === fastestId ? 'fastest' : i} />
      ))}

      {showLoadMore && onLoadMore && (
        <button onClick={onLoadMore}
          className="w-full py-3 rounded-xl border border-border-subtle text-sm text-gray-400 hover:text-white hover:bg-surface-hover transition-all">
          {t('search.loadMore')}
        </button>
      )}
    </div>
  );
}
