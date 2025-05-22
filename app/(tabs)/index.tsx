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
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { OrderCard } from '@/components/OrderCard';
import { SPACING } from '@/constants/Theme';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';
import { upcomingOrders } from '@/constants/UpcomingOrders';
import { Search, Plus, Bell, Users as UsersIcon, XCircle } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { router } from 'expo-router';
import * as Location from 'expo-location';

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;

export default function RestaurantListScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  // State for search and restaurants
  const [searchActive, setSearchActive] = useState(false);
  const [query, setQuery] = useState('');
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Get user location on mount
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

  // API search, debounced
  useEffect(() => {
    if (!coords) return;
    setLoading(true);
    setError(null);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      try {
        let url = '';
        if (query.trim()) {
          // Text search
          const q = encodeURIComponent(query.trim());
          url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${q}&location=${coords.latitude},${coords.longitude}&radius=2000&type=restaurant&key=${API_KEY}`;
        } else {
          // Nearby search
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
    }, 500);

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

  // Handle search submit (closes keyboard)
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="body-sm" color={colors.muted}>
            Good afternoon
          </Text>
          <Text variant="h3" weight="bold">
            Jamie Smith
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={24} color={colors.text} />
            <View
              style={[
                styles.notificationBadge,
                { backgroundColor: colors.notification }
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg' }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
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
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + SPACING.lg }
        ]}
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
                router.push({
                  pathname: '/(tabs)/restaurants/index.tsx',
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: SPACING.md,
    position: 'relative',
  },
  notificationBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    minHeight: 40,
    paddingVertical: 0,
  },
  searchText: {
    marginLeft: SPACING.sm,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  upcomingOrdersContainer: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  emptyStateCard: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  createButton: {
    marginTop: SPACING.md,
  },
  suggestedRestaurantsContainer: {
    marginBottom: SPACING.lg,
  },
  restaurantsScrollContent: {
    paddingRight: SPACING.md,
  },
  restaurantCard: {
    width: 160,
    marginRight: SPACING.md,
    borderRadius: 8,
    overflow: 'hidden',
  },
  restaurantImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  restaurantInfo: {
    marginTop: SPACING.xs,
  },
  quickActionsContainer: {
    marginBottom: SPACING.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    marginTop: SPACING.xs,
  },
});
