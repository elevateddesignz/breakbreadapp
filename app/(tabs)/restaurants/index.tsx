import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Text } from '@/components/ui/Text';
import { Restaurant } from '@/types/Restaurant';
import { RestaurantCard } from '@/components/RestaurantCard';
import { ChevronLeft, Search, XCircle } from 'lucide-react-native';
import useColorScheme from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { SPACING, RADIUS } from '@/constants/Theme';
import { useRouter } from 'expo-router'; // <-- use useRouter, not { router }

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;

export default function RestaurantListScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter(); // <-- here!

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission denied to access location.');
          setLoading(false);
          return;
        }
        let loc = await Location.getCurrentPositionAsync({});
        setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } catch (e: any) {
        setError('Failed to get location.');
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!coords) return;
    setLoading(true);
    setError(null);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      try {
        let url = '';
        if (search.trim()) {
          const q = encodeURIComponent(search.trim());
          url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${q}&location=${coords.latitude},${coords.longitude}&radius=2000&type=restaurant&key=${API_KEY}`;
        } else {
          url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.latitude},${coords.longitude}&radius=2000&type=restaurant&key=${API_KEY}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data.status !== 'OK') {
          setRestaurants([]);
          setError(data.error_message || 'No restaurants found.');
        } else {
          setRestaurants(data.results || []);
        }
      } catch (e: any) {
        setError('Failed to load restaurants.');
      }
      setLoading(false);
    }, 500);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [search, coords]);

  function Header() {
    return (
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <Text
          variant="h3"
          weight="bold"
          style={{
            flex: 1,
            textAlign: 'center',
            color: colors.text,
            letterSpacing: 0.1,
          }}
        >
          Restaurants
        </Text>
        <View style={{ width: 40 }} />
      </View>
    );
  }

  function renderRestaurant({ item }: { item: Restaurant }) {
    return (
      <TouchableOpacity
        onPress={() => {
          // 🚨 CORRECT: prefix with "../" since you're in (tabs)/restaurants!
          router.push({
            pathname: '/[id]', // <-- THIS IS THE KEY!
            params: {
              id: item.place_id,
              restaurantJson: JSON.stringify(item),
            },
          });
        }}
        activeOpacity={0.92}
        style={styles.cardWrapper}
      >
        <RestaurantCard restaurant={item} />
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <Header />
      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Search size={20} color={colors.muted} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or food (e.g. Pizza, Sushi)..."
          placeholderTextColor={colors.muted}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <XCircle size={20} color={colors.muted} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.container}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.tint} size="large" />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text color={colors.error} align="center" variant="body">
              {error}
            </Text>
          </View>
        ) : (
          <FlatList
            data={restaurants}
            keyExtractor={item => item.place_id}
            renderItem={renderRestaurant}
            contentContainerStyle={[
              styles.listContent,
              {
                paddingBottom: Math.max(insets.bottom, SPACING.xl) + SPACING.xl + 4,
                backgroundColor: colors.background,
              },
            ]}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text color={colors.muted} align="center" variant="body">
                  No restaurants found.
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? SPACING.xl : SPACING.xl + 6,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 10,
  },
  backButton: {
    padding: 4,
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    margin: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    minHeight: 40,
    paddingVertical: 0,
  },
  cardWrapper: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    backgroundColor: 'transparent',
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
});
