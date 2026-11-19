import React from 'react';
import { BootProgress } from '../utils/assetLoader';

export const SplashScreen: React.FC<{ bootProgress: BootProgress }> = ({ bootProgress }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center text-center p-6 overflow-hidden">
      <div className="relative animate-ping mb-8">
        <svg className="w-24 h-24 text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeLinecap="round" />
          <path d="M12 6V12M12 12L15.5 9.5" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 animate-pulse" />
      </div>
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">Kingdom Blast</h2>
      <p className="text-sm text-slate-300 mb-6">{bootProgress.stageLabel}</p>
      <div className="w-full max-w-sm bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700">
        <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300" style={{ width: `${bootProgress.percent}%` }} />
      </div>
      <span className="text-xs text-slate-400 mt-2 font-num">{bootProgress.percent}%</span>
    </div>
  );
};
