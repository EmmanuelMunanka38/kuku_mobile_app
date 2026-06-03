import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function Index() {
  const { user, isLoading, isOnboarded } = useAuthStore();

  if (isLoading) return null;

  if (!isOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  if (!user) {
    return <Redirect href="/(auth)/role-select" />;
  }

  if (user.role === 'FARMER') {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return <Redirect href="/(tabs)" />;
}
