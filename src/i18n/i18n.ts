import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from '../locales/english/en.translation.json';
import hiTranslations from '../locales/hindi/hi.translation.json';
import teTranslations from '../locales/telugu/te.translation.json';


i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      hi: { translation: hiTranslations },
      te: { translation: teTranslations },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
