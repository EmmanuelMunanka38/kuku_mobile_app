import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Package } from 'lucide-react-native';

import Card from '../../components/ui/Card';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { formatPrice } from '../../utils/currency';
import { useLanguageStore } from '../../i18n';
import api from '../../services/api';
import type { Order } from '../../types';

const statusColors: Record<string, string> = {
  PENDING: '#F9A825',
  CONFIRMED: '#7CB342',
  PROCESSING: '#29B6F6',
  SHIPPED: '#1565C0',
  DELIVERED: '#2E7D32',
  CANCELLED: '#C62828',
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const colors = useThemeStore((s) => s.colors);
  const { t } = useLanguageStore();
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch {}
  };

  useEffect(() => { fetchOrders(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.onSurface }]}>{t.orders.title}</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{orders.length} {t.orders.items}</Text>
      </View>

      <View style={styles.list}>
        {orders.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Package size={48} color={colors.outline} strokeWidth={1.5} />
            <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>{t.orders.empty}</Text>
            <Text style={[styles.emptySub, { color: colors.onSurfaceVariant }]}>{t.orders.emptySubtitle}</Text>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id} variant="elevated" style={styles.orderCard}>
              <View style={styles.orderTop}>
                <Text style={[styles.orderId, { color: colors.onSurface }]}>Order #{order.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: (statusColors[order.status] || '#999') + '20' }]}>
                  <Text style={[styles.statusText, { color: statusColors[order.status] || '#999' }]}>{order.status}</Text>
                </View>
              </View>
              <Text style={[styles.orderDate, { color: colors.onSurfaceVariant }]}>{new Date(order.createdAt).toLocaleDateString()}</Text>
              {order.items?.map((item) => (
                <View key={item.id} style={styles.orderItem}>
                  <Text style={[styles.itemName, { color: colors.onSurface }]}>{item.product.name} ×{item.quantity}</Text>
                  <Text style={[styles.itemPrice, { color: colors.onSurfaceVariant }]}>{formatPrice(item.price * item.quantity)}</Text>
                </View>
              ))}
              <View style={[styles.orderTotal, { borderTopColor: colors.surfaceContainerHigh }]}>
                <Text style={[styles.totalLabel, { color: colors.onSurface }]}>{t.orders.orderTotal}</Text>
                <Text style={[styles.totalPrice, { color: colors.primary }]}>{formatPrice(order.total)}</Text>
              </View>
            </Card>
          ))
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.containerPadding, paddingTop: 60, marginBottom: spacing.xxl },
  title: { ...typography.headlineLg, fontWeight: '800' },
  subtitle: { ...typography.bodyMd, marginTop: spacing.xs },
  list: { paddingHorizontal: spacing.containerPadding },
  emptyCard: { alignItems: 'center', padding: spacing.xxxl, gap: spacing.md },
  emptyTitle: { ...typography.titleMd, fontWeight: '700' },
  emptySub: { ...typography.bodyMd, textAlign: 'center' },
  orderCard: { marginBottom: spacing.md },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  orderId: { ...typography.titleMd, fontWeight: '700' },
  statusBadge: { paddingHorizontal: spacing.md, paddingVertical: 2, borderRadius: borderRadius.full },
  statusText: { ...typography.labelSm, fontWeight: '800' },
  orderDate: { ...typography.bodySm, marginBottom: spacing.md },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  itemName: { ...typography.bodyMd, flex: 1 },
  itemPrice: { ...typography.bodyMd, fontWeight: '600' },
  orderTotal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1 },
  totalLabel: { ...typography.titleMd, fontWeight: '700' },
  totalPrice: { ...typography.titleMd, fontWeight: '800' },
});
