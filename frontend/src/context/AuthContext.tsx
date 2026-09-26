// frontend/src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import axios from 'axios';
import axiosClient, {
  API_BASE_URL,
  FALLBACK_API_URL,
} from '../lib/axiosClient';

declare global {
  interface Window {
    Pi?: {
      init?: (config: { version: string; sandbox: boolean }) => void;
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound: (payment: any) => void
      ) => Promise<any>;
      createPayment?: any;
    };
    __PI_SDK_INITIALIZED__?: boolean;
    __PI_SDK_SANDBOX__?: boolean;
  }
}

export interface User {
  id: string;
  username: string;
  role: 'user' | 'admin' | string;
  piUserId?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  login: (
    pi_user_id: string,
    username: string,
    accessToken?: string
  ) => Promise<User>;

  loginWithPi: () => Promise<User>;

  logout: () => void;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const parseBooleanEnv = (value: unknown, defaultValue = false): boolean => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  return String(value).trim().toLowerCase() === 'true';
};

const PI_SANDBOX = parseBooleanEnv(import.meta.env.VITE_PI_SANDBOX, false);

/** Absolute login URL – never relative, never github.io */
function getLoginUrl(): string {
  const base = (API_BASE_URL || FALLBACK_API_URL).replace(/\/+$/, '');
  if (!base.startsWith('http') || /github\.io/i.test(base)) {
    return `${FALLBACK_API_URL}/auth/pi-login`;
  }
  return `${base}/auth/pi-login`;
}

function getHealthUrl(): string {
  const base = (API_BASE_URL || FALLBACK_API_URL).replace(/\/+$/, '');
  const root = base.replace(/\/api$/i, '');
  return `${root}/health`;
}

const normalizeUser = (userData: any): User => {
  const id =
    userData?.id ||
    userData?.piUserId ||
    userData?.pi_user_id ||
    userData?.uid ||
    userData?._id;

  const piUserId =
    userData?.piUserId ||
    userData?.pi_user_id ||
    userData?.uid ||
    userData?.id ||
    userData?._id;

  return {
    id: String(id || ''),
    username: userData?.username || userData?.name || 'Pi User',
    role: String(userData?.role || 'user').toLowerCase(),
    piUserId: piUserId ? String(piUserId) : undefined,
  };
};

const getSavedUser = (): User | null => {
  try {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;
    const normalizedUser = normalizeUser(JSON.parse(savedUser));
    if (!normalizedUser.id) {
      localStorage.removeItem('user');
      return null;
    }
    return normalizedUser;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

const ensurePiSdkInitialized = () => {
  if (!window.Pi) {
    throw new Error(
      'Pi SDK is not loaded. Please open this app inside Pi Browser.'
    );
  }
  if (window.__PI_SDK_INITIALIZED__) return;
  if (typeof window.Pi.init !== 'function') {
    throw new Error('Pi SDK init function is not available.');
  }
  window.Pi.init({ version: '2.0', sandbox: PI_SANDBOX });
  window.__PI_SDK_INITIALIZED__ = true;
  window.__PI_SDK_SANDBOX__ = PI_SANDBOX;
};

async function warmUpBackend() {
  try {
    await fetch(getHealthUrl(), { method: 'GET', mode: 'cors' });
  } catch {
    // ignore
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => getSavedUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    Boolean(localStorage.getItem('token') && localStorage.getItem('user'))
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const persistAuth = (token: string, userData: any): User => {
    const normalizedUser = normalizeUser(userData);
    if (!token || !normalizedUser.id) {
      throw new Error('Invalid authentication data received from server.');
    }
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
    setIsAuthenticated(true);
    setError(null);
    return normalizedUser;
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        clearAuth();
        return;
      }
      const response = await axiosClient.get('/auth/me');
      if (response.data?.user) {
        persistAuth(token, response.data.user);
      } else {
        clearAuth();
      }
    } catch (err: any) {
      console.error('Auth refresh failed:', err?.response?.data || err);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const login = async (
    pi_user_id: string,
    username: string,
    accessToken?: string
  ): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      if (!pi_user_id) {
        throw new Error('Invalid Pi user data: missing user id.');
      }

      const safeUsername =
        username || `PiUser_${String(pi_user_id).slice(0, 8)}`;

      await warmUpBackend();

      const loginUrl = getLoginUrl();
      console.log('[Auth] POST login →', loginUrl);

      // Absolute URL – bypasses any wrong axios baseURL in old bundles
      const response = await axios.post(
        loginUrl,
        {
          pi_user_id: String(pi_user_id),
          username: String(safeUsername),
          accessToken: accessToken || undefined,
          piUserId: String(pi_user_id),
          access_token: accessToken || undefined,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        }
      );

      const responseToken = response.data?.token;
      const responseUser = response.data?.user;

      if (responseToken && responseUser) {
        return persistAuth(responseToken, responseUser);
      }

      throw new Error(response.data?.message || 'Login failed');
    } catch (err: any) {
      const status = err?.response?.status;
      let message =
        err?.response?.data?.message || err?.message || 'Login failed';

      if (status === 405) {
        message =
          'HTTP 405: frontend is calling the wrong host (static site). Rebuild with VITE_API_URL=https://night.bonto.run/api';
      } else if (status === 426) {
        message = 'Please open this app inside Pi Browser.';
      } else if (!err?.response && err?.request) {
        message =
          'Cannot connect to server. Check network / VITE_API_URL / Bonto status.';
      }

      setError(message);
      clearAuth();
      console.error('Login Error:', {
        status,
        data: err?.response?.data,
        message: err?.message,
        loginUrl: getLoginUrl(),
      });
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const loginWithPi = async (): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      ensurePiSdkInitialized();

      if (!window.Pi || typeof window.Pi.authenticate !== 'function') {
        throw new Error(
          'Pi SDK is not available. Please open this app inside Pi Browser.'
        );
      }

      const authResult = await window.Pi.authenticate(
        ['username', 'payments'],
        (payment: any) => {
          console.warn('Incomplete payment found during Pi login:', payment);
        }
      );

      console.log('Pi auth result:', authResult);

      const piUserId =
        authResult?.user?.uid ||
        authResult?.user?.id ||
        authResult?.user?._id ||
        authResult?.uid ||
        authResult?.id;

      const piUsername =
        authResult?.user?.username || authResult?.username || 'Pi User';

      const accessToken =
        authResult?.accessToken ||
        authResult?.access_token ||
        authResult?.token;

      if (!piUserId) {
        throw new Error('Pi authentication did not return a valid user id.');
      }

      setLoading(false);
      return await login(String(piUserId), String(piUsername), accessToken);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Pi login failed';
      setError(message);
      clearAuth();
      console.error('Pi Login Error:', err?.response?.data || err);
      throw err instanceof Error ? err : new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login,
        loginWithPi,
        logout,
        refreshAuth,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
