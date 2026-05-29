import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';

interface MemoryGameProps {
  onComplete: (score: number) => void;
  onStart?: () => void;
  isPaused?: boolean;
}

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MEMORY_SYMBOLS = ['💖', '🧁', '🍿', '🗼', '🧸', '🌹'];

const MemoryGame: React.FC<MemoryGameProps> = ({ onComplete, onStart, isPaused = false }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'level-complete' | 'gameover'>('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timerRef = useRef<any>(null);

  // Initialize cards
  const initializeCards = (isNextLevel: boolean = false) => {
    const deckSymbols = [...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS];
    const shuffled = deckSymbols
      .map((sym, idx) => ({ id: idx, symbol: sym, isFlipped: false, isMatched: false }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setSelectedCards([]);
    
    if (isNextLevel) {
      setLevel(l => l + 1);
      setTimeLeft(Math.max(15, 60 - (level * 5))); // Gets 5 seconds faster each level, down to 15s
    } else {
      setLevel(1);
      setScore(0);
      setTimeLeft(60);
    }
    
    setGameState('playing');
    onStart?.();
  };

  // Countdown timer
  useEffect(() => {
    if (gameState === 'playing' && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setGameState('gameover');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, isPaused]);

  // Check matching rules
  useEffect(() => {
    if (selectedCards.length !== 2) return;

    const [firstIdx, secondIdx] = selectedCards;
    const firstCard = cards[firstIdx];
    const secondCard = cards[secondIdx];

    let timeoutId: ReturnType<typeof setTimeout>;

    if (firstCard.symbol === secondCard.symbol) {
      // It's a match!
      timeoutId = setTimeout(() => {
        setCards(prev => {
          const next = [...prev];
          next[firstIdx] = { ...next[firstIdx], isMatched: true };
          next[secondIdx] = { ...next[secondIdx], isMatched: true };

          // Check if all matched
          if (next.every(c => c.isMatched)) {
            setGameState('level-complete');
            setScore(s => s + (level * 100) + (timeLeft * 10));
          }
          return next;
        });
        setSelectedCards([]);
      }, 500);
    } else {
      // Flip back
      timeoutId = setTimeout(() => {
        setCards(prev => {
          const next = [...prev];
          next[firstIdx] = { ...next[firstIdx], isFlipped: false };
          next[secondIdx] = { ...next[secondIdx], isFlipped: false };
          return next;
        });
        setSelectedCards([]);
      }, 800);
    }

    return () => clearTimeout(timeoutId);
  }, [selectedCards, cards]);

  useEffect(() => {
    if (gameState === 'gameover') {
      onComplete(score);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  const handleCardClick = (idx: number) => {
    if (isPaused || cards[idx].isFlipped || cards[idx].isMatched || selectedCards.length >= 2 || gameState !== 'playing') return;

    setCards(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], isFlipped: true };
      return next;
    });

    setSelectedCards(prev => [...prev, idx]);
  };

  return (
    <div className="w-full flex flex-col items-center select-none py-4 px-2">

      {gameState === 'idle' && (
        <div className="flex flex-col items-center justify-center text-center py-10">
          <span className="text-7xl mb-4 animate-float">🧠</span>
          <h3 className="font-pixel text-[11px] text-arcade-green neon-text-yellow tracking-widest uppercase mb-6">
            COUPLE MEMORY DECK
          </h3>
          <button
            onClick={() => initializeCards(false)}
            className="flex items-center gap-2 bg-gradient-to-r from-arcade-green to-arcade-red text-slate-900 font-bold rounded-2xl px-6 py-4 shadow-lg text-sm select-none cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-900" />
            <span>START MATCHING</span>
          </button>
        </div>
      )}

      {gameState !== 'idle' && (
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Stats bar — wraps into 2×2 grid on small screens */}
          <div className="grid grid-cols-2 sm:flex sm:flex-row sm:items-center sm:justify-between w-full bg-slate-900/60 border border-slate-800 rounded-2xl py-2.5 px-4 gap-2 text-sm font-bold text-slate-300">
            <span className="text-arcade-red text-center sm:text-left">Level {level}</span>
            <span className="text-center sm:text-left">Pairs: {cards.filter(c => c.isMatched).length / 2} / 6</span>
            <span className="text-center sm:text-left">Score: <span className="text-arcade-yellow">{score}</span></span>
            <span className={`font-mono text-center sm:text-left ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-arcade-green'}`}>
              Time: {timeLeft}s
            </span>
          </div>

          {/* Cards Grid — fills full width, square cells */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3.5 bg-slate-900/40 border border-slate-800 rounded-3xl p-3 sm:p-4 w-full">
            {cards.map((card, idx) => {
              const showSymbol = card.isFlipped || card.isMatched;

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(idx)}
                  className="relative w-full cursor-pointer"
                  style={{ perspective: '1000px', aspectRatio: '1 / 1' }}
                >
                  <motion.div
                    animate={{ rotateY: showSymbol ? 180 : 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="relative w-full h-full rounded-2xl shadow-lg"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Front of card (Question Mark) */}
                    <div 
                      className="absolute inset-0 w-full h-full rounded-2xl flex items-center justify-center"
                      style={{
                        backgroundColor: '#1e1b4b',
                        border: '2px solid rgba(253, 230, 138, 0.15)',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
                      }}
                    >
                      <span style={{ fontSize: 'clamp(1.25rem, 6vw, 2rem)' }} className="text-arcade-green/60">❓</span>
                    </div>

                    {/* Back of card (Symbol) */}
                    <div 
                      className="absolute inset-0 w-full h-full rounded-2xl flex items-center justify-center"
                      style={{
                        backgroundColor: '#0d0a1e',
                        border: '2px solid rgba(253, 230, 138, 0.5)',
                        transform: 'rotateY(180deg)',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
                      }}
                    >
                      <span style={{ fontSize: 'clamp(1.5rem, 7vw, 2.5rem)' }}>{card.symbol}</span>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Level Complete overlay */}
          {gameState === 'level-complete' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-30 rounded-3xl">
              <span className="text-5xl mb-2">🎉</span>
              <h3 className="font-pixel text-[11px] text-arcade-green text-center uppercase tracking-widest mb-2">
                LEVEL {level} COMPLETE!
              </h3>
              <p className="text-slate-300 font-bold text-xs uppercase tracking-widest mb-6">Current Score: {score}</p>
              
              <button
                onClick={() => initializeCards(true)}
                className="flex items-center gap-1.5 mt-2 bg-gradient-to-r from-arcade-green to-arcade-blue text-slate-900 font-bold rounded-2xl px-6 py-3.5 text-xs tracking-wider uppercase transition-all shadow-lg hover:scale-105 select-none cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-900" />
                <span>NEXT LEVEL</span>
              </button>
            </div>
          )}

          {/* Reset button if gameover */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-30 rounded-3xl">
              <span className="text-5xl mb-2">⏱️</span>
              <h3 className="font-pixel text-[11px] text-arcade-red text-center uppercase tracking-widest mb-2">
                TIME'S UP!
              </h3>
              <p className="text-slate-300 font-bold text-xs uppercase tracking-widest mb-6">Final Score: {score}</p>
              <button
                onClick={() => initializeCards(false)}
                className="flex items-center gap-1.5 mt-2 bg-slate-900 hover:bg-white hover:text-black text-white border-2 border-slate-800 rounded-2xl px-6 py-3.5 font-bold text-xs tracking-wider uppercase transition-all shadow-lg select-none cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>TRY AGAIN</span>
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default MemoryGame;
