import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export function useNearbyRestaurants() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission not granted');
        setLoading(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Fetch Google Places nearby restaurants
      try {
        const key = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;
        const radius = 4000; // meters
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=restaurant&key=${key}`;
        const res = await fetch(url);
        const json = await res.json();

        if (json.status !== 'OK') {
          setError(json.error_message || 'Failed to fetch restaurants');
          setRestaurants([]);
        } else {
          setRestaurants(json.results);
        }
      } catch (e) {
        setError('Network error');
        setRestaurants([]);
      }

      setLoading(false);
    })();
  }, []);

  return { restaurants, loading, error };
}
