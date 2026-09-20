// frontend/src/components/PiHomeLogin.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';

declare global {
  interface Window {
    Pi?: any;
    __PI_SDK_INITIALIZED__?: boolean;
    __PI_SDK_SANDBOX__?: boolean;
  }
}

const parseBooleanEnv = (value: unknown, defaultValue = false): boolean => {
  if (value === undefined || value === null || value === '') return defaultValue;
  return String(value).trim().toLowerCase() === 'true';
};

const PI_SANDBOX = parseBooleanEnv(import.meta.env.VITE_PI_SANDBOX, false);

const PiHomeLogin: React.FC = () => {
  const auth = useAuth();
  const { t } = useI18n();

  const [status, setStatus] = useState<string>(t('auth.initializing'));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // استفاده از namespaces برای برچسب شبکه
  const networkLabel = PI_SANDBOX ? t('common.testnet') : t('common.mainnet');

  useEffect(() => {
    if (!window.Pi) {
      setStatus(t('auth.sdkNotFound'));
      return;
    }

    try {
      if (!window.__PI_SDK_INITIALIZED__) {
        window.Pi.init({ version: '2.0', sandbox: PI_SANDBOX });
        window.__PI_SDK_INITIALIZED__ = true;
        window.__PI_SDK_SANDBOX__ = PI_SANDBOX;
      }

      setStatus(`${t('auth.sdkReady')} ${t('common.network')}: ${networkLabel}`);
    } catch (error: any) {
      console.error('Pi SDK init error:', error);
      setStatus('Pi SDK error: ' + (error?.message || String(error)));
    }
  }, [t, networkLabel]);

  const onIncompletePaymentFound = (payment: any) => {
    console.log('Incomplete payment found:', payment);
    setStatus(t('auth.incompletePayment'));
  };

  const handleLogin = async () => {
    if (!auth) {
      setStatus(t('auth.contextMissing'));
      return;
    }

    if (!window.Pi) {
      setStatus(t('auth.sdkNotFound'));
      return;
    }

    try {
      setIsLoading(true);
      setStatus(t('auth.authenticating'));

      const authResult = await window.Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);

      const piUserId = authResult?.user?.uid || authResult?.user?.id || authResult?.uid;
      const username = authResult?.user?.username || authResult?.username || 'Pi User';
      const accessToken = authResult?.accessToken || authResult?.token;

      if (!piUserId) throw new Error('Invalid Pi user data');

      await auth.login(String(piUserId), String(username), accessToken);
      setStatus(`${t('auth.loginSuccess')} @${username}`);
    } catch (error: any) {
      console.error('Pi login error:', error);
      setStatus(`${t('auth.loginFailed')} ` + (error?.response?.data?.message || error?.message || 'Authentication failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    auth?.logout();
    setStatus(`${t('auth.sdkReady')} ${t('common.network')}: ${networkLabel}`);
  };

  return (
    <section style={{ margin: '20px auto', padding: '22px', maxWidth: '460px', borderRadius: '20px', background: '#ffffff', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid rgba(103,58,183,0.18)', textAlign: 'center' }}>
      <h2 style={{ color: '#673ab7', marginBottom: '8px' }}>{t('auth.loginTitle')}</h2>
      <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.7 }}>{t('auth.loginDescription')}</p>

      <div style={{ display: 'inline-block', margin: '10px 0 18px', padding: '6px 12px', borderRadius: '999px', background: PI_SANDBOX ? '#fff3e0' : '#e8f5e9', color: PI_SANDBOX ? '#ef6c00' : '#2e7d32', fontSize: '12px', fontWeight: 700 }}>
        {t('common.network')}: {networkLabel}
      </div>

      {!auth?.isAuthenticated ? (
        <button onClick={handleLogin} disabled={isLoading} style={{ width: '100%', maxWidth: '260px', padding: '13px 22px', borderRadius: '28px', border: 'none', background: isLoading ? '#999' : '#673ab7', color: '#fff', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '15px', fontWeight: 700 }}>
          {isLoading ? t('common.pleaseWait') : t('auth.loginWithPi')}
        </button>
      ) : (
        <>
          <p style={{ color: '#333', marginTop: '10px' }}>{t('common.welcome')}, <strong>@{auth.user?.username}</strong></p>
          <button onClick={handleLogout} style={{ padding: '10px 18px', borderRadius: '22px', border: '1px solid #ff5252', background: '#fff', color: '#ff5252', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
            {t('auth.logout')}
          </button>
        </>
      )}

      <div style={{ marginTop: '16px', padding: '12px', borderRadius: '10px', background: '#f5f5f5', color: '#444', fontSize: '13px', wordBreak: 'break-word' }}>
        {status}
      </div>
    </section>
  );
};

export default PiHomeLogin;
