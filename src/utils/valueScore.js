/**
 * Value Score Algorithm: Value = (Comfort + LoyaltyPoints) / (Price * Duration)
 * Higher score = better value deal
 */
export function calculateValueScore(flight) {
  const comfort = flight.comfort || 5;
  const loyaltyPoints = flight.loyaltyPoints || 0;
  const price = flight.price || 1;
  const duration = flight.duration || 1;

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
  return new Intl.NumberFormat('en-SA', { style: 'currency', currency }).format(amount);
}

export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}
