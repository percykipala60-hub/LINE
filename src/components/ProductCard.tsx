import React from 'react';
import { motion } from 'motion/react';
import { Heart, Plus, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, productId: string) => void;
  onQuickAdd: (e: React.MouseEvent, product: Product) => void;
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite,
  onToggleFavorite,
  onQuickAdd,
  onClick,
}) => {
  // Extract unique colors for display badges
  const availableColors = Array.from(new Set(product.variants.map((v) => v.color))).slice(0, 3);
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={onClick}
      className="group relative flex flex-col bg-white dark:bg-[#121824] rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800/80 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Secondary image preview on hover if available */}
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={`${product.name} vue alternative`}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          />
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 pointer-events-none z-10">
          {product.isNewDrop && (
            <span className="bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider uppercase shadow-xs flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              Nouveau
            </span>
          )}
          {discount && (
            <span className="bg-rose-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              -{discount}%
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => onToggleFavorite(e, product.id)}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-black shadow-xs transition-all active:scale-90 z-10"
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-700 dark:text-slate-300'
            }`}
          />
        </button>

        {/* Floating Quick Add Button */}
        <button
          onClick={(e) => onQuickAdd(e, product)}
          className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all z-10 group/btn"
          title="Sélectionner la taille et commander"
          aria-label="Achat rapide"
        >
          <Plus className="w-5 h-5 transition-transform group-hover/btn:rotate-90" />
        </button>
      </div>

      {/* Product Information */}
      <div className="p-3.5 flex flex-col flex-grow justify-between gap-1.5">
        <div>
          {/* Colors chips indicator */}
          <div className="flex items-center gap-1 mb-1.5">
            {availableColors.map((color, idx) => (
              <span
                key={idx}
                className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded"
              >
                {color}
              </span>
            ))}
            {product.variants.length > 3 && (
              <span className="text-[10px] text-slate-400">+{product.variants.length - 3}</span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Price & Delivery indicator */}
        <div className="flex items-baseline justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {product.price} {product.currency}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through">
                {product.originalPrice} {product.currency}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            En stock
          </span>
        </div>
      </div>
    </motion.div>
  );
};
