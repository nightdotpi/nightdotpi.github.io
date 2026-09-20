// frontend/src/components/Header.tsx
import React from 'react';
import { useI18n } from '../i18n/I18nContext';

const Header: React.FC = () => {
  const { t } = useI18n();

  return (
    // استفاده از namespace 'common' برای المان‌های عمومی
    <header className="main-header" aria-label={t('common.headerBrandAria')}>
      <div className="logo-placeholder">{t('common.brandName')}</div>
    </header>
  );
};

export default Header;
