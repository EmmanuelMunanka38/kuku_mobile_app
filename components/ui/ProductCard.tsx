import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Egg } from 'lucide-react-native';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { borderRadius, spacing, shadow } from '../../constants/spacing';
import { formatPrice } from '../../utils/currency';

interface ProductCardProps {
  name: string;
  price: number;
  image?: string;
  weight?: string;
  farmName?: string;
  onPress?: () => void;
}

export default function ProductCard({ name, price, image, weight, farmName, onPress }: ProductCardProps) {
  const colors = useThemeStore((s) => s.colors);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} accessibilityRole="button">
      <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest }]}>
        <View style={[styles.imageWrap, { backgroundColor: colors.surfaceContainerHigh }]}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Egg size={36} color={colors.outline} strokeWidth={1.5} />
            </View>
          )}
        </View>
        <View style={styles.info}>
          {farmName && <Text style={[styles.farm, { color: colors.primary }]} numberOfLines={1}>{farmName}</Text>}
          <Text style={[styles.name, { color: colors.onSurface }]} numberOfLines={2}>{name}</Text>
          <View style={styles.bottom}>
            <Text style={[styles.price, { color: colors.primary }]}>{formatPrice(price)}</Text>
            {weight && <Text style={[styles.weight, { color: colors.onSurfaceVariant }]}>{weight}</Text>}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 164,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadow.low,
  },
  imageWrap: { height: 120, overflow: 'hidden' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  info: { padding: spacing.md },
  farm: { ...typography.labelSm, fontWeight: '700', marginBottom: 2 },
  name: { ...typography.bodySm, fontWeight: '600', marginBottom: spacing.xs },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { ...typography.titleMd, fontWeight: '800' },
  weight: { ...typography.bodySm },
});
