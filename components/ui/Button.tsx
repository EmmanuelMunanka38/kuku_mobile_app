import { useRef, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, Animated } from 'react-native';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { borderRadius, spacing } from '../../constants/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export default function Button({
  title, onPress, variant = 'primary', size = 'md',
  loading, disabled, style, icon
}: ButtonProps) {
  const colors = useThemeStore((s) => s.colors);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  }, []);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        style={[
          styles.base,
          variant === 'primary' && { backgroundColor: colors.primary },
          variant === 'secondary' && { backgroundColor: colors.secondaryContainer },
          variant === 'outline' && { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
          variant === 'text' && { backgroundColor: 'transparent' },
          size === 'sm' && styles.size_sm,
          size === 'md' && styles.size_md,
          size === 'lg' && styles.size_lg,
          isDisabled && styles.disabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? colors.white : colors.primary} />
        ) : (
          <>
            {icon}
            <Text style={[
              styles.text,
              variant === 'primary' && { color: colors.white },
              variant === 'secondary' && { color: colors.primary },
              variant === 'outline' && { color: colors.primary },
              variant === 'text' && { color: colors.primary },
              size === 'sm' && styles.textSize_sm,
              size === 'md' && styles.textSize_md,
              size === 'lg' && styles.textSize_lg,
            ]}>
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    gap: 8,
  },
  size_sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  size_md: { paddingVertical: spacing.md, paddingHorizontal: spacing.xxl },
  size_lg: { paddingVertical: spacing.lg + 2, paddingHorizontal: spacing.xxxl },
  disabled: { opacity: 0.5 },
  text: { fontWeight: '700' },
  textSize_sm: { ...typography.labelSm },
  textSize_md: { ...typography.labelMd, fontSize: 15 },
  textSize_lg: { ...typography.labelLg, fontSize: 17 },
});
