// frontend/src/components/PiPaymentPanel.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { maskUsername } from '../utils/userUtils';

const PI_SANDBOX = String(import.meta.env.VITE_PI_SANDBOX) === 'true';
const MIN_AMOUNT = 0.1;
const MAX_AMOUNT = 1000;

const PiPaymentPanel: React.FC = () => {
  const { user, login, logout } = useAuth();
  const { t } = useI18n();
  
  const [status, setStatus] = useState<string>(t('payment.status.initializing'));
  const [amount, setAmount] = useState<string>('1.0');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  const networkLabel = PI_SANDBOX ? t('common.testnet') : t('common.mainnet');

  // Load Pi SDK
  useEffect(() => {
    if (!window.Pi) {
      setStatus(t('payment.errors.sdkNotFound'));
      return;
    }

    try {
      if (!window.__PI_SDK_INITIALIZED__) {
        window.Pi.init({ version: '2.0', sandbox: PI_SANDBOX });
        window.__PI_SDK_INITIALIZED__ = true;
      }
      setStatus(`${t('payment.status.ready')} ${t('common.network')}: ${networkLabel}`);
    } catch (error: any) {
      console.error('Pi SDK init error:', error);
      setStatus(`${t('payment.errors.initError')} ${error?.message || String(error)}`);
    }
  }, [networkLabel, t]);

  const onIncompletePaymentFound = useCallback((payment: any) => {
    console.log('Incomplete payment found:', payment);
    setStatus(t('payment.errors.incompletePayment'));
  }, [t]);

  const handlePiLogin = async () => {
    if (!window.Pi) {
      setStatus(t('payment.errors.sdkNotFound'));
      return;
    }

    setIsLoading(true);
    setStatus(t('payment.status.authenticating'));

    try {
      const authResult = await window.Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
      
      const piUserId = authResult?.user?.uid || authResult?.uid || authResult?.id;
      const piUsername = authResult?.user?.username;
      const accessToken = authResult?.token;

      if (!piUserId) throw new Error('Invalid Pi user data');

      await login(String(piUserId), accessToken);
      setCurrentUsername(piUsername);
      setStatus(`${t('payment.status.loginSuccess')} @${maskUsername(piUsername || 'Pi User')}`);
    } catch (error: any) {
      console.error('Pi login error:', error);
      setStatus(`${t('payment.errors.loginFailed')} ${error?.message || ''}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createPayment = async () => {
    const amountNum = parseFloat(amount);
    
    // Validations
    if (isNaN(amountNum) || amountNum <= 0) {
      setStatus(t('payment.errors.invalidAmount'));
      return;
    }
    if (amountNum < MIN_AMOUNT) {
      setStatus(t('payment.errors.minAmount', { min: MIN_AMOUNT }));
      return;
    }
    if (amountNum > MAX_AMOUNT) {
      setStatus(t('payment.errors.maxAmount', { max: MAX_AMOUNT }));
      return;
    }

    if (!user) {
      setStatus(t('payment.errors.pleaseLoginFirst'));
      return;
    }

    setIsLoading(true);
    setStatus(t('payment.status.creating', { network: networkLabel }));

    try {
      // 1. Create Payment on Backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ amount: amountNum })
      });

      const paymentData = await response.json();
      if (!response.ok) throw new Error(paymentData.error || t('payment.errors.serverApprovalFailed'));

      // 2. Pi SDK Payment
      if (!window.Pi.createPayment) throw new Error(t('payment.errors.createFunctionMissing'));

      window.Pi.createPayment({
        amount: amountNum,
        memo: `Payment of ${amountNum} Pi`,
        metadata: { paymentId: paymentData.paymentId },
        onReadyForServerApproval: (paymentId: string) => {
          setStatus(t('payment.status.approvingOnServer'));
          fetch(`${import.meta.env.VITE_API_URL}/approve-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
            body: JSON.stringify({ paymentId: paymentId, txid: paymentData.txid })
          }).then(res => {
            if (!res.ok) throw new Error(t('payment.errors.serverApprovalFailed'));
            setStatus(t('payment.status.approvedContinue'));
          }).catch(err => setStatus(`${t('payment.errors.serverApprovalError')} ${err.message}`));
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          setStatus(t('payment.status.completingOnServer'));
          fetch(`${import.meta.env.VITE_API_URL}/complete-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
            body: JSON.stringify({ paymentId, txid })
          }).then(res => {
            if (!res.ok) throw new Error(t('payment.errors.serverCompletionFailed'));
            setStatus(`${t('payment.status.completed')} TXID: ${txid}`);
          }).catch(err => setStatus(`${t('payment.errors.serverCompletionError')} ${err.message}`));
        },
        onCancel: () => setStatus(t('payment.errors.paymentCancelled')),
        onError: (error: any) => setStatus(`${t('payment.errors.paymentError')} ${error.message}`)
      });

      setStatus(t('payment.status.requestSent'));

    } catch (error: any) {
      console.error('Create payment error:', error);
      setStatus(`${t('payment.errors.createError')} ${error?.message || ''}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>{t('payment.title')}</h2>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>{t('payment.description')}</p>

      <div style={{ marginBottom: '15px' }}>
        <span style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold' }}>
          {t('common.network')}: {networkLabel}
        </span>
      </div>

      {!user ? (
        <button 
          onClick={handlePiLogin} 
          disabled={isLoading}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#673ab7', color: '#fff', cursor: 'pointer' }}
        >
          {isLoading ? t('common.pleaseWait') : t('payment.button.login')}
        </button>
      ) : (
        <>
          <p style={{ marginBottom: '10px', fontSize: '14px' }}>
            {t('payment.welcome', { username: maskUsername(currentUsername || user.username || 'Pi User') })}
          </p>
          <button onClick={logout} style={{ fontSize: '12px', color: 'red', marginBottom: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>
            {t('payment.button.logout')}
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '14px' }}>{t('payment.field.amount')}</label>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
            />
            <p style={{ fontSize: '12px', color: '#888' }}>
              {t('payment.limits', { min: MIN_AMOUNT, max: MAX_AMOUNT })}
            </p>
            
            <button 
              onClick={createPayment} 
              disabled={isLoading}
              style={{ padding: '12px', borderRadius: '8px', border: 'none', background: '#4caf50', color: '#fff', cursor: 'pointer' }}
            >
              {isLoading ? t('payment.status.processing') : t('payment.button.pay', { amount })}
            </button>
          </div>
        </>
      )}

      <div style={{ marginTop: '20px', padding: '12px', background: '#f5f5f5', borderRadius: '8px', fontSize: '12px', wordBreak: 'break-all' }}>
        {status}
      </div>
    </div>
  );
};

export default PiPaymentPanel;
              
