import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { useGameStore } from './store/gameStore';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import ConfettiCanvas from './components/ui/ConfettiCanvas';
import LoadingScreen from './components/ui/LoadingScreen';
import AuthModal from './components/auth/AuthModal';

// ──────────────────────────────────────────────────────────────────────────────
// Lazy-loaded pages for code splitting
// ──────────────────────────────────────────────────────────────────────────────
const LandingPage       = lazy(() => import('./pages/LandingPage'));
const Dashboard         = lazy(() => import('./pages/Dashboard'));
const GamesLibrary      = lazy(() => import('./pages/GamesLibrary'));
const GameRoom          = lazy(() => import('./pages/GameRoom'));
const Leaderboard       = lazy(() => import('./pages/Leaderboard'));
const Achievements      = lazy(() => import('./pages/Achievements'));
const Memories          = lazy(() => import('./pages/Memories'));
const Profile           = lazy(() => import('./pages/Profile'));

// ──────────────────────────────────────────────────────────────────────────────
// Smooth page-transition wrapper (Framer Motion)
// ──────────────────────────────────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0,  transition: { duration: 0.3 } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 }  },
};

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    style={{ minHeight: '100vh' }}
  >
    {children}
  </motion.div>
);

// ──────────────────────────────────────────────────────────────────────────────
// Inner router — needs to live inside <BrowserRouter> (provided in main.tsx)
// ──────────────────────────────────────────────────────────────────────────────
const AppRoutes: React.FC = () => {
  const location = useLocation();

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      useGameStore.getState().setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return (
    <>
      {/* Global ambient confetti (fires via Zustand event) */}
      <ConfettiCanvas />

      {/* Sticky Navbar — hidden on public pages */}
      <Navbar />

      {/* Auth Modal */}
      <AuthModal />

      {/* Animated page transitions */}
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingScreen message="Loading arcade room..." />}>
          <Routes location={location} key={location.pathname}>

            {/* ── Public Routes ───────────────────────────────────────── */}
            <Route
              path="/"
              element={
                <PageTransition>
                  <LandingPage />
                </PageTransition>
              }
            />


            {/* ── Protected Routes ────────────────────────────────────── */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <Dashboard />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/games"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <GamesLibrary />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/:gameId"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <GameRoom />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <Leaderboard />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/achievements"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <Achievements />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/memories"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <Memories />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <Profile />
                  </PageTransition>
                </ProtectedRoute>
              }
            />

            {/* ── Catch-all redirect ──────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Root App — wraps everything in AuthProvider
// ──────────────────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
