import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Text } from './ui/Text';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { SPACING } from '@/constants/Theme';
import { Calendar, Users, DollarSign } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';
import { MealMemory } from '@/constants/MealMemories';
import dayjs from 'dayjs';

interface MealMemoryCardProps {
  mealMemory: MealMemory;
  onPress?: () => void;
  onReorder?: () => void;
}

export function MealMemoryCard({ 
  mealMemory, 
  onPress, 
  onReorder 
}: MealMemoryCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Image 
            source={{ uri: mealMemory.restaurantImage }} 
            style={styles.image} 
          />
          <View style={styles.headerContent}>
            <Text variant="h4" weight="bold">
              {mealMemory.restaurant}
            </Text>
            <View style={styles.dateContainer}>
              <Calendar size={14} color={colors.muted} />
              <Text 
                variant="body-sm" 
                color={colors.muted} 
                style={styles.dateText}
              >
                {dayjs(mealMemory.date).format('MMMM D, YYYY')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Users size={16} color={colors.muted} />
            <Text 
              variant="body-sm" 
              color={colors.muted} 
              style={styles.detailText}
            >
              {mealMemory.participants} participants
            </Text>
          </View>
          <View style={styles.detailRow}>
            <DollarSign size={16} color={colors.muted} />
            <Text 
              variant="body-sm" 
              color={colors.muted} 
              style={styles.detailText}
            >
              Total: {mealMemory.totalCost}
            </Text>
          </View>
        </View>

        <View style={styles.itemsContainer}>
          <Text variant="body-sm" weight="medium">
            Items ordered:
          </Text>
          <Text variant="body-sm" color={colors.muted}>
            {mealMemory.items.join(', ')}
          </Text>
        </View>

        <Button
          title="Reorder"
          variant="outline"
          onPress={onReorder}
          fullWidth
        />
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    marginLeft: 6,
  },
  details: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
  },
  itemsContainer: {
    marginBottom: SPACING.md,
  },
});