import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, db, isMockFirebase } from '../services/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { MockStorage } from '../services/mockData';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ── FAST: Instant restore from localStorage cache ──────────────────────
  useEffect(() => {
    const cachedUser = localStorage.getItem('aa_cached_user');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch { /* ignore corrupt cache */ }
      setLoading(false);
    }
  }, []);

  // ── Firebase auth listener / Mock init ─────────────────────────────────
  useEffect(() => {
    if (isMockFirebase) {
      // No artificial delay — instant mock login restore
      const isLoggedIn = localStorage.getItem('aa_user_logged_in');
      if (isLoggedIn) {
        const mockUser = MockStorage.updateProfile({});
        setUser(mockUser);
        localStorage.setItem('aa_cached_user', JSON.stringify(mockUser));
      } else {
        setUser(null);
        localStorage.removeItem('aa_cached_user');
      }
      setLoading(false);
      return;
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    // Set local persistence for fastest re-auth on page reload
    setPersistence(auth, browserLocalPersistence).catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // Try cache first for instant display, then sync from Firestore in background
          const cached = localStorage.getItem('aa_cached_user');
          if (cached) {
            try {
              const cachedProfile = JSON.parse(cached);
              if (cachedProfile.uid === firebaseUser.uid) {
                setUser(cachedProfile);
                setLoading(false);
                // Background sync from Firestore (non-blocking)
                getDoc(doc(db, 'users', firebaseUser.uid)).then(userDoc => {
                  if (userDoc.exists()) {
                    const fresh = userDoc.data() as UserProfile;
                    setUser(fresh);
                    localStorage.setItem('aa_cached_user', JSON.stringify(fresh));
                  }
                }).catch(() => {});
                return;
              }
            } catch { /* ignore */ }
          }

          // No cache match — fetch from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            setUser(userData);
            localStorage.setItem('aa_cached_user', JSON.stringify(userData));
          } else {
            // Create profile if it does not exist
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Arcade Player',
              avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${firebaseUser.displayName || 'Player'}&backgroundColor=b6e3f4`,
              streak: 1,
              totalPoints: 10,
              createdAt: new Date().toISOString(),
              unlockedAchievements: ['welcome'],
              achievementDates: {
                'welcome': new Date().toISOString()
              }
            };
            await setDoc(userDocRef, newProfile);
            setUser(newProfile);
            localStorage.setItem('aa_cached_user', JSON.stringify(newProfile));
          }
        } else {
          setUser(null);
          localStorage.removeItem('aa_cached_user');
        }
      } catch (error) {
        console.error('Error fetching auth user info:', error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    if (isMockFirebase) {
      const mockProfile = MockStorage.login(email);
      localStorage.setItem('aa_user_logged_in', 'true');
      localStorage.setItem('aa_cached_user', JSON.stringify(mockProfile));
      setUser(mockProfile);
      return;
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Cache immediately for speed — onAuthStateChanged will sync later
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserProfile;
      setUser(userData);
      localStorage.setItem('aa_cached_user', JSON.stringify(userData));
    }
  };

  const register = async (email: string, password: string, displayName?: string) => {
    const name = displayName || 'Player';
    
    if (isMockFirebase) {
      const mockProfile = MockStorage.register(email, name);
      localStorage.setItem('aa_user_logged_in', 'true');
      localStorage.setItem('aa_cached_user', JSON.stringify(mockProfile));
      setUser(mockProfile);
      return;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newProfile: UserProfile = {
      uid: userCredential.user.uid,
      email: email,
      displayName: name,
      avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}&backgroundColor=b6e3f4`,
      streak: 1,
      totalPoints: 10,
      createdAt: new Date().toISOString(),
      unlockedAchievements: ['welcome'],
      achievementDates: {
        'welcome': new Date().toISOString()
      }
    };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), newProfile);
    setUser(newProfile);
    localStorage.setItem('aa_cached_user', JSON.stringify(newProfile));
  };

  const logout = async () => {
    if (isMockFirebase) {
      localStorage.removeItem('aa_user_logged_in');
      localStorage.removeItem('aa_cached_user');
      setUser(null);
      return;
    }

    await signOut(auth);
    localStorage.removeItem('aa_cached_user');
    setUser(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...data };
    
    if (isMockFirebase) {
      const result = MockStorage.updateProfile(data);
      setUser(result);
      localStorage.setItem('aa_cached_user', JSON.stringify(result));
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, data as any);
    setUser(updatedUser);
    localStorage.setItem('aa_cached_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
