import React, { useState } from 'react';
import { Play, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';

interface RelationshipTriviaProps {
  onComplete: (score: number) => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  answerIdx: number;
  hint: string;
}

const TRIVIA_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Where did Player 1 & Player 2 go on their very first official date?",
    options: ["Cozy local coffee shop", "Fine dining rooftop dinner", "Walking on beach sunset", "Retro gaming arcade hub"],
    answerIdx: 0,
    hint: "Think warm cups, sweet laughs, and hours of conversations."
  },
  {
    id: 2,
    question: "Who is traditionally most likely to say 'I love you' first in our co-op story?",
    options: ["Player 1 (Aaron)", "Player 2 (Genevieve)", "Both at the exact same millisecond", "Cupid bot intervened"],
    answerIdx: 0,
    hint: "Aaron was completely smitten from day one!"
  },
  {
    id: 3,
    question: "What is our absolute favorite cozy couple activity to do on rainy evenings?",
    options: ["Cooking gourmet dishes", "Snuggling under blankets & watching anime", "Competing in retro games", "Late-night highway drive"],
    answerIdx: 1,
    hint: "Warm blankets, popcorn, and popcorn anime."
  },
  {
    id: 4,
    question: "Which of the following is Genevieve's absolute dream vacation destination together?",
    options: ["Neon lights of Tokyo, Japan", "Romantic cafes of Paris, France", "Sunsets of Bali, Indonesia", "Historical streets of Rome, Italy"],
    answerIdx: 0,
    hint: "Think cherry blossoms, arcade culture, and starry walks."
  },
  {
    id: 5,
    question: "What is the secret ingredient that makes our relationship high score continue to grow?",
    options: ["Trust and infinite laughter", "Playing games all day", "Competitive arcade fights", "Giving giant teddy bears"],
    answerIdx: 0,
    hint: "It starts with T and ends with Laughter!"
  }
];

const RelationshipTrivia: React.FC<RelationshipTriviaProps> = ({ onComplete }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const startQuiz = () => {
    setCurrentIdx(0);
    setScore(0);
    setSelectedOpt(null);
    setIsLocked(false);
    setGameState('playing');
  };

  const handleOptionClick = (idx: number) => {
    if (isLocked) return;
    
    setSelectedOpt(idx);
    setIsLocked(true);

    const question = TRIVIA_QUESTIONS[currentIdx];
    let newScore = score;
    if (idx === question.answerIdx) {
      newScore += 20; // 20 points per correct answer (total 100)
      setScore(newScore);
    }

    setTimeout(() => {
      if (currentIdx + 1 < TRIVIA_QUESTIONS.length) {
        setCurrentIdx(prev => prev + 1);
        setSelectedOpt(null);
        setIsLocked(false);
      } else {
        setGameState('gameover');
        onComplete(newScore);
      }
    }, 1500);
  };

  const q = TRIVIA_QUESTIONS[currentIdx];

  return (
    <div className="w-full max-w-md flex flex-col items-center select-none py-4 px-3 text-left">
      
      {gameState === 'idle' && (
        <div className="flex flex-col items-center justify-center text-center py-10 w-full">
          <span className="text-7xl mb-4 animate-float">💌</span>
          <h3 className="font-pixel text-[11px] text-arcade-red neon-text-red tracking-widest uppercase mb-4">
            RELATIONSHIP TRIVIA
          </h3>
          <p className="text-slate-400 font-semibold text-sm max-w-xs mb-6 leading-relaxed">
            Test your knowledge about our sweet co-op story! Earn a perfect 100 points to unlock specialized badges.
          </p>
          <button
            onClick={startQuiz}
            className="flex items-center gap-2 bg-gradient-to-r from-arcade-red to-arcade-red text-white font-bold rounded-2xl px-6 py-4 shadow-lg text-sm select-none cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>START TRIVIA</span>
          </button>
        </div>
      )}

      {gameState === 'playing' && q && (
        <div className="flex flex-col gap-5 w-full">
          {/* Progress dashboard bar */}
          <div className="flex justify-between items-center bg-slate-900/60 border border-slate-800 rounded-2xl py-2.5 px-4.5 text-xs font-bold text-slate-400">
            <span>QUESTION {currentIdx + 1} OF {TRIVIA_QUESTIONS.length}</span>
            <span className="text-arcade-red font-extrabold">Points: {score}</span>
          </div>

          {/* Question card */}
          <div className="bg-slate-950/80 border-2 border-slate-800 rounded-3xl p-5 shadow-inner">
            <h3 className="text-lg font-bold text-white leading-relaxed">{q.question}</h3>
            <p className="text-xs text-slate-500 font-bold uppercase mt-2.5 tracking-wider italic">HINT: {q.hint}</p>
          </div>

          {/* Options Grid */}
          <div className="flex flex-col gap-3">
            {q.options.map((opt, i) => {
              const isSelected = selectedOpt === i;
              const isCorrect = q.answerIdx === i;
              
              let optStyle = "bg-slate-900 border-slate-800 hover:border-arcade-blue/50 text-slate-200";
              if (selectedOpt !== null) {
                if (isCorrect) {
                  optStyle = "bg-green-500/10 border-green-500 text-green-400 neon-border-green";
                } else if (isSelected) {
                  optStyle = "bg-red-500/10 border-red-500 text-red-400";
                } else {
                  optStyle = "bg-slate-900 border-slate-950 text-slate-600 opacity-60";
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleOptionClick(i)}
                  disabled={isLocked}
                  className={`w-full flex items-center justify-between border-2 rounded-2xl py-3.5 px-5 font-semibold text-sm transition-all text-left ${optStyle} ${!isLocked && 'hover:bg-slate-850 cursor-pointer'}`}
                >
                  <span>{opt}</span>
                  {selectedOpt !== null && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
                  {selectedOpt !== null && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="flex flex-col items-center justify-center text-center py-6 w-full">
          <span className="text-6xl mb-3">👑</span>
          <h3 className="font-pixel text-[11px] text-arcade-red neon-text-red uppercase tracking-widest mb-2">
            QUIZ COMPLETE
          </h3>
          <p className="text-slate-300 font-bold text-sm uppercase tracking-widest mt-1">TOTAL KNOWLEDGE POINTS</p>
          <h4 className="text-6xl font-black text-white font-mono tracking-widest my-4 neon-text-red">{score} / 100</h4>

          <p className="text-xs text-slate-400 font-semibold max-w-xs mb-6 leading-relaxed">
            {score === 100 ? "💖 ABSOLUTELY PERFECT! You know our relationship co-op story perfectly." :
             score >= 60 ? "😊 VERY GOOD! We have built some beautiful memories together." :
             "👍 NOT BAD! Insert another love coin to review our memories again."}
          </p>
          
          <button
            onClick={startQuiz}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-white hover:text-black text-white border-2 border-slate-800 rounded-2xl px-6 py-3.5 font-bold text-xs tracking-wider uppercase transition-all select-none cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>
        </div>
      )}

    </div>
  );
};

export default RelationshipTrivia;

