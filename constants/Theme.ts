import { Platform } from 'react-native';

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FONTS = {
  body: Platform.select({
    web: 'Inter-Regular, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    default: 'Inter-Regular',
  }),
  bodyBold: Platform.select({
    web: 'Inter-Bold, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    default: 'Inter-Bold',
  }),
  bodyMedium: Platform.select({
    web: 'Inter-Medium, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    default: 'Inter-Medium',
  }),
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
};