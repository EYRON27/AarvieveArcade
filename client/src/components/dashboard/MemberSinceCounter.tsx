import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

interface MemberSinceCounterProps {
  sessionTime: { days: number; hours: number; mins: number };
}

const MemberSinceCounter: React.FC<MemberSinceCounterProps> = ({ sessionTime }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="glass-card border border-white/5 rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-arcade-green" />
        <span className="pixel-text text-slate-500 text-[10px] uppercase tracking-widest">Total Playtime</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { val: sessionTime.days,  label: 'DAYS'  },
          { val: sessionTime.hours, label: 'HOURS' },
          { val: sessionTime.mins,  label: 'MINS'  },
        ].map((b, i) => (
          <div key={i} className="bg-arcade-dark border border-white/5 rounded-xl py-4 text-center">
            <span className="block text-3xl md:text-4xl font-black font-pixel text-white">
              {String(b.val).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-semibold text-slate-600 uppercase tracking-wider mt-1 block">{b.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default MemberSinceCounter;
