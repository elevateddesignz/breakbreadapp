import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Text } from './ui/Text';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { SPACING } from '@/constants/Theme';
import { Calendar, Clock, Users } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';
import { UpcomingOrder } from '@/constants/UpcomingOrders';
import dayjs from 'dayjs';

interface OrderCardProps {
  order: UpcomingOrder;
  onPress?: () => void;
}

export function OrderCard({ order, onPress }: OrderCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const getStatusColor = (status: UpcomingOrder['status']) => {
    switch (status) {
      case 'voting':
        return colors.accent;
      case 'ordering':
        return colors.tint;
      case 'confirmed':
        return colors.success;
      case 'delivered':
        return colors.muted;
      default:
        return colors.text;
    }
  };

  const getStatusText = (status: UpcomingOrder['status']) => {
    switch (status) {
      case 'voting':
        return 'Voting';
      case 'ordering':
        return 'Ordering';
      case 'confirmed':
        return 'Confirmed';
      case 'delivered':
        return 'Delivered';
      default:
        return '';
    }
  };

  const buttonAction = (status: UpcomingOrder['status']) => {
    switch (status) {
      case 'voting':
        return 'Vote Now';
      case 'ordering':
        return 'Order Now';
      case 'confirmed':
        return 'View Order';
      case 'delivered':
        return 'Reorder';
      default:
        return '';
    }
  };

  const daysUntil = () => {
    const today = dayjs();
    const orderDate = dayjs(order.date);
    const days = orderDate.diff(today, 'day');
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: order.restaurantImage }} style={styles.image} />
        <View style={styles.headerContent}>
          <Text variant="h4" weight="bold" numberOfLines={1}>
            {order.restaurant}
          </Text>
          <View style={styles.statusContainer}>
            <View 
              style={[
                styles.statusIndicator, 
                { backgroundColor: getStatusColor(order.status) }
              ]} 
            />
            <Text 
              variant="body-sm" 
              weight="medium"
              color={getStatusColor(order.status)}
            >
              {getStatusText(order.status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Calendar size={16} color={colors.muted} />
          <Text variant="body-sm" color={colors.muted} style={styles.detailText}>
            {daysUntil()}, {dayjs(order.date).format('MMMM D, YYYY')}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Clock size={16} color={colors.muted} />
          <Text variant="body-sm" color={colors.muted} style={styles.detailText}>
            {order.time}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Users size={16} color={colors.muted} />
          <Text variant="body-sm" color={colors.muted} style={styles.detailText}>
            {order.participants.confirmed}/{order.participants.count} confirmed
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text variant="body-sm" color={colors.muted}>
          Organized by: {order.organizer}
        </Text>
        <Button
          title={buttonAction(order.status)}
          variant="primary"
          size="sm"
          onPress={onPress}
        />
      </View>
    </Card>
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});