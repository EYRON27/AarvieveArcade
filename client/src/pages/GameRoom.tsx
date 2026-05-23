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
  snake:              { title: 'Snake',             desc: 'Classic neon snake — grow longer, don\'t crash.', icon: '🐍' },
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

  // Fullscreen support
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      gameContainerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

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
      case 'flappyBird': return <FlappyBird onComplete={handleGameComplete} />;
      case 'snake': return <SnakeGame onComplete={handleGameComplete} />;
      case 'ticTacToe': return <TicTacToe onComplete={handleGameComplete} />;
      case 'memoryGame': return <MemoryGame onComplete={handleGameComplete} />;
      case 'puzzle2048': return <Puzzle2048 onComplete={handleGameComplete} />;
      case 'sudoku': return <Sudoku onComplete={handleGameComplete} />;
      case 'neonSequence': return <NeonSequence onComplete={handleGameComplete} />;
      case 'spaceDodger': return <SpaceDodger onComplete={handleGameComplete} />;
      case 'brickBreaker': return <BrickBreaker onComplete={handleGameComplete} />;
      case 'whackABug': return <WhackABug onComplete={handleGameComplete} />;
      case 'reactionGame': return <ReactionGame onComplete={handleGameComplete} />;
      case 'catchMyHeart': return <CatchMyHeart onComplete={handleGameComplete} />;
      case 'relationshipTrivia': return <RelationshipTrivia onComplete={handleGameComplete} />;
      default: return <div>Game under maintenance</div>;
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-arcade-darker text-white pb-20 overflow-x-hidden">
      <HeartParticles />

      {/* Grid Pattern Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,14,43,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(18,14,43,0.3)_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-8 flex flex-col gap-6">
        
        <GameHeader 
          meta={meta}
          personalBest={personalBest}
          topScore={highScores[0]?.score ?? '-'}
        />

        {/* Dynamic game room display grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-2 items-start">
          
          {/* Active game display container (spans 3) */}
          <div 
            ref={gameContainerRef}
            className={`lg:col-span-3 bg-slate-950 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative flex items-center justify-center group transition-all ${
              isFullscreen
                ? 'w-full h-screen min-h-screen rounded-none border-0 p-0'
                : 'min-h-[480px] p-2 sm:p-4'
            }`}
          >
            {/* Fullscreen Toggle Button — always visible in fullscreen, hover-only otherwise */}
            <button
              onClick={toggleFullscreen}
              className={`absolute top-4 right-4 z-50 p-2.5 bg-slate-900/90 hover:bg-arcade-red text-slate-300 hover:text-white rounded-xl backdrop-blur-sm border border-slate-700/50 transition-all shadow-lg ${
                isFullscreen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'
              }`}
              title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>

            {/* Game wrapper — stretches to fill all space in fullscreen */}
            <div className={isFullscreen ? 'w-full h-full flex items-center justify-center' : 'w-full h-full flex items-center justify-center'}>
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
  );
};

export default GameRoom;
