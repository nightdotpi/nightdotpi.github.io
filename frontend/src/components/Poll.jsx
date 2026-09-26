// frontend/src/components/Poll.jsx
import React, { useEffect, useState } from 'react';
import './Poll.css';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

/**
 * Hardcoded backend — do not use relative paths or frontend domain.
 * Wrong host returns HTML 404 → "Unexpected token '<'" / "HTML instead of JSON".
 */
const BONTO_API = 'https://night.bonto.run/api';

const Poll = () => {
  const { t, lang } = useI18n();
  const auth = useAuth();

  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [votes, setVotes] = useState({
    yes: 0,
    no: 0,
    total: 0,
    yesPercent: 0,
    noPercent: 0,
  });
  const [pollData, setPollData] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [history, setHistory] = useState([]);

  const textAlign = lang === 'fa' || lang === 'ar' ? 'right' : 'left';

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const getLocalizedQuestion = () => {
    if (!pollData) return t('poll.question.default');
    const key = `question${lang.charAt(0).toUpperCase() + lang.slice(1)}`;
    return pollData[key] || pollData.question || t('poll.question.default');
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

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')
      : '';

  const fetchPoll = async () => {
    const url = `${BONTO_API}/poll/current`;
    try {
      setLoading(true);
      setError('');
      console.log('[Poll] GET', url);

      const response = await axios.get(url, {
        headers: authHeaders(),
        timeout: 30000,
        // never follow to HTML pages as "success"
        validateStatus: () => true,
      });

      const data = response.data;

      if (typeof data === 'string' && data.includes('<!DOCTYPE')) {
        throw new Error(
          `Wrong host returned HTML. Request was: ${url}`
        );
      }

      if (response.status !== 200 || !data?.success) {
        throw new Error(
          data?.message || `Poll request failed (${response.status})`
        );
      }

      setVotes(
        data.data?.votes || {
          yes: 0,
          no: 0,
          total: 0,
          yesPercent: 0,
          noPercent: 0,
        }
      );
      setUserVote(data.data?.userVote || null);
      setPollData(data.data?.poll || null);
    } catch (err) {
      console.error('Poll fetch error:', err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        t('poll.errors.connection');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchVoteHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setHistory([]);
      return;
    }

    const url = `${BONTO_API}/poll/history`;
    try {
      const response = await axios.get(url, {
        headers: authHeaders(),
        timeout: 30000,
        validateStatus: () => true,
      });

      if (response.status === 200 && response.data?.success) {
        setHistory(
          Array.isArray(response.data.data) ? response.data.data : []
        );
      }
    } catch (err) {
      console.warn('Vote history fetch error:', err);
    }
  };

  useEffect(() => {
    fetchPoll();
    fetchVoteHistory();
  }, []);

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

    const url = `${BONTO_API}/poll/vote`;

    try {
      setVoting(true);
      setError('');
      setMessage('');
      console.log('[Poll] POST', url, option);

      const response = await axios.post(
        url,
        { option },
        {
          headers: authHeaders(),
          timeout: 30000,
          validateStatus: () => true,
        }
      );

      const data = response.data;

      if (response.status === 409 && data?.data) {
        setVotes(data.data.votes);
        setUserVote(data.data.userVote);
        setPollData(data.data.poll);
        setMessage(t('poll.messages.alreadyVoted'));
        return;
      }

      if (response.status !== 200 || !data?.success) {
        throw new Error(
          data?.message || `Vote failed (${response.status})`
        );
      }

      setVotes(data.data.votes);
      setUserVote(data.data.userVote);
      setPollData(data.data.poll);
      setMessage(t('poll.messages.voteSuccess'));
      await fetchVoteHistory();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          t('poll.errors.connection')
      );
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <section id="poll" className="poll-section">
        <div className="poll-container">
          <div className="poll-badge">
            {t('common.brandName')} · {t('poll.governance')}
          </div>
          <p className="poll-loading-text">{t('poll.status.loading')}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="poll" className="poll-section">
      <div className="poll-container">
        <div className="poll-badge">
          {t('common.brandName')} · {t('poll.governance')}
        </div>

        {(error || message) && (
          <div className={error ? 'poll-alert poll-alert-error' : 'poll-alert'}>
            {error || message}
          </div>
        )}

        <h3 className="poll-question" style={{ textAlign }}>
          {getLocalizedQuestion()}
        </h3>

        <div className="poll-results">
          <div className="poll-result-label" style={{ textAlign }}>
            <span>{t('poll.labels.yes')}</span>
            <strong>
              {votes.yesPercent}% ({votes.yes})
            </strong>
          </div>
          <div className="result-bar-container">
            <div
              className="result-bar result-bar-yes"
              style={{ width: `${votes.yesPercent}%` }}
            />
          </div>

          <div
            className="poll-result-label poll-result-label-no"
            style={{ textAlign }}
          >
            <span>{t('poll.labels.no')}</span>
            <strong>
              {votes.noPercent}% ({votes.no})
            </strong>
          </div>
          <div className="result-bar-container">
            <div
              className="result-bar result-bar-no"
              style={{ width: `${votes.noPercent}%` }}
            />
          </div>
        </div>

        {!userVote && !voting && (
          <div className="poll-actions">
            <button
              type="button"
              onClick={() => handleVote('yes')}
              className="poll-btn poll-btn-yes"
            >
              {t('poll.labels.yes')}
            </button>
            <button
              type="button"
              onClick={() => handleVote('no')}
              className="poll-btn poll-btn-no"
            >
              {t('poll.labels.no')}
            </button>
          </div>
        )}

        {voting && (
          <div className="poll-loading-text">{t('common.loading')}...</div>
        )}

        {history.length > 0 && (
          <div className="poll-history" style={{ textAlign }}>
            <strong className="poll-history-title">
              {t('poll.history.title')}
            </strong>
            <ul className="poll-history-list">
              {history.map((item) => (
                <li key={item.id} className="poll-history-item">
                  {item.question_snapshot && (
                    <div className="poll-history-question">
                      {item.question_snapshot}
                    </div>
                  )}
                  <div className="poll-history-meta">
                    <span className="poll-history-user">
                      {maskUsername(item.username)}
                    </span>
                    <span className="poll-history-separator"> · </span>
                    <span className="poll-history-option">
                      {item.vote_option === 'yes'
                        ? t('poll.labels.yes')
                        : t('poll.labels.no')}
                    </span>
                    <span className="poll-history-separator"> - </span>
                    <span className="poll-history-date">
                      {formatDate(item.created_at)}
                    </span>
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
