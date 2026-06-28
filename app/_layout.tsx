import { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, NunitoSans_400Regular, NunitoSans_600SemiBold, NunitoSans_700Bold, NunitoSans_800ExtraBold } from '@expo-google-fonts/nunito-sans';
import * as SplashScreen from 'expo-splash-screen';

import AppSplash from '../components/AnimatedFarmScene';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../i18n';
import { useThemeStore } from '../constants/themes';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const loadStoredAuth = useAuthStore((s) => s.loadStoredAuth);
  const loadLanguage = useLanguageStore((s) => s.loadLanguage);
  const loadTheme = useThemeStore((s) => s.loadTheme);
  const colors = useThemeStore((s) => s.colors);
  const isDark = useThemeStore((s) => s.isDark);

  const [fontsLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
    NunitoSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    loadStoredAuth();
    loadLanguage();
    loadTheme();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      const timer = setTimeout(() => setShowSplash(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || showSplash) {
    return (
      <View style={[styles.splash, { backgroundColor: colors.primary }]}>
        <StatusBar style="light" />
        <AppSplash />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="farm/[id]" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="order/[id]" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
