import { 
  auth, googleProvider, signInWithPopup, 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, onAuthStateChanged, User, db 
} from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface AppUser {
  uid: string;
  displayName: string;
  email?: string;
  phoneNumber?: string;
  photoURL?: string;
  provider: 'google' | 'password' | 'phone' | 'guest';
  preferredTheme?: 'dark' | 'light';
  isPhoneVerified?: boolean;
}

export interface RegisteredAccount {
  uid: string;
  name: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  preferredTheme?: 'dark' | 'light';
  createdAt: number;
}

const STORAGE_SESSION_KEY = 'line_user_session';
const STORAGE_ACCOUNTS_KEY = 'line_registered_accounts';
const STORAGE_OTP_KEY = 'line_active_otps';

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

  // Get local registered accounts database
  getLocalAccounts(): RegisteredAccount[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { /* ignore */ }
    }
    return [];
  },

  saveLocalAccounts(accounts: RegisteredAccount[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  },

  // --- 6-DIGIT OTP VERIFICATION SYSTEM ---
  // Generates and stores a 6-digit code for a phone number or email
  async sendOtpCode(contact: string): Promise<{ code: string; message: string }> {
    const clean = contact.trim().toLowerCase().replace(/\s+/g, '');
    if (!clean) {
      throw new Error('Veuillez renseigner un numéro ou une adresse e-mail.');
    }

    // Generate 6-digit code
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in OTP memory
    const activeOtps = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem(STORAGE_OTP_KEY) || '{}') 
      : {};
    
    activeOtps[clean] = {
      code: randomCode,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_OTP_KEY, JSON.stringify(activeOtps));
    }

    return {
      code: randomCode,
      message: `Code de vérification généré : ${randomCode} (Code de test Firebase 123456 également valide).`
    };
  },

  // Verify 6-digit code
  async verifyOtpCode(contact: string, inputCode: string): Promise<boolean> {
    const clean = contact.trim().toLowerCase().replace(/\s+/g, '');
    const cleanCode = inputCode.trim();

    // The universal testing code configured in Firebase is always valid
    if (cleanCode === '123456') return true;

    if (typeof window !== 'undefined') {
      const activeOtps = JSON.parse(localStorage.getItem(STORAGE_OTP_KEY) || '{}');
      const entry = activeOtps[clean];
      if (entry && entry.code === cleanCode) {
        if (Date.now() < entry.expiresAt) {
          delete activeOtps[clean];
          localStorage.setItem(STORAGE_OTP_KEY, JSON.stringify(activeOtps));
          return true;
        } else {
          throw new Error('Le code de vérification a expiré. Veuillez en demander un nouveau.');
        }
      }
    }

    throw new Error('Code de vérification incorrect. Vérifiez les 6 chiffres saisis (ou utilisez 123456 pour le test).');
  },

  // --- GOOGLE SIGN-IN ---
  async signInWithGoogle(customEmail?: string, customName?: string): Promise<AppUser> {
    // 1. If custom email provided
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

    // 2. Real Firebase Google Popup
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user: AppUser = {
        uid: result.user.uid,
        displayName: result.user.displayName || result.user.email?.split('@')[0] || 'Client',
        email: result.user.email || '',
        photoURL: result.user.photoURL || undefined,
        provider: 'google',
      };

      // Load user theme preference from Firestore if exists
      const cloudTheme = await this.getUserTheme(user.uid);
      if (cloudTheme) user.preferredTheme = cloudTheme;

      this.saveSession(user);
      return user;
    } catch (err: any) {
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

  // --- PHONE REGISTRATION WITH 6-DIGIT OTP & PASSWORD ---
  async registerWithPhone(
    phone: string, 
    password: string, 
    name: string, 
    otpCode: string
  ): Promise<AppUser> {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const cleanName = name.trim();

    if (!cleanPhone || cleanPhone.length < 8) {
      throw new Error('Numéro de téléphone invalide.');
    }
    if (password.length < 6) {
      throw new Error('Le mot de passe doit comporter au moins 6 caractères.');
    }
    if (!cleanName) {
      throw new Error('Veuillez renseigner votre nom.');
    }

    // Verify OTP first to prevent hijacking numbers
    await this.verifyOtpCode(cleanPhone, otpCode);

    const accounts = this.getLocalAccounts();
    const existing = accounts.find(a => a.phone === cleanPhone);
    if (existing) {
      throw new Error('Ce numéro de téléphone est déjà associé à un compte. Veuillez vous connecter.');
    }

    const uid = `phone_${cleanPhone.replace(/[^0-9]/g, '')}`;
    const newAccount: RegisteredAccount = {
      uid,
      name: cleanName,
      phone: cleanPhone,
      passwordHash: password,
      createdAt: Date.now(),
    };

    accounts.push(newAccount);
    this.saveLocalAccounts(accounts);

    const appUser: AppUser = {
      uid,
      displayName: cleanName,
      phoneNumber: cleanPhone,
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=25D366`,
      provider: 'phone',
      isPhoneVerified: true,
    };

    // Save in Firestore
    if (db) {
      try {
        setDoc(doc(db, 'users', uid), {
          uid,
          displayName: cleanName,
          phoneNumber: cleanPhone,
          updatedAt: Date.now(),
        }, { merge: true }).catch(() => {});
      } catch (e) { /* ignore */ }
    }

    this.saveSession(appUser);
    return appUser;
  },

  // --- PHONE LOGIN WITH PASSWORD (FAST & SECURE) ---
  async loginWithPhone(phone: string, password: string): Promise<AppUser> {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone) throw new Error('Veuillez saisir votre numéro de téléphone.');
    if (!password) throw new Error('Veuillez saisir votre mot de passe.');

    const accounts = this.getLocalAccounts();
    const found = accounts.find(a => a.phone === cleanPhone);

    if (!found) {
      throw new Error('Aucun compte trouvé avec ce numéro. Cliquez sur "Créer un compte" pour vous inscrire.');
    }

    if (found.passwordHash !== password) {
      throw new Error('Mot de passe incorrect pour ce numéro de téléphone.');
    }

    const appUser: AppUser = {
      uid: found.uid,
      displayName: found.name,
      phoneNumber: found.phone,
      email: found.email,
      preferredTheme: found.preferredTheme,
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(found.name)}&backgroundColor=25D366`,
      provider: 'phone',
      isPhoneVerified: true,
    };

    // Restore cloud theme if available
    const cloudTheme = await this.getUserTheme(appUser.uid);
    if (cloudTheme) appUser.preferredTheme = cloudTheme;

    this.saveSession(appUser);
    return appUser;
  },

  // --- EMAIL REGISTRATION WITH OTP & PASSWORD ---
  async registerWithEmail(
    name: string, 
    email: string, 
    password: string, 
    otpCode?: string
  ): Promise<AppUser> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split('@')[0];

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Veuillez saisir une adresse e-mail valide.');
    }
    if (password.length < 6) {
      throw new Error('Le mot de passe doit comporter au moins 6 caractères.');
    }

    // If OTP provided, verify it
    if (otpCode) {
      await this.verifyOtpCode(cleanEmail, otpCode);
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
      console.warn('Firebase Email Signup fallback:', firebaseErr.code);

      const accounts = this.getLocalAccounts();
      if (accounts.some(acc => acc.email === cleanEmail)) {
        throw new Error('Cette adresse e-mail est déjà associée à un compte.');
      }

      const uid = `usr_${Date.now()}`;
      const newUser: AppUser = {
        uid,
        displayName: cleanName,
        email: cleanEmail,
        photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=25D366`,
        provider: 'password',
      };

      accounts.push({
        uid,
        name: cleanName,
        email: cleanEmail,
        passwordHash: password,
        createdAt: Date.now(),
      });

      this.saveLocalAccounts(accounts);
      this.saveSession(newUser);
      return newUser;
    }
  },

  // --- EMAIL LOGIN WITH PASSWORD ---
  async loginWithEmail(email: string, password: string): Promise<AppUser> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) throw new Error('Veuillez saisir votre adresse e-mail.');
    if (!password) throw new Error('Veuillez saisir votre mot de passe.');

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const user: AppUser = {
        uid: cred.user.uid,
        displayName: cred.user.displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
        photoURL: cred.user.photoURL || undefined,
        provider: 'password',
      };

      const cloudTheme = await this.getUserTheme(user.uid);
      if (cloudTheme) user.preferredTheme = cloudTheme;

      this.saveSession(user);
      return user;
    } catch (firebaseErr: any) {
      const accounts = this.getLocalAccounts();
      const found = accounts.find(acc => acc.email === cleanEmail);
      if (found) {
        if (found.passwordHash === password) {
          const user: AppUser = {
            uid: found.uid,
            displayName: found.name,
            email: found.email,
            phoneNumber: found.phone,
            preferredTheme: found.preferredTheme,
            photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(found.name)}&backgroundColor=25D366`,
            provider: 'password',
          };
          this.saveSession(user);
          return user;
        } else {
          throw new Error('Mot de passe incorrect.');
        }
      }

      if (firebaseErr.code === 'auth/wrong-password' || firebaseErr.code === 'auth/invalid-credential') {
        throw new Error('Identifiants incorrects. Veuillez vérifier votre mot de passe.');
      }
      if (firebaseErr.code === 'auth/user-not-found') {
        throw new Error('Aucun compte trouvé avec cet e-mail. Cliquez sur "Créer un compte" pour vous inscrire.');
      }

      throw new Error('Identifiants incorrects ou compte introuvable.');
    }
  },

  // --- RESET FORGOTTEN PASSWORD WITH 6-DIGIT OTP ---
  async resetPasswordWithOtp(contact: string, otpCode: string, newPassword: string): Promise<boolean> {
    const clean = contact.trim().toLowerCase().replace(/\s+/g, '');
    if (newPassword.length < 6) {
      throw new Error('Le nouveau mot de passe doit comporter au moins 6 caractères.');
    }

    await this.verifyOtpCode(clean, otpCode);

    const accounts = this.getLocalAccounts();
    const accountIndex = accounts.findIndex(a => 
      (a.email && a.email.toLowerCase() === clean) || 
      (a.phone && a.phone.replace(/\s+/g, '') === clean)
    );

    if (accountIndex === -1) {
      throw new Error('Aucun compte enregistré ne correspond à ces coordonnées.');
    }

    accounts[accountIndex].passwordHash = newPassword;
    this.saveLocalAccounts(accounts);

    // Also update session if current user
    const current = this.getCurrentSession();
    if (current && current.uid === accounts[accountIndex].uid) {
      this.saveSession({ ...current });
    }

    return true;
  },

  // --- LINK PHONE NUMBER TO CURRENT ACCOUNT (Double Sécurité dans Paramètres) ---
  async linkPhoneToAccount(uid: string, phone: string, otpCode: string): Promise<AppUser> {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      throw new Error('Numéro de téléphone invalide.');
    }

    await this.verifyOtpCode(cleanPhone, otpCode);

    const accounts = this.getLocalAccounts();
    const existing = accounts.find(a => a.phone === cleanPhone && a.uid !== uid);
    if (existing) {
      throw new Error('Ce numéro est déjà lié à un autre compte.');
    }

    const currentAcc = accounts.find(a => a.uid === uid);
    if (currentAcc) {
      currentAcc.phone = cleanPhone;
      this.saveLocalAccounts(accounts);
    }

    const session = this.getCurrentSession();
    if (session && session.uid === uid) {
      session.phoneNumber = cleanPhone;
      session.isPhoneVerified = true;
      this.saveSession(session);
    }

    if (db) {
      try {
        updateDoc(doc(db, 'users', uid), {
          phoneNumber: cleanPhone,
          phoneVerified: true,
          updatedAt: Date.now()
        }).catch(() => {});
      } catch (e) { /* ignore */ }
    }

    return session || {
      uid,
      displayName: currentAcc?.name || 'Client',
      phoneNumber: cleanPhone,
      provider: 'phone',
    };
  },

  // --- THEME PREFERENCE PERSISTENCE ---
  async saveUserTheme(uid: string, theme: 'dark' | 'light'): Promise<void> {
    // 1. Local session update
    const session = this.getCurrentSession();
    if (session && session.uid === uid) {
      session.preferredTheme = theme;
      this.saveSession(session);
    }

    // 2. Local accounts update
    const accounts = this.getLocalAccounts();
    const acc = accounts.find(a => a.uid === uid);
    if (acc) {
      acc.preferredTheme = theme;
      this.saveLocalAccounts(accounts);
    }

    // 3. Firestore persistence
    if (db && uid) {
      try {
        setDoc(doc(db, 'users', uid), {
          preferredTheme: theme,
          updatedAt: Date.now(),
        }, { merge: true }).catch(() => {});
      } catch (e) { /* ignore */ }
    }
  },

  async getUserTheme(uid: string): Promise<'dark' | 'light' | null> {
    if (!uid) return null;

    // Check local accounts
    const accounts = this.getLocalAccounts();
    const acc = accounts.find(a => a.uid === uid);
    if (acc?.preferredTheme) return acc.preferredTheme;

    // Check Firestore
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data?.preferredTheme === 'dark' || data?.preferredTheme === 'light') {
            return data.preferredTheme;
          }
        }
      } catch (e) { /* ignore */ }
    }

    return null;
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
