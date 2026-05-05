/**
 * Multi-source flight searcher.
 * Tries: Skyscanner (RapidAPI) → Amadeus → Simulation fallback.
 * Each source is independent — a failure in one does not block the others.
 */

const RAPIDAPI_HOST = 'sky-scrapper.p.rapidapi.com';
const AMADEUS_BASE = 'https://api.amadeus.com';

let amadeusToken = null;
let amadeusTokenExpiry = 0;

// ─── Skyscanner ───

async function searchSkyscanner(origin, dest, departDate) {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) return null;

  const url = new URL(`https://${RAPIDAPI_HOST}/api/v2/flights/searchFlightsComplete`);
  url.searchParams.set('originSkyId', origin.skyId);
  url.searchParams.set('destinationSkyId', dest.skyId);
  url.searchParams.set('originEntityId', origin.entityId);
  url.searchParams.set('destinationEntityId', dest.entityId);
  url.searchParams.set('date', departDate);
  url.searchParams.set('cabinClass', 'economy');
  url.searchParams.set('adults', '1');
  url.searchParams.set('market', 'SA');
  url.searchParams.set('currency', 'SAR');

  const res = await fetch(url.toString(), {
    headers: { 'x-rapidapi-key': key, 'x-rapidapi-host': RAPIDAPI_HOST },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.data?.itineraries?.length) return null;

  return data.data.itineraries.map((itin, i) => {
    const leg = itin.legs?.[0];
    if (!leg) return null;
    const seg = leg.segments?.[0];
    return {
      source: 'Skyscanner',
      price: itin.price?.raw || 0,
      currency: 'SAR',
      airline: seg?.marketingCarrier?.name || seg?.operatingCarrier?.name || 'Unknown',
      duration: leg.durationInMinutes || 0,
      stops: leg.stopCount || 0,
      departure: leg.departure || '',
      arrival: leg.arrival || '',
      deepLink: itin.price?.url || null,
    };
  }).filter(Boolean);
}

// ─── Amadeus ───

async function getAmadeusToken() {
  if (amadeusToken && Date.now() < amadeusTokenExpiry) return amadeusToken;

  const key = process.env.AMADEUS_API_KEY;
  const secret = process.env.AMADEUS_API_SECRET;
  if (!key || !secret) return null;

  const res = await fetch(`${AMADEUS_BASE}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${key}&client_secret=${secret}`,
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return null;
  const data = await res.json();
  amadeusToken = data.access_token;
  amadeusTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return amadeusToken;
}

async function searchAmadeus(origin, dest, departDate) {
  const token = await getAmadeusToken();
  if (!token) return null;

  const params = new URLSearchParams({
    originLocationCode: origin.code,
    destinationLocationCode: dest.code,
    departureDate: departDate,
    adults: '1',
    travelClass: 'ECONOMY',
    currencyCode: 'SAR',
    max: '10',
    nonStop: 'false',
  });

  const res = await fetch(`${AMADEUS_BASE}/v2/shopping/flight-offers?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.data?.length) return null;

  return data.data.map(offer => {
    const outbound = offer.itineraries?.[0];
    const segs = outbound?.segments || [];
    const firstSeg = segs[0] || {};
    const lastSeg = segs[segs.length - 1] || {};
    const durationMatch = (outbound?.duration || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    const duration = durationMatch
      ? (parseInt(durationMatch[1] || 0) * 60) + parseInt(durationMatch[2] || 0)
      : 0;

    return {
      source: 'Amadeus',
      price: parseFloat(offer.price?.total || 0),
      currency: offer.price?.currency || 'SAR',
      airline: data.dictionaries?.carriers?.[firstSeg.carrierCode] || firstSeg.carrierCode || 'Unknown',
      duration,
      stops: Math.max(segs.length - 1, 0),
      departure: firstSeg.departure?.at || '',
      arrival: lastSeg.arrival?.at || '',
      deepLink: null,
    };
  });
}

// ─── Simulation (deterministic fallback) ───

const ROUTE_DATA = {
  'RUH-AMS': { basePrice: 2050, baseDuration: 400, airlines: ['KLM', 'Turkish Airlines', 'Saudi Airlines'] },
  'RUH-BCN': { basePrice: 1950, baseDuration: 380, airlines: ['Turkish Airlines', 'Saudi Airlines', 'Lufthansa'] },
  'RUH-MAD': { basePrice: 1900, baseDuration: 390, airlines: ['Turkish Airlines', 'Saudi Airlines', 'Emirates'] },
  'RUH-PRG': { basePrice: 2050, baseDuration: 370, airlines: ['Turkish Airlines', 'Saudi Airlines', 'Lufthansa'] },
  'RUH-WAW': { basePrice: 1850, baseDuration: 360, airlines: ['Turkish Airlines', 'Saudi Airlines', 'Lufthansa'] },
  'RUH-LIS': { basePrice: 2100, baseDuration: 420, airlines: ['Turkish Airlines', 'Saudi Airlines', 'Emirates'] },
  'RUH-TGD': { basePrice: 1750, baseDuration: 380, airlines: ['Turkish Airlines', 'Saudi Airlines'] },
  'RUH-JNB': { basePrice: 2800, baseDuration: 540, airlines: ['Saudi Airlines', 'Emirates', 'Ethiopian'] },
  'RUH-CPT': { basePrice: 3100, baseDuration: 600, airlines: ['Emirates', 'Ethiopian', 'Qatar Airways'] },
  'RUH-BTS': { basePrice: 1900, baseDuration: 370, airlines: ['Turkish Airlines', 'Saudi Airlines', 'Lufthansa'] },
  'RUH-SGN': { basePrice: 1900, baseDuration: 600, airlines: ['Emirates', 'Qatar Airways', 'Singapore Airlines'] },
  'RUH-HAN': { basePrice: 1850, baseDuration: 580, airlines: ['Emirates', 'Qatar Airways', 'Turkish Airlines'] },
  'RUH-BKK': { basePrice: 1650, baseDuration: 540, airlines: ['Saudi Airlines', 'Emirates', 'Gulf Air'] },
  'RUH-LHR': { basePrice: 1800, baseDuration: 390, airlines: ['Saudi Airlines', 'British Airways', 'Emirates'] },
  'RUH-SVO': { basePrice: 1600, baseDuration: 330, airlines: ['Saudi Airlines', 'Turkish Airlines', 'Emirates'] },
};

function seededRandom(seed) {
  let s = Math.abs(seed) || 1;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function simulateFlights(origin, dest, departDate) {
  const key = `${origin.code}-${dest.code}`;
  const route = ROUTE_DATA[key] || { basePrice: 2000, baseDuration: 400, airlines: ['Emirates', 'Turkish Airlines'] };
  const rand = seededRandom(Math.abs(hashCode(departDate + key)));

  const results = [];
  for (let i = 0; i < 5; i++) {
    const variation = 0.55 + rand() * 1.0;
    const stops = rand() > 0.55 ? 0 : rand() > 0.4 ? 1 : 2;
    const stopExtra = stops * (45 + Math.floor(rand() * 120));
    const duration = Math.round(route.baseDuration * (0.85 + rand() * 0.35)) + stopExtra;
    const price = Math.round(route.basePrice * variation);

    const depHour = 1 + Math.floor(rand() * 22);
    const depMin = Math.floor(rand() * 4) * 15;
    const depTime = `${departDate}T${String(depHour).padStart(2, '0')}:${String(depMin).padStart(2, '0')}:00`;
    const arrTime = new Date(new Date(depTime).getTime() + duration * 60000).toISOString();

    results.push({
      source: 'Simulated',
      price,
      currency: 'SAR',
      airline: route.airlines[i % route.airlines.length],
      duration,
      stops,
      departure: depTime,
      arrival: arrTime,
      deepLink: null,
    });
  }

  return results;
}

// ─── Deep link generators ───

function googleFlightsLink(origin, dest, date) {
  return `https://www.google.com/travel/flights?q=flights+from+${origin}+to+${dest}&d=${date}&px=1`;
}

function skyscannerLink(origin, dest, date) {
  const dep = date.replace(/-/g, '').slice(2);
  return `https://www.skyscanner.com/transport/flights/${origin.toLowerCase()}/${dest.toLowerCase()}/${dep}/?adults=1&cabinclass=economy`;
}

function tripcomLink(origin, dest, date) {
  return `https://www.trip.com/flights/${origin.toLowerCase()}-to-${dest.toLowerCase()}/tickets-${origin.toLowerCase()}-${dest.toLowerCase()}?dcity=${origin}&acity=${dest}&ddate=${date}&cabin=Economy`;
}

// ─── Public API ───

/**
 * Search a single destination across all sources.
 * Returns { destination, cheapest, allResults, links, error? }
 */
export async function searchDestination(origin, dest, departDate) {
  const results = [];
  const errors = [];

  // 1. Skyscanner
  try {
    const sky = await searchSkyscanner(origin, dest, departDate);
    if (sky?.length) results.push(...sky);
  } catch (e) {
    errors.push(`Skyscanner: ${e.message}`);
  }

  // 2. Amadeus
  try {
    const ama = await searchAmadeus(origin, dest, departDate);
    if (ama?.length) results.push(...ama);
  } catch (e) {
    errors.push(`Amadeus: ${e.message}`);
  }

  // 3. Simulation fallback
  if (results.length === 0) {
    results.push(...simulateFlights(origin, dest, departDate));
  }

  results.sort((a, b) => a.price - b.price);
  const cheapest = results[0] || null;

  const links = {
    'Google Flights': googleFlightsLink(origin.code, dest.code, departDate),
    'Skyscanner': skyscannerLink(origin.code, dest.code, departDate),
    'Trip.com': tripcomLink(origin.code, dest.code, departDate),
  };

  return {
    destination: dest,
    cheapest,
    allResults: results,
    links,
    errors: errors.length ? errors : undefined,
  };
}

/**
 * Search ALL destinations in parallel.
 * @param {object} origin - Origin airport
 * @param {object[]} destinations - Destination list
 * @param {string[]} dates - Array of YYYY-MM-DD dates to scan
 */
export async function searchAllDestinations(origin, destinations, dates) {
  const tasks = destinations.map(async (dest) => {
    let bestResult = null;

    for (const date of dates) {
      try {
        const result = await searchDestination(origin, dest, date);
        if (!bestResult || (result.cheapest && result.cheapest.price < bestResult.cheapest?.price)) {
          bestResult = { ...result, bestDate: date };
        }
      } catch (e) {
        console.error(`  [ERROR] ${dest.code} on ${date}: ${e.message}`);
      }
    }

    return bestResult || {
      destination: dest,
      cheapest: null,
      allResults: [],
      links: {},
      errors: ['All searches failed'],
    };
  });

  return Promise.all(tasks);
}
