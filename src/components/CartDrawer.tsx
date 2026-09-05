import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Trash2, Plus, Minus, ShoppingBag, 
  MapPin, Phone, User, MessageCircle, Instagram, 
  ArrowRight, ShieldCheck, CheckCircle2, Copy, Sparkles, ExternalLink
} from 'lucide-react';
import { CartItem, OrderDetails, SellerContact } from '../types';
import { createWhatsAppOrderUrl, getInstagramOrderAction, generateOrderSummaryText } from '../utils/orderMessaging';
import { formatDualPrice, getCurrencyMode } from '../utils/currencyUtils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  sellerContact: SellerContact;
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  user?: { displayName?: string | null; email?: string | null; phoneNumber?: string | null } | null;
  onRequireAuth?: (reason: 'order') => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  sellerContact,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  user,
  onRequireAuth,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Customer order form inputs
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    customerName: user?.displayName || '',
    phone: (user as any)?.phoneNumber || '',
    deliveryCity: 'Kinshasa',
    deliveryAddress: '',
    preferredNetwork: 'whatsapp',
    notes: '',
  });

  // Keep customerName and phone in sync if user logs in
  React.useEffect(() => {
    if (user) {
      setOrderDetails((prev) => ({
        ...prev,
        customerName: prev.customerName || user.displayName || '',
        phone: prev.phone || (user as any)?.phoneNumber || '',
      }));
    }
  }, [user]);

  if (!isOpen) return null;

  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const currency = items[0]?.product.currency || '$';

  const handleLaunchWhatsApp = () => {
    if (!user && onRequireAuth) {
      onRequireAuth('order');
      return;
    }
    const url = createWhatsAppOrderUrl(items, orderDetails, sellerContact);
    window.open(url, '_blank', 'noopener,noreferrer');
    setStep('success');
  };

  const handleLaunchInstagram = () => {
    if (!user && onRequireAuth) {
      onRequireAuth('order');
      return;
    }
    const { url, message } = getInstagramOrderAction(items, orderDetails, sellerContact);
    // Copy the formatted order message to clipboard so user can paste in Instagram DM
    navigator.clipboard.writeText(message);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
    window.open(url, '_blank', 'noopener,noreferrer');
    setStep('success');
  };

  const handleCopyMessage = () => {
    const message = generateOrderSummaryText(items, orderDetails, sellerContact);
    navigator.clipboard.writeText(message);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
        {/* Backdrop click to dismiss */}
        <div className="flex-1" onClick={onClose} />

        {/* Drawer Content */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full max-w-lg h-full bg-white dark:bg-[#0E131F] shadow-2xl flex flex-col z-10 border-l border-slate-200 dark:border-slate-800"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-slate-800 dark:text-white" />
              <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                {step === 'cart' && `Mon Panier (${items.reduce((s, i) => s + i.quantity, 0)})`}
                {step === 'checkout' && 'Livraison & Commande Directe'}
                {step === 'success' && 'Demande envoyée !'}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body content based on step */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-5">
            {step === 'cart' && (
              <>
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                      Votre panier est vide
                    </h3>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Explorez la collection LINE et ajoutez vos vêtements favoris pour commander en toute simplicité.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80"
                      >
                        {/* Thumb */}
                        <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1">
                                {item.product.name}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Taille : <span className="font-medium text-slate-700 dark:text-slate-300">{item.variant.size}</span> • Couleur : <span className="font-medium text-slate-700 dark:text-slate-300">{item.variant.color}</span>
                              </p>
                            </div>
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Quantity & Price */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5">
                              <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-black"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold w-4 text-center text-slate-900 dark:text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-black"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="text-right">
                              <span className="font-bold text-sm text-slate-900 dark:text-white block">
                                {formatDualPrice(item.product.price * item.quantity, item.product.currency).primary}
                              </span>
                              {getCurrencyMode() === 'BOTH' && (
                                <span className="text-[10px] text-[#25D366] font-semibold block">
                                  {formatDualPrice(item.product.price * item.quantity, item.product.currency).secondaryLabel}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Notice on delivery replacement */}
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                      <div>
                        <span className="font-bold">Paiement à la livraison :</span> Les commandes sont conclues directement avec le vendeur sur WhatsApp ou Instagram pour convenir du lieu et de l’heure de livraison.
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {step === 'checkout' && (
              <div className="space-y-4">
                {/* Form fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Votre Nom & Prénom *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={orderDetails.customerName}
                        onChange={(e) => setOrderDetails({ ...orderDetails, customerName: e.target.value })}
                        placeholder="Ex : Daniel K."
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Numéro de téléphone / WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={orderDetails.phone}
                        onChange={(e) => setOrderDetails({ ...orderDetails, phone: e.target.value })}
                        placeholder="Ex : +243 81 234 5678"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Ville *
                      </label>
                      <input
                        type="text"
                        value={orderDetails.deliveryCity}
                        onChange={(e) => setOrderDetails({ ...orderDetails, deliveryCity: e.target.value })}
                        placeholder="Kinshasa, Lubumbashi..."
                        className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Quartier / Commune
                      </label>
                      <input
                        type="text"
                        value={orderDetails.deliveryAddress}
                        onChange={(e) => setOrderDetails({ ...orderDetails, deliveryAddress: e.target.value })}
                        placeholder="Gombe, Ngaliema..."
                        className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Instructions de livraison / Repères
                    </label>
                    <textarea
                      rows={2}
                      value={orderDetails.notes}
                      onChange={(e) => setOrderDetails({ ...orderDetails, notes: e.target.value })}
                      placeholder="Précisez un croisement, une avenue ou une heure souhaitée..."
                      className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Network Selection Banner */}
                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Choisissez votre réseau pour commander :
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    {/* WhatsApp Choice */}
                    <button
                      type="button"
                      onClick={() => setOrderDetails({ ...orderDetails, preferredNetwork: 'whatsapp' })}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all ${
                        orderDetails.preferredNetwork === 'whatsapp'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-sm">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-xs">WhatsApp</span>
                      <span className="text-[10px] text-slate-500">Message pré-rempli instantané</span>
                    </button>

                    {/* Instagram Choice */}
                    <button
                      type="button"
                      onClick={() => setOrderDetails({ ...orderDetails, preferredNetwork: 'instagram' })}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all ${
                        orderDetails.preferredNetwork === 'instagram'
                          ? 'border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-900 dark:text-fuchsia-100 ring-2 ring-fuchsia-500/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 text-white flex items-center justify-center shadow-sm">
                        <Instagram className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-xs">Instagram DM</span>
                      <span className="text-[10px] text-slate-500">Direct Message @{sellerContact.instagramHandle}</span>
                    </button>
                  </div>
                </div>

                {/* Preview Message Accordion */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-1.5">
                    <span className="font-semibold">Aperçu du message transmis au vendeur :</span>
                    <button
                      onClick={handleCopyMessage}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedNotification ? 'Copié !' : 'Copier texte'}
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-24 overflow-y-auto p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                    {generateOrderSummaryText(items, orderDetails, sellerContact)}
                  </pre>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Redirection en cours !
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm">
                  Votre message de commande a été généré. Vous pouvez échanger directement avec le vendeur pour valider le créneau de livraison et le paiement en mains propres.
                </p>

                <div className="w-full pt-4 space-y-2">
                  <button
                    onClick={handleLaunchWhatsApp}
                    className="w-full py-3 px-4 rounded-xl bg-[#25D366] text-white font-semibold text-xs flex items-center justify-center gap-2 hover:brightness-105 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Relancer la conversation WhatsApp</span>
                  </button>

                  <button
                    onClick={() => {
                      onClearCart();
                      onClose();
                      setStep('cart');
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-semibold text-xs hover:bg-slate-200 transition-all"
                  >
                    Vider le panier et continuer mes achats
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bottom Sheet Bar */}
          {items.length > 0 && step !== 'success' && (
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-[#0E131F]/95 backdrop-blur-md">
              <div className="flex items-baseline justify-between mb-3 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-xs">Total commande :</span>
                  {getCurrencyMode() === 'BOTH' && (
                    <span className="text-[10px] text-slate-400 block">Taux : 1 $ = 2 800 FC</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-black text-xl text-slate-900 dark:text-white block">
                    {formatDualPrice(totalAmount, currency).primary}
                  </span>
                  {getCurrencyMode() === 'BOTH' && (
                    <span className="text-sm font-bold text-[#25D366] block">
                      {formatDualPrice(totalAmount, currency).secondaryLabel}
                    </span>
                  )}
                </div>
              </div>

              {step === 'cart' && (
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
                >
                  <span>Passer à la livraison</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {step === 'checkout' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setStep('cart')}
                    className="py-3 px-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200"
                  >
                    Retour
                  </button>

                  {orderDetails.preferredNetwork === 'whatsapp' ? (
                    <button
                      onClick={handleLaunchWhatsApp}
                      className="flex-1 py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 active:scale-[0.98] transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Envoyer la commande via WhatsApp</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleLaunchInstagram}
                      className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-600 hover:brightness-105 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
                    >
                      <Instagram className="w-4 h-4" />
                      <span>Ouvrir sur Instagram DM</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
