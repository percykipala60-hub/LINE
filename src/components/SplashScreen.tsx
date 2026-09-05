import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 400);
          return 100;
        }
        return prev + 5;
      });
    }, 60);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 bg-[#0B0F17] flex flex-col items-center justify-between p-8 text-white select-none"
    >
      {/* Top subtle badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pt-6 flex items-center gap-1.5 text-xs text-emerald-400/80 uppercase tracking-widest font-semibold"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Application Officielle</span>
      </motion.div>

      {/* Center Animated Brand Symbol & Logo */}
      <div className="flex flex-col items-center text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative"
        >
          {/* Glowing Aura */}
          <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />

          {/* Luxury Monogram Badge */}
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700/80 shadow-2xl flex items-center justify-center p-3">
            <span className="font-logo text-5xl tracking-tighter text-white">Line</span>
            <span className="absolute bottom-3.5 right-4 w-3 h-3 rounded-full bg-[#25D366] shadow-[0_0_10px_#25D366]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="space-y-1"
        >
          <h1 className="font-logo text-4xl tracking-tight text-white">
            Line <span className="text-slate-400 font-sans text-sm font-light uppercase tracking-widest">• Store</span>
          </h1>
          <p className="text-xs text-slate-400 tracking-[0.2em] uppercase font-medium">
            Haute Confection • Kinshasa
          </p>
        </motion.div>
      </div>

      {/* Bottom Loading Progress & Confidentiality clauses badge */}
      <div className="w-full max-w-xs space-y-4 pb-4">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-800/80 h-1 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-[#25D366]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Chargement de la collection</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Security & Confidentiality guarantee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Paiement en mains propres • Données protégées</span>
        </motion.div>
      </div>
    </motion.div>
  );
};
