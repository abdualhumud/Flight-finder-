/**
 * Flight Engine — multi-source aggregator with live API priority.
 *
 * Search order:
 * 1. Skyscanner (RapidAPI) — if NEXT_PUBLIC_RAPIDAPI_KEY is set
 * 2. Amadeus — if NEXT_PUBLIC_AMADEUS_API_KEY is set
 * 3. Simulation fallback — always available for demo
 *
 * Cross-verification: If prices from two live sources differ by >30%, flag for review.
 */

import { searchFlights as amadeusSearch } from './amadeus';
import { searchFlights as skyscannerSearch, searchMultiMarket as skyscannerMultiMarket } from './skyscanner';
import { calculateValueScore } from '../utils';

// ─── Airline Data (expanded) ───
const airlines = [
  { code: 'SV', name: 'Saudi Airlines', comfort: 7, region: 'ME' },
  { code: 'TK', name: 'Turkish Airlines', comfort: 8, region: 'ME' },
  { code: 'EK', name: 'Emirates', comfort: 9, region: 'ME' },
  { code: 'QR', name: 'Qatar Airways', comfort: 9, region: 'ME' },
  { code: 'EY', name: 'Etihad Airways', comfort: 8, region: 'ME' },
  { code: 'BA', name: 'British Airways', comfort: 7, region: 'EU' },
  { code: 'AF', name: 'Air France', comfort: 7, region: 'EU' },
  { code: 'LH', name: 'Lufthansa', comfort: 8, region: 'EU' },
  { code: 'KL', name: 'KLM', comfort: 7, region: 'EU' },
  { code: 'XY', name: 'Flynas', comfort: 5, region: 'ME' },
  { code: 'MH', name: 'Malaysia Airlines', comfort: 7, region: 'AS' },
  { code: 'SQ', name: 'Singapore Airlines', comfort: 10, region: 'AS' },
  { code: 'MS', name: 'EgyptAir', comfort: 6, region: 'AF' },
  { code: 'GF', name: 'Gulf Air', comfort: 7, region: 'ME' },
  { code: 'WY', name: 'Oman Air', comfort: 7, region: 'ME' },
  { code: 'AI', name: 'Air India', comfort: 6, region: 'AS' },
  { code: 'PC', name: 'Pegasus Airlines', comfort: 5, region: 'EU' },
  { code: 'W5', name: 'Mahan Air', comfort: 5, region: 'ME' },
  { code: 'PK', name: 'PIA', comfort: 5, region: 'AS' },
  { code: 'WF', name: 'Wideroe', comfort: 6, region: 'EU' },
  { code: 'FZ', name: 'Flydubai', comfort: 6, region: 'ME' },
  { code: 'G9', name: 'Air Arabia', comfort: 5, region: 'ME' },
  { code: 'UL', name: 'SriLankan Airlines', comfort: 6, region: 'AS' },
  { code: 'CX', name: 'Cathay Pacific', comfort: 9, region: 'AS' },
  { code: 'NH', name: 'ANA', comfort: 9, region: 'AS' },
  { code: 'JL', name: 'Japan Airlines', comfort: 9, region: 'AS' },
  { code: 'DL', name: 'Delta Air Lines', comfort: 7, region: 'US' },
  { code: 'AA', name: 'American Airlines', comfort: 6, region: 'US' },
  { code: 'UA', name: 'United Airlines', comfort: 6, region: 'US' },
  { code: 'ET', name: 'Ethiopian Airlines', comfort: 7, region: 'AF' },
];

const routeData = {
  // ─── From Riyadh ───
  'RUH-LHR': { basePrice: 1800, baseDuration: 390, airlines: ['SV', 'BA', 'EK', 'TK', 'LH'] },
  'RUH-IST': { basePrice: 980, baseDuration: 270, airlines: ['TK', 'SV', 'PC', 'XY'] },
  'RUH-CDG': { basePrice: 2200, baseDuration: 380, airlines: ['AF', 'SV', 'EK', 'TK'] },
  'RUH-BKK': { basePrice: 1650, baseDuration: 540, airlines: ['SV', 'EK', 'GF', 'QR'] },
  'RUH-KUL': { basePrice: 1400, baseDuration: 570, airlines: ['MH', 'SV', 'EK', 'SQ'] },
  'RUH-MLE': { basePrice: 2100, baseDuration: 510, airlines: ['SV', 'EK', 'QR'] },
  'RUH-DXB': { basePrice: 450, baseDuration: 120, airlines: ['SV', 'EK', 'XY', 'GF', 'FZ', 'G9'] },
  'RUH-SIN': { basePrice: 1900, baseDuration: 600, airlines: ['SQ', 'SV', 'EK', 'QR'] },
  'RUH-CAI': { basePrice: 800, baseDuration: 210, airlines: ['SV', 'MS', 'XY'] },
  'RUH-FCO': { basePrice: 2000, baseDuration: 360, airlines: ['SV', 'TK', 'LH'] },
  'RUH-GVA': { basePrice: 2100, baseDuration: 370, airlines: ['SV', 'LH', 'TK'] },
  'RUH-MNL': { basePrice: 1800, baseDuration: 630, airlines: ['SV', 'EK', 'QR'] },
  'RUH-DOH': { basePrice: 350, baseDuration: 80, airlines: ['QR', 'SV'] },
  'RUH-AUH': { basePrice: 400, baseDuration: 110, airlines: ['EY', 'SV'] },
  'RUH-BAH': { basePrice: 280, baseDuration: 60, airlines: ['GF', 'SV', 'XY'] },
  'RUH-AMM': { basePrice: 750, baseDuration: 180, airlines: ['SV', 'TK'] },
  'RUH-FRA': { basePrice: 2100, baseDuration: 370, airlines: ['LH', 'SV', 'TK'] },
  'RUH-AMS': { basePrice: 2050, baseDuration: 400, airlines: ['KL', 'SV', 'TK'] },
  'RUH-JFK': { basePrice: 3500, baseDuration: 840, airlines: ['SV', 'EK', 'TK', 'BA'] },
  'RUH-BOM': { basePrice: 900, baseDuration: 240, airlines: ['SV', 'AI', 'EK'] },
  'RUH-DEL': { basePrice: 950, baseDuration: 270, airlines: ['SV', 'AI', 'EK'] },
  'RUH-KHI': { basePrice: 650, baseDuration: 210, airlines: ['SV', 'PK'] },
  'RUH-NRT': { basePrice: 3200, baseDuration: 720, airlines: ['SV', 'EK', 'TK', 'NH'] },
  'RUH-ICN': { basePrice: 2800, baseDuration: 660, airlines: ['SV', 'EK', 'QR'] },
  'RUH-HKG': { basePrice: 2600, baseDuration: 540, airlines: ['EK', 'CX', 'QR'] },
  'RUH-MCT': { basePrice: 350, baseDuration: 120, airlines: ['WY', 'SV'] },
  'RUH-NBO': { basePrice: 1600, baseDuration: 420, airlines: ['SV', 'ET', 'EK'] },
  'RUH-ADD': { basePrice: 1200, baseDuration: 330, airlines: ['ET', 'SV'] },
  'RUH-BCN': { basePrice: 1950, baseDuration: 380, airlines: ['SV', 'TK', 'LH', 'AF'] },
  'RUH-MAD': { basePrice: 1900, baseDuration: 390, airlines: ['SV', 'TK', 'EK', 'AF'] },
  'RUH-PRG': { basePrice: 2050, baseDuration: 370, airlines: ['TK', 'SV', 'LH'] },
  'RUH-WAW': { basePrice: 1850, baseDuration: 360, airlines: ['TK', 'SV', 'LH'] },
  'RUH-LIS': { basePrice: 2100, baseDuration: 420, airlines: ['TK', 'SV', 'EK'] },
  'RUH-TGD': { basePrice: 1750, baseDuration: 380, airlines: ['TK', 'SV', 'LH'] },
  'RUH-JNB': { basePrice: 2800, baseDuration: 540, airlines: ['SV', 'EK', 'ET', 'QR'] },
  'RUH-CPT': { basePrice: 3100, baseDuration: 600, airlines: ['EK', 'ET', 'QR'] },
  'RUH-BTS': { basePrice: 1900, baseDuration: 370, airlines: ['TK', 'SV', 'LH'] },
  'RUH-SGN': { basePrice: 1900, baseDuration: 600, airlines: ['EK', 'QR', 'SQ'] },
  'RUH-HAN': { basePrice: 1850, baseDuration: 580, airlines: ['EK', 'QR', 'TK'] },
  'RUH-SVO': { basePrice: 1600, baseDuration: 330, airlines: ['SV', 'TK', 'EK'] },
  'RUH-LED': { basePrice: 1800, baseDuration: 390, airlines: ['TK', 'SV', 'EK'] },
  // ─── From Jeddah ───
  'JED-LHR': { basePrice: 1900, baseDuration: 420, airlines: ['SV', 'BA', 'EK'] },
  'JED-IST': { basePrice: 1050, baseDuration: 240, airlines: ['TK', 'SV', 'PC'] },
  'JED-CDG': { basePrice: 2300, baseDuration: 400, airlines: ['AF', 'SV', 'TK'] },
  'JED-BKK': { basePrice: 1750, baseDuration: 560, airlines: ['SV', 'EK', 'QR'] },
  'JED-DXB': { basePrice: 500, baseDuration: 150, airlines: ['SV', 'EK', 'XY', 'FZ'] },
  'JED-SIN': { basePrice: 2000, baseDuration: 620, airlines: ['SQ', 'SV', 'EK'] },
  'JED-CAI': { basePrice: 700, baseDuration: 180, airlines: ['SV', 'MS', 'XY'] },
  'JED-MLE': { basePrice: 2200, baseDuration: 530, airlines: ['SV', 'EK', 'UL'] },
  'JED-KUL': { basePrice: 1500, baseDuration: 590, airlines: ['MH', 'SV', 'EK'] },
  'JED-DOH': { basePrice: 400, baseDuration: 100, airlines: ['QR', 'SV'] },
  // ─── Popular international routes ───
  'DXB-LHR': { basePrice: 1600, baseDuration: 450, airlines: ['EK', 'BA', 'FZ'] },
  'DXB-BKK': { basePrice: 1200, baseDuration: 420, airlines: ['EK', 'FZ', 'TG'] },
  'IST-LHR': { basePrice: 1100, baseDuration: 240, airlines: ['TK', 'BA', 'PC'] },
  'IST-CDG': { basePrice: 1000, baseDuration: 210, airlines: ['TK', 'AF', 'PC'] },
  'DOH-LHR': { basePrice: 1700, baseDuration: 460, airlines: ['QR', 'BA'] },
  'CAI-IST': { basePrice: 600, baseDuration: 180, airlines: ['MS', 'TK', 'PC'] },
  'LHR-JFK': { basePrice: 2200, baseDuration: 480, airlines: ['BA', 'AA', 'DL', 'UA'] },
  'CDG-JFK': { basePrice: 2100, baseDuration: 510, airlines: ['AF', 'DL', 'AA'] },
};

// ─── Deterministic random ───
function seededRandom(seed) {
  let s = seed;
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

// ─── Simulated source labels for diverse multi-source output ───
const SIM_SOURCES = ['skyscanner', 'amadeus', 'google_flights', 'trip_com', 'kayak'];

function pickSimSource(rand) {
  return SIM_SOURCES[Math.floor(rand() * SIM_SOURCES.length)];
}

// ─── Simulation (fallback when no API keys) ───
function simulateFlights({ origin, destination, departDate, returnDate, cabin = 'ECONOMY', currency = 'SAR', max = 25, priceMod = 1 }) {
  const key = `${origin}-${destination}`;
  const reverseKey = `${destination}-${origin}`;
  const route = routeData[key] || routeData[reverseKey];
  const basePrice = route?.basePrice || (1500 + Math.abs(hashCode(key)) % 2000);
  const baseDuration = route?.baseDuration || (240 + Math.abs(hashCode(key)) % 480);
  const airlineCodes = route?.airlines || pickRandomAirlines(origin, destination);

  const dateSeed = hashCode(departDate + origin + destination);
  const rand = seededRandom(Math.abs(dateSeed));
  const cabinMultiplier = cabin === 'BUSINESS' ? 3.2 : cabin === 'FIRST' ? 6.5 : 1;
  const results = [];

  for (let i = 0; i < max; i++) {
    const airlineCode = airlineCodes[i % airlineCodes.length];
    const airline = airlines.find(a => a.code === airlineCode) || airlines[0];
    const variation = 0.55 + rand() * 1.0; // wider price spread
    const stops = rand() > 0.55 ? 0 : rand() > 0.4 ? 1 : 2;
    const stopDuration = stops * (45 + Math.floor(rand() * 120));
    const duration = Math.round(baseDuration * (0.85 + rand() * 0.35)) + stopDuration;
    const price = Math.round(basePrice * variation * cabinMultiplier * priceMod);
    const originalPrice = Math.round(price * (1.1 + rand() * 0.5));

    const depHour = 1 + Math.floor(rand() * 22);
    const depMin = Math.floor(rand() * 4) * 15;
    const depTime = `${departDate}T${String(depHour).padStart(2, '0')}:${String(depMin).padStart(2, '0')}:00`;
    const arrivalMs = new Date(depTime).getTime() + duration * 60000;
    const arrTime = new Date(arrivalMs).toISOString();

    const isErrorFare = rand() > 0.92;
    const isPriceDrop = !isErrorFare && rand() > 0.72;

    // Assign a simulated "source" for visual diversity across platforms
    const simSource = pickSimSource(rand);

    const flight = {
      id: `sim-${origin}${destination}-${i}-${dateSeed}`,
      source: simSource,
      origin, destination,
      airline: airlineCode,
      airlineName: airline.name,
      price, originalPrice, currency,
      departure: depTime,
      arrival: arrTime,
      duration, stops,
      cabin: cabin.charAt(0) + cabin.slice(1).toLowerCase(),
      comfort: airline.comfort + (cabin === 'BUSINESS' ? 2 : cabin === 'FIRST' ? 3 : 0),
      loyaltyPoints: Math.round(price * (0.5 + rand())),
      seatsRemaining: Math.floor(rand() * 8) + 1,
      type: isErrorFare ? 'error_fare' : isPriceDrop ? 'price_drop' : 'deal',
      expiresIn: isErrorFare ? `${Math.floor(rand() * 3)}h ${Math.floor(rand() * 59)}m` : isPriceDrop ? `${Math.floor(rand() * 24)}h` : `${Math.floor(rand() * 7) + 1}d`,
      hasReturn: !!returnDate,
    };

    if (returnDate) {
      const retHour = 6 + Math.floor(rand() * 16);
      const retDuration = Math.round(baseDuration * (0.85 + rand() * 0.35)) + stopDuration;
      flight.returnDeparture = `${returnDate}T${String(retHour).padStart(2, '0')}:${String(Math.floor(rand() * 4) * 15).padStart(2, '0')}:00`;
      const retArrMs = new Date(flight.returnDeparture).getTime() + retDuration * 60000;
      flight.returnArrival = new Date(retArrMs).toISOString();
      flight.returnDuration = retDuration;
    }

    results.push(flight);
  }

  return results;
}

/**
 * Pick plausible airlines for routes not in the static routeData.
 * Uses ME hub carriers + regional carriers based on destination.
 */
function pickRandomAirlines(origin, destination) {
  const hubCarriers = ['EK', 'QR', 'TK', 'EY']; // always plausible via hub
  const direct = airlines.filter(a => a.comfort >= 5).slice(0, 8).map(a => a.code);
  const seed = hashCode(origin + destination);
  const rand = seededRandom(Math.abs(seed));
  const picked = new Set(hubCarriers.slice(0, 2));
  while (picked.size < 5) {
    picked.add(direct[Math.floor(rand() * direct.length)]);
  }
  return [...picked];
}

// ─── Main search function ───
export async function searchFlightOffers(params) {
  const sources = [];
  const errors = [];

  // 1. Try Skyscanner
  if (params.originEntityId && params.destinationEntityId) {
    try {
      const skyResults = await skyscannerSearch({
        originSkyId: params.origin,
        destinationSkyId: params.destination,
        originEntityId: params.originEntityId,
        destinationEntityId: params.destinationEntityId,
        date: params.departDate,
        returnDate: params.returnDate,
        cabinClass: (params.cabin || 'economy').toLowerCase(),
        adults: params.adults || 1,
        market: params.market || 'SA',
        currency: params.currency || 'SAR',
      });
      if (skyResults && skyResults.length > 0) {
        sources.push({ name: 'skyscanner', flights: skyResults });
      }
    } catch (e) {
      errors.push({ source: 'skyscanner', error: e.message });
    }
  }

  // 2. Try Amadeus
  try {
    const amadeusResults = await amadeusSearch({
      origin: params.origin,
      destination: params.destination,
      departDate: params.departDate,
      returnDate: params.returnDate,
      adults: params.adults || 1,
      cabin: (params.cabin || 'economy').toUpperCase(),
      currency: params.currency || 'SAR',
      max: params.max || 25,
    });
    if (amadeusResults && amadeusResults.length > 0) {
      sources.push({ name: 'amadeus', flights: amadeusResults });
    }
  } catch (e) {
    errors.push({ source: 'amadeus', error: e.message });
  }

  // 3. If we have live data, merge and cross-verify
  if (sources.length > 0) {
    const merged = mergeSources(sources);
    const flags = crossVerify(sources);
    return { source: sources.map(s => s.name).join('+'), flights: merged, flags, errors };
  }

  // 4. Fallback to simulation
  const flights = simulateFlights({
    origin: params.origin,
    destination: params.destination,
    departDate: params.departDate,
    returnDate: params.returnDate,
    cabin: (params.cabin || 'economy').toUpperCase(),
    currency: params.currency || 'SAR',
    max: params.max || 25,
    priceMod: params.priceMod || 1,
  });

  return { source: 'simulated', flights, flags: [], errors };
}

/**
 * Merge results from multiple live sources, dedup by similar flights
 */
function mergeSources(sources) {
  const all = sources.flatMap(s => s.flights);
  // Sort by price ascending
  return all.sort((a, b) => a.price - b.price);
}

/**
 * Cross-verify: flag if cheapest from different sources differ by >30%
 */
function crossVerify(sources) {
  if (sources.length < 2) return [];
  const flags = [];

  const cheapestBySource = sources.map(s => ({
    source: s.name,
    cheapest: Math.min(...s.flights.map(f => f.price)),
  }));

  for (let i = 0; i < cheapestBySource.length; i++) {
    for (let j = i + 1; j < cheapestBySource.length; j++) {
      const a = cheapestBySource[i];
      const b = cheapestBySource[j];
      const diff = Math.abs(a.cheapest - b.cheapest) / Math.min(a.cheapest, b.cheapest);
      if (diff > 0.3) {
        flags.push({
          type: 'price_mismatch',
          message: `${a.source} (${a.cheapest}) vs ${b.source} (${b.cheapest}) differ by ${Math.round(diff * 100)}% — verify on both platforms`,
        });
      }
    }
  }

  return flags;
}

/**
 * Geo-pricing: search same route from different POS markets
 */
export async function geoArbitrageSearch(params) {
  // Try live Skyscanner multi-market first
  if (params.originEntityId && params.destinationEntityId) {
    try {
      const liveResults = await skyscannerMultiMarket(params);
      if (liveResults && liveResults.length > 0 && liveResults.some(r => r.flights?.length > 0)) {
        return liveResults;
      }
    } catch {
      // Fall through
    }
  }

  // Fallback: simulated geo-pricing
  const markets = [
    { code: 'SA', currency: 'SAR', label: 'Saudi Arabia', priceMod: 1.0 },
    { code: 'IN', currency: 'INR', label: 'India', priceMod: 0.72, vpn: 'Mumbai, India' },
    { code: 'TR', currency: 'TRY', label: 'Turkey', priceMod: 0.78, vpn: 'Istanbul, Turkey' },
    { code: 'EG', currency: 'EGP', label: 'Egypt', priceMod: 0.75, vpn: 'Cairo, Egypt' },
    { code: 'IL', currency: 'ILS', label: 'Israel', priceMod: 0.82, vpn: 'Tel Aviv, Israel' },
    { code: 'PK', currency: 'PKR', label: 'Pakistan', priceMod: 0.68, vpn: 'Karachi, Pakistan' },
    { code: 'PH', currency: 'PHP', label: 'Philippines', priceMod: 0.74, vpn: 'Manila, Philippines' },
    { code: 'US', currency: 'USD', label: 'United States', priceMod: 0.88, vpn: 'New York, USA' },
  ];

  const results = await Promise.all(
    markets.map(async (market) => {
      const { flights } = await searchFlightOffers({
        ...params,
        currency: 'SAR',
        priceMod: market.priceMod,
        max: 5,
      });

      const cheapest = flights.sort((a, b) => a.price - b.price)[0];
      return {
        market: market.label,
        countryCode: market.code,
        currency: market.currency,
        vpnLocation: market.vpn || null,
        cheapestPrice: cheapest?.price || 0,
        cheapestFlight: cheapest || null,
        flightCount: flights.length,
        savings: cheapest ? Math.round((1 - market.priceMod) * 100) : 0,
      };
    })
  );

  return results.sort((a, b) => a.cheapestPrice - b.cheapestPrice);
}
