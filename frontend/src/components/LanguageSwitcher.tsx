// frontend/src/i18n/I18nContext.tsx
import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { translations } from './translations';

export type Language = 'en' | 'fa' | 'ar' | 'tr' | 'zh';
export type Direction = 'ltr' | 'rtl';

interface I18nContextType {
  lang: Language;
  direction: Direction;
  isRtl: boolean;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  supportedLanguages: Language[];
  languageLabels: Record<Language, string>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const SUPPORTED_LANGUAGES: Language[] = ['en', 'fa', 'ar', 'tr', 'zh'];

const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  fa: 'فارسی',
  ar: 'العربية',
  tr: 'Türkçe',
  zh: '中文',
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>('en');

  const t = (key: string): string => {
    if (!key) return '';
    if (!translations || typeof translations !== 'object') return key;

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
    supportedLanguages: SUPPORTED_LANGUAGES,
    languageLabels: LANGUAGE_LABELS,
  }), [lang, direction, isRtl]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
};
