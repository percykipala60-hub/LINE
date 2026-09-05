import React, { useState } from 'react';
import { 
  Instagram, MessageCircle, Phone, MapPin, 
  Sparkles, Check, Edit2, ShieldAlert, PackageCheck 
} from 'lucide-react';
import { SellerContact } from '../types';
import { WebPUploaderSection } from './WebPUploaderSection';

interface ProfileViewProps {
  sellerContact: SellerContact;
  onUpdateSellerContact: (newContact: SellerContact) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  sellerContact,
  onUpdateSellerContact,
}) => {
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [phoneInput, setPhoneInput] = useState(sellerContact.whatsappNumber);
  const [instaInput, setInstaInput] = useState(sellerContact.instagramHandle);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSellerContact({
      ...sellerContact,
      whatsappNumber: phoneInput,
      instagramHandle: instaInput,
      instagramUrl: `https://instagram.com/${instaInput.replace('@', '')}`,
    });
    setIsEditingContact(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Brand Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-900 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white p-1 border-2 border-white/20 shadow-xl shrink-0">
            <img src="/line-logo.png" alt="LINE" className="w-full h-full object-cover rounded-xl" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-logo text-3xl">Line</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Boutique Officielle
              </span>
            </div>
            <p className="text-xs text-white/70">
              Maison de confection & Prêt-à-porter contemporain • Vêtements & Streetwear
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-white/80">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Kinshasa, RD Congo
              </span>
              <span className="flex items-center gap-1">
                <PackageCheck className="w-3.5 h-3.5 text-amber-400" />
                Livraison express & en mains propres
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Social Channels Settings Card */}
      <div className="bg-white dark:bg-[#121824] rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>Canaux de Commande Vendeur</span>
              {savedSuccess && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Enregistré
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Numéro WhatsApp et compte Instagram vers lesquels sont envoyées les commandes de vos clients.
            </p>
          </div>

          <button
            onClick={() => setIsEditingContact(!isEditingContact)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditingContact ? 'Annuler' : 'Modifier'}</span>
          </button>
        </div>

        {isEditingContact ? (
          <form onSubmit={handleSave} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Numéro WhatsApp Récepteur (avec indicatif pays, ex: +243...) :
              </label>
              <div className="relative">
                <MessageCircle className="w-4 h-4 text-emerald-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Ex : +243999999999"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Compte Instagram (Nom d'utilisateur) :
              </label>
              <div className="relative">
                <Instagram className="w-4 h-4 text-fuchsia-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={instaInput}
                  onChange={(e) => setInstaInput(e.target.value)}
                  placeholder="Ex : line.luxury.cd"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-fuchsia-500 text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all"
            >
              Enregistrer les coordonnées de vente
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">WhatsApp Réception</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {sellerContact.whatsappNumber}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-fuchsia-50/50 dark:bg-fuchsia-950/20 border border-fuchsia-100 dark:border-fuchsia-900/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 text-white flex items-center justify-center">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Instagram DM</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  @{sellerContact.instagramHandle}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Embedded WebP Image Optimization Studio */}
      <WebPUploaderSection />
    </div>
  );
};
