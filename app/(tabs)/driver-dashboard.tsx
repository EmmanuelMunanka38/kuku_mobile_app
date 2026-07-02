import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, Switch, StatusBar, FlatList, ScrollView, Animated, PanResponder } from 'react-native';
import { router } from 'expo-router';
import { Truck, Package, CheckCircle, MapPin, Clock, Menu, Phone, ChevronDown } from 'lucide-react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { MAPBOX_STYLE } from '../../constants/map';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLLAPSED_HEIGHT = SCREEN_HEIGHT * 0.42;
const EXPANDED_TOP = 100;
const SNAP_THRESHOLD = 80;

interface Delivery {
  id: number;
  status: string;
  deliveryAddress?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  total: number;
  createdAt: string;
  phone?: string;
  items?: { id: number; quantity: number; product: { name: string; price: number } }[];
}

const statusColor: Record<string, string> = {
  PENDING: '#F9A825', CONFIRMED: '#7CB342', PROCESSING: '#29B6F6',
  SHIPPED: '#1565C0', DELIVERED: '#2E7D32', CANCELLED: '#C62828',
};

export default function DriverDashboard() {
  const colors = useThemeStore((s) => s.colors);
  const { user } = useAuthStore();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const [driverLocation, setDriverLocation] = useState<[number, number]>([34.8888, -6.3690]);

  const translateY = useRef(new Animated.Value(0)).current;
  const isExpanded = useRef(false);

  const pan = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 5,
      onPanResponderGrant: () => {
        pan.setValue(0);
      },
      onPanResponderMove: (_, gs) => {
        const currentOffset = isExpanded.current ? 0 : COLLAPSED_HEIGHT - EXPANDED_TOP;
        const newVal = -gs.dy + currentOffset;
        if (newVal >= 0 && newVal <= COLLAPSED_HEIGHT - EXPANDED_TOP) {
          pan.setValue(-gs.dy);
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy < -SNAP_THRESHOLD) {
          expand();
        } else if (gs.dy > SNAP_THRESHOLD) {
          collapse();
        } else {
          isExpanded.current ? expand() : collapse();
        }
        pan.setValue(0);
      },
    })
  ).current;

  const expand = () => {
    isExpanded.current = true;
    Animated.spring(translateY, {
      toValue: COLLAPSED_HEIGHT - EXPANDED_TOP,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const collapse = () => {
    isExpanded.current = false;
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const sheetTranslate = Animated.add(pan, translateY);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        setDriverLocation([loc.coords.longitude, loc.coords.latitude]);
      }
    })();
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const res = await api.get('/orders/driver');
      setDeliveries(res.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  const activeDeliveries = deliveries.filter((d) => d.status === 'SHIPPED');
  const todayDelivered = deliveries.filter(
    (d) => d.status === 'DELIVERED' && new Date(d.createdAt).toDateString() === new Date().toDateString()
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const nextDelivery = activeDeliveries[0];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Mapbox.MapView style={styles.map} styleURL={MAPBOX_STYLE}>
        <Mapbox.Camera
          defaultSettings={{ centerCoordinate: driverLocation, zoomLevel: 14 }}
          followUserLocation
          followZoomLevel={14}
        />
        <Mapbox.PointAnnotation id="driver" coordinate={driverLocation}>
          <View style={styles.driverMarker}>
            <View style={[styles.driverMarkerInner, { backgroundColor: colors.primary }]}>
              <Truck size={18} color="#fff" strokeWidth={2.5} />
            </View>
          </View>
        </Mapbox.PointAnnotation>
        {nextDelivery?.deliveryLatitude && nextDelivery?.deliveryLongitude && (
          <Mapbox.PointAnnotation id="destination" coordinate={[nextDelivery.deliveryLongitude, nextDelivery.deliveryLatitude]}>
            <View style={styles.destinationMarker}>
              <MapPin size={18} color="#fff" strokeWidth={2.5} />
            </View>
          </Mapbox.PointAnnotation>
        )}
      </Mapbox.MapView>

      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{(user?.name || 'D')[0].toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.greeting}>
              {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}
            </Text>
            <Text style={styles.driverName}>{user?.name || 'Driver'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuBtn}>
          <Menu size={22} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.bottomSheet,
          { backgroundColor: colors.surface, transform: [{ translateY: sheetTranslate }] },
        ]}
      >
        <View {...panResponder.panHandlers} style={styles.dragHandle}>
          <View style={[styles.bottomSheetHandle, { backgroundColor: colors.outlineVariant }]} />
          <ChevronDown size={16} color={colors.onSurfaceVariant} strokeWidth={2.5} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.onlineRow}>
              <View style={styles.onlineLeft}>
                <View style={[styles.onlineDot, { backgroundColor: online ? '#2E7D32' : '#999' }]} />
                <Text style={[styles.onlineLabel, { color: colors.onSurface }]}>{online ? 'Online' : 'Offline'}</Text>
              </View>
              <Switch
                value={online}
                onValueChange={setOnline}
                trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer || '#A5D6A7' }}
                thumbColor={colors.surface}
              />
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Truck size={20} color="#1565C0" strokeWidth={2} />
                <Text style={[styles.statNumber, { color: colors.onSurface }]}>{activeDeliveries.length}</Text>
                <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Active</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.outlineVariant }]} />
              <View style={styles.statItem}>
                <CheckCircle size={20} color="#2E7D32" strokeWidth={2} />
                <Text style={[styles.statNumber, { color: colors.onSurface }]}>{todayDelivered.length}</Text>
                <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Today</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.outlineVariant }]} />
              <View style={styles.statItem}>
                <Package size={20} color={colors.primary} strokeWidth={2} />
                <Text style={[styles.statNumber, { color: colors.onSurface }]}>{deliveries.length}</Text>
                <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Total</Text>
              </View>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />

          {nextDelivery && (
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={() => router.push(`/(driver)/delivery/${nextDelivery.id}`)}
              style={[styles.activeDeliveryCard, { backgroundColor: colors.primary + '0A', borderColor: colors.primary + '30' }]}
            >
              <View style={styles.activeDeliveryHeader}>
                <View style={[styles.activeBadge, { backgroundColor: colors.primary + '18' }]}>
                  <Truck size={14} color={colors.primary} strokeWidth={2.5} />
                  <Text style={[styles.activeBadgeText, { color: colors.primary }]}>ACTIVE DELIVERY</Text>
                </View>
                <Text style={[styles.activeOrderId, { color: colors.onSurface }]}>#{nextDelivery.id}</Text>
              </View>

              <View style={styles.activeDeliveryBody}>
                <View style={styles.activeInfoRow}>
                  <MapPin size={16} color={colors.primary} strokeWidth={2} />
                  <Text style={[styles.activeInfoText, { color: colors.onSurface }]} numberOfLines={2}>
                    {nextDelivery.deliveryAddress || 'No address'}
                  </Text>
                </View>
                {nextDelivery.phone && (
                  <View style={styles.activeInfoRow}>
                    <Phone size={16} color={colors.onSurfaceVariant} strokeWidth={2} />
                    <Text style={[styles.activePhoneText, { color: colors.primary }]}>{nextDelivery.phone}</Text>
                  </View>
                )}
                <View style={styles.activeMetaRow}>
                  <Text style={[styles.activeMeta, { color: colors.onSurfaceVariant }]}>
                    {nextDelivery.items?.length || 0} items
                  </Text>
                  <Text style={[styles.activeMetaPrice, { color: colors.primary }]}>
                    TSh {nextDelivery.total.toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={[styles.activeDeliveryFooter, { borderTopColor: colors.primary + '20' }]}>
                <Text style={[styles.activeTapHint, { color: colors.primary }]}>Tap for details →</Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={[styles.divider, { backgroundColor: colors.outlineVariant }]} />

          {deliveries.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.onSurfaceVariant + '18' }]}>
                <Package size={36} color={colors.outline} strokeWidth={1.5} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.onSurfaceVariant }]}>No deliveries yet</Text>
              <Text style={[styles.emptySub, { color: colors.outline }]}>Your assigned deliveries will appear here</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={width - spacing.containerPadding * 2}
              decelerationRate="fast"
              data={deliveries}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.sliderContent}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.95}
                  onPress={() => router.push(`/(driver)/delivery/${item.id}`)}
                  style={[styles.slideCard, { backgroundColor: colors.surfaceContainer || '#FAFAFA', borderColor: colors.outlineVariant }]}
                >
                  <View style={styles.slideTop}>
                    <View style={[styles.statusBadge, { backgroundColor: (statusColor[item.status] || '#999') + '18' }]}>
                      <View style={[styles.statusDot, { backgroundColor: statusColor[item.status] || '#999' }]} />
                      <Text style={[styles.statusText, { color: statusColor[item.status] || '#999' }]}>
                        {item.status}
                      </Text>
                    </View>
                    <Text style={[styles.orderId, { color: colors.onSurfaceVariant }]}>#{item.id}</Text>
                  </View>

                  <View style={styles.slideAddress}>
                    <MapPin size={16} color={colors.primary} strokeWidth={2} />
                    <Text style={[styles.slideAddressText, { color: colors.onSurface }]} numberOfLines={2}>
                      {item.deliveryAddress || 'No address'}
                    </Text>
                  </View>

                  <View style={styles.slideMeta}>
                    <View style={styles.slideMetaItem}>
                      <Package size={14} color={colors.outline} strokeWidth={2} />
                      <Text style={[styles.slideMetaText, { color: colors.onSurfaceVariant }]}>
                        {item.items?.length || 0} items
                      </Text>
                    </View>
                    <View style={styles.slideMetaItem}>
                      <Clock size={14} color={colors.outline} strokeWidth={2} />
                      <Text style={[styles.slideMetaText, { color: colors.onSurfaceVariant }]}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.slideFooter, { borderTopColor: colors.outlineVariant }]}>
                    <Text style={[styles.slidePrice, { color: colors.primary }]}>
                      TSh {item.total.toLocaleString()}
                    </Text>
                    <View style={[styles.navigateBtn, { backgroundColor: colors.primary }]}>
                      <Truck size={16} color="#fff" strokeWidth={2.5} />
                      <Text style={styles.navigateText}>Navigate</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}

          {deliveries.length > 0 && (
            <TouchableOpacity
              style={[styles.viewAllBtn, { borderColor: colors.outlineVariant }]}
              onPress={() => router.push('/(tabs)/driver-deliveries')}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All Deliveries</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const CARD_W = width - spacing.containerPadding * 2;

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  map: { width: '100%', height: '100%' },

  driverMarker: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 6,
  },
  driverMarkerInner: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  destinationMarker: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#E53935',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 6,
  },

  topBar: {
    position: 'absolute', top: 50, left: spacing.containerPadding, right: spacing.containerPadding,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    zIndex: 10,
  },
  topBarLeft: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: borderRadius.xl,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.lg,
  },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.titleMd, fontWeight: '800', color: '#fff' },
  greeting: { ...typography.labelSm, color: 'rgba(255,255,255,0.7)' },
  driverName: { ...typography.bodyMd, fontWeight: '700', color: '#fff' },
  menuBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },

  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: SCREEN_HEIGHT - EXPANDED_TOP,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxxl,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: -4 }, elevation: 10,
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  bottomSheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    marginBottom: 2,
  },

  section: { paddingHorizontal: spacing.xxl },
  onlineRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  onlineLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  onlineDot: { width: 10, height: 10, borderRadius: 5 },
  onlineLabel: { ...typography.titleMd, fontWeight: '700' },

  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingBottom: spacing.md,
  },
  statItem: { alignItems: 'center', gap: 4 },
  statNumber: { ...typography.titleLg, fontWeight: '800' },
  statLabel: { ...typography.labelSm, fontSize: 11 },
  statDivider: { width: 1, height: 32 },

  divider: { height: 1, marginBottom: spacing.md },

  emptyState: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.xxxl * 1.5, gap: spacing.md,
  },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { ...typography.titleMd, fontWeight: '700' },
  emptySub: { ...typography.bodySm },

  sliderContent: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.sm },
  slideCard: {
    width: CARD_W,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginRight: spacing.xxl,
  },
  slideTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingVertical: 4, paddingHorizontal: spacing.md, borderRadius: 20,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  orderId: { ...typography.bodySm, fontWeight: '600' },
  slideAddress: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
    marginBottom: spacing.md,
  },
  slideAddressText: { ...typography.bodyMd, fontWeight: '600', flex: 1 },
  slideMeta: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.md },
  slideMetaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  slideMetaText: { fontSize: 12 },
  slideFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: spacing.md, borderTopWidth: 1,
  },
  slidePrice: { ...typography.titleMd, fontWeight: '800' },
  navigateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  navigateText: { ...typography.labelSm, fontWeight: '700', color: '#fff' },

  viewAllBtn: {
    alignItems: 'center', paddingVertical: spacing.md,
    marginHorizontal: spacing.xxl, marginTop: spacing.md,
    borderWidth: 1, borderRadius: borderRadius.lg,
  },
  viewAllText: { ...typography.labelLg, fontWeight: '700' },

  activeDeliveryCard: {
    marginHorizontal: spacing.xxl, marginBottom: spacing.md,
    borderRadius: borderRadius.xl, borderWidth: 1.5,
    padding: spacing.lg,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4,
  },
  activeDeliveryHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  activeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingVertical: 4, paddingHorizontal: spacing.md, borderRadius: 20,
  },
  activeBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  activeOrderId: { ...typography.titleMd, fontWeight: '800' },
  activeDeliveryBody: { gap: spacing.sm, marginBottom: spacing.md },
  activeInfoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  activeInfoText: { ...typography.bodyMd, fontWeight: '600', flex: 1 },
  activePhoneText: { ...typography.bodyMd, fontWeight: '700' },
  activeMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  activeMeta: { ...typography.bodySm },
  activeMetaPrice: { ...typography.titleMd, fontWeight: '800' },
  activeDeliveryFooter: {
    borderTopWidth: 1, paddingTop: spacing.sm, alignItems: 'flex-end',
  },
  activeTapHint: { ...typography.labelSm, fontWeight: '700' },
});
