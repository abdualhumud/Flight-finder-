/**
 * Skyscanner API via RapidAPI (Sky Scrapper)
 * Set NEXT_PUBLIC_RAPIDAPI_KEY env var for live data.
 *
 * This module handles:
 * - Airport/city autocomplete search
 * - Flight search with Point-of-Sale (market) parameter
 * - Price comparison across markets for geo-arbitrage
 */

const RAPIDAPI_HOST = 'sky-scrapper.p.rapidapi.com';

function getHeaders() {
  const key = typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_RAPIDAPI_KEY
    : process.env.RAPIDAPI_KEY;
  if (!key) return null;
  return {
    'x-rapidapi-key': key,
    'x-rapidapi-host': RAPIDAPI_HOST,
  };
}

/**
 * Search airports/cities for autocomplete
 */
export async function searchAirports(query) {
  const headers = getHeaders();
  if (!headers) return null;

  try {
    const res = await fetch(
      `https://${RAPIDAPI_HOST}/api/v1/flights/searchAirport?query=${encodeURIComponent(query)}&locale=en-US`,
      { headers }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.data) return null;

    return data.data.map(item => ({
      entityId: item.entityId,
      skyId: item.skyId,
      name: item.presentation?.title || item.skyId,
      subtitle: item.presentation?.subtitle || '',
      type: item.navigation?.entityType || 'AIRPORT',
      iata: item.skyId,
    }));
  } catch {
    return null;
  }
}

/**
 * Search flights via Skyscanner RapidAPI
 * @param {Object} params
 * @param {string} params.originSkyId - Origin sky ID (e.g. "RIYN" or "RUH")
 * @param {string} params.destinationSkyId - Destination sky ID
 * @param {string} params.originEntityId - Origin entity ID from autocomplete
 * @param {string} params.destinationEntityId - Destination entity ID
 * @param {string} params.date - Departure date YYYY-MM-DD
 * @param {string} [params.returnDate] - Return date YYYY-MM-DD
 * @param {string} [params.cabinClass] - economy|business|first
 * @param {number} [params.adults] - Number of adults
 * @param {string} [params.market] - Market/POS country code (e.g. "SA", "IN", "TR")
 * @param {string} [params.currency] - Currency code (e.g. "SAR", "INR")
 * @param {string} [params.locale] - Locale (e.g. "en-US", "ar-SA")
 */
export async function searchFlights(params) {
  const headers = getHeaders();
  if (!headers) return null;

  const {
    originSkyId, destinationSkyId,
    originEntityId, destinationEntityId,
    date, returnDate,
    cabinClass = 'economy',
    adults = 1,
    market = 'SA',
    currency = 'SAR',
    locale = 'en-US',
  } = params;

  try {
    const url = new URL(`https://${RAPIDAPI_HOST}/api/v2/flights/searchFlightsComplete`);
    url.searchParams.set('originSkyId', originSkyId);
    url.searchParams.set('destinationSkyId', destinationSkyId);
    url.searchParams.set('originEntityId', originEntityId);
    url.searchParams.set('destinationEntityId', destinationEntityId);
    url.searchParams.set('date', date);
    if (returnDate) url.searchParams.set('returnDate', returnDate);
    url.searchParams.set('cabinClass', cabinClass);
    url.searchParams.set('adults', String(adults));
    url.searchParams.set('market', market);
    url.searchParams.set('currency', currency);
    url.searchParams.set('locale', locale);

    const res = await fetch(url.toString(), { headers });
    if (!res.ok) return null;
    const data = await res.json();
    return normalizeSkyscannerResults(data, currency);
  } catch {
    return null;
  }
}

/**
 * Normalize Skyscanner response into our standard format
 */
function normalizeSkyscannerResults(data, currency) {
  if (!data?.data?.itineraries) return [];

  return data.data.itineraries.map((itin, i) => {
    const leg = itin.legs?.[0];
    if (!leg) return null;

    const segments = leg.segments || [];
    const firstSeg = segments[0];
    const lastSeg = segments[segments.length - 1];
    const price = itin.price?.raw || 0;

    return {
      id: `sky-${i}-${Date.now()}`,
      source: 'skyscanner',
      origin: leg.origin?.displayCode || firstSeg?.origin?.displayCode || '',
      destination: leg.destination?.displayCode || lastSeg?.destination?.displayCode || '',
      airline: firstSeg?.marketingCarrier?.name || firstSeg?.operatingCarrier?.name || '',
      airlineName: firstSeg?.marketingCarrier?.name || '',
      airlineCode: firstSeg?.marketingCarrier?.alternateId || '',
      price,
      originalPrice: null,
      currency,
      departure: leg.departure || '',
      arrival: leg.arrival || '',
      duration: leg.durationInMinutes || 0,
      stops: leg.stopCount || 0,
      cabin: 'Economy',
      comfort: 7,
      loyaltyPoints: Math.round(price * 0.7),
      seatsRemaining: null,
      type: 'deal',
      deepLink: itin.price?.url || null,
      score: itin.score || null,
    };
  }).filter(Boolean);
}

/**
 * Search across multiple POS markets for geo-arbitrage
 */
export async function searchMultiMarket(params) {
  const markets = [
    { code: 'SA', currency: 'SAR', label: 'Saudi Arabia', locale: 'en-US' },
    { code: 'IN', currency: 'INR', label: 'India', locale: 'en-IN', vpn: 'Mumbai, India' },
    { code: 'TR', currency: 'TRY', label: 'Turkey', locale: 'tr-TR', vpn: 'Istanbul, Turkey' },
    { code: 'EG', currency: 'EGP', label: 'Egypt', locale: 'en-US', vpn: 'Cairo, Egypt' },
    { code: 'IL', currency: 'ILS', label: 'Israel', locale: 'en-US', vpn: 'Tel Aviv, Israel' },
    { code: 'PK', currency: 'PKR', label: 'Pakistan', locale: 'en-US', vpn: 'Karachi, Pakistan' },
    { code: 'PH', currency: 'PHP', label: 'Philippines', locale: 'en-US', vpn: 'Manila, Philippines' },
    { code: 'US', currency: 'USD', label: 'United States', locale: 'en-US', vpn: 'New York, USA' },
  ];

  const results = await Promise.allSettled(
    markets.map(async (market) => {
      const flights = await searchFlights({
        ...params,
        market: market.code,
        currency: market.currency,
        locale: market.locale,
      });

      return {
        market: market.label,
        countryCode: market.code,
        currency: market.currency,
        vpnLocation: market.vpn || null,
        flights: flights || [],
        cheapestPrice: flights?.[0]?.price || null,
        cheapestFlight: flights?.[0] || null,
      };
    })
  );

  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)
    .sort((a, b) => (a.cheapestPrice || Infinity) - (b.cheapestPrice || Infinity));
}
