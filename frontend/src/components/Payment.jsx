// frontend/src/components/Payment.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../lib/axiosClient';
import { useI18n } from '../i18n/I18nContext';
import './Payment.css'; // اضافه کردن استایل برای ظاهر مدرن

/**
 * @param {{ 
 *   transactionId?: string, 
 *   onReset?: () => void, 
 *   onPaymentSuccess?: (txid: string) => void, 
 *   onPaymentError?: (err: any) => void 
 * }} props
 */
const Payment = ({ 
  transactionId = "", 
  onReset = () => {}, 
  onPaymentSuccess = () => {}, 
  onPaymentError = () => {} 
}) => {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const direction = lang === 'fa' || lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    if (window.Pi) {
      console.log("✅ Pi Network SDK is ready");
    } else {
      console.warn("⚠️ Pi SDK not found.");
    }
  }, []);

  const handlePayment = async () => {
    if (!window.Pi) {
      setError(t('payment.piSdkNotAvailable'));
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const payment = await window.Pi.createPayment({
        amount: 1.0, 
        memo: "Purchase from Night",
        metadata: {
          productId: "item_123",
          userId: user?.uid || 'guest',
        },
      });

      await window.Pi.onReadyForServerApproval(async (paymentId) => {
        try {
          await axiosClient.post('/payment/approve', { paymentId });

          await window.Pi.onReadyForServerCompletion(async (paymentId, txid) => {
            try {
              await axiosClient.post('/payment/complete', {
                paymentId,
                txid,
                paymentDetails: { amount: 1.0, currency: 'PI' }
              });

              setIsProcessing(false);
              onPaymentSuccess(txid); 
            } catch (err) {
              setError(t('payment.finalizeFailed'));
              setIsProcessing(false);
              onPaymentError(err);
            }
          });

        } catch (err) {
          setError(t('payment.serverApprovalFailed'));
          setIsProcessing(false);
          onPaymentError(err);
        }
      });

    } catch (err) {
      setError(err.message || t('payment.startFailed'));
      setIsProcessing(false);
      onPaymentError(err);
    }
  };

  return (
    <div className="payment-container" style={{ direction }}>
      <div className="payment-card">
        <h2 className="payment-title">{t('payment.title')}</h2>
        
        {error && (
          <div className="payment-error-box">
            {error}
          </div>
        )}
        
        <div className="payment-details-box">
          <p>{t('payment.amountLabel')}: <span className="amount-highlight">1.0 PI</span></p>
          <p>{t('payment.productLabel')}: <span className="product-name">{t('payment.productName')}</span></p>
          {transactionId && <p className="tx-id">{t('payment.idLabel')}: {transactionId}</p>}
        </div>

        <button 
          className={`payment-button ${isProcessing ? 'loading' : ''}`}
          onClick={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="spinner"></span>
              {t('payment.processing')}
            </>
          ) : (
            t('payment.payButton')
          )}
        </button>

        <button className="payment-reset-btn" onClick={onReset}>
          {t('payment.cancelReset')}
        </button>

        {isProcessing && (
          <p className="payment-loader-text">
            {t('payment.doNotCloseBrowser')}
          </p>
        )}
      </div>
    </div>
  );
};

export default Payment;
      
