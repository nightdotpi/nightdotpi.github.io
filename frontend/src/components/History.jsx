// frontend/src/components/History.jsx
import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';

// نکته: حتما این آدرس را به دامین پروژه جدید (Night) تغییر دهید
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://night.bonto.run/api'; 

const History = (props) => {
  const { onPaymentSuccess = () => {}, onPaymentError = () => {} } = props;
  const { t, lang } = useI18n();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const direction = lang === 'fa' ? 'rtl' : 'ltr';

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // هشدار: توکن را در فایل .env قرار دهید
        const token = import.meta.env.VITE_API_TOKEN; 

        const response = await fetch(`${API_BASE_URL}/payment/history`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setTransactions(Array.isArray(data.data) ? data.data : []);
        } else {
          setError(data.message || t('history.serverConnectionError'));
          onPaymentError(data);
        }
      } catch (err) {
        console.error('History fetch error:', err);
        setError(t('history.serverConnectionError'));
        onPaymentError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [t, onPaymentError]);

  const getTransactionId = (tx) => {
    return tx.piTransactionId || tx.txid || tx.paymentId || tx.orderId || tx.id || 'N/A';
  };

  const getProductName = (tx) => {
    return tx.metadata?.productName || tx.productName || tx.product?.name || tx.orderId || 'N/A';
  };

  const getAmount = (tx) => {
    const currency = tx.currency || 'Pi';
    return `${tx.amount ?? 'N/A'} ${currency}`;
  };

  const getStatusLabel = (status) => {
    const normalized = String(status || '').toUpperCase();
    if (normalized === 'COMPLETED' || normalized === 'SUCCESS') return t('history.statusSuccessful');
    if (normalized === 'APPROVED') return t('history.statusApproved');
    if (normalized === 'PENDING') return t('history.statusPending');
    if (normalized === 'CANCELLED') return t('history.statusCancelled');
    return t('history.statusFailed');
  };

  const getStatusStyle = (status) => {
    const normalized = String(status || '').toUpperCase();
    if (normalized === 'COMPLETED' || normalized === 'SUCCESS') return { backgroundColor: '#d4edda', color: '#155724' };
    if (normalized === 'APPROVED') return { backgroundColor: '#d1ecf1', color: '#0c5460' };
    if (normalized === 'PENDING') return { backgroundColor: '#fff3cd', color: '#856404' };
    return { backgroundColor: '#f8d7da', color: '#721c24' };
  };

  if (loading) return <div style={styles.center}>{t('history.loading')}</div>;

  if (error) return <div style={{ ...styles.center, color: 'red' }}>{error}</div>;

  return (
    <div style={{ ...styles.container, direction }}>
      <h2 style={styles.title}>{t('history.title')}</h2>

      {transactions.length === 0 ? (
        <p style={styles.center}>{t('history.noTransactions')}</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>{t('history.columnTransactionId')}</th>
                <th style={styles.th}>{t('history.columnAmount')}</th>
                <th style={styles.th}>{t('history.columnProduct')}</th>
                <th style={styles.th}>{t('history.columnStatus')}</th>
                <th style={styles.th}>{t('history.columnDate')}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => {
                const transactionId = String(getTransactionId(tx));
                const displayId = transactionId.length > 12 ? `${transactionId.substring(0, 12)}...` : transactionId;
                const statusStyle = getStatusStyle(tx.status);

                return (
                  <tr key={tx.id || tx._id || tx.orderId || index} style={styles.tableRow}>
                    <td style={styles.td}>{displayId}</td>
                    <td style={styles.td}>{getAmount(tx)}</td>
                    <td style={styles.td}>{getProductName(tx)}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.status, ...statusStyle }}>{getStatusLabel(tx.status)}</span>
                    </td>
                    <td style={styles.td}>
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString(lang === 'fa' ? 'fa-IR' : lang === 'tr' ? 'tr-TR' : 'en-US') : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Styles remain unchanged for design consistency
const styles = { /* ... استایل‌های شما ... */ };

export default History;
                        
