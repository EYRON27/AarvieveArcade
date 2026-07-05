import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User as UserIcon, X } from 'lucide-react';
import LoadingScreen from '../ui/LoadingScreen';

const AuthModal: React.FC = () => {
  const { login, register, resetPassword } = useAuth();
  const { isAuthModalOpen, authModalView, closeAuthModal, openAuthModal } = useGameStore();
  
  const isLogin = authModalView === 'login';

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Reset form when modal opens or view changes
  useEffect(() => {
    setError('');
    setPassword('');
    setConfirmPassword('');
    if (!isAuthModalOpen) {
      setDisplayName('');
      setEmail('');
    }
  }, [isAuthModalOpen, authModalView]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!email || !password) return setError('Please enter email and password.');
      try {
        setLoading(true);
        await login(email, password);
        closeAuthModal();
      } catch (err: unknown) {
        const firebaseErr = err as { code?: string; message?: string };
        let errorMessage = 'Sign in failed. Check your credentials.';
        if (firebaseErr.code) {
          switch (firebaseErr.code) {
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
              errorMessage = 'Invalid email or password.';
              break;
            case 'auth/too-many-requests':
              errorMessage = 'Too many failed attempts. Please try again later.';
              break;
            case 'auth/network-request-failed':
              errorMessage = 'Network error. Please check your connection.';
              break;
            default:
              errorMessage = 'Authentication failed. Please try again.';
          }
        } else if (firebaseErr.message && !firebaseErr.message.includes('Firebase')) {
          errorMessage = firebaseErr.message;
        }
        setError(errorMessage);
        setLoading(false);
      }
    } else {
      if (!email || !password || !displayName || !confirmPassword) return setError('Please fill in all fields.');
      if (password !== confirmPassword) return setError('Passwords do not match.');
      try {
        setLoading(true);
        await new Promise(r => setTimeout(r, 1500)); // Artificial delay for effect
        await register(email, password, displayName);
        closeAuthModal();
      } catch (err: unknown) {
        const firebaseErr = err as { code?: string; message?: string };
        let errorMessage = 'Account creation failed. Email may already be in use.';
        if (firebaseErr.code) {
          switch (firebaseErr.code) {
            case 'auth/email-already-in-use':
              errorMessage = 'An account with this email already exists.';
              break;
            case 'auth/invalid-email':
              errorMessage = 'Please enter a valid email address.';
              break;
            case 'auth/weak-password':
              errorMessage = 'Password should be at least 6 characters.';
              break;
            case 'auth/network-request-failed':
              errorMessage = 'Network error. Please check your connection.';
              break;
            default:
              errorMessage = 'Registration failed. Please try again.';
          }
        } else if (firebaseErr.message && !firebaseErr.message.includes('Firebase')) {
          errorMessage = firebaseErr.message;
        }
        setError(errorMessage);
        setLoading(false);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address to reset your password.');
      return;
    }
    try {
      setLoading(true);
      await resetPassword(email);
      setError('Password reset link sent to your email!');
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      let errorMessage = 'Failed to send password reset email.';
      if (firebaseErr.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email address.';
      } else if (firebaseErr.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (toLogin: boolean) => {
    openAuthModal(toLogin ? 'login' : 'register');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm"
        style={{ height: '100dvh' }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full max-w-4xl bg-arcade-dark border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:min-h-[500px] max-h-[90dvh] sm:max-h-[85vh] ${isLogin ? 'md:flex-row' : 'md:flex-row-reverse'}`}
        >
          {/* Close Button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-arcade-darker absolute inset-0 z-10">
              <LoadingScreen message={isLogin ? "Authenticating player..." : "Creating player account..."} />
            </div>
          ) : (
            <>
              {/* Left Side (Desktop): Form for Login, Info for Register */}
              <motion.div 
                layout 
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                className="w-full md:w-1/2 flex flex-col bg-arcade-darker p-6 sm:p-8 md:p-12 justify-center z-10 overflow-y-auto"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2 font-display tracking-wide">
                    {isLogin ? 'Sign in to Aarvieve' : 'Create Account'}
                  </h2>
                </div>

                {/* Error Message */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm font-semibold text-center">
                        {error}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <input
                            type="text" placeholder="Username" value={displayName}
                            onChange={e => setDisplayName(e.target.value)} disabled={loading}
                            onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)}
                            className="w-full bg-arcade-dark border border-white/10 hover:border-white/20 focus:border-arcade-blue/50 focus:outline-none rounded-xl py-3.5 pl-11 pr-4 text-slate-200 transition-all placeholder:text-slate-500"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col gap-1">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="email" placeholder="Email" value={email}
                        onChange={e => setEmail(e.target.value)} disabled={loading}
                        onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)}
                        className="w-full bg-arcade-dark border border-white/10 hover:border-white/20 focus:border-arcade-red/50 focus:outline-none rounded-xl py-3.5 pl-11 pr-4 text-slate-200 transition-all placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type={showPassword ? "text" : "password"} placeholder="Password" value={password}
                        onChange={e => setPassword(e.target.value)} disabled={loading}
                        onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)}
                        className="w-full bg-arcade-dark border border-white/10 hover:border-white/20 focus:border-arcade-red/50 focus:outline-none rounded-xl py-3.5 pl-11 pr-11 text-slate-200 transition-all placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence mode="popLayout" initial={false}>
                    {!isLogin && (
                      <motion.div
                        key="confirmPasswordField"
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-1 overflow-hidden"
                      >
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <input
                            type={showPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)} disabled={loading}
                            onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)}
                            className="w-full bg-arcade-dark border border-white/10 hover:border-white/20 focus:border-arcade-blue/50 focus:outline-none rounded-xl py-3.5 pl-11 pr-11 text-slate-200 transition-all placeholder:text-slate-500"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isLogin && (
                    <div className="flex justify-center mt-2">
                      <button 
                        type="button" 
                        onClick={handleForgotPassword}
                        disabled={loading}
                        className="text-sm font-semibold text-slate-400 hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5 cursor-pointer active:scale-95"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit" disabled={loading}
                    className={`w-1/2 mx-auto mt-6 text-white font-bold rounded-full py-3.5 flex items-center justify-center gap-2 text-sm tracking-widest transition-all ${
                      isLogin ? 'bg-arcade-red hover:bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-arcade-blue hover:bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                    }`}
                  >
                    {isLogin ? 'SIGN IN' : 'SIGN UP'}
                  </button>
                </form>
                
                {/* Mobile switch (hidden on desktop) */}
                <div className="mt-8 text-center md:hidden">
                  <p className="text-slate-400 text-sm mb-3">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                  </p>
                  <button
                    onClick={() => handleToggle(!isLogin)}
                    className="text-white font-bold px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-sm tracking-wider"
                  >
                    {isLogin ? 'SIGN UP' : 'SIGN IN'}
                  </button>
                </div>
              </motion.div>

              {/* Right Side (Desktop): Info for Login, Info for Register */}
              <motion.div 
                layout 
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                className={`hidden md:flex w-full md:w-1/2 flex-col items-center justify-center p-12 relative z-0 ${!isLogin ? 'bg-arcade-red/90' : 'bg-arcade-blue/90'}`}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:20px_20px]" />
                <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent" />
                
                <div className="relative z-10 text-center">
                  <h2 className="text-4xl font-bold text-white mb-6 font-display tracking-wider">
                    {isLogin ? 'Hello, Friend!' : 'Welcome Back!'}
                  </h2>
                  <p className="text-white/80 text-lg mb-10 max-w-[280px] mx-auto leading-relaxed">
                    {isLogin 
                      ? 'Enter your personal details and start journey with us' 
                      : 'To keep connected with us please login with your personal info'}
                  </p>
                  
                  <button
                    onClick={() => handleToggle(!isLogin)}
                    className="px-10 py-3.5 rounded-full border-2 border-white text-white font-bold tracking-widest text-sm hover:bg-white hover:text-slate-900 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                    {isLogin ? 'SIGN UP' : 'SIGN IN'}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
