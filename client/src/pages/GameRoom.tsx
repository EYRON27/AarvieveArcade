import React, { lazy, Suspense, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import HeartParticles from '../components/ui/HeartParticles';
import LoadingScreen from '../components/ui/LoadingScreen';
import { ArrowLeft, Trophy, Star, Sparkles, Award } from 'lucide-react';

// Dynamically import games for code splitting & speed
const FlappyBird = lazy(() => import('../games/flappyBird/FlappyBird'));
const SnakeGame = lazy(() => import('../games/snake/Snake'));
const TicTacToe = lazy(() => import('../games/ticTacToe/TicTacToe'));
const MemoryGame = lazy(() => import('../games/memoryGame/MemoryGame'));
const NeonSequence = lazy(() => import('../games/neonSequence/NeonSequence'));
const ReactionGame = lazy(() => import('../games/reactionGame/ReactionGame'));
const CatchMyHeart = lazy(() => import('../games/catchMyHeart/CatchMyHeart'));
const RelationshipTrivia = lazy(() => import('../games/coupleGames/RelationshipTrivia'));

const GAME_METRICS: Record<string, { title: string; desc: string; icon: string }> = {
  flappyBird:         { title: 'Flappy Bird',      desc: 'Navigate through obstacles without crashing.',  icon: '🐦' },
  snake:              { title: 'Snake',             desc: 'Classic neon snake — grow longer, don\'t crash.', icon: '🐍' },
  ticTacToe:          { title: 'Tic Tac Toe',       desc: 'Outsmart the AI on the classic 3×3 grid.',      icon: '❌' },
  memoryGame:         { title: 'Memory Cards',      desc: 'Match all pairs as fast as possible.',          icon: '🧠' },
  neonSequence:       { title: 'Neon Sequence',     desc: 'Memorize the color sequence pattern.',          icon: '👁️' },
  reactionGame:       { title: 'Reaction Clicker',  desc: 'Click the target instantly — test your reflex.',icon: '⚡' },
  catchMyHeart:       { title: 'Catch My Heart',    desc: 'Catch falling hearts with your basket.',        icon: '🧺' },
  relationshipTrivia: { title: 'Arcade Trivia',     desc: 'Test your gaming knowledge — 5 questions.',     icon: '🎯' }
};

const GameRoom: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scores, saveGameScore } = useGameStore();

  const [scoreSaved, setScoreSaved] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    // Reset state on game change
    setScoreSaved(false);
    setLastScore(null);
    setShowSaveModal(false);
  }, [gameId]);

  if (!user || !gameId || !GAME_METRICS[gameId]) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-arcade-darker text-slate-400 font-bold uppercase select-none">
        ⚠️ Game Not Found
      </div>
    );
  }

  const meta = GAME_METRICS[gameId];
  const highScores = scores[gameId] || [];
  const personalBest = highScores.find(s => s.userId === user.uid)?.score ?? '-';

  // Callback when a game finishes
  const handleGameComplete = async (score: number) => {
    setLastScore(score);
    setShowSaveModal(true);
    setScoreSaved(false);
  };

  const handleSaveScore = async () => {
    if (lastScore === null || scoreSaved) return;
    try {
      setScoreSaved(true);
      await saveGameScore(user.uid, user.displayName, gameId, lastScore);
      setTimeout(() => setShowSaveModal(false), 1500);
    } catch (e) {
      console.error(e);
      setScoreSaved(false);
    }
  };

  // Render correct game component
  const renderGame = () => {
    switch (gameId) {
      case 'flappyBird':
        return <FlappyBird onComplete={handleGameComplete} />;
      case 'snake':
        return <SnakeGame onComplete={handleGameComplete} />;
      case 'ticTacToe':
        return <TicTacToe onComplete={handleGameComplete} />;
      case 'memoryGame':
        return <MemoryGame onComplete={handleGameComplete} />;
      case 'neonSequence':
        return <NeonSequence onComplete={handleGameComplete} />;
      case 'reactionGame':
        return <ReactionGame onComplete={handleGameComplete} />;
      case 'catchMyHeart':
        return <CatchMyHeart onComplete={handleGameComplete} />;
      case 'relationshipTrivia':
        return <RelationshipTrivia onComplete={handleGameComplete} />;
      default:
        return <div>Game under maintenance</div>;
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-arcade-darker text-white pb-20 overflow-x-hidden">
      <HeartParticles />

      {/* Grid Pattern Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,14,43,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(18,14,43,0.3)_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-8 flex flex-col gap-6">
        
        {/* Navigation / Header details */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="text-left flex items-start gap-3">
            <button
              onClick={() => navigate('/games')}
              className="mt-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-arcade-red text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide flex items-center gap-2">
                <span className="text-3xl select-none">{meta.icon}</span>
                {meta.title}
              </h1>
              <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">{meta.desc}</p>
            </div>
          </div>

          {/* Quick High Score scoreboard */}
          <div className="flex gap-4 font-bold text-xs tracking-wider select-none">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl py-3 px-4 flex items-center gap-2.5">
              <Star className="w-4 h-4 text-arcade-green fill-arcade-green" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">PERSONAL BEST</span>
                <span className="text-sm font-black text-white font-mono">{personalBest}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl py-3 px-4 flex items-center gap-2.5">
              <Trophy className="w-4 h-4 text-arcade-red fill-arcade-red" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">LEADERBOARD TOP</span>
                <span className="text-sm font-black text-white font-mono">
                  {highScores[0]?.score ?? '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic game room display grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-2 items-start">
          
          {/* Active game display container (spans 3) */}
          <div className="lg:col-span-3 bg-slate-950 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative min-h-[480px] flex items-center justify-center p-2 sm:p-4">
            <Suspense fallback={<LoadingScreen message="Inserting coin cartridges..." />}>
              {renderGame()}
            </Suspense>
          </div>

          {/* Side leaderboard feeds for this specific game */}
          <div className="bg-arcade-card glass-card border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 shadow-xl">
            <h2 className="text-sm font-extrabold tracking-widest uppercase text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Trophy className="w-4 h-4 text-arcade-red" />
              Leaderboard Stats
            </h2>

            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
              {highScores.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 font-bold uppercase tracking-wider">
                  NO HIGHSCORES YET
                </div>
              ) : (
                highScores.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      entry.userId === user.uid 
                        ? 'bg-arcade-red/10 border-arcade-red/40 text-white' 
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 flex items-center justify-center text-xs font-black rounded-lg ${
                        index === 0 ? 'bg-amber-500 text-white' :
                        index === 1 ? 'bg-slate-400 text-slate-900' :
                        index === 2 ? 'bg-amber-700 text-white' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold truncate max-w-[100px]">{entry.userDisplayName}</span>
                    </div>

                    <span className="text-xs font-black font-mono tracking-wide">{entry.score}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Post-game Score Saving Modal */}
      <AnimatePresence>
        {showSaveModal && lastScore !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-gradient-to-tr from-slate-900 to-slate-950 border-2 border-arcade-blue rounded-3xl p-6 shadow-[0_0_40px_rgba(139,92,246,0.25)] text-center"
            >
              <div className="text-5xl select-none mb-3">👾</div>
              
              <h3 className="pixel-text text-arcade-blue neon-text-blue text-xs uppercase tracking-wider mb-2">
                GAME OVER
              </h3>

              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">YOUR SCORE</p>
              <h4 className="text-5xl font-black text-white font-mono tracking-widest my-4 neon-text-red animate-pulse">
                {lastScore}
              </h4>

              {scoreSaved ? (
                <div className="flex flex-col items-center gap-1.5 py-4 text-emerald-400 font-bold text-sm">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>SCORE SAVED TO LEADERBOARD!</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={handleSaveScore}
                    className="w-full bg-gradient-to-r from-arcade-blue to-arcade-red hover:from-arcade-blue-hover hover:to-arcade-red-hover text-white font-bold rounded-xl py-3.5 shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>SAVE SCORE</span>
                  </button>

                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold rounded-xl py-3 text-xs tracking-wider transition-all cursor-pointer"
                  >
                    SKIP RECORDING
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameRoom;

