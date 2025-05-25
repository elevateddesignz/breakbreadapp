import React from 'react';
import { Tabs } from 'expo-router';
import {
  Chrome as Home,
  Users,
  UtensilsCrossed,
  User,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';
import { FONTS, FONT_SIZES } from '@/constants/Theme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: 60,           // Super bottom padding!
          paddingTop: 18,              // Extra top padding
          height: 110,                 // Makes room for the extra padding
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          marginBottom: 16,            // Looks very "floaty" above bottom
          elevation: 20,
          shadowColor: "#000",
          shadowOpacity: 0.16,
          shadowRadius: 18,
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.body,
          fontSize: FONT_SIZES.sm,
          paddingBottom: 6,
        },
        tabBarShowLabel: true,
        headerShown: false,
        safeAreaInsets: { bottom: 0, top: 0 }, // Avoid double safe area
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <UtensilsCrossed size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Tables',
          tabBarIcon: ({ color, size }) => (
            <Users size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
      {/* DO NOT add a Tabs.Screen for restaurants/ or restaurants/[id] */}
    </Tabs>
  );
}
