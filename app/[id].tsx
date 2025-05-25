import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;

function getImageUrl(restaurant) {
  if (!restaurant) return 'https://via.placeholder.com/600x200.png?text=No+Image';
  if (restaurant.image) return restaurant.image;
  if (restaurant.photos && restaurant.photos[0] && restaurant.photos[0].photo_reference) {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${restaurant.photos[0].photo_reference}&key=${API_KEY}`;
  }
  return 'https://via.placeholder.com/600x200.png?text=No+Image';
}

export default function RestaurantDetailsScreen() {
  // Get route params (id, restaurantJson)
  const { restaurantJson } = useLocalSearchParams();
  const restaurant = restaurantJson ? JSON.parse(restaurantJson as string) : null;

  if (!restaurant) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>Restaurant not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Main Image */}
      <Image
        source={{ uri: getImageUrl(restaurant) }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Details */}
      <View style={styles.container}>
        <Text style={styles.title}>{restaurant.name}</Text>

        {restaurant.formatted_address || restaurant.vicinity ? (
          <Text style={styles.address}>
            {restaurant.formatted_address || restaurant.vicinity}
          </Text>
        ) : null}

        {/* Rating and Price */}
        <View style={styles.row}>
          {restaurant.rating && (
            <Text style={styles.rating}>
              ⭐ {restaurant.rating} ({restaurant.user_ratings_total || 0})
            </Text>
          )}
          {restaurant.price_level && (
            <Text style={styles.price}>
              {'  ' + '$'.repeat(restaurant.price_level)}
            </Text>
          )}
        </View>

        {/* Categories / Cuisine */}
        {restaurant.types && Array.isArray(restaurant.types) && (
          <Text style={styles.cuisine}>
            {restaurant.types.filter(t => t !== 'restaurant').map(t =>
              t.replace(/_/g, ' ')
            ).join(', ')}
          </Text>
        )}

        {/* Opening hours if available */}
        {restaurant.opening_hours && (
          <Text style={styles.openStatus}>
            {restaurant.opening_hours.open_now ? 'Open Now' : 'Closed'}
          </Text>
        )}

        {/* Google Maps Link if place_id */}
        {restaurant.place_id && (
          <Text
            style={styles.googleLink}
            onPress={() =>
              window.open
                ? window.open(`https://www.google.com/maps/place/?q=place_id:${restaurant.place_id}`, '_blank')
                : null
            }
          >
            View on Google Maps
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 220,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  container: {
    padding: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  address: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rating: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  price: {
    fontSize: 16,
    color: '#333',
    marginLeft: 14,
    fontWeight: '600',
  },
  cuisine: {
    fontSize: 15,
    color: '#999',
    marginBottom: 10,
  },
  openStatus: {
    fontSize: 15,
    color: '#1565C0',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  googleLink: {
    color: '#2196F3',
    marginTop: 16,
    fontWeight: 'bold',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 64,
  },
  notFoundText: {
    fontSize: 22,
    color: '#999',
    fontWeight: 'bold',
  },
});
