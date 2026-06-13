import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Mail, Lock, User, Phone, UserPlus } from 'lucide-react-native';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../i18n';

export default function Register() {
  const { role } = useLocalSearchParams<{ role: string }>();
  const register = useAuthStore((s) => s.register);
  const colors = useThemeStore((s) => s.colors);
  const { t } = useLanguageStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFarmer = role === 'FARMER';

  const handleRegister = async () => {
    if (!name) { setError('Name is required'); return; }
    if (!email || !password) { setError(t.auth.emailRequired); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      await register({ email, password, name, phone, role });
      const user = useAuthStore.getState().user;
      if (user?.role === 'FARMER') {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      setError(e.response?.data?.error || t.auth.registerFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ArrowLeft size={22} color={colors.primary} strokeWidth={2.5} />
        </TouchableOpacity>

        <View>
          <View style={[styles.badge, { backgroundColor: colors.primaryFixed }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>{isFarmer ? t.auth.farmer : t.auth.customer}</Text>
          </View>
          <Text style={[styles.title, { color: colors.onSurface }]}>{t.auth.createAccount}</Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{t.auth.registerSubtitle}</Text>
        </View>

        <View style={styles.form}>
          {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
          <Input
            label={t.auth.name}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Aisha Mohamed"
            icon={<User size={18} color={colors.outline} strokeWidth={2} />}
          />
          <Input
            label={t.auth.email}
            value={email}
            onChangeText={setEmail}
            placeholder="name@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail size={18} color={colors.outline} strokeWidth={2} />}
          />
          <Input
            label={t.auth.phone}
            value={phone}
            onChangeText={setPhone}
            placeholder="+254 7XX XXX XXX"
            keyboardType="phone-pad"
            icon={<Phone size={18} color={colors.outline} strokeWidth={2} />}
          />
          <Input
            label={t.auth.password}
            value={password}
            onChangeText={setPassword}
            placeholder="Min 6 characters"
            secureTextEntry
            icon={<Lock size={18} color={colors.outline} strokeWidth={2} />}
          />

          <Button
            title={isFarmer ? t.auth.farmer : t.auth.register}
            onPress={handleRegister}
            loading={loading}
            size="lg"
            icon={<UserPlus size={20} color={colors.white} strokeWidth={2.5} />}
          />

          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.switch}>
            <Text style={[styles.switchText, { color: colors.onSurfaceVariant }]}>
              {t.auth.haveAccount} <Text style={[styles.switchLink, { color: colors.primary }]}>{t.auth.login}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: spacing.containerPadding, paddingTop: 60, paddingBottom: 40 },
  back: { marginBottom: spacing.xxl },
  badge: { alignSelf: 'flex-start', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 20, marginBottom: spacing.sm },
  badgeText: { ...typography.labelMd, fontWeight: '800' },
  title: { ...typography.headlineMd, fontWeight: '800', marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMd, marginBottom: spacing.xxl },
  form: { marginTop: spacing.md },
  error: { ...typography.bodySm, marginBottom: spacing.md },
  switch: { alignItems: 'center', marginTop: spacing.xxl },
  switchText: { ...typography.bodyMd },
  switchLink: { fontWeight: '800' },
});
