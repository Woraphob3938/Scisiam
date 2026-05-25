import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Device classification helper
export const isTablet = () => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;
  
  if (pixelDensity < 2 && (SCREEN_WIDTH >= 1000 || SCREEN_HEIGHT >= 1000)) {
    return true;
  }
  return (
    pixelDensity >= 2 &&
    (SCREEN_WIDTH >= 600 || SCREEN_HEIGHT >= 600)
  );
};

export const colors = {
  // Brand Colors
  primary: '#2563eb', // Electric Blue
  primaryHover: '#1d4ed8',
  secondary: '#f8fafc', // Ultra Light Grey / Slate 50
  background: '#f1f5f9', // Clean light background / Slate 100
  
  // Card backgrounds
  cardBg: '#ffffff', // Clean white card
  cardBorder: '#e2e8f0', // Slate 200 border
  
  // Accent & State Colors
  cyanGlow: '#0891b2', // Deeper Cyan for readability on white
  emeraldGlow: '#059669', // Deeper Emerald
  dangerGlow: '#dc2626', // Deeper Red
  amberGlow: '#d97706', // Deeper Amber
  
  // Text Colors
  textPrimary: '#0f172a', // Slate 900
  textSecondary: '#475569', // Slate 600
  textMuted: '#94a3b8', // Slate 400
  textDark: '#0f172a',
  
  // Functional
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const roundness = {
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  round: 9999,
};

export const shadows = {
  glowCyan: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  glowEmerald: {
    shadowColor: colors.emeraldGlow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  glowDanger: {
    shadowColor: colors.dangerGlow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  card: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
};

export const fonts = {
  regular: 'Prompt_400Regular',
  semiBold: 'Prompt_600SemiBold',
  bold: 'Prompt_700Bold',
  extraBold: 'Prompt_800ExtraBold',
};
