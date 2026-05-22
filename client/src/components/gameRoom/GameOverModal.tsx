import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Sparkles } from 'lucide-react';

interface GameOverModalProps {
  showSaveModal: boolean;
  lastScore: number | null;
  scoreSaved: boolean;
  handleSaveScore: () => void;
  setShowSaveModal: (show: boolean) => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  showSaveModal,
  lastScore,
  scoreSaved,
  handleSaveScore,
  setShowSaveModal,
}) => {
  return (
    <AnimatePresence>
      {showSaveModal && lastScore !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm bg-gradient-to-tr from-slate-900 to-slate-950 border-2 border-arcade-blue rounded-3xl p-6 shadow-[0_0_40px_rgba(139,92,246,0.25)] text-center"
          >
            <div className="text-5xl select-none mb-3">👾</div>
            
            <h3 className="pixel-text text-arcade-blue neon-text-blue text-xs uppercase tracking-wider mb-2">
              GAME OVER
            </h3>

            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">YOUR SCORE</p>
            <h4 className="text-5xl font-black text-white font-mono tracking-widest my-4 neon-text-red animate-pulse">
              {lastScore}
            </h4>

            {scoreSaved ? (
              <div className="flex flex-col items-center gap-1.5 py-4 text-emerald-400 font-bold text-sm">
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>SCORE SAVED TO LEADERBOARD!</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={handleSaveScore}
                  className="w-full bg-gradient-to-r from-arcade-blue to-arcade-red hover:from-arcade-blue-hover hover:to-arcade-red-hover text-white font-bold rounded-xl py-3.5 shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>SAVE SCORE</span>
                </button>

                <button
                  onClick={() => setShowSaveModal(false)}
                  className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold rounded-xl py-3 text-xs tracking-wider transition-all cursor-pointer"
                >
                  SKIP RECORDING
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GameOverModal;
