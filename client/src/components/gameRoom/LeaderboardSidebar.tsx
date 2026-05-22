import React from 'react';
import { Trophy } from 'lucide-react';

interface LeaderboardEntry {
  userId: string;
  userDisplayName: string;
  score: number;
}

interface LeaderboardSidebarProps {
  highScores: LeaderboardEntry[];
  currentUserId: string;
}

const LeaderboardSidebar: React.FC<LeaderboardSidebarProps> = ({ highScores, currentUserId }) => {
  return (
    <div className="bg-arcade-card glass-card border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 shadow-xl">
      <h2 className="text-sm font-extrabold tracking-widest uppercase text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-3">
        <Trophy className="w-4 h-4 text-arcade-red" />
        Leaderboard Stats
      </h2>

      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
        {highScores.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 font-bold uppercase tracking-wider">
            NO HIGHSCORES YET
          </div>
        ) : (
          highScores.map((entry, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                entry.userId === currentUserId 
                  ? 'bg-arcade-red/10 border-arcade-red/40 text-white' 
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-5 h-5 flex items-center justify-center text-xs font-black rounded-lg ${
                  index === 0 ? 'bg-amber-500 text-white' :
                  index === 1 ? 'bg-slate-400 text-slate-900' :
                  index === 2 ? 'bg-amber-700 text-white' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {index + 1}
                </span>
                <span className="text-xs font-bold truncate max-w-[100px]">{entry.userDisplayName}</span>
              </div>

              <span className="text-xs font-black font-mono tracking-wide">{entry.score}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeaderboardSidebar;
