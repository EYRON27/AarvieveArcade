import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface SpaceDodgerProps {
  onComplete: (score: number) => void;
  onStart?: () => void;
  isPaused?: boolean;
}

const SpaceDodger: React.FC<SpaceDodgerProps> = ({ onComplete, onStart, isPaused = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);

  const physicsRef = useRef({
    playerX: 240,
    playerY: 400,
    playerSpeed: 6,
    playerWidth: 30,
    playerHeight: 40,
    movingLeft: false,
    movingRight: false,
    asteroids: [] as Array<{ x: number; y: number; size: number; speed: number; color: string; rot: number }>,
    asteroidSpawnTimer: 0,
    asteroidSpawnRate: 60, // Frames between spawns
    score: 0
  });

  const ASTEROID_COLORS = ['#94a3b8', '#64748b', '#475569', '#cbd5e1'];

  const startGame = () => {
    physicsRef.current = {
      playerX: 240,
      playerY: 400,
      playerSpeed: 6,
      playerWidth: 30,
      playerHeight: 40,
      movingLeft: false,
      movingRight: false,
      asteroids: [],
      asteroidSpawnTimer: 0,
      asteroidSpawnRate: 60,
      score: 0
    };
    setScore(0);
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

  // Responsive canvas sizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = Math.min(container.clientWidth, 480);
        canvas.height = 450;
        physicsRef.current.playerY = canvas.height - 50;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw starry space background
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Twinkling stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for(let i=0; i<30; i++) {
        const x = (Math.sin(i * 123 + Date.now()/1000) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(i * 321 + Date.now()/1200) * 0.5 + 0.5) * canvas.height;
        ctx.fillRect(x, y, 2, 2);
      }

      const state = physicsRef.current;

      if (gameState === 'playing' && !isPaused) {
        // Player movement
        if (state.movingLeft) state.playerX -= state.playerSpeed;
        if (state.movingRight) state.playerX += state.playerSpeed;

        // Boundaries
        if (state.playerX < state.playerWidth / 2) state.playerX = state.playerWidth / 2;
        if (state.playerX > canvas.width - state.playerWidth / 2) state.playerX = canvas.width - state.playerWidth / 2;

        // Spawn Asteroids
        state.asteroidSpawnTimer++;
        if (state.asteroidSpawnTimer > state.asteroidSpawnRate) {
          const size = Math.random() * 20 + 15;
          state.asteroids.push({
            x: Math.random() * (canvas.width - size * 2) + size,
            y: -size,
            size,
            speed: Math.random() * 2 + 2 + (state.score * 0.05), // Speeds up slightly as score goes up
            color: ASTEROID_COLORS[Math.floor(Math.random() * ASTEROID_COLORS.length)],
            rot: Math.random() * Math.PI * 2
          });
          state.asteroidSpawnTimer = 0;
          // Spawn rate increases as score goes up
          state.asteroidSpawnRate = Math.max(20, 60 - Math.floor(state.score / 2));
        }

        // Update Asteroids
        for (let i = state.asteroids.length - 1; i >= 0; i--) {
          const ast = state.asteroids[i];
          ast.y += ast.speed;
          ast.rot += 0.02;

          // Check collision
          const dx = ast.x - state.playerX;
          const dy = ast.y - state.playerY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < ast.size + state.playerWidth / 2 - 5) {
            setGameState('gameover');
            onComplete(state.score);
          }

          // Off screen
          if (ast.y > canvas.height + ast.size) {
            state.asteroids.splice(i, 1);
            state.score += 1;
            setScore(state.score);
          }
        }
      }

      // Draw Player (Spaceship)
      ctx.save();
      ctx.translate(state.playerX, state.playerY);
      
      // Thruster flame
      if (gameState === 'playing') {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(-8, 10);
        ctx.lineTo(8, 10);
        ctx.lineTo(0, 15 + Math.random() * 10);
        ctx.fill();
        ctx.closePath();
      }

      // Ship body
      ctx.fillStyle = '#38bdf8'; // light blue
      ctx.beginPath();
      ctx.moveTo(0, -state.playerHeight / 2);
      ctx.lineTo(state.playerWidth / 2, state.playerHeight / 2);
      ctx.lineTo(-state.playerWidth / 2, state.playerHeight / 2);
      ctx.fill();
      ctx.closePath();
      
      // Cockpit
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.arc(0, -5, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();

      ctx.restore();

      // Draw Asteroids
      state.asteroids.forEach(ast => {
        ctx.save();
        ctx.translate(ast.x, ast.y);
        ctx.rotate(ast.rot);
        ctx.fillStyle = ast.color;
        
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const r = ast.size * (0.8 + Math.random() * 0.2); // slight jaggedness
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        
        // Crater
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.arc(-ast.size/3, -ast.size/3, ast.size/4, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        ctx.restore();
      });

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
          SPACE DODGER
        </h2>
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-0.5">SCORE</span>
          <span className="font-pixel text-xl text-white block leading-none">{score}</span>
        </div>
      </div>

      <div className="relative border-4 border-slate-800 rounded-3xl overflow-hidden bg-slate-950 shadow-[0_0_50px_rgba(56,189,248,0.1)]">
        <canvas ref={canvasRef} className="block" />

        {/* Start Screen */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-30">
            <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">🚀</motion.span>
            <h3 className="font-pixel text-[11px] text-arcade-blue text-center uppercase tracking-widest mb-6">
              DODGE THE ASTEROIDS
            </h3>
            <button
              onClick={startGame}
              className="flex items-center gap-2 bg-gradient-to-r from-arcade-blue to-cyan-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-2xl px-6 py-4 shadow-lg text-sm select-none animate-pulse transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>LAUNCH SHIP</span>
            </button>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-6 text-center">
              USE ARROW KEYS OR BUTTONS TO MOVE
            </p>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-30">
            <span className="text-5xl mb-2">💥</span>
            <h3 className="font-pixel text-[11px] text-red-400 text-center uppercase tracking-widest mb-2">
              SHIP DESTROYED
            </h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6">SURVIVAL SCORE: {score}</p>
            <button
              onClick={startGame}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-white hover:text-black text-white border-2 border-slate-800 rounded-2xl px-6 py-3.5 font-bold text-xs tracking-wider uppercase transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
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

export default SpaceDodger;
