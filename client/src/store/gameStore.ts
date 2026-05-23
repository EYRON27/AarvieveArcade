import { create } from 'zustand';
import {
  collection, getDocs, query, where, addDoc,
  doc, getDoc, updateDoc, arrayUnion, increment
} from 'firebase/firestore';
import { db, isMockFirebase } from '../services/firebase';
import { MockStorage } from '../services/mockData';
import type { Achievement, GameScore, GalleryItem } from '../types';

// ── All achievement definitions (source of truth) ─────────────────────────
const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'welcome',         title: 'Welcome to the Arcade',    description: 'Create your account and enter Aarvieve Arcade.',       icon: '🎮', points: 10, isUnlocked: false, category: 'general' },
  { id: 'flappy_pro',      title: 'Flappy Pro',               description: 'Score 15+ points in Flappy Bird.',                      icon: '🐦', points: 30, isUnlocked: false, category: 'gaming'  },
  { id: 'snake_century',   title: 'Snake Century',            description: 'Reach a score of 100 in Snake.',                        icon: '🐍', points: 30, isUnlocked: false, category: 'gaming'  },
  { id: 'tic_winner',      title: 'Strategy Master',          description: 'Beat the AI in Tic-Tac-Toe.',                           icon: '❌', points: 20, isUnlocked: false, category: 'gaming'  },
  { id: 'memory_speed',    title: 'Photographic Memory',      description: 'Match all cards in under 30 seconds.',                  icon: '🧠', points: 40, isUnlocked: false, category: 'gaming'  },
  { id: 'puzzle_master',   title: 'Puzzle Master',            description: 'Merge tiles to reach the 2048 tile.',                   icon: '🧩', points: 50, isUnlocked: false, category: 'gaming'  },
  { id: 'sudoku_master',   title: 'Sudoku Master',            description: 'Solve a Sudoku puzzle.',                                icon: '🔢', points: 60, isUnlocked: false, category: 'gaming'  },
  { id: 'neon_god',        title: 'Neon God',                 description: 'Reach a sequence of 10 in Neon Sequence.',              icon: '👁️', points: 40, isUnlocked: false, category: 'gaming'  },
  { id: 'space_survivor',  title: 'Space Survivor',           description: 'Survive an asteroid field and score 50 points.',        icon: '🚀', points: 30, isUnlocked: false, category: 'gaming'  },
  { id: 'brick_smasher',   title: 'Demolition Expert',        description: 'Clear all the bricks to win the game.',                 icon: '🧱', points: 40, isUnlocked: false, category: 'gaming'  },
  { id: 'bug_squasher',    title: 'Bug Squasher',             description: 'Whack 30 bugs in 30 seconds.',                          icon: '🐛', points: 25, isUnlocked: false, category: 'gaming'  },
  { id: 'lightning',       title: 'Lightning Reflex',         description: 'Get a reaction time under 250ms.',                      icon: '⚡', points: 25, isUnlocked: false, category: 'gaming'  },
  { id: 'heart_hunter',    title: 'Heart Hunter',             description: 'Catch 50 hearts in Catch My Heart.',                    icon: '🧺', points: 30, isUnlocked: false, category: 'gaming'  },
  { id: 'trivia_master',   title: 'Trivia Master',            description: 'Score 100/100 in Arcade Trivia.',                       icon: '👑', points: 50, isUnlocked: false, category: 'gaming'  },
  { id: 'perfectionist',   title: 'Perfectionist',            description: 'Achieve a personal best in any 3 different games.',     icon: '🏅', points: 35, isUnlocked: false, category: 'special' },
  { id: 'high_roller',     title: 'High Roller',              description: 'Accumulate 200 total points across all games.',         icon: '🎰', points: 50, isUnlocked: false, category: 'special' },
];

const ALL_GALLERY: GalleryItem[] = [
  { id: 'pixel_city',  title: 'Pixel City 🌆',   description: 'A vibrant neon pixel-art cityscape.', imageUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=600&auto=format&fit=crop', unlockCondition: 'Unlock: Score 15+ in Flappy Bird.', isUnlocked: false },
  { id: 'retro_lab',   title: 'Retro Lab 🕹️',    description: 'The secret back room of Aarvieve games.', imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop', unlockCondition: 'Unlock: Beat the AI in Tic-Tac-Toe.', isUnlocked: false },
  { id: 'hall_of_fame', title: 'Hall of Fame 🏆', description: 'The legendary leaderboard hall.', imageUrl: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=600&auto=format&fit=crop', unlockCondition: 'Unlock: Score 100+ in Snake or earn 5+ achievements.', isUnlocked: false },
];

const ALL_GAME_IDS = ['flappyBird', 'snake', 'ticTacToe', 'memoryGame', 'puzzle2048', 'sudoku', 'neonSequence', 'spaceDodger', 'brickBreaker', 'whackABug', 'reactionGame', 'catchMyHeart', 'relationshipTrivia'];

interface GameStoreState {
  achievements: Achievement[];
  gallery:      GalleryItem[];
  scores:       Record<string, GameScore[]>;
  musicEnabled: boolean;
  activeGameId: string | null;
  loadingData:  boolean;
  showConfetti: boolean;

  toggleMusic:      () => void;
  setActiveGameId:  (gameId: string | null) => void;
  triggerConfetti:  () => void;
  fetchInitialData: (userId: string) => Promise<void>;
  saveGameScore:    (userId: string, displayName: string, gameId: string, score: number) => Promise<GameScore>;
  unlockAchievement:(userId: string, achievementId: string) => Promise<void>;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  achievements: [],
  gallery:      [],
  scores:       {},
  musicEnabled: true,
  activeGameId: null,
  loadingData:  false,
  showConfetti: false,

  toggleMusic:     () => set(s => ({ musicEnabled: !s.musicEnabled })),
  setActiveGameId: (gameId) => set({ activeGameId: gameId }),

  triggerConfetti: () => {
    set({ showConfetti: true });
    setTimeout(() => set({ showConfetti: false }), 4000);
  },

  fetchInitialData: async (userId: string) => {
    set({ loadingData: true });
    try {
      if (isMockFirebase) {
        const scores: Record<string, GameScore[]> = {};
        ALL_GAME_IDS.forEach(gId => { scores[gId] = MockStorage.getScores(gId); });
        set({
          achievements: MockStorage.getAchievements(),
          gallery:      MockStorage.getGallery(),
          scores,
          loadingData:  false
        });
        return;
      }

      // ── Real Firebase: fetch scores + user's unlocked achievements ──────
      // 1. Get user's unlocked achievement IDs from their user doc
      const userDoc = await getDoc(doc(db, 'users', userId));
      const unlockedIds: string[] = userDoc.exists()
        ? (userDoc.data().unlockedAchievements || [])
        : [];

      // 2. Merge with master achievement list (source of truth = client)
      const mergedAchievements = ALL_ACHIEVEMENTS.map(a => ({
        ...a,
        isUnlocked: unlockedIds.includes(a.id),
        unlockedAt: unlockedIds.includes(a.id) ? (userDoc.data()?.achievementDates?.[a.id] || undefined) : undefined,
      }));

      // 3. Gallery unlocks based on achievements
      const mergedGallery = ALL_GALLERY.map(g => {
        const unlocked =
          (g.id === 'pixel_city'    && unlockedIds.includes('flappy_pro'))   ||
          (g.id === 'retro_lab'     && unlockedIds.includes('tic_winner'))    ||
          (g.id === 'hall_of_fame'  && (unlockedIds.includes('snake_century') || unlockedIds.length >= 5));
        return { ...g, isUnlocked: unlocked };
      });

      // 4. Fetch all scores from Firestore in parallel — simple where only (no index needed)
      const scorePromises = ALL_GAME_IDS.map(gId =>
        getDocs(query(
          collection(db, 'scores'),
          where('gameId', '==', gId)
        )).then(snap => ({
          gId,
          scores: snap.docs
            .map(d => ({ id: d.id, ...d.data() } as GameScore))
            .sort((a, b) => gId === 'reactionGame' ? a.score - b.score : b.score - a.score)
            .slice(0, 10) // top 10 client-side
        }))
      );

      const scoreResults = await Promise.all(scorePromises);
      const fbScores: Record<string, GameScore[]> = {};
      scoreResults.forEach(({ gId, scores }) => { fbScores[gId] = scores; });

      set({
        achievements: mergedAchievements,
        gallery:      mergedGallery,
        scores:       fbScores,
        loadingData:  false
      });
    } catch (err) {
      console.error('Firestore fetch failed, falling back to mock:', err);
      const scores: Record<string, GameScore[]> = {};
      ALL_GAME_IDS.forEach(gId => { scores[gId] = MockStorage.getScores(gId); });
      set({ achievements: MockStorage.getAchievements(), gallery: MockStorage.getGallery(), scores, loadingData: false });
    }
  },

  saveGameScore: async (userId, displayName, gameId, score) => {
    try {
      if (isMockFirebase) {
        const newScore = MockStorage.saveScore(gameId, score);
        const updatedScores = { ...get().scores };
        updatedScores[gameId] = MockStorage.getScores(gameId);
        const updatedAch = MockStorage.getAchievements();
        const updatedGal = MockStorage.getGallery();
        if (updatedAch.filter(a => a.isUnlocked).length > get().achievements.filter(a => a.isUnlocked).length) {
          get().triggerConfetti();
        }
        set({ scores: updatedScores, achievements: updatedAch, gallery: updatedGal });
        return newScore;
      }

      // Save score to Firestore
      const data = { userId, userDisplayName: displayName, gameId, score, timestamp: new Date().toISOString() };
      const ref  = await addDoc(collection(db, 'scores'), data);

      // Update local scores immediately (no need to refetch)
      const updatedScores = { ...get().scores };
      const list = [...(updatedScores[gameId] || []), { id: ref.id, ...data }]
        .sort((a, b) => gameId === 'reactionGame' ? a.score - b.score : b.score - a.score)
        .slice(0, 10);
      updatedScores[gameId] = list;
      set({ scores: updatedScores });
      return { id: ref.id, ...data };
    } catch (e) {
      console.error('Score save failed, using local fallback:', e);
      return MockStorage.saveScore(gameId, score);
    }
  },

  unlockAchievement: async (userId, achievementId) => {
    try {
      if (isMockFirebase) {
        const unlocked = MockStorage.unlockAchievement(achievementId);
        if (unlocked) {
          get().triggerConfetti();
          set({ achievements: MockStorage.getAchievements(), gallery: MockStorage.getGallery() });
        }
        return;
      }

      const achievements = get().achievements;
      const idx = achievements.findIndex(a => a.id === achievementId);
      if (idx < 0 || achievements[idx].isUnlocked) return; // Already unlocked

      const achievement  = achievements[idx];
      const unlockedAt   = new Date().toISOString();

      // ── Write to Firestore: add to user's unlockedAchievements array ───
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        unlockedAchievements: arrayUnion(achievementId),           // add to array
        [`achievementDates.${achievementId}`]: unlockedAt,          // record unlock date
        totalPoints: increment(achievement.points),                  // add points
      });

      // ── Update local state immediately ────────────────────────────────
      const updated = [...achievements];
      updated[idx] = { ...achievement, isUnlocked: true, unlockedAt };

      // Update gallery based on new achievements
      const unlockedIds = updated.filter(a => a.isUnlocked).map(a => a.id);
      const updatedGallery = get().gallery.map(g => {
        const unlocked =
          (g.id === 'pixel_city'   && unlockedIds.includes('flappy_pro'))   ||
          (g.id === 'retro_lab'    && unlockedIds.includes('tic_winner'))    ||
          (g.id === 'hall_of_fame' && (unlockedIds.includes('snake_century') || unlockedIds.length >= 5));
        return { ...g, isUnlocked: g.isUnlocked || unlocked };
      });

      get().triggerConfetti();
      set({ achievements: updated, gallery: updatedGallery });
    } catch (e) {
      console.error('Achievement unlock failed:', e);
    }
  }
}));
