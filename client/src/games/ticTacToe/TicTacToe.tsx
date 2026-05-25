import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';

interface TicTacToeProps {
  onComplete: (score: number) => void;
  onStart?: () => void;
  isPaused?: boolean;
}

type BoardState = ('💖' | '⭐' | null)[];

const TicTacToe: React.FC<TicTacToeProps> = ({ onComplete, onStart, isPaused = false }) => {
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<'💖' | '⭐' | 'TIE' | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');

  const checkWinner = (tempBoard: BoardState) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      if (tempBoard[a] && tempBoard[a] === tempBoard[b] && tempBoard[a] === tempBoard[c]) {
        return tempBoard[a];
      }
    }

    if (tempBoard.every(cell => cell !== null)) {
      return 'TIE';
    }

    return null;
  };

  // Minimax algorithm for optimal AI decisions
  const minimax = (tempBoard: BoardState, depth: number, isMax: boolean): number => {
    const win = checkWinner(tempBoard);
    if (win === '⭐') return 10 - depth; // AI wins
    if (win === '💖') return depth - 10; // Player wins
    if (win === 'TIE') return 0;

    if (isMax) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (tempBoard[i] === null) {
          tempBoard[i] = '⭐';
          best = Math.max(best, minimax(tempBoard, depth + 1, false));
          tempBoard[i] = null;
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (tempBoard[i] === null) {
          tempBoard[i] = '💖';
          best = Math.min(best, minimax(tempBoard, depth + 1, true));
          tempBoard[i] = null;
        }
      }
      return best;
    }
  };

  const getBestMove = (tempBoard: BoardState): number => {
    let bestVal = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
      if (tempBoard[i] === null) {
        tempBoard[i] = '⭐';
        // Add a slight chance of AI making random mistakes for easier gameplay
        // eslint-disable-next-line react-hooks/purity
        const val = Math.random() > 0.85 ? Math.floor(Math.random() * 10) - 5 : minimax(tempBoard, 0, false);
        tempBoard[i] = null;

        if (val > bestVal) {
          bestVal = val;
          bestMove = i;
        }
      }
    }
    return bestMove;
  };

  const handleCellClick = (index: number) => {
    if (isPaused || board[index] || winner || !isPlayerTurn || gameState !== 'playing') return;

    // 1. Player moves
    const newBoard = [...board];
    newBoard[index] = '💖';
    setBoard(newBoard);
    
    const result = checkWinner(newBoard);
    if (result) {
      endGame(result);
      return;
    }

    // 2. AI moves
    setIsPlayerTurn(false);
    
    // Smooth delay for AI thinking feel
    setTimeout(() => {
      const aiMove = getBestMove(newBoard);
      if (aiMove !== -1) {
        // eslint-disable-next-line react-hooks/immutability
        newBoard[aiMove] = '⭐';
        setBoard(newBoard);
        
        const aiResult = checkWinner(newBoard);
        if (aiResult) {
          endGame(aiResult);
        } else {
          setIsPlayerTurn(true);
        }
      }
    }, 600);
  };

  const endGame = (result: '💖' | '⭐' | 'TIE') => {
    setWinner(result);
    setGameState('gameover');
    
    // Complete with win: 1, draw/loss: 0
    if (result === '💖') {
      onComplete(1);
    } else {
      onComplete(0);
    }
  };

  const startGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
    setGameState('playing');
    onStart?.();
  };

  return (
    <div className="w-full max-w-sm flex flex-col items-center select-none py-4 px-2">
      
      {gameState === 'idle' && (
        <div className="flex flex-col items-center justify-center text-center py-10">
          <span className="text-7xl mb-4 animate-heartbeat">💖</span>
          <h3 className="font-pixel text-[11px] text-arcade-blue neon-text-blue tracking-widest uppercase mb-6">
            LOVE TIC-TAC-TOE
          </h3>
          <button
            onClick={startGame}
            className="flex items-center gap-2 bg-gradient-to-r from-arcade-blue to-arcade-red text-white font-bold rounded-2xl px-6 py-4 shadow-lg text-sm select-none cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>PLAY VS AI</span>
          </button>
        </div>
      )}

      {gameState !== 'idle' && (
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Header indicator */}
          <div className="text-center bg-slate-900/60 border border-slate-800 rounded-2xl py-2 px-5 text-sm font-bold tracking-wider">
            {winner === '💖' && <span className="text-arcade-red">💖 YOU WON! COIN SAVED</span>}
            {winner === '⭐' && <span className="text-slate-400">⭐ AI WON. INSERT COIN TO RETRY</span>}
            {winner === 'TIE' && <span className="text-slate-300">🎀 TIE GAME! EQUAL LOVE</span>}
            {!winner && isPlayerTurn && <span className="text-arcade-red animate-pulse">💖 YOUR TURN (HEART)</span>}
            {!winner && !isPlayerTurn && <span className="text-arcade-blue">⭐ CUPID AI IS THINKING...</span>}
          </div>

          {/* Board Grid */}
          <div className="grid grid-cols-3 gap-3.5 bg-slate-900/40 border border-slate-800 rounded-3xl p-4.5 w-full aspect-square">
            {board.map((cell, idx) => (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                className="bg-slate-950/80 border-2 border-slate-800/80 rounded-2xl flex items-center justify-center text-3xl font-black aspect-square transition-all hover:bg-slate-900/60 hover:border-arcade-blue/50 active:scale-95 cursor-pointer"
              >
                {cell && (
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cell === '💖' ? 'text-arcade-red filter drop-shadow-[0_0_8px_#ff6b9d]' : 'text-arcade-blue filter drop-shadow-[0_0_8px_#8b5cf6]'}
                  >
                    {cell}
                  </motion.span>
                )}
              </button>
            ))}
          </div>

          {/* Reset button if gameover */}
          {gameState === 'gameover' && (
            <button
              onClick={startGame}
              className="flex items-center gap-1.5 mt-2 bg-slate-900 hover:bg-white hover:text-black text-white border-2 border-slate-800 rounded-2xl px-6 py-3.5 font-bold text-xs tracking-wider uppercase transition-all select-none cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
            </button>
          )}
        </div>
      )}

    </div>
  );
};

export default TicTacToe;

