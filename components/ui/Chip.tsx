import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { borderRadius, spacing } from '../../constants/spacing';

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export default function Chip({ label, active, onPress, style, icon }: ChipProps) {
  const colors = useThemeStore((s) => s.colors);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        styles.base,
        { backgroundColor: active ? colors.primary : colors.surfaceContainerHigh },
        style,
      ]}
    >
      {icon}
      <Text style={[
        styles.label,
        { color: active ? colors.onPrimary : colors.onSurfaceVariant },
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  label: { ...typography.labelSm, fontWeight: '600' },
});
