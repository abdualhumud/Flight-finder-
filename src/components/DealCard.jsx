import { Plane, Clock, ArrowRight, Zap, TrendingDown, Tag } from 'lucide-react';
import { formatPrice, formatDuration, getValueRating } from '../utils/valueScore';

const typeConfig = {
  error_fare: { label: 'ERROR FARE', icon: Zap, color: 'text-accent-red', bg: 'bg-accent-red/10', border: 'border-accent-red/30' },
  price_drop: { label: 'PRICE DROP', icon: TrendingDown, color: 'text-accent-green', bg: 'bg-accent-green/10', border: 'border-accent-green/30' },
  deal: { label: 'DEAL', icon: Tag, color: 'text-accent-amber', bg: 'bg-accent-amber/10', border: 'border-accent-amber/30' },
};

export default function DealCard({ deal }) {
  const config = typeConfig[deal.type];
  const TypeIcon = config.icon;
  const rating = getValueRating(deal.valueScore);
  const savings = deal.originalPrice - deal.price;
  const savingsPercent = Math.round((savings / deal.originalPrice) * 100);

  return (
    <div className={`glass glass-hover rounded-xl p-4 transition-all duration-300 animate-slide-up border ${config.border}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${config.color} ${config.bg}`}>
            <TypeIcon className="w-3 h-3" />
            {config.label}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${rating.color} ${rating.bg}`}>
            VS: {deal.valueScore}
          </span>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 line-through">{formatPrice(deal.originalPrice)}</span>
            <span className="text-lg font-bold text-white">{formatPrice(deal.price)}</span>
          </div>
          <span className="text-[10px] text-accent-green font-medium">Save {savingsPercent}% ({formatPrice(savings)})</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{deal.origin}</div>
          <div className="text-[10px] text-gray-500">{new Date(deal.departure).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <div className="flex-1 flex items-center gap-1">
          <div className="h-px flex-1 bg-border-subtle" />
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-hover text-[10px] text-gray-400">
            <Plane className="w-3 h-3" />
            {deal.stops === 0 ? 'Direct' : `${deal.stops} stop`}
          </div>
          <div className="h-px flex-1 bg-border-subtle" />
          <ArrowRight className="w-3 h-3 text-gray-500" />
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{deal.destination}</div>
          <div className="text-[10px] text-gray-500">{new Date(deal.arrival).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-400">
        <div className="flex items-center gap-3">
          <span>{deal.airline}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(deal.duration)}
          </span>
          <span className="capitalize">{deal.cabin}</span>
        </div>
        <span className="text-accent-amber flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Expires: {deal.expiresIn}
        </span>
      </div>
    </div>
  );
}
