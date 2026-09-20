// frontend/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { I18nProvider } from './i18n/I18nContext';

declare global {
  interface Window {
    __PI_BROWSER_REQUIRED_BLOCKED__?: boolean;
    Pi?: any;
    __PI_SDK_INITIALIZED__?: boolean;
    __PI_SDK_SANDBOX__?: boolean;
  }
}

const parseBooleanEnv = (value: unknown, defaultValue = false): boolean => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  return String(value).trim().toLowerCase() === 'true';
};

/**
 * Mainnet by default.
 * For Sandbox/Testnet set:
 * VITE_PI_SANDBOX=true
 */
const PI_SANDBOX = parseBooleanEnv(import.meta.env.VITE_PI_SANDBOX, false);

/**
 * Initialize Pi SDK once.
 * Pi SDK is loaded in frontend/index.html:
 * <script src="https://sdk.minepi.com/pi-sdk.js"></script>
 */
function initializePiSdk() {
  if (window.__PI_SDK_INITIALIZED__) {
    return;
  }

  if (!window.Pi) {
    console.warn(
      'Pi SDK is not available on window.Pi. Make sure pi-sdk.js is loaded before React or open the app inside Pi Browser.'
    );
    return;
  }

  if (typeof window.Pi.init !== 'function') {
    console.warn('Pi SDK init function is not available.');
    return;
  }

  try {
    window.Pi.init({
      version: '2.0',
      sandbox: PI_SANDBOX,
    });

    window.__PI_SDK_INITIALIZED__ = true;
    window.__PI_SDK_SANDBOX__ = PI_SANDBOX;

    console.log('Pi SDK initialized successfully from main.tsx.', {
      sandbox: PI_SANDBOX,
    });
  } catch (error) {
    console.error('Failed to initialize Pi SDK:', error);
  }
}

// اگر صفحه روی https://nightdotpi.github.io خارج از Pi Browser باز شده باشد،
// index.html پیام راهنما را نمایش می‌دهد و React نباید آن را جایگزین کند.
if (window.__PI_BROWSER_REQUIRED_BLOCKED__) {
  console.warn(
    'Pi Browser is required. React app rendering has been blocked outside Pi Browser.'
  );
} else {
  initializePiSdk();

  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error(
      "Critical Error: Could not find the root element with id 'root'. Please check your index.html"
    );
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <I18nProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </I18nProvider>
    </React.StrictMode>
  );
}
