import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Mail, Lock, User as UserIcon, Phone,
  ArrowRight, AlertCircle, Eye, EyeOff, Loader2, ShieldCheck, UserPlus, CheckCircle2, KeyRound 
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
  // Main Method: 'phone' or 'email'
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');

  // Mode: 'login' (standard password) | 'signup' (new account with 6-digit OTP) | 'forgot' (reset via 6 digits)
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');

  // Verification step for OTP
  const [otpStep, setOtpStep] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');

  // Form Fields
  const [name, setName] = useState<string>('');
  const [phonePrefix, setPhonePrefix] = useState<string>('+243');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Common UI State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `${phonePrefix}${phoneNumber}`;
  const targetContact = authMethod === 'phone' ? fullPhone : email;

  // 1. Google Sign-In (1-click direct, fast <2s dismiss)
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    // Safety timeout to prevent spinner from staying indefinitely
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    try {
      const user = await authService.signInWithGoogle();
      clearTimeout(safetyTimer);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      clearTimeout(safetyTimer);
      if (err.code === 'POPUP_CLOSED' || err.code === 'auth/popup-closed-by-user') {
        // Closed intentionally
      } else if (err.code === 'GOOGLE_DOMAIN_RESTRICTED' || err.code === 'auth/unauthorized-domain') {
        setErrorMessage("Le domaine actuel n'est pas encore activé dans Firebase pour Google. Vous pouvez vous connecter avec votre numéro ou votre e-mail ci-dessous.");
      } else {
        setErrorMessage(err.message || "Connexion Google temporairement indisponible.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Start Signup: Request 6-digit OTP code
  const handleStartSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      if (authMethod === 'phone') {
        if (!phoneNumber || phoneNumber.length < 6) {
          throw new Error('Veuillez renseigner un numéro de téléphone valide.');
        }
      } else {
        if (!email || !email.includes('@')) {
          throw new Error('Veuillez renseigner une adresse e-mail valide.');
        }
      }

      if (password.length < 6) {
        throw new Error('Le mot de passe doit comporter au moins 6 caractères.');
      }
      if (!name.trim()) {
        throw new Error('Veuillez renseigner votre nom complet.');
      }

      // Send OTP
      const res = await authService.sendOtpCode(targetContact);
      setInfoMessage(`Code à 6 chiffres transmis à ${targetContact}. Code de test console : 123456.`);
      setOtpStep(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Impossible d\'envoyer le code de vérification.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Confirm Signup: Verify 6 digits & create account
  const handleConfirmSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      let user: AppUser;
      if (authMethod === 'phone') {
        user = await authService.registerWithPhone(fullPhone, password, name, otpCode);
      } else {
        user = await authService.registerWithEmail(name, email, password, otpCode);
      }
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Code de vérification invalide.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Login: Phone or Email + Password (instant, no SMS needed!)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      let user: AppUser;
      if (authMethod === 'phone') {
        user = await authService.loginWithPhone(fullPhone, password);
      } else {
        user = await authService.loginWithEmail(email, password);
      }
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Identifiants incorrects.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Start Forgot Password: Send 6-digit OTP
  const handleStartForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const res = await authService.sendOtpCode(targetContact);
      setInfoMessage(`Code de réinitialisation à 6 chiffres envoyé à ${targetContact} (code test: 123456).`);
      setOtpStep(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Impossible d\'envoyer le code de réinitialisation.');
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Confirm Forgot Password: Verify 6 digits & set new password
  const handleConfirmForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authService.resetPasswordWithOtp(targetContact, otpCode, newPassword);
      setInfoMessage('Votre mot de passe a été mis à jour avec succès ! Vous pouvez maintenant vous connecter.');
      setMode('login');
      setOtpStep(false);
      setPassword(newPassword);
    } catch (err: any) {
      setErrorMessage(err.message || 'Code ou mot de passe invalide.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetFlow = (newMode: 'login' | 'signup' | 'forgot') => {
    setMode(newMode);
    setOtpStep(false);
    setOtpCode('');
    setErrorMessage(null);
    setInfoMessage(null);
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
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-md bg-white dark:bg-[#121824] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden z-10 text-slate-900 dark:text-white"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="p-6 pb-2 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-[#25D366]" />
              <span>LINE • Kinshasa</span>
            </div>
            <h3 className="text-2xl font-bold font-logo tracking-tight">
              {mode === 'login' && 'Connexion Sécurisée'}
              {mode === 'signup' && 'Inscription Compte LINE'}
              {mode === 'forgot' && 'Réinitialiser mon mot de passe'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
              {mode === 'login' && 'Retrouvez votre panier, vos coups de cœur et vos échanges avec la boutique.'}
              {mode === 'signup' && 'Vérification de sécurité par code à 6 chiffres pour protéger votre ligne.'}
              {mode === 'forgot' && 'Validez les 6 chiffres reçus pour définir votre nouveau mot de passe.'}
            </p>
          </div>

          <div className="p-6 pt-2 space-y-4">
            {/* Info Message Box */}
            {infoMessage && (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{infoMessage}</span>
              </div>
            )}

            {/* Error Message Box */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Google Sign-in (Available in Login and Signup) */}
            {mode !== 'forgot' && !otpStep && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-900 dark:text-white font-semibold text-xs flex items-center justify-center gap-3 transition-all duration-150 active:scale-98 cursor-pointer shadow-xs border border-slate-200 dark:border-slate-700/80 disabled:opacity-50"
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
                  <span>Continuer en 1 clic avec Google</span>
                </button>

                <div className="flex items-center gap-3 text-[10px] text-slate-400 uppercase tracking-wider">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                  <span>ou avec vos identifiants</span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                </div>
              </>
            )}

            {/* Segmented Switcher: [ Téléphone ] | [ E-mail ] */}
            {!otpStep && (
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('phone');
                    setErrorMessage(null);
                  }}
                  className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    authMethod === 'phone'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>Téléphone WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('email');
                    setErrorMessage(null);
                  }}
                  className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    authMethod === 'email'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Adresse E-mail</span>
                </button>
              </div>
            )}

            {/* --- CASE A: OTP STEP (6-DIGIT VERIFICATION) --- */}
            {otpStep ? (
              <form onSubmit={mode === 'signup' ? handleConfirmSignup : handleConfirmForgot} className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-[#25D366]/20 text-[#25D366] flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs">Vérification de possession (6 chiffres)</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Veuillez saisir le code à 6 chiffres envoyé pour valider :
                    <br />
                    <strong className="text-slate-900 dark:text-white font-mono">{targetContact}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2 text-slate-700 dark:text-slate-300 text-center">
                    Code de confirmation à 6 chiffres :
                  </label>

                  {/* 6 Visual digit slots with underscore */}
                  <div className="flex justify-center items-center gap-2 sm:gap-3 my-3">
                    {[0, 1, 2, 3, 4, 5].map((idx) => {
                      const digit = otpCode[idx] || '';
                      return (
                        <div 
                          key={idx}
                          className={`w-11 h-14 rounded-xl border-2 flex flex-col items-center justify-center font-mono font-bold text-2xl transition-all ${
                            digit
                              ? 'border-[#25D366] bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                              : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-400'
                          }`}
                        >
                          <span>{digit || ''}</span>
                          {!digit && <span className="text-slate-400 dark:text-slate-600 text-lg leading-none -mt-1 font-bold">_</span>}
                        </div>
                      );
                    })}
                  </div>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="______"
                    className="w-full text-center py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-base font-mono tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-[#25D366] transition-colors"
                    required
                    autoFocus
                  />
                </div>

                {/* If mode is forgot, also ask for new password */}
                {mode === 'forgot' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nouveau mot de passe :
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Au moins 6 caractères"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#25D366]"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 6}
                  className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm transition-all active:scale-98"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{mode === 'signup' ? 'Valider et créer mon compte' : 'Confirmer le nouveau mot de passe'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setOtpStep(false)}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer"
                >
                  Modifier les coordonnées ou recommencer
                </button>
              </form>
            ) : (
              <>
                {/* --- CASE B: LOGIN FORM --- */}
                {mode === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-3.5">
                    {/* Identifier field */}
                    {authMethod === 'phone' ? (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Numéro de téléphone :
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={phonePrefix}
                            onChange={(e) => setPhonePrefix(e.target.value)}
                            className="px-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono shrink-0"
                          >
                            <option value="+243">🇨🇩 +243</option>
                            <option value="+33">🇫🇷 +33</option>
                            <option value="+32">🇧🇪 +32</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+44">🇬🇧 +44</option>
                            <option value="+242">🇨🇬 +242</option>
                          </select>
                          <div className="relative flex-1">
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="81 234 5678"
                              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#25D366]"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Adresse e-mail :
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="sarah@exemple.com"
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#25D366]"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Password field */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Mot de passe :
                        </label>
                        <button
                          type="button"
                          onClick={() => resetFlow('forgot')}
                          className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          Mot de passe oublié ?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Votre mot de passe"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#25D366]"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98 transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Se connecter</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                      Pas encore de compte ?{' '}
                      <button
                        type="button"
                        onClick={() => resetFlow('signup')}
                        className="font-bold text-slate-900 dark:text-white underline cursor-pointer"
                      >
                        Créer un compte
                      </button>
                    </div>
                  </form>
                )}

                {/* --- CASE C: SIGNUP FORM (WITH 6-DIGIT OTP FLOW) --- */}
                {mode === 'signup' && (
                  <form onSubmit={handleStartSignup} className="space-y-3">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Votre nom complet :
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex : Sarah Mbayo"
                          className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#25D366]"
                          required
                        />
                      </div>
                    </div>

                    {/* Contact (Phone or Email) */}
                    {authMethod === 'phone' ? (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Numéro de téléphone :
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={phonePrefix}
                            onChange={(e) => setPhonePrefix(e.target.value)}
                            className="px-2 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono shrink-0"
                          >
                            <option value="+243">🇨🇩 +243</option>
                            <option value="+33">🇫🇷 +33</option>
                            <option value="+32">🇧🇪 +32</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+44">🇬🇧 +44</option>
                            <option value="+242">🇨🇬 +242</option>
                          </select>
                          <div className="relative flex-1">
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                            <input
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="81 234 5678"
                              className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#25D366]"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Adresse e-mail :
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="sarah@exemple.com"
                            className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#25D366]"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Choose Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Créer un mot de passe :
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Au moins 6 caractères"
                          className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#25D366]"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98 transition-all disabled:opacity-50 mt-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Recevoir mon code de validation (6 chiffres)</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                      Vous avez déjà un compte ?{' '}
                      <button
                        type="button"
                        onClick={() => resetFlow('login')}
                        className="font-bold text-slate-900 dark:text-white underline cursor-pointer"
                      >
                        Se connecter
                      </button>
                    </div>
                  </form>
                )}

                {/* --- CASE D: FORGOT PASSWORD FORM --- */}
                {mode === 'forgot' && (
                  <form onSubmit={handleStartForgot} className="space-y-3.5">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Entrez votre {authMethod === 'phone' ? 'numéro de téléphone' : 'adresse e-mail'} pour recevoir le code de sécurité à 6 chiffres.
                    </p>

                    {authMethod === 'phone' ? (
                      <div className="flex gap-2">
                        <select
                          value={phonePrefix}
                          onChange={(e) => setPhonePrefix(e.target.value)}
                          className="px-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono shrink-0"
                        >
                          <option value="+243">🇨🇩 +243</option>
                          <option value="+33">🇫🇷 +33</option>
                          <option value="+32">🇧🇪 +32</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                        </select>
                        <div className="relative flex-1">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="81 234 5678"
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#25D366]"
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="sarah@exemple.com"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#25D366]"
                          required
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98 transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Envoyer le code à 6 chiffres</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => resetFlow('login')}
                      className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer"
                    >
                      Retour à la connexion
                    </button>
                  </form>
                )}
              </>
            )}

            {/* Guest Continue Footer */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                type="button"
                onClick={() => {
                  onContinueAsGuest();
                  onClose();
                }}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                Continuer en mode visiteur sans compte
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
