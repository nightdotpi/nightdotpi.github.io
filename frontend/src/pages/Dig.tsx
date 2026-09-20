// frontend/src/pages/Dig.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useI18n } from '../i18n/I18nContext';
import './Dig.css';

const Dig: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="dig-page">
      <Navbar />

      <main className="dig-main">
        <div className="dig-language">
          <LanguageSwitcher />
        </div >

        <section className="dig-hero-section">
          <div className="dig-container">
            <div className="dig-badge">
              {t('dig.shortName')} · {t('dig.fullName')}
            </div >

            <h1 className="dig-title">
              {t('dig.pageTitle')}
            </h1>

            <p className="dig-lead">
              {t('dig.pageLead')}
            </p>

            <div className="dig-actions">
              <Link to="/" className="dig-primary-link">
                {t('common.backToHome')}
              </Link>

              <a href="#dig-roadmap" className="dig-secondary-link">
                {t('dig.navRoadmap')}
              </a>
            </div >
          </div >
        </section >

        <section className="dig-content-section">
          <div className="dig-container dig-grid">
            <article className="dig-card dig-card-large">
              <span className="dig-card-icon">🌍</span>
              <h2>{t('dig.what.title')}</h2>
              <p>{t('dig.what.text')}</p>
            </article >

            <article className="dig-card">
              <span className="dig-card-icon">🗳️</span>
              <h3>{t('dig.voting.title')}</h3>
              <p>{t('dig.voting.text')}</p>
            </article >

            <article className="dig-card">
              <span className="dig-card-icon">🔍</span>
              <h3>{t('dig.transparency.title')}</h3>
              <p>{t('dig.transparency.text')}</p>
            </article >

            <article className="dig-card">
              <span className="dig-card-icon">π</span>
              <h3>{t('dig.piRole.title')}</h3>
              <p>{t('dig.piRole.text')}</p>
            </article >

            <article className="dig-card">
              <span className="dig-card-icon">🤝</span>
              <h3>{t('dig.conflict.title')}</h3>
              <p>{t('dig.conflict.text')}</p>
            </article >

            <article className="dig-card">
              <span className="dig-card-icon">💠</span>
              <h3>{t('dig.dib.title')}</h3>
              <p>{t('dig.dib.text')}</p>
            </article >
          </div >
        </section >

        <section id="dig-roadmap" className="dig-roadmap-section">
          <div className="dig-container">
            <div className="dig-section-heading">
              <span>{t('dig.shortName')}</span>
              <h2>{t('dig.manifestoRoadmap.title')}</h2>
              <p>{t('dig.manifestoRoadmap.intro')}</p>
            </div >

            <div className="dig-roadmap-list">
              <div className="dig-roadmap-item">
                <strong>01</strong>
                <div>
                  <h3>{t('dig.roadmap.step1.title')}</h3>
                  <p>{t('dig.roadmap.step1.description')}</p>
                </div >
              </div >

              <div className="dig-roadmap-item">
                <strong>02</strong>
                <div>
                  <h3>{t('dig.roadmap.step2.title')}</h3>
                  <p>{t('dig.roadmap.step2.description')}</p>
                </div >
              </div >

              <div className="dig-roadmap-item">
                <strong>03</strong>
                <div>
                  <h3>{t('dig.roadmap.step3.title')}</h3>
                  <p>{t('dig.roadmap.step3.description')}</p>
                </div >
              </div >

              <div className="dig-roadmap-item">
                <strong>04</strong>
                <div>
                  <h3>{t('dig.roadmap.step4.title')}</h3>
                  <p>{t('dig.roadmap.step4.description')}</p>
                </div >
              </div >

              <div className="dig-roadmap-item">
                <strong>05</strong>
                <div>
                  <h3>{t('dig.roadmap.step5.title')}</h3>
                  <p>{t('dig.roadmap.step5.description')}</p>
                </div >
              </div >

              <div className="dig-roadmap-item">
                <strong>06</strong>
                <div>
                  <h3>{t('dig.roadmap.step6.title')}</h3>
                  <p>{t('dig.roadmap.step6.description')}</p>
                </div >
              </div >
            </div >
          </div >
        </section >

        <section className="dig-disclaimer-section">
          <div className="dig-container">
            <div className="dig-disclaimer">
              <h2>{t('dig.disclaimer.title')}</h2>
              <p>{t('dig.disclaimer.text')}</p>
            </div >
          </div >
        </section >
      </main >

      <Footer />
    </div >
  );
};

export default Dig;
