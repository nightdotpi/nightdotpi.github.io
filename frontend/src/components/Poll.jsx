// frontend/src/components/Poll.jsx
import React, { useEffect, useState } from 'react';
import './Poll.css';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';

const FALLBACK_API_URL = 'https://night.bonto.run/api';

/**
 * Never call GitHub Pages / relative paths for API —
 * those return HTML and cause: Unexpected token '<', "<!DOCTYPE "...
 */
function getApiBaseUrl() {
  const raw = String(import.meta.env.VITE_API_URL || '').trim();

  if (!raw || raw.startsWith('/') || raw.startsWith('./')) {
    return FALLBACK_API_URL;
  }

  let url = raw.replace(/\/+$/, '');

  if (/github\.io/i.test(url)) {
    return FALLBACK_API_URL;
  }

  if (/bonto\.run/i.test(url) && !/\/api$/i.test(url)) {
    url = `${url}/api`;
  }

  return url;
}

const API_BASE_URL = getApiBaseUrl();

async function parseJsonResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (!text) {
    throw new Error(`Empty response (${response.status})`);
  }

  // HTML error page (static host / wrong URL)
  if (
    text.trimStart().startsWith('<!DOCTYPE') ||
    text.trimStart().startsWith('<html') ||
    contentType.includes('text/html')
  ) {
    throw new Error(
      `API returned HTML instead of JSON (${response.status}). Check VITE_API_URL. Expected: ${FALLBACK_API_URL}`
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Invalid JSON from API (${response.status}): ${text.slice(0, 120)}`
    );
  }
}

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

  const getAuthHeaders = () => {
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

  const fetchPoll = async () => {
    try {
      setLoading(true);
      setError('');

      const url = `${API_BASE_URL}/poll/current`;
      console.log('[Poll] GET', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await parseJsonResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(data.message || t('poll.errors.connection'));
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
      setError(err.message || t('poll.errors.connection'));
    } finally {
      setLoading(false);
    }
  };

  const fetchVoteHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setHistory([]);
        return;
      }

      const url = `${API_BASE_URL}/poll/history`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await parseJsonResponse(response);

      if (response.ok && data.success) {
        setHistory(Array.isArray(data.data) ? data.data : []);
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

    try {
      setVoting(true);
      setError('');
      setMessage('');

      const url = `${API_BASE_URL}/poll/vote`;
      console.log('[Poll] POST', url, option);

      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ option }),
      });

      const data = await parseJsonResponse(response);

      if (!response.ok || !data.success) {
        if (response.status === 409 && data.data) {
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

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')
      : '';

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
            ></div>
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
            ></div>
          </div>
        </div>

        {!userVote && !voting && (
          <div className="poll-actions">
            <button
              onClick={() => handleVote('yes')}
              className="poll-btn poll-btn-yes"
            >
              {t('poll.labels.yes')}
            </button>
            <button
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
