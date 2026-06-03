import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { Plus, ClipboardList, Settings, Package, Phone, User } from 'lucide-react-native';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { formatPrice } from '../../utils/currency';
import { useLanguageStore } from '../../i18n';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const STATUS_FLOW: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

const statusColors: Record<string, string> = {
  PENDING: '#F9A825',
  CONFIRMED: '#7CB342',
  PROCESSING: '#29B6F6',
  SHIPPED: '#1565C0',
  DELIVERED: '#2E7D32',
  CANCELLED: '#C62828',
};

export default function FarmerDashboard() {
  const { user } = useAuthStore();
  const colors = useThemeStore((s) => s.colors);
  const { t } = useLanguageStore();
  const [farm, setFarm] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const { data: farmData } = await api.get('/farms/my-farm');
      setFarm(farmData);
      const { data: ordersData } = await api.get('/orders/farm');
      setOrders(ordersData);
    } catch {}
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleStatusUpdate = async (orderId: number, status: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      Alert.alert(t.farmer.statusUpdated);
    } catch (e: any) {
      Alert.alert(t.common.error, e.response?.data?.error || t.farmer.statusUpdateFailed);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={[styles.header, { borderBottomColor: colors.surfaceContainerHigh }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.onSurfaceVariant }]}>{t.farmer.welcomeBack}</Text>
          <Text style={[styles.name, { color: colors.onSurface }]}>{user?.name || 'Farmer'}</Text>
        </View>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      </View>

      {farm ? (
        <View style={[styles.farmCard, { backgroundColor: colors.primary }]}>
          <Text style={[styles.farmName, { color: colors.white }]}>{farm.name}</Text>
          <Text style={[styles.farmLocation, { color: colors.primaryFixed }]}>📍 {farm.city || farm.address || 'Local Farm'}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.white }]}>{farm.products?.length || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.primaryFixedDim }]}>{t.farmer.products}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.white }]}>{farm.rating || '-'}</Text>
              <Text style={[styles.statLabel, { color: colors.primaryFixedDim }]}>{t.farmer.rating}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.white }]}>{orders.length}</Text>
              <Text style={[styles.statLabel, { color: colors.primaryFixedDim }]}>{t.farmer.orders}</Text>
            </View>
          </View>
        </View>
      ) : (
        <Card style={styles.noFarm}>
          <Text style={[styles.noFarmText, { color: colors.onSurfaceVariant }]}>{t.farmer.noFarm}</Text>
          <TouchableOpacity style={[styles.createFarmBtn, { backgroundColor: colors.primary }]} onPress={() => router.push('/(farmer)/edit-farm')}>
            <Text style={[styles.createFarmText, { color: colors.white }]}>{t.farmer.createFarm}</Text>
          </TouchableOpacity>
        </Card>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.surfaceContainerLowest }]} onPress={() => router.push('/(farmer)/add-product')}>
          <View style={[styles.actionIconWrap, { backgroundColor: colors.primary + '15' }]}>
            <Plus size={24} color={colors.primary} strokeWidth={2.5} />
          </View>
          <Text style={[styles.actionLabel, { color: colors.onSurface }]}>{t.farmer.addProduct}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.surfaceContainerLowest }]} onPress={() => router.push('/(tabs)/manage-products')}>
          <View style={[styles.actionIconWrap, { backgroundColor: colors.primary + '15' }]}>
            <ClipboardList size={24} color={colors.primary} strokeWidth={2.5} />
          </View>
          <Text style={[styles.actionLabel, { color: colors.onSurface }]}>{t.farmer.manageProducts}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.surfaceContainerLowest }]} onPress={() => router.push('/(farmer)/edit-farm')}>
          <View style={[styles.actionIconWrap, { backgroundColor: colors.primary + '15' }]}>
            <Settings size={24} color={colors.primary} strokeWidth={2.5} />
          </View>
          <Text style={[styles.actionLabel, { color: colors.onSurface }]}>{t.farmer.editFarm}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{t.farmer.recentOrders}</Text>
        {orders.length === 0 ? (
          <Card variant="filled">
            <View style={styles.emptyOrders}>
              <Package size={32} color={colors.outline} strokeWidth={1.5} />
              <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>{t.farmer.noOrders}</Text>
            </View>
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

              {order.user && (
                <View style={styles.customerRow}>
                  <User size={14} color={colors.onSurfaceVariant} strokeWidth={2} />
                  <Text style={[styles.customerName, { color: colors.onSurfaceVariant }]}>{order.user.name}</Text>
                  {order.user.phone && (
                    <>
                      <Phone size={14} color={colors.onSurfaceVariant} strokeWidth={2} />
                      <Text style={[styles.customerName, { color: colors.onSurfaceVariant }]}>{order.user.phone}</Text>
                    </>
                  )}
                </View>
              )}

              <Text style={[styles.orderDate, { color: colors.onSurfaceVariant }]}>{new Date(order.createdAt).toLocaleDateString()}</Text>

              {order.items?.map((item: any) => (
                <View key={item.id} style={styles.orderItem}>
                  <Text style={[styles.itemName, { color: colors.onSurface }]}>{item.product.name} ×{item.quantity}</Text>
                  <Text style={[styles.itemPrice, { color: colors.onSurfaceVariant }]}>{formatPrice(item.price * item.quantity)}</Text>
                </View>
              ))}

              <View style={[styles.orderTotal, { borderTopColor: colors.surfaceContainerHigh }]}>
                <Text style={[styles.totalLabel, { color: colors.onSurface }]}>Total</Text>
                <Text style={[styles.totalPrice, { color: colors.primary }]}>{formatPrice(order.total)}</Text>
              </View>

              {STATUS_FLOW[order.status]?.length > 0 && (
                <View style={styles.statusActions}>
                  {STATUS_FLOW[order.status].map((nextStatus) => (
                    <TouchableOpacity
                      key={nextStatus}
                      style={[
                        styles.statusBtn,
                        { backgroundColor: nextStatus === 'CANCELLED' ? colors.errorContainer : colors.primary + '15' },
                      ]}
                      onPress={() => handleStatusUpdate(order.id, nextStatus)}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          { color: nextStatus === 'CANCELLED' ? colors.onErrorContainer : colors.primary },
                        ]}
                      >
                        {nextStatus === 'CONFIRMED' && t.farmer.markConfirmed}
                        {nextStatus === 'PROCESSING' && t.farmer.markProcessing}
                        {nextStatus === 'SHIPPED' && t.farmer.markShipped}
                        {nextStatus === 'DELIVERED' && t.farmer.markDelivered}
                        {nextStatus === 'CANCELLED' && t.farmer.markCancelled}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
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
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.containerPadding, paddingTop: 60, paddingBottom: spacing.lg,
    borderBottomWidth: 1,
  },
  greeting: { ...typography.bodyMd, fontWeight: '600' },
  name: { ...typography.headlineMd, fontWeight: '800' },
  logo: { width: 48, height: 48, opacity: 0.8 },
  farmCard: { marginHorizontal: spacing.containerPadding, marginBottom: spacing.xxl, borderRadius: borderRadius.xl, padding: spacing.xxl },
  farmName: { ...typography.headlineMd, fontWeight: '800' },
  farmLocation: { ...typography.bodyMd, marginTop: spacing.xs },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.xxl },
  stat: { alignItems: 'center' },
  statValue: { ...typography.headlineMd, fontWeight: '800' },
  statLabel: { ...typography.labelSm, fontWeight: '700', marginTop: 2 },
  noFarm: { marginHorizontal: spacing.containerPadding, marginBottom: spacing.xxl, alignItems: 'center', padding: spacing.xxl },
  noFarmText: { ...typography.bodyLg, marginBottom: spacing.md },
  createFarmBtn: { paddingHorizontal: spacing.xxl, paddingVertical: spacing.md, borderRadius: borderRadius.lg },
  createFarmText: { ...typography.labelMd, fontWeight: '800' },
  actions: { flexDirection: 'row', paddingHorizontal: spacing.containerPadding, gap: spacing.md, marginBottom: spacing.xxl },
  actionCard: {
    flex: 1, borderRadius: borderRadius.xl, padding: spacing.lg, alignItems: 'center', gap: spacing.sm,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  actionIconWrap: { width: 44, height: 44, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { ...typography.labelSm, fontWeight: '700' },
  section: { paddingHorizontal: spacing.containerPadding, marginBottom: spacing.xxl },
  sectionTitle: { ...typography.headlineSm, fontWeight: '800', marginBottom: spacing.md },
  emptyOrders: { alignItems: 'center', padding: spacing.lg, gap: spacing.sm },
  emptyText: { ...typography.bodyMd },
  orderCard: { marginBottom: spacing.md },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  orderId: { ...typography.titleMd, fontWeight: '700' },
  statusBadge: { paddingHorizontal: spacing.md, paddingVertical: 2, borderRadius: borderRadius.full },
  statusText: { ...typography.labelSm, fontWeight: '800' },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.xs },
  customerName: { ...typography.bodySm, fontWeight: '600' },
  orderDate: { ...typography.bodySm, marginBottom: spacing.md },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  itemName: { ...typography.bodyMd, flex: 1 },
  itemPrice: { ...typography.bodyMd, fontWeight: '600' },
  orderTotal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1 },
  totalLabel: { ...typography.titleMd, fontWeight: '700' },
  totalPrice: { ...typography.titleMd, fontWeight: '800' },
  statusActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' },
  statusBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  statusBtnText: { ...typography.labelSm, fontWeight: '800' },
});
