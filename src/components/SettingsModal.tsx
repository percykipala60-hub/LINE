import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Settings as SettingsIcon, Moon, Sun, Globe, Shield, Phone, 
  Lock, CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles, FileText,
  Search, Monitor, Key, Bell, HelpCircle, User as UserIcon, Check, ChevronRight, ArrowLeft
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

type SettingsSection = 'general' | 'appearance' | 'account' | 'privacy' | 'help';

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
  const [selectedSection, setSelectedSection] = useState<SettingsSection | null>('appearance');
  const [searchQuery, setSearchQuery] = useState('');

  // Account linking state (Phone)
  const [linkPhone, setLinkPhone] = useState('');
  const [linkOtpStep, setLinkOtpStep] = useState(false);
  const [linkOtpCode, setLinkOtpCode] = useState('');
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
      setLinkSuccess('Numéro WhatsApp relié avec succès à votre compte !');
      setLinkOtpStep(false);
      setLinkPhone('');
      setLinkOtpCode('');
    } catch (err: any) {
      setLinkError(err.message || 'Code incorrect.');
    } finally {
      setLinkLoading(false);
    }
  };

  const menuItems = [
    {
      id: 'general' as SettingsSection,
      icon: Monitor,
      title: 'Général',
      subtitle: 'Démarrage, langue d\'affichage'
    },
    {
      id: 'appearance' as SettingsSection,
      icon: isDarkMode ? Moon : Sun,
      title: 'Apparence',
      subtitle: 'Thème sombre, clair et couleurs'
    },
    {
      id: 'account' as SettingsSection,
      icon: Key,
      title: 'Compte',
      subtitle: 'Sécurité, liaison WhatsApp, mot de passe'
    },
    {
      id: 'privacy' as SettingsSection,
      icon: Lock,
      title: 'Confidentialité',
      subtitle: 'Données personnelles, respect vie privée'
    },
    {
      id: 'help' as SettingsSection,
      icon: HelpCircle,
      title: 'Aide & Conditions',
      subtitle: 'Livraison mains propres, conditions de vente'
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Window Container - WhatsApp Desktop Parametric Design */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-4xl h-[88vh] max-h-[640px] bg-[#111B21] text-[#E9EDEF] rounded-2xl border border-[#222E35] shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row"
        >
          {/* Close button on mobile/desktop */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full hover:bg-[#202C33] text-[#8696A0] hover:text-[#E9EDEF] transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* LEFT SIDEBAR: Settings Menu Navigation */}
          <div className={`w-full md:w-80 border-r border-[#222E35] bg-[#111B21] flex flex-col shrink-0 ${
            selectedSection ? 'hidden md:flex' : 'flex'
          }`}>
            {/* Header */}
            <div className="p-4 pb-2">
              <h2 className="text-xl font-bold tracking-tight text-[#E9EDEF]">
                Paramètres
              </h2>
            </div>

            {/* Search Bar */}
            <div className="p-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#8696A0] absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher dans les paramètres..."
                  className="w-full pl-10 pr-3 py-2 rounded-xl bg-[#202C33] border border-transparent focus:border-[#00A884] text-xs text-[#E9EDEF] placeholder:text-[#8696A0] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* User Profile Summary Card */}
            <div className="px-3 py-2">
              <div className="p-3 rounded-2xl bg-[#202C33]/60 hover:bg-[#202C33] border border-[#222E35] flex items-center gap-3 transition-colors cursor-pointer"
                   onClick={() => setSelectedSection('account')}
              >
                <div className="w-12 h-12 rounded-full bg-[#005C4B] text-[#25D366] flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 border border-[#00A884]/40">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-6 h-6 text-[#E9EDEF]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-[#E9EDEF] truncate">
                    {user?.displayName || 'Visiteur'}
                  </h4>
                  <p className="text-[11px] text-[#8696A0] truncate font-mono">
                    {user?.phoneNumber || user?.email || 'Compte invité'}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px bg-[#222E35] my-1 mx-3" />

            {/* Navigation Menu List */}
            <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedSection(item.id)}
                    className={`w-full p-3 rounded-xl flex items-center gap-3.5 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#202C33] text-[#00A884]'
                        : 'hover:bg-[#202C33]/50 text-[#E9EDEF]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isSelected ? 'text-[#00A884]' : 'text-[#8696A0]'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs leading-tight">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[#8696A0] truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT DETAIL PANE */}
          <div className={`flex-1 flex flex-col bg-[#0B141A] ${
            selectedSection ? 'flex' : 'hidden md:flex'
          }`}>
            {selectedSection ? (
              <div className="flex-1 flex flex-col h-full overflow-y-auto">
                {/* Mobile Back Button Header */}
                <div className="p-4 border-b border-[#222E35] flex items-center gap-3 md:hidden">
                  <button
                    onClick={() => setSelectedSection(null)}
                    className="p-1.5 rounded-lg bg-[#202C33] text-[#8696A0] hover:text-[#E9EDEF]"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h3 className="font-bold text-base text-[#E9EDEF]">
                    {menuItems.find(m => m.id === selectedSection)?.title}
                  </h3>
                </div>

                {/* Section Header */}
                <div className="p-6 border-b border-[#222E35]">
                  <h3 className="text-xl font-bold text-[#E9EDEF]">
                    {menuItems.find(m => m.id === selectedSection)?.title}
                  </h3>
                  <p className="text-xs text-[#8696A0] mt-1">
                    {menuItems.find(m => m.id === selectedSection)?.subtitle}
                  </p>
                </div>

                {/* Section Body */}
                <div className="p-6 space-y-6 flex-1">

                  {/* 1. SECTION APPARENCE */}
                  {selectedSection === 'appearance' && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#8696A0]">
                          Choix du Thème
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              if (!isDarkMode) onToggleTheme();
                            }}
                            className={`p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                              isDarkMode
                                ? 'bg-[#202C33] border-[#00A884] text-[#E9EDEF] shadow-md ring-1 ring-[#00A884]'
                                : 'bg-[#111B21] border-[#222E35] text-[#8696A0] hover:border-[#8696A0]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#005C4B] text-[#25D366] flex items-center justify-center">
                                <Moon className="w-5 h-5" />
                              </div>
                              <div className="text-left">
                                <div className="font-bold text-sm">Mode Sombre</div>
                                <div className="text-[11px] text-[#8696A0]">Optimisé pour la nuit</div>
                              </div>
                            </div>
                            {isDarkMode && <Check className="w-5 h-5 text-[#00A884]" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (isDarkMode) onToggleTheme();
                            }}
                            className={`p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                              !isDarkMode
                                ? 'bg-[#202C33] border-[#00A884] text-[#E9EDEF] shadow-md ring-1 ring-[#00A884]'
                                : 'bg-[#111B21] border-[#222E35] text-[#8696A0] hover:border-[#8696A0]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                                <Sun className="w-5 h-5" />
                              </div>
                              <div className="text-left">
                                <div className="font-bold text-sm">Mode Clair</div>
                                <div className="text-[11px] text-[#8696A0]">Lumière du jour</div>
                              </div>
                            </div>
                            {!isDarkMode && <Check className="w-5 h-5 text-[#00A884]" />}
                          </button>
                        </div>
                        <p className="text-[11px] text-[#8696A0] italic">
                          ✓ Votre préférence est enregistrée pour toutes vos prochaines sessions.
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#222E35] space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#8696A0]">
                          Couleur d'accentuation
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#25D366] ring-2 ring-white cursor-pointer shadow-sm" title="Vert WhatsApp (LINE)" />
                          <div className="w-8 h-8 rounded-full bg-emerald-500 opacity-60 cursor-pointer" />
                          <div className="w-8 h-8 rounded-full bg-teal-500 opacity-60 cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. SECTION COMPTE & SÉCURITÉ */}
                  {selectedSection === 'account' && (
                    <div className="space-y-5">
                      <div className="p-4 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#8696A0] font-bold uppercase">Informations du compte</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#005C4B] text-[#25D366]">
                            {user ? 'Connecté' : 'Mode Invité'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#E9EDEF]">
                            {user?.displayName || 'Visiteur non enregistré'}
                          </div>
                          <div className="text-xs text-[#8696A0] font-mono mt-0.5">
                            {user?.email || 'Aucune adresse e-mail'}
                          </div>
                        </div>

                        {user?.phoneNumber ? (
                          <div className="p-2.5 rounded-xl bg-[#202C33] flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-[#25D366] font-mono">
                              <Phone className="w-3.5 h-3.5" />
                              <span>{user.phoneNumber}</span>
                            </span>
                            <span className="text-[10px] text-[#00A884] font-bold">Vérifié ✓</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Link WhatsApp Phone with 6-digit slots */}
                      {user && !user.phoneNumber && (
                        <div className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-4">
                          <div>
                            <h4 className="font-bold text-sm text-[#E9EDEF] flex items-center gap-2">
                              <Phone className="w-4 h-4 text-[#25D366]" />
                              <span>Lier un numéro WhatsApp à ce compte</span>
                            </h4>
                            <p className="text-xs text-[#8696A0] mt-1">
                              Permet d'accéder au même profil par téléphone ou par e-mail.
                            </p>
                          </div>

                          {linkError && (
                            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>{linkError}</span>
                            </div>
                          )}

                          {linkSuccess && (
                            <div className="p-3 rounded-xl bg-[#005C4B]/40 border border-[#00A884]/40 text-[#25D366] text-xs flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              <span>{linkSuccess}</span>
                            </div>
                          )}

                          {!linkOtpStep ? (
                            <form onSubmit={handleRequestLinkOtp} className="space-y-3">
                              <div className="relative">
                                <Phone className="w-4 h-4 text-[#8696A0] absolute left-3.5 top-3" />
                                <input
                                  type="tel"
                                  value={linkPhone}
                                  onChange={(e) => setLinkPhone(e.target.value)}
                                  placeholder="+243 85 64 26 399"
                                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#202C33] border border-[#222E35] text-xs text-[#E9EDEF] font-mono focus:outline-none focus:border-[#00A884]"
                                  required
                                />
                              </div>
                              <button
                                type="submit"
                                disabled={linkLoading || !linkPhone.trim()}
                                className="w-full py-2.5 rounded-xl bg-[#00A884] hover:bg-[#008f72] text-[#111B21] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
                              >
                                {linkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Recevoir le code de sécurité</span>}
                              </button>
                            </form>
                          ) : (
                            <form onSubmit={handleConfirmLink} className="space-y-3 text-center">
                              <label className="block text-xs text-[#8696A0]">
                                Entrez le code à 6 chiffres envoyé à <strong className="text-white font-mono">{linkPhone}</strong> :
                              </label>

                              {/* 6-digit visual slots with underscore */}
                              <div className="flex justify-center items-center gap-2 my-2">
                                {[0, 1, 2, 3, 4, 5].map((idx) => {
                                  const digit = linkOtpCode[idx] || '';
                                  return (
                                    <div 
                                      key={idx}
                                      className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center font-mono font-bold text-xl transition-all ${
                                        digit
                                          ? 'border-[#00A884] bg-[#202C33] text-[#E9EDEF]'
                                          : 'border-[#222E35] bg-[#111B21] text-[#8696A0]'
                                      }`}
                                    >
                                      {digit ? digit : <span className="text-[#8696A0] font-normal">_</span>}
                                    </div>
                                  );
                                })}
                              </div>

                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={linkOtpCode}
                                onChange={(e) => setLinkOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="______"
                                className="w-full text-center py-2 rounded-xl bg-[#202C33] border border-[#222E35] text-sm font-mono tracking-widest text-[#E9EDEF] focus:outline-none focus:border-[#00A884]"
                                required
                              />

                              <button
                                type="submit"
                                disabled={linkLoading || linkOtpCode.length < 6}
                                className="w-full py-2.5 rounded-xl bg-[#00A884] hover:bg-[#008f72] text-[#111B21] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
                              >
                                {linkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Valider la liaison</span>}
                              </button>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. SECTION GÉNÉRAL */}
                  {selectedSection === 'general' && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#8696A0]">
                          Langue d'affichage
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => onSelectLanguage('fr')}
                            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                              language === 'fr'
                                ? 'bg-[#202C33] border-[#00A884] text-[#00A884]'
                                : 'bg-[#111B21] border-[#222E35] text-[#8696A0] hover:text-[#E9EDEF]'
                            }`}
                          >
                            <span>🇫🇷 Français (Kinshasa)</span>
                            {language === 'fr' && <Check className="w-4 h-4 text-[#00A884]" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => onSelectLanguage('en')}
                            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                              language === 'en'
                                ? 'bg-[#202C33] border-[#00A884] text-[#00A884]'
                                : 'bg-[#111B21] border-[#222E35] text-[#8696A0] hover:text-[#E9EDEF]'
                            }`}
                          >
                            <span>🇬🇧 English</span>
                            {language === 'en' && <Check className="w-4 h-4 text-[#00A884]" />}
                          </button>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-2">
                        <div className="font-bold text-xs text-[#E9EDEF]">Mode Commande Express</div>
                        <p className="text-[11px] text-[#8696A0] leading-relaxed">
                          La validation du panier ouvre directement votre message WhatsApp préparé avec les articles sélectionnés pour une livraison rapide en mains propres.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 4. SECTION CONFIDENTIALITÉ */}
                  {selectedSection === 'privacy' && (
                    <div className="space-y-5">
                      <div className="p-4 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-3">
                        <div className="flex items-center gap-2 text-[#00A884] font-bold text-sm">
                          <Lock className="w-4 h-4" />
                          <span>Confidentialité et Protection des Données</span>
                        </div>
                        <p className="text-xs text-[#8696A0] leading-relaxed">
                          Chez LINE, vos numéros de téléphone et coordonnées sont utilisés exclusivement pour la coordination de vos livraisons en mains propres à Kinshasa. Vos données ne sont jamais vendues ni partagées à des tiers.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenLegalTerms();
                        }}
                        className="w-full p-3.5 rounded-2xl bg-[#202C33] border border-[#222E35] hover:border-[#8696A0] flex items-center justify-between text-xs font-semibold text-[#E9EDEF] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-[#00A884]" />
                          <span>Lire les conditions complètes et mentions légales</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#8696A0]" />
                      </button>
                    </div>
                  )}

                  {/* 5. SECTION AIDE & CONDITIONS */}
                  {selectedSection === 'help' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-2">
                        <div className="font-bold text-sm text-[#E9EDEF]">Boutique de Mode LINE</div>
                        <p className="text-xs text-[#8696A0] leading-relaxed">
                          Articles exclusifs, drops réguliers et livraison en mains propres à Kinshasa (Gombe, Kintambo, Ngaliema, Limete, etc.).
                        </p>
                        <div className="pt-2 text-[11px] text-[#8696A0] font-mono">
                          Version de l'application : 1.2.0 • Hébergé sur Google Cloud
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              /* Watermark state when no section is selected (matches WhatsApp screenshot) */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#8696A0]">
                <div className="w-20 h-20 rounded-full bg-[#111B21] border border-[#222E35] flex items-center justify-center mb-4 text-[#8696A0]">
                  <SettingsIcon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-[#E9EDEF]">
                  Paramètres
                </h3>
                <p className="text-xs text-[#8696A0] max-w-xs mt-2">
                  Sélectionnez une option dans le panneau de gauche pour configurer votre application.
                </p>
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
