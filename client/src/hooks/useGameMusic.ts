import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';

// ── Note frequencies (Hz) ─────────────────────────────────────────────────
const NOTE: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.5, D6: 1174.66,
};

// ── Per-game music definitions ────────────────────────────────────────────
interface MusicDef {
  bpm: number;
  melody: (string | null)[];
  bass: (string | null)[];
  waveform: OscillatorType;
  bassWave: OscillatorType;
  melodyVolume: number;
  bassVolume: number;
}

const GAME_MUSIC: Record<string, MusicDef> = {
  flappyBird: {
    bpm: 160,
    melody: ['C5','E5','G5','C6','B5','G5','E5','C5','D5','F5','A5','D6','C6','A5','F5','D5'],
    bass:   ['C3',null,'G3',null,'C3',null,'G3',null,'F3',null,'C4',null,'G3',null,'C3',null],
    waveform: 'square', bassWave: 'sawtooth', melodyVolume: 0.12, bassVolume: 0.08,
  },
  snake: {
    bpm: 140,
    melody: ['A4','C5','E5','G5','F5','D5','B4','G4','A4','E5','C5','A5','G5','E5','C5','A4'],
    bass:   ['A2',null,null,null,'E3',null,null,null,'D3',null,null,null,'A2',null,null,null],
    waveform: 'sawtooth', bassWave: 'sawtooth', melodyVolume: 0.1, bassVolume: 0.1,
  },
  ticTacToe: {
    bpm: 100,
    melody: ['C4',null,'E4',null,'G4',null,'E4',null,'D4',null,'F4',null,'A4',null,'F4',null],
    bass:   ['C3',null,null,null,'G3',null,null,null,'F3',null,null,null,'C3',null,null,null],
    waveform: 'triangle', bassWave: 'sine', melodyVolume: 0.08, bassVolume: 0.06,
  },
  memoryGame: {
    bpm: 90,
    melody: ['E5',null,'D5',null,'C5',null,'D5',null,'E5',null,'E5',null,'D5',null,'D5',null],
    bass:   ['C3',null,null,null,null,null,null,null,'G3',null,null,null,null,null,null,null],
    waveform: 'sine', bassWave: 'sine', melodyVolume: 0.09, bassVolume: 0.05,
  },
  puzzle2048: {
    bpm: 110,
    melody: ['G4','A4','B4','C5','D5','E5','D5','C5','B4','A4','G4','F4','E4','D4','E4','F4'],
    bass:   ['C3',null,'G3',null,'A3',null,'E3',null,'F3',null,'C3',null,'G2',null,'C3',null],
    waveform: 'triangle', bassWave: 'sawtooth', melodyVolume: 0.1, bassVolume: 0.07,
  },
  sudoku: {
    bpm: 75,
    melody: ['C5',null,null,'E5',null,null,'G5',null,null,'E5',null,null,'D5',null,null,'C5'],
    bass:   ['C3',null,null,null,null,null,'G3',null,null,null,null,null,'F3',null,null,null],
    waveform: 'sine', bassWave: 'sine', melodyVolume: 0.07, bassVolume: 0.05,
  },
  neonSequence: {
    bpm: 130,
    melody: ['A5','G5','F5','E5','D5','C5','D5','E5','F5','G5','A5','B5','C6','B5','A5','G5'],
    bass:   ['A3',null,null,null,'E3',null,null,null,'D3',null,null,null,'A3',null,null,null],
    waveform: 'sawtooth', bassWave: 'square', melodyVolume: 0.11, bassVolume: 0.09,
  },
  spaceDodger: {
    bpm: 120,
    melody: ['E5',null,'G5',null,'B5',null,'A5',null,'G5',null,'E5',null,'D5',null,'C5',null],
    bass:   ['E2',null,null,null,'B2',null,null,null,'A2',null,null,null,'G2',null,null,null],
    waveform: 'sawtooth', bassWave: 'square', melodyVolume: 0.1, bassVolume: 0.09,
  },
  brickBreaker: {
    bpm: 150,
    melody: ['C5','E5','G5','E5','C5','E5','G5','C6','B5','G5','E5','G5','B5','G5','E5','C5'],
    bass:   ['C3',null,'C3',null,'G3',null,'G3',null,'A3',null,'A3',null,'G3',null,'G3',null],
    waveform: 'square', bassWave: 'sawtooth', melodyVolume: 0.13, bassVolume: 0.1,
  },
  whackABug: {
    bpm: 170,
    melody: ['G5','F5','E5','D5','C5','D5','E5','F5','G5','A5','B5','A5','G5','F5','E5','D5'],
    bass:   ['G3',null,null,null,'C3',null,null,null,'D3',null,null,null,'G3',null,null,null],
    waveform: 'square', bassWave: 'square', melodyVolume: 0.12, bassVolume: 0.09,
  },
  reactionGame: {
    bpm: 80,
    melody: [null,null,null,null,'E4',null,null,null,null,null,null,null,'E4',null,null,null],
    bass:   ['A2',null,null,null,null,null,null,null,'E3',null,null,null,null,null,null,null],
    waveform: 'sine', bassWave: 'sine', melodyVolume: 0.06, bassVolume: 0.07,
  },
  catchMyHeart: {
    bpm: 100,
    melody: ['C5','E5','G5','E5','F5','A5','C6','A5','G5','E5','G5','E5','D5','F5','A5','F5'],
    bass:   ['C3',null,null,null,'F3',null,null,null,'G3',null,null,null,'C3',null,null,null],
    waveform: 'sine', bassWave: 'sine', melodyVolume: 0.1, bassVolume: 0.06,
  },
  relationshipTrivia: {
    bpm: 120,
    melody: ['G5','E5','C5','E5','G5','C6','B5','G5','A5','F5','D5','F5','A5','D6','C6','A5'],
    bass:   ['C3',null,'G3',null,'A3',null,'E3',null,'F3',null,'C3',null,'G2',null,'C3',null],
    waveform: 'triangle', bassWave: 'sawtooth', melodyVolume: 0.11, bassVolume: 0.07,
  },
};

// ── Hook ─────────────────────────────────────────────────────────────────
export function useGameMusic(gameId: string | undefined, isActive: boolean) {
  const { musicEnabled, setIsGameMusicPlaying } = useGameStore();
  const ctxRef     = useRef<AudioContext | null>(null);
  const masterRef  = useRef<GainNode | null>(null);
  const schedulerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef    = useRef(0);
  const isPlayingRef = useRef(false);

  const getDef = useCallback(() => {
    return gameId ? (GAME_MUSIC[gameId] || GAME_MUSIC.flappyBird) : null;
  }, [gameId]);

  const stopMusic = useCallback(() => {
    if (schedulerRef.current) {
      clearInterval(schedulerRef.current);
      schedulerRef.current = null;
    }
    if (masterRef.current) {
      try {
        masterRef.current.gain.setTargetAtTime(0, ctxRef.current!.currentTime, 0.1);
      // eslint-disable-next-line no-empty
      } catch { }
    }
    isPlayingRef.current = false;
    setIsGameMusicPlaying(false);
  }, [setIsGameMusicPlaying]);

  const startMusic = useCallback(() => {
    if (isPlayingRef.current) return;
    const def = getDef();
    if (!def) return;

    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext();
    }
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    // Master gain
    if (!masterRef.current) {
      masterRef.current = ctx.createGain();
      masterRef.current.gain.value = musicEnabled ? 1 : 0;
      masterRef.current.connect(ctx.destination);
    } else {
      masterRef.current.gain.setTargetAtTime(musicEnabled ? 1 : 0, ctx.currentTime, 0.05);
    }

    const beatDuration = 60 / def.bpm / 4; // 16th note duration in seconds
    stepRef.current = 0;
    isPlayingRef.current = true;
    setIsGameMusicPlaying(true);

    const playNote = (freq: number, vol: number, wave: OscillatorType, time: number, duration: number) => {
      if (!ctx || !masterRef.current) return;
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type      = wave;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(vol, time + 0.01);
      gain.gain.setTargetAtTime(0, time + duration * 0.7, 0.04);
      osc.connect(gain);
      gain.connect(masterRef.current);
      osc.start(time);
      osc.stop(time + duration + 0.05);
    };

    schedulerRef.current = setInterval(() => {
      if (!isPlayingRef.current || !ctxRef.current) return;
      const ctx2 = ctxRef.current;
      const now  = ctx2.currentTime;
      const step = stepRef.current % def.melody.length;
      const melNote = def.melody[step];
      const bassNote = def.bass[step];

      if (melNote && NOTE[melNote]) {
        playNote(NOTE[melNote], def.melodyVolume, def.waveform, now, beatDuration * 0.85);
      }
      if (bassNote && NOTE[bassNote]) {
        playNote(NOTE[bassNote], def.bassVolume, def.bassWave, now, beatDuration * 3.5);
      }
      stepRef.current = step + 1;
    }, beatDuration * 1000);
  }, [getDef, musicEnabled, setIsGameMusicPlaying]);

  // Start/stop based on isActive
  useEffect(() => {
    if (isActive && musicEnabled) {
      startMusic();
    } else {
      stopMusic();
    }
    return stopMusic;
  }, [isActive, musicEnabled, startMusic, stopMusic]);

  // Mute/unmute master gain when musicEnabled changes while playing
  useEffect(() => {
    if (masterRef.current && ctxRef.current) {
      masterRef.current.gain.setTargetAtTime(
        musicEnabled ? 1 : 0,
        ctxRef.current.currentTime,
        0.1
      );
    }
  }, [musicEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMusic();
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
      }
      masterRef.current = null;
    };
  }, [stopMusic]);
}
