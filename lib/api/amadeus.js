/**
 * Amadeus API integration layer.
 * Set NEXT_PUBLIC_AMADEUS_API_KEY and NEXT_PUBLIC_AMADEUS_API_SECRET for live data.
 *
 * Supports:
 * - OAuth2 token management with auto-refresh
 * - Flight Offers Search (one-way and round-trip)
 * - Airport & City Search (autocomplete)
 * - Point-of-Sale market adjustment
 */

const AMADEUS_BASE = 'https://api.amadeus.com';

let cachedToken = null;
let tokenExpiry = 0;

function getCredentials() {
  const key = typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_AMADEUS_API_KEY
    : process.env.AMADEUS_API_KEY;
  const secret = typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_AMADEUS_API_SECRET
    : process.env.AMADEUS_API_SECRET;
  return { key, secret };
}

export async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const { key, secret } = getCredentials();
  if (!key || !secret) return null;

  try {
    const res = await fetch(`${AMADEUS_BASE}/v1/security/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${key}&client_secret=${secret}`,
    });

    if (!res.ok) return null;
    const data = await res.json();
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return cachedToken;
  } catch {
    return null;
  }
}

/**
 * Search airports/cities via Amadeus Location API
 */
export async function searchLocations(query) {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const params = new URLSearchParams({
      subType: 'AIRPORT,CITY',
      keyword: query,
      'page[limit]': '10',
    });

    const res = await fetch(`${AMADEUS_BASE}/v1/reference-data/locations?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return null;
    const data = await res.json();

    return (data.data || []).map(loc => ({
      iata: loc.iataCode,
      name: loc.name,
      city: loc.address?.cityName || '',
      country: loc.address?.countryCode || '',
      type: loc.subType,
      subtitle: `${loc.address?.cityName || ''}, ${loc.address?.countryCode || ''}`,
    }));
  } catch {
    return null;
  }
}

/**
 * Search flights via Amadeus Flight Offers Search API
 * Supports both one-way and round-trip
 */
export async function searchFlights({
  origin, destination, departDate, returnDate,
  adults = 1, cabin = 'ECONOMY', currency = 'SAR', max = 25,
}) {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const params = new URLSearchParams({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: departDate,
      adults: String(adults),
      travelClass: cabin,
      currencyCode: currency,
      max: String(max),
      nonStop: 'false',
    });

    if (returnDate) params.set('returnDate', returnDate);

    const res = await fetch(`${AMADEUS_BASE}/v2/shopping/flight-offers?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return normalizeAmadeusResults(data);
  } catch {
    return null;
  }
}

/**
 * Normalize Amadeus response into our standard flight format
 */
function normalizeAmadeusResults(data) {
  if (!data?.data) return [];

  return data.data.map((offer, i) => {
    const outbound = offer.itineraries?.[0];
    const inbound = offer.itineraries?.[1]; // null for one-way
    const seg = outbound?.segments || [];
    const firstSeg = seg[0] || {};
    const lastSeg = seg[seg.length - 1] || {};
    const duration = parseDuration(outbound?.duration || 'PT0H');

    return {
      id: offer.id || `ama-${i}`,
      source: 'amadeus',
      origin: firstSeg.departure?.iataCode || '',
      destination: lastSeg.arrival?.iataCode || '',
      airline: firstSeg.carrierCode || '',
      airlineName: data.dictionaries?.carriers?.[firstSeg.carrierCode] || firstSeg.carrierCode,
      price: parseFloat(offer.price?.total || 0),
      originalPrice: null,
      currency: offer.price?.currency || 'SAR',
      departure: firstSeg.departure?.at || '',
      arrival: lastSeg.arrival?.at || '',
      duration,
      stops: Math.max(seg.length - 1, 0),
      cabin: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY',
      bookingClass: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.class || '',
      seatsRemaining: offer.numberOfBookableSeats || null,
      lastTicketingDate: offer.lastTicketingDate || null,
      comfort: 7,
      loyaltyPoints: Math.round(parseFloat(offer.price?.total || 0) * 0.6),
      type: 'deal',
      hasReturn: !!inbound,
      returnDeparture: inbound?.segments?.[0]?.departure?.at || null,
      returnArrival: inbound?.segments?.[inbound.segments.length - 1]?.arrival?.at || null,
      returnDuration: inbound ? parseDuration(inbound.duration || 'PT0H') : null,
    };
  });
}

function parseDuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  return (parseInt(match[1] || 0) * 60) + parseInt(match[2] || 0);
}
