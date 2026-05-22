import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Gamepad2, Zap, Trophy, Shield, ChevronDown, Play, Star, Users } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const stats = [
    { label: 'Playable Games', value: '12', icon: Gamepad2, color: 'text-arcade-blue' },
    { label: 'Achievements', value: '40+', icon: Trophy, color: 'text-yellow-500' },
    { label: 'Active Players', value: 'Global', icon: Users, color: 'text-arcade-green' },
  ];

  const featuredGames = [
    { title: 'Space Dodger', icon: '🚀', color: 'from-blue-500 to-cyan-500', desc: 'Survive the asteroid field' },
    { title: '2048 Puzzle', icon: '🧩', color: 'from-yellow-500 to-orange-500', desc: 'Merge tiles to 2048' },
    { title: 'Brick Breaker', icon: '🧱', color: 'from-red-500 to-pink-500', desc: 'Smash the neon bricks' },
    { title: 'Flappy Bird', icon: '🦅', color: 'from-green-500 to-emerald-500', desc: 'Navigate the pipes' },
  ];

  return (
    <div className="min-h-screen bg-arcade-darker text-white overflow-x-hidden font-sans selection:bg-arcade-red/30">
      
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-32">
        {/* Background Grid & Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-arcade-red/10 filter blur-[120px] rounded-full" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:40px_40px]" />
        </div>

        {/* Floating elements */}
        <motion.div animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-32 left-[15%] text-6xl opacity-20 pointer-events-none hidden md:block">👾</motion.div>
        <motion.div animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }} transition={{ duration: 7, repeat: Infinity, delay: 1 }} className="absolute bottom-40 right-[15%] text-6xl opacity-20 pointer-events-none hidden md:block">🚀</motion.div>
        <motion.div animate={{ y: [0, -15, 0], rotate: [0, 15, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 2 }} className="absolute top-40 right-[25%] text-4xl opacity-20 pointer-events-none hidden lg:block">⭐</motion.div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl w-full">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-8 border border-arcade-red/30 bg-arcade-red/10 rounded-full px-5 py-2 backdrop-blur-sm"
          >
            <span className="w-2 h-2 bg-arcade-red rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            <span className="pixel-text text-arcade-red text-[10px] tracking-[0.2em] uppercase">Aarvieve Studios Presents</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-black text-6xl sm:text-7xl md:text-9xl tracking-tight text-white mb-6 leading-[0.9]"
          >
            AARVIEVE<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-arcade-red via-red-500 to-orange-500 filter drop-shadow-[0_0_30px_rgba(239,68,68,0.4)]">ARCADE</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg md:text-2xl max-w-2xl mb-12 leading-relaxed font-medium"
          >
            A premium retro gaming platform featuring a massive library of 12 classic arcade games, global leaderboards, and unlockable achievements.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
          >
            <button
              onClick={() => navigate('/login')}
              className="flex-1 group relative bg-arcade-red hover:bg-red-500 text-white font-bold rounded-2xl py-4 text-sm tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:shadow-[0_0_50px_rgba(239,68,68,0.5)] hover:-translate-y-1"
            >
              <div className="absolute inset-0 w-full h-full border-2 border-white/20 rounded-2xl" />
              <div className="flex items-center justify-center gap-2">
                <Play className="w-4 h-4 fill-white" />
                <span>Insert Coin</span>
              </div>
            </button>
            <button
              onClick={() => navigate('/register')}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-white font-bold rounded-2xl py-4 text-sm tracking-widest uppercase transition-all backdrop-blur-md"
            >
              New Player
            </button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50"
        >
          <span className="text-[10px] tracking-widest uppercase font-bold text-slate-400">Scroll Down</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </motion.div>
        </motion.div>
      </section>


      {/* --- STATS SECTION --- */}
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


      {/* --- FEATURED GAMES SECTION --- */}
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


      {/* --- FEATURES SECTION --- */}
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

      {/* --- FOOTER CTA --- */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-arcade-red/5" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
          >
            <h2 className="font-display font-bold text-5xl md:text-7xl mb-6">Ready to Play?</h2>
            <p className="text-slate-400 text-xl mb-10">Create a free account and start climbing the leaderboards today.</p>
            <button
              onClick={() => navigate('/register')}
              className="bg-arcade-red hover:bg-red-500 text-white font-black rounded-2xl px-12 py-5 text-lg tracking-widest uppercase transition-all shadow-[0_0_40px_rgba(239,68,68,0.4)] hover:shadow-[0_0_60px_rgba(239,68,68,0.6)] hover:-translate-y-1"
            >
              Create Account
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 bg-black text-center">
        <p className="pixel-text text-slate-700 text-[10px] tracking-widest uppercase">
          AARVIEVE STUDIOS — ARCADE PLATFORM v1.0
        </p>
      </footer>

    </div>
  );
};

export default LandingPage;
