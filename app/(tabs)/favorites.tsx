import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Heart } from 'lucide-react-native';
import Card from '../../components/ui/Card';
import ProductCard from '../../components/ui/ProductCard';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import { useLanguageStore } from '../../i18n';
import api from '../../services/api';
import type { Product } from '../../types';

export default function FavoritesScreen() {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useLanguageStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await api.get('/favorites');
      setProducts(res.data);
    } catch {}
  }, []);

  useEffect(() => { fetchFavorites(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.onSurface }]}>{t.profile.favorites}</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{products.length} {t.common.items}</Text>
      </View>

      <View style={styles.list}>
        {products.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Heart size={48} color={colors.outline} strokeWidth={1.5} />
            <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>No favorites yet</Text>
            <Text style={[styles.emptySub, { color: colors.onSurfaceVariant }]}>Tap the heart icon on products to save them here</Text>
          </Card>
        ) : (
          <View style={styles.grid}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                price={product.price}
                weight={product.weight}
                farmName={product.farm?.name}
                image={product.image}
                onPress={() => router.push(`/product/${product.id}`)}
              />
            ))}
          </View>
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  emptyCard: { alignItems: 'center', padding: spacing.xxxl, gap: spacing.md },
  emptyTitle: { ...typography.titleMd, fontWeight: '700' },
  emptySub: { ...typography.bodyMd, textAlign: 'center' },
});
