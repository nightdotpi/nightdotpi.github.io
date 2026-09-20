// frontend/src/components/Footer.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Footer.css';
import { useI18n } from '../i18n/I18nContext';

const Footer = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId) => {
    const doScroll = () => {
      const element = document.getElementById(sectionId);

      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      } else {
        console.warn(`Section not found: #${sectionId}`);
      }
    };

    if (location.pathname !== '/') {
      navigate('/');

      setTimeout(() => {
        doScroll();
      }, 250);
    } else {
      doScroll();
    }
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          {/* تغییر برندینگ به NIGHT */}
          <Link to="/" className="footer-logo">
            NIGHT
          </Link>

          <div className="footer-badge">
            {t('footer.nightShortName')} · {t('footer.nightFullName')}
          </div>

          <p className="footer-description">
            {t('footer.footerDescription')}
          </p>
        </div>

        <ul className="footer-links">
          <li>
            <Link to="/night" className="footer-link">
              {t('common.navNight')}
            </Link>
          </li>

          <li>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="footer-link-button"
            >
              {t('common.features')}
            </button>
          </li>

          <li>
            <button
              type="button"
              onClick={() => scrollToSection('roadmap')}
              className="footer-link-button"
            >
              {t('common.navRoadmap')}
            </button>
          </li>

          <li>
            <button
              type="button"
              onClick={() => scrollToSection('poll')}
              className="footer-link-button"
            >
              {t('common.governance')}
            </button>
          </li>

          <li>
            <button
              type="button"
              onClick={() => scrollToSection('about')}
              className="footer-link-button"
            >
              {t('common.aboutUs')}
            </button>
          </li>

          <li>
            <Link to="/shop" className="footer-link">
              {t('common.shop')}
            </Link>
          </li>

          <li>
            <Link to="/tasks" className="footer-link">
              {t('common.tasks')}
            </Link>
          </li>
        </ul>

        <div className="footer-legal-links">
          <a
            href="/privacy.html"
            className="footer-legal-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('footer.privacyPolicy')}
          </a>

          <span className="footer-legal-separator">•</span>

          <a
            href="/terms.html"
            className="footer-legal-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('footer.termsOfService')}
          </a>

          <span className="footer-legal-separator">•</span>

          <a
            href="/whitepaper.html"
            className="footer-legal-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('footer.whitepaper')}
          </a>
        </div>

        <div className="footer-note">
          <p>
            {t('footer.footerNote')}
          </p>
        </div>

        <div className="copyright">
          <p>
            {/* تغییر برندینگ کپی‌رایت به NIGHT */}
            &copy; {new Date().getFullYear()} NIGHT. {t('footer.footerRights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
