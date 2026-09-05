import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User as UserIcon, Globe, Moon, Sun, 
  Heart, LogOut, LogIn, ShieldCheck, Check, Sparkles 
} from 'lucide-react';
import { Language } from '../translations';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { displayName?: string | null; email?: string | null; photoURL?: string | null; phoneNumber?: string | null } | null;
  isGuest: boolean;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
  onLoginRequest: () => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  isGuest,
  language,
  onLanguageChange,
  isDarkMode,
  onToggleTheme,
  favoritesCount,
  onOpenFavorites,
  onLoginRequest,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-2xl p-6 space-y-5"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* User Profile Card Header */}
          <div className="flex items-center gap-4 pt-2">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-[#25D366]/40 flex items-center justify-center shrink-0">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'Client'} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-8 h-8 text-slate-400" />
              )}
              {user && (
                <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-[#25D366] ring-2 ring-white dark:ring-[#121824]" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base truncate">
                {user?.displayName || (isGuest ? 'Visiteur' : 'Client')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.phoneNumber ? `📱 ${user.phoneNumber}` : (user?.email || 'Mode découverte sans compte')}
              </p>
              {user?.phoneNumber && user?.email && (
                <p className="text-[11px] text-slate-400 truncate">
                  ✉️ {user.email}
                </p>
              )}
              <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30">
                <Sparkles className="w-3 h-3" />
                <span>{user ? 'Compte connecté' : 'Visiteur'}</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-200 dark:bg-slate-800" />

          {/* Settings Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Paramètres & Préférences
            </h4>

            {/* Language Selector */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold">Langue / Language</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-900 p-1 rounded-xl">
                <button
                  onClick={() => onLanguageChange('fr')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    language === 'fr'
                      ? 'bg-white dark:bg-slate-800 text-black dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  🇫🇷 FR
                </button>
                <button
                  onClick={() => onLanguageChange('en')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    language === 'en'
                      ? 'bg-white dark:bg-slate-800 text-black dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  🇬🇧 EN
                </button>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {isDarkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span className="text-xs font-semibold">Thème d'affichage</span>
              </div>
              <button
                onClick={onToggleTheme}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:opacity-80"
              >
                {isDarkMode ? 'Mode Sombre' : 'Mode Clair'}
              </button>
            </div>

            {/* Wishlist Link */}
            <div 
              onClick={() => {
                onOpenFavorites();
                onClose();
              }}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                <span className="text-xs font-semibold">Mes Coups de cœur</span>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {favoritesCount} article(s)
              </span>
            </div>
          </div>

          {/* Security & Confidentiality reminder */}
          <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#25D366] shrink-0" />
            <span>Paiement à la livraison & respect total de vos données.</span>
          </div>

          {/* Action button: Logout or Sign In */}
          <div className="pt-1">
            {user ? (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-rose-500 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Se déconnecter</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onLoginRequest();
                }}
                className="w-full py-3 rounded-xl bg-[#25D366] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:opacity-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Se connecter / Créer un compte</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
