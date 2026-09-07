import React from 'react';
import { useI18n } from '../i18n/I18nContext';

const Header: React.FC = () => {
  const { t } = useI18n();

  return (
    <header className="main-header" aria-label={t('headerBrandAria')}>
      <div className="logo-placeholder">{t('brandName')}</div>
    </header>
  );
};

export default Header;
