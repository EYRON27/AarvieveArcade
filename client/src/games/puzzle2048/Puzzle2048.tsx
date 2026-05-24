import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Puzzle2048Props {
  onComplete: (score: number) => void;
  onStart?: () => void;
  isPaused?: boolean;
}

type Grid = number[][];

const Puzzle2048: React.FC<Puzzle2048Props> = ({ onComplete, onStart, isPaused = false }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover' | 'won'>('idle');
  const [grid, setGrid] = useState<Grid>(
    Array(4).fill(null).map(() => Array(4).fill(0))
  );
  const [score, setScore] = useState(0);

  // Initialize game
  const startGame = () => {
    let newGrid = Array(4).fill(null).map(() => Array(4).fill(0));
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameState('playing');
    onStart?.();
  };

  const getEmptyCells = (currentGrid: Grid) => {
    const cells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentGrid[r][c] === 0) {
          cells.push({ r, c });
        }
      }
    }
    return cells;
  };

  const addRandomTile = (currentGrid: Grid): Grid => {
    const emptyCells = getEmptyCells(currentGrid);
    if (emptyCells.length === 0) return currentGrid;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = currentGrid.map(row => [...row]);
    // 10% chance for a 4, 90% chance for a 2
    newGrid[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  };

  // Move Logic
  const move = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameState !== 'playing' || isPaused) return;

    let newGrid = grid.map(row => [...row]);
    let moved = false;
    let pointsEarned = 0;

    const slideAndMergeLine = (line: number[]) => {
      // Remove zeros
      let newLine = line.filter(val => val !== 0);
      // Merge
      for (let i = 0; i < newLine.length - 1; i++) {
        if (newLine[i] === newLine[i + 1]) {
          newLine[i] *= 2;
          pointsEarned += newLine[i];
          newLine[i + 1] = 0;
        }
      }
      // Remove zeros again and pad
      newLine = newLine.filter(val => val !== 0);
      while (newLine.length < 4) {
        newLine.push(0);
      }
      return newLine;
    };

    if (direction === 'LEFT' || direction === 'RIGHT') {
      for (let r = 0; r < 4; r++) {
        let row = newGrid[r];
        if (direction === 'RIGHT') row.reverse();
        
        const newRow = slideAndMergeLine(row);
        
        if (direction === 'RIGHT') newRow.reverse();
        
        if (newGrid[r].join(',') !== newRow.join(',')) moved = true;
        newGrid[r] = newRow;
      }
    } else if (direction === 'UP' || direction === 'DOWN') {
      for (let c = 0; c < 4; c++) {
        let col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
        if (direction === 'DOWN') col.reverse();
        
        const newCol = slideAndMergeLine(col);
        
        if (direction === 'DOWN') newCol.reverse();
        
        for (let r = 0; r < 4; r++) {
          if (newGrid[r][c] !== newCol[r]) moved = true;
          newGrid[r][c] = newCol[r];
        }
      }
    }

    if (moved) {
      newGrid = addRandomTile(newGrid);
      setGrid(newGrid);
      const newScore = score + pointsEarned;
      setScore(newScore);
      
      checkGameState(newGrid, newScore);
    }
  };

  const checkGameState = (currentGrid: Grid, currentScore: number) => {
    // Check win
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentGrid[r][c] === 2048) {
          setGameState('won');
          onComplete(currentScore + 2048); // bonus
          return;
        }
      }
    }

    // Check game over
    const emptyCells = getEmptyCells(currentGrid);
    if (emptyCells.length > 0) return; // Still empty spaces

    // Check if any merges are possible
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = currentGrid[r][c];
        // check right
        if (c < 3 && currentGrid[r][c + 1] === val) return;
        // check down
        if (r < 3 && currentGrid[r + 1][c] === val) return;
      }
    }

    // No empty cells, no merges possible
    setGameState('gameover');
    onComplete(currentScore);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrows
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowUp') move('UP');
      if (e.key === 'ArrowDown') move('DOWN');
      if (e.key === 'ArrowLeft') move('LEFT');
      if (e.key === 'ArrowRight') move('RIGHT');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [grid, gameState]);

  // Touch controls (Swipe)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };

    const dx = touchEnd.x - touchStartRef.current.x;
    const dy = touchEnd.y - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 30) {
      if (absDx > absDy) {
        // Horizontal
        if (dx > 0) move('RIGHT');
        else move('LEFT');
      } else {
        // Vertical
        if (dy > 0) move('DOWN');
        else move('UP');
      }
    }
    touchStartRef.current = null;
  };

  const getTileColor = (val: number) => {
    switch (val) {
      case 0: return 'bg-slate-800 text-transparent';
      case 2: return 'bg-slate-700 text-slate-200';
      case 4: return 'bg-slate-600 text-slate-100';
      case 8: return 'bg-orange-400 text-white';
      case 16: return 'bg-orange-500 text-white';
      case 32: return 'bg-red-500 text-white';
      case 64: return 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]';
      case 128: return 'bg-yellow-400 text-slate-900 shadow-[0_0_20px_rgba(250,204,21,0.6)]';
      case 256: return 'bg-yellow-500 text-slate-900 shadow-[0_0_25px_rgba(234,179,8,0.7)] text-3xl';
      case 512: return 'bg-yellow-600 text-white shadow-[0_0_30px_rgba(202,138,4,0.8)] text-3xl';
      case 1024: return 'bg-yellow-700 text-white shadow-[0_0_35px_rgba(161,98,7,0.9)] text-2xl';
      case 2048: return 'bg-yellow-300 text-slate-900 shadow-[0_0_40px_rgba(253,224,71,1)] text-2xl animate-pulse';
      default: return 'bg-slate-900 text-white text-xl'; // Should not reach here normally, but just in case
    }
  };

  return (
    <div className="w-full flex flex-col items-center select-none py-4"
         onTouchStart={handleTouchStart}
         onTouchEnd={handleTouchEnd}
    >
      
      {/* HUD Header */}
      <div className="w-full max-w-[340px] flex justify-between items-center mb-6 px-2">
        <h2 className="pixel-text text-yellow-500 neon-text-yellow tracking-widest text-sm uppercase">
          2048 PUZZLE
        </h2>
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-0.5">SCORE</span>
          <span className="font-pixel text-xl text-white block leading-none">{score}</span>
        </div>
      </div>

      {/* Main Game Board */}
      <div className="relative w-[340px] h-[340px] bg-slate-900 border-4 border-slate-800 rounded-2xl p-3 shadow-2xl overflow-hidden">
        
        {/* The Grid */}
        <div className="w-full h-full grid grid-cols-4 grid-rows-4 gap-3">
          {grid.map((row, rIdx) => (
            row.map((val, cIdx) => (
              <div 
                key={`${rIdx}-${cIdx}`} 
                className={`flex items-center justify-center rounded-xl font-display font-bold text-4xl transition-all duration-150 ${getTileColor(val)}`}
              >
                {val !== 0 ? val : ''}
              </div>
            ))
          ))}
        </div>

        {/* Start Overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-30">
            <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">🧩</motion.span>
            <h3 className="font-pixel text-[11px] text-yellow-500 text-center uppercase tracking-widest mb-6">
              REACH 2048
            </h3>
            <button
              onClick={startGame}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-slate-900 font-black rounded-2xl px-6 py-4 shadow-[0_0_20px_rgba(234,179,8,0.3)] text-sm select-none transition-all"
            >
              <Play className="w-4 h-4 fill-slate-900 text-slate-900" />
              <span>START GAME</span>
            </button>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-6 text-center">
              SWIPE OR USE ARROW KEYS TO SLIDE TILES
            </p>
          </div>
        )}

        {/* Gameover Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-30">
            <span className="text-5xl mb-2">🧱</span>
            <h3 className="font-pixel text-[11px] text-red-400 text-center uppercase tracking-widest mb-2">
              GRID LOCKED
            </h3>
            <p className="text-slate-300 font-bold text-xs uppercase tracking-widest mb-6">FINAL SCORE: {score}</p>
            <button
              onClick={startGame}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-white hover:text-black text-white border-2 border-slate-800 rounded-2xl px-6 py-3.5 font-bold text-xs tracking-wider uppercase transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>TRY AGAIN</span>
            </button>
          </div>
        )}

        {/* Win Overlay */}
        {gameState === 'won' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-30">
            <span className="text-6xl mb-2 animate-bounce">👑</span>
            <h3 className="font-pixel text-[11px] text-yellow-400 text-center uppercase tracking-widest mb-2 neon-text-yellow">
              2048 ACHIEVED!
            </h3>
            <p className="text-slate-300 font-bold text-xs uppercase tracking-widest mb-6">FINAL SCORE: {score}</p>
            <button
              onClick={startGame}
              className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-900 border-2 border-transparent rounded-2xl px-6 py-3.5 font-black text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(234,179,8,0.5)]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="md:hidden mt-6 flex flex-col items-center gap-2">
        <button onClick={() => move('UP')} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 active:bg-slate-600 transition-colors shadow-lg">
          <ArrowUp className="w-6 h-6 text-slate-300" />
        </button>
        <div className="flex gap-12">
          <button onClick={() => move('LEFT')} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 active:bg-slate-600 transition-colors shadow-lg">
            <ArrowLeft className="w-6 h-6 text-slate-300" />
          </button>
          <button onClick={() => move('RIGHT')} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 active:bg-slate-600 transition-colors shadow-lg">
            <ArrowRight className="w-6 h-6 text-slate-300" />
          </button>
        </div>
        <button onClick={() => move('DOWN')} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 active:bg-slate-600 transition-colors shadow-lg">
          <ArrowDown className="w-6 h-6 text-slate-300" />
        </button>
        <span className="text-[10px] text-slate-500 font-bold uppercase mt-2">Tap arrows to move</span>
      </div>

    </div>
  );
};

export default Puzzle2048;
