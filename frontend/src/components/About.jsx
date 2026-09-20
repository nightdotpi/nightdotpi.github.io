// frontend/src/components/About.jsx
import React from 'react';
import './About.css';
import { useI18n } from '../i18n/I18nContext';

const About = () => {
  const { t } = useI18n();

  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="about-wrapper">
          {/* ستون اول: معرفی Night */}
          <div className="about-content">
            <div className="about-kicker">
              {t('about.aboutDigKicker')}
            </div>

            <h2 className="about-subtitle">
              {t('about.aboutDigSubtitle')}
            </h2>

            <h1 className="about-title">
              {t('about.aboutDigTitleBefore')}{' '}
              <span className="highlight">
                {t('about.aboutDigTitleHighlight')}
              </span>
            </h1>

            <p className="about-text">
              {t('about.aboutDigText')}
            </p>

            <p className="about-text about-text-secondary">
              {t('about.aboutDigTextSecondary')}
            </p>

            <div className="about-stats">
              <div className="stat-item">
                <span className="stat-number">DIG</span>
                <span className="stat-label">
                  {t('about.statGlobalGovernance')}
                </span>
              </div>

              <div className="stat-item">
                <span className="stat-number">Pi</span>
                <span className="stat-label">
                  {t('about.statPiIdentity')}
                </span>
              </div>

              <div className="stat-item">
                <span className="stat-number">DAO</span>
                <span className="stat-label">
                  {t('about.statPeopleVoting')}
                </span>
              </div>
            </div>
          </div>

          {/* ستون دوم: کارت مأموریت */}
          <div className="about-visual">
            <div className="vision-card">
              <div className="vision-icon">🌍</div>

              <div className="vision-label">
                {t('about.digShortName')}
              </div>

              <h3>
                {t('about.digMissionTitle')}
              </h3>

              <p>
                {t('about.digMissionText')}
              </p>

              <div className="vision-points">
                <div className="vision-point">
                  <span>🗳️</span>
                  <p>{t('about.digPointVoting')}</p>
                </div>

                <div className="vision-point">
                  <span>🔍</span>
                  <p>{t('about.digPointTransparency')}</p>
                </div>

                <div className="vision-point">
                  <span>🤝</span>
                  <p>{t('about.digPointUnity')}</p>
                </div>
              </div>

              <div className="vision-badge">
                {t('about.digVisionBadge')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
