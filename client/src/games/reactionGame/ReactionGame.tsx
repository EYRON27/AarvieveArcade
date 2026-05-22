import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw } from 'lucide-react';

interface ReactionGameProps {
  onComplete: (score: number) => void;
}

type ReactionState = 'idle' | 'waiting' | 'ready' | 'result' | 'early';

const ReactionGame: React.FC<ReactionGameProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<ReactionState>('idle');
  const [ms, setMs] = useState<number | null>(null);
  
  const timeoutRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  const startTest = () => {
    setStage('waiting');
    setMs(null);

    // Random delay between 1.8s and 4.5s
    const delay = Math.random() * 2700 + 1800;
    timeoutRef.current = setTimeout(() => {
      setStage('ready');
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handleBoxClick = () => {
    if (stage === 'waiting') {
      // Clicked too early!
      clearTimeout(timeoutRef.current);
      setStage('early');
    } else if (stage === 'ready') {
      // Clicked successfully! Calculate reflex time
      const endTime = Date.now();
      const reactionTime = endTime - startTimeRef.current;
      setMs(reactionTime);
      setStage('result');
      onComplete(reactionTime);
    }
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className="w-full max-w-sm flex flex-col items-center select-none py-4 px-2">
      
      {stage === 'idle' && (
        <div className="flex flex-col items-center justify-center text-center py-10">
          <span className="text-7xl mb-4 animate-float">⚡</span>
          <h3 className="font-pixel text-[11px] text-arcade-green neon-text-green tracking-widest uppercase mb-6">
            REACTION MILLISECOND CLICKER
          </h3>
          <button
            onClick={startTest}
            className="flex items-center gap-2 bg-gradient-to-r from-arcade-green to-arcade-blue text-white font-bold rounded-2xl px-6 py-4 shadow-lg text-sm select-none cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>TEST REFLEXES</span>
          </button>
        </div>
      )}

      {stage !== 'idle' && (
        <div className="flex flex-col items-center gap-5 w-full">
          {/* Reaction Testing Box panel */}
          <div
            onClick={handleBoxClick}
            className={`w-full aspect-[4/3] rounded-3xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-150 ${
              stage === 'waiting' ? 'bg-red-500/10 border-red-500/40 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]' :
              stage === 'ready' ? 'bg-emerald-500/25 border-emerald-500/60 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse' :
              stage === 'early' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
              'bg-slate-900/60 border-slate-800 text-slate-200'
            }`}
          >
            {stage === 'waiting' && (
              <div className="text-center p-4">
                <span className="text-5xl block animate-pulse">🔴</span>
                <p className="font-pixel text-[10px] tracking-widest uppercase mt-4">HOLD ON...</p>
                <p className="text-xs text-slate-500 font-bold uppercase mt-2">WAIT FOR THE SCREEN TO FLASH GREEN</p>
              </div>
            )}

            {stage === 'ready' && (
              <div className="text-center p-4">
                <span className="text-6xl block">🟢</span>
                <p className="font-pixel text-xs tracking-widest uppercase mt-4 neon-text-green font-black">CLICK NOW!</p>
              </div>
            )}

            {stage === 'early' && (
              <div className="text-center p-4">
                <span className="text-5xl block">⚠️</span>
                <p className="font-pixel text-[10px] text-orange-400 tracking-widest uppercase mt-4">TOO FAST!</p>
                <p className="text-xs text-slate-400 font-bold uppercase mt-2">YOU CLICKED BEFORE GREEN. RETRY.</p>
              </div>
            )}

            {stage === 'result' && ms !== null && (
              <div className="text-center p-4">
                <span className="text-5xl block">⚡</span>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-3">RESPONSE SPEED</p>
                <h4 className="text-5xl font-black text-white font-mono tracking-wider my-2.5 neon-text-green">{ms}ms</h4>
                <p className={`text-xs font-bold uppercase ${
                  ms < 200 ? 'text-green-400' :
                  ms < 280 ? 'text-arcade-green' :
                  ms < 400 ? 'text-amber-400' :
                  'text-slate-400'
                }`}>
                  {ms < 200 ? '⭐ IMPRESSIVE DEITY SPEED!' :
                   ms < 280 ? '🎮 EXCELLENT GAMER REFLEXES' :
                   ms < 400 ? '👍 DECENT SPEED' :
                   '🐢 TURTLE SPEED! RETRY?'}
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {(stage === 'result' || stage === 'early') && (
            <button
              onClick={startTest}
              className="flex items-center gap-1.5 mt-1 bg-slate-900 hover:bg-white hover:text-black text-white border-2 border-slate-800 rounded-2xl px-6 py-3.5 font-bold text-xs tracking-wider uppercase transition-all select-none cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>TEST AGAIN</span>
            </button>
          )}
        </div>
      )}

    </div>
  );
};

export default ReactionGame;

