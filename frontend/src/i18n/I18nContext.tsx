// frontend/src/i18n/I18nContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';

// فرض بر این است که فایل translations/index.ts در مسیر صحیح قرار دارد
// و type Definitions برای Language و Direction نیز در همان فایل یا جای دیگر تعریف شده‌اند
import { translations } from './translations';

// تعریف type ها در صورت عدم وجود در فایل translations/index.ts
// این type ها باید با کلیدهای موجود در فایل‌های ترجمه مطابقت داشته باشند.
export type Language = 'en' | 'fa' | 'ar' | 'tr' | 'zh';
export type Direction = 'ltr' | 'rtl';

// تعریف type برای هر کلید ترجمه. هر کلید باید شامل مقادیر برای زبان‌های پشتیبانی شده باشد.
// این type باید به صورت دینامیک یا دستی بر اساس فایل‌های ترجمه شما ساخته شود.
// برای مثال، اگر فایل common.ts شامل { welcome: { en: 'Welcome', fa: 'خوش آمدید' } } باشد:
// export type TranslationEntry = {
//   en: string;
//   fa?: string;
//   ar?: string;
//   tr?: string;
//   zh?: string;
// };
// export type Translations = {
//   [key: string]: TranslationEntry;
// };
// در اینجا ما از type ی که در کد اصلی شما بود استفاده می‌کنیم:
import type { Translations } from './translations';

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
    return 'en'; // زبان پیش‌فرض در سمت سرور
  }

  const savedLang = localStorage.getItem(STORAGE_KEY);

  if (isSupportedLanguage(savedLang)) {
    return savedLang;
  }

  // تلاش برای تشخیص زبان مرورگر
  const browserLang = navigator.language?.toLowerCase() || '';

  if (browserLang.startsWith('fa')) return 'fa';
  if (browserLang.startsWith('ar')) return 'ar';
  if (browserLang.startsWith('tr')) return 'tr';
  if (browserLang.startsWith('zh')) return 'zh';

  return 'en'; // زبان پیش‌فرض در صورت عدم تطابق
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => getInitialLanguage());

  const direction: Direction = lang === 'fa' || lang === 'ar' ? 'rtl' : 'ltr';
  const isRtl = direction === 'rtl';

  const setLang = (nextLang: Language) => {
    if (!isSupportedLanguage(nextLang)) {
      console.warn(`Unsupported language: ${nextLang}`);
      return;
    }

    setLangState(nextLang);

    // ذخیره زبان انتخاب شده در localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, nextLang);
    }
  };

  // alias برای سازگاری با نام‌های مختلف
  const setLanguage = setLang;

  const t = (key: string): string => {
    if (!key) {
      return ''; // برگرداندن رشته خالی برای کلید خالی
    }

    // دسترسی به ترجمه‌ها از فایل import شده
    const item = translations[key];

    if (item?.[lang]) {
      // اگر ترجمه برای زبان فعلی موجود است، آن را برگردان
      return item[lang];
    }

    if (item?.en) {
      // در غیر این صورت، اگر ترجمه انگلیسی موجود است، آن را برگردان
      return item.en;
    }

    // اگر هیچ ترجمه‌ای یافت نشد، خود کلید را برگردان
    return key;
  };

  // اعمال زبان و جهت‌دهی به document
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.lang = lang;
    document.documentElement.dir = direction;
    document.body.dir = direction; // جهت‌دهی برای body نیز اعمال می‌شود

    // کلاس‌های ltr/rtl را برای استایل‌دهی بیشتر اضافه/حذف کن
    document.body.classList.remove('ltr', 'rtl');
    document.body.classList.add(direction);
  }, [lang, direction]);

  // memoize کردن مقدار context برای جلوگیری از re-render های غیرضروری
  const value = useMemo<I18nContextType>(
    () => ({
      lang,
      language: lang, // alias
      direction,
      isRtl,
      setLang,
      setLanguage,
      t,
    }),
    [lang, direction, isRtl] // وابستگی‌ها برای useMemo
  );

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

// هوک سفارشی برای دسترسی آسان به context
export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);

  if (!context) {
    // خطای مشخص برای زمانی که هوک خارج از Provider استفاده شود
    throw new Error('useI18n must be used inside I18nProvider');
  }

  return context;
};

// export کردن خود context نیز ممکن است مفید باشد
export default I18nContext;
  
