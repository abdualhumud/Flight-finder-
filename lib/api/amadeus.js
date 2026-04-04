/**
 * Amadeus API integration layer.
 * In production, set AMADEUS_API_KEY and AMADEUS_API_SECRET env vars.
 * Falls back to simulated data when API keys are not configured.
 */

const AMADEUS_BASE = 'https://api.amadeus.com';

let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const key = process.env.AMADEUS_API_KEY;
  const secret = process.env.AMADEUS_API_SECRET;

  if (!key || !secret) return null;

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
}

/**
 * Search flights via Amadeus Flight Offers Search API
 */
export async function searchFlights({
  origin, destination, departDate, returnDate, adults = 1, cabin = 'ECONOMY', currency = 'SAR', max = 25,
}) {
  const token = await getAccessToken();
  if (!token) return null; // No API key — caller should use fallback

  const params = new URLSearchParams({
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate: departDate,
    adults: String(adults),
    travelClass: cabin,
    currencyCode: currency,
    max: String(max),
  });

  if (returnDate) params.set('returnDate', returnDate);

  const res = await fetch(`${AMADEUS_BASE}/v2/shopping/flight-offers?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
  const data = await res.json();
  return normalizeAmadeusResults(data);
}

/**
 * Normalize Amadeus response into our standard flight format
 */
function normalizeAmadeusResults(data) {
  if (!data?.data) return [];

  return data.data.map((offer, i) => {
    const seg = offer.itineraries?.[0]?.segments || [];
    const firstSeg = seg[0] || {};
    const lastSeg = seg[seg.length - 1] || {};
    const duration = parseDuration(offer.itineraries?.[0]?.duration || 'PT0H');

    return {
      id: offer.id || `ama-${i}`,
      source: 'amadeus',
      origin: firstSeg.departure?.iataCode || '',
      destination: lastSeg.arrival?.iataCode || '',
      airline: firstSeg.carrierCode || '',
      airlineName: data.dictionaries?.carriers?.[firstSeg.carrierCode] || firstSeg.carrierCode,
      price: parseFloat(offer.price?.total || 0),
      currency: offer.price?.currency || 'SAR',
      departure: firstSeg.departure?.at || '',
      arrival: lastSeg.arrival?.at || '',
      duration,
      stops: Math.max(seg.length - 1, 0),
      cabin: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY',
      bookingClass: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.class || '',
      seatsRemaining: offer.numberOfBookableSeats || null,
      lastTicketingDate: offer.lastTicketingDate || null,
    };
  });
}

function parseDuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  return (parseInt(match[1] || 0) * 60) + parseInt(match[2] || 0);
}
