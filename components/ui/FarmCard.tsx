import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Sprout, MapPin, Circle } from 'lucide-react-native';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { borderRadius, spacing, shadow } from '../../constants/spacing';

interface FarmCardProps {
  name: string;
  rating: number;
  reviewCount: number;
  distance?: string;
  tags?: string[];
  isOrganic?: boolean;
  openStatus?: string;
  image?: string;
  onPress?: () => void;
}

export default function FarmCard({ name, rating, reviewCount, distance, tags, isOrganic, openStatus, image, onPress }: FarmCardProps) {
  const colors = useThemeStore((s) => s.colors);
  const isOpen = openStatus === 'Open Now';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} accessibilityRole="button">
      <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest }]}>
        <View style={[styles.imageWrap, { backgroundColor: colors.surfaceContainerHigh }]}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Sprout size={32} color={colors.outline} strokeWidth={1.5} />
            </View>
          )}
          {isOrganic && (
            <View style={[styles.organicBadge, { backgroundColor: colors.success }]}>
              <Text style={styles.organicText}>Organic</Text>
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.onSurface }]} numberOfLines={1}>{name}</Text>
          <View style={styles.ratingRow}>
            <Text style={[styles.star, { color: colors.star }]}>★</Text>
            <Text style={[styles.rating, { color: colors.onSurface }]}>{rating}</Text>
            <Text style={[styles.reviews, { color: colors.onSurfaceVariant }]}>({reviewCount})</Text>
          </View>
          {distance && (
            <View style={styles.metaRow}>
              <MapPin size={14} color={colors.onSurfaceVariant} strokeWidth={2} />
              <Text style={[styles.meta, { color: colors.onSurfaceVariant }]}>{distance}</Text>
            </View>
          )}
          <View style={styles.statusRow}>
            {isOpen ? (
              <Circle size={10} color={colors.success} fill={colors.success} />
            ) : (
              <Circle size={10} color={colors.error} fill={colors.error} />
            )}
            <Text style={[styles.status, { color: isOpen ? colors.success : colors.error }]}>
              {isOpen ? 'Open Now' : openStatus}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    width: 240,
    ...shadow.low,
  },
  imageWrap: { height: 120, overflow: 'hidden' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  organicBadge: {
    position: 'absolute', top: 8, left: 8,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 4,
  },
  organicText: { ...typography.labelSm, color: '#FFF', fontSize: 10, fontWeight: '800' },
  info: { padding: spacing.md, gap: 4 },
  name: { ...typography.titleMd, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  star: { fontSize: 14 },
  rating: { ...typography.bodySm, fontWeight: '700' },
  reviews: { ...typography.bodySm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { ...typography.bodySm },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  status: { ...typography.labelSm, fontWeight: '600' },
});
