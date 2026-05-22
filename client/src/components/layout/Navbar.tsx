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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOFI_MUSIC_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { musicEnabled, toggleMusic } = useGameStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(LOFI_MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.12;
    audioRef.current = audio;
    return () => { audio.pause(); };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (musicEnabled && user) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [musicEnabled, user]);

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  if (!user) return null;

  const navItems = [
    { path: '/dashboard',    label: 'Home',        icon: Gamepad2 },
    { path: '/games',        label: 'Games',       icon: Zap       },
    { path: '/leaderboard',  label: 'Scores',      icon: Trophy    },
    { path: '/achievements', label: 'Badges',      icon: Award     },
    { path: '/memories',     label: 'Memories',    icon: Heart     },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-arcade-darker/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-14">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
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
          {user.streak > 0 && (
            <div className="flex items-center gap-1 border border-orange-500/25 bg-orange-500/8 rounded-lg px-2.5 py-1.5 text-orange-400 font-bold text-xs">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              <span>{user.streak}d</span>
            </div>
          )}

          {/* Profile */}
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

          {/* Logout */}
          <button
            onClick={logout}
            className="p-2 rounded-lg border border-white/8 text-slate-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile hamburger */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={toggleMusic}
            className={`p-2 rounded-lg border text-xs ${
              musicEnabled ? 'border-arcade-red/40 text-arcade-red' : 'border-white/10 text-slate-500'
            }`}
          >
            {musicEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-white/10 text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/5 bg-arcade-darker/98 px-4 py-3 flex flex-col gap-1"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    isActive ? 'bg-white/8 text-white border border-white/10' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-arcade-red' : 'text-slate-500'}`} />
                  {item.label}
                </Link>
              );
            })}
            <div className="h-px bg-white/5 my-1" />
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <img src={user.avatarUrl} alt={user.displayName} className="w-7 h-7 rounded-lg border border-white/10" />
                <span className="text-sm font-bold text-slate-200">{user.displayName}</span>
              </div>
              <button onClick={logout} className="text-red-400 text-xs font-bold flex items-center gap-1">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
