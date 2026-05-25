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
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [seconds, setSeconds] = useState(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timerRef = useRef<any>(null);

  // Initialize cards
  const initializeCards = () => {
    // Duplicate symbols to create pairs
    const deckSymbols = [...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS];
    // Shuffle deck
    const shuffled = deckSymbols
      .map((sym, idx) => ({ id: idx, symbol: sym, isFlipped: false, isMatched: false }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setSelectedCards([]);
    setSeconds(0);
    setGameState('playing');
    onStart?.();
  };

  // Stopwatch timer
  useEffect(() => {
    if (gameState === 'playing' && !isPaused) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
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
            setGameState('gameover');
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

  // Trigger onComplete when gameover is reached
  useEffect(() => {
    if (gameState === 'gameover') {
      onComplete(seconds);
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
    <div className="w-full max-w-sm flex flex-col items-center select-none py-4 px-2">

      {gameState === 'idle' && (
        <div className="flex flex-col items-center justify-center text-center py-10">
          <span className="text-7xl mb-4 animate-float">🧠</span>
          <h3 className="font-pixel text-[11px] text-arcade-green neon-text-yellow tracking-widest uppercase mb-6">
            COUPLE MEMORY DECK
          </h3>
          <button
            onClick={initializeCards}
            className="flex items-center gap-2 bg-gradient-to-r from-arcade-green to-arcade-red text-slate-900 font-bold rounded-2xl px-6 py-4 shadow-lg text-sm select-none cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-900" />
            <span>START MATCHING</span>
          </button>
        </div>
      )}

      {gameState !== 'idle' && (
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Timer dashboard */}
          <div className="flex items-center justify-between w-full bg-slate-900/60 border border-slate-800 rounded-2xl py-2 px-5 text-sm font-bold text-slate-300">
            <span>Pairs Completed: {cards.filter(c => c.isMatched).length / 2} / 6</span>
            <span className="font-mono text-arcade-green">Stopwatch: {seconds}s</span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-3 gap-3.5 bg-slate-900/40 border border-slate-800 rounded-3xl p-4.5 w-full aspect-square">
            {cards.map((card, idx) => {
              const showSymbol = card.isFlipped || card.isMatched;

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(idx)}
                  className="relative w-full aspect-square cursor-pointer preserve-3d"
                  style={{ perspective: '1000px' }}
                >
                  <motion.div
                    animate={{ rotateY: showSymbol ? 180 : 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="relative w-full h-full rounded-2xl preserve-3d shadow-lg"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Front of card (Question Mark) */}
                    <div 
                      className="absolute inset-0 w-full h-full rounded-2xl flex items-center justify-center backface-hidden"
                      style={{
                        backgroundColor: '#1e1b4b',
                        border: '2px solid rgba(253, 230, 138, 0.15)',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
                      }}
                    >
                      <span className="text-3xl text-arcade-green/60">❓</span>
                    </div>

                    {/* Back of card (Symbol) */}
                    <div 
                      className="absolute inset-0 w-full h-full rounded-2xl flex items-center justify-center backface-hidden"
                      style={{
                        backgroundColor: '#0d0a1e',
                        border: '2px solid rgba(253, 230, 138, 0.5)',
                        transform: 'rotateY(180deg)',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
                      }}
                    >
                      <span className="text-4xl">{card.symbol}</span>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Reset button if gameover */}
          {gameState === 'gameover' && (
            <button
              onClick={initializeCards}
              className="flex items-center gap-1.5 mt-2 bg-slate-900 hover:bg-white hover:text-black text-white border-2 border-slate-800 rounded-2xl px-6 py-3.5 font-bold text-xs tracking-wider uppercase transition-all select-none cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESTART DECK</span>
            </button>
          )}
        </div>
      )}

    </div>
  );
};

export default MemoryGame;

