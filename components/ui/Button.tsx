import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { FONTS, FONT_SIZES, RADIUS, SPACING } from '@/constants/Theme';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: any;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  style,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const getContainerStyle = () => {
    const variantStyles = {
      primary: {
        backgroundColor: colors.tint,
      },
      secondary: {
        backgroundColor: colors.primaryLight,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.tint,
      },
      text: {
        backgroundColor: 'transparent',
      },
    };

    const sizeStyles = {
      sm: {
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.md,
      },
      md: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
      },
      lg: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
      },
    };

    return [
      styles.container,
      variantStyles[variant],
      sizeStyles[size],
      fullWidth && styles.fullWidth,
      disabled && styles.disabled,
      style,
    ];
  };

  const getTextStyle = () => {
    const variantTextStyles = {
      primary: {
        color: '#fff',
      },
      secondary: {
        color: colors.tint,
      },
      outline: {
        color: colors.tint,
      },
      text: {
        color: colors.tint,
      },
    };

    const sizeTextStyles = {
      sm: {
        fontSize: FONT_SIZES.sm,
      },
      md: {
        fontSize: FONT_SIZES.md,
      },
      lg: {
        fontSize: FONT_SIZES.lg,
      },
    };

    return [styles.text, variantTextStyles[variant], sizeTextStyles[size]];
  };

  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View style={styles.contentContainer}>
        {icon && !loading && <View style={styles.iconContainer}>{icon}</View>}
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' ? '#fff' : colors.tint}
            size="small"
          />
        ) : (
          <Text style={getTextStyle()}>{title}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: FONTS.bodyMedium,
    textAlign: 'center',
  },
  iconContainer: {
    marginRight: SPACING.xs,
  },
});