// frontend/src/i18n/translations/index.ts

// اول، type کلی 'Translations' رو از جایی که تعریف شده ایمپورت می‌کنیم
// فرض می‌کنیم این type در فایل I18nContext.tsx یا جای دیگری درست تعریف شده
// و ساختار آن شبیه به این است:
// export type Translations = {
//   [key: string]: { [lang in Language]?: string };
// };
// اما با روش namespace، type باید این شکلی شود:
// export type Translations = {
//   common: { [key: string]: { [lang in Language]?: string } };
//   navbar: { [key: string]: { [lang in Language]?: string } };
//   // ... و به همین ترتیب برای بقیه ماژول‌ها
// };
import type { Translations } from '../I18nContext'; // یا از یک فایل type جداگانه

// ماژول‌های ترجمه را وارد می‌کنیم
import { common } from './common';
import { navbar } from './navbar';
import { hero } from './hero';
import { about } from './about';
import { features } from './features';
import { roadmap } from './roadmap';
import { auth } from './auth';
import { poll } from './poll';
import { shop } from './shop';
import { payment } from './payment';
import { tasks } from './tasks';
import { footer } from './footer';
import { languageSwitcher } from './languageSwitcher';
import { piHomeLogin } from './piHomeLogin';
import { piPaymentPanel } from './piPaymentPanel';
import { signIn } from './signIn';
import { header } from './header';
import { homePage } from './homePage';
import { digPage } from './digPage';
import { success } from './success';
import { history } from './history';
import { productCard } from './productCard';

// ترکیب کردن ماژول‌ها به صورت تو در تو (Namespaced)
// توجه: Type 'Translations' باید با این ساختار مطابقت داشته باشد.
// اگر Type شما فقط یک آبجکت مسطح است، باید آن را هم بروز کنید.
export const translations = {
  common,
  navbar,
  hero,
  about,
  features,
  roadmap,
  auth,
  poll,
  shop,
  payment,
  tasks,
  footer,
  languageSwitcher,
  piHomeLogin,
  piPaymentPanel,
  signIn,
  header,
  homePage,
  digPage,
  success,
  history,
  productCard,
};

// نکته مهم: اگر Type 'Translations' در I18nContext.tsx به صورت ساده تعریف شده
// (مثلا فقط یک کلید-مقدار ساده)، باید آن Type را هم مطابق ساختار بالا تغییر دهید.
// یعنی باید چیزی شبیه این باشد:
// export type Translations = {
//   common: typeof common;
//   navbar: typeof navbar;
//   // ... و به همین ترتیب برای بقیه
// };
// این کار باعث می‌شود TypeScript بفهمد که هر ماژول، زیرمجموعه‌ای از ترجمه‌هاست.
