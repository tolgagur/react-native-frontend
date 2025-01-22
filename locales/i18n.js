import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en';
import tr from './tr';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en
      },
      tr: {
        translation: tr
      }
    },
    lng: 'tr', // varsayılan dil
    fallbackLng: 'en', // varsayılan dil bulunamazsa kullanılacak dil
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 