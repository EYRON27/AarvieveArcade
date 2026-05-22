import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';

interface CatchMyHeartProps {
  onComplete: (score: number) => void;
}

interface HeartItem {
  x: number;
  y: number;
  size: number;
  speed: number;
}

const CatchMyHeart: React.FC<CatchMyHeartProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);

  const physicsRef = useRef({
    basketX: 180,
    basketWidth: 70,
    basketHeight: 18,
    hearts: [] as HeartItem[],
    score: 0,
    lives: 5,
    lastTime: 0,
    keys: { ArrowLeft: false, ArrowRight: false }
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'ArrowLeft') physicsRef.current.keys.ArrowLeft = true;
    if (e.code === 'ArrowRight') physicsRef.current.keys.ArrowRight = true;
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'ArrowLeft') physicsRef.current.keys.ArrowLeft = false;
    if (e.code === 'ArrowRight') physicsRef.current.keys.ArrowRight = false;
  };

  // Mouse / Touch movements
  const handleMouseMove = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== 'playing') return;
    
    const rect = canvas.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    physicsRef.current.basketX = Math.max(0, Math.min(canvas.width - physicsRef.current.basketWidth, relativeX - physicsRef.current.basketWidth / 2));
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Initialize canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = Math.min(container.clientWidth, 480);
        canvas.height = 420;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Canvas / Physics Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;

    const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y + size / 4);
      ctx.quadraticCurveTo(x, y, x + size / 2, y);
      ctx.quadraticCurveTo(x + size, y, x + size, y + size / 3);
      ctx.quadraticCurveTo(x + size, y + (size * 2) / 3, x + size / 2, y + size);
      ctx.quadraticCurveTo(x, y + (size * 2) / 3, x, y + size / 3);
      ctx.quadraticCurveTo(x, y, x + size / 2, y);
      ctx.closePath();
      ctx.fill();
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sky Background
      ctx.fillStyle = '#0b091f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starry particles background
      ctx.fillStyle = 'rgba(255, 107, 157, 0.05)';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 130, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();

      const state = physicsRef.current;

      if (gameState === 'playing') {
        // Move basket with keyboard arrows
        const basketSpeed = 6;
        if (state.keys.ArrowLeft) {
          state.basketX = Math.max(0, state.basketX - basketSpeed);
        }
        if (state.keys.ArrowRight) {
          state.basketX = Math.min(canvas.width - state.basketWidth, state.basketX + basketSpeed);
        }

        // Spawn falling hearts
        // Higher scores = faster spawn
        const spawnChance = Math.max(0.012, 0.015 + (state.score * 0.0002));
        if (Math.random() < spawnChance && state.hearts.length < 8) {
          const hSize = Math.random() * 12 + 14;
          state.hearts.push({
            x: Math.random() * (canvas.width - hSize),
            y: -hSize * 2,
            size: hSize,
            // Higher scores = faster fall speed
            speed: Math.random() * 1.5 + 2 + Math.min(3, state.score * 0.04)
          });
        }

        // Update falling hearts positions
        state.hearts.forEach((heart, idx) => {
          heart.y += heart.speed;

          // Check Catch colliders
          const basketTop = canvas.height - state.basketHeight - 20;
          const hitX = heart.x + heart.size / 2 >= state.basketX && heart.x + heart.size / 2 <= state.basketX + state.basketWidth;
          const hitY = heart.y + heart.size >= basketTop && heart.y <= basketTop + state.basketHeight;

          if (hitX && hitY) {
            // Heart caught!
            state.score += 1;
            setScore(state.score);
            state.hearts.splice(idx, 1);
          } else if (heart.y > canvas.height) {
            // Heart missed! Lost life
            state.lives -= 1;
            setLives(state.lives);
            state.hearts.splice(idx, 1);

            if (state.lives <= 0) {
              setGameState('gameover');
              onComplete(state.score);
            }
          }
        });
      }

      // Draw Basket (Basket shape with custom cyan glows)
      ctx.fillStyle = '#06b6d4'; // Cyan neon basket
      ctx.strokeStyle = '#8b5cf6'; // Glowing purple border
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#06b6d4';

      const basketTop = canvas.height - state.basketHeight - 20;
      ctx.fillRect(state.basketX, basketTop, state.basketWidth, state.basketHeight);
      ctx.strokeRect(state.basketX, basketTop, state.basketWidth, state.basketHeight);
      
      // Draw a neat heart in center of basket
      ctx.fillStyle = '#ff6b9d';
      ctx.shadowBlur = 0;
      drawHeart(ctx, state.basketX + state.basketWidth / 2 - 5, basketTop + 4, 10);

      // Draw Hearts
      state.hearts.forEach(heart => {
        ctx.fillStyle = '#ff6b9d'; // Glowing pink hearts
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff6b9d';
        
        drawHeart(ctx, heart.x, heart.y, heart.size);
      });

      ctx.shadowBlur = 0; // Reset shadow

      frameId = requestAnimationFrame(render);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    render();

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, [gameState]);

  const startGame = () => {
    physicsRef.current.basketX = 180;
    physicsRef.current.hearts = [];
    physicsRef.current.score = 0;
    physicsRef.current.lives = 5;

    setScore(0);
    setLives(5);
    setGameState('playing');
  };

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center select-none">
      <div className="relative border-4 border-slate-800 rounded-3xl overflow-hidden bg-slate-950 shadow-inner">
        <canvas ref={canvasRef} className="block cursor-crosshair" />

        {/* HUD overlay */}
        <div className="absolute top-4 left-4 font-pixel tracking-widest text-slate-100 bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-2 text-xs z-20 flex items-center gap-1 select-none">
          <span>Hearts: {score}</span>
        </div>

        <div className="absolute top-4 right-4 font-pixel tracking-widest text-arcade-red bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-2 text-xs z-20 flex items-center gap-1 select-none">
          <span>Lives: {Array(Math.max(0, lives)).fill('💖').join('')}</span>
        </div>

        {/* Idle/Welcome screen */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-30">
            <span className="text-6xl mb-4 animate-heartbeat">🧺</span>
            <h3 className="font-pixel text-[11px] text-arcade-red neon-text-red text-center uppercase tracking-widest mb-6">
              CATCH MY HEART
            </h3>
            
            <button
              onClick={startGame}
              className="flex items-center gap-2 bg-gradient-to-r from-arcade-red to-arcade-green text-white font-bold rounded-2xl px-6 py-4 shadow-lg text-sm select-none cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>START COLLECTING</span>
            </button>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-6">
              MOVE MOUSE OR USE KEYBOARD ARROW KEYS
            </p>
          </div>
        )}

        {/* Gameover overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-30">
            <span className="text-5xl mb-2">🥀</span>
            <h3 className="font-pixel text-[11px] text-red-400 text-center uppercase tracking-widest mb-2">
              BASKET BROKE
            </h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6">HEARTS CAUGHT: {score}</p>
            
            <button
              onClick={startGame}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-white hover:text-black text-white border-2 border-slate-800 rounded-2xl px-6 py-3.5 font-bold text-xs tracking-wider uppercase transition-all select-none cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>TEST AGAIN</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatchMyHeart;

