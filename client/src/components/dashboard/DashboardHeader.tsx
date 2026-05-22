import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface DashboardHeaderProps {
  greeting: string;
  userDisplayName: string;
  sessionTime: { days: number; hours: number; mins: number };
  totalPoints: number;
  unlockedAch: number;
  unlockedGal: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  greeting,
  userDisplayName,
  sessionTime,
  totalPoints,
  unlockedAch,
  unlockedGal,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <div>
        <p className="pixel-text text-slate-600 text-[10px] uppercase tracking-widest mb-1">
          PLAYER DASHBOARD
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {greeting}, <span className="text-arcade-red">{userDisplayName}</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          Member for {sessionTime.days}d {sessionTime.hours}h
        </p>
      </div>

      {/* Stat pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="stat-badge rounded-xl px-3.5 py-2.5 text-center min-w-[64px]">
          <span className="block text-lg font-black font-pixel text-arcade-red">{totalPoints}</span>
          <span className="text-[9px] font-semibold text-slate-600 uppercase tracking-wider">Points</span>
        </div>
        <div className="stat-badge rounded-xl px-3.5 py-2.5 text-center min-w-[64px]">
          <span className="block text-lg font-black font-pixel text-arcade-green">{unlockedAch}</span>
          <span className="text-[9px] font-semibold text-slate-600 uppercase tracking-wider">Badges</span>
        </div>
        <div className="stat-badge rounded-xl px-3.5 py-2.5 text-center min-w-[64px]">
          <span className="block text-lg font-black font-pixel text-arcade-blue">{unlockedGal}</span>
          <span className="text-[9px] font-semibold text-slate-600 uppercase tracking-wider">Gallery</span>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;
