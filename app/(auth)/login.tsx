import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Mail, Lock, LogIn } from 'lucide-react-native';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../i18n';

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const colors = useThemeStore((s) => s.colors);
  const { t } = useLanguageStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError(t.auth.emailRequired); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      const user = useAuthStore.getState().user;
      if (user?.role === 'FARMER') {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      if (e.code === 'ERR_NETWORK') {
        setError('Cannot reach server. Check your internet or try the production build.');
      } else if (e.code === 'ECONNABORTED') {
        setError('Request timed out. Server may be starting up, please try again.');
      } else {
        setError(e.response?.data?.error || e.response?.data?.message || t.auth.loginFailed);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <ArrowLeft size={22} color={colors.primary} strokeWidth={2.5} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.onSurface }]}>{t.auth.welcomeBack}</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{t.auth.loginSubtitle}</Text>
      </View>

      <View style={styles.form}>
        {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
        <Input
          label={t.auth.email}
          value={email}
          onChangeText={setEmail}
          placeholder="name@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          icon={<Mail size={18} color={colors.outline} strokeWidth={2} />}
        />
        <Input
          label={t.auth.password}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          icon={<Lock size={18} color={colors.outline} strokeWidth={2} />}
        />

        <Button
          title={t.auth.login}
          onPress={handleLogin}
          loading={loading}
          size="lg"
          icon={<LogIn size={20} color={colors.white} strokeWidth={2.5} />}
        />

        <TouchableOpacity onPress={() => router.push('/(auth)/role-select')} style={styles.switch}>
          <Text style={[styles.switchText, { color: colors.onSurfaceVariant }]}>
            {t.auth.noAccount} <Text style={[styles.switchLink, { color: colors.primary }]}>{t.auth.register}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.containerPadding },
  back: { position: 'absolute', top: 60, left: spacing.containerPadding, zIndex: 10 },
  header: { marginBottom: spacing.xxxl },
  title: { ...typography.headlineLg, fontWeight: '800' },
  subtitle: { ...typography.bodyLg, marginTop: spacing.xs },
  form: {},
  error: { ...typography.bodySm, marginBottom: spacing.md },
  switch: { alignItems: 'center', marginTop: spacing.xxl },
  switchText: { ...typography.bodyMd },
  switchLink: { fontWeight: '800' },
});
