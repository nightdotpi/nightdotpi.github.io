// frontend/src/Router.tsx
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useI18n } from './i18n/I18nContext';

// Pages & Components
import Home from './pages/Home';
import Dig from './pages/Dig';
import Shop from './pages/Shop';
import TasksPage from './pages/Engagement/TasksPage';
import SignIn from './components/SignIn';
import PiPaymentPanel from './components/PiPaymentPanel';
import History from './components/History';
import Success from './components/Success';
import LanguageSwitcher from './components/LanguageSwitcher';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const auth = useAuth();
  const { t } = useI18n();

  if (!auth || auth.loading === undefined) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: '#fff',
          background: '#311b92',
          fontFamily: 'sans-serif',
        }}
      >
        <p>{t('common.connectingToServer')}</p>
      </div>
    );
  }

  const { isAuthenticated, loading } = auth;

  if (loading) {
    return (
      <div
        className="loading-screen"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.2rem',
          color: '#fff',
          background: '#311b92',
          fontFamily: 'sans-serif',
        }}
      >
        {t('common.loading')}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <React.Fragment>{children}</React.Fragment>;
};

const HistoryAny = History as any;

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* DIG / Manifesto */}
        <Route path="/dig" element={<Dig />} />

        {/* Login with Pi */}
        <Route
          path="/login"
          element={
            <>
              <LanguageSwitcher />
              <SignIn />
            </>
          }
        />

        {/* Payment success */}
        <Route
          path="/success"
          element={
            <>
              <LanguageSwitcher />
              <Success />
            </>
          }
        />

        {/* Payment - protected */}
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <PiPaymentPanel />
            </ProtectedRoute>
          }
        />

        {/* History - protected */}
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryAny
                onPaymentSuccess={() => {}}
                onPaymentError={() => {}}
              />
            </ProtectedRoute>
          }
        />

        {/* Shop - protected */}
        <Route
          path="/shop"
          element={
            <ProtectedRoute>
              <Shop />
            </ProtectedRoute>
          }
        />

        {/* Tasks - protected */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
        
