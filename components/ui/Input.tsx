import { useRef, useCallback } from 'react';
import { TextInput, View, Text, StyleSheet, Animated, TextInputProps } from 'react-native';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { borderRadius, spacing } from '../../constants/spacing';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({ label, error, icon, style, ...props }: InputProps) {
  const colors = useThemeStore((s) => s.colors);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = useCallback(() => {
    Animated.timing(focusAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  }, []);

  const handleBlur = useCallback(() => {
    Animated.timing(focusAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  }, []);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.outlineVariant, colors.primary],
  });

  return (
    <View style={styles.wrapper}>
      {label && <Text style={[styles.label, { color: colors.onSurface }]}>{label}</Text>}
      <Animated.View style={[styles.inputWrap, { borderColor, backgroundColor: colors.surfaceContainerLow }, error && { borderColor: colors.error }]}>
        {icon && <View style={styles.iconWrap}>{icon}</View>}
        <TextInput
          style={[styles.input, { color: colors.onSurface }]}
          placeholderTextColor={colors.outline}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </Animated.View>
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  label: { ...typography.labelMd, marginBottom: spacing.xs },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
  },
  iconWrap: { marginRight: spacing.sm },
  input: {
    flex: 1,
    paddingVertical: spacing.md + 2,
    ...typography.bodyMd,
  },
  error: { ...typography.bodySm, marginTop: spacing.xs },
});
