import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FeaturedGamesSection: React.FC = () => {
  const navigate = useNavigate();

  const featuredGames = [
    { title: 'Space Dodger', icon: '🚀', color: 'from-blue-500 to-cyan-500', desc: 'Survive the asteroid field' },
    { title: '2048 Puzzle', icon: '🧩', color: 'from-yellow-500 to-orange-500', desc: 'Merge tiles to 2048' },
    { title: 'Brick Breaker', icon: '🧱', color: 'from-red-500 to-pink-500', desc: 'Smash the neon bricks' },
    { title: 'Flappy Bird', icon: '🦅', color: 'from-green-500 to-emerald-500', desc: 'Navigate the pipes' },
  ];

  return (
    <section className="py-32 px-4 relative">
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-arcade-blue/5 filter blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">A Massive Arcade Library</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Dive into 12 carefully crafted retro mini-games. From high-speed action to brain-teasing puzzles, there is something for everyone.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredGames.map((game, i) => (
            <motion.div
              key={game.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative bg-slate-900 border border-white/10 rounded-3xl p-6 overflow-hidden transition-all hover:shadow-2xl hover:border-white/20"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${game.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
              <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform origin-left">{game.icon}</div>
              <h3 className="font-bold text-xl mb-2 text-white">{game.title}</h3>
              <p className="text-slate-400 text-sm">{game.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
           <button
            onClick={() => navigate('/register')}
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-6 py-3 text-sm font-bold tracking-widest uppercase transition-all"
          >
            <span>+ 8 More Games Inside</span>
            <ChevronDown className="w-4 h-4 -rotate-90" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedGamesSection;
