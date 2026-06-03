import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { MapPin, Star, Bell, CreditCard, HelpCircle, Settings, Home, ClipboardList, Pencil, Plus, Globe, ChevronRight, LogOut, Moon, Sun } from 'lucide-react-native';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../i18n';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const colors = useThemeStore((s) => s.colors);
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isFarmer = user?.role === 'FARMER';
  const { t, language, setLanguage } = useLanguageStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/role-select');
  };

  const comingSoon = (feature: string) => Alert.alert(feature, 'This feature is coming soon!');

  const menuItems = [
    { icon: MapPin, label: t.profile.myAddresses, onPress: () => router.push('/(tabs)/addresses') },
    { icon: Star, label: t.profile.favorites, onPress: () => router.push('/(tabs)/favorites') },
    { icon: Bell, label: t.profile.notifications, onPress: () => comingSoon(t.profile.notifications) },
    { icon: CreditCard, label: t.profile.paymentMethods, onPress: () => comingSoon(t.profile.paymentMethods) },
    { icon: HelpCircle, label: t.profile.helpSupport, onPress: () => router.push('/(tabs)/help') },
  ];

  const farmerMenu = [
    { icon: Home, label: t.farmer.dashboard, onPress: () => router.push('/(tabs)/dashboard') },
    { icon: ClipboardList, label: t.farmer.manageProducts, onPress: () => router.push('/(tabs)/manage-products') },
    { icon: Pencil, label: t.farmer.editFarm, onPress: () => router.push('/(farmer)/edit-farm') },
    { icon: Plus, label: t.farmer.addProduct, onPress: () => router.push('/(farmer)/add-product') },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { borderBottomColor: colors.surfaceContainerHigh }]}>
        <Text style={[styles.title, { color: colors.onSurface }]}>{t.profile.title}</Text>
      </View>

      <View style={styles.profileCard}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.white }]}>{(user?.name || 'U')[0].toUpperCase()}</Text>
        </View>
        <Text style={[styles.profileName, { color: colors.onSurface }]}>{user?.name || 'User'}</Text>
        <Text style={[styles.profileEmail, { color: colors.onSurfaceVariant }]}>{user?.email || ''}</Text>
        <View style={[styles.roleBadge, { backgroundColor: colors.primaryFixed }]}>
          <Text style={[styles.roleText, { color: colors.primary }]}>{user?.role || 'USER'}</Text>
        </View>
      </View>

      {isFarmer && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{t.profile.farmManagement}</Text>
          <Card variant="elevated" padding="none">
            {farmerMenu.map((item, i) => (
              <TouchableOpacity key={i} onPress={item.onPress} style={[styles.menuItem, { borderBottomColor: colors.surfaceContainerHigh }]}>
                <item.icon size={20} color={colors.primary} strokeWidth={2} />
                <Text style={[styles.menuLabel, { color: colors.onSurface }]}>{item.label}</Text>
                <ChevronRight size={18} color={colors.outline} strokeWidth={2} />
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      )}

      <View style={styles.section}>
        <Card variant="elevated" padding="none">
          {menuItems.map((item, i) => (
            <TouchableOpacity key={i} onPress={item.onPress} style={[styles.menuItem, { borderBottomColor: colors.surfaceContainerHigh }]}>
              <item.icon size={20} color={colors.onSurfaceVariant} strokeWidth={2} />
              <Text style={[styles.menuLabel, { color: colors.onSurface }]}>{item.label}</Text>
              <ChevronRight size={18} color={colors.outline} strokeWidth={2} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.menuItem} onPress={() => toggleTheme()}>
            {isDark ? <Sun size={20} color={colors.onSurfaceVariant} strokeWidth={2} /> : <Moon size={20} color={colors.onSurfaceVariant} strokeWidth={2} />}
            <Text style={[styles.menuLabel, { color: colors.onSurface }]}>{isDark ? t.profile.lightMode : t.profile.darkMode}</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.surfaceContainerHigh, true: colors.primary }}
              thumbColor={colors.white}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => setLanguage(language === 'en' ? 'sw' : 'en')}>
            <Globe size={20} color={colors.onSurfaceVariant} strokeWidth={2} />
            <Text style={[styles.menuLabel, { color: colors.onSurface }]}>{t.language.selectLanguage}</Text>
            <Text style={[styles.menuValue, { color: colors.primary }]}>{language === 'en' ? 'English' : 'Kiswahili'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/settings')}>
            <Settings size={20} color={colors.onSurfaceVariant} strokeWidth={2} />
            <Text style={[styles.menuLabel, { color: colors.onSurface }]}>{t.profile.settings}</Text>
            <ChevronRight size={18} color={colors.outline} strokeWidth={2} />
          </TouchableOpacity>
        </Card>
      </View>

      <View style={styles.logoutSection}>
        <Button
          title={t.auth.logout}
          variant="outline"
          onPress={handleLogout}
          icon={<LogOut size={18} color={colors.primary} strokeWidth={2} />}
        />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.containerPadding, paddingTop: 60, paddingBottom: spacing.lg, borderBottomWidth: 1 },
  title: { ...typography.headlineLg, fontWeight: '800' },
  profileCard: {
    alignItems: 'center', paddingVertical: spacing.xxl,
    marginHorizontal: spacing.containerPadding, marginBottom: spacing.xxl,
    position: 'relative',
  },
  logo: { width: 40, height: 40, position: 'absolute', top: -10, right: 0, opacity: 0.15 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatarText: { ...typography.headlineLg, fontWeight: '800' },
  profileName: { ...typography.headlineMd, fontWeight: '800' },
  profileEmail: { ...typography.bodyMd, marginTop: spacing.xs },
  roleBadge: { marginTop: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  roleText: { ...typography.labelMd, fontWeight: '800' },
  section: { marginHorizontal: spacing.containerPadding, marginBottom: spacing.xxl },
  sectionTitle: { ...typography.titleMd, fontWeight: '800', marginBottom: spacing.md },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.lg, paddingHorizontal: spacing.lg,
    borderBottomWidth: 1, gap: spacing.md,
  },
  menuLabel: { ...typography.bodyMd, flex: 1, fontWeight: '600' },
  menuValue: { ...typography.labelSm, fontWeight: '700' },
  logoutSection: { marginHorizontal: spacing.containerPadding, marginBottom: spacing.xxl },
});
