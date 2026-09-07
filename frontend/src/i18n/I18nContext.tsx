// frontend/src/i18n/I18nContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';

import { translations } from './translations';
import type { Language, Direction } from './translations';

export type { Language, Direction } from './translations';

interface I18nContextType {
  lang: Language;
  language: Language;
  direction: Direction;
  isRtl: boolean;
  setLang: (lang: Language) => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const SUPPORTED_LANGUAGES: Language[] = ['en', 'fa', 'ar', 'tr', 'zh'];
const STORAGE_KEY = 'picex_lang';

const isSupportedLanguage = (value: unknown): value is Language => {
  return typeof value === 'string' && SUPPORTED_LANGUAGES.includes(value as Language);
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const savedLang = localStorage.getItem(STORAGE_KEY);

  if (isSupportedLanguage(savedLang)) {
    return savedLang;
  }

  const browserLang = navigator.language?.toLowerCase() || '';

  if (browserLang.startsWith('fa')) return 'fa';
  if (browserLang.startsWith('ar')) return 'ar';
  if (browserLang.startsWith('tr')) return 'tr';
  if (browserLang.startsWith('zh')) return 'zh';

  return 'en';
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => getInitialLanguage());

  const direction: Direction = lang === 'fa' || lang === 'ar' ? 'rtl' : 'ltr';
  const isRtl = direction === 'rtl';

  const setLang = (nextLang: Language) => {
    if (!isSupportedLanguage(nextLang)) {
      return;
    }

    setLangState(nextLang);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, nextLang);
    }
  };

  const setLanguage = setLang;

  const t = (key: string): string => {
    if (!key) {
      return '';
    }

    const item = translations[key];

    if (item?.[lang]) {
      return item[lang];
    }

    if (item?.en) {
      return item.en;
    }

    return key;
  };

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.lang = lang;
    document.documentElement.dir = direction;
    document.body.dir = direction;

    document.body.classList.remove('ltr', 'rtl');
    document.body.classList.add(direction);
  }, [lang, direction]);

  const value = useMemo<I18nContextType>(
    () => ({
      lang,
      language: lang,
      direction,
      isRtl,
      setLang,
      setLanguage,
      t,
    }),
    [lang, direction, isRtl]
  );

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider');
  }

  return context;
};

export default I18nContext;
