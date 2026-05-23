import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGameStore } from '../store/gameStore';
import HeartParticles from '../components/ui/HeartParticles';
import LoadingScreen from '../components/ui/LoadingScreen';

import GameHeader from '../components/gameRoom/GameHeader';
import LeaderboardSidebar from '../components/gameRoom/LeaderboardSidebar';
import GameOverModal from '../components/gameRoom/GameOverModal';

// Dynamically import games for code splitting & speed
const FlappyBird = lazy(() => import('../games/flappyBird/FlappyBird'));
const SnakeGame = lazy(() => import('../games/snake/Snake'));
const TicTacToe = lazy(() => import('../games/ticTacToe/TicTacToe'));
const MemoryGame = lazy(() => import('../games/memoryGame/MemoryGame'));
const Puzzle2048 = lazy(() => import('../games/puzzle2048/Puzzle2048'));
const Sudoku = lazy(() => import('../games/sudoku/Sudoku'));
const NeonSequence = lazy(() => import('../games/neonSequence/NeonSequence'));
const SpaceDodger = lazy(() => import('../games/spaceDodger/SpaceDodger'));
const BrickBreaker = lazy(() => import('../games/brickBreaker/BrickBreaker'));
const WhackABug = lazy(() => import('../games/whackABug/WhackABug'));
const ReactionGame = lazy(() => import('../games/reactionGame/ReactionGame'));
const CatchMyHeart = lazy(() => import('../games/catchMyHeart/CatchMyHeart'));
const RelationshipTrivia = lazy(() => import('../games/coupleGames/RelationshipTrivia'));

const GAME_METRICS: Record<string, { title: string; desc: string; icon: string }> = {
  flappyBird:         { title: 'Flappy Bird',      desc: 'Navigate through obstacles without crashing.',  icon: '🦅' },
  snake:              { title: 'Snake',             desc: "Classic neon snake — grow longer, don't crash.", icon: '🐍' },
  ticTacToe:          { title: 'Tic Tac Toe',       desc: 'Outsmart the AI on the classic 3×3 grid.',      icon: '❌' },
  memoryGame:         { title: 'Memory Cards',      desc: 'Match all pairs as fast as possible.',          icon: '🧠' },
  puzzle2048:         { title: '2048 Puzzle',       desc: 'Slide and merge tiles to reach 2048.',          icon: '🧩' },
  sudoku:             { title: 'Sudoku',            desc: 'The classic 9x9 logic puzzle.',                 icon: '🔢' },
  neonSequence:       { title: 'Neon Sequence',     desc: 'Memorize the color sequence pattern.',          icon: '👁️' },
  spaceDodger:        { title: 'Space Dodger',      desc: 'Dodge the falling asteroids to survive!',       icon: '🚀' },
  brickBreaker:       { title: 'Brick Breaker',     desc: 'Smash all the bricks with the ball.',           icon: '🧱' },
  whackABug:          { title: 'Whack-A-Bug',       desc: 'Smash as many bugs as you can in 30s.',         icon: '🐛' },
  reactionGame:       { title: 'Reaction Clicker',  desc: 'Click the target instantly — test your reflex.',icon: '⚡' },
  catchMyHeart:       { title: 'Catch My Heart',    desc: 'Catch falling hearts with your basket.',        icon: '🧺' },
  relationshipTrivia: { title: 'Arcade Trivia',     desc: 'Test your gaming knowledge — 5 questions.',     icon: '🎯' }
};

const GameRoom: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const { scores, saveGameScore } = useGameStore();

  const [scoreSaved, setScoreSaved] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Listen for Esc key to exit fullscreen overlay
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen]);

  // Calculate dynamic scale for fullscreen so the game blows up to fill the monitor
  const [fullscreenScale, setFullscreenScale] = useState(1);
  const gameWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFullscreen) {
      setFullscreenScale(1);
      return;
    }
    const updateScale = () => {
      // Find the actual game container inside our wrapper
      const child = gameWrapperRef.current?.firstElementChild as HTMLElement;
      if (!child) return;
      
      // Get the unscaled original size of the game (ignore previous transforms)
      const w = child.offsetWidth || 400;
      const h = child.offsetHeight || 550;
      
      // Calculate how much we need to multiply it by to fill the window
      const scaleW = (window.innerWidth - 40) / w;
      const scaleH = (window.innerHeight - 100) / h;
      const bestScale = Math.min(scaleW, scaleH);
      
      // We only scale up if the screen is big enough, otherwise normal size
      setFullscreenScale(Math.max(1, bestScale));
    };

    // Run once immediately, then again slightly later to ensure the game finished rendering
    updateScale();
    const timeout = setTimeout(updateScale, 100);
    window.addEventListener('resize', updateScale);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateScale);
    };
  }, [isFullscreen, gameId]);

  useEffect(() => {
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

  const renderGame = () => {
    switch (gameId) {
      case 'flappyBird':        return <FlappyBird onComplete={handleGameComplete} />;
      case 'snake':             return <SnakeGame onComplete={handleGameComplete} />;
      case 'ticTacToe':         return <TicTacToe onComplete={handleGameComplete} />;
      case 'memoryGame':        return <MemoryGame onComplete={handleGameComplete} />;
      case 'puzzle2048':        return <Puzzle2048 onComplete={handleGameComplete} />;
      case 'sudoku':            return <Sudoku onComplete={handleGameComplete} />;
      case 'neonSequence':      return <NeonSequence onComplete={handleGameComplete} />;
      case 'spaceDodger':       return <SpaceDodger onComplete={handleGameComplete} />;
      case 'brickBreaker':      return <BrickBreaker onComplete={handleGameComplete} />;
      case 'whackABug':         return <WhackABug onComplete={handleGameComplete} />;
      case 'reactionGame':      return <ReactionGame onComplete={handleGameComplete} />;
      case 'catchMyHeart':      return <CatchMyHeart onComplete={handleGameComplete} />;
      case 'relationshipTrivia':return <RelationshipTrivia onComplete={handleGameComplete} />;
      default:                  return <div>Game under maintenance</div>;
    }
  };

  return (
    <>
      {/* ── TRUE FULLSCREEN OVERLAY — covers the ENTIRE browser window ── */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col">
          {/* Thin top bar with exit button */}
          <div className="flex items-center justify-between px-6 py-3 bg-slate-900/95 border-b border-slate-800 shrink-0">
            <span className="font-pixel text-[11px] text-slate-400 uppercase tracking-widest select-none">
              {meta.icon} {meta.title} — Fullscreen Mode
            </span>
            <button
              onClick={() => setIsFullscreen(false)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-arcade-red text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-all text-xs font-bold"
            >
              <Minimize className="w-4 h-4" />
              Exit <span className="text-slate-500 font-normal ml-1">(Esc)</span>
            </button>
          </div>

          {/* Game takes ALL remaining screen height and scales up */}
          <div className="flex-1 flex items-center justify-center overflow-hidden p-6 w-full h-full">
            <div 
              ref={gameWrapperRef}
              style={{ 
                transform: `scale(${fullscreenScale})`, 
                transformOrigin: 'center',
                transition: 'transform 0.2s ease-out'
              }}
            >
              <Suspense fallback={<LoadingScreen message="Inserting coin cartridges..." />}>
                {renderGame()}
              </Suspense>
            </div>
          </div>
        </div>
      )}

      {/* ── NORMAL GAME ROOM ── */}
      <div className="relative min-h-screen w-full bg-arcade-darker text-white pb-20 overflow-x-hidden">
        <HeartParticles />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,14,43,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(18,14,43,0.3)_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-8 flex flex-col gap-6">
          <GameHeader
            meta={meta}
            personalBest={personalBest}
            topScore={highScores[0]?.score ?? '-'}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-2 items-start">
            {/* Game container */}
            <div className="lg:col-span-3 bg-slate-950 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative min-h-[480px] flex items-center justify-center p-2 sm:p-4 group">
              {/* Fullscreen button — visible on mobile, hover on desktop */}
              <button
                onClick={() => setIsFullscreen(true)}
                className="absolute top-4 right-4 z-50 p-2.5 bg-slate-900/90 hover:bg-arcade-green text-slate-300 hover:text-white rounded-xl backdrop-blur-sm border border-slate-700/50 transition-all shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                title="Enter Fullscreen"
              >
                <Maximize className="w-5 h-5" />
              </button>

              <div className="absolute inset-0 flex items-center justify-center">
                <Suspense fallback={<LoadingScreen message="Inserting coin cartridges..." />}>
                  {renderGame()}
                </Suspense>
              </div>
            </div>

            <LeaderboardSidebar
              highScores={highScores}
              currentUserId={user.uid}
            />
          </div>
        </div>

        <GameOverModal
          showSaveModal={showSaveModal}
          lastScore={lastScore}
          scoreSaved={scoreSaved}
          handleSaveScore={handleSaveScore}
          setShowSaveModal={setShowSaveModal}
        />
      </div>
    </>
  );
};

export default GameRoom;
