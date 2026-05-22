import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Gamepad2, Zap, Trophy, Heart } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const features = [
    { icon: Gamepad2, label: '7 Playable Games',  color: 'text-arcade-red'   },
    { icon: Trophy,   label: 'Live Leaderboards', color: 'text-arcade-green' },
    { icon: Zap,      label: 'Reflex Challenges',  color: 'text-arcade-blue'  },
    { icon: Heart,    label: 'Unlockable Gallery',  color: 'text-arcade-red'   },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-arcade-darker text-white overflow-hidden px-4">
      {/* Corner bracket decor */}
      <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-arcade-red/40" />
      <div className="absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-arcade-red/40" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-arcade-red/40" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-arcade-red/40" />

      {/* Background red glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-arcade-red/5 filter blur-[100px] rounded-full" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:40px_40px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full">

        {/* Tag */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-6 border border-arcade-red/30 bg-arcade-red/8 rounded-full px-4 py-1.5"
        >
          <span className="w-1.5 h-1.5 bg-arcade-red rounded-full animate-pulse" />
          <span className="pixel-text text-arcade-red text-[10px] tracking-widest">AARVIEVE STUDIOS — INDIE ARCADE PLATFORM</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display font-bold text-6xl sm:text-7xl md:text-8xl tracking-wider text-white mb-4 leading-none"
        >
          AARVIEVE<br />
          <span className="text-arcade-red neon-text-red">ARCADE</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-slate-400 text-base md:text-lg max-w-md mb-10 leading-relaxed"
        >
          A free retro gaming platform with 7 arcade games, live leaderboards, and unlockable content. Built by Aarvieve Studios.
        </motion.p>

        {/* Feature tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="flex items-center gap-1.5 border border-white/8 bg-white/3 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300">
                <Icon className={`w-3.5 h-3.5 ${f.color}`} />
                {f.label}
              </div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 w-full max-w-sm"
        >
          <button
            onClick={() => navigate('/login')}
            className="flex-1 bg-arcade-red hover:bg-arcade-red-hover text-white font-bold rounded-xl py-3.5 text-sm tracking-widest transition-all"
          >
            INSERT COIN
          </button>
          <button
            onClick={() => navigate('/register')}
            className="flex-1 border border-white/12 hover:border-arcade-red/50 text-slate-300 hover:text-white font-bold rounded-xl py-3.5 text-sm tracking-widest transition-all"
          >
            NEW PLAYER
          </button>
        </motion.div>

        {/* Footer credit */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 pixel-text text-slate-700 text-[10px] tracking-widest"
        >
          AARVIEVE STUDIOS — ARCADE PLATFORM v1.0
        </motion.p>
      </div>
    </div>
  );
};

export default LandingPage;

