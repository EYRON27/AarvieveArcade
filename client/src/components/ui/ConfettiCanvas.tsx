import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../store/gameStore';

const ConfettiCanvas: React.FC = () => {
  const showConfetti = useGameStore(state => state.showConfetti);

  useEffect(() => {
    if (!showConfetti) return;

    // Main burst — red/green/blue palette
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#ef4444', '#22c55e', '#3b82f6', '#ffffff']
    });

    // Side bursts
    const duration = 2000;
    const end = Date.now() + duration;
    const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 100 };
    const rnd = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      const timeLeft = end - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const count = 40 * (timeLeft / duration);
      confetti({ ...defaults, particleCount: count, origin: { x: rnd(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#ef4444', '#22c55e'] });
      confetti({ ...defaults, particleCount: count, origin: { x: rnd(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#3b82f6', '#ffffff'] });
    }, 250);

    return () => clearInterval(interval);
  }, [showConfetti]);

  return null;
};

export default ConfettiCanvas;
