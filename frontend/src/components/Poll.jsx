// frontend/src/components/Poll.jsx
import React, { useEffect, useState } from 'react';
import './Poll.css';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://pidao.bonto.run/api';

const Poll = () => {
  const { t, lang } = useI18n();
  const auth = useAuth();

  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [votes, setVotes] = useState({ yes: 0, no: 0, total: 0, yesPercent: 0, noPercent: 0 });
  const [pollData, setPollData] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [history, setHistory] = useState([]);

  const textAlign = lang === 'fa' || lang === 'ar' ? 'right' : 'left';

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    ...(localStorage.getItem('token') ? { Authorization: `GAPGPTMASKTOKENk3i72fafc9oX0X` } : {}),
  });

  const getLocalizedQuestion = () => {
    if (!pollData) return t('poll.question.default');
    return pollData[`question${lang.charAt(0).toUpperCase() + lang.slice(1)}`] || pollData.question || t('poll.question.default');
  };

  const maskUsername = (username) => {
    if (!username) return '@Pi***';
    const clean = String(username).replace(/^@/, '').trim();
    if (!clean) return '@Pi***';
    if (clean.length <= 2) return `@${clean[0] || 'P'}***`;
    if (clean.length <= 5) return `@${clean.slice(0, 2)}***`;
    const visiblePart = clean.slice(0, Math.min(4, clean.length - 2));
    const hiddenLength = Math.max(3, clean.length - visiblePart.length);
    return `@${visiblePart}${'*'.repeat(hiddenLength)}`;
  };

  const fetchPoll = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/poll/current`, { method: 'GET', headers: getAuthHeaders() });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || t('poll.errors.connection'));
      setVotes(data.data.votes);
      setUserVote(data.data.userVote);
      setPollData(data.data.poll || null);
    } catch (err) {
      console.error('Poll fetch error:', err);
      setError(err.message || t('poll.errors.connection'));
    } finally {
      setLoading(false);
    }
  };

  const fetchVoteHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/poll/history`, { method: 'GET', headers: getAuthHeaders() });
      const data = await response.json();
      if (response.ok && data.success) setHistory(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.warn('Vote history fetch error:', err);
    }
  };

  // فقط یک بار useEffect برای لود اولیه
  useEffect(() => {
    fetchPoll();
    fetchVoteHistory();
  }, []);

  // فقط یک بار useEffect برای آپدیت در صورت تغییر وضعیت Auth
  useEffect(() => {
    if (auth?.isAuthenticated) {
      fetchPoll();
      fetchVoteHistory();
    }
  }, [auth?.isAuthenticated]);

  const handleVote = async (option) => {
    if (!auth?.isAuthenticated) {
      setMessage(t('poll.messages.loginRequired'));
      return;
    }
    if (userVote) {
      setMessage(t('poll.messages.alreadyVoted'));
      return;
    }

    try {
      setVoting(true);
      setError('');
      setMessage('');
      const response = await fetch(`${API_BASE_URL}/poll/vote`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ option }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 409) {
          setVotes(data.data.votes);
          setUserVote(data.data.userVote);
          setPollData(data.data.poll);
          setMessage(t('poll.messages.alreadyVoted'));
          return;
        }
        throw new Error(data.message || t('poll.errors.connection'));
      }

      setVotes(data.data.votes);
      setUserVote(data.data.userVote);
      setPollData(data.data.poll);
      setMessage(t('poll.messages.voteSuccess'));
      await fetchVoteHistory();
    } catch (err) {
      setError(err.message || t('poll.errors.connection'));
    } finally {
      setVoting(false);
    }
  };

  const formatDate = (date) => date ? new Date(date).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US') : '';

  if (loading) {
    return (
      <section id="poll" className="poll-section">
        <div className="poll-container">
          <div className="poll-badge">{t('common.brandName')} · {t('poll.governance')}</div>
          <p className="poll-loading-text">{t('poll.status.loading')}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="poll" className="poll-section">
      <div className="poll-container">
        <div className="poll-badge">{t('common.brandName')} · {t('poll.governance')}</div>
        
        {/* نمایش پیام خطا یا موفقیت */}
        {(message || error) && (
          <div className={error ? 'poll-alert poll-alert-error' : 'poll-alert'}>
            {error || message}
          </div>
        )}

        {/* بخش سوال */}
        <h3 className="poll-question" style={{ textAlign }}>
          {getLocalizedQuestion()}
        </h3>

        {/* بخش نمایش نتایج */}
        <div className="poll-results">
          <div className="poll-result-label" style={{ textAlign }}>
            <span>{t('poll.labels.yes')}</span>
            <strong>{votes.yesPercent}% ({votes.yes})</strong>
          </div>
          <div className="result-bar-container">
            <div className="result-bar result-bar-yes" style={{ width: `${votes.yesPercent}%` }}></div>
          </div>

          <div className="poll-result-label poll-result-label-no" style={{ textAlign }}>
            <span>{t('poll.labels.no')}</span>
            <strong>{votes.noPercent}% ({votes.no})</strong>
          </div>
          <div className="result-bar-container">
            <div className="result-bar result-bar-no" style={{ width: `${votes.noPercent}%` }}></div>
          </div>
        </div>

        {/* بخش دکمه‌های رای‌دهی */}
        {!userVote && !voting && (
          <div className="poll-actions">
            <button onClick={() => handleVote('yes')} className="poll-btn poll-btn-yes">{t('poll.labels.yes')}</button>
            <button onClick={() => handleVote('no')} className="poll-btn poll-btn-no">{t('poll.labels.no')}</button>
          </div>
        )}
        {voting && <div className="poll-loading-text">{t('common.loading')}...</div>}

        {/* بخش تاریخچه رای‌ها */}
        {history.length > 0 && (
          <div className="poll-history" style={{ textAlign }}>
            <strong className="poll-history-title">{t('poll.history.title')}</strong>
            <ul className="poll-history-list">
              {history.map((item) => (
                <li key={item.id} className="poll-history-item">
                  {item.question_snapshot && <div className="poll-history-question">{item.question_snapshot}</div>}
                  <div className="poll-history-meta">
                    <span className="poll-history-user">{maskUsername(item.username)}</span>
                    <span className="poll-history-separator"> · </span>
                    <span className="poll-history-option">
                      {item.vote_option === 'yes' ? t('poll.labels.yes') : t('poll.labels.no')}
                    </span>
                    <span className="poll-history-separator"> - </span>
                    <span className="poll-history-date">{formatDate(item.created_at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default Poll;
