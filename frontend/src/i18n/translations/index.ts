import type { Translations } from '../I18nContext';
import { common } from './common';
import { navbar } from './navbar';
import { hero } from './hero';

// بعداً: about/features/roadmap/auth/poll/payment/shop/tasks/footer...
export const translations: Translations = {
  ...common,
  ...navbar,
  ...hero,
};
