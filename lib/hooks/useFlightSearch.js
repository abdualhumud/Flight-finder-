'use client';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { searchFlightOffers, geoArbitrageSearch } from '../api/flightEngine';
import { searchAirports as skySearchAirports } from '../api/skyscanner';
import { searchLocations as amadeusSearchLocations } from '../api/amadeus';
import { airports as staticAirports } from '../../data/airports';

/**
 * Hook for airport autocomplete search
 * Tries Skyscanner → Amadeus → static fallback
 */
export function useAirportSearch(query) {
  return useQuery({
    queryKey: ['airports', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      // Try Skyscanner
      const skyResults = await skySearchAirports(query);
      if (skyResults && skyResults.length > 0) return skyResults;

      // Try Amadeus
      const amResults = await amadeusSearchLocations(query);
      if (amResults && amResults.length > 0) {
        return amResults.map(a => ({
          entityId: a.iata,
          skyId: a.iata,
          name: `${a.name} (${a.iata})`,
          subtitle: a.subtitle,
          type: a.type,
          iata: a.iata,
        }));
      }

      // Fallback to static
      const q = query.toUpperCase();
      return staticAirports
        .filter(a => a.code.includes(q) || a.city.toUpperCase().includes(q) || a.name.toUpperCase().includes(q))
        .map(a => ({
          entityId: a.code,
          skyId: a.code,
          name: `${a.name} (${a.code})`,
          subtitle: `${a.city}, ${a.country}`,
          type: 'AIRPORT',
          iata: a.code,
        }));
    },
    enabled: !!query && query.length >= 2,
    staleTime: 10 * 60 * 1000, // 10 min cache
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook for searching flights with TanStack Query
 */
export function useFlightSearch(params, options = {}) {
  return useQuery({
    queryKey: ['flights', params],
    queryFn: () => searchFlightOffers(params),
    enabled: !!params?.origin && !!params?.destination && !!params?.departDate,
    staleTime: 5 * 60 * 1000, // 5 min cache
    ...options,
  });
}

/**
 * Hook for infinite scroll flight loading
 */
export function useInfiniteFlights(params, options = {}) {
  return useInfiniteQuery({
    queryKey: ['flights-infinite', params],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await searchFlightOffers({ ...params, max: 10 });
      return {
        ...result,
        flights: result.flights.map((f, i) => ({
          ...f,
          id: `${f.id}-page${pageParam}-${i}`,
          price: Math.round(f.price * (1 + pageParam * 0.03)),
        })),
        nextPage: pageParam + 1,
        hasMore: pageParam < 4,
      };
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
    enabled: !!params?.origin && !!params?.destination && !!params?.departDate,
    staleTime: 5 * 60 * 1000,
    initialPageParam: 0,
    ...options,
  });
}

/**
 * Hook for geo-arbitrage price comparison
 */
export function useGeoArbitrage(params, options = {}) {
  return useQuery({
    queryKey: ['geo-arbitrage', params],
    queryFn: () => geoArbitrageSearch(params),
    enabled: !!params?.origin && !!params?.destination && !!params?.departDate,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook for live deal monitoring with polling
 */
export function useLiveDeals(routes, options = {}) {
  return useQuery({
    queryKey: ['live-deals', routes],
    queryFn: async () => {
      const results = await Promise.all(
        routes.map(r => searchFlightOffers({ ...r, max: 5 }))
      );
      const allFlights = results.flatMap(r => r.flights);
      return allFlights.sort((a, b) => {
        const typeOrder = { error_fare: 0, price_drop: 1, deal: 2 };
        return (typeOrder[a.type] ?? 2) - (typeOrder[b.type] ?? 2) || a.price - b.price;
      });
    },
    refetchInterval: 60000,
    staleTime: 30000,
    ...options,
  });
}
