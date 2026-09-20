// frontend/src/components/LanguageSwitcher.tsx
import React from 'react';
import { Language, useI18n } from '../i18n/I18nContext';

const LanguageSwitcher: React.FC = () => {
  const {
    lang,
    setLang,
    t,
    supportedLanguages,
    languageLabels,
  } = useI18n();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        margin: '16px auto',
        fontFamily: 'sans-serif',
        direction: lang === 'fa' || lang === 'ar' ? 'rtl' : 'ltr',
      }}
    >
      <label
        htmlFor="language-switcher"
        style={{
          fontSize: '13px',
          color: '#666',
          fontWeight: 600,
        }}
      >
        {t('common.language')}:
      </label>

      <select
        id="language-switcher"
        value={lang}
        onChange={(e) => setLang(e.target.value as Language)}
        aria-label={t('common.language')}
        style={{
          padding: '8px 12px',
          borderRadius: '10px',
          border: '1px solid #ccc',
          background: '#fff',
          color: '#111827',
          cursor: 'pointer',
          fontWeight: 600,
          minWidth: '130px',
        }}
      >
        {supportedLanguages.map((language) => (
          <option key={language} value={language}>
            {languageLabels[language]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
