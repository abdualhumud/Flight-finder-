/**
 * Generate deep-links to flight search engines with pre-filled parameters.
 * These work without API keys — great fallback for live search.
 */

/**
 * Google Flights deep-link
 */
export function googleFlightsLink({ origin, destination, departDate, returnDate, cabin = 'economy' }) {
  const cabinMap = { economy: '1', business: '2', first: '3' };
  const base = 'https://www.google.com/travel/flights';
  const params = new URLSearchParams();
  // Google Flights uses hash-based routing
  const dateStr = departDate ? `&d=${departDate}` : '';
  const retStr = returnDate ? `&r=${returnDate}` : '';
  return `${base}?q=flights+from+${origin}+to+${destination}${dateStr}${retStr}&px=1&sc=${cabinMap[cabin] || '1'}`;
}

/**
 * Skyscanner deep-link
 */
export function skyscannerLink({ origin, destination, departDate, returnDate, cabin = 'economy' }) {
  const cabinMap = { economy: 'economy', business: 'business', first: 'first' };
  const depFormatted = departDate ? departDate.replace(/-/g, '').slice(2) : '';
  const retFormatted = returnDate ? returnDate.replace(/-/g, '').slice(2) : '';
  const retPart = retFormatted || '';
  return `https://www.skyscanner.com/transport/flights/${origin.toLowerCase()}/${destination.toLowerCase()}/${depFormatted}/${retPart}/?adults=1&cabinclass=${cabinMap[cabin]}`;
}

/**
 * Kayak deep-link
 */
export function kayakLink({ origin, destination, departDate, returnDate, cabin = 'economy' }) {
  const cabinMap = { economy: 'e', business: 'b', first: 'f' };
  const base = 'https://www.kayak.com/flights';
  if (returnDate) {
    return `${base}/${origin}-${destination}/${departDate}/${returnDate}?sort=bestflight_a&fs=cabin=${cabinMap[cabin]}`;
  }
  return `${base}/${origin}-${destination}/${departDate}?sort=bestflight_a&fs=cabin=${cabinMap[cabin]}`;
}

/**
 * Momondo deep-link
 */
export function momondoLink({ origin, destination, departDate, returnDate }) {
  if (returnDate) {
    return `https://www.momondo.com/flight-search/${origin}-${destination}/${departDate}/${returnDate}?sort=bestflight_a`;
  }
  return `https://www.momondo.com/flight-search/${origin}-${destination}/${departDate}?sort=bestflight_a`;
}

/**
 * Generate all deep-links for a search
 */
export function generateAllLinks(params) {
  return {
    google: googleFlightsLink(params),
    skyscanner: skyscannerLink(params),
    kayak: kayakLink(params),
    momondo: momondoLink(params),
  };
}
