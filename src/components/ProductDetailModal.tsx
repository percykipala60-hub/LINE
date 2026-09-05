import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ShoppingBag, ShieldCheck, Heart, Share2, Sparkles } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { formatDualPrice, getCurrencyMode } from '../utils/currencyUtils';

interface ProductDetailModalProps {
  product: Product | null;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (e: React.MouseEvent, productId: string) => void;
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  onDirectOrder: (product: Product, variant: ProductVariant, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isFavorite,
  onClose,
  onToggleFavorite,
  onAddToCart,
  onDirectOrder,
}) => {
  if (!product) return null;

  // Selected variant state
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.variants[0]?.size || 'M');
  const [selectedColor, setSelectedColor] = useState<string>(product.variants[0]?.color || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState<boolean>(false);

  // Derive unique sizes & colors
  const sizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const colors = Array.from(new Set(product.variants.map((v) => v.color)));

  // Find corresponding variant
  const currentVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  ) || product.variants.find((v) => v.size === selectedSize) || product.variants[0];

  const handleAdd = () => {
    if (!currentVariant) return;
    onAddToCart(product, currentVariant, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleInstantBuy = () => {
    if (!currentVariant) return;
    onDirectOrder(product, currentVariant, quantity);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
        {/* Backdrop dismiss */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal Window */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] bg-white dark:bg-[#101623] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
        >
          {/* Top Bar Floating Buttons */}
          <div className="absolute top-3.5 inset-x-4 flex items-center justify-between z-20 pointer-events-none">
            <button
              onClick={(e) => onToggleFavorite(e, product.id)}
              className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md flex items-center justify-center text-slate-800 dark:text-white shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md flex items-center justify-center text-slate-800 dark:text-white shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto no-scrollbar flex-1 pb-24">
            {/* Gallery / Image or Video Player */}
            <div className="relative aspect-[4/5] sm:aspect-[16/11] w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
              {(() => {
                const currentMedia = product.images[selectedImageIndex] || product.images[0] || '';
                const isVideo = currentMedia.startsWith('data:video') || currentMedia.includes('.mp4') || currentMedia.includes('.webm') || currentMedia.includes('.mov');
                if (isVideo) {
                  return (
                    <video
                      src={currentMedia}
                      controls
                      playsInline
                      className="w-full h-full object-contain bg-black"
                    />
                  );
                }
                return (
                  <img
                    src={currentMedia}
                    alt={product.name}
                    className="w-full h-full object-cover object-center"
                  />
                );
              })()}

              {/* Thumbnails if multiple images/videos */}
              {product.images.length > 1 && (
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2 z-10 overflow-x-auto px-4 py-1 no-scrollbar">
                  {product.images.map((img, idx) => {
                    const isVid = img.startsWith('data:video') || img.includes('.mp4') || img.includes('.webm') || img.includes('.mov');
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shadow-md shrink-0 relative bg-black ${
                          selectedImageIndex === idx
                            ? 'border-[#25D366] scale-105 ring-2 ring-emerald-500/50'
                            : 'border-white/50 opacity-70 hover:opacity-100'
                        }`}
                      >
                        {isVid ? (
                          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-[10px] text-white">
                            <span>🎬</span>
                          </div>
                        ) : (
                          <img src={img} alt="Aperçu" className="w-full h-full object-cover" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Info and options container */}
            <div className="p-5 sm:p-6 space-y-5">
              {/* Header Title & Price */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    {product.tags?.[0] || 'Vêtements de Luxe'}
                  </span>
                  {product.isNewDrop && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full">
                      Nouveau Drop
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                  {product.name}
                </h1>

                <div className="mt-2.5 flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {formatDualPrice(product.price, product.currency).primary}
                  </span>
                  {getCurrencyMode() === 'BOTH' && (
                    <span className="text-lg font-bold text-[#25D366] bg-[#25D366]/10 px-2.5 py-0.5 rounded-lg border border-[#25D366]/20">
                      {formatDualPrice(product.price, product.currency).secondaryLabel}
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="text-base text-slate-400 line-through">
                      {formatDualPrice(product.originalPrice, product.currency).primary}
                    </span>
                  )}
                  <span className="ml-auto text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Paiement à la livraison
                  </span>
                </div>
                {getCurrencyMode() === 'BOTH' && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Taux indicatif Kinshasa : 1 $ = 2 800 FC (Paiement possible en Dollars ou Francs Congolais)
                  </p>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Color Selector */}
              {colors.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Couleur : <span className="text-slate-900 dark:text-white">{selectedColor || colors[0]}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => {
                      const isSelected = selectedColor === color || (!selectedColor && color === colors[0]);
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                            isSelected
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                          }`}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {sizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Taille disponible : <span className="text-slate-900 dark:text-white">{selectedSize}</span>
                    </label>
                    <span className="text-xs text-slate-500 underline cursor-pointer">
                      Guide des tailles
                    </span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {sizes.map((size) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`h-11 rounded-xl text-xs font-bold transition-all border flex items-center justify-center ${
                            isSelected
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm scale-[1.02]'
                              : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Quantité :
                </span>
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center font-bold text-sm shadow-xs active:scale-95 transition-all"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center font-bold text-sm shadow-xs active:scale-95 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="absolute bottom-0 inset-x-0 p-4 bg-white/95 dark:bg-[#101623]/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 z-30">
            <button
              onClick={handleAdd}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
            >
              {addedToast ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Ajouté !</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Ajouter au panier</span>
                </>
              )}
            </button>

            <button
              onClick={handleInstantBuy}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Commander direct</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
