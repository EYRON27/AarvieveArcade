import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import type { MemoryItem } from '../types';
import { Heart, ArrowLeft, Lock, Calendar, Eye, X } from 'lucide-react';

const Memories: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { memories } = useGameStore();
  const [activeMemory, setActiveMemory] = useState<MemoryItem | null>(null);

  if (!user) return null;

  const total         = memories.length;
  const unlockedCount = memories.filter(m => m.isUnlocked).length;

  return (
    <div className="min-h-screen bg-arcade-darker text-white pb-20">
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8 flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-300 uppercase tracking-widest mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </button>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
              <Heart className="w-5 h-5 text-arcade-red fill-arcade-red" />
              Memories
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Unlock moments by completing game challenges
            </p>
          </div>

          <div className="flex items-center gap-3 glass-card border border-white/5 rounded-xl px-5 py-3">
            <span className="text-2xl">📸</span>
            <div>
              <p className="text-sm font-bold text-white">{unlockedCount} / {total} Unlocked</p>
              <p className="text-xs text-slate-500">Keep playing to reveal more</p>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {memories.map((memory, i) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => memory.isUnlocked && setActiveMemory(memory)}
              className={`relative bg-arcade-dark rounded-xl overflow-hidden border transition-all ${
                memory.isUnlocked
                  ? 'border-white/8 hover:border-arcade-red/40 cursor-pointer group'
                  : 'border-white/4 opacity-50 cursor-not-allowed'
              }`}
            >
              {/* Image */}
              <div className="aspect-[4/3] w-full overflow-hidden bg-arcade-darker">
                {memory.isUnlocked ? (
                  <>
                    <img
                      src={memory.imageUrl}
                      alt={memory.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="flex items-center gap-1.5 text-xs font-bold bg-white text-black rounded-lg px-4 py-2">
                        <Eye className="w-3.5 h-3.5" /> VIEW
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-6 text-center">
                    <Lock className="w-8 h-8 text-slate-700" />
                    <p className="text-[10px] text-slate-600 font-semibold leading-relaxed">
                      {memory.unlockCondition}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className={`text-sm font-bold ${memory.isUnlocked ? 'text-slate-200' : 'text-slate-600'}`}>
                    {memory.title}
                  </h3>
                  {memory.isUnlocked && (
                    <p className="text-[10px] text-slate-600 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(memory.date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <span className={`text-[9px] font-bold border rounded px-2 py-0.5 pixel-text ${
                  memory.isUnlocked
                    ? 'text-arcade-green border-arcade-green/30 bg-arcade-green/8'
                    : 'text-slate-600 border-white/8'
                }`}>
                  {memory.isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Modal */}
      <AnimatePresence>
        {activeMemory && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setActiveMemory(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-lg bg-arcade-dark border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative aspect-video w-full">
                <img src={activeMemory.imageUrl} alt={activeMemory.title} className="w-full h-full object-cover" />
                <button
                  onClick={() => setActiveMemory(null)}
                  className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-lg p-1.5 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-white">{activeMemory.title}</h3>
                  <span className="text-[10px] font-bold text-arcade-green border border-arcade-green/30 bg-arcade-green/8 rounded px-2 py-0.5 pixel-text">MEMORY</span>
                </div>
                <p className="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                  <Calendar className="w-3 h-3" />
                  {new Date(activeMemory.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">"{activeMemory.description}"</p>
                <button
                  onClick={() => setActiveMemory(null)}
                  className="mt-1 w-full border border-white/10 hover:border-arcade-red/40 text-slate-400 hover:text-white font-bold rounded-lg py-2.5 text-xs tracking-wider transition-all"
                >
                  CLOSE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Memories;

