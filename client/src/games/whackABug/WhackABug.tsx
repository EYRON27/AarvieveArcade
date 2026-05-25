import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WhackABugProps {
  onComplete: (score: number) => void;
  onStart?: () => void;
  isPaused?: boolean;
}

const WhackABug: React.FC<WhackABugProps> = ({ onComplete, onStart, isPaused = false }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [activeBugId, setActiveBugId] = useState<number | null>(null);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bugTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setActiveBugId(null);
    setGameState('playing');
    onStart?.();
  };

  const spawnBug = useCallback(function spawn() {
    // 9 holes (0 to 8)
    // eslint-disable-next-line react-hooks/purity
    const newBugId = Math.floor(Math.random() * 9);
    setActiveBugId(newBugId);

    // Random time between 500ms and 1000ms
    // eslint-disable-next-line react-hooks/purity
    const timeToDisappear = Math.random() * 500 + 500;
    
    if (bugTimerRef.current) clearTimeout(bugTimerRef.current);
    
    bugTimerRef.current = setTimeout(() => {
      setActiveBugId(null);
      // Wait a tiny bit before spawning the next one
      // eslint-disable-next-line react-hooks/purity
      setTimeout(spawn, Math.random() * 300 + 200);
    }, timeToDisappear);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && !isPaused) {
      spawnBug();
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('gameover');
            if (bugTimerRef.current) clearTimeout(bugTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (bugTimerRef.current) clearTimeout(bugTimerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (bugTimerRef.current) clearTimeout(bugTimerRef.current);
    };
  }, [gameState, isPaused]);

  // When gameover, bubble up the score
  useEffect(() => {
    if (gameState === 'gameover') {
      onComplete(score);
    }
  }, [gameState, score, onComplete]);

  const handleWhack = (id: number) => {
    if (gameState !== 'playing' || isPaused) return;
    if (activeBugId === id) {
      setScore(s => s + 1);
      setActiveBugId(null);
      if (bugTimerRef.current) clearTimeout(bugTimerRef.current);
      // Immediately spawn next bug to keep it fast-paced
      setTimeout(spawnBug, 200);
    }
  };

  return (
    <div className="w-full flex flex-col items-center select-none py-4">
      
      {/* HUD Header */}
      <div className="w-full max-w-sm flex justify-between items-center mb-6 px-4">
        <div>
          <h2 className="pixel-text text-arcade-green neon-text-green tracking-widest text-sm uppercase">
            WHACK-A-BUG
          </h2>
          <span className="text-xs font-bold text-slate-400 block mt-1">
            TIME: <span className={timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}>{timeLeft}s</span>
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-0.5">SCORE</span>
          <span className="font-pixel text-xl text-white block leading-none">{score}</span>
        </div>
      </div>

      {/* Main Game Board */}
      <div className="relative w-full max-w-sm aspect-square border-4 border-slate-800 rounded-3xl bg-[#4d2e1c] shadow-inner p-4 grid grid-cols-3 grid-rows-3 gap-3">
        
        {/* The 9 Holes */}
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="relative w-full h-full flex flex-col items-center justify-end overflow-hidden">
            {/* The Hole Dirt */}
            <div className="absolute bottom-2 w-[80%] h-12 bg-[#2d1b11] rounded-[100%] shadow-[inset_0_-5px_15px_rgba(0,0,0,0.8)] z-0" />
            
            {/* The Bug */}
            <AnimatePresence>
              {activeBugId === i && (
                <motion.div
                  initial={{ y: 50 }}
                  animate={{ y: -10 }}
                  exit={{ y: 50 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onPointerDown={() => handleWhack(i)}
                  className="relative z-10 w-16 h-16 cursor-crosshair touch-manipulation pb-4"
                >
                  <div className="w-full h-full bg-arcade-green rounded-full shadow-lg border-4 border-[#14532d] flex items-center justify-center relative">
                    <span className="text-2xl mb-1">🐛</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grass Overlay on bottom to hide bug sliding down */}
            <div className="absolute bottom-0 w-full h-4 bg-[#14532d] rounded-b-xl z-20" />
          </div>
        ))}

        {/* Start Overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4 z-30">
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-6xl mb-4">🔨</motion.span>
            <h3 className="font-pixel text-[11px] text-arcade-green text-center uppercase tracking-widest mb-6">
              SMASH THE BUGS
            </h3>
            <button
              onClick={startGame}
              className="flex items-center gap-2 bg-gradient-to-r from-arcade-green to-emerald-600 hover:from-emerald-500 hover:to-green-400 text-white font-bold rounded-2xl px-6 py-4 shadow-lg text-sm select-none transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>START ROUND</span>
            </button>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-6">
              YOU HAVE 30 SECONDS
            </p>
          </div>
        )}

        {/* Gameover Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4 z-30">
            <span className="text-5xl mb-2">⏱️</span>
            <h3 className="font-pixel text-[11px] text-red-400 text-center uppercase tracking-widest mb-2">
              TIME'S UP!
            </h3>
            <p className="text-slate-300 font-bold text-xs uppercase tracking-widest mb-6">BUGS SQUASHED: {score}</p>
            <button
              onClick={startGame}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-white hover:text-black text-white border-2 border-slate-800 rounded-2xl px-6 py-3.5 font-bold text-xs tracking-wider uppercase transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhackABug;
