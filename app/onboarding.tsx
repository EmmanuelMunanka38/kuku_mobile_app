import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';

import Button from '../components/ui/Button';
import { useThemeStore } from '../constants/themes';
import { typography } from '../constants/typography';
import { spacing } from '../constants/spacing';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../i18n';

const { width } = Dimensions.get('window');

const slides: { id: string; titleKey: 'slide1Title' | 'slide2Title' | 'slide3Title'; subtitleKey: 'slide1Subtitle' | 'slide2Subtitle' | 'slide3Subtitle'; image: any }[] = [
  {
    id: '1',
    titleKey: 'slide1Title',
    subtitleKey: 'slide1Subtitle',
    image: require('../assets/onboarding-welcome.png'),
  },
  {
    id: '2',
    titleKey: 'slide2Title',
    subtitleKey: 'slide2Subtitle',
    image: require('../assets/onboarding-quality.png'),
  },
  {
    id: '3',
    titleKey: 'slide3Title',
    subtitleKey: 'slide3Subtitle',
    image: require('../assets/onboarding-farmer.png'),
  },
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const colors = useThemeStore((s) => s.colors);
  const { t } = useLanguageStore();

  const onNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    }
  };

  const onSkip = () => {
    setOnboarded();
    router.replace('/(auth)/role-select');
  };

  const onGetStarted = () => {
    setOnboarded();
    router.replace('/(auth)/role-select');
  };

  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(Number(viewableItems[0].index));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={onSkip} style={styles.skip}>
        <Text style={[styles.skipText, { color: colors.onSurfaceVariant }]}>{t.common.skip}</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const s = item as typeof slides[number];
          return (
            <View style={styles.slide}>
              <Image source={s.image} style={styles.image} resizeMode="contain" />
              <Text style={[styles.title, { color: colors.primary }]}>{t.onboarding[s.titleKey]}</Text>
              <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{t.onboarding[s.subtitleKey]}</Text>
            </View>
          );
        }}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: colors.outlineVariant }, i === currentIndex && { backgroundColor: colors.primary, width: 24 }]} />
          ))}
        </View>

        {currentIndex === slides.length - 1 ? (
          <Button title={t.common.getStarted} onPress={onGetStarted} size="lg" />
        ) : (
          <Button title={t.common.next} onPress={onNext} size="lg" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  skip: { position: 'absolute', top: 20, right: spacing.containerPadding, zIndex: 10 },
  skipText: { ...typography.bodyMd },
  slide: { width, alignItems: 'center', paddingHorizontal: spacing.containerPadding, paddingTop: 40 },
  image: { width: 280, height: 250, marginBottom: spacing.xxxl },
  title: { ...typography.headlineLg, textAlign: 'center', marginBottom: spacing.md },
  subtitle: { ...typography.bodyLg, textAlign: 'center', lineHeight: 26 },
  footer: {
    position: 'absolute', bottom: 60, left: spacing.containerPadding, right: spacing.containerPadding,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.xxl },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
});
