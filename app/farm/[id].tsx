import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { ArrowLeft, Sprout, Star, MapPin, Tag } from 'lucide-react-native';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ProductCard from '../../components/ui/ProductCard';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { useLanguageStore } from '../../i18n';
import api from '../../services/api';
import type { Farm } from '../../types';

const { width } = Dimensions.get('window');

export default function FarmDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeStore((s) => s.colors);
  const isDark = useThemeStore((s) => s.isDark);
  const { t } = useLanguageStore();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/farms/${id}`).then((res) => {
      setFarm(res.data);
      setLoading(false);
    }).catch(() => {
      setError('Failed to load farm');
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !farm) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error || 'Farm not found'}</Text>
        <Button title={t.common.retry} onPress={() => { setLoading(true); setError(''); api.get(`/farms/${id}`).then((res) => { setFarm(res.data); setLoading(false); }).catch(() => { setError('Failed to load farm'); setLoading(false); }); }} variant="outline" style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.hero, { backgroundColor: colors.surfaceContainerHigh }]}>
        <View style={styles.heroPlaceholder}>
          <Sprout size={64} color={colors.outline} strokeWidth={1.5} />
        </View>
        {farm.isOrganic && (
          <View style={[styles.organicBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.organicText, { color: colors.white }]}>{t.farm.organic}</Text>
          </View>
        )}
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(20,20,20,0.95)' : 'rgba(255,255,255,0.95)' }]}>
          <ArrowLeft size={22} color={colors.onSurface} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.surfaceContainerLowest }]}>
        <View style={styles.farmTop}>
          <View style={[styles.farmLogo, { backgroundColor: colors.surfaceContainerHigh }]}>
            <Sprout size={28} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.farmInfo}>
            <Text style={[styles.farmName, { color: colors.onSurface }]}>{farm.name}</Text>
            <View style={styles.ratingRow}>
              <Star size={14} color={colors.star} fill={colors.star} />
              <Text style={[styles.rating, { color: colors.onSurface }]}>{farm.rating}</Text>
              <Text style={[styles.reviews, { color: colors.onSurfaceVariant }]}>({farm.reviewCount}+ reviews)</Text>
            </View>
          </View>
        </View>

        {farm.description && (
          <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>{farm.description}</Text>
        )}

        <View style={[styles.stats, { borderTopColor: colors.surfaceContainerHigh, borderBottomColor: colors.surfaceContainerHigh }]}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{farm.reviewCount}</Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>{t.orders.items}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{farm.reviewCount}</Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>{t.farm.reviews}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.primary }]}>100%</Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Freshness</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MapPin size={14} color={colors.onSurfaceVariant} strokeWidth={2} />
            <Text style={[styles.meta, { color: colors.onSurfaceVariant }]}>{farm.city || farm.address || 'Local Farm'}</Text>
          </View>
          <View style={styles.metaItem}>
            <View style={[styles.statusDot, { backgroundColor: farm.openStatus === 'Open Now' ? colors.success : colors.error }]} />
            <Text style={[styles.meta, { color: farm.openStatus === 'Open Now' ? colors.success : colors.error }]}>
              {farm.openStatus === 'Open Now' ? t.farm.openNow : farm.openStatus}
            </Text>
          </View>
        </View>

        {farm.tags && farm.tags.length > 0 && (
          <View style={styles.tags}>
            {farm.tags.map((tag, i) => (
              <View key={i} style={[styles.tag, { backgroundColor: colors.surfaceContainerHigh }]}>
                <Tag size={12} color={colors.onSurfaceVariant} strokeWidth={2} />
                <Text style={[styles.tagText, { color: colors.onSurfaceVariant }]}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{t.farm.products}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {farm.products?.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              price={product.price}
              weight={product.weight}
              image={product.image}
              onPress={() => router.push(`/product/${product.id}`)}
            />
          ))}
          {(!farm.products || farm.products.length === 0) && (
            <Card style={{ width: width - 48 }}>
              <Text style={{ color: colors.onSurfaceVariant }}>{t.common.noResults}</Text>
            </Card>
          )}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{t.farm.reviews}</Text>
        <Card variant="filled" style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={[styles.reviewAvatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.reviewAvatarText, { color: colors.white }]}>JW</Text>
            </View>
            <View>
              <Text style={[styles.reviewerName, { color: colors.onSurface }]}>Jane Wanjiku</Text>
              <View style={styles.reviewStars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} color={colors.star} fill={colors.star} strokeWidth={1.5} />
                ))}
              </View>
            </View>
          </View>
          <Text style={[styles.reviewText, { color: colors.onSurfaceVariant }]}>The chicken was incredibly fresh! Best poultry I've had in a long time.</Text>
        </Card>
        <Card variant="filled" style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={[styles.reviewAvatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.reviewAvatarText, { color: colors.white }]}>DO</Text>
            </View>
            <View>
              <Text style={[styles.reviewerName, { color: colors.onSurface }]}>David Otieno</Text>
              <View style={styles.reviewStars}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Star key={i} size={12} color={colors.star} fill={colors.star} strokeWidth={1.5} />
                ))}
                <Star size={12} color={colors.star} fill="transparent" strokeWidth={1.5} />
              </View>
            </View>
          </View>
          <Text style={[styles.reviewText, { color: colors.onSurfaceVariant }]}>Reliable farm with quality products. Delivery was prompt.</Text>
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
  hero: { height: 240, justifyContent: 'center', alignItems: 'center' },
  heroPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  organicBadge: {
    position: 'absolute', top: 60, right: spacing.lg,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  organicText: { ...typography.labelSm, fontWeight: '800', fontSize: 11 },
  backBtn: {
    position: 'absolute', top: 60, left: spacing.lg,
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  infoCard: {
    marginHorizontal: spacing.containerPadding, marginTop: -40,
    borderRadius: borderRadius.xl, padding: spacing.xxl,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  farmTop: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  farmLogo: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginRight: spacing.lg },
  farmInfo: { flex: 1 },
  farmName: { ...typography.headlineMd, fontWeight: '800' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  rating: { ...typography.labelMd, fontWeight: '700' },
  reviews: { ...typography.bodySm },
  description: { ...typography.bodyMd, lineHeight: 24, marginBottom: spacing.lg },
  stats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.lg, paddingVertical: spacing.lg, borderTopWidth: 1, borderBottomWidth: 1 },
  stat: { alignItems: 'center' },
  statValue: { ...typography.titleMd, fontWeight: '800' },
  statLabel: { ...typography.labelSm, marginTop: 2 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { ...typography.bodySm, fontWeight: '600' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  tagText: { ...typography.labelSm },
  section: { marginTop: spacing.xxl, paddingHorizontal: spacing.containerPadding },
  sectionTitle: { ...typography.headlineSm, fontWeight: '800', marginBottom: spacing.md },
  reviewCard: { marginBottom: spacing.md },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  reviewAvatarText: { ...typography.labelMd, fontWeight: '800' },
  reviewerName: { ...typography.titleMd, fontWeight: '700' },
  reviewStars: { flexDirection: 'row', gap: 2, marginTop: 2 },
  reviewText: { ...typography.bodyMd, lineHeight: 22 },
});
