import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { router } from 'expo-router';
import { ShoppingCart, Trash2, ChevronRight, Phone } from 'lucide-react-native';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import QuantityStepper from '../../components/ui/QuantityStepper';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import { formatPrice } from '../../utils/currency';
import { useLanguageStore } from '../../i18n';
import { useCartStore } from '../../store/cartStore';

export default function CartScreen() {
  const { items, total, fetchCart, updateItem, removeItem, checkout } = useCartStore();
  const colors = useThemeStore((s) => s.colors);
  const { t } = useLanguageStore();
  const [refreshing, setRefreshing] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phone, setPhone] = useState('');

  useEffect(() => { fetchCart(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCart();
    setRefreshing(false);
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      await checkout(phone || undefined);
      setShowPhoneModal(false);
      Alert.alert(t.cart.orderSuccess, t.cart.orderSuccessMessage, [
        { text: t.orders.title, onPress: () => router.push('/(tabs)/orders') },
      ]);
    } catch (e: any) {
      Alert.alert(t.common.error, e.response?.data?.error || t.cart.checkoutFailed);
    } finally {
      setCheckingOut(false);
    }
  };

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
              <View style={[styles.summaryTotal, { borderTopColor: colors.surfaceContainerHigh }]}>
                <Text style={[styles.totalLabel, { color: colors.onSurface }]}>{t.cart.total}</Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>{formatPrice(total + 350)}</Text>
              </View>
              <Button title={t.cart.checkout} onPress={() => setShowPhoneModal(true)} size="lg" />
            </Card>
          </>
        )}
      </View>

      <Modal visible={showPhoneModal} transparent animationType="fade" onRequestClose={() => setShowPhoneModal(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.onSurface }]}>{t.cart.checkout}</Text>
            <Text style={[styles.modalSub, { color: colors.onSurfaceVariant }]}>{t.cart.phonePrompt}</Text>
            <View style={[styles.phoneInputRow, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outline }]}>
              <Phone size={18} color={colors.outline} strokeWidth={2} />
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
  summaryTotal: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: spacing.md, marginTop: spacing.sm },
  totalLabel: { ...typography.titleMd, fontWeight: '800' },
  totalValue: { ...typography.titleMd, fontWeight: '800' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  modalContent: { width: '100%', borderRadius: 20, padding: spacing.xxl, gap: spacing.md },
  modalTitle: { ...typography.headlineMd, fontWeight: '800' },
  modalSub: { ...typography.bodyMd },
  phoneInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, paddingHorizontal: spacing.lg, borderWidth: 1, height: 48 },
  phoneInput: { flex: 1, ...typography.bodyMd },
  modalButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
});
