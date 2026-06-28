import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Bell, BellRing, CheckCheck, Trash2, ShoppingBag, Tag, Info } from 'lucide-react-native';
import Card from '../../components/ui/Card';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { useLanguageStore } from '../../i18n';
import type { ThemeColors } from '../../constants/themes';

interface Notification {
  id: string;
  type: 'order' | 'promo' | 'system';
  title: string;
  description: string;
  time: Date;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Order Update',
    description: 'Your order #1024 has been confirmed',
    time: new Date(Date.now() - 2 * 60 * 1000),
    read: false,
  },
  {
    id: '2',
    type: 'order',
    title: 'Order Update',
    description: 'Your order #1023 has been shipped',
    time: new Date(Date.now() - 60 * 60 * 1000),
    read: false,
  },
  {
    id: '3',
    type: 'promo',
    title: 'Special Offer',
    description: 'Get 20% off on Fresh Chicken today!',
    time: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'System Update',
    description: 'Welcome to KukuMart! Start exploring farms near you.',
    time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    read: true,
  },
];

function timeAgo(date: Date, t: any): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t.notificationsScreen.now;
  if (minutes < 60) return t.notificationsScreen.minutesAgo.replace('{minutes}', String(minutes));
  if (hours < 24) return t.notificationsScreen.hoursAgo.replace('{hours}', String(hours));
  return t.notificationsScreen.daysAgo.replace('{days}', String(days));
}

const iconMap: Record<string, React.ComponentType<any>> = {
  order: ShoppingBag,
  promo: Tag,
  system: Info,
};

function iconBg(c: ThemeColors, type: string): string {
  const map: Record<string, string> = {
    order: c.primary + '20',
    promo: c.success + '20',
    system: c.tertiary + '20',
  };
  return map[type] || c.surfaceContainerHigh;
}

function iconColor(c: ThemeColors, type: string): string {
  const map: Record<string, string> = {
    order: c.primary,
    promo: c.success,
    system: c.tertiary,
  };
  return map[type] || c.onSurfaceVariant;
}

export default function NotificationsScreen() {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useLanguageStore();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    Alert.alert('', t.notificationsScreen.allRead);
  };

  const clearAll = () => {
    setNotifications([]);
    Alert.alert('', t.notificationsScreen.cleared);
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const hasNotifications = notifications.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.surfaceContainerHigh }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: colors.onSurface }]}>{t.notificationsScreen.title}</Text>
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.badgeText, { color: colors.onPrimary }]}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          {hasNotifications && unreadCount > 0 && (
            <TouchableOpacity onPress={markAllRead} style={styles.headerBtn}>
              <CheckCheck size={20} color={colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          )}
          {hasNotifications && (
            <TouchableOpacity onPress={clearAll} style={styles.headerBtn}>
              <Trash2 size={20} color={colors.error} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!hasNotifications ? (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceContainerLow }]}>
              <Bell size={48} color={colors.outline} strokeWidth={1.5} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>{t.notificationsScreen.empty}</Text>
            <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}>{t.notificationsScreen.emptySubtitle}</Text>
          </View>
        ) : (
          notifications.map((notification) => {
            const Icon = iconMap[notification.type];
            return (
              <TouchableOpacity
                key={notification.id}
                onPress={() => toggleRead(notification.id)}
                activeOpacity={0.7}
              >
                <Card
                  variant={notification.read ? 'filled' : 'elevated'}
                  style={styles.notifCard}
                  padding="md"
                >
                  <View style={styles.notifRow}>
                    <View style={[styles.notifIcon, { backgroundColor: iconBg(colors, notification.type) }]}>
                      <Icon size={20} color={iconColor(colors, notification.type)} strokeWidth={2} />
                    </View>
                    <View style={styles.notifContent}>
                      <View style={styles.notifTop}>
                        <Text
                          style={[
                            styles.notifTitle,
                            { color: colors.onSurface },
                            !notification.read && styles.notifUnread,
                          ]}
                        >
                          {notification.title}
                        </Text>
                        {!notification.read && (
                          <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                        )}
                      </View>
                      <Text
                        style={[styles.notifDesc, { color: colors.onSurfaceVariant }]}
                        numberOfLines={2}
                      >
                        {notification.description}
                      </Text>
                      <Text style={[styles.notifTime, { color: colors.outline }]}>
                        {timeAgo(notification.time, t)}
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.containerPadding, paddingTop: 60, paddingBottom: spacing.lg,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { ...typography.headlineLg, fontWeight: '800' },
  badge: {
    minWidth: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { ...typography.labelSm, fontWeight: '800' },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  headerBtn: { padding: spacing.sm },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.containerPadding, gap: spacing.md, paddingBottom: 40 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xxl },
  emptyTitle: { ...typography.titleLg, fontWeight: '700', marginBottom: spacing.xs },
  emptySubtitle: { ...typography.bodyMd, textAlign: 'center' },
  notifCard: { marginBottom: 0 },
  notifRow: { flexDirection: 'row', gap: spacing.md },
  notifIcon: { width: 44, height: 44, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1 },
  notifTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  notifTitle: { ...typography.bodyMd, fontWeight: '600', flex: 1 },
  notifUnread: { fontWeight: '800' },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  notifDesc: { ...typography.bodySm, marginTop: 2 },
  notifTime: { ...typography.labelSm, marginTop: spacing.xs },
});
