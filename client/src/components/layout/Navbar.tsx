import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGameStore } from '../../store/gameStore';
import {
  Gamepad2,
  Trophy,
  Award,
  Heart,
  Volume2,
  VolumeX,
  LogOut,
  Flame,
  Menu,
  X,
  Zap,
  Download,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '../ui/LoadingScreen';

const LOFI_MUSIC_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { musicEnabled, toggleMusic, isGameMusicPlaying } = useGameStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // PWA Install Prompt State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    await new Promise(r => setTimeout(r, 1500));
    await logout();
    setIsLoggingOut(false);
    setShowLogoutConfirm(false);
  };

  useEffect(() => {
    const audio = new Audio(LOFI_MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.12;
    audioRef.current = audio;
    return () => { audio.pause(); };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (musicEnabled && user && !isGameMusicPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [musicEnabled, user, isGameMusicPlaying]);

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  // Handle PWA Installation
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstallable(false);
    } else {
      console.log('User dismissed the install prompt');
    }
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  const navItems = user ? [
    { path: '/dashboard',    label: 'Home',        icon: Gamepad2 },
    { path: '/games',        label: 'Games',       icon: Zap       },
    { path: '/leaderboard',  label: 'Scores',      icon: Trophy    },
    { path: '/achievements', label: 'Badges',      icon: Award     },
    { path: '/memories',     label: 'Gallery',    icon: Heart     },
  ] : [];

  if (isLoggingOut) {
    return <LoadingScreen message="Saving player data and logging out..." />;
  }

  if (location.pathname === '/') {
    return null;
  }

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-arcade-darker/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-14">

        {/* Logo */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
          <span className="w-7 h-7 bg-arcade-red rounded-lg flex items-center justify-center text-white font-black text-xs font-pixel">AA</span>
          <span className="font-display text-lg font-bold text-white tracking-wider group-hover:text-arcade-red transition-colors">
            Aarvieve Arcade
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'text-white bg-white/8 border border-white/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-arcade-red' : ''}`} />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-arcade-red rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Install PWA Button */}
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-arcade-blue/40 bg-arcade-blue/10 text-arcade-blue hover:bg-arcade-blue hover:text-white transition-all text-xs font-bold shadow-[0_0_10px_rgba(59,130,246,0.2)] animate-pulse hover:animate-none mr-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>INSTALL APP</span>
            </button>
          )}

          {/* Music toggle */}
          <button
            onClick={toggleMusic}
            title={musicEnabled ? 'Mute' : 'Play Music'}
            className={`p-2 rounded-lg border transition-all text-xs ${
              musicEnabled
                ? 'border-arcade-red/40 text-arcade-red bg-arcade-red/5'
                : 'border-white/8 text-slate-500 hover:text-slate-300 hover:border-white/15'
            }`}
          >
            {musicEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Streak */}
          {user && user.streak > 0 && (
            <div className="flex items-center gap-1 border border-orange-500/25 bg-orange-500/8 rounded-lg px-2.5 py-1.5 text-orange-400 font-bold text-xs">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              <span>{user.streak}d</span>
            </div>
          )}

          {/* Profile or Login */}
          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 border border-white/8 hover:border-arcade-blue/40 bg-white/3 hover:bg-arcade-blue/5 rounded-lg px-2.5 py-1.5 transition-all"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-6 h-6 rounded-md bg-arcade-dark border border-white/10"
                />
                <span className="text-xs font-semibold text-slate-300 hidden xl:block">{user.displayName}</span>
              </Link>
              <button
                onClick={handleLogoutClick}
                className="p-2 rounded-lg border border-white/8 text-slate-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition-colors">
                Log In
              </Link>
              <Link to="/register" className="px-4 py-2 text-sm font-bold bg-arcade-red hover:bg-red-500 text-white rounded-lg transition-colors">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="flex lg:hidden items-center gap-2">
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="p-2 rounded-lg border border-arcade-blue/40 bg-arcade-blue/10 text-arcade-blue shadow-[0_0_10px_rgba(59,130,246,0.2)] animate-pulse"
              title="Install App"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={toggleMusic}
            className={`p-2 rounded-lg border text-xs ${
              musicEnabled ? 'border-arcade-red/40 text-arcade-red' : 'border-white/10 text-slate-500'
            }`}
          >
            {musicEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          {user && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-white/10 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            
            {/* Slide-in Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-64 bg-arcade-darker border-l border-white/10 z-50 flex flex-col p-5 shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-display font-bold tracking-wider text-white">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                        isActive ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-arcade-red' : 'text-slate-500'}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-auto pt-4 border-t border-white/10 flex flex-col gap-4">
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                      <img src={user.avatarUrl} alt={user.displayName} className="w-9 h-9 rounded-xl border border-white/10" />
                      <div>
                        <span className="text-sm font-bold text-slate-200 block">{user.displayName}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">{user.totalPoints} pts</span>
                      </div>
                    </Link>
                    <button onClick={handleLogoutClick} className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl py-3 text-xs tracking-wider transition-all">
                      <LogOut className="w-4 h-4" /> LOGOUT
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center px-4 py-3 text-sm font-bold text-slate-300 hover:text-white border border-white/10 rounded-xl transition-colors">
                      Log In
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center px-4 py-3 text-sm font-bold bg-arcade-red hover:bg-red-500 text-white rounded-xl transition-colors">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-arcade-darker border border-arcade-red/30 p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                <LogOut className="w-6 h-6 text-arcade-red" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Ready to quit?</h3>
              <p className="text-sm text-slate-400 mb-6">Are you sure you want to log out of your arcade session?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm bg-arcade-red hover:bg-red-500 text-white transition-all shadow-lg shadow-red-500/20"
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
