import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export const lightColors = {
  primary: '#BF7F06',
  onPrimary: '#FFFFFF',
  primaryContainer: '#F5E6C8',
  onPrimaryContainer: '#3E2C00',
  inversePrimary: '#FFD966',
  secondary: '#6B5A3E',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#F2E6D5',
  onSecondaryContainer: '#3E2C00',
  tertiary: '#4A6B3A',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#CBE8BE',
  onTertiaryContainer: '#1A3A0E',
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',
  surface: '#FFFCF5',
  surfaceDim: '#E8E4DC',
  surfaceBright: '#FFFCF5',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F5F1EA',
  surfaceContainer: '#EDE9E1',
  surfaceContainerHigh: '#E1DDD5',
  surfaceContainerHighest: '#D6D2CA',
  onSurface: '#1C1B16',
  onSurfaceVariant: '#4A473E',
  inverseSurface: '#31302B',
  inverseOnSurface: '#F2F0EA',
  outline: '#7B776E',
  outlineVariant: '#CCC8BE',
  surfaceTint: '#BF7F06',
  background: '#FFFCF5',
  onBackground: '#1C1B16',
  primaryFixed: '#FFEDC2',
  primaryFixedDim: '#FFD966',
  onPrimaryFixed: '#3E2C00',
  onPrimaryFixedVariant: '#8C5E00',
  secondaryFixed: '#F2E6D5',
  secondaryFixedDim: '#D6CAB9',
  onSecondaryFixed: '#1D160A',
  onSecondaryFixedVariant: '#4A3E2A',
  tertiaryFixed: '#CBE8BE',
  tertiaryFixedDim: '#A8D09A',
  onTertiaryFixed: '#0A2000',
  onTertiaryFixedVariant: '#2D4A1E',
  white: '#FFFFFF',
  black: '#000000',
  star: '#F5A623',
  success: '#2E7D32',
  warning: '#F9A825',
};

export const darkColors = {
  primary: '#FFD966',
  onPrimary: '#2B1F00',
  primaryContainer: '#6B4500',
  onPrimaryContainer: '#FFE082',
  inversePrimary: '#BF7F06',
  secondary: '#CEC4B4',
  onSecondary: '#2D2618',
  secondaryContainer: '#453A28',
  onSecondaryContainer: '#EDE0CE',
  tertiary: '#7DCFB0',
  onTertiary: '#0A2E20',
  tertiaryContainer: '#1B4A38',
  onTertiaryContainer: '#A8E8CF',
  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',
  surface: '#0D0D0D',
  surfaceDim: '#0D0D0D',
  surfaceBright: '#2C2C2C',
  surfaceContainerLowest: '#080808',
  surfaceContainerLow: '#141414',
  surfaceContainer: '#1A1A1A',
  surfaceContainerHigh: '#242424',
  surfaceContainerHighest: '#2E2E2E',
  onSurface: '#E8E8E5',
  onSurfaceVariant: '#B0B0AA',
  inverseSurface: '#E8E8E5',
  inverseOnSurface: '#1C1B16',
  outline: '#707070',
  outlineVariant: '#3A3A3A',
  surfaceTint: '#FFD966',
  background: '#0D0D0D',
  onBackground: '#E8E8E5',
  primaryFixed: '#FFE082',
  primaryFixedDim: '#FFD966',
  onPrimaryFixed: '#2B1F00',
  onPrimaryFixedVariant: '#6B4500',
  secondaryFixed: '#EDE0CE',
  secondaryFixedDim: '#CEC4B4',
  onSecondaryFixed: '#1D160A',
  onSecondaryFixedVariant: '#453A28',
  tertiaryFixed: '#A8E8CF',
  tertiaryFixedDim: '#7DCFB0',
  onTertiaryFixed: '#0A2000',
  onTertiaryFixedVariant: '#1B4A38',
  white: '#FFFFFF',
  black: '#000000',
  star: '#FFB300',
  success: '#4CAF50',
  warning: '#FF9800',
};

export type ThemeColors = typeof lightColors;

interface ThemeState {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => Promise<void>;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,
  colors: lightColors,

  toggleTheme: async () => {
    set((state) => {
      const isDark = !state.isDark;
      SecureStore.setItemAsync('theme', isDark ? 'dark' : 'light');
      return { isDark, colors: isDark ? darkColors : lightColors };
    });
  },

  loadTheme: async () => {
    try {
      const stored = await SecureStore.getItemAsync('theme');
      const isDark = stored === 'dark';
      set({ isDark, colors: isDark ? darkColors : lightColors });
    } catch {
      set({ isDark: false, colors: lightColors });
    }
  },
}));
