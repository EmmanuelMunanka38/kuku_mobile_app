import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { User, Lock, Info, ChevronRight, Home } from 'lucide-react-native';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../i18n';
import api from '../../services/api';

export default function SettingsScreen() {
  const { user } = useAuthStore();
  const colors = useThemeStore((s) => s.colors);
  const { t } = useLanguageStore();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [farm, setFarm] = useState<{ name: string; logo?: string; city?: string } | null>(null);

  useEffect(() => {
    if (user?.role === 'FARMER') {
      api.get('/farms/my-farm').then(({ data }) => setFarm(data)).catch(() => {});
    }
  }, [user]);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) { setError('Both fields required'); return; }
    if (newPassword.length < 6) { setError('New password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      await api.put('/users/password', { currentPassword, newPassword });
      Alert.alert('Success', 'Password changed successfully');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.onSurface }]}>{t.profile.settings}</Text>
      </View>

      <View style={styles.section}>
        <Card variant="elevated" padding="none">
          <View style={[styles.profileRow, { borderBottomColor: colors.surfaceContainerHigh }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: colors.onPrimary }]}>{(user?.name || 'M')[0].toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.onSurface }]}>{user?.name || 'Mgeni'}</Text>
              <Text style={[styles.profileEmail, { color: colors.onSurfaceVariant }]}>{user?.email}</Text>
            </View>
          </View>
          {farm && (
            <View style={[styles.farmRow, { borderTopColor: colors.surfaceContainerHigh }]}>
              {farm.logo ? (
                <Image source={{ uri: farm.logo }} style={styles.farmLogo} />
              ) : (
                <View style={[styles.farmLogoPlaceholder, { backgroundColor: colors.primary + '20' }]}>
                  <Home size={20} color={colors.primary} strokeWidth={2} />
                </View>
              )}
              <View style={styles.farmInfo}>
                <Text style={[styles.farmName, { color: colors.onSurface }]}>{farm.name}</Text>
                {farm.city && <Text style={[styles.farmCity, { color: colors.onSurfaceVariant }]}>{farm.city}</Text>}
              </View>
            </View>
          )}
        </Card>
      </View>

      <View style={styles.section}>
        <Card variant="elevated" padding="none">
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.surfaceContainerHigh }]} onPress={() => setShowPasswordForm(!showPasswordForm)}>
            <Lock size={20} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.menuLabel, { color: colors.onSurface }]}>Change Password</Text>
            <ChevronRight size={18} color={colors.outline} strokeWidth={2} />
          </TouchableOpacity>
        </Card>

        {showPasswordForm && (
          <Card variant="filled" style={styles.passwordForm}>
            <Input label="Current Password" value={currentPassword} onChangeText={setCurrentPassword} placeholder="Enter current password" secureTextEntry />
            <Input label="New Password" value={newPassword} onChangeText={setNewPassword} placeholder="Min 6 characters" secureTextEntry />
            {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
            <Button title="Update Password" onPress={handleChangePassword} loading={loading} />
          </Card>
        )}
      </View>

      <View style={styles.section}>
        <Card variant="elevated" padding="none">
          <View style={[styles.aboutRow, { borderBottomColor: colors.surfaceContainerHigh }]}>
            <Info size={20} color={colors.onSurfaceVariant} strokeWidth={2} />
            <Text style={[styles.aboutLabel, { color: colors.onSurface }]}>{t.profile.aboutApp}</Text>
            <Text style={[styles.aboutValue, { color: colors.onSurfaceVariant }]}>{t.profile.version} 1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: colors.onSurfaceVariant }]}>Role</Text>
            <Text style={[styles.aboutValue, { color: colors.onSurface }]}>{user?.role || 'USER'}</Text>
          </View>
        </Card>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.containerPadding, paddingTop: 60, marginBottom: spacing.xxl },
  title: { ...typography.headlineLg, fontWeight: '800' },
  section: { marginHorizontal: spacing.containerPadding, marginBottom: spacing.xxl },
  profileRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.lg, borderBottomWidth: 1, gap: spacing.md,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.titleMd, fontWeight: '800' },
  profileInfo: { flex: 1 },
  profileName: { ...typography.titleMd, fontWeight: '700' },
  profileEmail: { ...typography.bodySm, marginTop: 2 },
  farmRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.lg, gap: spacing.md, borderTopWidth: 1,
  },
  farmLogo: { width: 40, height: 40, borderRadius: 20, resizeMode: 'cover' },
  farmLogoPlaceholder: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  farmInfo: { flex: 1 },
  farmName: { ...typography.titleMd, fontWeight: '700' },
  farmCity: { ...typography.bodySm, marginTop: 1 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.lg, paddingHorizontal: spacing.lg,
    borderBottomWidth: 1, gap: spacing.md,
  },
  menuLabel: { ...typography.bodyMd, flex: 1, fontWeight: '600' },
  passwordForm: { marginTop: spacing.md, padding: spacing.lg },
  error: { ...typography.bodySm, marginBottom: spacing.md },
  aboutRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: spacing.lg, paddingHorizontal: spacing.lg,
    borderBottomWidth: 1, gap: spacing.md,
  },
  aboutLabel: { ...typography.bodyMd, flex: 1, fontWeight: '600' },
  aboutValue: { ...typography.bodySm },
});
