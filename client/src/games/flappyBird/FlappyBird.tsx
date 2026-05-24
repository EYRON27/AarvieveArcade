import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface FlappyBirdProps {
  onComplete: (score: number) => void;
  onStart?: () => void;
  isPaused?: boolean;
}

const FlappyBird: React.FC<FlappyBirdProps> = ({ onComplete, onStart, isPaused = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);

  // Use refs for physical loop values to avoid React delay
  const physicsRef = useRef({
    birdY: 200,
    birdVelocity: 0,
    gravity: 0.08,
    jumpPower: -3.5,
    pipes: [] as Array<{ x: number; topHeight: number; bottomHeight: number; passed: boolean }>,
    pipeSpeed: 1.2,
    pipeSpacing: 300,
    pipeWidth: 50,
    gapHeight: 200,
    groundY: 420,
    score: 0,
    lastTime: 0
  });

  const triggerJump = () => {
    if (isPaused) return;
    if (gameState === 'idle') {
      physicsRef.current.birdY = 200;
      physicsRef.current.birdVelocity = physicsRef.current.jumpPower;
      physicsRef.current.pipes = [];
      physicsRef.current.score = 0;
      setScore(0);
      setGameState('playing');
      onStart?.();
    } else if (gameState === 'playing') {
      physicsRef.current.birdVelocity = physicsRef.current.jumpPower;
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      triggerJump();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameState]);

  // Adjust canvas size to parent container
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

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw beautiful starry background sky
      ctx.fillStyle = '#0f0c26';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw glowing background pink bubble/moon
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2 + 30, 120, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 107, 157, 0.05)';
      ctx.fill();
      ctx.closePath();

      // 2. Physics & Pipes logic
      const state = physicsRef.current;
      if (gameState === 'playing' && !isPaused) {
        // Apply gravity
        state.birdVelocity += state.gravity;
        state.birdY += state.birdVelocity;

        // Create new pipes
        if (state.pipes.length === 0 || state.pipes[state.pipes.length - 1].x < canvas.width - state.pipeSpacing) {
          const minHeight = 40;
          const maxHeight = state.groundY - state.gapHeight - minHeight;
          const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
          
          state.pipes.push({
            x: canvas.width,
            topHeight,
            bottomHeight: state.groundY - state.gapHeight - topHeight,
            passed: false
          });
        }

        // Update pipe positions
        state.pipes.forEach((p) => {
          p.x -= state.pipeSpeed;

          // Check if bird passed pipe
          if (!p.passed && p.x + state.pipeWidth < 100) {
            p.passed = true;
            state.score += 1;
            setScore(state.score);
          }

          // Collisions
          const birdRadius = 12;
          const birdX = 100;
          
          // Check collision with top pipe
          const collideTop = 
            birdX + birdRadius > p.x && 
            birdX - birdRadius < p.x + state.pipeWidth && 
            state.birdY - birdRadius < p.topHeight;

          // Check collision with bottom pipe
          const collideBottom = 
            birdX + birdRadius > p.x && 
            birdX - birdRadius < p.x + state.pipeWidth && 
            state.birdY + birdRadius > state.groundY - p.bottomHeight;

          if (collideTop || collideBottom) {
            setGameState('gameover');
            onComplete(state.score);
          }
        });

        // Filter out pipes that went off screen
        state.pipes = state.pipes.filter(p => p.x > -state.pipeWidth);

        // Ground / Roof collision
        if (state.birdY + 12 >= state.groundY || state.birdY - 12 <= 0) {
          setGameState('gameover');
          onComplete(state.score);
        }
      }

      // 3. Draw Pipes
      state.pipes.forEach(p => {
        ctx.fillStyle = '#8b5cf6'; // Dark purple pipes
        ctx.strokeStyle = '#ff6b9d'; // Glowing pink trim
        ctx.lineWidth = 3;

        // Top Pipe
        ctx.fillRect(p.x, 0, state.pipeWidth, p.topHeight);
        ctx.strokeRect(p.x, 0, state.pipeWidth, p.topHeight);
        // Top Pipe lip
        ctx.fillStyle = '#ff6b9d';
        ctx.fillRect(p.x - 4, p.topHeight - 12, state.pipeWidth + 8, 12);
        ctx.strokeRect(p.x - 4, p.topHeight - 12, state.pipeWidth + 8, 12);

        // Bottom Pipe
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(p.x, state.groundY - p.bottomHeight, state.pipeWidth, p.bottomHeight);
        ctx.strokeRect(p.x, state.groundY - p.bottomHeight, state.pipeWidth, p.bottomHeight);
        // Bottom Pipe lip
        ctx.fillStyle = '#ff6b9d';
        ctx.fillRect(p.x - 4, state.groundY - p.bottomHeight, state.pipeWidth + 8, 12);
        ctx.strokeRect(p.x - 4, state.groundY - p.bottomHeight, state.pipeWidth + 8, 12);
      });

      // 4. Draw Ground
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(0, state.groundY, canvas.width, canvas.height - state.groundY);
      
      ctx.fillStyle = '#ff6b9d'; // Heart pink top ground border
      ctx.fillRect(0, state.groundY, canvas.width, 4);

      // 5. Draw Bird (Cute pink character with a heart trail)
      const birdX = 100;
      const birdY = state.birdY;
      
      // Heart background trace
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff6b9d';

      ctx.beginPath();
      ctx.arc(birdX, birdY, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#ff6b9d';
      ctx.fill();
      ctx.closePath();
      
      // Eye
      ctx.beginPath();
      ctx.arc(birdX + 6, birdY - 4, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.closePath();
      ctx.beginPath();
      ctx.arc(birdX + 7, birdY - 4, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = 'black';
      ctx.fill();
      ctx.closePath();

      // Wing (flapping rotation)
      ctx.beginPath();
      ctx.ellipse(birdX - 6, birdY + 2, 7, 5, (gameState === 'playing' ? Math.sin(Date.now() / 60) * 0.4 : 0), 0, Math.PI * 2);
      ctx.fillStyle = '#fde68a'; // Yellow wings
      ctx.fill();
      ctx.closePath();

      // Beak
      ctx.beginPath();
      ctx.moveTo(birdX + 11, birdY);
      ctx.lineTo(birdX + 18, birdY + 3);
      ctx.lineTo(birdX + 11, birdY + 6);
      ctx.fillStyle = '#ffab76'; // Peach beak
      ctx.fill();
      ctx.closePath();

      ctx.shadowBlur = 0; // Reset shadow

      // Loop
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, isPaused]);

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center select-none">
      <div className="relative border-4 border-slate-800 rounded-3xl overflow-hidden bg-slate-950 shadow-inner">
        <canvas ref={canvasRef} onClick={triggerJump} className="block cursor-pointer" />

        {/* HUD overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 font-pixel tracking-widest text-slate-100 bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-2 text-center text-lg z-20">
          {score}
        </div>

        {/* Idle/Welcome screen */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-30">
            <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-6xl mb-4">🐦</motion.span>
            <h3 className="font-pixel text-[11px] text-arcade-red neon-text-red text-center uppercase tracking-widest mb-6">
              FLAPPY BIRD
            </h3>
            
            <button
              onClick={triggerJump}
              className="flex items-center gap-2 bg-gradient-to-r from-arcade-red to-arcade-blue text-white font-bold rounded-2xl px-6 py-4 shadow-lg text-sm select-none animate-pulse cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>TAP TO FLAP</span>
            </button>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-6">
              OR PRESS SPACE / UP ARROW
            </p>
          </div>
        )}

        {/* Gameover overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-30">
            <span className="text-5xl mb-2">💥</span>
            <h3 className="font-pixel text-[11px] text-red-400 text-center uppercase tracking-widest mb-2">
              CABINET CRASHED
            </h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6">FINAL SCORE: {score}</p>
            
            <button
              onClick={() => {
                physicsRef.current.birdY = 200;
                physicsRef.current.birdVelocity = 0;
                physicsRef.current.pipes = [];
                physicsRef.current.score = 0;
                setScore(0);
                setGameState('playing');
              }}
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

export default FlappyBird;

