import 'i18next';
import en from './locales/en.json' assert { type: 'json' };
import type i18n from '.';

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    // custom resources type
    defaultNS: 'en';
    resources: {
      en: typeof en;
    };
  }
}

declare module '@cavok/ui/i18n' {
  type TArgs = Parameters<typeof i18n.t>;
}
