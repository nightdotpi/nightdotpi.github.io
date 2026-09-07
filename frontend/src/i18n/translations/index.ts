import type { Translations } from '../I18nContext';

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

export const translations: Translations = {
  ...common,
  ...navbar,
  ...hero,
  ...about,
  ...features,
  ...roadmap,
  ...auth,
  ...poll,
  ...shop,
  ...payment,
  ...tasks,
  ...footer,
};
