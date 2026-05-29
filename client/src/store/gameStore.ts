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
  { id: 'cup_hustler',     title: 'Cup Hustler',              description: 'Get a perfect score (8/8) in Cup Shuffle.',             icon: '🥤', points: 40, isUnlocked: false, category: 'gaming'  },
  { id: 'perfectionist',   title: 'Perfectionist',            description: 'Achieve a personal best in any 3 different games.',     icon: '🏅', points: 35, isUnlocked: false, category: 'special' },
  { id: 'high_roller',     title: 'High Roller',              description: 'Accumulate 200 total points across all games.',         icon: '🎰', points: 50, isUnlocked: false, category: 'special' },
];

const ALL_GALLERY: GalleryItem[] = [
  { id: 'welcome',         title: 'Welcome to the Arcade 🎮', description: 'Create your account and enter Aarvieve Arcade.', imageUrl: '/gallery/gallery_welcome_1779587115532.png', unlockCondition: 'Unlock: Create your account.', isUnlocked: false },
  { id: 'flappy_pro',      title: 'Flappy Pro 🐦',            description: 'A retro pixel art yellow bird flying between green pipes.', imageUrl: '/gallery/gallery_flappy_1779587132831.png', unlockCondition: 'Unlock: Score 15+ points in Flappy Bird.', isUnlocked: false },
  { id: 'snake_century',   title: 'Snake Century 🐍',         description: 'A retro green snake eating a glowing apple on a dark grid.', imageUrl: '/gallery/gallery_snake_1779587147646.png', unlockCondition: 'Unlock: Reach a score of 100 in Snake.', isUnlocked: false },
  { id: 'tic_winner',      title: 'Strategy Master ❌',       description: 'A neon glowing tic-tac-toe board with hearts and stars.', imageUrl: '/gallery/gallery_tictactoe_1779587162132.png', unlockCondition: 'Unlock: Beat the AI in Tic-Tac-Toe.', isUnlocked: false },
  { id: 'memory_speed',    title: 'Photographic Memory 🧠',   description: 'A set of glowing memory cards with cute pixel art icons.', imageUrl: '/gallery/gallery_memory_1779587176196.png', unlockCondition: 'Unlock: Match all cards in under 30 seconds.', isUnlocked: false },
  { id: 'puzzle_master',   title: 'Puzzle Master 🧩',         description: 'A glowing 2048 puzzle grid with colorful neon tiles.', imageUrl: '/gallery/gallery_2048_1779587190296.png', unlockCondition: 'Unlock: Merge tiles to reach the 2048 tile.', isUnlocked: false },
  { id: 'sudoku_master',   title: 'Sudoku Master 🔢',         description: 'A neon-lit Sudoku board with glowing blue numbers.', imageUrl: '/gallery/gallery_sudoku_1779587203205.png', unlockCondition: 'Unlock: Solve a Sudoku puzzle.', isUnlocked: false },
  { id: 'neon_god',        title: 'Neon God 👁️',             description: 'A sequence of four glowing neon pads in retro 80s style.', imageUrl: '/gallery/gallery_neon_1779587221099.png', unlockCondition: 'Unlock: Reach a sequence of 10 in Neon Sequence.', isUnlocked: false },
  { id: 'space_survivor',  title: 'Space Survivor 🚀',        description: 'A pixel art spaceship dodging asteroids in deep space.', imageUrl: '/gallery/gallery_space_1779587244093.png', unlockCondition: 'Unlock: Survive an asteroid field and score 50 points.', isUnlocked: false },
  { id: 'brick_smasher',   title: 'Demolition Expert 🧱',     description: 'A glowing blue paddle smashing colorful neon bricks.', imageUrl: '/gallery/gallery_brick_1779587259139.png', unlockCondition: 'Unlock: Clear all the bricks to win the game.', isUnlocked: false },
  { id: 'bug_squasher',    title: 'Bug Squasher 🐛',          description: 'A frantic whack-a-mole style game with cartoon bugs.', imageUrl: '/gallery/gallery_bug_1779587275028.png', unlockCondition: 'Unlock: Whack 30 bugs in 30 seconds.', isUnlocked: false },
  { id: 'lightning',       title: 'Lightning Reflex ⚡',      description: 'A striking neon lightning bolt symbolizing fast reflexes.', imageUrl: '/gallery/gallery_lightning_1779587291181.png', unlockCondition: 'Unlock: Get a reaction time under 250ms.', isUnlocked: false },
  { id: 'heart_hunter',    title: 'Heart Hunter 🧺',          description: 'A pixel art basket catching falling glowing pink hearts.', imageUrl: '/gallery/gallery_heart_1779587303712.png', unlockCondition: 'Unlock: Catch 50 hearts in Catch My Heart.', isUnlocked: false },
  { id: 'trivia_master',   title: 'Trivia Master 👑',         description: 'A retro game show buzzer and trivia screen.', imageUrl: '/gallery/gallery_trivia_1779587318765.png', unlockCondition: 'Unlock: Score 100/100 in Arcade Trivia.', isUnlocked: false },
  { id: 'cup_hustler',     title: 'Cup Hustler 🥤',           description: 'Three neon cups shuffling at high speed.', imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=CupShuffle&backgroundColor=1a1a1a', unlockCondition: 'Unlock: Get a perfect score (8/8) in Cup Shuffle.', isUnlocked: false },
  { id: 'perfectionist',   title: 'Perfectionist 🏅',         description: 'Three golden arcade medals glowing on a pedestal.', imageUrl: '/gallery/gallery_perfectionist_1779587335652.png', unlockCondition: 'Unlock: Achieve a personal best in any 3 different games.', isUnlocked: false },
  { id: 'high_roller',     title: 'High Roller 🎰',           description: 'A retro arcade slot machine hitting a jackpot.', imageUrl: '/gallery/gallery_highroller_1779587350225.png', unlockCondition: 'Unlock: Accumulate 200 total points across all games.', isUnlocked: false },
];

const ALL_GAME_IDS = ['flappyBird', 'snake', 'ticTacToe', 'memoryGame', 'puzzle2048', 'sudoku', 'neonSequence', 'spaceDodger', 'brickBreaker', 'whackABug', 'reactionGame', 'catchMyHeart', 'relationshipTrivia', 'cupShuffle'];

interface GameStoreState {
  achievements: Achievement[];
  gallery:      GalleryItem[];
  scores:       Record<string, GameScore[]>;
  musicEnabled: boolean;
  activeGameId: string | null;
  loadingData:  boolean;
  showConfetti: boolean;
  isGameMusicPlaying: boolean;

  toggleMusic:      () => void;
  setActiveGameId:  (gameId: string | null) => void;
  setIsGameMusicPlaying: (isPlaying: boolean) => void;
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
  isGameMusicPlaying: false,

  toggleMusic:     () => set(s => ({ musicEnabled: !s.musicEnabled })),
  setActiveGameId: (gameId) => set({ activeGameId: gameId }),
  setIsGameMusicPlaying: (isPlaying) => set({ isGameMusicPlaying: isPlaying }),

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

      // 3. Gallery unlocks based on achievements (1:1 mapping with achievement IDs)
      const mergedGallery = ALL_GALLERY.map(g => ({
        ...g,
        isUnlocked: unlockedIds.includes(g.id)
      }));

      // 4. Fetch all scores from Firestore in parallel — simple where only (no index needed)
      const scorePromises = ALL_GAME_IDS.map(gId =>
        getDocs(query(
          collection(db, 'scores'),
          where('gameId', '==', gId)
        )).then(snap => ({
          gId,
          scores: snap.docs
            .map(d => ({ id: d.id, ...d.data() } as GameScore))
            .sort((a, b) => (gId === 'reactionGame' || gId === 'memoryGame') ? a.score - b.score : b.score - a.score)
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
        .sort((a, b) => (gameId === 'reactionGame' || gameId === 'memoryGame') ? a.score - b.score : b.score - a.score)
        .slice(0, 10);
      updatedScores[gameId] = list;
      set({ scores: updatedScores });

      // ── Check and unlock achievements (real Firebase path) ──────────────
      const unlock = (id: string) => get().unlockAchievement(userId, id);
      if (gameId === 'flappyBird'         && score >= 15)  unlock('flappy_pro');
      if (gameId === 'snake'              && score >= 100) unlock('snake_century');
      if (gameId === 'ticTacToe'          && score === 1)  unlock('tic_winner');
      if (gameId === 'memoryGame'         && score <= 30)  unlock('memory_speed'); // score = seconds taken
      if (gameId === 'puzzle2048'         && score >= 2048)unlock('puzzle_master');
      if (gameId === 'sudoku'             && score >= 100) unlock('sudoku_master');
      if (gameId === 'neonSequence'       && score >= 10)  unlock('neon_god');
      if (gameId === 'spaceDodger'        && score >= 50)  unlock('space_survivor');
      if (gameId === 'brickBreaker'       && score >= 800) unlock('brick_smasher');
      if (gameId === 'whackABug'          && score >= 30)  unlock('bug_squasher');
      if (gameId === 'reactionGame'       && score < 250)  unlock('lightning');
      if (gameId === 'catchMyHeart'       && score >= 50)  unlock('heart_hunter');
      if (gameId === 'relationshipTrivia' && score >= 100) unlock('trivia_master');
      if (gameId === 'cupShuffle'         && score >= 8)   unlock('cup_hustler');

      // Perfectionist: personal best in 3+ different games
      const allScores = { ...updatedScores };
      const gamesWithPersonalBest = ALL_GAME_IDS.filter(gId => {
        const gameList = allScores[gId] || [];
        return gameList.some(s => s.userId === userId);
      });
      if (gamesWithPersonalBest.length >= 3) unlock('perfectionist');

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
        const unlocked = unlockedIds.includes(g.id);
        return { ...g, isUnlocked: g.isUnlocked || unlocked };
      });

      get().triggerConfetti();
      set({ achievements: updated, gallery: updatedGallery });
    } catch (e) {
      console.error('Achievement unlock failed:', e);
    }
  }
}));
