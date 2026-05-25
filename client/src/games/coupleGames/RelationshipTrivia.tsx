import React, { useState } from 'react';
import { Play, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';

interface ArcadeTriviaProps {
  onComplete: (score: number) => void;
  onStart?: () => void;
  isPaused?: boolean;
}

import { TRIVIA_QUESTIONS, type Question } from './TriviaQuestions';

const ArcadeTrivia: React.FC<ArcadeTriviaProps> = ({ onComplete, onStart, isPaused = false }) => {
  const [gameState, setGameState]   = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore]           = useState(0);
  const [selectedOpt, setSelected]  = useState<number | null>(null);
  const [isLocked, setIsLocked]     = useState(false);

  const startQuiz = () => {
    // Pick 5 random questions from the 100 question pool
    const shuffled = [...TRIVIA_QUESTIONS].sort(() => 0.5 - Math.random());
    setSessionQuestions(shuffled.slice(0, 5));

    setCurrentIdx(0); setScore(0); setSelected(null); setIsLocked(false);
    setGameState('playing');
    onStart?.();
  };

  const handleOption = (idx: number) => {
    if (isLocked || isPaused) return;
    setSelected(idx); setIsLocked(true);
    const q = sessionQuestions[currentIdx];
    let next = score;
    if (idx === q.answerIdx) { next += 20; setScore(next); }
    setTimeout(() => {
      if (currentIdx + 1 < sessionQuestions.length) {
        setCurrentIdx(p => p + 1); setSelected(null); setIsLocked(false);
      } else {
        setGameState('gameover'); onComplete(next);
      }
    }, 1400);
  };

  const q = sessionQuestions[currentIdx];

  return (
    <div className="w-full max-w-md flex flex-col items-center select-none py-4 px-3">

      {/* ── IDLE ── */}
      {gameState === 'idle' && (
        <div className="flex flex-col items-center text-center py-10 w-full gap-4">
          <span className="text-7xl">🎯</span>
          <h3 className="pixel-text text-arcade-blue neon-text-blue tracking-widest uppercase">
            ARCADE TRIVIA
          </h3>
          <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
            Test your gaming knowledge! 5 questions — 20 pts each. Aim for a perfect 100.
          </p>
          <button
            onClick={startQuiz}
            className="flex items-center gap-2 bg-arcade-blue hover:bg-arcade-blue-hover text-white font-bold rounded-xl px-6 py-3.5 text-sm transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" /> START QUIZ
          </button>
        </div>
      )}

      {/* ── PLAYING ── */}
      {gameState === 'playing' && q && (
        <div className="flex flex-col gap-4 w-full">
          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-arcade-blue rounded-full transition-all duration-500"
                style={{ width: `${((currentIdx) / TRIVIA_QUESTIONS.length) * 100}%` }}
              />
            </div>
            <span className="pixel-text text-slate-500 text-[10px] shrink-0">
              {currentIdx + 1}/{sessionQuestions.length}
            </span>
            <span className="pixel-text text-arcade-green font-bold text-[10px] shrink-0">{score} pts</span>
          </div>

          {/* Question */}
          <div className="bg-arcade-darker border border-white/8 rounded-xl p-5">
            <h3 className="text-base font-bold text-white leading-relaxed">{q.question}</h3>
            <p className="text-[10px] text-slate-600 mt-2 uppercase tracking-wider">Hint: {q.hint}</p>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-2.5">
            {q.options.map((opt, i) => {
              const isSelected = selectedOpt === i;
              const isCorrect  = q.answerIdx === i;
              let cls = 'bg-arcade-dark border-white/8 hover:border-white/20 text-slate-200';
              if (selectedOpt !== null) {
                if (isCorrect)          cls = 'bg-arcade-green/10 border-arcade-green text-arcade-green';
                else if (isSelected)    cls = 'bg-arcade-red/10   border-arcade-red   text-arcade-red opacity-80';
                else                    cls = 'bg-arcade-darker   border-white/4      text-slate-600  opacity-50';
              }
              return (
                <button
                  key={i}
                  onClick={() => handleOption(i)}
                  disabled={isLocked}
                  className={`w-full flex items-center justify-between border-2 rounded-xl py-3 px-4 font-semibold text-sm transition-all text-left ${cls} ${!isLocked && 'cursor-pointer'}`}
                >
                  <span>{opt}</span>
                  {selectedOpt !== null && isCorrect  && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  {selectedOpt !== null && isSelected && !isCorrect && <XCircle className="w-4 h-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── GAME OVER ── */}
      {gameState === 'gameover' && (
        <div className="flex flex-col items-center text-center py-8 w-full gap-4">
          <span className="text-6xl">{score === 100 ? '🏆' : score >= 60 ? '🥈' : '💡'}</span>
          <h3 className="pixel-text text-arcade-blue neon-text-blue uppercase tracking-widest">
            QUIZ COMPLETE
          </h3>
          <div className="bg-arcade-darker border border-white/8 rounded-xl py-6 px-10 my-2">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Final Score</p>
            <p className="text-5xl font-black font-pixel text-white">{score}<span className="text-slate-600 text-2xl">/100</span></p>
          </div>
          <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
            {score === 100 ? '🔥 Perfect score! You are an arcade legend.' :
             score >= 60  ? '👍 Solid performance. Keep playing to master the rest!' :
             '📚 Keep practicing — the leaderboard awaits!'}
          </p>
          <button
            onClick={startQuiz}
            className="flex items-center gap-1.5 border border-white/10 hover:border-arcade-blue/50 text-slate-400 hover:text-white font-bold rounded-xl px-6 py-3 text-xs tracking-widest uppercase transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> PLAY AGAIN
          </button>
        </div>
      )}

    </div>
  );
};

export default ArcadeTrivia;
