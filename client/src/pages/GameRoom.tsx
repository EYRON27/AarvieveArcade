import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { Maximize, Minimize, Pause, Play } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGameStore } from '../store/gameStore';
import HeartParticles from '../components/ui/HeartParticles';
import LoadingScreen from '../components/ui/LoadingScreen';
import { useGameMusic } from '../hooks/useGameMusic';

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
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Music: plays only after game has started and not paused
  useGameMusic(gameId, gameStarted && !isPaused && !showSaveModal);

  // Listen for Esc key to exit fullscreen overlay; P to pause/resume
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
      if (e.key === 'p' || e.key === 'P') {
        if (gameStarted) setIsPaused(p => !p);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen, gameStarted]);

  // Calculate dynamic scale for fullscreen so the game blows up to fill the monitor
  const [fullscreenScale, setFullscreenScale] = useState(1);
  const gameWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFullscreen) {
      setFullscreenScale(1);
      return;
    }

    let resizeObserver: ResizeObserver | null = null;

    const updateScale = () => {
      const child = gameWrapperRef.current?.firstElementChild as HTMLElement;
      if (!child) return;
      
      const w = child.offsetWidth || 400;
      const h = child.offsetHeight || 550;
      
      const scaleW = (window.innerWidth - 40) / w;
      const scaleH = (window.innerHeight - 100) / h;
      const bestScale = Math.min(scaleW, scaleH);
      
      setFullscreenScale(Math.max(1, bestScale));
    };

    // Run once immediately
    updateScale();
    const timeout = setTimeout(updateScale, 100);

    // Watch for window resizes
    window.addEventListener('resize', updateScale);

    // Watch for internal game size changes (like Sudoku rendering its numpad)
    if (gameWrapperRef.current && gameWrapperRef.current.firstElementChild) {
      resizeObserver = new ResizeObserver(() => {
        updateScale();
      });
      resizeObserver.observe(gameWrapperRef.current.firstElementChild);
    }

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateScale);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [isFullscreen, gameId]);

  useEffect(() => {
    setScoreSaved(false);
    setLastScore(null);
    setShowSaveModal(false);
    setIsPaused(false);
    setGameStarted(false);
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
    setIsPaused(false);
    setGameStarted(false);
  };

  const handleGameStart = () => {
    setIsPaused(false);
    setGameStarted(true);
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
      case 'flappyBird':        return <FlappyBird onComplete={handleGameComplete} onStart={handleGameStart} isPaused={isPaused} />;
      case 'snake':             return <SnakeGame onComplete={handleGameComplete} onStart={handleGameStart} isPaused={isPaused} />;
      case 'ticTacToe':         return <TicTacToe onComplete={handleGameComplete} onStart={handleGameStart} isPaused={isPaused} />;
      case 'memoryGame':        return <MemoryGame onComplete={handleGameComplete} onStart={handleGameStart} isPaused={isPaused} />;
      case 'puzzle2048':        return <Puzzle2048 onComplete={handleGameComplete} onStart={handleGameStart} isPaused={isPaused} />;
      case 'sudoku':            return <Sudoku onComplete={handleGameComplete} onStart={handleGameStart} isPaused={isPaused} />;
      case 'neonSequence':      return <NeonSequence onComplete={handleGameComplete} onStart={handleGameStart} isPaused={isPaused} />;
      case 'spaceDodger':       return <SpaceDodger onComplete={handleGameComplete} onStart={handleGameStart} isPaused={isPaused} />;
      case 'brickBreaker':      return <BrickBreaker onComplete={handleGameComplete} onStart={handleGameStart} isPaused={isPaused} />;
      case 'whackABug':         return <WhackABug onComplete={handleGameComplete} onStart={handleGameStart} isPaused={isPaused} />;
      case 'reactionGame':      return <ReactionGame onComplete={handleGameComplete} onStart={handleGameStart} isPaused={isPaused} />;
      case 'catchMyHeart':      return <CatchMyHeart onComplete={handleGameComplete} onStart={handleGameStart} isPaused={isPaused} />;
      case 'relationshipTrivia':return <RelationshipTrivia onComplete={handleGameComplete} onStart={handleGameStart} isPaused={isPaused} />;
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
              {/* Fullscreen button */}
              <button
                onClick={() => setIsFullscreen(true)}
                className="absolute top-4 right-4 z-50 p-2.5 bg-slate-900/90 hover:bg-arcade-green text-slate-300 hover:text-white rounded-xl backdrop-blur-sm border border-slate-700/50 transition-all shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                title="Enter Fullscreen"
              >
                <Maximize className="w-5 h-5" />
              </button>

              {/* Pause/Resume button — only show when game has started */}
              {gameStarted && (
                <button
                  onClick={() => setIsPaused(p => !p)}
                  className={`absolute top-4 right-16 z-50 p-2.5 backdrop-blur-sm border rounded-xl transition-all shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 ${
                    isPaused
                      ? 'bg-arcade-green/20 hover:bg-arcade-green text-arcade-green hover:text-white border-arcade-green/50'
                      : 'bg-slate-900/90 hover:bg-amber-500 text-slate-300 hover:text-white border-slate-700/50'
                  }`}
                  title={isPaused ? 'Resume (P)' : 'Pause (P)'}
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </button>
              )}

              {/* Paused overlay */}
              {isPaused && (
                <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 rounded-3xl">
                  <span className="text-5xl">⏸️</span>
                  <h3 className="font-pixel text-sm text-white uppercase tracking-widest">PAUSED</h3>
                  <button
                    onClick={() => setIsPaused(false)}
                    className="flex items-center gap-2 bg-arcade-green hover:bg-emerald-400 text-black font-bold rounded-2xl px-6 py-3 text-sm transition-all"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    RESUME
                  </button>
                </div>
              )}

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
