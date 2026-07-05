import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface DinoRunProps {
  onComplete: (score: number) => void;
  onStart?: () => void;
  isPaused?: boolean;
}

const GRAVITY = 0.6;
const JUMP_VELOCITY = -10;
const GROUND_Y = 150;
const DINO_WIDTH = 24;
const DINO_HEIGHT = 26;

// A simple hook to manage the canvas game loop
const DinoRun: React.FC<DinoRunProps> = ({ onComplete, onStart, isPaused = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  
  // Game state refs (to avoid stale closures in requestAnimationFrame)
  const stateRef = useRef({
    gameState: 'idle',
    dino: { y: GROUND_Y, vy: 0, isJumping: false },
    obstacles: [] as { x: number; w: number; h: number }[],
    score: 0,
    speed: 5,
    frameCount: 0,
    lastObstacleFrame: 0,
  });

  const requestRef = useRef<number>();

  // ── Sync state to refs ──
  useEffect(() => {
    stateRef.current.gameState = gameState;
  }, [gameState]);

  // ── Start Game ──
  const startGame = useCallback(() => {
    stateRef.current = {
      gameState: 'playing',
      dino: { y: GROUND_Y, vy: 0, isJumping: false },
      obstacles: [],
      score: 0,
      speed: 5,
      frameCount: 0,
      lastObstacleFrame: 0,
    };
    setGameState('playing');
    setScore(0);
    onStart?.();
  }, [onStart]);

  // ── Jump Logic ──
  const jump = useCallback(() => {
    if (stateRef.current.gameState !== 'playing' || isPaused) return;
    if (!stateRef.current.dino.isJumping) {
      stateRef.current.dino.vy = JUMP_VELOCITY;
      stateRef.current.dino.isJumping = true;
    }
  }, [isPaused]);

  // Handle keyboard / touch
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (stateRef.current.gameState === 'idle' || stateRef.current.gameState === 'gameover') {
          startGame();
        } else {
          jump();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startGame, jump]);

  // ── Game Loop ──
  const update = useCallback(() => {
    if (stateRef.current.gameState !== 'playing' || isPaused) return;
    
    const s = stateRef.current;
    s.frameCount++;

    // 1. Update Dino
    s.dino.vy += GRAVITY;
    s.dino.y += s.dino.vy;

    if (s.dino.y >= GROUND_Y) {
      s.dino.y = GROUND_Y;
      s.dino.vy = 0;
      s.dino.isJumping = false;
    }

    // 2. Generate Obstacles
    // Increase speed slightly over time
    if (s.frameCount % 500 === 0) s.speed += 0.5;

    const minFramesBetween = Math.max(60, 120 - s.speed * 5); // Faster speed = spawn more frequently, but with a cap
    if (s.frameCount - s.lastObstacleFrame > minFramesBetween) {
      // Random chance to spawn
      if (Math.random() < 0.03) {
        // Cactus types
        const type = Math.random();
        let w = 15;
        let h = 30;
        if (type > 0.8) { w = 25; h = 20; } // Short & wide
        else if (type > 0.6) { w = 15; h = 40; } // Tall
        
        s.obstacles.push({ x: 400, w, h });
        s.lastObstacleFrame = s.frameCount;
      }
    }

    // 3. Update Obstacles & Collision
    for (let i = 0; i < s.obstacles.length; i++) {
      const obs = s.obstacles[i];
      obs.x -= s.speed;

      // Collision box for dino (make it slightly smaller than drawing for fairness)
      const dinoBox = { x: 50 + 4, y: s.dino.y - DINO_HEIGHT + 4, w: DINO_WIDTH - 8, h: DINO_HEIGHT - 8 };
      const obsBox = { x: obs.x + 2, y: GROUND_Y - obs.h + 2, w: obs.w - 4, h: obs.h - 4 };

      if (
        dinoBox.x < obsBox.x + obsBox.w &&
        dinoBox.x + dinoBox.w > obsBox.x &&
        dinoBox.y < obsBox.y + obsBox.h &&
        dinoBox.y + dinoBox.h > obsBox.y
      ) {
        // Boom!
        s.gameState = 'gameover';
        setGameState('gameover');
        onComplete(Math.floor(s.score));
        return; // Stop updating
      }
    }

    // Remove off-screen obstacles
    s.obstacles = s.obstacles.filter(o => o.x + o.w > 0);

    // 4. Update Score
    s.score += 0.1;
    setScore(Math.floor(s.score));
  }, [isPaused, onComplete]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const s = stateRef.current;

    // Draw Ground line
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(canvas.width, GROUND_Y);
    ctx.strokeStyle = '#334155'; // slate-700
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Dino (Retro Pixel Art Style)
    const dinoX = 50;
    const dinoY = s.dino.y - DINO_HEIGHT;
    
    const isRunning = s.gameState === 'playing' && !s.dino.isJumping;
    let legState = 0; // 0 = jump/idle, 1 = run left, 2 = run right
    if (isRunning) {
      legState = Math.floor(s.frameCount / 6) % 2 === 0 ? 1 : 2;
    }

    ctx.fillStyle = '#60a5fa'; // Blue body
    
    // Tail
    ctx.fillRect(dinoX, dinoY + 14, 2, 6);
    ctx.fillRect(dinoX + 2, dinoY + 16, 2, 4);
    // Body main
    ctx.fillRect(dinoX + 4, dinoY + 14, 10, 8);
    ctx.fillRect(dinoX + 6, dinoY + 12, 8, 2);
    // Back
    ctx.fillRect(dinoX + 8, dinoY + 10, 6, 2);
    // Neck
    ctx.fillRect(dinoX + 10, dinoY + 6, 4, 4);
    // Head & Snout
    ctx.fillRect(dinoX + 12, dinoY, 10, 6);
    ctx.fillRect(dinoX + 12, dinoY + 6, 4, 2);
    ctx.fillRect(dinoX + 22, dinoY + 2, 2, 4);
    // Arm
    ctx.fillRect(dinoX + 14, dinoY + 14, 4, 2);
    ctx.fillRect(dinoX + 18, dinoY + 16, 2, 2);
    
    // Eye
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(dinoX + 16, dinoY + 2, 2, 2);

    // Legs
    ctx.fillStyle = '#60a5fa';
    if (legState === 0) { // jump / idle
      ctx.fillRect(dinoX + 6, dinoY + 22, 2, 4);
      ctx.fillRect(dinoX + 8, dinoY + 24, 2, 2);
      ctx.fillRect(dinoX + 12, dinoY + 22, 2, 4);
      ctx.fillRect(dinoX + 14, dinoY + 24, 2, 2);
    } else if (legState === 1) { // run 1
      ctx.fillRect(dinoX + 6, dinoY + 22, 2, 2);
      ctx.fillRect(dinoX + 12, dinoY + 22, 2, 4);
      ctx.fillRect(dinoX + 14, dinoY + 24, 2, 2);
    } else if (legState === 2) { // run 2
      ctx.fillRect(dinoX + 6, dinoY + 22, 2, 4);
      ctx.fillRect(dinoX + 8, dinoY + 24, 2, 2);
      ctx.fillRect(dinoX + 12, dinoY + 22, 2, 2);
    }

    // Draw Obstacles (Cacti)
    s.obstacles.forEach(obs => {
      const cx = obs.x;
      const cy = GROUND_Y - obs.h;
      
      ctx.fillStyle = '#4ade80'; // Main green
      ctx.fillRect(cx + obs.w * 0.3, cy, obs.w * 0.4, obs.h); // Trunk
      ctx.fillRect(cx, cy + obs.h * 0.3, obs.w * 0.3, obs.h * 0.3); // Left arm
      ctx.fillRect(cx + obs.w * 0.7, cy + obs.h * 0.2, obs.w * 0.3, obs.h * 0.3); // Right arm
      
      // Connectors
      ctx.fillRect(cx + obs.w * 0.2, cy + obs.h * 0.5, obs.w * 0.1, obs.h * 0.1); 
      ctx.fillRect(cx + obs.w * 0.7, cy + obs.h * 0.4, obs.w * 0.1, obs.h * 0.1);

      // Dark green detail line
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(cx + obs.w * 0.45, cy, obs.w * 0.1, obs.h);
    });
  }, []);

  const tick = useCallback(() => {
    update();
    draw();
    requestRef.current = requestAnimationFrame(tick);
  }, [update, draw]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(tick);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [tick]);

  return (
    <div className="w-full flex flex-col items-center select-none py-4 px-2">
      {/* HUD Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-6 px-2">
        <h2 className="font-pixel text-slate-300 tracking-widest text-sm uppercase">
          DINO RUN
        </h2>
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-right">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-0.5">SCORE</span>
          <span className="font-pixel text-xl text-white block leading-none">{score}</span>
        </div>
      </div>

      {/* Game Area */}
      <div 
        className="relative w-full max-w-md h-48 bg-slate-950 border-2 border-slate-800 rounded-2xl overflow-hidden cursor-pointer"
        onPointerDown={(e) => {
          e.preventDefault();
          if (gameState === 'playing') jump();
        }}
      >
        <canvas
          ref={canvasRef}
          width={400}
          height={192} // h-48 = 12rem = 192px
          className="w-full h-full object-contain pointer-events-none"
        />

        {/* Start Overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-30">
            <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-5xl mb-4 text-blue-400">🦕</motion.span>
            <h3 className="font-pixel text-[11px] text-blue-400 text-center uppercase tracking-widest mb-6">
              ENDLESS RUNNER
            </h3>
            <button
              onClick={startGame}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-2xl px-6 py-4 shadow-lg text-sm select-none transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>START GAME</span>
            </button>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-4">
              PRESS SPACE OR TAP TO JUMP
            </p>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-30">
            <span className="text-5xl mb-3">💥</span>
            <h3 className="font-pixel text-[11px] text-red-400 text-center uppercase tracking-widest mb-1">
              GAME OVER
            </h3>
            <p className="text-slate-300 font-bold text-xs uppercase tracking-widest mb-6">
              SCORE: {score}
            </p>
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
      
      {/* Mobile controls hint */}
      <div className="md:hidden mt-6 flex items-center justify-center text-slate-500 text-xs gap-2 font-bold uppercase tracking-widest">
        <ArrowUp className="w-4 h-4" /> Tap game to jump
      </div>
    </div>
  );
};

export default DinoRun;
