import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Text } from './ui/Text';
import { Card } from './ui/Card';
import { RADIUS, SPACING } from '@/constants/Theme';
import { Star } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';
import { Restaurant } from '@/types/Restaurant';

function getPhotoUrl(photoReference?: string) {
  if (!photoReference) return 'https://via.placeholder.com/400x150.png?text=No+Image';
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress?: () => void;
}

export function RestaurantCard({ restaurant, onPress }: RestaurantCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const imageUrl =
    restaurant.photos && restaurant.photos[0]
      ? getPhotoUrl(restaurant.photos[0].photo_reference)
      : 'https://via.placeholder.com/400x150.png?text=No+Image';

  // Safely determine cuisine
  const cuisineRaw = restaurant.types?.find(
    (t: string) => t !== 'restaurant' && !t.includes('_')
  );
  const cuisine =
    cuisineRaw && typeof cuisineRaw === 'string'
      ? cuisineRaw.charAt(0).toUpperCase() + cuisineRaw.slice(1)
      : 'Restaurant';

  // Guard address as string
  const address = typeof restaurant.vicinity === 'string' && restaurant.vicinity.length > 0
    ? restaurant.vicinity
    : 'No address';

  // Guard rating
  const rating = typeof restaurant.rating === 'number'
    ? restaurant.rating.toFixed(1)
    : (restaurant.rating ?? 'N/A');

  // Guard rating total
  const ratingsTotal = typeof restaurant.user_ratings_total === 'number'
    ? restaurant.user_ratings_total
    : 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card padding={false} style={styles.card}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={styles.content}>
          <Text variant="h4" weight="bold">
            {restaurant.name}
          </Text>
          <View style={styles.details}>
            <Text variant="body-sm" color={colors.muted}>
              {cuisine}
            </Text>
            <View style={styles.rating}>
              <Star
                size={16}
                color={colors.accent}
                fill={colors.accent}
              />
              <Text variant="body-sm" weight="medium" style={styles.ratingText}>
                {rating}
              </Text>
              <Text variant="body-sm" color={colors.muted} style={{ marginLeft: 6 }}>
                ({ratingsTotal})
              </Text>
            </View>
          </View>
          <View style={styles.footer}>
            <Text variant="body-sm" color={colors.muted}>
              {address}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  image: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: RADIUS.md,
    borderTopRightRadius: RADIUS.md,
    backgroundColor: '#eee',
  },
  content: {
    padding: SPACING.md,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  ratingText: {
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
});

export default RestaurantCard;
