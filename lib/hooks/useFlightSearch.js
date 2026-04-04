'use client';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { searchFlightOffers, geoArbitrageSearch } from '../api/flightEngine';

/**
 * Hook for searching flights with TanStack Query
 */
export function useFlightSearch(params, options = {}) {
  return useQuery({
    queryKey: ['flights', params],
    queryFn: () => searchFlightOffers(params),
    enabled: !!params?.origin && !!params?.destination && !!params?.departDate,
    staleTime: 2 * 60 * 1000,
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
      // Simulate pagination by offsetting IDs
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
    staleTime: 2 * 60 * 1000,
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
      // Sort by best deals first (error fares, then price drops)
      return allFlights.sort((a, b) => {
        const typeOrder = { error_fare: 0, price_drop: 1, deal: 2 };
        const aOrder = typeOrder[a.type] ?? 2;
        const bOrder = typeOrder[b.type] ?? 2;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.price - b.price;
      });
    },
    refetchInterval: 60000, // Poll every 60s
    staleTime: 30000,
    ...options,
  });
}
