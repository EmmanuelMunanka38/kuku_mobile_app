import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { User, Mail, Phone, Lock, UserPlus, Truck, Store, Leaf } from 'lucide-react-native';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../i18n';

const roles = [
  { key: 'DRIVER', icon: Truck, labelKey: 'driver' as const },
  { key: 'USER', icon: Store, labelKey: 'customer' as const },
  { key: 'FARMER', icon: Leaf, labelKey: 'farmer' as const },
];

export default function RoleSelect() {
  const register = useAuthStore((s) => s.register);
  const colors = useThemeStore((s) => s.colors);
  const { t } = useLanguageStore();

  const [selectedRole, setSelectedRole] = useState('USER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name) { setError('Name is required'); return; }
    if (!email || !password) { setError('Email and password required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      await register({ email, password, name, phone, role: selectedRole });
      const user = useAuthStore.getState().user;
      if (user?.role === 'FARMER') {
        router.replace('/(tabs)/dashboard');
      } else if (user?.role === 'DRIVER') {
        router.replace('/(tabs)/driver-dashboard');
      } else {
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      if (e.code === 'ERR_NETWORK') {
        setError('Cannot reach server. Check your internet or try the production build.');
      } else if (e.code === 'ECONNABORTED') {
        setError('Request timed out. Server may be starting up, please try again.');
      } else {
        setError(e.response?.data?.error || e.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Image source={require('../../assets/newioi.png')} style={styles.logo} resizeMode="contain" />
          <Text style={[styles.appName, { color: colors.primary }]}>{t.app.name}</Text>
          <Text style={[styles.joinLabel, { color: colors.onSurfaceVariant }]}>{t.auth.joinAs}</Text>
        </View>
        <View style={styles.roleRow}>
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.key;
            return (
              <TouchableOpacity
                key={role.key}
                style={[
                  styles.roleChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceContainerLow,
                    borderColor: isSelected ? colors.primary : colors.outlineVariant,
                  },
                ]}
                onPress={() => setSelectedRole(role.key)}
                activeOpacity={0.8}
              >
                <Icon size={22} color={isSelected ? colors.onPrimary : colors.onSurfaceVariant} strokeWidth={2} />
                <Text
                  style={[
                    styles.roleLabel,
                    { color: isSelected ? colors.onPrimary : colors.onSurface },
                  ]}
                >
                  {t.auth[role.labelKey]}
                </Text>
              </TouchableOpacity>
            );
          })}
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
            placeholder="+255 7XX XXX XXX"
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
            title={t.auth.register}
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
  header: { alignItems: 'center', marginBottom: spacing.xxl },
  logo: { width: 70, height: 70, borderRadius: 90, marginBottom: spacing.md},
  appName: { ...typography.headlineMd, fontWeight: '800', marginBottom: spacing.xs },
  joinLabel: { ...typography.bodyLg },
  roleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xxxl },
  roleChip: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
  },
  roleLabel: { ...typography.labelMd, fontWeight: '700' },
  form: {},
  error: { ...typography.bodySm, marginBottom: spacing.md },
  switch: { alignItems: 'center', marginTop: spacing.xxl },
  switchText: { ...typography.bodyMd },
  switchLink: { fontWeight: '800' },
});
