import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, ArrowLeft, Clock, Star, Heart, Zap } from 'lucide-react';

interface GameItem {
  id: string;
  title: string;
  icon: string;
  category: 'retro' | 'cozy';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  approxTime: string;
  tag: string;
  accentColor: string;
}

const GAMES_LIST: GameItem[] = [
  { id: 'flappyBird',         title: 'Flappy Bird',         icon: '🐦', category: 'retro', difficulty: 'Hard',   approxTime: '1-3 min',  tag: 'ARCADE',  accentColor: 'border-arcade-red/30  hover:border-arcade-red  text-arcade-red'   },
  { id: 'snake',              title: 'Snake',               icon: '🐍', category: 'retro', difficulty: 'Medium', approxTime: '2-5 min',  tag: 'RETRO',   accentColor: 'border-arcade-green/30 hover:border-arcade-green text-arcade-green' },
  { id: 'ticTacToe',          title: 'Tic Tac Toe',         icon: '❌', category: 'cozy',  difficulty: 'Easy',   approxTime: '1 min',    tag: 'VS AI',   accentColor: 'border-arcade-blue/30  hover:border-arcade-blue  text-arcade-blue'  },
  { id: 'memoryGame',         title: 'Memory Cards',        icon: '🧠', category: 'cozy',  difficulty: 'Medium', approxTime: '2 min',    tag: 'PUZZLE',  accentColor: 'border-arcade-red/30  hover:border-arcade-red  text-arcade-red'   },
  { id: 'puzzle2048',         title: '2048 Puzzle',         icon: '🧩', category: 'cozy',  difficulty: 'Hard',   approxTime: '5-10 min', tag: 'BRAIN',   accentColor: 'border-yellow-500/30 hover:border-yellow-500 text-yellow-500' },
  { id: 'sudoku',             title: 'Sudoku',              icon: '🔢', category: 'cozy',  difficulty: 'Hard',   approxTime: '10 min',   tag: 'LOGIC',   accentColor: 'border-arcade-blue/30  hover:border-arcade-blue  text-arcade-blue'   },
  { id: 'neonSequence',       title: 'Neon Sequence',       icon: '👁️', category: 'retro', difficulty: 'Medium', approxTime: '3 min',    tag: 'SIMON',   accentColor: 'border-arcade-blue/30  hover:border-arcade-blue  text-arcade-blue'   },
  { id: 'spaceDodger',        title: 'Space Dodger',        icon: '🚀', category: 'retro', difficulty: 'Hard',   approxTime: '2-5 min',  tag: 'ARCADE',  accentColor: 'border-arcade-blue/30  hover:border-arcade-blue  text-arcade-blue'   },
  { id: 'brickBreaker',       title: 'Brick Breaker',       icon: '🧱', category: 'retro', difficulty: 'Medium', approxTime: '3 min',    tag: 'ACTION',  accentColor: 'border-arcade-blue/30  hover:border-arcade-blue  text-arcade-blue'   },
  { id: 'whackABug',          title: 'Whack-A-Bug',         icon: '🐛', category: 'retro', difficulty: 'Easy',   approxTime: '30 sec',   tag: 'ACTION',  accentColor: 'border-arcade-green/30 hover:border-arcade-green text-arcade-green' },
  { id: 'reactionGame',       title: 'Reaction Clicker',    icon: '⚡', category: 'retro', difficulty: 'Hard',   approxTime: '30 sec',   tag: 'REFLEX',  accentColor: 'border-arcade-green/30 hover:border-arcade-green text-arcade-green' },
  { id: 'catchMyHeart',       title: 'Catch My Heart',      icon: '🧺', category: 'retro', difficulty: 'Easy',   approxTime: '2 min',    tag: 'FUN',     accentColor: 'border-arcade-blue/30  hover:border-arcade-blue  text-arcade-blue'  },
  { id: 'relationshipTrivia', title: 'Arcade Trivia',       icon: '🎯', category: 'cozy',  difficulty: 'Medium', approxTime: '2 min',    tag: 'TRIVIA',  accentColor: 'border-arcade-red/30  hover:border-arcade-red  text-arcade-red'   },
  { id: 'cupShuffle',         title: 'Cup Shuffle',         icon: '🥤', category: 'retro', difficulty: 'Medium', approxTime: '2 min',    tag: 'SKILL',   accentColor: 'border-arcade-blue/30  hover:border-arcade-blue  text-arcade-blue'  },
];

const DIFF_COLORS: Record<string, string> = {
  Easy:   'text-arcade-green border-arcade-green/30 bg-arcade-green/5',
  Medium: 'text-amber-400  border-amber-400/30  bg-amber-400/5',
  Hard:   'text-arcade-red  border-arcade-red/30  bg-arcade-red/5',
};

const GamesLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'retro' | 'cozy'>('all');
  const filtered = GAMES_LIST.filter(g => filter === 'all' || g.category === filter);

  return (
    <div className="min-h-screen bg-arcade-darker text-white pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
              <Gamepad2 className="w-6 h-6 text-arcade-red" />
              Arcade Cabinet Room
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Select a game, insert a coin, and play</p>
          </div>

          {/* Filter tabs */}
          <div className="flex bg-arcade-dark border border-white/8 rounded-xl p-1 gap-1 text-xs font-bold">
            {(['all', 'retro', 'cozy'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg transition-all uppercase tracking-widest ${
                  filter === f ? 'bg-arcade-red text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {f === 'all' ? 'All' : f === 'retro' ? 'Retro' : 'Cozy'}
              </button>
            ))}
          </div>
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              onClick={() => navigate(`/games/${game.id}`)}
              className={`bg-arcade-dark border-2 ${game.accentColor} rounded-xl p-5 flex flex-col gap-4 cursor-pointer transition-all group`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between">
                <span className="text-4xl">{game.icon}</span>
                <span className={`text-[9px] font-bold border rounded px-2 py-0.5 pixel-text ${DIFF_COLORS[game.difficulty]}`}>
                  {game.difficulty.toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div>
                <h3 className="text-base font-bold text-white">{game.title}</h3>
                <div className="flex gap-3 mt-2 text-[10px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{game.approxTime}</span>
                  <span className="flex items-center gap-1">
                    {game.category === 'cozy' ? <Heart className="w-3 h-3 text-arcade-red" /> : <Zap className="w-3 h-3 text-arcade-green" />}
                    {game.tag}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <button
                className="w-full mt-auto border border-white/8 group-hover:border-white/20 group-hover:bg-white/5 text-slate-400 group-hover:text-white font-bold rounded-lg py-2.5 text-xs uppercase tracking-widest transition-all"
              >
                <Star className="w-3 h-3 inline mr-1.5 -mt-0.5" />
                PLAY NOW
              </button>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default GamesLibrary;

