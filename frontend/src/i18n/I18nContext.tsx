// frontend/src/i18n/I18nContext.tsx
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  ReactNode,
} from 'react';
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

const STORAGE_KEY = 'picex_lang';

function isValidLanguage(value: string | null): value is Language {
  return (
    value !== null &&
    (SUPPORTED_LANGUAGES as string[]).includes(value)
  );
}

function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isValidLanguage(saved)) {
      return saved;
    }
  } catch {
    // localStorage may be unavailable
  }
  return 'en';
}

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>(getInitialLanguage);

  /**
   * کلیدها به‌صورت namespaced و نقطه‌دار هستند، مثل 'hero.nightHeroTitle'.
   * باید کلید را split کرده و در ساختار تودرتوی translations پایین برویم.
   */
  const t = (key: string): string => {
    if (!key) return '';
    if (!translations || typeof translations !== 'object') return key;

    const parts = key.split('.');
    let node: any = translations;

    for (const part of parts) {
      if (node && typeof node === 'object' && part in node) {
        node = node[part];
      } else {
        return key; // مسیر پیدا نشد، خود کلید را برگردان
      }
    }

    if (node && typeof node === 'object') {
      return node[lang] || node.en || key;
    }

    if (typeof node === 'string') {
      return node;
    }

    return key;
  };

  const direction: Direction = lang === 'fa' || lang === 'ar' ? 'rtl' : 'ltr';
  const isRtl = direction === 'rtl';

  const setLang = (nextLang: Language) => {
    if (!isValidLanguage(nextLang)) return;
    setLangState(nextLang);
    try {
      localStorage.setItem(STORAGE_KEY, nextLang);
    } catch {
      // ignore
    }
  };

  // همگام‌سازی dir و lang روی <html> برای RTL و دسترس‌پذیری
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = direction;
  }, [lang, direction]);

  const value = useMemo(
    () => ({
      lang,
      direction,
      isRtl,
      setLang,
      t,
      supportedLanguages: SUPPORTED_LANGUAGES,
      languageLabels: LANGUAGE_LABELS,
    }),
    [lang, direction, isRtl]
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
};
