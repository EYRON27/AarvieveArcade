import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, UserPlus, Eye, EyeOff } from 'lucide-react';

import LoadingScreen from '../components/ui/LoadingScreen';

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) return setError('Please fill in all fields.');
    try {
      setError(''); setLoading(true);
      await new Promise(r => setTimeout(r, 1500)); // Artificial delay for effect
      await register(email, password, displayName);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Account creation failed. Email may already be in use.');
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Creating player account..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-arcade-darker px-4 py-8">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:40px_40px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-5">
            <div className="w-8 h-8 bg-arcade-red rounded-lg flex items-center justify-center text-white font-black text-xs font-pixel">AA</div>
            <span className="font-display text-xl font-bold text-white tracking-widest group-hover:text-arcade-red transition-colors">AARVIEVE</span>
          </Link>
          <h2 className="text-2xl font-bold text-white">Create account</h2>
          <p className="text-slate-500 text-sm mt-1">Join the arcade — Player 1 or 2</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs font-semibold"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Display Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type="text" placeholder="Enter your display name" value={displayName}
                onChange={e => setDisplayName(e.target.value)} disabled={loading}
                className="w-full bg-arcade-dark border border-white/8 hover:border-white/15 focus:border-arcade-blue/50 focus:outline-none rounded-lg py-3 pl-10 pr-4 text-slate-200 text-sm transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type="email" placeholder="player@arcade.com" value={email}
                onChange={e => setEmail(e.target.value)} disabled={loading}
                className="w-full bg-arcade-dark border border-white/8 hover:border-white/15 focus:border-arcade-blue/50 focus:outline-none rounded-lg py-3 pl-10 pr-4 text-slate-200 text-sm transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={password}
                onChange={e => setPassword(e.target.value)} disabled={loading}
                className="w-full bg-arcade-dark border border-white/8 hover:border-white/15 focus:border-arcade-blue/50 focus:outline-none rounded-lg py-3 pl-10 pr-10 text-slate-200 text-sm transition-all"
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
            className="w-full mt-2 bg-arcade-blue hover:bg-arcade-blue-hover text-white font-bold rounded-lg py-3 flex items-center justify-center gap-2 text-sm tracking-wider transition-all"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-arcade-red font-semibold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;

