import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';

import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useThemeStore } from '../../constants/themes';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/spacing';
import { useLanguageStore } from '../../i18n';

export default function RoleSelect() {
  const colors = useThemeStore((s) => s.colors);
  const { t } = useLanguageStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={[styles.title, { color: colors.primary }]}>{t.app.name}</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{t.auth.joinAs}</Text>
      </View>

      <View style={styles.cards}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceContainerHigh }]}
          onPress={() => router.push('/(auth)/register?role=USER')}
          activeOpacity={0.9}
        >
          <View style={styles.iconWrap}>
            <Svg width={40} height={40} viewBox="0 0 100 100">
              <Circle cx={50} cy={50} r={45} fill={colors.primary} />
              <Circle cx={50} cy={35} r={15} fill={colors.surface} />
              <Path d="M 25 75 Q 50 55 75 75" fill={colors.surface} />
            </Svg>
          </View>
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>{t.auth.customer}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.surfaceContainerHigh }]}
          onPress={() => router.push('/(auth)/register?role=FARMER')}
          activeOpacity={0.9}
        >
          <View style={styles.iconWrap}>
            <Svg width={40} height={40} viewBox="0 0 100 100">
              <Rect x={25} y={40} width={50} height={40} rx={4} fill={colors.primary} />
              <Path d="M 20 40 L 50 15 L 80 40" fill={colors.primary} />
              <Rect x={42} y={55} width={16} height={25} rx={2} fill={colors.surface} />
            </Svg>
          </View>
          <Text style={[styles.cardTitle, { color: colors.onSurface }]}>{t.auth.farmer}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.containerPadding },
  header: { alignItems: 'center', marginBottom: spacing.huge },
  logo: { width: 80, height: 80, marginBottom: spacing.lg },
  title: { ...typography.headlineMd, textAlign: 'center' },
  subtitle: { ...typography.bodyLg, marginTop: spacing.sm, textAlign: 'center' },
  cards: { gap: spacing.lg },
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  iconWrap: { marginRight: spacing.lg },
  cardTitle: { ...typography.titleMd },
  cardDesc: { ...typography.bodySm, marginTop: 2 },
});
