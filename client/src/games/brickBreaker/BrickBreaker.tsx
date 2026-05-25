import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface BrickBreakerProps {
  onComplete: (score: number) => void;
  onStart?: () => void;
  isPaused?: boolean;
}

const BrickBreaker: React.FC<BrickBreakerProps> = ({ onComplete, onStart, isPaused = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'level-complete' | 'gameover' | 'won'>('idle');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);

  const physicsRef = useRef({
    paddleX: 200,
    paddleY: 420,
    paddleWidth: 80,
    paddleHeight: 12,
    paddleSpeed: 7,
    movingLeft: false,
    movingRight: false,
    ballX: 240,
    ballY: 400,
    ballDX: 3,
    ballDY: -3,
    ballRadius: 6,
    bricks: [] as Array<{ x: number; y: number; width: number; height: number; status: number; color: string }>,
    score: 0,
    level: 1
  });

  const BRICK_ROW_COUNT = 5;
  const BRICK_COLUMN_COUNT = 7;
  const BRICK_WIDTH = 55;
  const BRICK_HEIGHT = 20;
  const BRICK_PADDING = 10;
  const BRICK_OFFSET_TOP = 40;
  const BRICK_OFFSET_LEFT = 15;

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

  const initBricks = () => {
    const bricks = [];
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        bricks.push({
          x: (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT,
          y: (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          status: 1, // 1 means active, 0 means broken
          color: COLORS[r % COLORS.length]
        });
      }
    }
    return bricks;
  };

  const startGame = (isNextLevel: boolean = false) => {
    const currentLevel = isNextLevel ? level + 1 : 1;
    if (isNextLevel) {
      setLevel(currentLevel);
    } else {
      setLevel(1);
      setScore(0);
    }

    const speedMult = 1 + (currentLevel * 0.15);

    physicsRef.current = {
      paddleX: 200,
      paddleY: 420,
      paddleWidth: Math.max(40, 80 - (currentLevel * 4)), // Paddle gets slightly smaller each level
      paddleHeight: 12,
      paddleSpeed: 7,
      movingLeft: false,
      movingRight: false,
      ballX: 240,
      ballY: 400,
      ballDX: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 2 + 2) * speedMult,
      ballDY: -4 * speedMult,
      ballRadius: 6,
      bricks: initBricks(),
      score: isNextLevel ? score : 0,
      level: currentLevel
    };
    
    setGameState('playing');
    onStart?.();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') physicsRef.current.movingLeft = true;
      if (e.key === 'ArrowRight' || e.key === 'd') physicsRef.current.movingRight = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') physicsRef.current.movingLeft = false;
      if (e.key === 'ArrowRight' || e.key === 'd') physicsRef.current.movingRight = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = Math.min(container.clientWidth, 480);
        canvas.height = 450;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing' || !canvasRef.current) return;

    // Support dragging via touch or mouse
    if (e.buttons !== 1 && e.pointerType !== 'touch') return; // Only move if touching or clicking

    const rect = canvasRef.current.getBoundingClientRect();
    // Use scaling ratio in case canvas CSS size differs from actual internal coordinate size
    const scaleX = canvasRef.current.width / rect.width;
    const x = (e.clientX - rect.left) * scaleX;

    const state = physicsRef.current;

    // Center the paddle under the finger/cursor
    let newX = x - state.paddleWidth / 2;
    if (newX < 0) newX = 0;
    if (newX > canvasRef.current.width - state.paddleWidth) {
      newX = canvasRef.current.width - state.paddleWidth;
    }
    state.paddleX = newX;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const state = physicsRef.current;

      // Draw background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (gameState === 'playing' && !isPaused) {
        // Paddle movement
        if (state.movingLeft && state.paddleX > 0) state.paddleX -= state.paddleSpeed;
        if (state.movingRight && state.paddleX + state.paddleWidth < canvas.width) state.paddleX += state.paddleSpeed;

        // Ball movement
        state.ballX += state.ballDX;
        state.ballY += state.ballDY;

        // Wall collisions (left/right)
        if (state.ballX + state.ballDX > canvas.width - state.ballRadius || state.ballX + state.ballDX < state.ballRadius) {
          state.ballDX = -state.ballDX;
        }

        // Wall collision (top)
        if (state.ballY + state.ballDY < state.ballRadius) {
          state.ballDY = -state.ballDY;
        }
        // Bottom (Paddle or Game Over)
        else if (state.ballY + state.ballDY > canvas.height - state.ballRadius) {
          // Check if hitting paddle
          if (state.ballX > state.paddleX && state.ballX < state.paddleX + state.paddleWidth) {
            state.ballDY = -state.ballDY;
            // Add some english (spin) based on where it hit the paddle
            const hitPoint = (state.ballX - (state.paddleX + state.paddleWidth / 2)) / (state.paddleWidth / 2);
            state.ballDX = hitPoint * 4;
            // Slight speedup
            if (Math.abs(state.ballDY) < 7) {
              state.ballDY *= 1.05;
            }
          } else {
            // Game Over
            setGameState('gameover');
            onComplete(state.score);
          }
        }

        // Brick collisions
        let activeBricks = 0;
        for (let i = 0; i < state.bricks.length; i++) {
          const b = state.bricks[i];
          if (b.status === 1) {
            activeBricks++;
            // Basic AABB collision
            if (
              state.ballX > b.x &&
              state.ballX < b.x + b.width &&
              state.ballY > b.y &&
              state.ballY < b.y + b.height
            ) {
              state.ballDY = -state.ballDY;
              b.status = 0;
              state.score += 10;
              setScore(state.score);
            }
          }
        }

        // Win condition (Level Complete)
        if (activeBricks === 0) {
          setGameState('level-complete');
          state.score += state.level * 500; // bonus for clearing board
          setScore(state.score);
        }
      }

      // Draw Bricks
      state.bricks.forEach(b => {
        if (b.status === 1) {
          ctx.beginPath();
          ctx.rect(b.x, b.y, b.width, b.height);
          ctx.fillStyle = b.color;
          ctx.fill();

          // Glossy highlight
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fillRect(b.x, b.y, b.width, b.height / 3);

          ctx.strokeStyle = 'rgba(0,0,0,0.3)';
          ctx.strokeRect(b.x, b.y, b.width, b.height);
          ctx.closePath();
        }
      });

      // Draw Paddle
      ctx.beginPath();
      ctx.rect(state.paddleX, state.paddleY, state.paddleWidth, state.paddleHeight);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();

      // Draw Ball
      ctx.beginPath();
      ctx.arc(state.ballX, state.ballY, state.ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f8fafc';
      ctx.closePath();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, isPaused]);

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center select-none py-4">

      {/* HUD Header */}
      <div className="w-full max-w-sm flex justify-between items-center mb-4 px-4">
        <h2 className="pixel-text text-arcade-blue neon-text-blue tracking-widest text-sm uppercase">
          BRICK BREAKER
        </h2>
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-0.5">SCORE</span>
          <span className="font-pixel text-xl text-white block leading-none">{score}</span>
        </div>
      </div>
      <div className="relative border-4 border-slate-800 rounded-3xl overflow-hidden bg-slate-900 shadow-2xl">
        <canvas ref={canvasRef} onPointerMove={handlePointerMove} className="block w-full h-[450px] touch-none" style={{ touchAction: 'none' }} />

        {/* HUD overlay */}
        <div className="absolute top-4 left-4 right-4 font-pixel tracking-widest text-slate-100 bg-slate-950/60 backdrop-blur-sm border border-slate-800 rounded-2xl px-4 py-2 text-sm z-20 flex justify-between items-center select-none pointer-events-none">
          <span className="text-arcade-red">LEVEL {level}</span>
          <span>SCORE: <span className="text-arcade-yellow">{score}</span></span>
        </div>

        {/* Start Screen */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-30 pointer-events-auto">
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-6xl mb-4">🧱</motion.span>
            <h3 className="font-pixel text-[11px] text-arcade-blue text-center uppercase tracking-widest mb-6">
              SMASH THE BRICKS
            </h3>
            <button
              onClick={() => startGame(false)}
              className="flex items-center gap-2 bg-gradient-to-r from-arcade-blue to-cyan-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-2xl px-6 py-4 shadow-lg text-sm select-none transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>START GAME</span>
            </button>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-6 text-center">
              USE ARROW KEYS OR BUTTONS TO MOVE
            </p>
          </div>
        )}

        {/* Level Complete Screen */}
        {gameState === 'level-complete' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-30 pointer-events-auto">
            <span className="text-6xl mb-4">🏆</span>
            <h3 className="font-pixel text-[11px] text-arcade-green neon-text-green text-center uppercase tracking-widest mb-2">
              LEVEL {level} CLEARED!
            </h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6">SCORE: {score}</p>
            
            <button
              onClick={() => startGame(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-arcade-green to-arcade-blue text-white hover:text-black border-2 border-slate-800 rounded-2xl px-6 py-3.5 font-bold text-xs tracking-wider uppercase transition-all shadow-lg hover:scale-105 select-none cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>NEXT LEVEL</span>
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-30 pointer-events-auto">
            <span className="text-5xl mb-2">💥</span>
            <h3 className="font-pixel text-[11px] text-red-400 text-center uppercase tracking-widest mb-2">
              PADDLE MISSED
            </h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6">FINAL SCORE: {score}</p>
            
            <button
              onClick={() => startGame(false)}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-white hover:text-black text-white border-2 border-slate-800 rounded-2xl px-6 py-3.5 font-bold text-xs tracking-wider uppercase transition-all shadow-lg select-none cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>TRY AGAIN</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="w-full max-w-sm flex justify-between gap-4 mt-6 px-4">
        <button
          className="flex-1 h-16 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-2xl border-b-4 border-slate-900 flex items-center justify-center touch-manipulation transition-colors"
          onPointerDown={() => physicsRef.current.movingLeft = true}
          onPointerUp={() => physicsRef.current.movingLeft = false}
          onPointerLeave={() => physicsRef.current.movingLeft = false}
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
        <button
          className="flex-1 h-16 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-2xl border-b-4 border-slate-900 flex items-center justify-center touch-manipulation transition-colors"
          onPointerDown={() => physicsRef.current.movingRight = true}
          onPointerUp={() => physicsRef.current.movingRight = false}
          onPointerLeave={() => physicsRef.current.movingRight = false}
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>

    </div>
  );
};

export default BrickBreaker;
