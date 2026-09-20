// frontend/src/components/Roadmap.jsx
import React from 'react';
import './Roadmap.css';
import { useI18n } from '../i18n/I18nContext';

const Roadmap = () => {
  const { t } = useI18n();

  // انتقال کلیدها به ساختار Namespaced
  const steps = [
    {
      number: '01',
      icon: '🌱',
      title: t('roadmap.step1.title'),
      description: t('roadmap.step1.description'),
    },
    {
      number: '02',
      icon: '🗳️',
      title: t('roadmap.step2.title'),
      description: t('roadmap.step2.description'),
    },
    {
      number: '03',
      icon: 'π',
      title: t('roadmap.step3.title'),
      description: t('roadmap.step3.description'),
    },
    {
      number: '04',
      icon: '🌐',
      title: t('roadmap.step4.title'),
      description: t('roadmap.step4.description'),
    },
    {
      number: '05',
      icon: '🏛️',
      title: t('roadmap.step5.title'),
      description: t('roadmap.step5.description'),
    },
    {
      number: '06',
      icon: '💠',
      title: t('roadmap.step6.title'),
      description: t('roadmap.step6.description'),
    },
  ];

  return (
    <section id="roadmap" className="roadmap-section">
      <div className="container">
        <div className="roadmap-heading">
          {/* استفاده از نِی‌اسپیس برای عنوان‌های اصلی */}
          <span className="roadmap-kicker">
            {t('common.brandName')}
          </span>

          <h2 className="roadmap-title">
            {t('roadmap.title')}
          </h2>

          <p className="roadmap-intro">
            {t('roadmap.intro')}
          </p>
        </div>

        <div className="roadmap-timeline">
          {steps.map((step, index) => (
            <div key={index} className="roadmap-card">
              <div className="roadmap-number">
                {step.number}
              </div>

              <div className="roadmap-icon">
                {step.icon}
              </div>

              <h3>
                {step.title}
              </h3>

              <p>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
