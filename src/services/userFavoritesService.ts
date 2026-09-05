import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const STORAGE_FAVORITES_KEY = 'line_client_favorites';
const DEFAULT_FAVORITES = ['p-1', 'p-2', 'p-3'];

export const userFavoritesService = {
  // Read favorites from local storage
  getLocalFavorites(): string[] {
    if (typeof window === 'undefined') return DEFAULT_FAVORITES;
    const saved = localStorage.getItem(STORAGE_FAVORITES_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        /* ignore */
      }
    }
    return DEFAULT_FAVORITES;
  },

  // Save favorites to local storage
  saveLocalFavorites(favorites: string[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(favorites));
  },

  // Load cloud favorites for a logged-in user (Firestore + local account backup)
  async loadUserFavorites(userKey: string): Promise<string[] | null> {
    if (!userKey) return null;
    const cleanKey = userKey.replace(/[^a-zA-Z0-9_-]/g, '_');

    // 1. Try Firestore cloud backup
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'user_favorites', cleanKey));
        if (snap.exists()) {
          const data = snap.data();
          if (data && Array.isArray(data.favorites)) {
            this.saveLocalFavorites(data.favorites);
            return data.favorites;
          }
        }
      } catch (err) {
        console.warn('Firestore load favorites note:', err);
      }
    }

    // 2. Check local accounts store backup
    try {
      const savedAccountsRaw = localStorage.getItem('line_registered_accounts');
      if (savedAccountsRaw) {
        const accounts = JSON.parse(savedAccountsRaw);
        const found = accounts.find((a: any) => a.email === userKey || a.user?.uid === userKey);
        if (found && Array.isArray(found.favorites)) {
          return found.favorites;
        }
      }
    } catch (e) {
      /* ignore */
    }

    return null;
  },

  // Save favorites to cloud and local account for a logged-in user
  async saveUserFavorites(userKey: string, favorites: string[]): Promise<void> {
    if (!userKey) return;
    this.saveLocalFavorites(favorites);

    const cleanKey = userKey.replace(/[^a-zA-Z0-9_-]/g, '_');

    // 1. Save to Firestore
    if (db) {
      try {
        await setDoc(doc(db, 'user_favorites', cleanKey), {
          userKey,
          favorites,
          updatedAt: Date.now(),
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore save favorites note:', err);
      }
    }

    // 2. Save in local accounts store backup
    try {
      const savedAccountsRaw = localStorage.getItem('line_registered_accounts');
      if (savedAccountsRaw) {
        const accounts = JSON.parse(savedAccountsRaw);
        const updated = accounts.map((acc: any) => {
          if (acc.email === userKey || acc.user?.uid === userKey) {
            return { ...acc, favorites };
          }
          return acc;
        });
        localStorage.setItem('line_registered_accounts', JSON.stringify(updated));
      }
    } catch (e) {
      /* ignore */
    }
  }
};
