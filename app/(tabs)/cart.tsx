import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert, TextInput, Modal, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { ShoppingCart, Trash2, MapPin, Plus, Check } from 'lucide-react-native';
import Mapbox from '@rnmapbox/maps';
import { MAPBOX_STYLE } from '../../constants/map';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import QuantityStepper from '../../components/ui/QuantityStepper';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { formatPrice } from '../../utils/currency';
import { useLanguageStore } from '../../i18n';
import { useCartStore } from '../../store/cartStore';
import api from '../../services/api';
import type { Address } from '../../types';

export default function CartScreen() {
  const { items, total, fetchCart, updateItem, removeItem, checkout } = useCartStore();
  const colors = useThemeStore((s) => s.colors);
  const { t } = useLanguageStore();
  const [refreshing, setRefreshing] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [phone, setPhone] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | undefined>();

  useEffect(() => { fetchCart(); }, []);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/users/addresses');
      setAddresses(res.data);
      const defaultAddr = res.data.find((a: Address) => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    } catch {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCart();
    setRefreshing(false);
  };

  const handleCheckoutPress = async () => {
    await fetchAddresses();
    setShowAddressModal(true);
  };

  const handleProceedToPhone = () => {
    setShowAddressModal(false);
    setShowPhoneModal(true);
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const result = await checkout(phone || undefined, selectedAddressId);
      setShowPhoneModal(false);
      setPhone('');
      router.push(`/order/payment?id=${result.orderId}&phone=${encodeURIComponent(phone || '')}&amount=${total}`);
    } catch (e: any) {
      Alert.alert(t.common.error, e.response?.data?.error || t.cart.checkoutFailed);
    } finally {
      setCheckingOut(false);
    }
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.onSurface }]}>{t.cart.title}</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{items.length} {t.common.items}</Text>
      </View>

      <View style={styles.list}>
        {items.length === 0 ? (
          <Card style={styles.emptyCard}>
            <ShoppingCart size={48} color={colors.outline} strokeWidth={1.5} />
            <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>{t.cart.empty}</Text>
            <Text style={[styles.emptySub, { color: colors.onSurfaceVariant }]}>{t.cart.emptySubtitle}</Text>
            <Button title={t.cart.startShopping} onPress={() => router.push('/(tabs)')} style={{ marginTop: spacing.lg }} />
          </Card>
        ) : (
          <>
            {items.map((item) => (
              <Card key={item.id} variant="elevated" style={styles.itemCard}>
                <View style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: colors.onSurface }]}>{item.product.name}</Text>
                    <Text style={[styles.itemPrice, { color: colors.primary }]}>{formatPrice(item.product.price)}</Text>
                  </View>
                  <QuantityStepper
                    quantity={item.quantity}
                    onIncrease={() => updateItem(item.id, item.quantity + 1)}
                    onDecrease={() => {
                      if (item.quantity <= 1) removeItem(item.id);
                      else updateItem(item.id, item.quantity - 1);
                    }}
                  />
                </View>
                <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeBtn}>
                  <Trash2 size={14} color={colors.error} strokeWidth={2} />
                  <Text style={[styles.removeText, { color: colors.error }]}>{t.common.delete}</Text>
                </TouchableOpacity>
              </Card>
            ))}

            <Card variant="elevated" style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>{t.cart.subtotal}</Text>
                <Text style={[styles.summaryValue, { color: colors.onSurface }]}>{formatPrice(total)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}>{t.cart.delivery}</Text>
                <Text style={[styles.summaryValue, { color: colors.onSurface }]}>{t.cart.deliveryFee}</Text>
              </View>
              {selectedAddress && (
                <View style={styles.selectedAddress}>
                  <MapPin size={16} color={colors.primary} strokeWidth={2} />
                  <View style={styles.selectedAddressInfo}>
                    <Text style={[styles.selectedAddressLabel, { color: colors.onSurface }]}>{selectedAddress.label || 'Address'}</Text>
                    <Text style={[styles.selectedAddressText, { color: colors.onSurfaceVariant }]}>
                      {selectedAddress.street}, {selectedAddress.city}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handleCheckoutPress}>
                    <Text style={[styles.changeText, { color: colors.primary }]}>Change</Text>
                  </TouchableOpacity>
                </View>
              )}
              <View style={[styles.summaryTotal, { borderTopColor: colors.surfaceContainerHigh }]}>
                <Text style={[styles.totalLabel, { color: colors.onSurface }]}>{t.cart.total}</Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>{formatPrice(total + 350)}</Text>
              </View>
              <Button title={t.cart.checkout} onPress={handleCheckoutPress} size="lg" />
            </Card>
          </>
        )}
      </View>

      <Modal visible={showAddressModal} transparent animationType="fade" onRequestClose={() => setShowAddressModal(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.onSurface }]}>{t.map.selectAddress}</Text>
            {addresses.length === 0 ? (
              <View style={styles.noAddresses}>
                <MapPin size={32} color={colors.outline} strokeWidth={1.5} />
                <Text style={[styles.noAddressText, { color: colors.onSurfaceVariant }]}>No saved addresses</Text>
                <Button
                  title="Add New Address"
                  variant="outline"
                  onPress={() => {
                    setShowAddressModal(false);
                    router.push('/(tabs)/addresses');
                  }}
                  style={{ marginTop: spacing.md }}
                />
              </View>
            ) : (
              <ScrollView style={styles.addressList}>
                {addresses.map((addr) => (
                  <TouchableOpacity
                    key={addr.id}
                    style={[styles.addressOption, { backgroundColor: selectedAddressId === addr.id ? colors.primary + '10' : colors.surfaceContainerLow }]}
                    onPress={() => setSelectedAddressId(addr.id)}
                    activeOpacity={0.7}
                  >
                    <MapPin size={18} color={selectedAddressId === addr.id ? colors.primary : colors.outline} strokeWidth={2} />
                    <View style={styles.addressOptionInfo}>
                      <Text style={[styles.addressOptionLabel, { color: colors.onSurface }]}>{addr.label || 'Address'}</Text>
                      <Text style={[styles.addressOptionText, { color: colors.onSurfaceVariant }]}>{addr.street}, {addr.city}</Text>
                      {selectedAddressId === addr.id && addr.latitude && addr.longitude && (
                        <View style={[styles.addressMiniMap, { borderColor: colors.outline + '30' }]}>
                          <Mapbox.MapView
                            style={styles.addressMiniMapInner}
                            scrollEnabled={false}
                            zoomEnabled={false}
                            rotateEnabled={false}
                            pitchEnabled={false}
                            styleURL={MAPBOX_STYLE}
                          >
                            <Mapbox.Camera
                              defaultSettings={{ centerCoordinate: [addr.longitude, addr.latitude], zoomLevel: 14 }}
                            />
                            <Mapbox.PointAnnotation
                              id={`addr-${addr.id}`}
                              coordinate={[addr.longitude, addr.latitude]}
                            >
                              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary, borderWidth: 2, borderColor: '#fff' }} />
                            </Mapbox.PointAnnotation>
                          </Mapbox.MapView>
                        </View>
                      )}
                    </View>
                    {selectedAddressId === addr.id && (
                      <Check size={18} color={colors.primary} strokeWidth={3} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <View style={styles.modalButtons}>
              <Button title={t.common.cancel} variant="outline" onPress={() => setShowAddressModal(false)} style={{ flex: 1 }} />
              <Button title={t.common.confirm} onPress={handleProceedToPhone} disabled={!selectedAddressId} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showPhoneModal} transparent animationType="fade" onRequestClose={() => setShowPhoneModal(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.onSurface }]}>{t.cart.checkout}</Text>
            <Text style={[styles.modalSub, { color: colors.onSurfaceVariant }]}>{t.cart.phonePrompt}</Text>
            <View style={[styles.phoneInputRow, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outline }]}>
              <TextInput
                style={[styles.phoneInput, { color: colors.onSurface }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="+255 7XX XXX XXX"
                placeholderTextColor={colors.outline}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.modalButtons}>
              <Button title={t.common.cancel} variant="outline" onPress={() => { setShowPhoneModal(false); setPhone(''); }} style={{ flex: 1 }} />
              <Button title={t.cart.confirmOrder} onPress={handleCheckout} loading={checkingOut} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

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
  itemCard: { marginBottom: spacing.md },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemInfo: { flex: 1 },
  itemName: { ...typography.titleMd, fontWeight: '700' },
  itemPrice: { ...typography.bodyMd, fontWeight: '700', marginTop: 2 },
  removeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
  removeText: { ...typography.bodySm, fontWeight: '600' },
  summary: { marginTop: spacing.md, gap: spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { ...typography.bodyMd },
  summaryValue: { ...typography.bodyMd, fontWeight: '600' },
  selectedAddress: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  selectedAddressInfo: { flex: 1 },
  selectedAddressLabel: { ...typography.bodySm, fontWeight: '700' },
  selectedAddressText: { ...typography.bodySm },
  changeText: { ...typography.bodySm, fontWeight: '700' },
  summaryTotal: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: spacing.md, marginTop: spacing.sm },
  totalLabel: { ...typography.titleMd, fontWeight: '800' },
  totalValue: { ...typography.titleMd, fontWeight: '800' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  modalContent: { width: '100%', borderRadius: 20, padding: spacing.xxl, gap: spacing.md, maxHeight: '80%' },
  modalTitle: { ...typography.headlineMd, fontWeight: '800' },
  modalSub: { ...typography.bodyMd },
  modalButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  noAddresses: { alignItems: 'center', padding: spacing.xxl, gap: spacing.sm },
  noAddressText: { ...typography.bodyMd, textAlign: 'center' },
  addressList: { maxHeight: 300 },
  addressOption: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: borderRadius.md, marginBottom: spacing.sm },
  addressOptionInfo: { flex: 1 },
  addressOptionLabel: { ...typography.titleMd, fontWeight: '700' },
  addressOptionText: { ...typography.bodySm, marginTop: 2 },
  phoneInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, paddingHorizontal: spacing.lg, borderWidth: 1, height: 48 },
  phoneInput: { flex: 1, ...typography.bodyMd },
  addressMiniMap: { marginTop: spacing.sm, borderRadius: borderRadius.md, overflow: 'hidden', height: 100, borderWidth: 1 },
  addressMiniMapInner: { width: '100%', height: '100%' },
});
