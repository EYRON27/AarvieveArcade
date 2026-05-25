import type { UserProfile, GameScore, Achievement, GalleryItem, GameProgress } from '../types';

// ── Default mock user ──────────────────────────────────────────────────────
const DEFAULT_USER: UserProfile = {
  uid: 'mock-user-001',
  email: 'player@aarvieve.com',
  displayName: 'Player',
  avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Aarvieve&backgroundColor=111111',
  streak: 3,
  totalPoints: 0,
  totalPlaytime: 0,
  joinedDate: new Date().toISOString(),
  createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
};

// ── Achievements ────────────────────────────────────────────────────────────
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'welcome',         title: 'Welcome to the Arcade',    description: 'Create your account and enter Aarvieve Arcade.',       icon: '🎮', points: 10, isUnlocked: true,  category: 'general' },
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

// ── Unlockable Gallery ──────────────────────────────────────────────────────
const DEFAULT_GALLERY: GalleryItem[] = [
  { id: 'welcome',         title: 'Welcome to the Arcade 🎮', description: 'Create your account and enter Aarvieve Arcade.', imageUrl: '/gallery/gallery_welcome_1779587115532.png', unlockCondition: 'Unlock: Create your account.', isUnlocked: true },
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
  { id: 'perfectionist',   title: 'Perfectionist 🏅',         description: 'Three golden arcade medals glowing on a pedestal.', imageUrl: '/gallery/gallery_perfectionist_1779587335652.png', unlockCondition: 'Unlock: Achieve a personal best in any 3 different games.', isUnlocked: false },
  { id: 'high_roller',     title: 'High Roller 🎰',           description: 'A retro arcade slot machine hitting a jackpot.', imageUrl: '/gallery/gallery_highroller_1779587350225.png', unlockCondition: 'Unlock: Accumulate 200 total points across all games.', isUnlocked: false },
];

// ── Default scores (seeded leaderboard) ────────────────────────────────────
const DEFAULT_SCORES: GameScore[] = [
  { userId: 'bot-001', userDisplayName: 'ArcadeBot',  gameId: 'flappyBird',   score: 28,  timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
  { userId: 'bot-002', userDisplayName: 'PixelKing',  gameId: 'flappyBird',   score: 19,  timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
  { userId: 'bot-001', userDisplayName: 'ArcadeBot',  gameId: 'snake',        score: 145, timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
  { userId: 'bot-001', userDisplayName: 'ArcadeBot',  gameId: 'memoryGame',   score: 45,  timestamp: new Date().toISOString() },
  { userId: 'bot-001', userDisplayName: 'ArcadeBot',  gameId: 'puzzle2048',   score: 3450, timestamp: new Date().toISOString() },
  { userId: 'bot-002', userDisplayName: 'PixelKing',  gameId: 'puzzle2048',   score: 1024, timestamp: new Date().toISOString() },
  { userId: 'bot-001', userDisplayName: 'ArcadeBot',  gameId: 'sudoku',       score: 750,  timestamp: new Date().toISOString() },
  { userId: 'bot-001', userDisplayName: 'ArcadeBot',  gameId: 'neonSequence', score: 12,  timestamp: new Date().toISOString() },
  { userId: 'bot-002', userDisplayName: 'PixelKing',  gameId: 'neonSequence', score: 8,   timestamp: new Date().toISOString() },
  { userId: 'bot-001', userDisplayName: 'ArcadeBot',  gameId: 'spaceDodger',  score: 65,  timestamp: new Date().toISOString() },
  { userId: 'bot-002', userDisplayName: 'PixelKing',  gameId: 'spaceDodger',  score: 42,  timestamp: new Date().toISOString() },
  { userId: 'bot-001', userDisplayName: 'ArcadeBot',  gameId: 'brickBreaker', score: 850, timestamp: new Date().toISOString() },
  { userId: 'bot-002', userDisplayName: 'PixelKing',  gameId: 'brickBreaker', score: 420, timestamp: new Date().toISOString() },
  { userId: 'bot-001', userDisplayName: 'ArcadeBot',  gameId: 'whackABug',    score: 28,  timestamp: new Date().toISOString() },
  { userId: 'bot-002', userDisplayName: 'PixelKing',  gameId: 'whackABug',    score: 35,  timestamp: new Date().toISOString() },
  { userId: 'bot-001', userDisplayName: 'ArcadeBot',  gameId: 'reactionGame', score: 198, timestamp: new Date().toISOString() },
  { userId: 'bot-002', userDisplayName: 'PixelKing',  gameId: 'reactionGame', score: 245, timestamp: new Date().toISOString() },
  { userId: 'bot-001', userDisplayName: 'ArcadeBot',  gameId: 'catchMyHeart', score: 62,  timestamp: new Date().toISOString() },
];

// ── MockStorage class ───────────────────────────────────────────────────────
export class MockStorage {
  static get<T>(key: string, defaultValue: T): T {
    const data = localStorage.getItem(`aa_${key}`);
    return data ? JSON.parse(data) : defaultValue;
  }

  static set<T>(key: string, value: T): void {
    localStorage.setItem(`aa_${key}`, JSON.stringify(value));
  }

  static initialize() {
    if (!localStorage.getItem('aa_initialized')) {
      this.set('user',         DEFAULT_USER);
      this.set('achievements', DEFAULT_ACHIEVEMENTS);
      this.set('gallery',      DEFAULT_GALLERY);
      this.set('scores',       DEFAULT_SCORES);
      this.set('progress',     []);
      localStorage.setItem('aa_initialized', 'true');
    }
  }

  static login(email: string): UserProfile {
    this.initialize();
    const user = this.get<UserProfile>('user', DEFAULT_USER);
    user.email = email;
    this.set('user', user);
    return user;
  }

  static register(email: string, displayName: string): UserProfile {
    this.initialize();
    const user: UserProfile = {
      ...DEFAULT_USER,
      email,
      displayName,
      uid: `user-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.set('user', user);
    return user;
  }

  static updateProfile(updated: Partial<UserProfile>): UserProfile {
    const user = this.get<UserProfile>('user', DEFAULT_USER);
    const next = { ...user, ...updated };
    this.set('user', next);
    return next;
  }

  static getScores(gameId?: string): GameScore[] {
    this.initialize();
    const scores = this.get<GameScore[]>('scores', DEFAULT_SCORES);
    if (gameId) {
      return scores
        .filter(s => s.gameId === gameId)
        .sort((a, b) => gameId === 'reactionGame' ? a.score - b.score : b.score - a.score);
    }
    return scores;
  }

  static saveScore(gameId: string, score: number): GameScore {
    this.initialize();
    const user  = this.get<UserProfile>('user', DEFAULT_USER);
    const scores = this.get<GameScore[]>('scores', DEFAULT_SCORES);

    const entry: GameScore = {
      id: `score-${Date.now()}`,
      userId: user.uid,
      userDisplayName: user.displayName,
      gameId,
      score,
      timestamp: new Date().toISOString()
    };

    scores.push(entry);
    this.set('scores', scores);

    // Update progress
    const progress = this.get<GameProgress[]>('progress', []);
    const idx = progress.findIndex(p => p.gameId === gameId && p.userId === user.uid);
    if (idx >= 0) {
      progress[idx].timesPlayed += 1;
      progress[idx].lastPlayed   = new Date().toISOString();
      const better = gameId === 'reactionGame' ? score < progress[idx].highScore : score > progress[idx].highScore;
      if (better) progress[idx].highScore = score;
    } else {
      progress.push({ userId: user.uid, gameId, highScore: score, timesPlayed: 1, lastPlayed: new Date().toISOString() });
    }
    this.set('progress', progress);
    this.checkScoreAchievements(gameId, score);
    return entry;
  }

  static getAchievements(): Achievement[] {
    this.initialize();
    return this.get<Achievement[]>('achievements', DEFAULT_ACHIEVEMENTS);
  }

  static unlockAchievement(id: string): Achievement | null {
    const achievements = this.get<Achievement[]>('achievements', DEFAULT_ACHIEVEMENTS);
    const i = achievements.findIndex(a => a.id === id);
    if (i >= 0 && !achievements[i].isUnlocked) {
      achievements[i].isUnlocked  = true;
      achievements[i].unlockedAt  = new Date().toISOString();
      this.set('achievements', achievements);
      const user = this.get<UserProfile>('user', DEFAULT_USER);
      user.totalPoints += achievements[i].points;
      this.set('user', user);
      this.checkGalleryUnlocks();
      return achievements[i];
    }
    return null;
  }

  static getGallery(): GalleryItem[] {
    this.initialize();
    return this.get<GalleryItem[]>('gallery', DEFAULT_GALLERY);
  }

  static unlockGalleryItem(id: string): GalleryItem | null {
    const gallery = this.get<GalleryItem[]>('gallery', DEFAULT_GALLERY);
    const i = gallery.findIndex(g => g.id === id);
    if (i >= 0 && !gallery[i].isUnlocked) {
      gallery[i].isUnlocked = true;
      this.set('gallery', gallery);
      return gallery[i];
    }
    return null;
  }

  private static checkScoreAchievements(gameId: string, score: number) {
    if (gameId === 'flappyBird'   && score >= 15)  this.unlockAchievement('flappy_pro');
    if (gameId === 'snake'        && score >= 100) this.unlockAchievement('snake_century');
    if (gameId === 'ticTacToe'    && score === 1)  this.unlockAchievement('tic_winner');
    if (gameId === 'puzzle2048'   && score >= 2048) this.unlockAchievement('puzzle_master');
    if (gameId === 'sudoku'       && score >= 100)  this.unlockAchievement('sudoku_master');
    if (gameId === 'neonSequence' && score >= 10)  this.unlockAchievement('neon_god');
    if (gameId === 'spaceDodger'  && score >= 50)  this.unlockAchievement('space_survivor');
    if (gameId === 'brickBreaker' && score >= 800) this.unlockAchievement('brick_smasher');
    if (gameId === 'whackABug'    && score >= 30)  this.unlockAchievement('bug_squasher');
    if (gameId === 'reactionGame' && score < 250)  this.unlockAchievement('lightning');
    if (gameId === 'catchMyHeart' && score >= 50)   this.unlockAchievement('heart_hunter');
    if (gameId === 'relationshipTrivia' && score >= 100) this.unlockAchievement('trivia_master');
    // Check points milestone
    const user = this.get<UserProfile>('user', DEFAULT_USER);
    if (user.totalPoints >= 200) this.unlockAchievement('high_roller');
  }

  private static checkGalleryUnlocks() {
    const achievements = this.getAchievements();
    const unlockedIds = achievements.filter(a => a.isUnlocked).map(a => a.id);
    unlockedIds.forEach(id => this.unlockGalleryItem(id));
  }
}
