/**
 * Generate deep-links to flight search engines with pre-filled parameters.
 * Supports both one-way and round-trip.
 */

export function googleFlightsLink({ origin, destination, departDate, returnDate, cabin = 'economy' }) {
  const base = 'https://www.google.com/travel/flights';
  let url = `${base}?q=flights+from+${origin}+to+${destination}`;
  if (departDate) url += `&d=${departDate}`;
  if (returnDate) url += `&r=${returnDate}`;
  url += '&px=1';
  return url;
}

export function skyscannerLink({ origin, destination, departDate, returnDate, cabin = 'economy' }) {
  const cabinMap = { economy: 'economy', business: 'business', first: 'first' };
  const dep = departDate ? departDate.replace(/-/g, '').slice(2) : '';
  const ret = returnDate ? returnDate.replace(/-/g, '').slice(2) : '';
  const retPart = ret ? `/${ret}` : '';
  return `https://www.skyscanner.com/transport/flights/${origin.toLowerCase()}/${destination.toLowerCase()}/${dep}${retPart}/?adults=1&cabinclass=${cabinMap[cabin]}`;
}

export function kayakLink({ origin, destination, departDate, returnDate, cabin = 'economy' }) {
  const cabinMap = { economy: 'e', business: 'b', first: 'f' };
  const base = 'https://www.kayak.com/flights';
  const ret = returnDate ? `/${returnDate}` : '';
  return `${base}/${origin}-${destination}/${departDate}${ret}?sort=bestflight_a&fs=cabin=${cabinMap[cabin]}`;
}

export function momondoLink({ origin, destination, departDate, returnDate }) {
  const ret = returnDate ? `/${returnDate}` : '';
  return `https://www.momondo.com/flight-search/${origin}-${destination}/${departDate}${ret}?sort=bestflight_a`;
}

export function tripcomLink({ origin, destination, departDate, returnDate, cabin = 'economy' }) {
  const cabinMap = { economy: 'Economy', business: 'Business', first: 'First' };
  let url = `https://www.trip.com/flights/${origin.toLowerCase()}-to-${destination.toLowerCase()}/tickets-${origin.toLowerCase()}-${destination.toLowerCase()}?dcity=${origin}&acity=${destination}&ddate=${departDate}&cabin=${cabinMap[cabin]}`;
  if (returnDate) url += `&rdate=${returnDate}&flighttype=rt`;
  return url;
}

export function generateAllLinks(params) {
  return {
    'Google Flights': googleFlightsLink(params),
    'Skyscanner': skyscannerLink(params),
    'Kayak': kayakLink(params),
    'Trip.com': tripcomLink(params),
    'Momondo': momondoLink(params),
  };
}
