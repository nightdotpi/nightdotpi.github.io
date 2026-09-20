// frontend/src/components/PiPaymentPanel.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../lib/axiosClient';

declare global {
  interface Window {
    Pi?: any;
    __PI_SDK_INITIALIZED__?: boolean;
    __PI_SDK_SANDBOX__?: boolean;
  }
}

const API_BASE_URL =
  (import.meta.env.VITE_API_URL || 'https://night.bonto.run/api').replace(
    /\/+$/,
    ''
  );

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

const DEFAULT_AMOUNT = import.meta.env.VITE_DEFAULT_PI_AMOUNT || '0.01';
const MIN_AMOUNT = Number(import.meta.env.VITE_MIN_PI_AMOUNT || '0.001');
const MAX_AMOUNT = Number(import.meta.env.VITE_MAX_PI_AMOUNT || '100');

function getHealthUrl() {
  if (!API_BASE_URL) return '';
  return API_BASE_URL.replace(/\/api\/?$/, '') + '/health';
}

const PiPaymentPanel: React.FC = () => {
  const auth = useAuth();

  const [status, setStatus] = useState<string>('Initializing Pi SDK...');
  const [username, setUsername] = useState<string>('');
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>(DEFAULT_AMOUNT);

  const isAuthenticated = Boolean(auth?.isAuthenticated);
  const currentUsername = auth?.user?.username || username;

  const networkLabel = PI_SANDBOX ? 'Testnet' : 'Mainnet';
  const networkValue = PI_SANDBOX ? 'testnet' : 'mainnet';

  useEffect(() => {
    console.log('User Agent:', navigator.userAgent);
    console.log('window.Pi:', window.Pi);
    console.log('Current URL:', window.location.href);
    console.log('Current Origin:', window.location.origin);
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('PI_SANDBOX:', PI_SANDBOX);

    if (!window.Pi) {
      setStatus('Pi SDK not found. Please open this app inside Pi Browser.');
      return;
    }

    try {
      if (!window.__PI_SDK_INITIALIZED__) {
        window.Pi.init({
          version: '2.0',
          sandbox: PI_SANDBOX,
        });

        window.__PI_SDK_INITIALIZED__ = true;
        window.__PI_SDK_SANDBOX__ = PI_SANDBOX;

        console.log('Pi SDK initialized successfully.', {
          sandbox: PI_SANDBOX,
        });
      } else if (window.__PI_SDK_SANDBOX__ !== PI_SANDBOX) {
        console.warn('Pi SDK was already initialized with another sandbox value.', {
          initializedSandbox: window.__PI_SDK_SANDBOX__,
          currentSandbox: PI_SANDBOX,
        });
      }

      setStatus(`Pi SDK ready. Network: ${networkLabel}`);
    } catch (error: any) {
      console.error('Pi SDK init error:', error);
      setStatus('Pi SDK init error: ' + (error?.message || String(error)));
    }
  }, []);

  useEffect(() => {
    if (auth?.user?.username) {
      setUsername(auth.user.username);
    }
  }, [auth?.user?.username]);

  const onIncompletePaymentFound = (payment: any) => {
    console.log('Incomplete payment found:', payment);
    setStatus('Incomplete payment found. Please complete or cancel it in Pi Browser.');
  };

  const warmUpBackend = async () => {
    if (!API_BASE_URL) {
      throw new Error('VITE_API_URL is not set.');
    }

    const healthUrl = getHealthUrl();

    if (!healthUrl) {
      return;
    }

    console.log('Warming up backend:', healthUrl);
    setStatus('Warming up backend...');

    try {
      await fetch(healthUrl, {
        method: 'GET',
      });
    } catch (error) {
      console.warn('Backend warm-up failed:', error);
    }
  };

  const loginWithPi = async () => {
    if (!auth) {
      setStatus('Auth context is missing.');
      return;
    }

    if (!window.Pi) {
      setStatus('Pi SDK not found. Please open this app inside Pi Browser.');
      return;
    }

    if (typeof window.Pi.authenticate !== 'function') {
      setStatus('Pi authenticate function is not available.');
      return;
    }

    try {
      setIsLoggingIn(true);
      setStatus('Authenticating with Pi...');

      const authResult = await window.Pi.authenticate(
        ['username', 'payments'],
        onIncompletePaymentFound
      );

      console.log('Pi auth result:', authResult);

      const piUserId =
        authResult?.user?.uid ||
        authResult?.user?.id ||
        authResult?.user?._id ||
        authResult?.uid ||
        authResult?.id;

      const piUsername =
        authResult?.user?.username ||
        authResult?.username ||
        'Pi User';

      const accessToken =
        authResult?.accessToken ||
        authResult?.access_token ||
        authResult?.token;

      if (!piUserId) {
        throw new Error('Invalid Pi user data received. Missing user id.');
      }

      /**
       * سازگار با AuthContext قبلی تو:
       * این تابع در فایل قبلی وجود داشت.
       */
      await auth.login(String(piUserId), String(piUsername), accessToken);

      setUsername(String(piUsername));
      setStatus(`Login successful. Welcome @${piUsername}`);
    } catch (error: any) {
      console.error('Pi auth error:', error);

      setStatus(
        'Login failed: ' +
          (
            error?.response?.data?.message ||
            error?.message ||
            'User cancelled or authentication failed'
          )
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    auth?.logout();
    setUsername('');
    setStatus(`Pi SDK ready. Network: ${networkLabel}`);
  };

  const validateAmount = () => {
    const parsedAmount = Number(amount);

    if (Number.isNaN(parsedAmount)) {
      return {
        valid: false,
        value: 0,
        message: 'Please enter a valid payment amount.',
      };
    }

    if (parsedAmount < MIN_AMOUNT) {
      return {
        valid: false,
        value: parsedAmount,
        message: `Minimum payment amount is ${MIN_AMOUNT} Pi.`,
      };
    }

    if (parsedAmount > MAX_AMOUNT) {
      return {
        valid: false,
        value: parsedAmount,
        message: `Maximum payment amount is ${MAX_AMOUNT} Pi.`,
      };
    }

    return {
      valid: true,
      value: parsedAmount,
      message: '',
    };
  };

  const approvePaymentOnServer = async (
    paymentId: string,
    orderId: string,
    paymentAmount: number
  ) => {
    console.log('Calling approve endpoint:', '/pi/approve', {
      paymentId,
      orderId,
      amount: paymentAmount,
      network: networkValue,
    });

    try {
      const response = await axiosClient.post('/pi/approve', {
        paymentId,
        orderId,
        amount: paymentAmount,
        network: networkValue,
        pageUrl: window.location.href,
        pageOrigin: window.location.origin,
      });

      console.log('Approve response:', response.status, response.data);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Server approval failed');
      }

      return response.data;
    } catch (error: any) {
      console.error('Approve request failed:', error?.response?.data || error);

      throw new Error(
        error?.response?.data?.message ||
          error?.response?.data?.error?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Server approval failed'
      );
    }
  };

  const completePaymentOnServer = async (
    paymentId: string,
    txid: string,
    orderId: string,
    paymentAmount: number
  ) => {
    console.log('Calling complete endpoint:', '/pi/complete', {
      paymentId,
      txid,
      orderId,
      amount: paymentAmount,
      network: networkValue,
    });

    try {
      const response = await axiosClient.post('/pi/complete', {
        paymentId,
        txid,
        orderId,
        amount: paymentAmount,
        network: networkValue,
        pageUrl: window.location.href,
        pageOrigin: window.location.origin,
      });

      console.log('Complete response:', response.status, response.data);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Server completion failed');
      }

      return response.data;
    } catch (error: any) {
      console.error('Complete request failed:', error?.response?.data || error);

      throw new Error(
        error?.response?.data?.message ||
          error?.response?.data?.error?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Server completion failed'
      );
    }
  };

  const createPiPayment = async () => {
    if (!window.Pi) {
      setStatus('Pi SDK not found. Please open this app inside Pi Browser.');
      return;
    }

    if (typeof window.Pi.createPayment !== 'function') {
      setStatus('Pi createPayment function is not available.');
      return;
    }

    if (!isAuthenticated) {
      setStatus('Please login with Pi first.');
      return;
    }

    if (!API_BASE_URL) {
      setStatus('VITE_API_URL is not set. Backend URL is required.');
      return;
    }

    const amountValidation = validateAmount();

    if (!amountValidation.valid) {
      setStatus(amountValidation.message);
      return;
    }

    const paymentAmount = amountValidation.value;
    const orderId = (PI_SANDBOX ? 'test_order_' : 'main_order_') + Date.now();

    try {
      setIsPaying(true);

      await warmUpBackend();

      setStatus(`Creating ${networkLabel} Pi payment...`);

      const paymentData = {
        amount: paymentAmount,
        memo: `Pi DAO payment - ${paymentAmount} Pi`,
        metadata: {
          type: PI_SANDBOX ? 'testnet_payment' : 'mainnet_payment',
          orderId,
          username: currentUsername,
          amount: paymentAmount,
          network: networkValue,
          pageOrigin: window.location.origin,
        },
      };

      const callbacks = {
        onReadyForServerApproval: async function (paymentId: string) {
          try {
            console.log('Ready for server approval:', paymentId);
            setStatus('Approving payment on server...');

            await approvePaymentOnServer(paymentId, orderId, paymentAmount);

            setStatus('Payment approved by server. Continue in Pi Wallet.');
          } catch (error: any) {
            console.error('Server approval error:', error);
            setIsPaying(false);
            setStatus(
              'Server approval error: ' + (error?.message || String(error))
            );
          }
        },

        onReadyForServerCompletion: async function (
          paymentId: string,
          txid: string
        ) {
          try {
            console.log('Ready for server completion:', paymentId, txid);
            setStatus('Completing payment on server...');

            await completePaymentOnServer(
              paymentId,
              txid,
              orderId,
              paymentAmount
            );

            setStatus('Payment completed successfully. TXID: ' + txid);
            setIsPaying(false);
          } catch (error: any) {
            console.error('Server completion error:', error);
            setIsPaying(false);
            setStatus(
              'Server completion error: ' + (error?.message || String(error))
            );
          }
        },

        onCancel: function (paymentId: string) {
          console.log('Payment cancelled:', paymentId);
          setIsPaying(false);
          setStatus('Payment cancelled by user.');
        },

        onError: function (error: any, payment: any) {
          console.error('Payment error:', error, payment);
          setIsPaying(false);
          setStatus('Payment error: ' + (error?.message || String(error)));
        },
      };

      const payment = await window.Pi.createPayment(paymentData, callbacks);

      console.log('Payment result:', payment);
      setStatus('Payment request sent to Pi Wallet. Please confirm.');
    } catch (error: any) {
      console.error('Create payment error:', error);
      setIsPaying(false);
      setStatus('Create payment error: ' + (error?.message || String(error)));
    }
  };

  return (
    <section
      style={{
        margin: '24px auto',
        padding: '20px',
        maxWidth: '430px',
        border: '1px solid rgba(103, 58, 183, 0.3)',
        borderRadius: '18px',
        textAlign: 'center',
        background: '#ffffff',
        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
        fontFamily: 'sans-serif',
      }}
    >
      <h2 style={{ color: '#673ab7', marginBottom: '8px' }}>
        Pi Payment
      </h2>

      <p style={{ color: '#666', fontSize: '14px' }}>
        Login with Pi and create a variable amount payment.
      </p>

      <div
        style={{
          display: 'inline-block',
          marginBottom: '14px',
          padding: '6px 12px',
          borderRadius: '999px',
          background: PI_SANDBOX ? '#fff3e0' : '#e8f5e9',
          color: PI_SANDBOX ? '#ef6c00' : '#2e7d32',
          fontSize: '12px',
          fontWeight: 700,
        }}
      >
        Network: {networkLabel}
      </div>

      {!isAuthenticated ? (
        <button
          onClick={loginWithPi}
          disabled={isLoggingIn}
          style={{
            padding: '12px 22px',
            borderRadius: '24px',
            border: 'none',
            background: isLoggingIn ? '#999' : '#673ab7',
            color: '#fff',
            cursor: isLoggingIn ? 'not-allowed' : 'pointer',
            fontSize: '15px',
            fontWeight: 600,
          }}
        >
          {isLoggingIn ? 'Please wait...' : 'Login with Pi'}
        </button>
      ) : (
        <>
          <p style={{ marginTop: '15px', color: '#333' }}>
            Welcome <strong>@{currentUsername || 'Pi User'}</strong>
          </p>

          <button
            onClick={handleLogout}
            style={{
              marginBottom: '14px',
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid #ff5252',
              background: '#fff',
              color: '#ff5252',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            Logout
          </button>

          <div style={{ marginTop: '15px', marginBottom: '15px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                color: '#333',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Payment Amount Pi
            </label>

            <input
              type="number"
              min={MIN_AMOUNT}
              max={MAX_AMOUNT}
              step="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isPaying}
              style={{
                width: '100%',
                maxWidth: '220px',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #ccc',
                textAlign: 'center',
                fontSize: '15px',
                boxSizing: 'border-box',
              }}
            />

            <div
              style={{
                marginTop: '6px',
                fontSize: '11px',
                color: '#888',
              }}
            >
              Min: {MIN_AMOUNT} Pi / Max: {MAX_AMOUNT} Pi
            </div>
          </div>

          <button
            onClick={createPiPayment}
            disabled={isPaying}
            style={{
              padding: '12px 22px',
              borderRadius: '24px',
              border: 'none',
              background: isPaying ? '#999' : '#00c853',
              color: '#fff',
              cursor: isPaying ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              fontWeight: 700,
            }}
          >
            {isPaying ? 'Processing...' : `Pay ${amount || '0'} Pi`}
          </button>
        </>
      )}

      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          background: '#f5f5f5',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#444',
          wordBreak: 'break-word',
          lineHeight: 1.5,
        }}
      >
        {status}
      </div>
    </section>
  );
};

export default PiPaymentPanel;
