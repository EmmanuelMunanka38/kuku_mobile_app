import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../constants/themes';

export default function Index() {
  const { user, isLoading } = useAuthStore();
  const colors = useThemeStore((s) => s.colors);

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/role-select" />;
  }

  if (user.role === 'FARMER') {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  if (user.role === 'DRIVER') {
    return <Redirect href="/(tabs)/driver-dashboard" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
