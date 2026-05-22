import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGameStore } from '../store/gameStore';
import { motion } from 'framer-motion';
import { Award, ArrowLeft, Lock, Calendar, CheckCircle } from 'lucide-react';

const Achievements: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { achievements } = useGameStore();

  if (!user) return null;

  const total         = achievements.length;
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const percentage    = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

  const CATEGORY_COLORS: Record<string, string> = {
    general:  'text-arcade-blue  border-arcade-blue/30',
    gaming:   'text-arcade-green border-arcade-green/30',
    romantic: 'text-arcade-red   border-arcade-red/30',
  };

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
              <Award className="w-6 h-6 text-arcade-blue" />
              Achievements
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Unlock badges by conquering games and challenges</p>
          </div>

          {/* Progress ring */}
          <div className="flex items-center gap-4 glass-card border border-white/5 rounded-2xl px-6 py-4">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 -rotate-90 absolute">
                <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.06)" strokeWidth="5" fill="transparent" />
                <circle
                  cx="32" cy="32" r="26"
                  stroke="#22c55e"
                  strokeWidth="5"
                  strokeDasharray={163.4}
                  strokeDashoffset={163.4 - (163.4 * percentage) / 100}
                  fill="transparent"
                  style={{ strokeLinecap: 'round', transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <span className="relative text-sm font-black font-pixel text-white">{percentage}%</span>
            </div>
            <div>
              <p className="text-base font-bold text-white">{unlockedCount}/{total} Badges</p>
              <p className="text-xs text-slate-500">{user.totalPoints} total points earned</p>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach, i) => {
            const dateStr = ach.unlockedAt
              ? new Date(ach.unlockedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              : null;
            const catColor = CATEGORY_COLORS[ach.category] || 'text-slate-400 border-white/10';

            return (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`relative bg-arcade-dark border rounded-xl p-5 flex flex-col gap-3 transition-all ${
                  ach.isUnlocked
                    ? 'border-white/10 hover:border-white/20'
                    : 'border-white/4 opacity-50'
                }`}
              >
                {/* Locked overlay icon */}
                {!ach.isUnlocked && (
                  <div className="absolute top-4 right-4 text-slate-700">
                    <Lock className="w-4 h-4" />
                  </div>
                )}
                {ach.isUnlocked && (
                  <div className="absolute top-4 right-4 text-arcade-green">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}

                {/* Badge icon + name */}
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{ach.icon}</span>
                  <div>
                    <h3 className={`text-sm font-bold ${ach.isUnlocked ? 'text-white' : 'text-slate-600'}`}>{ach.title}</h3>
                    <span className={`text-[9px] font-bold border rounded px-1.5 py-0.5 pixel-text ${catColor}`}>
                      +{ach.points} PTS
                    </span>
                  </div>
                </div>

                <p className={`text-xs leading-relaxed ${ach.isUnlocked ? 'text-slate-400' : 'text-slate-700'}`}>
                  {ach.description}
                </p>

                {ach.isUnlocked && dateStr && (
                  <div className="flex items-center gap-1.5 border-t border-white/5 pt-3 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                    <Calendar className="w-3 h-3" />
                    Unlocked {dateStr}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Achievements;

