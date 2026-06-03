import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemeStore } from '../../constants/themes';
import { borderRadius, spacing, shadow } from '../../constants/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'filled' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddings = { none: 0, sm: spacing.md, md: spacing.lg, lg: spacing.xl };

export default function Card({ children, style, variant = 'elevated', padding = 'md' }: CardProps) {
  const colors = useThemeStore((s) => s.colors);

  return (
    <View style={[
      styles.base,
      { padding: paddings[padding] },
      variant === 'elevated' && { backgroundColor: colors.surfaceContainerLowest, ...shadow.low },
      variant === 'filled' && { backgroundColor: colors.surfaceContainerLow },
      variant === 'outlined' && { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.outlineVariant },
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: borderRadius.xl },
});
