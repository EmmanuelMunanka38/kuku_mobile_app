import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { ArrowLeft, Package, MapPin, CheckCircle, Circle, Truck } from 'lucide-react-native';
import MapView, { UrlTile, Marker, Polyline } from 'react-native-maps';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { formatPrice } from '../../utils/currency';
import { useLanguageStore } from '../../i18n';
import api from '../../services/api';
import type { Order } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const statusFlow = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const statusColors: Record<string, string> = {
  PENDING: '#F9A825',
  CONFIRMED: '#7CB342',
  PROCESSING: '#29B6F6',
  SHIPPED: '#1565C0',
  DELIVERED: '#2E7D32',
  CANCELLED: '#C62828',
};

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeStore((s) => s.colors);
  const isDark = useThemeStore((s) => s.isDark);
  const { t } = useLanguageStore();
  const mapRef = useRef<MapView>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
      setLoading(false);
    } catch {
      setError('Failed to load order');
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const currentStep = order ? statusFlow.indexOf(order.status) : -1;

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
        <Text style={[styles.errorText, { color: colors.error }]}>{error || 'Order not found'}</Text>
        <Button title={t.common.retry} onPress={() => { setLoading(true); setError(''); fetchOrder(); }} variant="outline" style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  const hasLocation = !!(order.deliveryLatitude && order.deliveryLongitude);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { backgroundColor: colors.surfaceContainerLowest }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(20,20,20,0.95)' : 'rgba(255,255,255,0.95)' }]}>
          <ArrowLeft size={22} color={colors.onSurface} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>{t.orders.tracking}</Text>
          <Text style={[styles.headerSub, { color: colors.onSurfaceVariant }]}>Order #{order.id}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: (statusColors[order.status] || '#999') + '20' }]}>
          <Text style={[styles.statusText, { color: statusColors[order.status] || '#999' }]}>{order.status}</Text>
        </View>
      </View>

      <View style={styles.mapSection}>
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={hasLocation ? {
              latitude: order.deliveryLatitude!,
              longitude: order.deliveryLongitude!,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            } : {
              latitude: -6.3690,
              longitude: 34.8888,
              latitudeDelta: 5,
              longitudeDelta: 5,
            }}
          >
            <UrlTile
              urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
              flipY={false}
            />
            {hasLocation && (
              <Marker
                coordinate={{
                  latitude: order.deliveryLatitude!,
                  longitude: order.deliveryLongitude!,
                }}
                title={t.orders.deliveredTo}
                description={order.deliveryAddress || ''}
              >
                <View style={[styles.markerPin, { backgroundColor: colors.primary }]}>
                  <MapPin size={20} color={colors.onPrimary} strokeWidth={2.5} />
                </View>
              </Marker>
            )}
          </MapView>
        </View>
        <Text style={[styles.deliveryAddress, { color: colors.onSurfaceVariant }]}>
          <MapPin size={14} color={colors.primary} strokeWidth={2} /> {order.deliveryAddress || 'Delivery location not set'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{t.orders.orderStatus}</Text>
        <Card variant="elevated" style={styles.statusCard}>
          {statusFlow.map((status, index) => {
            const isCompleted = currentStep >= index;
            const isCurrent = currentStep === index;
            const isCancelled = order.status === 'CANCELLED';
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
                    {t.orders[status.toLowerCase() as keyof typeof t.orders] || status}
                  </Text>
                </View>
              </View>
            );
          })}
          {order.status === 'CANCELLED' && (
            <View style={[styles.cancelledBanner, { backgroundColor: colors.error + '15' }]}>
              <Text style={[styles.cancelledText, { color: colors.error }]}>This order has been cancelled</Text>
            </View>
          )}
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Order Details</Text>
        <Card variant="elevated" style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>Order ID</Text>
            <Text style={[styles.detailValue, { color: colors.onSurface }]}>#{order.id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>Date</Text>
            <Text style={[styles.detailValue, { color: colors.onSurface }]}>{new Date(order.createdAt).toLocaleDateString()}</Text>
          </View>
          {order.phone && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>Phone</Text>
              <Text style={[styles.detailValue, { color: colors.onSurface }]}>{order.phone}</Text>
            </View>
          )}
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{t.orders.items}</Text>
        <Card variant="elevated" style={styles.itemsCard}>
          {order.items?.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.itemLeft}>
                <Package size={16} color={colors.primary} strokeWidth={2} />
                <Text style={[styles.itemName, { color: colors.onSurface }]}>{item.product.name} ×{item.quantity}</Text>
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
  mapContainer: { borderRadius: borderRadius.xl, overflow: 'hidden', height: 220 },
  map: { width: '100%', height: '100%' },
  markerPin: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  deliveryAddress: { ...typography.bodySm, marginTop: spacing.sm, textAlign: 'center' },

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
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  detailLabel: { ...typography.bodyMd },
  detailValue: { ...typography.bodyMd, fontWeight: '600' },
  itemsCard: { padding: spacing.xxl },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  itemName: { ...typography.bodyMd },
  itemPrice: { ...typography.bodyMd, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1 },
  totalLabel: { ...typography.titleMd, fontWeight: '700' },
  totalPrice: { ...typography.titleMd, fontWeight: '800' },
});
