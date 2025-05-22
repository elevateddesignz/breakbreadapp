import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';
import { RADIUS, SHADOWS, SPACING } from '@/constants/Theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: boolean;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  style,
  padding = true,
  elevation = 'md',
}: CardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const elevationStyle = elevation !== 'none' ? SHADOWS[elevation] : {};

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        padding && styles.padding,
        elevationStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  padding: {
    padding: SPACING.md,
  },
});