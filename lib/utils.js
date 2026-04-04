import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Value Score: (Comfort + LoyaltyPoints/100) / (Price * Duration/60)
 * Higher = better value
 */
export function calculateValueScore({ comfort = 5, loyaltyPoints = 0, price = 1, duration = 1 }) {
  const raw = (comfort + loyaltyPoints / 100) / (price * (duration / 60));
  return Math.round(raw * 10000) / 100;
}

export function getValueRating(score) {
  if (score >= 8) return { label: 'Exceptional', color: 'text-accent-green', bg: 'bg-accent-green/10' };
  if (score >= 5) return { label: 'Great Value', color: 'text-brand-400', bg: 'bg-brand-400/10' };
  if (score >= 3) return { label: 'Good', color: 'text-accent-amber', bg: 'bg-accent-amber/10' };
  return { label: 'Fair', color: 'text-gray-400', bg: 'bg-gray-700/30' };
}

export function formatPrice(amount, currency = 'SAR') {
  return new Intl.NumberFormat('en-SA', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m > 0 ? `${m}m` : ''}`.trim();
}
