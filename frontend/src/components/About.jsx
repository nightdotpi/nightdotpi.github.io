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
              {t('about.aboutNightKicker')}
            </div>

            <h2 className="about-subtitle">
              {t('about.aboutNightSubtitle')}
            </h2>

            <h1 className="about-title">
              {t('about.aboutNightTitleBefore')}{' '}
              <span className="highlight">
                {t('about.aboutNightTitleHighlight')}
              </span>
            </h1>

            <p className="about-text">
              {t('about.aboutNightText')}
            </p>

            <p className="about-text about-text-secondary">
              {t('about.aboutNightTextSecondary')}
            </p>

            <div className="about-stats">
              <div className="stat-item">
                <span className="stat-number">NIGHT</span>
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
                <span className="stat-number">ecosystem</span>
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
                {t('about.nightShortName')}
              </div>

              <h3>
                {t('about.nightMissionTitle')}
              </h3>

              <p>
                {t('about.nightMissionText')}
              </p>

              <div className="vision-points">
                <div className="vision-point">
                  <span>🗳️</span>
                  <p>{t('about.nightPointVoting')}</p>
                </div>

                <div className="vision-point">
                  <span>🔍</span>
                  <p>{t('about.nightPointTransparency')}</p>
                </div>

                <div className="vision-point">
                  <span>🤝</span>
                  <p>{t('about.nightPointUnity')}</p>
                </div>
              </div>

              <div className="vision-badge">
                {t('about.nightVisionBadge')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
