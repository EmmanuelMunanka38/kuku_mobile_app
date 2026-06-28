import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import { Plus, Pencil, Trash2, Package } from 'lucide-react-native';

import Card from '../../components/ui/Card';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { formatPrice } from '../../utils/currency';
import { useLanguageStore } from '../../i18n';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function ManageProductsScreen() {
  const { user } = useAuthStore();
  const colors = useThemeStore((s) => s.colors);
  const { t } = useLanguageStore();
  const [products, setProducts] = useState<any[]>([]);
  const [farm, setFarm] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/farms/my-farm');
      setFarm(data);
      setProducts(data.products || []);
    } catch {}
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleDelete = async (productId: number) => {
    Alert.alert(t.farmer.confirmDelete, '', [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/products/${productId}`);
            setProducts((prev) => prev.filter((p) => p.id !== productId));
          } catch {}
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.surfaceContainerHigh }]}>
        <Text style={[styles.title, { color: colors.onSurface }]}>{t.farmer.manageProducts}</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{products.length} {t.common.items}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        style={styles.list}
      >
        {products.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Package size={48} color={colors.outline} strokeWidth={1.5} />
            <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>{t.cart.empty}</Text>
            <Text style={[styles.emptySub, { color: colors.onSurfaceVariant }]}>{t.farmer.addProduct}</Text>
          </Card>
        ) : (
          products.map((product) => (
            <Card key={product.id} variant="elevated" style={styles.productCard}>
              <View style={styles.productRow}>
                {product.image && (
                  <Image source={{ uri: product.image }} style={styles.productThumb} />
                )}
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: colors.onSurface }]}>{product.name}</Text>
                  <Text style={[styles.productPrice, { color: colors.primary }]}>{formatPrice(product.price)}</Text>
                  <View style={styles.metaRow}>
                    <View style={[styles.badge, { backgroundColor: colors.primaryFixed }]}>
                      <Text style={[styles.badgeText, { color: colors.onPrimaryFixed }]}>{product.category}</Text>
                    </View>
                    {product.weight && <Text style={[styles.weight, { color: colors.onSurfaceVariant }]}>{product.weight}</Text>}
                    <Text style={[styles.inventory, { color: colors.onSurfaceVariant }]}>{t.farmer.inventory}: {product.inventory}</Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.editBtn, { backgroundColor: colors.primary }]}
                    onPress={() => router.push(`/(farmer)/add-product?id=${product.id}`)}
                  >
                    <Pencil size={16} color={colors.white} strokeWidth={2} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.deleteBtn, { backgroundColor: colors.errorContainer }]}
                    onPress={() => handleDelete(product.id)}
                  >
                    <Trash2 size={16} color={colors.onErrorContainer} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(farmer)/add-product')}
        activeOpacity={0.9}
      >
        <Plus size={28} color={colors.white} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.containerPadding, paddingTop: 60, paddingBottom: spacing.lg, borderBottomWidth: 1 },
  title: { ...typography.headlineLg, fontWeight: '800' },
  subtitle: { ...typography.bodyMd, marginTop: spacing.xs },
  list: { paddingHorizontal: spacing.containerPadding },
  emptyCard: { alignItems: 'center', padding: spacing.xxxl, gap: spacing.md },
  emptyTitle: { ...typography.titleMd, fontWeight: '700' },
  emptySub: { ...typography.bodyMd, textAlign: 'center' },
  productCard: { marginBottom: spacing.md },
  productRow: { flexDirection: 'row', gap: spacing.md },
  productThumb: { width: 56, height: 56, borderRadius: borderRadius.md, backgroundColor: '#e0e0e0' },
  productInfo: { flex: 1 },
  productName: { ...typography.titleMd, fontWeight: '700' },
  productPrice: { ...typography.headlineSm, fontWeight: '800', marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
  badgeText: { ...typography.labelSm, fontWeight: '700', fontSize: 11 },
  weight: { ...typography.bodySm },
  inventory: { ...typography.bodySm },
  actions: { justifyContent: 'center', gap: spacing.sm },
  editBtn: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
});
