import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError('Please enter email and password.');
    try {
      setError(''); setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    try {
      setError(''); setLoading(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google sign in failed.');
    } finally { setLoading(false); }
  };

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
                type="email" placeholder="love@arcade.com" value={email}
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
                type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} disabled={loading}
                className="w-full bg-arcade-dark border border-white/8 hover:border-white/15 focus:border-arcade-red/50 focus:outline-none rounded-lg py-3 pl-10 pr-4 text-slate-200 text-sm transition-all"
              />
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

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-slate-600 text-xs font-semibold uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle} disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 bg-arcade-dark border border-white/8 hover:border-white/15 font-semibold py-3 px-4 rounded-lg transition-all text-sm text-slate-300"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.48 3.77v3.13h4.01c2.34-2.16 3.68-5.32 3.68-8.75z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.89-3.02c-1.08.72-2.48 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.21v3.23C3.18 21.82 7.31 24 12 24z"/>
            <path fill="#FBBC05" d="M5.27 14.27a7.22 7.22 0 0 1 0-4.54V6.5H1.21a11.97 11.97 0 0 0 0 11.01l4.06-3.24z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.96 1.19 15.24 0 12 0 7.31 0 3.18 2.18 1.21 5.77l4.06 3.23c.95-2.85 3.6-4.96 6.73-4.96z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-sm text-slate-500 mt-6">
          No account?{' '}
          <Link to="/register" className="text-arcade-red font-semibold hover:underline">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;

