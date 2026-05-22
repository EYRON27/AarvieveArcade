import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGameStore } from '../store/gameStore';
import { motion } from 'framer-motion';
import {
  Gamepad2, Trophy, Award, ArrowRight, Play, Zap, Target, TrendingUp, Clock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { achievements, gallery, scores, fetchInitialData } = useGameStore();

  const [sessionTime, setSessionTime] = useState({ days: 0, hours: 0, mins: 0 });
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (user?.uid) fetchInitialData(user.uid);
  }, [user?.uid]);

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12)      setGreeting('Good morning');
    else if (hr < 17) setGreeting('Good afternoon');
    else              setGreeting('Good evening');
  }, []);

  // "Member since" counter
  useEffect(() => {
    const calc = () => {
      const since = new Date(user?.createdAt || Date.now());
      const diff  = Math.max(0, Date.now() - since.getTime());
      const secs  = Math.floor(diff / 1000);
      const mins  = Math.floor(secs / 60);
      const hrs   = Math.floor(mins / 60);
      const days  = Math.floor(hrs / 24);
      setSessionTime({ days, hours: hrs % 24, mins: mins % 60 });
    };
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [user]);

  if (!user) return null;

  const unlockedAch = achievements.filter(a => a.isUnlocked).length;
  const unlockedGal = gallery.filter(g => g.isUnlocked).length;

  // Top score across all games
  const topScore = Object.values(scores)
    .flat()
    .filter(s => s.userId === user.uid)
    .reduce((best, s) => Math.max(best, s.score), 0);

  const featuredGames = [
    { id: 'flappyBird',         title: 'Flappy Bird',      icon: '🐦', tag: 'ARCADE',  color: 'border-arcade-red/25   hover:border-arcade-red/70'   },
    { id: 'snake',              title: 'Snake',            icon: '🐍', tag: 'RETRO',   color: 'border-arcade-green/25 hover:border-arcade-green/70' },
    { id: 'ticTacToe',          title: 'Tic Tac Toe',      icon: '❌', tag: 'VS AI',   color: 'border-arcade-blue/25  hover:border-arcade-blue/70'  },
    { id: 'memoryGame',         title: 'Memory Cards',     icon: '🧠', tag: 'PUZZLE',  color: 'border-arcade-red/25   hover:border-arcade-red/70'   },
    { id: 'reactionGame',       title: 'Reaction Clicker', icon: '⚡', tag: 'REFLEX',  color: 'border-arcade-green/25 hover:border-arcade-green/70' },
    { id: 'relationshipTrivia', title: 'Arcade Trivia',    icon: '🎯', tag: 'TRIVIA',  color: 'border-arcade-blue/25  hover:border-arcade-blue/70'  },
  ];

  return (
    <div className="relative min-h-screen bg-arcade-darker text-white pb-20 overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[250px] bg-arcade-red/4 filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[250px] bg-arcade-blue/4 filter blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-8 flex flex-col gap-6">

        {/* ── Header ── */}
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
              {greeting}, <span className="text-arcade-red">{user.displayName}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Member for {sessionTime.days}d {sessionTime.hours}h
            </p>
          </div>

          {/* Stat pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="stat-badge rounded-xl px-3.5 py-2.5 text-center min-w-[64px]">
              <span className="block text-lg font-black font-pixel text-arcade-red">{user.totalPoints}</span>
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

        {/* ── Member Since Counter ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card border border-white/5 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-arcade-green" />
            <span className="pixel-text text-slate-500 text-[10px] uppercase tracking-widest">Playing Since Day 1</span>
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

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Games (col-span-2) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-arcade-red" /> Arcade Cabinet
              </h2>
              <Link to="/games" className="flex items-center gap-1 text-xs text-slate-500 hover:text-arcade-red transition-colors">
                All Games <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {featuredGames.map((game, i) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -3 }}
                  onClick={() => navigate(`/games/${game.id}`)}
                  className={`group bg-arcade-dark border-2 ${game.color} rounded-xl p-4 cursor-pointer transition-all flex flex-col gap-3`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{game.icon}</span>
                    <span className="pixel-text text-[9px] text-slate-600 border border-white/8 rounded px-1.5 py-0.5">{game.tag}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-200">{game.title}</p>
                  <span className="flex items-center gap-1 pixel-text text-[9px] text-slate-600 group-hover:text-white transition-colors">
                    <Play className="w-2.5 h-2.5 fill-current" /> LAUNCH
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right stats column */}
          <div className="flex flex-col gap-4">

            {/* Quick Stats */}
            <div className="glass-card border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-arcade-green" /> Quick Stats
              </h2>
              {[
                { label: 'Total Score',   icon: Target,     val: user.totalPoints, color: 'text-arcade-red'   },
                { label: 'Personal Best', icon: Zap,        val: topScore || '—',  color: 'text-arcade-green' },
                { label: 'Achievements',  icon: Award,      val: `${unlockedAch}/${achievements.length}`, color: 'text-arcade-blue' },
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
