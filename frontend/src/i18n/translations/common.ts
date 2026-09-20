// فایل frontend/src/i18n/translations/common.ts

// ۱. این ایمپورت را حذف کنید (چون common کل Translations نیست)
// import type { Translations } from '../I18nContext'; 

// ۲. یک تایپ ساده برای تک تک آیتم‌ها تعریف کنید یا از any استفاده کنید تا فعلاً کرش متوقف شود
type TranslationEntry = {
  fa: string;
  en: string;
  tr?: string;
  zh?: string;
  hi?: string;
  ar?: string;
};

export const common: Record<string, TranslationEntry> = {
  appTitle: {
    fa: 'اکوسیستم نایت',
    en: 'Night Ecosystem',
    tr: 'Night Ekosistemi',
    zh: 'Night 生态系统',
    hi: 'Night इकोसिस्टम',
    ar: 'منظومة Night',
  },
  // ... بقیه موارد با همین ساختار
};
