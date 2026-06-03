import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { en } from './en';
import { sw } from './sw';
import type { Translations } from './en';

type Language = 'en' | 'sw';

const translations: Record<Language, Translations> = { en, sw };

interface LanguageState {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => Promise<void>;
  loadLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'en',
  t: en,

  setLanguage: async (lang) => {
    await SecureStore.setItemAsync('language', lang);
    set({ language: lang, t: translations[lang] });
  },

  loadLanguage: async () => {
    try {
      const stored = await SecureStore.getItemAsync('language');
      const lang = (stored === 'en' || stored === 'sw') ? stored : 'en';
      set({ language: lang, t: translations[lang] });
    } catch {
      set({ language: 'en', t: en });
    }
  },
}));
