import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useThemeStore } from '../constants/themes';

export default function SplashScreen() {
  const colors = useThemeStore((s) => s.colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      <ActivityIndicator size="large" color={colors.white} style={{ marginTop: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 120, height: 120 },
});
