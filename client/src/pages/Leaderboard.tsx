import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGameStore } from '../store/gameStore';

import { Trophy, ArrowLeft, Calendar, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GAME_LABELS: Record<string, { label: string; icon: string }> = {
  flappyBird:         { label: 'Flappy Bird',      icon: '🐦' },
  snake:              { label: 'Snake',             icon: '🐍' },
  ticTacToe:          { label: 'Tic Tac Toe',       icon: '❌' },
  memoryGame:         { label: 'Memory Cards',      icon: '🧠' },
  puzzle2048:         { label: '2048 Puzzle',       icon: '🧩' },
  sudoku:             { label: 'Sudoku',            icon: '🔢' },
  neonSequence:       { label: 'Neon Sequence',     icon: '👁️' },
  spaceDodger:        { label: 'Space Dodger',      icon: '🚀' },
  brickBreaker:       { label: 'Brick Breaker',     icon: '🧱' },
  whackABug:          { label: 'Whack-A-Bug',       icon: '🐛' },
  reactionGame:       { label: 'Reaction Clicker',  icon: '⚡' },
  catchMyHeart:       { label: 'Catch My Heart',    icon: '🧺' },
  relationshipTrivia: { label: 'Arcade Trivia',     icon: '🎯' },
};

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { scores } = useGameStore();
  const [activeGame, setActiveGame] = useState<string>('flappyBird');

  const gameScores = scores[activeGame] || [];

  return (
    <div className="min-h-screen bg-arcade-darker text-white pb-20">
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8 flex flex-col gap-6">

        {/* Header */}
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-300 uppercase tracking-widest mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <Trophy className="w-6 h-6 text-arcade-green" />
            Global Leaderboards
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Top scores across all arcade cabinets</p>
        </div>

        {/* Game tabs */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(GAME_LABELS).map(([id, meta]) => (
            <button
              key={id}
              onClick={() => setActiveGame(id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold border transition-all ${
                activeGame === id
                  ? 'bg-arcade-green text-black border-arcade-green'
                  : 'bg-arcade-dark border-white/8 text-slate-400 hover:text-slate-200 hover:border-white/15'
              }`}
            >
              <span>{meta.icon}</span>
              {meta.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
            <Target className="w-4 h-4 text-arcade-red" />
            <span className="font-bold text-sm text-slate-200">
              {GAME_LABELS[activeGame]?.icon} {GAME_LABELS[activeGame]?.label} — Top Scores
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-bold text-slate-600 uppercase tracking-widest border-b border-white/5">
                  <th className="px-5 py-3 text-left">Rank</th>
                  <th className="px-5 py-3 text-left">Player</th>
                  <th className="px-5 py-3 text-right">Score</th>
                  <th className="px-5 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {gameScores.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-xs text-slate-600 font-bold uppercase tracking-widest pixel-text">
                      NO RECORDS YET
                    </td>
                  </tr>
                ) : (
                  gameScores.map((entry, index) => {
                    const isMe = entry.userId === user?.uid;
                    const dateStr = new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                    const rankColors = ['text-amber-400', 'text-slate-400', 'text-amber-700'];

                    return (
                      <tr
                        key={entry.id || index}
                        className={`transition-all ${isMe ? 'bg-arcade-red/5' : 'hover:bg-white/2'}`}
                      >
                        <td className="px-5 py-3.5">
                          <span className={`font-black font-pixel text-xs ${rankColors[index] || 'text-slate-600'}`}>
                            #{index + 1}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={isMe && user?.avatarUrl 
                                ? user.avatarUrl 
                                : (entry.userAvatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${entry.userDisplayName}&backgroundColor=1a1a1a`)}
                              alt=""
                              className="w-6 h-6 rounded-md border border-white/8 bg-arcade-dark object-cover"
                            />
                            <span className="font-semibold text-slate-200">{entry.userDisplayName}</span>
                            {isMe && (
                              <span className="text-[9px] font-bold bg-arcade-red/15 border border-arcade-red/30 text-arcade-red rounded px-1.5 py-0.5 pixel-text">YOU</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right font-black font-pixel text-white">{entry.score}</td>
                        <td className="px-5 py-3.5 text-right text-xs text-slate-600 flex items-center justify-end gap-1">
                          <Calendar className="w-3 h-3" />{dateStr}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Leaderboard;

