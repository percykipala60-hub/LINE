import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { StoryDrop } from '../types';

interface StoryViewerModalProps {
  story: StoryDrop | null;
  onClose: () => void;
  onShopCollection?: () => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  story,
  onClose,
  onShopCollection,
}) => {
  if (!story) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-0 md:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full h-full md:h-[85vh] md:max-w-md bg-black rounded-none md:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl"
        >
          {/* Top Progress bar & Header */}
          <div className="absolute top-0 inset-x-0 z-20 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            {/* Story timer bar */}
            <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 6, ease: 'linear' }}
                onAnimationComplete={onClose}
                className="h-full bg-white rounded-full"
              />
            </div>

            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/80 p-0.5 bg-black">
                  <img src={story.image} alt={story.title} className="w-full h-full object-cover rounded-full" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold tracking-wide flex items-center gap-1.5">
                    {story.title}
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500 rounded-full font-bold">
                      {story.tag}
                    </span>
                  </h4>
                  <p className="text-[11px] text-white/70">LINE Drops Officiel • À l'instant</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Full Screen Story Image */}
          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
            <img
              src={story.image}
              alt={story.title}
              className="w-full h-full object-cover select-none"
            />
          </div>

          {/* Bottom Interactive Content */}
          <div className="absolute bottom-0 inset-x-0 z-20 p-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent text-white flex flex-col gap-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>COLLECTION EXCLUSIVE LINE</span>
            </div>

            <p className="text-sm font-light text-white/90 leading-relaxed">
              {story.caption}
            </p>

            <button
              onClick={() => {
                onClose();
                onShopCollection?.();
              }}
              className="mt-2 w-full py-3.5 px-4 bg-white text-black font-semibold rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-[0.98] transition-all shadow-lg text-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Voir les pièces du look</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
