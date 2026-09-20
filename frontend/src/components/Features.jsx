// frontend/src/components/Features.jsx
import React from 'react';
import './Features.css';
import { useI18n } from '../i18n/I18nContext';

const Features = () => {
  const { t } = useI18n();

  // کلیدها با پیشوند features. اصلاح شدند تا با سیستم Namespace هماهنگ باشند
  const features = [
    {
      title: t('features.featureGlobalVotingTitle'),
      description: t('features.featureGlobalVotingDescription'),
      icon: '🗳️',
    },
    {
      title: t('features.featureTransparentGovernanceTitle'),
      description: t('features.featureTransparentGovernanceDescription'),
      icon: '🔍',
    },
    {
      title: t('features.featurePiIdentityTitle'),
      description: t('features.featurePiIdentityDescription'),
      icon: 'π',
    },
    {
      title: t('features.featureNightInfrastructureTitle'), // تغییر از Dao به Night
      description: t('features.featureNightInfrastructureDescription'), // تغییر از Dao به Night
      icon: '🌐',
    },
    {
      title: t('features.featureDigitalEconomyTitle'),
      description: t('features.featureDigitalEconomyDescription'),
      icon: '💠',
    },
    {
      title: t('features.featureConflictResolutionTitle'),
      description: t('features.featureConflictResolutionDescription'),
      icon: '🤝',
    },
  ];

  return (
    <section id="features" className="features-section">
      <div className="container">
        <div className="features-heading">
          {/* فرض بر این است که این کلید در ماژول features یا common است */}
          <span className="features-kicker">
            {t('features.nightShortName')}
          </span>

          <h2 className="section-title">
            {t('features.nightFeaturesSectionTitle')}
          </h2>

          <p className="features-intro">
            {t('features.nightFeaturesSectionIntro')}
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">
                  {feature.icon}
                </span>
              </div>

              <h3 className="feature-title">
                {feature.title}
              </h3>

              <p className="feature-description">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
