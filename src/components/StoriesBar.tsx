import React from 'react';
import { StoryDrop } from '../types';

interface StoriesBarProps {
  stories: StoryDrop[];
  onSelectStory: (story: StoryDrop) => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({ stories, onSelectStory }) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-3 px-4 flex items-center gap-4">
      {/* Brand story / Live studio drop */}
      <div 
        onClick={() => onSelectStory(stories[0])}
        className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group"
      >
        <div className="relative p-[2.5px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-emerald-500 transition-transform duration-300 group-hover:scale-105 group-active:scale-95 shadow-sm">
          <div className="p-0.5 bg-white dark:bg-[#0B0F17] rounded-full">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <img 
                src="/line-logo.png" 
                alt="LINE Studio"
                onError={(e) => {
                  // Fallback to stylized logo if image is loading
                  (e.target as HTMLElement).style.display = 'none';
                }}
                className="w-full h-full object-cover"
              />
              <span className="font-logo text-xl text-slate-800 dark:text-white absolute">Line</span>
            </div>
          </div>
          <span className="absolute bottom-0 right-0 bg-emerald-500 border-2 border-white dark:border-[#0B0F17] text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">
            Live
          </span>
        </div>
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[70px] truncate text-center">
          LINE Look
        </span>
      </div>

      {/* Drops & Stories */}
      {stories.map((story) => (
        <div
          key={story.id}
          onClick={() => onSelectStory(story)}
          className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group"
        >
          <div className={`relative p-[2.5px] rounded-full transition-transform duration-300 group-hover:scale-105 group-active:scale-95 ${
            story.hasNew 
              ? 'bg-gradient-to-tr from-fuchsia-600 via-rose-500 to-amber-400' 
              : 'border border-slate-300 dark:border-slate-700 bg-transparent'
          }`}>
            <div className="p-0.5 bg-white dark:bg-[#0B0F17] rounded-full">
              <img
                src={story.image}
                alt={story.title}
                className="w-16 h-16 rounded-full object-cover"
                loading="lazy"
              />
            </div>
            {story.tag && (
              <span className={`absolute -top-1 -right-1 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full text-white shadow-xs ${
                story.tag === 'NEW' ? 'bg-emerald-500' : 'bg-slate-900 dark:bg-slate-700'
              }`}>
                {story.tag}
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 max-w-[72px] truncate text-center group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            {story.title}
          </span>
        </div>
      ))}
    </div>
  );
};
