import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, X, FileText, CheckCircle2, AlertTriangle, Truck } from 'lucide-react';

interface LegalTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalTermsModal: React.FC<LegalTermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-[#121824] rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                Mentions Légales & Modalités de Livraison
              </h3>
              <p className="text-xs text-slate-500">
                Maison de Confection & Distribution Exclusive LINE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {/* Important Legal Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs leading-normal">
              <strong className="font-bold block text-sm mb-0.5 text-amber-700 dark:text-amber-300">
                1. Aucun Paiement en Ligne (Sécurité Totale)
              </strong>
              L’application <strong>LINE</strong> n’effectue <strong>aucun prélèvement bancaire</strong>, n’enregistre aucun numéro de carte et ne requiert aucune transaction en ligne. Tout règlement s’effectue <strong>en espèces ou virement convenu directement en mains propres à la réception</strong> du colis après essayage.
            </div>
          </div>

          <section className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-500" />
              2. Distribution Exclusive
            </h4>
            <p>
              Cette plateforme est réservée à la distribution des créations authentiques de la marque LINE. Aucun vendeur tiers non certifié ne peut publier d’annonces, assurant une conformité totale des matières et des finitions.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-sky-500" />
              3. Protection des Données Personnelles
            </h4>
            <p>
              Les adresses de livraison et numéros de contact transmis via le panier ou la messagerie sont exclusivement destinés à l’acheminement du colis. Aucune donnée n’est vendue ni communiquée à des tiers.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              4. Droit d'inspection & d'essayage
            </h4>
            <p>
              Le client est invité à vérifier la taille, la couleur et le tissu en présence du coursier avant de conclure la transaction.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity"
          >
            J'ai compris
          </button>
        </div>
      </motion.div>
    </div>
  );
};
