import React from 'react';

export const LoadingScreen: React.FC<{ title: string; subtitle: string; progress: number }> = ({
  title,
  subtitle,
  progress,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center text-center p-6">
      <div className="animate-pulse rounded-full h-16 w-16 bg-slate-800 border-4 border-amber-400/50 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeLinecap="round" />
          <path d="M12 6V12M12 12L15.5 9.5" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-sm text-slate-300 mb-6">{subtitle}</p>
      <div className="w-full max-w-sm bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700">
        <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <span className="text-xs text-slate-400 mt-2 font-num">{progress}%</span>
    </div>
  );
};
