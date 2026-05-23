import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';

import LoadingScreen from '../components/ui/LoadingScreen';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError('Please enter email and password.');
    try {
      setError(''); setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Check your credentials.');
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Authenticating player..." />;
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
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-5">
            <div className="w-8 h-8 bg-arcade-red rounded-lg flex items-center justify-center text-white font-black text-xs font-pixel">AA</div>
            <span className="font-display text-xl font-bold text-white tracking-widest group-hover:text-arcade-red transition-colors">AARVIEVE</span>
          </Link>
          <h2 className="text-2xl font-bold text-white">Welcome back</h2>
          <p className="text-slate-500 text-sm mt-1">Sign in to your arcade account</p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs font-semibold"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Email</label>
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
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type={showPassword ? "text" : "password"} placeholder="••••••••" value={password}
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
            className="w-full mt-2 bg-arcade-red hover:bg-arcade-red-hover text-white font-bold rounded-lg py-3 flex items-center justify-center gap-2 text-sm tracking-wider transition-all"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          No account?{' '}
          <Link to="/register" className="text-arcade-red font-semibold hover:underline">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
