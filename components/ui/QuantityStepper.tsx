import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { borderRadius, spacing } from '../../constants/spacing';

interface QuantityStepperProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
}

export default function QuantityStepper({ quantity, onIncrease, onDecrease, min = 1, max = 99 }: QuantityStepperProps) {
  const colors = useThemeStore((s) => s.colors);
  const atMin = quantity <= min;
  const atMax = quantity >= max;

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceContainerLow }]}>
      <TouchableOpacity
        onPress={onDecrease}
        disabled={atMin}
        style={[styles.btn, atMin && styles.btnDisabled]}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
      >
        <Minus size={18} color={atMin ? colors.outline : colors.primary} strokeWidth={2.5} />
      </TouchableOpacity>
      <Text style={[styles.quantity, { color: colors.onSurface }]}>{quantity}</Text>
      <TouchableOpacity
        onPress={onIncrease}
        disabled={atMax}
        style={[styles.btn, atMax && styles.btnDisabled]}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
      >
        <Plus size={18} color={atMax ? colors.outline : colors.primary} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: borderRadius.lg,
  },
  btn: {
    width: 42, height: 42, alignItems: 'center', justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.3 },
  quantity: {
    ...typography.titleMd,
    minWidth: 40, textAlign: 'center', fontWeight: '700',
  },
});
