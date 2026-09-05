import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Layers, Tag } from 'lucide-react';
import { Category, Product } from '../types';

interface CategoriesViewProps {
  categories: Category[];
  products: Product[];
  onSelectCategory: (categoryId: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  products,
  onSelectCategory,
}) => {
  const categoryStyles: Record<string, { image: string; tag: string; description: string }> = {
    all: {
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
      tag: 'Toute la Maison',
      description: 'L’ensemble des pièces, confections et créations LINE.'
    },
    'cat-new': {
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
      tag: 'Nouveautés',
      description: 'Derniers modèles sortis des ateliers de confection.'
    },
    'cat-men': {
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
      tag: 'Hommes',
      description: 'Vestes tailleur, chemises structurées, t-shirts boxy et pantalons à plis.'
    },
    'cat-women': {
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80',
      tag: 'Femmes',
      description: 'Robes de soirée, ensembles satinés, tailleurs et coupes élégantes.'
    },
    'cat-street': {
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
      tag: 'Streetwear',
      description: 'Hoodies lourds 450 GSM, ensembles cargo amples et bombers.'
    },
    'cat-acc': {
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
      tag: 'Accessoires',
      description: 'Casquettes brodées, ceintures et finitions de haute qualité.'
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Layers className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Navigation par Rayons
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Explorez les Rayons de la Maison LINE
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Contrairement aux <strong>Drops</strong> (flux continu des nouveaux looks), les <strong>Rayons</strong> vous permettent de cibler directement votre garde-robe : Robes, Costumes, Streetwear ou Accessoires.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {categories.map((cat) => {
          const style = categoryStyles[cat.id] || categoryStyles['all'];
          const count = cat.id === 'all' 
            ? products.length 
            : cat.id === 'cat-new'
              ? products.filter(p => p.isNewDrop).length
              : products.filter(p => p.categoryId === cat.id).length;

          return (
            <motion.div
              key={cat.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectCategory(cat.id)}
              className="relative aspect-[16/10] sm:aspect-[4/3] rounded-3xl overflow-hidden cursor-pointer group shadow-sm border border-slate-200/60 dark:border-slate-800"
            >
              <img
                src={style.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between text-white">
                <div className="space-y-1 pr-3">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-emerald-300">
                    {count} {count > 1 ? 'articles disponibles' : 'article'}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-200 line-clamp-1">
                    {style.description}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#25D366] group-hover:text-black transition-all shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
