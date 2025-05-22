import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/Text';
import { OrderCard } from '@/components/OrderCard';
import { MealMemoryCard } from '@/components/MealMemoryCard';
import { SPACING } from '@/constants/Theme';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';
import { upcomingOrders } from '@/constants/UpcomingOrders';
import { mealMemories } from '@/constants/MealMemories';
import { Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';

export default function OrdersScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState('upcoming');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text variant="h3" weight="bold">
          Your Orders
        </Text>
        <TouchableOpacity 
          style={[
            styles.createButton, 
            { backgroundColor: colors.tint }
          ]}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'upcoming' && [
              styles.activeTab,
              { borderColor: colors.tint }
            ]
          ]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text
            variant="body"
            weight={activeTab === 'upcoming' ? 'bold' : 'regular'}
            color={activeTab === 'upcoming' ? colors.tint : colors.text}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'memories' && [
              styles.activeTab,
              { borderColor: colors.tint }
            ]
          ]}
          onPress={() => setActiveTab('memories')}
        >
          <Text
            variant="body"
            weight={activeTab === 'memories' ? 'bold' : 'regular'}
            color={activeTab === 'memories' ? colors.tint : colors.text}
          >
            Meal Memories
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'upcoming' && (
          <>
            {upcomingOrders.length > 0 ? (
              upcomingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onPress={() => router.push(`/orders/${order.id}`)}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text 
                  variant="body" 
                  align="center" 
                  color={colors.muted}
                  style={styles.emptyStateText}
                >
                  You don't have any upcoming orders
                </Text>
                <Button
                  title="Create an Order"
                  onPress={() => {}}
                  icon={<Plus size={18} color="#fff" />}
                />
              </View>
            )}
          </>
        )}

        {activeTab === 'memories' && (
          <>
            {mealMemories.length > 0 ? (
              mealMemories.map((memory) => (
                <MealMemoryCard
                  key={memory.id}
                  mealMemory={memory}
                  onPress={() => {}}
                  onReorder={() => {}}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text 
                  variant="body" 
                  align="center" 
                  color={colors.muted}
                  style={styles.emptyStateText}
                >
                  You don't have any meal memories yet
                </Text>
              </View>
            )}
          </>
        )}
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
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  tab: {
    paddingVertical: SPACING.sm,
    marginRight: SPACING.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  emptyState: {
    marginTop: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginBottom: SPACING.lg,
  },
});