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
import { home } from './home';
import { dig } from './dig';
import { success } from './success';
import { history } from './history';
import { productCard } from './productCard';

// ترکیب به صورت Namespace
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
  home,
  dig,
  success,
  history,
  productCard,
};

// تعریف تایپ اصلی بر اساس ساختار بالا
// این تایپ به TypeScript می‌فهماند که هر کلید، شامل ماژول‌های بالا است
export type Translations = typeof translations;
