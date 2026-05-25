import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';

interface SnakeProps {
  onComplete: (score: number) => void;
  onStart?: () => void;
  isPaused?: boolean;
}

type Point = { x: number; y: number };

const SnakeGame: React.FC<SnakeProps> = ({ onComplete, onStart, isPaused = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);

  const GRID_SIZE = 20;
  const physicsRef = useRef({
    snake: [] as Point[],
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    food: { x: 5, y: 5 } as Point,
    cols: 20,
    rows: 20,
    score: 0,
    speed: 130 // Game tick interval in ms
  });

  const generateFood = (canvasWidth: number, canvasHeight: number) => {
    const cols = Math.floor(canvasWidth / GRID_SIZE);
    const rows = Math.floor(canvasHeight / GRID_SIZE);
    physicsRef.current.cols = cols;
    physicsRef.current.rows = rows;

    let newFood: Point;
    let isOnSnake = true;

    while (isOnSnake) {
      newFood = {
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows)
      };
      isOnSnake = physicsRef.current.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }

    physicsRef.current.food = newFood!;
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    const dir = physicsRef.current.direction;
    if (e.code === 'ArrowUp' && dir !== 'DOWN') physicsRef.current.nextDirection = 'UP';
    else if (e.code === 'ArrowDown' && dir !== 'UP') physicsRef.current.nextDirection = 'DOWN';
    else if (e.code === 'ArrowLeft' && dir !== 'RIGHT') physicsRef.current.nextDirection = 'LEFT';
    else if (e.code === 'ArrowRight' && dir !== 'LEFT') physicsRef.current.nextDirection = 'RIGHT';
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Initialize canvas sizes
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        const width = Math.min(container.clientWidth, 440);
        // Ensure dimensions are multiples of GRID_SIZE
        canvas.width = Math.floor(width / GRID_SIZE) * GRID_SIZE;
        canvas.height = 360;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main game tick timer loop
  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const tick = () => {
      const state = physicsRef.current;
      state.direction = state.nextDirection;

      const head = { ...state.snake[0] };

      switch (state.direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      // Check wall collisions
      if (head.x < 0 || head.y < 0 || head.x >= state.cols || head.y >= state.rows) {
        setGameState('gameover');
        onComplete(state.score);
        return;
      }

      // Check self collisions
      const selfCollide = state.snake.some(seg => seg.x === head.x && seg.y === head.y);
      if (selfCollide) {
        setGameState('gameover');
        onComplete(state.score);
        return;
      }

      // Move snake
      state.snake.unshift(head);

      // Check food eating
      if (head.x === state.food.x && head.y === state.food.y) {
        state.score += 10;
        setScore(state.score);
        generateFood(canvas.width, canvas.height);
        // Slightly speed up for difficulty
        state.speed = Math.max(70, 130 - Math.floor(state.score / 3));
      } else {
        state.snake.pop();
      }

      timerId = setTimeout(tick, state.speed);
    };

    let timerId = setTimeout(tick, physicsRef.current.speed);
    return () => clearTimeout(timerId);
  }, [gameState, isPaused]);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Grid Sky Background
      ctx.fillStyle = '#0a081a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const state = physicsRef.current;

      // Draw Neon grid lines
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      if (gameState === 'playing' || gameState === 'gameover') {
        // Draw food (glowing pink heart food)
        const fx = state.food.x * GRID_SIZE + GRID_SIZE / 2;
        const fy = state.food.y * GRID_SIZE + GRID_SIZE / 2;
        
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ff6b9d';
        ctx.fillStyle = '#ff6b9d';
        
        // Draw Heart Shape food
        ctx.beginPath();
        const d = GRID_SIZE / 1.5;
        ctx.moveTo(fx, fy - d / 4);
        ctx.quadraticCurveTo(fx - d / 2, fy - d / 2, fx - d / 2, fy + d / 8);
        ctx.quadraticCurveTo(fx - d / 2, fy + d / 2, fx, fy + d / 1.2);
        ctx.quadraticCurveTo(fx + d / 2, fy + d / 2, fx + d / 2, fy + d / 8);
        ctx.quadraticCurveTo(fx + d / 2, fy - d / 2, fx, fy - d / 4);
        ctx.fill();
        ctx.closePath();

        ctx.shadowBlur = 0;

        // Draw Snake segments
        state.snake.forEach((seg, idx) => {
          const sx = seg.x * GRID_SIZE;
          const sy = seg.y * GRID_SIZE;

          // Head vs body colors
          ctx.fillStyle = idx === 0 ? '#06b6d4' : 'rgba(6, 182, 212, 0.7)';
          ctx.shadowBlur = idx === 0 ? 10 : 0;
          ctx.shadowColor = '#06b6d4';

          ctx.fillRect(sx + 2, sy + 2, GRID_SIZE - 4, GRID_SIZE - 4);
          
          if (idx === 0) {
            // Draw cute neon eyes on snake head
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(sx + 5, sy + 5, 3, 3);
            ctx.fillRect(sx + 12, sy + 5, 3, 3);
          }
        });
        
        ctx.shadowBlur = 0;
      }

      frameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(frameId);
  }, [gameState]);

  const startGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    physicsRef.current.snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    physicsRef.current.direction = 'RIGHT';
    physicsRef.current.nextDirection = 'RIGHT';
    physicsRef.current.score = 0;
    physicsRef.current.speed = 130;
    
    setScore(0);
    generateFood(canvas.width, canvas.height);
    setGameState('playing');
    onStart?.();
  };

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center select-none">
      <div className="relative border-4 border-slate-800 rounded-3xl overflow-hidden bg-slate-950 shadow-inner">
        <canvas ref={canvasRef} className="block" />

        {/* HUD overlay */}
        <div className="absolute top-4 right-4 font-pixel tracking-widest text-slate-100 bg-slate-950/60 backdrop-blur-sm border border-slate-800 rounded-2xl px-3 py-1.5 text-right text-sm z-20">
          Score: <span className="text-arcade-green">{score}</span>
        </div>

        {/* Idle/Welcome screen */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-30">
            <span className="text-6xl mb-4 animate-float">🐍</span>
            <h3 className="font-pixel text-[11px] text-arcade-green neon-text-green text-center uppercase tracking-widest mb-6">
              SNAKE ARCADE
            </h3>
            
            <button
              onClick={startGame}
              className="flex items-center gap-2 bg-gradient-to-r from-arcade-green to-arcade-blue text-white font-bold rounded-2xl px-6 py-4 shadow-lg text-sm select-none cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>START GAME</span>
            </button>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-6">
              USE KEYBOARD ARROW KEYS TO CONTROL
            </p>
          </div>
        )}

        {/* Gameover overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-30">
            <span className="text-5xl mb-2">💥</span>
            <h3 className="font-pixel text-[11px] text-red-400 text-center uppercase tracking-widest mb-2">
              SNAKE COLLIDED
            </h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6">LENGTH SCORE: {score}</p>
            
            <button
              onClick={startGame}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-white hover:text-black text-white border-2 border-slate-800 rounded-2xl px-6 py-3.5 font-bold text-xs tracking-wider uppercase transition-all select-none cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>TRY AGAIN</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SnakeGame;

