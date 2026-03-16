import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

import en from './locales/en.json';
import fr from './locales/fr.json';

i18n.use(initReactI18next).init({
  debug: import.meta.env.DEV,
  fallbackLng: 'en',
  supportedLngs: ['en', 'fr'],

  defaultNS: 'translation',
  ns: ['translation'],

  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },

  interpolation: {
    escapeValue: false, // React already escapes
  },

  // optional: reduce noise in dev
  saveMissing: false,
  returnNull: false,
  returnEmptyString: false,
});



export default i18n;
