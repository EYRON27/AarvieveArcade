import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Trophy, Users } from 'lucide-react';

const StatsSection: React.FC = () => {
  const stats = [
    { label: 'Playable Games', value: '12', icon: Gamepad2, color: 'text-arcade-blue' },
    { label: 'Achievements', value: '40+', icon: Trophy, color: 'text-yellow-500' },
    { label: 'Active Players', value: 'Global', icon: Users, color: 'text-arcade-green' },
  ];

  return (
    <section className="relative z-20 -mt-20 py-10 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl"
          >
            <div className={`p-4 rounded-2xl bg-white/5 mb-4 ${stat.color}`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <h3 className="font-display text-5xl font-bold text-white mb-2">{stat.value}</h3>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
