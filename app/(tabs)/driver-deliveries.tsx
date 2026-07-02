import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Package, MapPin, ChevronRight, Truck } from 'lucide-react-native';
import Card from '../../components/ui/Card';
import Chip from '../../components/ui/Chip';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { useLanguageStore } from '../../i18n';
import api from '../../services/api';

interface Delivery {
  id: number;
  status: string;
  deliveryAddress?: string;
  total: number;
  createdAt: string;
  phone?: string;
  items?: { id: number; quantity: number; product: { name: string; price: number } }[];
}

const STATUSES = ['ALL', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const statusColor: Record<string, string> = {
  PENDING: '#F9A825', CONFIRMED: '#7CB342', PROCESSING: '#29B6F6',
  SHIPPED: '#1565C0', DELIVERED: '#2E7D32', CANCELLED: '#C62828',
};

export default function DriverDeliveries() {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useLanguageStore();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const fetchDeliveries = async () => {
    try {
      const res = await api.get('/orders/driver');
      setDeliveries(res.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeliveries(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDeliveries();
    setRefreshing(false);
  };

  const filtered = filter === 'ALL' ? deliveries : deliveries.filter((d) => d.status === filter);

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.onSurface }]}>My Deliveries</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{deliveries.length} total</Text>
      </View>

      <View style={styles.filters}>
        {STATUSES.map((s) => (
          <Chip key={s} label={s} active={filter === s} onPress={() => setFilter(s)} />
        ))}
      </View>

      <View style={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Truck size={48} color={colors.outline} strokeWidth={1.5} />
            <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>No deliveries found</Text>
          </View>
        ) : (
          filtered.map((delivery) => (
            <TouchableOpacity
              key={delivery.id}
              onPress={() => router.push(`/(driver)/delivery/${delivery.id}`)}
              activeOpacity={0.7}
            >
              <Card variant="elevated" style={styles.deliveryCard}>
                <View style={styles.deliveryRow}>
                  <View style={[styles.iconWrap, { backgroundColor: (statusColor[delivery.status] || '#999') + '15' }]}>
                    <Package size={20} color={statusColor[delivery.status] || '#999'} strokeWidth={2} />
                  </View>
                  <View style={styles.deliveryInfo}>
                    <Text style={[styles.deliveryAddress, { color: colors.onSurface }]} numberOfLines={1}>
                      {delivery.deliveryAddress || 'No address'}
                    </Text>
                    <Text style={[styles.deliveryMeta, { color: colors.onSurfaceVariant }]}>
                      {delivery.items?.length || 0} items · Order #{delivery.id}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: (statusColor[delivery.status] || '#999') + '20' }]}>
                      <Text style={[styles.statusText, { color: statusColor[delivery.status] || '#999' }]}>{delivery.status}</Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color={colors.outline} strokeWidth={2} />
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: spacing.containerPadding, paddingTop: 60, marginBottom: spacing.lg },
  title: { ...typography.headlineLg, fontWeight: '800' },
  subtitle: { ...typography.bodyMd, marginTop: spacing.xs },
  filters: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.containerPadding, marginBottom: spacing.lg },
  list: { paddingHorizontal: spacing.containerPadding },
  deliveryCard: { marginBottom: spacing.sm },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  deliveryInfo: { flex: 1 },
  deliveryAddress: { ...typography.bodyMd, fontWeight: '600' },
  deliveryMeta: { ...typography.bodySm, marginTop: 2 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full, marginTop: spacing.xs },
  statusText: { ...typography.labelSm, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: spacing.massive, gap: spacing.md },
  emptyText: { ...typography.bodyMd, textAlign: 'center' },
});
