import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { MapPin, Search, X } from 'lucide-react-native';

import Chip from '../../components/ui/Chip';
import FarmCard from '../../components/ui/FarmCard';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import { useLanguageStore } from '../../i18n';
import api from '../../services/api';
import type { Farm } from '../../types';

const allFilters = ['allFarms', 'nearest', 'topRated', 'organicCertified'] as const;

export default function FarmsScreen() {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useLanguageStore();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('allFarms');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFarms = async () => {
    try {
      const res = await api.get('/farms');
      setFarms(res.data);
    } catch {}
  };

  useEffect(() => { fetchFarms(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFarms();
    setRefreshing(false);
  };

  const filtered = [...farms]
    .filter((f) => {
      if (activeFilter === 'organicCertified' && !f.isOrganic) return false;
      return true;
    })
    .filter((f) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.city?.toLowerCase().includes(q) ||
        f.address?.toLowerCase().includes(q) ||
        f.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (activeFilter === 'topRated') return b.rating - a.rating;
      if (activeFilter === 'nearest') return (a.reviewCount || 0) - (b.reviewCount || 0);
      return 0;
    });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        <View style={styles.locationRow}>
          <MapPin size={16} color={colors.primary} strokeWidth={2} />
          <Text style={[styles.location, { color: colors.primary }]}>{t.farms.location}</Text>
        </View>
        <Text style={[styles.title, { color: colors.onSurface }]}>{t.farms.title}</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{t.farms.subtitle}</Text>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.surfaceContainerLow }]}>
        <Search size={18} color={colors.outline} strokeWidth={2} />
        <TextInput
          style={[styles.searchInput, { color: colors.onSurface }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search farms..."
          placeholderTextColor={colors.outline}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={16} color={colors.outline} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {allFilters.map((key) => (
            <Chip key={key} label={t.farms[key]} active={activeFilter === key} onPress={() => setActiveFilter(key)} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.list}>
        {filtered.map((farm) => (
          <TouchableOpacity
            key={farm.id}
            onPress={() => router.push(`/farm/${farm.id}`)}
            style={{ marginBottom: spacing.md }}
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
        {filtered.length === 0 && (
          <Text style={[styles.empty, { color: colors.onSurfaceVariant }]}>{t.farms.noFarms}</Text>
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.containerPadding, paddingTop: 60, marginBottom: spacing.xxl },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.xs },
  location: { ...typography.bodyMd, fontWeight: '700' },
  title: { ...typography.headlineLg, fontWeight: '800' },
  subtitle: { ...typography.bodyMd, marginTop: spacing.xs },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: spacing.containerPadding, marginBottom: spacing.lg,
    borderRadius: 12, paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  searchInput: { flex: 1, ...typography.bodyMd },
  filters: { paddingLeft: spacing.containerPadding, marginBottom: spacing.xxl },
  list: { paddingHorizontal: spacing.containerPadding },
  empty: { ...typography.bodyLg, textAlign: 'center', marginTop: spacing.huge },
});
