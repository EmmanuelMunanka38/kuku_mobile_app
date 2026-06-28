import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { ArrowLeft, Egg, Home, BarChart3, Snowflake, ChevronRight, Heart } from 'lucide-react-native';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import QuantityStepper from '../../components/ui/QuantityStepper';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { formatPrice } from '../../utils/currency';
import { useLanguageStore } from '../../i18n';
import api from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import type { Product } from '../../types';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeStore((s) => s.colors);
  const isDark = useThemeStore((s) => s.isDark);
  const { t } = useLanguageStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const { addItem } = useCartStore();

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => {
      setProduct(res.data);
      setLoading(false);
    }).catch(() => {
      setError('Failed to load product');
      setLoading(false);
    });
  }, [id]);

  const toggleFavorite = async () => {
    if (!product) return;
    try {
      if (isFavorited) {
        await api.delete(`/favorites/${product.id}`);
        setIsFavorited(false);
      } else {
        await api.post('/favorites', { productId: product.id });
        setIsFavorited(true);
      }
    } catch {}
  };

  const handleAdd = async () => {
    if (!product) return;
    await addItem(product.id, quantity);
    router.back();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error || 'Product not found'}</Text>
        <Button title={t.common.retry} onPress={() => { setLoading(true); setError(''); api.get(`/products/${id}`).then((res) => { setProduct(res.data); setLoading(false); }).catch(() => { setError('Failed to load product'); setLoading(false); }); }} variant="outline" style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.imageWrap, { backgroundColor: colors.surfaceContainerHigh }]}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.productImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Egg size={80} color={colors.outline} strokeWidth={1.5} />
          </View>
        )}
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.badgeText, { color: colors.onPrimary }]}>{product.category}</Text>
          </View>
          {product.weight && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.badgeText, { color: colors.onPrimary }]}>{product.weight}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(20,20,20,0.95)' : 'rgba(255,255,255,0.95)' }]}>
          <ArrowLeft size={22} color={colors.onSurface} strokeWidth={2.5} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFavorite} style={[styles.favBtn, { backgroundColor: isDark ? 'rgba(20,20,20,0.95)' : 'rgba(255,255,255,0.95)' }]}>
          <Heart size={22} color={isFavorited ? colors.error : colors.onSurface} fill={isFavorited ? colors.error : 'transparent'} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View style={styles.details}>
        {product.farm && (
          <TouchableOpacity onPress={() => router.push(`/farm/${product.farmId}`)} style={styles.farmRow}>
            <Home size={16} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.farmName, { color: colors.primary }]}>{product.farm.name}</Text>
            <ChevronRight size={14} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>
        )}

        <Text style={[styles.productName, { color: colors.onSurface }]}>{product.name}</Text>
        <Text style={[styles.price, { color: colors.primary }]}>{formatPrice(product.price)}</Text>

        {product.description && (
          <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>{product.description}</Text>
        )}

        <View style={[styles.quantityRow, { borderTopColor: colors.surfaceContainerHigh, borderBottomColor: colors.surfaceContainerHigh }]}>
          <Text style={[styles.quantityLabel, { color: colors.onSurface }]}>{t.product.quantity}</Text>
          <QuantityStepper
            quantity={quantity}
            onIncrease={() => setQuantity(Math.min(quantity + 1, 99))}
            onDecrease={() => setQuantity(Math.max(quantity - 1, 1))}
          />
        </View>

        <Card style={styles.accordion}>
          <View style={styles.accordionRow}>
            <BarChart3 size={20} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.accordionTitle, { color: colors.onSurface }]}>{t.product.nutritionInfo}</Text>
          </View>
          <Text style={[styles.accordionText, { color: colors.onSurfaceVariant }]}>{t.product.nutritionInfo}</Text>
        </Card>

        <Card style={styles.accordion}>
          <View style={styles.accordionRow}>
            <Snowflake size={20} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.accordionTitle, { color: colors.onSurface }]}>{t.product.details}</Text>
          </View>
          <Text style={[styles.accordionText, { color: colors.onSurfaceVariant }]}>Keep refrigerated at 0-4°C. Best consumed within 3 days.</Text>
        </Card>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleAdd}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.9}
        >
          <Text style={[styles.addBtnText, { color: colors.onPrimary }]}>{t.product.addToCart} · {formatPrice(product.price * quantity)}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  errorText: { ...typography.bodyLg, textAlign: 'center' },
  imageWrap: { height: 300, justifyContent: 'center', alignItems: 'center' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  productImage: { width: '100%', height: 300, resizeMode: 'cover' },
  badges: { position: 'absolute', top: 60, right: spacing.lg, flexDirection: 'row', gap: spacing.sm },
  badge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  badgeText: { ...typography.labelSm, fontWeight: '700', fontSize: 11 },
  backBtn: {
    position: 'absolute', top: 60, left: spacing.lg,
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  favBtn: {
    position: 'absolute', top: 60, right: spacing.lg,
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  details: { paddingHorizontal: spacing.containerPadding, paddingTop: spacing.xxl, paddingBottom: 100 },
  farmRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  farmName: { ...typography.labelMd, fontWeight: '700' },
  productName: { ...typography.headlineMd, fontWeight: '800' },
  price: { ...typography.displayLg, fontWeight: '800', marginTop: spacing.sm },
  description: { ...typography.bodyLg, lineHeight: 26, marginTop: spacing.lg },
  quantityRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.lg, marginVertical: spacing.xxl,
    borderTopWidth: 1, borderBottomWidth: 1,
  },
  quantityLabel: { ...typography.titleMd, fontWeight: '700' },
  accordion: { marginBottom: spacing.md, borderRadius: borderRadius.lg },
  accordionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm },
  accordionTitle: { ...typography.titleMd, fontWeight: '700' },
  accordionText: { ...typography.bodyMd },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing.containerPadding, paddingVertical: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  addBtn: {
    paddingVertical: spacing.lg, borderRadius: borderRadius.lg,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  addBtnText: { ...typography.labelLg, fontWeight: '800', fontSize: 17 },
});
