import React, { useState, useEffect, useCallback } from 'react';
import { Play, RotateCcw, Delete } from 'lucide-react';
import { motion } from 'framer-motion';

interface SudokuProps {
  onComplete: (score: number) => void;
  onStart?: () => void;
  isPaused?: boolean;
}

type Cell = {
  value: number;
  isInitial: boolean;
};

type Board = Cell[][];

const Sudoku: React.FC<SudokuProps> = ({ onComplete, onStart, isPaused = false }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won'>('idle');
  const [board, setBoard] = useState<Board>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);

  // --- SUDOKU LOGIC ---
  const generateSudoku = useCallback(() => {
    const newBoard = Array(9).fill(null).map(() => Array(9).fill(0));
    
    // Fill diagonal 3x3 boxes (independent)
    for (let i = 0; i < 9; i += 3) {
      fillBox(newBoard, i, i);
    }
    
    // Fill remaining
    fillRemaining(newBoard, 0, 3);
    
    // Dig holes (Difficulty: easy/medium ~ 40 holes)
    digHoles(newBoard, 40);

    const initialBoard: Board = newBoard.map(row => 
      row.map(val => ({ value: val, isInitial: val !== 0 }))
    );
    return initialBoard;
  }, []);

  const fillBox = (b: number[][], rowStart: number, colStart: number) => {
    let num;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        do {
          num = Math.floor(Math.random() * 9) + 1;
        } while (!isSafeBox(b, rowStart, colStart, num));
        b[rowStart + i][colStart + j] = num;
      }
    }
  };

  const isSafeBox = (b: number[][], rowStart: number, colStart: number, num: number) => {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (b[rowStart + i][colStart + j] === num) return false;
      }
    }
    return true;
  };

  const isSafe = (b: number[][], r: number, c: number, num: number) => {
    for (let i = 0; i < 9; i++) {
      if (b[r][i] === num || b[i][c] === num) return false;
    }
    const startRow = r - r % 3;
    const startCol = c - c % 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (b[startRow + i][startCol + j] === num) return false;
      }
    }
    return true;
  };

  const fillRemaining = (b: number[][], r: number, c: number): boolean => {
    if (c >= 9 && r < 8) {
      r = r + 1;
      c = 0;
    }
    if (r >= 9 && c >= 9) return true;
    if (r < 3) {
      if (c < 3) c = 3;
    } else if (r < 6) {
      if (c === (Math.floor(r / 3) * 3)) c += 3;
    } else {
      if (c === 6) {
        r = r + 1;
        c = 0;
        if (r >= 9) return true;
      }
    }

    for (let num = 1; num <= 9; num++) {
      if (isSafe(b, r, c, num)) {
        b[r][c] = num;
        if (fillRemaining(b, r, c + 1)) return true;
        b[r][c] = 0;
      }
    }
    return false;
  };

  const digHoles = (b: number[][], count: number) => {
    while (count > 0) {
      let cellId = Math.floor(Math.random() * 81);
      let r = Math.floor(cellId / 9);
      let c = cellId % 9;
      if (b[r][c] !== 0) {
        b[r][c] = 0;
        count--;
      }
    }
  };

  // --- GAMEPLAY ---
  const startGame = () => {
    setBoard(generateSudoku());
    setGameState('playing');
    setScore(0);
    setTime(0);
    setSelectedCell(null);
    onStart?.();
  };

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;
    const interval = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [gameState, isPaused]);

  const handleInput = useCallback((num: number) => {
    if (gameState !== 'playing' || !selectedCell || isPaused) return;
    const { r, c } = selectedCell;
    if (board[r][c].isInitial) return;

    setBoard(prev => {
      const newBoard = prev.map(row => [...row]);
      newBoard[r][c] = { ...newBoard[r][c], value: num };
      return newBoard;
    });

    // Check win condition slightly after state updates
    setTimeout(() => checkWin(board), 0);
  }, [gameState, selectedCell, board]);

  const checkWin = (currentBoard: Board) => {
    // A quick check if board is full and valid
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = currentBoard[r][c].value;
        if (val === 0) return; // not full
      }
    }
    // If full, check validity
    const plainBoard = currentBoard.map(row => row.map(cell => cell.value));
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = plainBoard[r][c];
        plainBoard[r][c] = 0;
        if (!isSafe(plainBoard, r, c, val)) return; // invalid
        plainBoard[r][c] = val;
      }
    }
    
    // Win!
    setGameState('won');
    const finalScore = Math.max(1000 - time * 2, 100);
    setScore(finalScore);
    onComplete(finalScore);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key >= '1' && e.key <= '9') {
        handleInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleInput(0);
      } else if (e.key.startsWith('Arrow') && selectedCell) {
        e.preventDefault();
        let { r, c } = selectedCell;
        if (e.key === 'ArrowUp') r = Math.max(0, r - 1);
        if (e.key === 'ArrowDown') r = Math.min(8, r + 1);
        if (e.key === 'ArrowLeft') c = Math.max(0, c - 1);
        if (e.key === 'ArrowRight') c = Math.min(8, c + 1);
        setSelectedCell({ r, c });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, selectedCell, handleInput]);

  const hasConflict = (r: number, c: number, value: number) => {
    if (value === 0) return false;
    for (let i = 0; i < 9; i++) {
      if (i !== c && board[r][i].value === value) return true;
      if (i !== r && board[i][c].value === value) return true;
    }
    const startRow = r - r % 3;
    const startCol = c - c % 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if ((startRow + i !== r || startCol + j !== c) && board[startRow + i][startCol + j].value === value) {
          return true;
        }
      }
    }
    return false;
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex flex-col items-center select-none py-4">
      {/* HUD Header */}
      <div className="w-full max-w-[400px] flex justify-between items-center mb-6 px-2">
        <h2 className="font-display text-blue-400 neon-text-blue font-bold tracking-widest text-lg uppercase">
          SUDOKU
        </h2>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-1.5 text-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-0.5">TIME</span>
            <span className="font-pixel text-lg text-white block leading-none">{formatTime(time)}</span>
          </div>
        </div>
      </div>

      {/* Main Game Board */}
      <div className="relative w-[340px] md:w-[400px] h-[340px] md:h-[400px] bg-slate-900 border-[3px] border-arcade-blue rounded-lg shadow-2xl overflow-hidden">
        
        {/* The Grid */}
        <div className="w-full h-full grid grid-cols-9 grid-rows-9 bg-slate-700 gap-[1px]">
          {board.map((row, rIdx) => (
            row.map((cell, cIdx) => {
              const isSelected = selectedCell?.r === rIdx && selectedCell?.c === cIdx;
              const isSameBox = selectedCell && Math.floor(selectedCell.r/3) === Math.floor(rIdx/3) && Math.floor(selectedCell.c/3) === Math.floor(cIdx/3);
              const isSameRowCol = selectedCell && (selectedCell.r === rIdx || selectedCell.c === cIdx);
              const isHighlight = isSameBox || isSameRowCol;
              
              const isError = hasConflict(rIdx, cIdx, cell.value);
              const isRightEdge = cIdx === 2 || cIdx === 5;
              const isBottomEdge = rIdx === 2 || rIdx === 5;

              return (
                <div 
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => gameState === 'playing' && setSelectedCell({ r: rIdx, c: cIdx })}
                  className={`flex items-center justify-center font-display font-bold md:text-xl text-lg cursor-pointer transition-colors
                    ${isRightEdge ? 'border-r-2 border-r-arcade-blue' : ''}
                    ${isBottomEdge ? 'border-b-2 border-b-arcade-blue' : ''}
                    ${isSelected ? 'bg-arcade-blue/40' : isHighlight ? 'bg-arcade-blue/10' : 'bg-slate-900'}
                    ${cell.isInitial ? 'text-slate-200' : 'text-blue-400'}
                    ${isError && cell.value !== 0 ? 'bg-red-900/50 text-red-400 font-black' : ''}
                  `}
                >
                  {cell.value !== 0 ? cell.value : ''}
                </div>
              );
            })
          ))}
        </div>

        {/* Start Overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-30">
            <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4 text-blue-400">🔢</motion.span>
            <h3 className="font-pixel text-[11px] text-blue-400 text-center uppercase tracking-widest mb-6">
              LOGIC PUZZLE
            </h3>
            <button
              onClick={startGame}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black rounded-2xl px-6 py-4 shadow-[0_0_20px_rgba(59,130,246,0.3)] text-sm select-none transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>START GAME</span>
            </button>
          </div>
        )}

        {/* Win Overlay */}
        {gameState === 'won' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-30">
            <span className="text-6xl mb-2 animate-bounce">👑</span>
            <h3 className="font-pixel text-[11px] text-yellow-400 text-center uppercase tracking-widest mb-2 neon-text-yellow">
              SUDOKU MASTER!
            </h3>
            <p className="text-slate-300 font-bold text-xs uppercase tracking-widest mb-6">SCORE: {score}</p>
            <button
              onClick={startGame}
              className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-400 text-white border-2 border-transparent rounded-2xl px-6 py-3.5 font-black text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
            </button>
          </div>
        )}
      </div>

      {/* On-screen Numpad */}
      {gameState === 'playing' && (
        <div className="w-full max-w-[340px] md:max-w-[400px] mt-6 grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleInput(num)}
              className="bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-blue-400 font-display font-bold text-xl py-3 rounded-xl border border-slate-700 transition-colors"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleInput(0)}
            className="bg-slate-800 hover:bg-red-900/30 active:bg-red-900/50 text-red-400 font-display font-bold text-xl py-3 rounded-xl border border-slate-700 transition-colors flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      )}

    </div>
  );
};

export default Sudoku;
