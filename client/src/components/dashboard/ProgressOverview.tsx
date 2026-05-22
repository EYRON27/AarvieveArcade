import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Award, Zap, Target } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  icon: string;
  points: number;
  isUnlocked: boolean;
}

interface ProgressOverviewProps {
  totalPoints: number;
  topScore: number | string;
  unlockedAch: number;
  totalAch: number;
  achievements: Achievement[];
}

const ProgressOverview: React.FC<ProgressOverviewProps> = ({
  totalPoints,
  topScore,
  unlockedAch,
  totalAch,
  achievements,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Quick Stats */}
      <div className="glass-card border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5 text-arcade-green" /> Quick Stats
        </h2>
        {[
          { label: 'Total Score',   icon: Target,     val: totalPoints, color: 'text-arcade-red'   },
          { label: 'Personal Best', icon: Zap,        val: topScore,  color: 'text-arcade-green' },
          { label: 'Achievements',  icon: Award,      val: `${unlockedAch}/${totalAch}`, color: 'text-arcade-blue' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="flex justify-between items-center py-2 border-b border-white/4 last:border-0">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${stat.color}`} /> {stat.label}
              </span>
              <span className="font-black font-pixel text-xs text-white">{stat.val}</span>
            </div>
          );
        })}
        <Link to="/leaderboard" className="mt-1 w-full flex items-center justify-center gap-1.5 bg-arcade-red hover:bg-arcade-red-hover text-white font-bold rounded-lg py-2.5 text-[10px] tracking-widest uppercase transition-all">
          <Trophy className="w-3 h-3" /> LEADERBOARD
        </Link>
      </div>

      {/* Recent Badges */}
      <div className="glass-card border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2">
          <Award className="w-3.5 h-3.5 text-arcade-blue" /> Recent Badges
        </h2>
        {achievements.filter(a => a.isUnlocked).slice(0, 3).length === 0 && (
          <p className="text-[10px] text-slate-600 text-center py-2 uppercase tracking-wider pixel-text">Play to earn your first badge</p>
        )}
        {achievements.filter(a => a.isUnlocked).slice(0, 3).map(ach => (
          <div key={ach.id} className="flex items-center gap-2.5">
            <span className="text-xl">{ach.icon}</span>
            <div>
              <p className="text-xs font-bold text-slate-200">{ach.title}</p>
              <p className="text-[10px] text-slate-600">+{ach.points} pts</p>
            </div>
          </div>
        ))}
        <Link to="/achievements" className="mt-1 w-full text-center text-[10px] font-bold tracking-widest text-slate-500 hover:text-slate-300 uppercase transition-colors py-1">
          VIEW ALL →
        </Link>
      </div>
    </div>
  );
};

export default ProgressOverview;
