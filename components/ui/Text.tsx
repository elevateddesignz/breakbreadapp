import React from 'react';
import { Text as RNText, StyleSheet, TextStyle } from 'react-native';
import { FONTS, FONT_SIZES } from '@/constants/Theme';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'body-sm' | 'caption';
type TextWeight = 'regular' | 'medium' | 'bold';

interface TextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  weight?: TextWeight;
  color?: string;
  align?: 'auto' | 'left' | 'center' | 'right' | 'justify';
  style?: TextStyle;
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
  onPress?: () => void;
}

export function Text({
  children,
  variant = 'body',
  weight = 'regular',
  color,
  align = 'left',
  style,
  numberOfLines,
  adjustsFontSizeToFit,
  onPress,
}: TextProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const variantStyles: { [key in TextVariant]: TextStyle } = {
    h1: {
      fontSize: FONT_SIZES.xxxl,
      lineHeight: FONT_SIZES.xxxl * 1.2,
      marginVertical: 8,
    },
    h2: {
      fontSize: FONT_SIZES.xxl,
      lineHeight: FONT_SIZES.xxl * 1.2,
      marginVertical: 6,
    },
    h3: {
      fontSize: FONT_SIZES.xl,
      lineHeight: FONT_SIZES.xl * 1.2,
      marginVertical: 4,
    },
    h4: {
      fontSize: FONT_SIZES.lg,
      lineHeight: FONT_SIZES.lg * 1.2,
      marginVertical: 2,
    },
    body: {
      fontSize: FONT_SIZES.md,
      lineHeight: FONT_SIZES.md * 1.5,
    },
    'body-sm': {
      fontSize: FONT_SIZES.sm,
      lineHeight: FONT_SIZES.sm * 1.5,
    },
    caption: {
      fontSize: FONT_SIZES.xs,
      lineHeight: FONT_SIZES.xs * 1.5,
    },
  };

  const weightStyles: { [key in TextWeight]: TextStyle } = {
    regular: {
      fontFamily: FONTS.body,
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: FONTS.bodyMedium,
      fontWeight: '500',
    },
    bold: {
      fontFamily: FONTS.bodyBold,
      fontWeight: 'bold',
    },
  };

  return (
    <RNText
      style={[
        variantStyles[variant],
        weightStyles[weight],
        {
          color: color || colors.text,
          textAlign: align,
        },
        style,
      ]}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      onPress={onPress}
    >
      {children}
    </RNText>
  );
}