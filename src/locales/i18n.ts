import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import arCommon from './ar/common.json';
import enCommon from './en/common.json';

const savedLang = localStorage.getItem('dhabayih_language') || 'ar';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: arCommon },
      en: { translation: enCommon },
    },
    lng: savedLang,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false,
    },
  });

// Apply RTL / LTR immediately
document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = savedLang;

export default i18n;