import React from 'react';
import { Home, Compass, Heart, User, ShoppingBag } from 'lucide-react';

export type TabType = 'home' | 'explore' | 'favorites' | 'profile';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  cartCount,
  onOpenCart,
}) => {
  const navItems: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Drops', icon: Home },
    { id: 'explore', label: 'Explorer', icon: Compass },
    { id: 'favorites', label: 'Coups de cœur', icon: Heart },
    { id: 'profile', label: 'Studio & Compte', icon: User },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-[#0E131F]/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 px-4 py-2 sm:py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-slate-900 dark:text-white font-bold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* Floating Cart Quick trigger */}
        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-all active:scale-90"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-[#0E131F] shadow-xs">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Panier</span>
        </button>
      </div>
    </div>
  );
};
