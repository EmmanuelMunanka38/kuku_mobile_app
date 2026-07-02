import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { ArrowLeft, MapPin, Package, Phone, CheckCircle, Circle, Truck, Clock } from 'lucide-react-native';
import Mapbox from '@rnmapbox/maps';
import { MAPBOX_STYLE } from '../../../constants/map';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useThemeStore } from '../../../constants/themes';
import { typography } from '../../../constants/typography';
import { spacing, borderRadius } from '../../../constants/spacing';
import { formatPrice } from '../../../utils/currency';
import { useLanguageStore } from '../../../i18n';
import api from '../../../services/api';
import type { Order } from '../../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const statusFlow = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const statusColors: Record<string, string> = {
  PENDING: '#F9A825', CONFIRMED: '#7CB342', PROCESSING: '#29B6F6',
  SHIPPED: '#1565C0', DELIVERED: '#2E7D32', CANCELLED: '#C62828',
};

export default function DeliveryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeStore((s) => s.colors);
  const isDark = useThemeStore((s) => s.isDark);
  const { t } = useLanguageStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch {
      setError('Failed to load delivery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleMarkDelivered = async () => {
    setUpdating(true);
    try {
      await api.patch(`/orders/${id}/status`, { status: 'DELIVERED' });
      await fetchOrder();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const currentStep = order ? statusFlow.indexOf(order.status) : -1;
  const isDelivered = order?.status === 'DELIVERED';
  const isCancelled = order?.status === 'CANCELLED';
  const hasLocation = !!(order?.deliveryLatitude && order?.deliveryLongitude);
  const canMarkDelivered = order?.status === 'SHIPPED';

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error || 'Delivery not found'}</Text>
        <Button title="Go Back" variant="outline" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { backgroundColor: colors.surfaceContainerLowest }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(20,20,20,0.95)' : 'rgba(255,255,255,0.95)' }]}>
          <ArrowLeft size={22} color={colors.onSurface} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Delivery #{order.id}</Text>
          <Text style={[styles.headerSub, { color: colors.onSurfaceVariant }]}>{new Date(order.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: (statusColors[order.status] || '#999') + '20' }]}>
          <Text style={[styles.statusText, { color: statusColors[order.status] || '#999' }]}>{order.status}</Text>
        </View>
      </View>

      {hasLocation && (
        <View style={styles.mapSection}>
          <View style={styles.mapContainer}>
            <Mapbox.MapView style={styles.map} styleURL={MAPBOX_STYLE} scrollEnabled={false} zoomEnabled={false} rotateEnabled={false} pitchEnabled={false}>
              <Mapbox.Camera
                defaultSettings={{
                  centerCoordinate: [order.deliveryLongitude!, order.deliveryLatitude!],
                  zoomLevel: 14,
                }}
              />
              <Mapbox.PointAnnotation id="delivery" coordinate={[order.deliveryLongitude!, order.deliveryLatitude!]}>
                <View style={[styles.markerPin, { backgroundColor: colors.primary }]}>
                  <MapPin size={20} color={colors.onPrimary} strokeWidth={2.5} />
                </View>
              </Mapbox.PointAnnotation>
            </Mapbox.MapView>
          </View>
          <Text style={[styles.deliveryAddress, { color: colors.onSurfaceVariant }]}>
            <MapPin size={14} color={colors.primary} strokeWidth={2} /> {order.deliveryAddress || 'Delivery location not set'}
          </Text>
        </View>
      )}

      {canMarkDelivered && (
        <View style={styles.actionSection}>
          <Button
            title="Mark as Delivered"
            onPress={handleMarkDelivered}
            loading={updating}
            size="lg"
            icon={<CheckCircle size={20} color={colors.white} strokeWidth={2.5} />}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{t.orders.orderStatus}</Text>
        <Card variant="elevated" style={styles.statusCard}>
          {statusFlow.map((status, index) => {
            const isCompleted = currentStep >= index;
            const isCurrent = currentStep === index;
            const color = isCancelled && !isCompleted ? colors.onSurfaceVariant : (isCompleted ? statusColors[status] : colors.outline);

            return (
              <View key={status} style={styles.statusStep}>
                <View style={styles.statusLeft}>
                  <View style={[styles.statusDot, { backgroundColor: color }]}>
                    {isCompleted && !isCurrent ? (
                      <CheckCircle size={16} color={colors.white} strokeWidth={2.5} />
                    ) : isCurrent ? (
                      <Truck size={16} color={colors.white} strokeWidth={2.5} />
                    ) : (
                      <Circle size={16} color={color} strokeWidth={2} />
                    )}
                  </View>
                  {index < statusFlow.length - 1 && (
                    <View style={[styles.statusLine, { backgroundColor: isCompleted ? color : colors.surfaceContainerHigh }]} />
                  )}
                </View>
                <View style={styles.statusRight}>
                  <Text style={[styles.statusTitle, { color: isCompleted ? color : colors.onSurfaceVariant, fontWeight: isCurrent ? '800' : '500' }]}>
                    {status}
                  </Text>
                </View>
              </View>
            );
          })}
          {isCancelled && (
            <View style={[styles.cancelledBanner, { backgroundColor: colors.error + '15' }]}>
              <Text style={[styles.cancelledText, { color: colors.error }]}>This delivery has been cancelled</Text>
            </View>
          )}
        </Card>
      </View>

      {order.phone && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Customer</Text>
          <Card variant="elevated" style={styles.detailsCard}>
            <TouchableOpacity style={styles.contactRow}>
              <Phone size={18} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.contactText, { color: colors.primary }]}>{order.phone}</Text>
            </TouchableOpacity>
            {order.deliveryAddress && (
              <View style={[styles.contactRow, { borderTopWidth: 1, borderTopColor: colors.surfaceContainerHigh, marginTop: spacing.sm, paddingTop: spacing.sm }]}>
                <MapPin size={18} color={colors.onSurfaceVariant} strokeWidth={2} />
                <Text style={[styles.contactText, { color: colors.onSurfaceVariant }]}>{order.deliveryAddress}</Text>
              </View>
            )}
          </Card>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{t.orders.items}</Text>
        <Card variant="elevated" style={styles.itemsCard}>
          {order.items?.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.itemLeft}>
                <Package size={16} color={colors.primary} strokeWidth={2} />
                <Text style={[styles.itemName, { color: colors.onSurface }]}>{item.product.name} x{item.quantity}</Text>
              </View>
              <Text style={[styles.itemPrice, { color: colors.onSurfaceVariant }]}>{formatPrice(item.price * item.quantity)}</Text>
            </View>
          ))}
          <View style={[styles.totalRow, { borderTopColor: colors.surfaceContainerHigh }]}>
            <Text style={[styles.totalLabel, { color: colors.onSurface }]}>{t.orders.orderTotal}</Text>
            <Text style={[styles.totalPrice, { color: colors.primary }]}>{formatPrice(order.total)}</Text>
          </View>
        </Card>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  errorText: { ...typography.bodyLg, textAlign: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingTop: 60,
    paddingHorizontal: spacing.containerPadding, paddingBottom: spacing.lg,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  headerContent: { flex: 1 },
  headerTitle: { ...typography.headlineMd, fontWeight: '800' },
  headerSub: { ...typography.bodySm, marginTop: 2 },
  statusBadge: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: borderRadius.full },
  statusText: { ...typography.labelSm, fontWeight: '800' },
  mapSection: { marginHorizontal: spacing.containerPadding, marginBottom: spacing.lg },
  mapContainer: { borderRadius: borderRadius.xl, overflow: 'hidden', height: 200 },
  map: { width: '100%', height: '100%' },
  markerPin: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  deliveryAddress: { ...typography.bodySm, marginTop: spacing.sm, textAlign: 'center' },
  actionSection: { paddingHorizontal: spacing.containerPadding, marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg, paddingHorizontal: spacing.containerPadding },
  sectionTitle: { ...typography.headlineSm, fontWeight: '800', marginBottom: spacing.md },
  statusCard: { padding: spacing.xxl },
  statusStep: { flexDirection: 'row', minHeight: 48 },
  statusLeft: { alignItems: 'center', width: 32, marginRight: spacing.md },
  statusDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statusLine: { width: 2, flex: 1, marginTop: 4 },
  statusRight: { flex: 1, paddingBottom: spacing.lg },
  statusTitle: { ...typography.bodyMd },
  cancelledBanner: { marginTop: spacing.md, padding: spacing.md, borderRadius: borderRadius.md },
  cancelledText: { ...typography.bodySm, fontWeight: '600', textAlign: 'center' },
  detailsCard: { padding: spacing.xxl },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  contactText: { ...typography.bodyMd, fontWeight: '600' },
  itemsCard: { padding: spacing.xxl },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  itemName: { ...typography.bodyMd },
  itemPrice: { ...typography.bodyMd, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1 },
  totalLabel: { ...typography.titleMd, fontWeight: '700' },
  totalPrice: { ...typography.titleMd, fontWeight: '800' },
});
