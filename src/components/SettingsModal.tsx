import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Settings, Moon, Sun, Globe, Shield, Phone, 
  Lock, CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles, FileText
} from 'lucide-react';
import { Language } from '../translations';
import { AppUser, authService } from '../services/authService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  user: AppUser | null;
  onUserUpdated: (user: AppUser) => void;
  onOpenLegalTerms: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onToggleTheme,
  language,
  onSelectLanguage,
  user,
  onUserUpdated,
  onOpenLegalTerms,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'security'>('general');

  // Account linking state (Phone)
  const [linkPhone, setLinkPhone] = useState('+243 85 64 26 399');
  const [linkOtpStep, setLinkOtpStep] = useState(false);
  const [linkOtpCode, setLinkOtpCode] = useState('123456');
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);

  if (!isOpen) return null;

  // Step 1: Request OTP for phone linking
  const handleRequestLinkOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError(null);
    setLinkSuccess(null);
    setLinkLoading(true);

    try {
      const res = await authService.sendOtpCode(linkPhone);
      setLinkOtpStep(true);
      setLinkSuccess(res.message);
    } catch (err: any) {
      setLinkError(err.message || 'Impossible d\'envoyer le code de validation.');
    } finally {
      setLinkLoading(false);
    }
  };

  // Step 2: Confirm OTP and link phone
  const handleConfirmLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLinkError(null);
    setLinkSuccess(null);
    setLinkLoading(true);

    try {
      const updatedUser = await authService.linkPhoneToAccount(user.uid, linkPhone, linkOtpCode);
      onUserUpdated(updatedUser);
      setLinkSuccess('Votre numéro WhatsApp a été relié avec succès à votre profil unique !');
      setLinkOtpStep(false);
      setLinkPhone('');
      setLinkOtpCode('');
    } catch (err: any) {
      setLinkError(err.message || 'Code incorrect.');
    } finally {
      setLinkLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-md bg-white dark:bg-[#121824] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden z-10 text-slate-900 dark:text-white"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xs">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">Paramètres de l'Application</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Préférences d'affichage et sécurité</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subtabs switcher */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 px-5 pt-3 gap-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveSubTab('general')}
              className={`pb-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'general'
                  ? 'border-b-2 border-[#25D366] text-slate-900 dark:text-white'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <span>Général & Apparence</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('security')}
              className={`pb-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'security'
                  ? 'border-b-2 border-[#25D366] text-slate-900 dark:text-white'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sécurité & Double Liaison</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">

            {/* TAB 1: GENERAL & APPEARANCE */}
            {activeSubTab === 'general' && (
              <>
                {/* Theme Selector with Live Persistence */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Apparence & Lumière (Mémorisé pour vos visites)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (isDarkMode) onToggleTheme();
                      }}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                        !isDarkMode
                          ? 'border-slate-900 bg-slate-100 text-slate-900 shadow-sm font-bold ring-2 ring-slate-900/10'
                          : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Sun className="w-5 h-5 text-amber-500" />
                      <span className="text-xs">Mode Clair</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!isDarkMode) onToggleTheme();
                      }}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                        isDarkMode
                          ? 'border-[#25D366] bg-slate-800 text-white shadow-sm font-bold ring-2 ring-[#25D366]/20'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Moon className="w-5 h-5 text-indigo-400" />
                      <span className="text-xs">Mode Sombre</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    ✓ La couleur sélectionnée reste active même après avoir fermé votre navigateur.
                  </p>
                </div>

                {/* Language Selector */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Langue d'affichage
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => onSelectLanguage('fr')}
                      className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                        language === 'fr'
                          ? 'bg-[#25D366]/15 border-[#25D366] text-[#25D366]'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>🇫🇷 Français (Défaut)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectLanguage('en')}
                      className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                        language === 'en'
                          ? 'bg-[#25D366]/15 border-[#25D366] text-[#25D366]'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>🇬🇧 English</span>
                    </button>
                  </div>
                </div>

                {/* Privacy & Legal Terms button */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Confidentialité & Engagements
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenLegalTerms();
                    }}
                    className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-slate-400 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      <span>Politique de confidentialité & Conditions de vente</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </>
            )}

            {/* TAB 2: SECURITY & DOUBLE ACCOUNT LINKING */}
            {activeSubTab === 'security' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Double Authentification & Liaison de compte</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                    Vous pouvez associer à la fois votre compte Google, votre e-mail et votre numéro WhatsApp au même profil pour une sécurité renforcée et un accès universel.
                  </p>
                </div>

                {user ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Compte actif :</div>
                      <div className="font-bold text-slate-900 dark:text-white">{user.displayName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {user.email || user.phoneNumber || 'Connecté'}
                      </div>
                      {user.phoneNumber && (
                        <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#25D366] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Numéro WhatsApp associé : {user.phoneNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Form to link phone if not linked */}
                    {!user.phoneNumber && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Associer un numéro de téléphone WhatsApp :
                        </h4>

                        {linkError && (
                          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{linkError}</span>
                          </div>
                        )}

                        {linkSuccess && (
                          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>{linkSuccess}</span>
                          </div>
                        )}

                        {!linkOtpStep ? (
                          <form onSubmit={handleRequestLinkOtp} className="space-y-2">
                            <div className="relative">
                              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                              <input
                                type="tel"
                                value={linkPhone}
                                onChange={(e) => setLinkPhone(e.target.value)}
                                placeholder="+243 81 234 5678"
                                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#25D366]"
                                required
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={linkLoading || !linkPhone.trim()}
                              className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] text-black font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
                            >
                              {linkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Recevoir le code de vérification (6 chiffres)</span>}
                            </button>
                          </form>
                        ) : (
                          <form onSubmit={handleConfirmLink} className="space-y-2">
                            <label className="block text-[11px] text-slate-400">
                              Entrez le code à 6 chiffres reçu pour {linkPhone} :
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              value={linkOtpCode}
                              onChange={(e) => setLinkOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                              placeholder="123456"
                              className="w-full text-center py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-lg font-mono font-bold tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-[#25D366]"
                              required
                            />
                            <button
                              type="submit"
                              disabled={linkLoading || linkOtpCode.length < 6}
                              className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] text-black font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
                            >
                              {linkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Valider et lier au compte</span>}
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 space-y-2">
                    <Lock className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-xs font-semibold">Connectez-vous pour gérer la sécurité de votre compte</p>
                  </div>
                )}
              </div>
            )}

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
