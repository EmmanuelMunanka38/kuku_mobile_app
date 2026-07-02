import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export const lightColors = {
  primary: '#2E7D32',
  onPrimary: '#FFFFFF',
  primaryContainer: '#E8F5E9',
  onPrimaryContainer: '#1B5E20',
  inversePrimary: '#4CAF50',
  secondary: '#388E3C',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#C8E6C9',
  onSecondaryContainer: '#1B5E20',
  tertiary: '#00796B',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#B2DFDB',
  onTertiaryContainer: '#004D40',
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',
  surface: '#FFFFFF',
  surfaceDim: '#F5F5F5',
  surfaceBright: '#FFFFFF',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#FAFAFA',
  surfaceContainer: '#F5F5F5',
  surfaceContainerHigh: '#EEEEEE',
  surfaceContainerHighest: '#E0E0E0',
  onSurface: '#1C1B16',
  onSurfaceVariant: '#49454F',
  inverseSurface: '#31302B',
  inverseOnSurface: '#F2F0EA',
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
  surfaceTint: '#2E7D32',
  background: '#FFFFFF',
  onBackground: '#1C1B16',
  primaryFixed: '#E8F5E9',
  primaryFixedDim: '#A5D6A7',
  onPrimaryFixed: '#1B5E20',
  onPrimaryFixedVariant: '#2E7D32',
  secondaryFixed: '#C8E6C9',
  secondaryFixedDim: '#81C784',
  onSecondaryFixed: '#1B5E20',
  onSecondaryFixedVariant: '#2E7D32',
  tertiaryFixed: '#B2DFDB',
  tertiaryFixedDim: '#80CBC4',
  onTertiaryFixed: '#003730',
  onTertiaryFixedVariant: '#00695C',
  white: '#FFFFFF',
  black: '#000000',
  star: '#2E7D32',
  success: '#2E7D32',
  warning: '#F9A825',
};

export const darkColors = {
  primary: '#4CAF50',
  onPrimary: '#1B5E20',
  primaryContainer: '#1B5E20',
  onPrimaryContainer: '#C8E6C9',
  inversePrimary: '#2E7D32',
  secondary: '#81C784',
  onSecondary: '#1B5E20',
  secondaryContainer: '#2E7D32',
  onSecondaryContainer: '#E8F5E9',
  tertiary: '#80CBC4',
  onTertiary: '#003730',
  tertiaryContainer: '#00695C',
  onTertiaryContainer: '#B2DFDB',
  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',
  surface: '#121212',
  surfaceDim: '#121212',
  surfaceBright: '#2C2C2C',
  surfaceContainerLowest: '#0A0A0A',
  surfaceContainerLow: '#1A1A1A',
  surfaceContainer: '#1E1E1E',
  surfaceContainerHigh: '#2A2A2A',
  surfaceContainerHighest: '#353535',
  onSurface: '#E8E8E5',
  onSurfaceVariant: '#B0B0AA',
  inverseSurface: '#E8E8E5',
  inverseOnSurface: '#1C1B16',
  outline: '#707070',
  outlineVariant: '#3A3A3A',
  surfaceTint: '#4CAF50',
  background: '#121212',
  onBackground: '#E8E8E5',
  primaryFixed: '#E8F5E9',
  primaryFixedDim: '#A5D6A7',
  onPrimaryFixed: '#1B5E20',
  onPrimaryFixedVariant: '#2E7D32',
  secondaryFixed: '#C8E6C9',
  secondaryFixedDim: '#81C784',
  onSecondaryFixed: '#1B5E20',
  onSecondaryFixedVariant: '#2E7D32',
  tertiaryFixed: '#B2DFDB',
  tertiaryFixedDim: '#80CBC4',
  onTertiaryFixed: '#003730',
  onTertiaryFixedVariant: '#00695C',
  white: '#FFFFFF',
  black: '#000000',
  star: '#4CAF50',
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
