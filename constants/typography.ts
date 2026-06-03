import { Platform } from 'react-native';

const fontFamily = 'NunitoSans_400Regular';
const fontFamilyBold = 'NunitoSans_700Bold';
const fontFamilyExtraBold = 'NunitoSans_800ExtraBold';
const fontFamilySemiBold = 'NunitoSans_600SemiBold';

export const typography = {
  displayLg: {
    fontFamily: fontFamilyExtraBold,
    fontSize: Platform.OS === 'web' ? 48 : 40,
    lineHeight: Platform.OS === 'web' ? 52.8 : 44,
    letterSpacing: -0.02,
  },
  headlineLg: {
    fontFamily: fontFamilyBold,
    fontSize: Platform.OS === 'web' ? 32 : 28,
    lineHeight: Platform.OS === 'web' ? 38.4 : 33.6,
  },
  headlineMd: {
    fontFamily: fontFamilyBold,
    fontSize: 24,
    lineHeight: 31.2,
  },
  headlineSm: {
    fontFamily: fontFamilyBold,
    fontSize: 20,
    lineHeight: 26,
  },
  titleLg: {
    fontFamily: fontFamilySemiBold,
    fontSize: 18,
    lineHeight: 25.2,
  },
  titleMd: {
    fontFamily: fontFamilySemiBold,
    fontSize: 16,
    lineHeight: 22.4,
  },
  bodyLg: {
    fontFamily,
    fontSize: 18,
    lineHeight: 28.8,
  },
  bodyMd: {
    fontFamily,
    fontSize: 16,
    lineHeight: 25.6,
  },
  bodySm: {
    fontFamily,
    fontSize: 14,
    lineHeight: 22.4,
  },
  labelLg: {
    fontFamily: fontFamilySemiBold,
    fontSize: 16,
    lineHeight: 22.4,
    letterSpacing: 0.01,
  },
  labelMd: {
    fontFamily: fontFamilySemiBold,
    fontSize: 14,
    lineHeight: 19.6,
    letterSpacing: 0.01,
  },
  labelSm: {
    fontFamily: fontFamilySemiBold,
    fontSize: 12,
    lineHeight: 16.8,
    letterSpacing: 0.01,
  },
};
