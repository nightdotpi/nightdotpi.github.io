// frontend/src/i18n/I18nContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { translations } from './translations'; // این مسیر نباید حلقوی باشد

export type Language = 'en' | 'fa' | 'ar' | 'tr' | 'zh';
export type Direction = 'ltr' | 'rtl';

interface I18nContextType {
  lang: Language;
  direction: Direction;
  isRtl: boolean;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>('en');

  // استفاده از تابع t ایمن شده
  const t = (key: string): string => {
    if (!key) return '';
    
    // ایمنی: اگر به هر دلیلی translations لود نشده بود کرش نکند
    if (!translations || typeof translations !== 'object') return key;

    // دسترسی به کلید
    const item = (translations as any)[key];

    if (item && typeof item === 'object' && item[lang]) {
      return item[lang];
    }
    if (item && typeof item === 'object' && item.en) {
      return item.en;
    }
    return key;
  };

  const direction: Direction = lang === 'fa' || lang === 'ar' ? 'rtl' : 'ltr';
  const isRtl = direction === 'rtl';

  const setLang = (nextLang: Language) => {
    setLangState(nextLang);
    localStorage.setItem('picex_lang', nextLang);
  };

  const value = useMemo(() => ({
    lang,
    direction,
    isRtl,
    setLang,
    t,
  }), [lang, direction, isRtl]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
};
