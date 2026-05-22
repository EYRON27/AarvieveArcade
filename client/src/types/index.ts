export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  streak: number;
  lastLoginDate?: string;
  totalPoints: number;
  createdAt: string;
  joinedDate?: string;
}

export interface GameScore {
  id?: string;
  userId: string;
  userDisplayName: string;
  gameId: string;
  score: number;
  timestamp: string;
  formattedScore?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt?: string;
  isUnlocked: boolean;
  category: 'general' | 'gaming' | 'special';
}

export interface GameProgress {
  userId: string;
  gameId: string;
  highScore: number;
  timesPlayed: number;
  lastPlayed: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  unlockCondition: string;
  isUnlocked: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl: string;
  score: number;
  rank?: number;
}
