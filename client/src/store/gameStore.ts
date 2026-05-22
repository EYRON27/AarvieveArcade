import { create } from 'zustand';
import {
  collection, getDocs, query, where, orderBy, limit, addDoc
} from 'firebase/firestore';
import { db, isMockFirebase } from '../services/firebase';
import { MockStorage } from '../services/mockData';
import type { Achievement, GameScore, GalleryItem } from '../types';

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

const ALL_GAME_IDS = ['flappyBird', 'snake', 'ticTacToe', 'memoryGame', 'neonSequence', 'reactionGame', 'catchMyHeart', 'relationshipTrivia'];

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

      // Real Firebase
      const [achSnap, galSnap] = await Promise.all([
        getDocs(collection(db, 'achievements')),
        getDocs(collection(db, 'gallery'))
      ]);

      const fbAchievements: Achievement[] = [];
      achSnap.forEach(d => fbAchievements.push({ id: d.id, ...d.data() } as Achievement));

      const progressSnap = await getDocs(query(collection(db, 'gameProgress'), where('userId', '==', userId)));
      const unlockedIds: string[] = [];
      progressSnap.forEach(d => { const data = d.data(); if (data.unlockedAchievements) unlockedIds.push(...data.unlockedAchievements); });

      const fbScores: Record<string, GameScore[]> = {};
      for (const gId of ALL_GAME_IDS) {
        const scoreSnap = await getDocs(query(
          collection(db, 'scores'),
          where('gameId', '==', gId),
          orderBy('score', gId === 'reactionGame' ? 'asc' : 'desc'),
          limit(10)
        ));
        fbScores[gId] = scoreSnap.docs.map(d => ({ id: d.id, ...d.data() } as GameScore));
      }

      const fbGallery: GalleryItem[] = galSnap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem));

      set({
        achievements: fbAchievements.length ? fbAchievements.map(a => ({ ...a, isUnlocked: unlockedIds.includes(a.id) })) : MockStorage.getAchievements(),
        gallery:      fbGallery.length ? fbGallery : MockStorage.getGallery(),
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

      const data = { userId, userDisplayName: displayName, gameId, score, timestamp: new Date().toISOString() };
      const ref  = await addDoc(collection(db, 'scores'), data);
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

  unlockAchievement: async (_userId, achievementId) => {
    try {
      if (isMockFirebase) {
        const unlocked = MockStorage.unlockAchievement(achievementId);
        if (unlocked) {
          get().triggerConfetti();
          set({ achievements: MockStorage.getAchievements(), gallery: MockStorage.getGallery() });
        }
        return;
      }
      const idx = get().achievements.findIndex(a => a.id === achievementId);
      if (idx >= 0 && !get().achievements[idx].isUnlocked) {
        get().triggerConfetti();
        const updated = [...get().achievements];
        updated[idx] = { ...updated[idx], isUnlocked: true, unlockedAt: new Date().toISOString() };
        set({ achievements: updated });
      }
    } catch (e) { console.error('Achievement unlock failed:', e); }
  }
}));
