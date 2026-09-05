import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Mail, Lock, User as UserIcon, Phone,
  ArrowRight, AlertCircle, Eye, EyeOff, Loader2, ShieldCheck, UserPlus, CheckCircle2 
} from 'lucide-react';
import { authService, AppUser } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AppUser) => void;
  onContinueAsGuest: () => void;
  reason?: 'order' | 'chat' | 'general' | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onContinueAsGuest,
  reason = 'general',
}) => {
  // Main method: 'phone' (default for WhatsApp commerce) or 'email'
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');

  // Phone Form State
  const [phonePrefix, setPhonePrefix] = useState<string>('+243');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneName, setPhoneName] = useState<string>('');

  // Email Form State
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Common State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [canQuickRegister, setCanQuickRegister] = useState<boolean>(false);

  if (!isOpen) return null;

  // 1. Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setCanQuickRegister(false);
    try {
      const user = await authService.signInWithGoogle();
      onSuccess(user);
      onClose();
    } catch (err: any) {
      if (err.code === 'POPUP_CLOSED' || err.code === 'auth/popup-closed-by-user') {
        // User closed popup intentionally
      } else if (err.code === 'GOOGLE_DOMAIN_RESTRICTED' || err.code === 'auth/unauthorized-domain') {
        setErrorMessage("Le domaine actuel n'est pas encore activé dans Firebase pour Google. Vous pouvez utiliser votre numéro de téléphone ou votre e-mail ci-dessous.");
      } else {
        setErrorMessage(err.message || "Connexion Google temporairement indisponible.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Phone Authentication
  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `${phonePrefix}${phoneNumber}`;
      const user = await authService.signInWithPhone(fullPhone, phoneName);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la connexion par téléphone.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Email / Password Authentication
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setCanQuickRegister(false);

    try {
      let user: AppUser;
      if (isSignUp) {
        user = await authService.registerWithEmail(name, email, password);
      } else {
        user = await authService.loginWithEmail(email, password);
      }
      onSuccess(user);
      onClose();
    } catch (err: any) {
      const msg: string = err.message || 'Erreur d\'authentification.';
      setErrorMessage(msg);
      if (!isSignUp && (msg.includes('Aucun compte') || msg.includes('non trouvé'))) {
        setCanQuickRegister(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchToRegister = () => {
    setIsSignUp(true);
    setErrorMessage(null);
    setCanQuickRegister(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md rounded-3xl bg-[#0F141F] border border-slate-800 text-white shadow-2xl p-6 sm:p-7 space-y-5 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Clean Brand Header */}
          <div className="text-center space-y-1.5 pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-[#25D366]" />
              <span>Line • Kinshasa</span>
            </div>
            <h3 className="text-2xl font-bold font-logo text-white tracking-tight">
              Espace Client
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              {reason === 'order' && 'Connectez-vous pour valider votre panier et organiser la livraison en mains propres.'}
              {reason === 'chat' && 'Connectez-vous pour échanger directement avec notre service commercial WhatsApp.'}
              {(!reason || reason === 'general') && 'Accédez à votre compte, vos coups de cœur et vos coordonnées de livraison.'}
            </p>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
              {canQuickRegister && (
                <button
                  type="button"
                  onClick={switchToRegister}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Créer mon compte maintenant avec cet e-mail</span>
                </button>
              )}
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-3 transition-all duration-150 active:scale-98 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
            )}
            <span>Continuer avec Google</span>
          </button>

          {/* Clean Divider */}
          <div className="flex items-center gap-3 text-[10px] text-slate-500 uppercase tracking-wider">
            <div className="flex-1 h-px bg-slate-800" />
            <span>ou choisissez votre méthode</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Segmented Switcher: [ Téléphone ] | [ E-mail ] */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('phone');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                authMethod === 'phone'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-[#25D366]" />
              <span>Numéro WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('email');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                authMethod === 'email'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>E-mail & Passe</span>
            </button>
          </div>

          {/* METHOD 1: PHONE / WHATSAPP AUTHENTICATION */}
          {authMethod === 'phone' && (
            <form onSubmit={handlePhoneAuth} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Votre nom complet :
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={phoneName}
                    onChange={(e) => setPhoneName(e.target.value)}
                    placeholder="Ex : Sarah Mbayo"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#25D366] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Numéro de téléphone WhatsApp :
                </label>
                <div className="flex gap-2">
                  <select
                    value={phonePrefix}
                    onChange={(e) => setPhonePrefix(e.target.value)}
                    className="px-2.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-[#25D366] font-mono shrink-0"
                  >
                    <option value="+243">🇨🇩 +243 (RDC)</option>
                    <option value="+33">🇫🇷 +33 (France)</option>
                    <option value="+32">🇧🇪 +32 (Belgique)</option>
                    <option value="+1">🇺🇸 +1 (USA/Canada)</option>
                    <option value="+44">🇬🇧 +44 (UK)</option>
                    <option value="+27">🇿🇦 +27 (Afrique du Sud)</option>
                    <option value="+242">🇨🇬 +242 (Congo-Brazza)</option>
                  </select>
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="81 234 5678"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#25D366] transition-colors font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <>
                    <span>Se connecter avec ce numéro</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Idéal pour commander directement en mains propres sans mot de passe à retenir.
              </p>
            </form>
          )}

          {/* METHOD 2: EMAIL / PASSWORD AUTHENTICATION */}
          {authMethod === 'email' && (
            <div className="space-y-3.5">
              {/* Inscription / Connexion sub-tabs */}
              <div className="flex items-center justify-center gap-4 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMessage(null);
                  }}
                  className={`pb-1 font-semibold transition-colors cursor-pointer ${
                    !isSignUp
                      ? 'text-white border-b-2 border-[#25D366]'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Se connecter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMessage(null);
                  }}
                  className={`pb-1 font-semibold transition-colors cursor-pointer ${
                    isSignUp
                      ? 'text-white border-b-2 border-[#25D366]'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Créer un compte
                </button>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-3.5">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nom complet :
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex : Sarah Mbayo"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#25D366] transition-colors"
                        required={isSignUp}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Adresse e-mail :
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre.email@exemple.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#25D366] transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Mot de passe (minimum 6 caractères) :
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#25D366] transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <>
                      <span>{isSignUp ? 'Créer mon compte' : 'Se connecter'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Guest Mode Option */}
          <div className="pt-2 border-t border-slate-800/80 text-center space-y-1.5">
            <button
              type="button"
              onClick={() => {
                onContinueAsGuest();
                onClose();
              }}
              className="text-xs text-slate-400 hover:text-white font-medium underline underline-offset-4 transition-colors cursor-pointer"
            >
              Continuer en tant que visiteur libre
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/80" />
              <span>Paiement en mains propres • Données sécurisées</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
