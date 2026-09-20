// frontend/src/components/SignIn.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const SignIn: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [status, setStatus] = useState<string>(t('signin.status.initializing'));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // استفاده از کلیدهای common برای وضعیت شبکه
  const networkLabel = PI_SANDBOX ? t('common.testnet') : t('common.mainnet');

  useEffect(() => {
    if (!window.Pi) {
      setStatus(t('signin.errors.sdkNotFound'));
      return;
    }

    try {
      if (!window.__PI_SDK_INITIALIZED__) {
        window.Pi.init({ version: '2.0', sandbox: PI_SANDBOX });
        window.__PI_SDK_INITIALIZED__ = true;
        window.__PI_SDK_SANDBOX__ = PI_SANDBOX;
      }
      setStatus(`${t('signin.status.ready')} ${t('common.network')}: ${networkLabel}`);
    } catch (error: any) {
      console.error('Pi SDK init error:', error);
      setStatus('Pi SDK init error: ' + (error?.message || String(error)));
    }
  }, [t, networkLabel]);

  const onIncompletePaymentFound = (payment: any) => {
    console.log('Incomplete payment found:', payment);
    setStatus(t('signin.errors.incompletePayment'));
  };

  const handlePiLogin = async () => {
    if (!auth) {
      setStatus(t('signin.errors.authContextMissing'));
      return;
    }

    if (!window.Pi) {
      setStatus(t('signin.errors.sdkNotFound'));
      return;
    }

    try {
      setIsLoading(true);
      setStatus(t('signin.status.authenticating'));

      const authResult = await window.Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
      
      const piUserId = authResult?.user?.uid || authResult?.uid || authResult?.id;
      const accessToken = authResult?.accessToken || authResult?.token;

      if (!piUserId) throw new Error('Invalid Pi user data');

      await auth.login(String(piUserId), accessToken);

      setStatus(`${t('signin.status.success')} ${t('signin.status.redirecting')}`);
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('Pi login error:', error);
      setStatus(`${t('signin.errors.loginFailed')} ${error?.message || ''}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #311b92, #673ab7)', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#ffffff', borderRadius: '22px', padding: '32px 24px', textAlign: 'center', boxShadow: '0 20px 45px rgba(0,0,0,0.25)' }}>
        <h1 style={{ color: '#673ab7', marginBottom: '8px', fontSize: '28px' }}>{t('signin.title')}</h1>
        <p style={{ color: '#666', marginBottom: '14px', fontSize: '15px', lineHeight: 1.6 }}>{t('signin.description')}</p>

        <div style={{ display: 'inline-block', marginBottom: '22px', padding: '6px 12px', borderRadius: '999px', background: PI_SANDBOX ? '#fff3e0' : '#e8f5e9', color: PI_SANDBOX ? '#ef6c00' : '#2e7d32', fontSize: '12px', fontWeight: 700 }}>
          {t('common.network')}: {networkLabel}
        </div>

        <button
          onClick={handlePiLogin}
          disabled={isLoading}
          style={{ width: '100%', padding: '14px 20px', borderRadius: '30px', border: 'none', background: isLoading ? '#999' : '#673ab7', color: '#fff', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 700 }}
        >
          {isLoading ? t('common.pleaseWait') : t('signin.button.login')}
        </button>

        <div style={{ marginTop: '20px', padding: '12px', borderRadius: '10px', background: '#f5f5f5', color: '#444', fontSize: '13px', wordBreak: 'break-word', lineHeight: 1.5 }}>
          {status}
        </div>

        <p style={{ marginTop: '16px', color: '#999', fontSize: '12px' }}>{t('signin.footer.piBrowserOnly')}</p>
      </div>
    </div>
  );
};

export default SignIn;
