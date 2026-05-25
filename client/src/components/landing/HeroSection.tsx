import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, Play, Download } from 'lucide-react';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstallable(false);
    setDeferredPrompt(null);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-32">
      {/* Background Grid & Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-arcade-red/10 filter blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      {/* Floating elements */}
      <motion.div animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-32 left-[15%] text-6xl opacity-20 pointer-events-none hidden md:block">👾</motion.div>
      <motion.div animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }} transition={{ duration: 7, repeat: Infinity, delay: 1 }} className="absolute bottom-40 right-[15%] text-6xl opacity-20 pointer-events-none hidden md:block">🚀</motion.div>
      <motion.div animate={{ y: [0, -15, 0], rotate: [0, 15, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 2 }} className="absolute top-40 right-[25%] text-4xl opacity-20 pointer-events-none hidden lg:block">⭐</motion.div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl w-full">
        {/* Tag */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-8 border border-arcade-red/30 bg-arcade-red/10 rounded-full px-5 py-2 backdrop-blur-sm"
        >
          <span className="w-2 h-2 bg-arcade-red rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          <span className="pixel-text text-arcade-red text-[10px] tracking-[0.2em] uppercase">Aarvieve Studios Presents</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display font-black text-6xl sm:text-7xl md:text-9xl tracking-tight text-white mb-6 leading-[0.9]"
        >
          AARVIEVE<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-arcade-red via-red-500 to-orange-500 filter drop-shadow-[0_0_30px_rgba(239,68,68,0.4)]">ARCADE</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-300 text-lg md:text-2xl max-w-2xl mb-12 leading-relaxed font-medium"
        >
          A premium retro gaming platform featuring a massive library of 12 classic arcade games, global leaderboards, and unlockable achievements.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
        >
          <button
            onClick={() => navigate('/login')}
            className="flex-1 group relative bg-arcade-red hover:bg-red-500 text-white font-bold rounded-2xl py-4 text-sm tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:shadow-[0_0_50px_rgba(239,68,68,0.5)] hover:-translate-y-1"
          >
            <div className="absolute inset-0 w-full h-full border-2 border-white/20 rounded-2xl" />
            <div className="flex items-center justify-center gap-2">
              <Play className="w-4 h-4 fill-white" />
              <span>Insert Coin</span>
            </div>
          </button>
          <button
            onClick={() => navigate('/register')}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-white font-bold rounded-2xl py-4 text-sm tracking-widest uppercase transition-all backdrop-blur-md"
          >
            New Player
          </button>
        </motion.div>

        {/* Install App Button — only visible if browser supports PWA install */}
        {isInstallable && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 w-full max-w-md"
          >
            <button
              onClick={handleInstall}
              className="w-full flex items-center justify-center gap-2.5 border border-arcade-blue/50 bg-arcade-blue/10 hover:bg-arcade-blue/20 text-arcade-blue font-bold rounded-2xl py-3.5 text-sm tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 animate-pulse hover:animate-none"
            >
              <Download className="w-4 h-4" />
              <span>Install App — Play Offline</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50"
      >
        <span className="text-[10px] tracking-widest uppercase font-bold text-slate-400">Scroll Down</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
