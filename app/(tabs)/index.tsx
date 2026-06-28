import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Search, SlidersHorizontal, Sprout, ChevronRight, Egg, X } from 'lucide-react-native';

import Card from '../../components/ui/Card';
import Chip from '../../components/ui/Chip';
import ProductCard from '../../components/ui/ProductCard';
import FarmCard from '../../components/ui/FarmCard';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import { useLanguageStore } from '../../i18n';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import type { Product, Farm } from '../../types';

const categories = ['All', 'Eggs', 'Chicken', 'Duck', 'Organic'];

export default function HomeScreen() {
  const { user } = useAuthStore();
  const colors = useThemeStore((s) => s.colors);
  const { t } = useLanguageStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const [prodRes, farmRes] = await Promise.all([
        api.get('/products'),
        api.get('/farms'),
      ]);
      setProducts(prodRes.data);
      setFarms(farmRes.data);
    } catch {}
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const filtered = products.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory.toUpperCase();
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={[styles.header, { borderBottomColor: colors.surfaceContainerHigh }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.onSurfaceVariant }]}>{t.home.subtitle}</Text>
          <Text style={[styles.name, { color: colors.onSurface }]}>{user?.name || 'Mgeni'}</Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.onPrimary }]}>{(user?.name || 'M')[0].toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceContainerLow }]}>
          <Search size={18} color={colors.outline} strokeWidth={2} />
          <TextInput
            style={[styles.searchInput, { color: colors.onSurface }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t.home.searchPlaceholder}
            placeholderTextColor={colors.outline}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={colors.outline} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: colors.primary + '15' }]}
          onPress={() => {
            Alert.alert('Filter by Category', 'Select a category', [
              ...categories.map((cat) => ({
                text: cat,
                onPress: () => setActiveCategory(cat),
              })),
              { text: 'Cancel', style: 'cancel' },
            ]);
          }}
        >
          <SlidersHorizontal size={20} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={[styles.promoBanner, { backgroundColor: colors.primary }]}>
        <View style={styles.promoContent}>
          <Text style={[styles.promoTitle, { color: colors.onPrimary }]}>{t.home.promoTitle}</Text>
          <Text style={[styles.promoSub, { color: colors.onPrimary }]}>{t.home.promoSubtitle}</Text>
          <Text style={[styles.promoPrice, { color: colors.onPrimary }]}>{t.home.promoPrice}</Text>
        </View>
        <View style={styles.promoEmoji}>
          <Egg size={48} color={colors.onPrimary} strokeWidth={1.5} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{t.home.categories}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onPress={() => setActiveCategory(cat)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{t.home.featuredFarms}</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/farms')} style={styles.seeAllBtn}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>{t.common.viewAll}</Text>
            <ChevronRight size={16} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {farms.slice(0, 5).map((farm) => (
            <TouchableOpacity
              key={farm.id}
              onPress={() => router.push(`/farm/${farm.id}`)}
              style={{ marginRight: spacing.md }}
            >
              <FarmCard
                name={farm.name}
                rating={farm.rating}
                reviewCount={farm.reviewCount}
                distance={farm.city}
                tags={farm.tags}
                isOrganic={farm.isOrganic}
                openStatus={farm.openStatus}
                image={farm.heroImage || undefined}
                onPress={() => router.push(`/farm/${farm.id}`)}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{t.home.featuredProducts}</Text>
        <View style={styles.productGrid}>
          {filtered.slice(0, 8).map((product) => (
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
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { ...typography.titleMd, fontWeight: '800' },
  searchRow: {
    flexDirection: 'row', paddingHorizontal: spacing.containerPadding,
    marginTop: spacing.lg, marginBottom: spacing.xxl, gap: spacing.md,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 12, paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  searchInput: { flex: 1, ...typography.bodyMd },
  filterBtn: {
    width: 48, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  promoBanner: {
    marginHorizontal: spacing.containerPadding, marginBottom: spacing.xxl,
    borderRadius: 16, flexDirection: 'row', padding: spacing.xxl, overflow: 'hidden',
  },
  promoContent: { flex: 1 },
  promoTitle: { ...typography.headlineMd, fontWeight: '800' },
  promoSub: { ...typography.bodyMd, marginTop: spacing.xs },
  promoPrice: { ...typography.titleMd, fontWeight: '700', marginTop: spacing.sm },
  promoEmoji: { justifyContent: 'center', alignItems: 'center' },
  section: { marginBottom: spacing.xxl, paddingHorizontal: spacing.containerPadding },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { ...typography.headlineSm, fontWeight: '800', marginBottom: spacing.md },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAll: { ...typography.bodyMd, fontWeight: '700' },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
});
