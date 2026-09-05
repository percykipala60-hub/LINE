import React from 'react';

interface LineLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const LineLogo: React.FC<LineLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false,
}) => {
  const sizeStyles = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <div className="relative flex items-center">
        {/* Subtle decorative dot inspired by luxury clothing brands */}
        <span className="font-logo tracking-wide font-normal transition-transform duration-300 hover:scale-[1.02] text-slate-900 dark:text-white"
          style={{ fontSize: size === 'sm' ? '1.75rem' : size === 'md' ? '2.3rem' : size === 'lg' ? '2.8rem' : '3.6rem' }}>
          Line
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ml-1.5 translate-y-1 inline-block animate-pulse" />
      </div>
      {showSubtitle && (
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 self-end mb-1">
          Store
        </span>
      )}
    </div>
  );
};
