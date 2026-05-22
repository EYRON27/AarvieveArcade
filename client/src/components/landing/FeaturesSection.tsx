import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Shield, Zap } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-black/40 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Side */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-bold text-4xl md:text-5xl mb-6 leading-tight">
              More Than Just <br/>
              <span className="text-arcade-green neon-text-green">Mini Games</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Aarvieve Arcade is a fully-fledged platform. We track every score, measure every reflex, and reward every milestone.
            </p>
            
            <ul className="space-y-6">
              {[
                { title: 'Global Leaderboards', desc: 'Fight for the #1 spot on 12 different leaderboards.', icon: Trophy, color: 'text-yellow-500' },
                { title: 'Unlockable Badges', desc: 'Complete challenges to earn over 40 unique profile badges.', icon: Shield, color: 'text-arcade-red' },
                { title: 'Detailed Stats', desc: 'Track your personal bests, total play time, and rankings.', icon: Zap, color: 'text-arcade-blue' }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">{item.title}</h4>
                    <p className="text-slate-400">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Visual Side (Mockup) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-arcade-green/10 filter blur-[100px] rounded-full" />
            <div className="relative bg-slate-900 border border-slate-700 rounded-3xl p-2 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">
                <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">👑</div>
                    <div>
                      <div className="text-white font-bold">PixelKing</div>
                      <div className="text-arcade-green text-xs font-bold tracking-widest">RANK 1</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-display font-bold text-white">12,450</div>
                    <div className="text-slate-500 text-xs font-bold tracking-widest uppercase">Total Score</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-slate-900 rounded-xl border border-slate-800 flex items-center px-4 justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-slate-800" />
                        <div className="w-24 h-3 bg-slate-800 rounded-full" />
                      </div>
                      <div className="w-12 h-3 bg-slate-700 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
