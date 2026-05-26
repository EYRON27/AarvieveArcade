import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CupShuffleProps {
  onComplete: (score: number) => void;
  onStart?: () => void;
  isPaused?: boolean;
}

type Phase = 'idle' | 'reveal' | 'shuffle' | 'guess' | 'result' | 'gameover';

const NUM_CUPS = 3;
const ROUNDS = 8;

// Swap two positions in an array immutably
function swapPositions(arr: number[], a: number, b: number): number[] {
  const next = [...arr];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

// Generate a list of random adjacent swaps
function generateSwaps(count: number): [number, number][] {
  const swaps: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    // pick two distinct indices from 0..NUM_CUPS-1
    const a = Math.floor(Math.random() * NUM_CUPS);
    let b = Math.floor(Math.random() * (NUM_CUPS - 1));
    if (b >= a) b++;
    swaps.push([a, b]);
  }
  return swaps;
}

const CupShuffle: React.FC<CupShuffleProps> = ({ onComplete, onStart, isPaused = false }) => {
  // positions[i] = which visual slot cup i is currently in
  const [positions, setPositions] = useState<number[]>([0, 1, 2]);
  // hiddenCupIndex = which cup (0,1,2) hides the character
  const [hiddenCupIndex, setHiddenCupIndex] = useState<number>(0);

  const [phase, setPhase] = useState<Phase>('idle');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [liftedCup, setLiftedCup] = useState<number | null>(null); // cup index that is lifted

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swapQueueRef = useRef<[number, number][]>([]);
  const swapIndexRef = useRef(0);
  const positionsRef = useRef(positions);

  // keep ref in sync
  useEffect(() => { positionsRef.current = positions; }, [positions]);

  const clear = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  // ── Start a new game ─────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    clear();
    const hidden = Math.floor(Math.random() * NUM_CUPS);
    setPositions([0, 1, 2]);
    positionsRef.current = [0, 1, 2];
    setHiddenCupIndex(hidden);
    setRound(1);
    setScore(0);
    setLastCorrect(null);
    setLiftedCup(null);
    // Reveal phase: lift the cup to show the character
    setPhase('reveal');
    onStart?.();
  }, [onStart]);

  // ── Begin shuffling after reveal ─────────────────────────────────────────────
  const startShuffle = useCallback((currentRound: number) => {
    const numSwaps = 4 + currentRound * 2; // gets harder each round
    const swaps = generateSwaps(numSwaps);
    swapQueueRef.current = swaps;
    swapIndexRef.current = 0;
    setPhase('shuffle');
  }, []);

  // ── Execute swaps one by one ──────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'shuffle' || isPaused) return;

    const doNextSwap = () => {
      if (swapIndexRef.current >= swapQueueRef.current.length) {
        setPhase('guess');
        return;
      }
      const [a, b] = swapQueueRef.current[swapIndexRef.current];
      swapIndexRef.current++;
      setPositions(prev => swapPositions(prev, a, b));
      const speed = Math.max(200, 520 - round * 40); // faster each round
      timeoutRef.current = setTimeout(doNextSwap, speed);
    };

    const speed = Math.max(200, 520 - round * 40);
    timeoutRef.current = setTimeout(doNextSwap, speed);
    return () => clear();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isPaused]);

  // ── Pause handling: stop swaps mid-shuffle ───────────────────────────────────
  useEffect(() => {
    if (isPaused) clear();
  }, [isPaused]);

  // ── Reveal phase: wait then start shuffle ────────────────────────────────────
  useEffect(() => {
    if (phase !== 'reveal') return;
    setLiftedCup(hiddenCupIndex);
    timeoutRef.current = setTimeout(() => {
      setLiftedCup(null);
      timeoutRef.current = setTimeout(() => startShuffle(round), 400);
    }, 1400);
    return () => clear();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, hiddenCupIndex]);

  // ── Handle a guess ───────────────────────────────────────────────────────────
  const handleGuess = (cupIndex: number) => {
    if (phase !== 'guess' || isPaused) return;
    const correct = cupIndex === hiddenCupIndex;
    setLastCorrect(correct);
    setLiftedCup(hiddenCupIndex); // always reveal the correct cup
    if (correct) setScore(s => s + 1);
    setPhase('result');

    const nextRound = round + 1;
    timeoutRef.current = setTimeout(() => {
      setLiftedCup(null);
      if (nextRound > ROUNDS) {
        setPhase('gameover');
      } else {
        // New round: reset positions, pick new hidden cup
        const newHidden = Math.floor(Math.random() * NUM_CUPS);
        setPositions([0, 1, 2]);
        positionsRef.current = [0, 1, 2];
        setHiddenCupIndex(newHidden);
        setRound(nextRound);
        setLastCorrect(null);
        setPhase('reveal');
      }
    }, 1600);
  };

  // ── Bubble up final score ────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'gameover') {
      onComplete(score);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── Compute slot → cup mapping for rendering ─────────────────────────────────
  // positions[cupIndex] = slotIndex
  // slotToCup[slotIndex] = cupIndex
  const slotToCup = positions.reduce<number[]>((acc, slot, cup) => {
    acc[slot] = cup;
    return acc;
  }, new Array(NUM_CUPS).fill(0));

  const isShuffling = phase === 'shuffle';
  const isGuessable = phase === 'guess';

  return (
    <div className="w-full flex flex-col items-center select-none py-4 px-2">

      {/* HUD */}
      <div className="w-full max-w-md flex justify-between items-center mb-6 px-2">
        <div>
          <h2 className="pixel-text text-arcade-blue neon-text tracking-widest text-sm uppercase">
            CUP SHUFFLE
          </h2>
          <span className="text-xs font-bold text-slate-400 block mt-1">
            ROUND: <span className="text-white">{phase === 'idle' ? '-' : round}/{ROUNDS}</span>
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-right">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-0.5">SCORE</span>
          <span className="font-pixel text-xl text-white block leading-none">{score}</span>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative w-full max-w-md">

        {/* Cups area */}
        <div className="relative h-52 flex items-end justify-center mb-2">
          {/* Table surface */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-[#2a1a0e] via-[#3d2510] to-[#2a1a0e] rounded-xl shadow-inner border-t-2 border-[#5a3a20]" />

          {/* Render cups in their current visual slots */}
          {Array.from({ length: NUM_CUPS }).map((_, slotIndex) => {
            const cupIndex = slotToCup[slotIndex];
            const isLifted = liftedCup === cupIndex;
            const isHidingCharacter = cupIndex === hiddenCupIndex;

            // Slot x positions
            const slotX = (slotIndex / (NUM_CUPS - 1)) * 100;

            return (
              <motion.div
                key={cupIndex}
                className="absolute bottom-4 flex flex-col items-center"
                style={{ left: `${slotX}%`, x: '-50%' }}
                animate={{
                  left: `${slotX}%`,
                }}
                transition={{
                  type: 'tween',
                  ease: 'easeInOut',
                  duration: isShuffling ? Math.max(0.18, 0.48 - round * 0.035) : 0.25,
                }}
              >
                {/* The character (only visible when cup is lifted) */}
                <AnimatePresence>
                  {isHidingCharacter && isLifted && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.4, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.4, y: 10 }}
                      className="mb-1 text-4xl z-10 relative"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.8))' }}
                    >
                      🐾
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Cup */}
                <motion.div
                  animate={{ y: isLifted ? -70 : 0 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                  onClick={() => handleGuess(cupIndex)}
                  className={`relative z-20 cursor-pointer transition-transform ${
                    isGuessable ? 'hover:scale-110 active:scale-95' : ''
                  }`}
                  title={isGuessable ? `Guess cup ${slotIndex + 1}` : undefined}
                >
                  {/* Cup SVG-style shape */}
                  <div className="relative">
                    {/* Cup body */}
                    <div
                      className={`w-20 h-24 rounded-b-[2rem] rounded-t-lg relative overflow-hidden shadow-2xl border-2 transition-all ${
                        isGuessable
                          ? 'border-arcade-blue/60 hover:border-arcade-blue bg-gradient-to-b from-[#5b9bd5] via-[#3a78c9] to-[#1e4fa0] hover:from-[#7ab4ef] hover:to-[#2a64d6]'
                          : 'border-[#3a78c9]/40 bg-gradient-to-b from-[#4a8bc4] via-[#2d6ab8] to-[#193f8a]'
                      }`}
                    >
                      {/* Cup shine */}
                      <div className="absolute top-2 left-2 w-3 h-10 bg-white/20 rounded-full blur-sm" />
                      <div className="absolute top-1 left-4 w-1 h-6 bg-white/30 rounded-full" />
                      {/* Cup number */}
                      <div className="absolute bottom-2 w-full flex justify-center">
                        <span className="text-white/40 font-pixel text-xs">{slotIndex + 1}</span>
                      </div>
                    </div>
                    {/* Cup rim */}
                    <div
                      className={`absolute -top-2 left-1/2 -translate-x-1/2 w-24 h-4 rounded-full border-2 shadow-md ${
                        isGuessable
                          ? 'bg-gradient-to-r from-[#6baee8] to-[#4a90d9] border-arcade-blue/60 hover:from-[#88c4f7] hover:to-[#5aa0e9]'
                          : 'bg-gradient-to-r from-[#5a9dd7] to-[#3d84cb] border-[#3a78c9]/40'
                      }`}
                    />
                  </div>

                  {/* Glow when guessable */}
                  {isGuessable && (
                    <motion.div
                      animate={{ opacity: [0.4, 0.9, 0.4] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="absolute inset-0 rounded-b-[2rem] pointer-events-none"
                      style={{ boxShadow: '0 0 18px 4px rgba(59,130,246,0.5)' }}
                    />
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Result feedback */}
        <AnimatePresence>
          {phase === 'result' && lastCorrect !== null && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`text-center py-2 rounded-xl font-bold text-sm uppercase tracking-widest mb-3 ${
                lastCorrect
                  ? 'text-arcade-green bg-arcade-green/10 border border-arcade-green/30'
                  : 'text-arcade-red bg-arcade-red/10 border border-arcade-red/30'
              }`}
            >
              {lastCorrect ? '✅ Correct! +1' : '❌ Wrong!'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase label */}
        {phase === 'shuffle' && (
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="text-center text-xs font-bold text-amber-400 uppercase tracking-widest mt-2"
          >
            🔀 Shuffling…
          </motion.p>
        )}
        {phase === 'guess' && (
          <p className="text-center text-xs font-bold text-arcade-blue uppercase tracking-widest mt-2">
            👆 Pick the cup hiding 🐾 Pou!
          </p>
        )}
        {phase === 'reveal' && (
          <p className="text-center text-xs font-bold text-yellow-400 uppercase tracking-widest mt-2">
            👀 Remember which cup!
          </p>
        )}

        {/* ── IDLE OVERLAY ── */}
        {phase === 'idle' && (
          <div className="absolute inset-0 -top-52 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 z-30">
            <motion.span
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🥤
            </motion.span>
            <h3 className="font-pixel text-[11px] text-arcade-blue text-center uppercase tracking-widest mb-2">
              CUP SHUFFLE
            </h3>
            <p className="text-xs text-slate-400 text-center mb-6 max-w-[220px]">
              Watch where 🐾 Pou hides under the cup, then follow the shuffle and guess correctly!
            </p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 bg-gradient-to-r from-arcade-blue to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white font-bold rounded-2xl px-6 py-4 shadow-lg text-sm select-none transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>START GAME</span>
            </button>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-4">
              {ROUNDS} ROUNDS — GOOD LUCK!
            </p>
          </div>
        )}

        {/* ── GAME OVER OVERLAY ── */}
        {phase === 'gameover' && (
          <div className="absolute inset-0 -top-52 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 z-30">
            <span className="text-5xl mb-3">🏆</span>
            <h3 className="font-pixel text-[11px] text-arcade-blue text-center uppercase tracking-widest mb-1">
              GAME OVER!
            </h3>
            <p className="text-slate-300 font-bold text-xs uppercase tracking-widest mb-1">
              {score} / {ROUNDS} correct
            </p>
            <p className="text-slate-500 text-[10px] mb-6">
              {score === ROUNDS ? '🎉 Perfect score!' : score >= ROUNDS / 2 ? '👏 Nice job!' : '😅 Keep practicing!'}
            </p>
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

export default CupShuffle;
