import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Play, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface GameItem {
  id: string;
  title: string;
  icon: string;
  tag: string;
  color: string;
}

interface QuickPlayGridProps {
  featuredGames: GameItem[];
}

const QuickPlayGrid: React.FC<QuickPlayGridProps> = ({ featuredGames }) => {
  const navigate = useNavigate();

  return (
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
  );
};

export default QuickPlayGrid;
