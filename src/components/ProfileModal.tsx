import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User as UserIcon, Heart, LogOut, LogIn, 
  ShieldCheck, CheckCircle2, Sparkles, Settings as SettingsIcon, Phone, Mail 
} from 'lucide-react';
import { AppUser } from '../services/authService';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AppUser | null;
  isGuest: boolean;
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
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
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
              
              <div className="space-y-0.5 mt-0.5">
                {user?.phoneNumber && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-[#25D366]" />
                    <span>{user.phoneNumber}</span>
                  </p>
                )}
                {user?.email && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{user.email}</span>
                  </p>
                )}
                {!user?.phoneNumber && !user?.email && (
                  <p className="text-xs text-slate-400">Mode découverte sans compte</p>
                )}
              </div>

              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30">
                <Sparkles className="w-3 h-3" />
                <span>{user ? `Compte vérifié (${user.provider})` : 'Visiteur'}</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-200 dark:bg-slate-800" />

          {/* Core Personal Actions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Mon Espace Personnel
            </h4>

            {/* Wishlist Link */}
            <div 
              onClick={() => {
                onOpenFavorites();
                onClose();
              }}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition-colors"
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

          {/* Action button: Logout or Sign In */}
          <div className="pt-2">
            {user ? (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-rose-500 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
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
                className="w-full py-3 rounded-xl bg-[#25D366] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:opacity-95 cursor-pointer"
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
