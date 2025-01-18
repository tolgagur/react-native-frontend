import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import tr from './locales/tr';
import en from './locales/en';

const LANGUAGES = {
  tr: { name: 'Türkçe', translation: tr },
  en: { name: 'English', translation: en }
};

const LANGUAGE_DETECTOR = {
  type: 'languageDetector',
  async: true,
  detect: async function(callback) {
    try {
      const savedLanguage = await AsyncStorage.getItem('user-language');
      if (savedLanguage) {
        return callback(savedLanguage);
      }
      
      // Cihaz dilini kontrol et
      const deviceLanguage = Localization.locale.split('-')[0];
      return callback(LANGUAGES[deviceLanguage] ? deviceLanguage : 'en');
    } catch (error) {
      return callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async function(language) {
    try {
      await AsyncStorage.setItem('user-language', language);
    } catch (error) {
      // Hata durumunda sessizce devam et
    }
  }
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    resources: LANGUAGES,
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 