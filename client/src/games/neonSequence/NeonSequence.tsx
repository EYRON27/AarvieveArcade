import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NeonSequenceProps {
  onComplete: (score: number) => void;
}

const COLORS = [
  { id: 0, color: 'bg-arcade-red',   active: 'bg-red-400 shadow-[0_0_40px_rgba(239,68,68,0.8)]',    soundFreq: 261.63 }, // C4
  { id: 1, color: 'bg-arcade-green', active: 'bg-green-400 shadow-[0_0_40px_rgba(34,197,94,0.8)]',  soundFreq: 329.63 }, // E4
  { id: 2, color: 'bg-arcade-blue',  active: 'bg-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.8)]',   soundFreq: 392.00 }, // G4
  { id: 3, color: 'bg-yellow-500',   active: 'bg-yellow-300 shadow-[0_0_40px_rgba(234,179,8,0.8)]', soundFreq: 523.25 }  // C5
];

const NeonSequence: React.FC<NeonSequenceProps> = ({ onComplete }) => {
  const [gameState, setGameState] = useState<'idle' | 'showing' | 'waiting' | 'gameover'>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [activePad, setActivePad] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio context on first interaction
    const initAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };
    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);

  const playTone = (freq: number) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  const startGame = () => {
    setScore(0);
    setSequence([]);
    nextRound([]);
  };

  const nextRound = (currentSeq: number[]) => {
    const nextColor = Math.floor(Math.random() * 4);
    const newSeq = [...currentSeq, nextColor];
    setSequence(newSeq);
    setPlayerIdx(0);
    setGameState('showing');
    playSequence(newSeq);
  };

  const playSequence = async (seq: number[]) => {
    // Wait a bit before starting the sequence
    await new Promise(r => setTimeout(r, 800));
    
    for (let i = 0; i < seq.length; i++) {
      const colorId = seq[i];
      setActivePad(colorId);
      playTone(COLORS[colorId].soundFreq);
      
      // Speed up sequence as it gets longer
      const delay = Math.max(200, 600 - (seq.length * 20));
      await new Promise(r => setTimeout(r, delay));
      
      setActivePad(null);
      await new Promise(r => setTimeout(r, delay / 2));
    }
    
    setGameState('waiting');
  };

  const handlePadClick = (colorId: number) => {
    if (gameState !== 'waiting') return;

    // Visual/Audio feedback
    setActivePad(colorId);
    playTone(COLORS[colorId].soundFreq);
    setTimeout(() => setActivePad(null), 200);

    // Check correctness
    if (colorId === sequence[playerIdx]) {
      // Correct pad
      const nextIdx = playerIdx + 1;
      setPlayerIdx(nextIdx);

      if (nextIdx === sequence.length) {
        // Round complete
        setScore(sequence.length);
        setGameState('showing');
        nextRound(sequence);
      }
    } else {
      // Wrong pad -> Game Over
      playTone(100); // Error sound
      setGameState('gameover');
      onComplete(score);
    }
  };

  return (
    <div className="w-full flex flex-col items-center select-none py-8">
      
      {/* HUD Header */}
      <div className="w-full max-w-sm flex justify-between items-center mb-8 px-4">
        <h2 className="pixel-text text-arcade-blue neon-text-blue tracking-widest text-sm">
          NEON SEQUENCE
        </h2>
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-0.5">SCORE</span>
          <span className="font-pixel text-xl text-white block leading-none">{score}</span>
        </div>
      </div>

      {/* Main Game Board */}
      <div className="relative w-72 h-72 rounded-full border-8 border-slate-900 bg-slate-950 shadow-2xl p-2 grid grid-cols-2 grid-rows-2 gap-2 overflow-hidden">
        
        {/* Center Divider / HUD */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-slate-950 rounded-full border-8 border-slate-900 z-10 flex items-center justify-center">
          {gameState === 'idle' && <span className="text-2xl">🎮</span>}
          {gameState === 'showing' && <span className="text-xl animate-pulse">👁️</span>}
          {gameState === 'waiting' && <span className="text-xl animate-bounce">👆</span>}
          {gameState === 'gameover' && <span className="text-2xl">💥</span>}
        </div>

        {/* 4 Colored Pads */}
        {COLORS.map((c, index) => {
          let borderRadius = '';
          if (index === 0) borderRadius = 'rounded-tl-full';
          if (index === 1) borderRadius = 'rounded-tr-full';
          if (index === 2) borderRadius = 'rounded-bl-full';
          if (index === 3) borderRadius = 'rounded-br-full';

          const isActive = activePad === c.id;

          return (
            <div
              key={c.id}
              onPointerDown={() => handlePadClick(c.id)}
              className={`w-full h-full cursor-pointer transition-all duration-100 ${borderRadius} ${
                isActive ? c.active : `${c.color} opacity-40 hover:opacity-60`
              }`}
            />
          );
        })}

      </div>

      {/* Overlays */}
      <AnimatePresence>
        {gameState === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-12 flex flex-col items-center"
          >
            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-4">Memorize the pattern</p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 bg-arcade-blue hover:bg-arcade-blue-hover text-white font-bold rounded-xl px-8 py-4 shadow-lg transition-all"
            >
              <Play className="w-4 h-4 fill-white" /> START GAME
            </button>
          </motion.div>
        )}

        {gameState === 'gameover' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-12 flex flex-col items-center"
          >
            <h3 className="font-pixel text-[11px] text-red-400 uppercase tracking-widest mb-4">
              SEQUENCE BROKEN
            </h3>
            <button
              onClick={startGame}
              className="flex items-center gap-2 bg-slate-900 border border-slate-700 hover:bg-white hover:text-black text-white font-bold rounded-xl px-8 py-3.5 transition-all text-xs tracking-wider"
            >
              <RotateCcw className="w-4 h-4" /> TRY AGAIN
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default NeonSequence;
