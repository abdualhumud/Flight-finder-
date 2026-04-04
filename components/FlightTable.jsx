'use client';

import { useState } from 'react';
import { Plane, Clock, Zap, TrendingDown, Tag, ExternalLink, ChevronDown, Diamond, Users } from 'lucide-react';
import { cn, formatPrice, formatDuration, calculateValueScore, getValueRating } from '../lib/utils';
import { generateAllLinks } from '../lib/api/deepLinks';

const typeConfig = {
  error_fare: { label: 'ERROR FARE', icon: Zap, color: 'text-accent-red', bg: 'bg-accent-red/10', border: 'border-accent-red/30' },
  price_drop: { label: 'PRICE DROP', icon: TrendingDown, color: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/30' },
  deal: { label: 'DEAL', icon: Tag, color: 'text-accent-amber', bg: 'bg-accent-amber/10', border: 'border-accent-amber/30' },
};

function FlightRow({ flight, rank }) {
  const [expanded, setExpanded] = useState(false);
  const config = typeConfig[flight.type] || typeConfig.deal;
  const TypeIcon = config.icon;
  const vs = flight.valueScore || calculateValueScore(flight);
  const rating = getValueRating(vs);
  const savings = flight.originalPrice ? Math.round(((flight.originalPrice - flight.price) / flight.originalPrice) * 100) : 0;

  const links = generateAllLinks({
    origin: flight.origin,
    destination: flight.destination,
    departDate: flight.departure?.split('T')[0] || '',
    cabin: (flight.cabin || 'economy').toLowerCase(),
  });

  const isBest = rank === 0;
  const isFastest = rank === 'fastest';

  return (
    <div className={cn('glass glass-hover rounded-xl overflow-hidden transition-all animate-slide-up', config.border)}>
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          {/* Rank + Badges */}
          <div className="w-16 flex-shrink-0 flex flex-col items-center gap-1">
            {isBest && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-accent-amber flex items-center gap-0.5">
                <Diamond className="w-3 h-3" /> Best
              </span>
            )}
            {isFastest && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-accent-cyan flex items-center gap-0.5">
                <Zap className="w-3 h-3" /> Fast
              </span>
            )}
            <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider flex items-center gap-1', config.color, config.bg)}>
              <TypeIcon className="w-2.5 h-2.5" />
              {config.label}
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
                  {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
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

          {/* Value Score */}
          <div className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold', rating.bg, rating.color)}>
            VS {vs.toFixed(1)}
          </div>

          {/* Seats */}
          {flight.seatsRemaining && (
            <div className="flex items-center gap-1 text-[10px] text-accent-amber">
              <Users className="w-3 h-3" />
              {flight.seatsRemaining} left
            </div>
          )}

          {/* Price */}
          <div className="text-right min-w-[100px]">
            <div className="text-lg font-bold text-white">{formatPrice(flight.price)}</div>
            {savings > 0 && (
              <div className="flex items-center justify-end gap-1">
                <span className="text-[10px] text-gray-500 line-through">{formatPrice(flight.originalPrice)}</span>
                <span className="text-[10px] text-accent-green font-medium">-{savings}%</span>
              </div>
            )}
          </div>

          <ChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform', expanded && 'rotate-180')} />
        </div>
      </div>

      {/* Expanded: Deep-links */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border-subtle pt-3 flex items-center gap-3 flex-wrap">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Book on:</span>
          {Object.entries(links).map(([name, url]) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-hover border border-border-subtle text-xs text-gray-300 hover:text-white hover:border-brand-400/30 transition-all"
            >
              <ExternalLink className="w-3 h-3" />
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </a>
          ))}
          {flight.expiresIn && (
            <span className="ml-auto text-[10px] text-accent-amber flex items-center gap-1">
              <Clock className="w-3 h-3" /> Expires: {flight.expiresIn}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function FlightTable({ flights, loading, sortBy = 'value', showLoadMore = false, onLoadMore }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-16 h-6 bg-surface-hover rounded" />
              <div className="flex-1 h-10 bg-surface-hover rounded" />
              <div className="w-20 h-6 bg-surface-hover rounded" />
              <div className="w-24 h-8 bg-surface-hover rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!flights || flights.length === 0) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <Plane className="w-10 h-10 mx-auto mb-3 text-gray-600" />
        <p className="text-sm text-gray-500">No flights found. Try a different search.</p>
      </div>
    );
  }

  // Find fastest for badge
  const fastestId = [...flights].sort((a, b) => a.duration - b.duration)[0]?.id;

  return (
    <div className="space-y-3">
      {flights.map((flight, i) => (
        <FlightRow
          key={flight.id}
          flight={flight}
          rank={i === 0 ? 0 : flight.id === fastestId ? 'fastest' : i}
        />
      ))}

      {showLoadMore && onLoadMore && (
        <button
          onClick={onLoadMore}
          className="w-full py-3 rounded-xl border border-border-subtle text-sm text-gray-400 hover:text-white hover:bg-surface-hover transition-all"
        >
          Load More Results
        </button>
      )}
    </div>
  );
}
