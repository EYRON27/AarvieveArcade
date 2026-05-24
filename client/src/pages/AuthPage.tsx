import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff, User as UserIcon } from 'lucide-react';

import LoadingScreen from '../components/ui/LoadingScreen';

const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLogin, setIsLogin] = useState(location.pathname !== '/register');

  useEffect(() => {
    setIsLogin(location.pathname !== '/register');
  }, [location.pathname]);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!email || !password) return setError('Please enter email and password.');
      try {
        setLoading(true);
        await login(email, password);
        navigate('/dashboard');
      } catch (err: any) {
        setError(err.message || 'Sign in failed. Check your credentials.');
        setLoading(false);
      }
    } else {
      if (!email || !password || !displayName) return setError('Please fill in all fields.');
      try {
        setLoading(true);
        await new Promise(r => setTimeout(r, 1500)); // Artificial delay for effect
        await register(email, password, displayName);
        navigate('/dashboard');
      } catch (err: any) {
        setError(err.message || 'Account creation failed. Email may already be in use.');
        setLoading(false);
      }
    }
  };

  const handleToggle = (toLogin: boolean) => {
    setError('');
    setIsLogin(toLogin);
    // Optional: update URL without navigating
    window.history.pushState(null, '', toLogin ? '/login' : '/register');
  };

  if (loading) {
    return <LoadingScreen message={isLogin ? "Authenticating player..." : "Creating player account..."} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-arcade-darker px-4 py-8">
      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:40px_40px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 group mb-5">
            <div className="w-8 h-8 bg-arcade-red rounded-lg flex items-center justify-center text-white font-black text-xs font-pixel">AA</div>
            <span className="font-display text-xl font-bold text-white tracking-widest group-hover:text-arcade-red transition-colors">AARVIEVE</span>
          </Link>
          <h2 className="text-2xl font-bold text-white">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {isLogin ? 'Sign in to your arcade account' : 'Join the arcade — Player 1 or 2'}
          </p>
        </div>

        {/* Slider Toggle */}
        <div className="flex relative bg-arcade-dark border border-white/10 rounded-xl p-1 mb-6 h-12">
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-arcade-red rounded-lg shadow-lg"
            style={{ left: isLogin ? '4px' : 'calc(50%)' }}
          />
          <button
            type="button"
            onClick={() => handleToggle(true)}
            className={`relative z-10 w-1/2 flex items-center justify-center font-bold text-sm transition-colors duration-200 ${
              isLogin ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => handleToggle(false)}
            className={`relative z-10 w-1/2 flex items-center justify-center font-bold text-sm transition-colors duration-200 ${
              !isLogin ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, height: 0, mb: 0 }}
              animate={{ opacity: 1, height: 'auto', mb: 16 }}
              exit={{ opacity: 0, height: 0, mb: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs font-semibold">
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {!isLogin && (
              <motion.div
                key="displayNameField"
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-1 overflow-hidden"
              >
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Display Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="text" placeholder="Enter your display name" value={displayName}
                    onChange={e => setDisplayName(e.target.value)} disabled={loading}
                    className="w-full bg-arcade-dark border border-white/8 hover:border-white/15 focus:border-arcade-blue/50 focus:outline-none rounded-lg py-3 pl-10 pr-4 text-slate-200 text-sm transition-all"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type="email" placeholder="player@arcade.com" value={email}
                onChange={e => setEmail(e.target.value)} disabled={loading}
                className="w-full bg-arcade-dark border border-white/8 hover:border-white/15 focus:border-arcade-red/50 focus:outline-none rounded-lg py-3 pl-10 pr-4 text-slate-200 text-sm transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type={showPassword ? "text" : "password"} placeholder={isLogin ? "••••••••" : "Min 6 characters"} value={password}
                onChange={e => setPassword(e.target.value)} disabled={loading}
                className="w-full bg-arcade-dark border border-white/8 hover:border-white/15 focus:border-arcade-red/50 focus:outline-none rounded-lg py-3 pl-10 pr-10 text-slate-200 text-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className={`w-full mt-4 text-white font-bold rounded-lg py-3 flex items-center justify-center gap-2 text-sm tracking-wider transition-all ${
              isLogin ? 'bg-arcade-red hover:bg-arcade-red-hover' : 'bg-arcade-blue hover:bg-arcade-blue-hover'
            }`}
          >
            {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {loading ? (isLogin ? 'SIGNING IN...' : 'CREATING ACCOUNT...') : (isLogin ? 'SIGN IN' : 'CREATE ACCOUNT')}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AuthPage;
