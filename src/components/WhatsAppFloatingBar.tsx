import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, Grid, Heart, MessageCircle, ShoppingBag
} from 'lucide-react';

export type WhatsAppTab = 'drops' | 'categories' | 'favorites' | 'chats' | 'cart';

interface WhatsAppFloatingBarProps {
  currentTab: WhatsAppTab;
  onSelectTab: (tab: WhatsAppTab) => void;
  cartCount: number;
  unreadChatCount: number;
}

export const WhatsAppFloatingBar: React.FC<WhatsAppFloatingBarProps> = ({
  currentTab,
  onSelectTab,
  cartCount,
  unreadChatCount,
}) => {
  const tabs = [
    {
      id: 'drops' as WhatsAppTab,
      label: 'Drops',
      icon: (isActive: boolean) => (
        <div className="relative">
          <Sparkles className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-white' : 'stroke-[1.8] text-[#8E95A3]'}`} />
          {/* Green active pulse dot like WhatsApp */}
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#25D366] ring-2 ring-[#1B222D]" />
        </div>
      ),
    },
    {
      id: 'categories' as WhatsAppTab,
      label: 'Rayons',
      icon: (isActive: boolean) => (
        <Grid className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-white' : 'stroke-[1.8] text-[#8E95A3]'}`} />
      ),
    },
    {
      id: 'favorites' as WhatsAppTab,
      label: 'Coups de cœur',
      icon: (isActive: boolean) => (
        <Heart className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-white fill-white/20' : 'stroke-[1.8] text-[#8E95A3]'}`} />
      ),
    },
    {
      id: 'chats' as WhatsAppTab,
      label: 'Direct Chat',
      icon: (isActive: boolean) => (
        <div className="relative">
          <MessageCircle className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-white fill-white/20' : 'stroke-[1.8] text-[#8E95A3]'}`} />
          {unreadChatCount > 0 && (
            <span className="absolute -top-2 -right-3 px-1.5 min-w-4 h-4 rounded-full bg-[#25D366] text-black text-[9px] font-black flex items-center justify-center shadow-xs">
              {unreadChatCount}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'cart' as WhatsAppTab,
      label: 'Panier',
      icon: (isActive: boolean) => (
        <div className="relative">
          <ShoppingBag className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-white' : 'stroke-[1.8] text-[#8E95A3]'}`} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2.5 px-1.5 min-w-4 h-4 rounded-full bg-[#25D366] text-black text-[9px] font-black flex items-center justify-center shadow-xs">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="fixed bottom-3 sm:bottom-6 inset-x-0 z-40 flex justify-center px-2 sm:px-4 pointer-events-none">
      {/* WhatsApp Exact Floating Pill Bar */}
      <div className="pointer-events-auto relative flex items-center justify-between w-full max-w-[430px] bg-[#161B24]/92 dark:bg-[#11151F]/92 backdrop-blur-2xl border border-white/15 dark:border-white/10 rounded-full px-1.5 py-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.08)] select-none">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="relative flex-1 py-1.5 px-1 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group focus:outline-none"
            >
              {/* WhatsApp Active Capsule Bubble */}
              {isActive && (
                <motion.div
                  layoutId="whatsappActiveBubble"
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 32,
                  }}
                  className="absolute inset-0 rounded-full bg-white/18 dark:bg-white/12 border border-white/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]"
                />
              )}

              {/* Icon */}
              <div className="relative z-10 flex items-center justify-center my-0.5 transition-transform duration-200 group-active:scale-95">
                {tab.icon(isActive)}
              </div>

              {/* Text Label */}
              <span
                className={`relative z-10 text-[10px] tracking-tight font-medium transition-colors whitespace-nowrap leading-tight mt-0.5 ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-[#8E95A3] group-hover:text-slate-200'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
