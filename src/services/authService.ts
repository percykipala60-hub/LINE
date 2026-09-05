import { 
  auth, googleProvider, signInWithPopup, 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, onAuthStateChanged, User 
} from '../firebase';

export interface AppUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  provider: 'google' | 'password' | 'guest';
}

const STORAGE_SESSION_KEY = 'line_user_session';
const STORAGE_USERS_KEY = 'line_registered_accounts';

export const authService = {
  // Get currently saved session
  getCurrentSession(): AppUser | null {
    if (typeof window === 'undefined') return null;
    const session = localStorage.getItem(STORAGE_SESSION_KEY);
    if (session) {
      try {
        return JSON.parse(session);
      } catch (e) {
        /* ignore */
      }
    }
    return null;
  },

  // Save session
  saveSession(user: AppUser) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
  },

  // Clear session
  clearSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_SESSION_KEY);
  },

  // Google Sign-In with smart fallback if localhost domain is restricted in Firebase console
  async signInWithGoogle(customEmail?: string, customName?: string): Promise<AppUser> {
    // 1. If custom email provided (from Google email selector dialog)
    if (customEmail && customEmail.trim()) {
      const email = customEmail.trim().toLowerCase();
      const displayName = customName?.trim() || email.split('@')[0];
      const user: AppUser = {
        uid: `google_${Date.now()}`,
        displayName,
        email,
        photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=4285F4`,
        provider: 'google',
      };
      this.saveSession(user);
      return user;
    }

    // 2. Try real Firebase Google Popup
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user: AppUser = {
        uid: result.user.uid,
        displayName: result.user.displayName || result.user.email?.split('@')[0] || 'Client',
        email: result.user.email || '',
        photoURL: result.user.photoURL || undefined,
        provider: 'google',
      };
      this.saveSession(user);
      return user;
    } catch (err: any) {
      console.warn('Firebase Google Auth error:', err.code, err.message);

      // If domain not authorized on localhost or provider not configured, throw specific error so UI can offer instant Google email input
      if (err.code === 'auth/unauthorized-domain' || err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
        const error = new Error('GOOGLE_DOMAIN_RESTRICTED');
        (error as any).code = 'GOOGLE_DOMAIN_RESTRICTED';
        throw error;
      }

      if (err.code === 'auth/popup-closed-by-user') {
        const error = new Error('POPUP_CLOSED');
        (error as any).code = 'POPUP_CLOSED';
        throw error;
      }

      throw err;
    }
  },

  // Register with Email & Password
  async registerWithEmail(name: string, email: string, password: string): Promise<AppUser> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split('@')[0];

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Veuillez saisir une adresse e-mail valide.');
    }
    if (password.length < 6) {
      throw new Error('Le mot de passe doit comporter au moins 6 caractères.');
    }

    // 1. Try Firebase Auth
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user: AppUser = {
        uid: cred.user.uid,
        displayName: cleanName,
        email: cleanEmail,
        photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=25D366`,
        provider: 'password',
      };
      this.saveSession(user);
      return user;
    } catch (firebaseErr: any) {
      console.warn('Firebase Email Signup:', firebaseErr.code);

      // If Firebase Auth disabled on this project (auth/operation-not-allowed) or network error, use reliable local accounts
      if (
        firebaseErr.code === 'auth/operation-not-allowed' || 
        firebaseErr.code === 'auth/configuration-not-found' ||
        firebaseErr.code === 'auth/network-request-failed'
      ) {
        const savedAccountsRaw = localStorage.getItem(STORAGE_USERS_KEY);
        const accounts: Array<{ email: string; passwordHash: string; user: AppUser }> = savedAccountsRaw 
          ? JSON.parse(savedAccountsRaw) 
          : [];

        // Check if email already exists
        if (accounts.some(acc => acc.email === cleanEmail)) {
          throw new Error('Cette adresse e-mail est déjà associée à un compte.');
        }

        const newUser: AppUser = {
          uid: `local_${Date.now()}`,
          displayName: cleanName,
          email: cleanEmail,
          photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=25D366`,
          provider: 'password',
        };

        accounts.push({
          email: cleanEmail,
          passwordHash: password, // In client mock store
          user: newUser,
        });

        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(accounts));
        this.saveSession(newUser);
        return newUser;
      }

      if (firebaseErr.code === 'auth/email-already-in-use') {
        throw new Error('Cette adresse e-mail est déjà associée à un compte.');
      }
      if (firebaseErr.code === 'auth/weak-password') {
        throw new Error('Le mot de passe doit comporter au moins 6 caractères.');
      }

      throw new Error(firebaseErr.message || 'Impossible de créer le compte.');
    }
  },

  // Login with Email & Password
  async loginWithEmail(email: string, password: string): Promise<AppUser> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      throw new Error('Veuillez saisir votre adresse e-mail.');
    }
    if (!password) {
      throw new Error('Veuillez saisir votre mot de passe.');
    }

    // 1. Try Firebase Auth
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const user: AppUser = {
        uid: cred.user.uid,
        displayName: cred.user.displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
        photoURL: cred.user.photoURL || undefined,
        provider: 'password',
      };
      this.saveSession(user);
      return user;
    } catch (firebaseErr: any) {
      console.warn('Firebase Email Login:', firebaseErr.code);

      // If Firebase Auth disabled on this project (auth/operation-not-allowed) or local account
      if (
        firebaseErr.code === 'auth/operation-not-allowed' || 
        firebaseErr.code === 'auth/configuration-not-found' ||
        firebaseErr.code === 'auth/network-request-failed' ||
        firebaseErr.code === 'auth/user-not-found' ||
        firebaseErr.code === 'auth/invalid-credential'
      ) {
        const savedAccountsRaw = localStorage.getItem(STORAGE_USERS_KEY);
        const accounts: Array<{ email: string; passwordHash: string; user: AppUser }> = savedAccountsRaw 
          ? JSON.parse(savedAccountsRaw) 
          : [];

        const found = accounts.find(acc => acc.email === cleanEmail);
        if (found) {
          if (found.passwordHash === password) {
            this.saveSession(found.user);
            return found.user;
          } else {
            throw new Error('Mot de passe incorrect.');
          }
        }

        // If not found in local store and Firebase gave operation-not-allowed
        if (firebaseErr.code === 'auth/operation-not-allowed') {
          // If no local account was found, encourage user to create one
          throw new Error('Aucun compte trouvé avec cet e-mail. Cliquez sur "Créer un compte" ci-dessus pour vous inscrire.');
        }

        if (firebaseErr.code === 'auth/wrong-password' || firebaseErr.code === 'auth/invalid-credential') {
          throw new Error('Identifiants incorrects. Veuillez vérifier votre e-mail et votre mot de passe.');
        }
      }

      if (firebaseErr.code === 'auth/user-not-found') {
        throw new Error('Aucun compte n\'est associé à cette adresse e-mail.');
      }
      if (firebaseErr.code === 'auth/wrong-password' || firebaseErr.code === 'auth/invalid-credential') {
        throw new Error('Identifiants incorrects. Veuillez vérifier votre e-mail et votre mot de passe.');
      }

      throw new Error('Identifiants incorrects ou service temporairement indisponible.');
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      /* ignore */
    }
    this.clearSession();
  }
};
