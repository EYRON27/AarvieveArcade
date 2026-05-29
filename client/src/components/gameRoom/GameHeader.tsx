import React from 'react';
import { Star, Trophy } from 'lucide-react';

interface GameHeaderProps {
  meta: { title: string; desc: string; icon: string };
  personalBest: number | string;
  topScore: number | string;
}

const GameHeader: React.FC<GameHeaderProps> = ({ meta, personalBest, topScore }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
      <div className="text-left flex items-start gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide flex items-center gap-2">
            <span className="text-3xl select-none">{meta.icon}</span>
            {meta.title}
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">{meta.desc}</p>
        </div>
      </div>

      {/* Quick High Score scoreboard */}
      <div className="flex gap-4 font-bold text-xs tracking-wider select-none">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl py-3 px-4 flex items-center gap-2.5">
          <Star className="w-4 h-4 text-arcade-green fill-arcade-green" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">PERSONAL BEST</span>
            <span className="text-sm font-black text-white font-mono">{personalBest}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl py-3 px-4 flex items-center gap-2.5">
          <Trophy className="w-4 h-4 text-arcade-red fill-arcade-red" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase block">LEADERBOARD TOP</span>
            <span className="text-sm font-black text-white font-mono">{topScore}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;
