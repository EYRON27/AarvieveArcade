import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LOADING_LINES = [
  'Initializing arcade systems...',
  'Loading game cartridges...',
  'Syncing leaderboard data...',
  'Connecting co-op session...',
  'Booting player profiles...',
];

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setLineIndex(p => (p + 1) % LOADING_LINES.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-arcade-darker px-4">
      {/* Red corner accents */}
      <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-arcade-red/40" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-arcade-red/40" />

      {/* Logo block */}
      <motion.div
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-10 h-10 bg-arcade-red rounded-xl flex items-center justify-center font-black text-white font-pixel text-sm">
          AA
        </div>
        <span className="font-display text-2xl font-bold text-white tracking-widest uppercase">
          Aarvieve Arcade
        </span>
      </motion.div>

      {/* Progress bar */}
      <div className="w-56 h-1 bg-white/5 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-arcade-red rounded-full"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ width: '50%' }}
        />
      </div>

      {/* Status message */}
      <p className="pixel-text text-slate-500 text-center">
        {message || LOADING_LINES[lineIndex]}
      </p>

      {/* Footer */}
      <div className="absolute bottom-5 pixel-text text-slate-700 text-[10px]">
        AARVIEVE STUDIOS — ARCADE PLATFORM v1.0
      </div>
    </div>
  );
};

export default LoadingScreen;
