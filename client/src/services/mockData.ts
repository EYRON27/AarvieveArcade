import type { UserProfile, GameScore, Achievement, GalleryItem, GameProgress } from '../types';

// ── Default mock user ──────────────────────────────────────────────────────
const DEFAULT_USER: UserProfile = {
  uid: 'mock-user-001',
  email: 'player@aarvieve.com',
  displayName: 'Player',
  avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Aarvieve&backgroundColor=111111',
  streak: 3,
  totalPoints: 0,
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
  { id: 'lightning',       title: 'Lightning Reflex',         description: 'Get a reaction time under 250ms.',                      icon: '⚡', points: 25, isUnlocked: false, category: 'gaming'  },
  { id: 'heart_hunter',    title: 'Heart Hunter',             description: 'Catch 50 hearts in Catch My Heart.',                    icon: '🧺', points: 30, isUnlocked: false, category: 'gaming'  },
  { id: 'trivia_master',   title: 'Trivia Master',            description: 'Score 100/100 in Arcade Trivia.',                       icon: '👑', points: 50, isUnlocked: false, category: 'gaming'  },
  { id: 'perfectionist',   title: 'Perfectionist',            description: 'Achieve a personal best in any 3 different games.',     icon: '🏅', points: 35, isUnlocked: false, category: 'special' },
  { id: 'high_roller',     title: 'High Roller',              description: 'Accumulate 200 total points across all games.',         icon: '🎰', points: 50, isUnlocked: false, category: 'special' },
];

// ── Unlockable Gallery ──────────────────────────────────────────────────────
const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: 'pixel_city',
    title: 'Pixel City 🌆',
    description: 'A vibrant neon pixel-art cityscape — the home of the Aarvieve Arcade.',
    imageUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=600&auto=format&fit=crop',
    unlockCondition: 'Unlock: Score 15+ in Flappy Bird.',
    isUnlocked: false
  },
  {
    id: 'retro_lab',
    title: 'Retro Lab 🕹️',
    description: 'The secret back room where all Aarvieve games were designed and built.',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
    unlockCondition: 'Unlock: Beat the AI in Tic-Tac-Toe.',
    isUnlocked: false
  },
  {
    id: 'hall_of_fame',
    title: 'Hall of Fame 🏆',
    description: 'The legendary leaderboard hall — only the top players earn a spot here.',
    imageUrl: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=600&auto=format&fit=crop',
    unlockCondition: 'Unlock: Score 100+ in Snake or earn 5+ achievements.',
    isUnlocked: false
  }
];

// ── Default scores (seeded leaderboard) ────────────────────────────────────
const DEFAULT_SCORES: GameScore[] = [
  { userId: 'bot-001', userDisplayName: 'ArcadeBot',  gameId: 'flappyBird',   score: 28,  timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
  { userId: 'bot-002', userDisplayName: 'PixelKing',  gameId: 'flappyBird',   score: 19,  timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
  { userId: 'bot-001', userDisplayName: 'ArcadeBot',  gameId: 'snake',        score: 145, timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
  { userId: 'bot-002', userDisplayName: 'PixelKing',  gameId: 'snake',        score: 110, timestamp: new Date().toISOString() },
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
    if (gameId === 'snake'        && score >= 100)  this.unlockAchievement('snake_century');
    if (gameId === 'ticTacToe'    && score === 1)   this.unlockAchievement('tic_winner');
    if (gameId === 'reactionGame' && score < 250)   this.unlockAchievement('lightning');
    if (gameId === 'catchMyHeart' && score >= 50)   this.unlockAchievement('heart_hunter');
    if (gameId === 'relationshipTrivia' && score >= 100) this.unlockAchievement('trivia_master');
    // Check points milestone
    const user = this.get<UserProfile>('user', DEFAULT_USER);
    if (user.totalPoints >= 200) this.unlockAchievement('high_roller');
  }

  private static checkGalleryUnlocks() {
    const achievements = this.getAchievements();
    const unlockedCount = achievements.filter(a => a.isUnlocked).length;
    if (achievements.find(a => a.id === 'flappy_pro')?.isUnlocked)    this.unlockGalleryItem('pixel_city');
    if (achievements.find(a => a.id === 'tic_winner')?.isUnlocked)    this.unlockGalleryItem('retro_lab');
    const hasSnake = achievements.find(a => a.id === 'snake_century')?.isUnlocked;
    if (unlockedCount >= 5 || hasSnake)                                this.unlockGalleryItem('hall_of_fame');
  }
}
