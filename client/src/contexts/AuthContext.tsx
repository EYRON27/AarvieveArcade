import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, db, isMockFirebase } from '../services/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { MockStorage } from '../services/mockData';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (email: string, password?: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fast auto-login cache
  useEffect(() => {
    const cachedUser = localStorage.getItem('aa_cached_user');
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isMockFirebase) {
      // Simulate slow initial loading state for aesthetic loading screens
      const timer = setTimeout(() => {
        const mockUser = localStorage.getItem('aa_user_logged_in') 
          ? MockStorage.updateProfile({}) // Get current mock user
          : null;
        setUser(mockUser);
        if (mockUser) {
          localStorage.setItem('aa_cached_user', JSON.stringify(mockUser));
        } else {
          localStorage.removeItem('aa_cached_user');
        }
        setLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // Fetch user profile from Firestore
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
              girlfriendName: 'My Valentine',
              anniversaryDate: '2024-02-14',
              streak: 1,
              totalPoints: 10,
              createdAt: new Date().toISOString()
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

  const login = async (email: string, password?: string) => {
    setLoading(true);
    if (isMockFirebase) {
      const mockProfile = MockStorage.login(email);
      localStorage.setItem('aa_user_logged_in', 'true');
      localStorage.setItem('aa_cached_user', JSON.stringify(mockProfile));
      setUser(mockProfile);
      setLoading(false);
      return;
    }

    if (password) {
      await signInWithEmailAndPassword(auth, email, password);
    }
  };

  const register = async (email: string, password?: string, displayName?: string) => {
    setLoading(true);
    const name = displayName || 'Player';
    
    if (isMockFirebase) {
      const mockProfile = MockStorage.register(email, name);
      localStorage.setItem('aa_user_logged_in', 'true');
      localStorage.setItem('aa_cached_user', JSON.stringify(mockProfile));
      setUser(mockProfile);
      setLoading(false);
      return;
    }

    if (password) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: email,
        displayName: name,
        avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}&backgroundColor=b6e3f4`,
        girlfriendName: 'My Valentine',
        anniversaryDate: '2024-02-14',
        streak: 1,
        totalPoints: 10,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), newProfile);
      setUser(newProfile);
      localStorage.setItem('aa_cached_user', JSON.stringify(newProfile));
    }
  };

  const logout = async () => {
    setLoading(true);
    if (isMockFirebase) {
      localStorage.removeItem('aa_user_logged_in');
      localStorage.removeItem('aa_cached_user');
      setUser(null);
      setLoading(false);
      return;
    }

    await signOut(auth);
    localStorage.removeItem('aa_cached_user');
    setUser(null);
    setLoading(false);
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

  const loginWithGoogle = async () => {
    setLoading(true);
    if (isMockFirebase) {
      const mockProfile = MockStorage.login('google-user@arcade.com');
      localStorage.setItem('aa_user_logged_in', 'true');
      localStorage.setItem('aa_cached_user', JSON.stringify(mockProfile));
      setUser(mockProfile);
      setLoading(false);
      return;
    }

    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserProfile;
      setUser(userData);
      localStorage.setItem('aa_cached_user', JSON.stringify(userData));
    } else {
      const newProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || '',
        displayName: userCredential.user.displayName || 'Arcade Player',
        avatarUrl: userCredential.user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${userCredential.user.displayName || 'Player'}&backgroundColor=b6e3f4`,
        girlfriendName: 'My Valentine',
        anniversaryDate: '2024-02-14',
        streak: 1,
        totalPoints: 10,
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, newProfile);
      setUser(newProfile);
      localStorage.setItem('aa_cached_user', JSON.stringify(newProfile));
    }
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, loginWithGoogle }}>
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
