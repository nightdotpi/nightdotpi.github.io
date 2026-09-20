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
          {/* ستون اول: معرفی NIGHT */}
          <div className="about-content">
            <div className="about-kicker">
              {t('aboutDigKicker')}
            </div>

            <h2 className="about-subtitle">
              {t('aboutDigSubtitle')}
            </h2>

            <h1 className="about-title">
              {t('aboutDigTitleBefore')}{' '}
              <span className="highlight">
                {t('aboutDigTitleHighlight')}
              </span>
            </h1>

            <p className="about-text">
              {t('aboutDigText')}
            </p>

            <p className="about-text about-text-secondary">
              {t('aboutDigTextSecondary')}
            </p>

            <div className="about-stats">
              <div className="stat-item">
                <span className="stat-number">DIG</span>
                <span className="stat-label">
                  {t('statGlobalGovernance')}
                </span>
              </div>

              <div className="stat-item">
                <span className="stat-number">Pi</span>
                <span className="stat-label">
                  {t('statPiIdentity')}
                </span>
              </div>

              <div className="stat-item">
                <span className="stat-number">DAO</span>
                <span className="stat-label">
                  {t('statPeopleVoting')}
                </span>
              </div>
            </div>
          </div>

          {/* ستون دوم: کارت مأموریت */}
          <div className="about-visual">
            <div className="vision-card">
              <div className="vision-icon">🌍</div>

              <div className="vision-label">
                {t('digShortName')}
              </div>

              <h3>
                {t('digMissionTitle')}
              </h3>

              <p>
                {t('digMissionText')}
              </p>

              <div className="vision-points">
                <div className="vision-point">
                  <span>🗳️</span>
                  <p>{t('digPointVoting')}</p>
                </div>

                <div className="vision-point">
                  <span>🔍</span>
                  <p>{t('digPointTransparency')}</p>
                </div>

                <div className="vision-point">
                  <span>🤝</span>
                  <p>{t('digPointUnity')}</p>
                </div>
              </div>

              <div className="vision-badge">
                {t('digVisionBadge')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
