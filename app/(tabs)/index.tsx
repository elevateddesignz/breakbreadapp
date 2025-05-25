import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { OrderCard } from '@/components/OrderCard';
import { SPACING } from '@/constants/Theme';
import useColorScheme from '@/hooks/useColorScheme';
import Colors from '@/constants/Colors';
import { upcomingOrders } from '@/constants/UpcomingOrders';
import { Search, Plus, Users as UsersIcon, XCircle } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;

export default function RestaurantListScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [searchActive, setSearchActive] = useState(false);
  const [query, setQuery] = useState('');
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Location
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission denied to access location.');
          return;
        }
        let loc = await Location.getCurrentPositionAsync({});
        setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } catch {
        setError('Unable to get location.');
      }
    })();
  }, []);

  // Profile from Supabase PROFILES table ONLY, fallback to auth user_metadata
  useEffect(() => {
    (async () => {
      setProfileLoading(true);

      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }
      const userId = userData.user.id;

      // Get profile row
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      let resultProfile = null;
      if (profileData) {
        resultProfile = {
          id: userId,
          full_name: profileData.full_name || null,
          username: profileData.username || null,
          avatar_url: profileData.avatar_url || null,
        };
      } else {
        resultProfile = {
          id: userId,
          full_name: userData.user.user_metadata?.full_name || null,
          username: userData.user.user_metadata?.username || null,
          avatar_url: userData.user.user_metadata?.avatar_url || null,
        };
      }
      setProfile(resultProfile);
      setProfileLoading(false);
    })();
  }, []);

  // Google search, debounced
  useEffect(() => {
    if (!coords) return;
    setLoading(true);
    setError(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      try {
        let url = '';
        if (query.trim()) {
          const q = encodeURIComponent(query.trim());
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
      } catch {
        setError('Failed to load restaurants.');
      }
      setLoading(false);
    }, 350);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [query, coords]);

  // Helpers
  function getCuisine(restaurant: any) {
    if (restaurant.types && Array.isArray(restaurant.types)) {
      const cuisineRaw = restaurant.types.find(
        t => t !== 'restaurant' && typeof t === 'string' && !t.includes('_')
      );
      return cuisineRaw
        ? cuisineRaw.charAt(0).toUpperCase() + cuisineRaw.slice(1)
        : 'Restaurant';
    }
    if (restaurant.cuisine) return restaurant.cuisine;
    return 'Restaurant';
  }

  function getPriceRange(restaurant: any) {
    return restaurant.price_level ? ` • ${'$'.repeat(restaurant.price_level)}` : '';
  }

  function getId(restaurant: any) {
    return restaurant.id || restaurant.place_id || Math.random().toString();
  }

  function getImageUrl(restaurant: any) {
    if (restaurant.image) return restaurant.image;
    if (restaurant.photos && restaurant.photos[0] && restaurant.photos[0].photo_reference) {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${restaurant.photos[0].photo_reference}&key=${API_KEY}`;
    }
    return 'https://via.placeholder.com/400x150.png?text=No+Image';
  }

  const handleSearchSubmit = () => {
    if (query.trim().length > 0) {
      router.push({
        pathname: 'app/(tabs)/restaurants/index',
        params: { query: query.trim() },
      });
    } else {
      Keyboard.dismiss();
    }
  };

  // --------- UI ---------
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header: Avatar and Name */}
      <View style={styles.header}>
        {profileLoading ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.avatar, { backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' }]}>
              <ActivityIndicator color={colors.tint} />
            </View>
            <View style={{ width: 10 }} />
            <Text variant="h3" weight="bold" style={{ color: colors.text }}>
              ...
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.avatar}
                onError={() => setProfile((prev: any) => ({ ...prev, avatar_url: null }))}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' }]}>
                <Text variant="h3" style={{ color: colors.text }}>
                  {(profile?.full_name?.[0] || profile?.username?.[0] || '?').toUpperCase()}
                </Text>
              </View>
            )}
            <View style={{ width: 10 }} />
            <Text variant="h3" weight="bold" style={{ color: colors.text }}>
              {profile?.full_name?.trim() || profile?.username || 'No Name Set'}
            </Text>
          </View>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchBar,
          { backgroundColor: colors.card, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' }
        ]}>
          <Search size={20} color={colors.muted} style={{ marginRight: 8 }} />
          <TextInput
            autoFocus={searchActive}
            placeholder="Search by name or food (e.g. Pizza, Sushi, Starbucks)..."
            placeholderTextColor={colors.muted}
            style={[styles.searchInput, { color: colors.text }]}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearchSubmit}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <XCircle size={20} color={colors.muted} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Upcoming Orders */}
        <View style={styles.upcomingOrdersContainer}>
          <View style={styles.sectionHeader}>
            <Text variant="h4" weight="bold">
              Upcoming Orders
            </Text>
            <TouchableOpacity>
              <Text
                variant="body-sm"
                weight="medium"
                color={colors.tint}
              >
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {Array.isArray(upcomingOrders) && upcomingOrders.length > 0 ? (
            upcomingOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={() => router.push(`/orders/${order.id}`)}
              />
            ))
          ) : (
            <Card style={styles.emptyStateCard}>
              <Text variant="body" align="center" color={colors.muted}>
                No upcoming orders yet
              </Text>
              <Button
                title="Create Order"
                variant="primary"
                onPress={() => {}}
                style={styles.createButton}
                icon={<Plus size={18} color="#fff" />}
              />
            </Card>
          )}
        </View>

        {/* Live Search/Suggested Restaurants */}
        <View style={styles.suggestedRestaurantsContainer}>
          <View style={styles.sectionHeader}>
            <Text variant="h4" weight="bold">
              {query ? "Search Results" : "Suggested Restaurants"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                // "See All" goes to full restaurant list page, passing current query if any
                router.push({
                  pathname: '/(tabs)/restaurants/index',
                  params: query ? { query } : {},
                });
              }}
            >
              <Text
                variant="body-sm"
                weight="medium"
                color={colors.tint}
              >
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.tint} size="small" style={{ marginTop: 10 }} />
          ) : error ? (
            <Text variant="body-sm" color={colors.error} style={{ marginTop: 10 }}>{error}</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.restaurantsScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {Array.isArray(restaurants) && restaurants.length > 0 ? (
                restaurants.slice(0, 4).map((restaurant) => (
                  <TouchableOpacity
                    key={getId(restaurant)}
                    style={styles.restaurantCard}
                    onPress={() => {
                      // Each restaurant opens its own details page, pass JSON as param
                      router.push({
                        pathname: `/restaurants/${getId(restaurant)}`,
                        params: {
                          restaurantJson: JSON.stringify({
                            ...restaurant,
                          }),
                        },
                      });
                    }}
                  >
                    <Image
                      source={{ uri: getImageUrl(restaurant) }}
                      style={styles.restaurantImage}
                    />
                    <View style={styles.restaurantInfo}>
                      <Text
                        variant="body"
                        weight="medium"
                        numberOfLines={1}
                      >
                        {restaurant.name}
                      </Text>
                      <Text
                        variant="body-sm"
                        color={colors.muted}
                      >
                        {getCuisine(restaurant)}
                        {getPriceRange(restaurant)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text variant="body-sm" color={colors.muted}>
                  No restaurants found.
                </Text>
              )}
            </ScrollView>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text variant="h4" weight="bold" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.primaryLight }
              ]}
            >
              <Plus size={24} color={colors.tint} />
              <Text
                variant="body-sm"
                weight="medium"
                color={colors.tint}
                style={styles.actionText}
              >
                Create Order
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.primaryLight }
              ]}
            >
              <UsersIcon size={24} color={colors.tint} />
              <Text
                variant="body-sm"
                weight="medium"
                color={colors.tint}
                style={styles.actionText}
              >
                Invite Friends
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --------- Styles ---------
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: 6,
    paddingBottom: 8,
    minHeight: 52,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#e2e2e2",
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: 8,
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    minHeight: 40,
    paddingVertical: 0,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 12,
  },
  upcomingOrdersContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  emptyStateCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  createButton: {
    marginTop: 12,
  },
  suggestedRestaurantsContainer: {
    marginBottom: 16,
  },
  restaurantsScrollContent: {
    paddingRight: 8,
  },
  restaurantCard: {
    width: 160,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  restaurantImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  restaurantInfo: {
    marginTop: 4,
  },
  quickActionsContainer: {
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    marginTop: 4,
  },
});
