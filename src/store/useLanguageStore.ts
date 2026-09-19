import { create } from 'zustand';
import i18n from '../locales/i18n';

interface LanguageStore {
  language: 'ar' | 'en';
  isRTL: boolean;
  setLanguage: (lang: 'ar' | 'en') => void;
  toggleLanguage: () => void;
}

const saved = (localStorage.getItem('dhabayih_language') as 'ar' | 'en') || 'ar';

export const useLanguageStore = create<LanguageStore>((set, get) => ({
  language: saved,
  isRTL: saved === 'ar',

  setLanguage: (lang: 'ar' | 'en') => {
    localStorage.setItem('dhabayih_language', lang);
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    set({ language: lang, isRTL: lang === 'ar' });
    window.location.reload();
  },

  toggleLanguage: () => {
    const next = get().language === 'ar' ? 'en' : 'ar';
    get().setLanguage(next);
  },

}));