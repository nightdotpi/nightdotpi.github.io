// frontend/src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useI18n } from '../i18n/I18nContext';
import logo from '../assets/logo.png';

const Navbar = () => {
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
    <nav className="navbar">
      <div className="navbar-container">
        {/* لوگو */}
        <div className="navbar-logo">
          <Link to="/" className="navbar-logo-link" aria-label={t('common.homeAriaLabel') || 'Night Home'}>
            <img
              src={logo}
              alt="Night Logo"
              className="navbar-logo-img"
            />

            <span className="navbar-logo-text">
              Nigh<span>t</span>
            </span>
          </Link>
        </div>

        {/* منوی اصلی */}
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              {t('common.home')}
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/dig" className="nav-link">
              {t('nav.dig')}
            </Link>
          </li>

          <li className="nav-item">
            <button
              type="button"
              className="nav-link nav-button"
              onClick={() => scrollToSection('features')}
            >
              {t('common.features')}
            </button>
          </li>

          <li className="nav-item">
            <button
              type="button"
              className="nav-link nav-button"
              onClick={() => scrollToSection('roadmap')}
            >
              {t('nav.roadmap')}
            </button>
          </li>

          <li className="nav-item">
            <button
              type="button"
              className="nav-link nav-button"
              onClick={() => scrollToSection('poll')}
            >
              {t('common.governance')}
            </button>
          </li>

          <li className="nav-item">
            <button
              type="button"
              className="nav-link nav-button"
              onClick={() => scrollToSection('about')}
            >
              {t('common.aboutUs')}
            </button>
          </li>

          <li className="nav-item">
            <Link to="/shop" className="nav-link">
              {t('common.shop')}
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/tasks" className="nav-link">
              {t('common.tasks')}
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
