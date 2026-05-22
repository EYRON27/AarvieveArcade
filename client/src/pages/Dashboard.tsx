import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGameStore } from '../store/gameStore';
import { motion } from 'framer-motion';
import {
  Gamepad2,
  Trophy,
  Award,
  Calendar,
  Flame,
  ArrowRight,
  Play,
  Zap,
  Target,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { achievements, memories, fetchInitialData } = useGameStore();

  const [anniversaryDays, setAnniversaryDays] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (user?.uid) fetchInitialData(user.uid);
  }, [user?.uid]);

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12)       setGreeting(`Good morning, ${user?.displayName}`);
    else if (hr < 17)  setGreeting(`Good afternoon, ${user?.displayName}`);
    else               setGreeting(`Good evening, ${user?.displayName}`);
  }, [user]);

  useEffect(() => {
    const calcTime = () => {
      const annDate = new Date(user?.anniversaryDate || '2024-02-14');
      const diff = Date.now() - annDate.getTime();
      if (diff < 0) return;
      const secs = Math.floor(diff / 1000);
      const mins = Math.floor(secs / 60);
      const hrs  = Math.floor(mins / 60);
      const days = Math.floor(hrs / 24);
      setAnniversaryDays({ days, hours: hrs % 24, minutes: mins % 60, seconds: secs % 60 });
    };
    calcTime();
    const interval = setInterval(calcTime, 1000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  const totalUnlockedAchievements = achievements.filter(a => a.isUnlocked).length;
  const totalUnlockedMemories = memories.filter(m => m.isUnlocked).length;

  const featuredGames = [
    { id: 'flappyBird',         title: 'Flappy Bird',       icon: '🐦', tag: 'ARCADE',   color: 'border-arcade-red/30   hover:border-arcade-red/60'   },
    { id: 'snake',              title: 'Snake',             icon: '🐍', tag: 'RETRO',    color: 'border-arcade-green/30 hover:border-arcade-green/60' },
    { id: 'ticTacToe',          title: 'Tic Tac Toe',       icon: '❌', tag: 'AI',       color: 'border-arcade-blue/30  hover:border-arcade-blue/60'  },
    { id: 'memoryGame',         title: 'Memory Cards',      icon: '🧠', tag: 'PUZZLE',   color: 'border-arcade-red/30   hover:border-arcade-red/60'   },
    { id: 'reactionGame',       title: 'Reaction Clicker',  icon: '⚡', tag: 'REFLEX',   color: 'border-arcade-green/30 hover:border-arcade-green/60' },
    { id: 'catchMyHeart',       title: 'Catch My Heart',    icon: '🧺', tag: 'COZY',    color: 'border-arcade-blue/30  hover:border-arcade-blue/60'  },
  ];

  return (
    <div className="relative min-h-screen w-full bg-arcade-darker text-white pb-20 overflow-x-hidden">
      {/* Subtle red glow top-left */}
      <div className="absolute top-0 left-0 w-[500px] h-[300px] bg-arcade-red/5 filter blur-[120px] pointer-events-none" />
      {/* Subtle blue glow bottom-right */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-arcade-blue/5 filter blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-8 flex flex-col gap-6">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1 pixel-text">
              PLAYER 1 SESSION ACTIVE
            </p>
            <h1 className="text-3xl md:text-4xl font-bold font-display tracking-wide text-white">
              {greeting}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Co-op partner: <span className="text-arcade-red font-semibold">{user.girlfriendName || 'Genevieve'}</span>
            </p>
          </div>

          {/* Quick stats row */}
          <div className="flex items-center gap-3">
            <div className="stat-badge rounded-xl px-4 py-2.5 text-center">
              <span className="block text-xl font-black font-pixel text-arcade-red neon-text-red">{user.totalPoints}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Points</span>
            </div>
            <div className="stat-badge rounded-xl px-4 py-2.5 text-center">
              <span className="block text-xl font-black font-pixel text-arcade-green neon-text-green">{totalUnlockedAchievements}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Badges</span>
            </div>
            <div className="stat-badge rounded-xl px-4 py-2.5 text-center">
              <span className="block text-xl font-black font-pixel text-arcade-blue neon-text-blue">{totalUnlockedMemories}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Memories</span>
            </div>
            {user.streak > 0 && (
              <div className="flex items-center gap-1.5 stat-badge border border-orange-500/20 rounded-xl px-3 py-2 text-orange-400 text-sm font-bold">
                <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                <span>{user.streak}d</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Anniversary Counter ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card border border-white/5 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-arcade-red" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest pixel-text">Love Clock — Since {user.anniversaryDate || '2024-02-14'}</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { val: anniversaryDays.days,    label: 'DAYS'    },
              { val: anniversaryDays.hours,   label: 'HOURS'   },
              { val: anniversaryDays.minutes, label: 'MINS'    },
              { val: anniversaryDays.seconds, label: 'SECS'    },
            ].map((b, i) => (
              <div key={i} className="bg-arcade-dark border border-white/5 rounded-xl py-4 text-center">
                <span className="block text-3xl md:text-4xl font-black font-pixel text-white tracking-widest">
                  {String(b.val).padStart(2, '0')}
                </span>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider mt-1 block">{b.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Games Grid (col-span-2) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2 text-slate-200 tracking-wide">
                <Gamepad2 className="w-4 h-4 text-arcade-red" />
                Arcade Cabinet
              </h2>
              <Link to="/games" className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-arcade-red transition-colors">
                <span>All Games</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {featuredGames.map((game, i) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -3 }}
                  className={`group bg-arcade-dark border-2 ${game.color} rounded-xl p-4 flex flex-col gap-3 transition-all cursor-pointer`}
                  onClick={() => navigate(`/games/${game.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{game.icon}</span>
                    <span className="text-[9px] font-bold text-slate-500 border border-white/10 rounded px-1.5 py-0.5 pixel-text">
                      {game.tag}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">{game.title}</p>
                  </div>
                  <button
                    className="flex items-center gap-1 text-[10px] font-bold text-slate-500 group-hover:text-white transition-colors pixel-text"
                    onClick={(e) => { e.stopPropagation(); navigate(`/games/${game.id}`); }}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>LAUNCH</span>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column — Stats Panel */}
          <div className="flex flex-col gap-4">

            {/* Leaderboard shortcut */}
            <div className="glass-card border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
              <h2 className="text-sm font-bold flex items-center gap-2 text-slate-300 border-b border-white/5 pb-3">
                <Trophy className="w-4 h-4 text-arcade-green" />
                Quick Stats
              </h2>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400 font-medium flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-arcade-red" /> Total Score
                  </span>
                  <span className="font-black font-pixel text-white">{user.totalPoints}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400 font-medium flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-arcade-blue" /> Achievements
                  </span>
                  <span className="font-black font-pixel text-white">{totalUnlockedAchievements}/{achievements.length}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400 font-medium flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-arcade-green" /> Visit Streak
                  </span>
                  <span className="font-black font-pixel text-white">{user.streak} days</span>
                </div>
              </div>
              <Link
                to="/leaderboard"
                className="mt-1 w-full flex items-center justify-center gap-1.5 bg-arcade-red hover:bg-arcade-red-hover text-white font-bold rounded-lg py-2.5 text-xs tracking-wider transition-all"
              >
                <Trophy className="w-3.5 h-3.5" />
                VIEW LEADERBOARD
              </Link>
            </div>

            {/* Achievements preview */}
            <div className="glass-card border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
              <h2 className="text-sm font-bold flex items-center gap-2 text-slate-300 border-b border-white/5 pb-3">
                <Award className="w-4 h-4 text-arcade-blue" />
                Recent Badges
              </h2>
              {achievements.filter(a => a.isUnlocked).slice(0, 3).map(ach => (
                <div key={ach.id} className="flex items-center gap-3">
                  <span className="text-xl">{ach.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-slate-200">{ach.title}</p>
                    <p className="text-[10px] text-slate-500">+{ach.points} pts</p>
                  </div>
                </div>
              ))}
              {achievements.filter(a => a.isUnlocked).length === 0 && (
                <p className="text-xs text-slate-600 font-bold uppercase tracking-wider text-center py-2">No badges yet — play to unlock!</p>
              )}
              <Link
                to="/achievements"
                className="mt-1 w-full flex items-center justify-center gap-1.5 border border-white/10 hover:border-arcade-blue/50 text-slate-400 hover:text-white font-bold rounded-lg py-2 text-xs tracking-wider transition-all"
              >
                ALL ACHIEVEMENTS
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

