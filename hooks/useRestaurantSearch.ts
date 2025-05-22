import { useState, useCallback } from 'react';
import debounce from 'lodash.debounce';

export function useRestaurantSearch() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Call this when input changes
  const search = useCallback(
    debounce(async (query: string, location: { latitude: number, longitude: number } | null) => {
      if (!query || !location) {
        setResults([]);
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const key = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;
        const { latitude, longitude } = location;
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + " restaurant")}&location=${latitude},${longitude}&radius=4000&key=${key}`;
        const res = await fetch(url);
        const json = await res.json();

        if (json.status !== 'OK') {
          setError(json.error_message || 'Failed to search');
          setResults([]);
        } else {
          setResults(json.results);
        }
      } catch {
        setError('Network error');
        setResults([]);
      }
      setLoading(false);
    }, 400), // 400ms debounce
    []
  );

  return { results, loading, error, search };
}
