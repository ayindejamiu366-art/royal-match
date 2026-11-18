import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { GAME_ASSETS } from '../utils/assetLoader';

export interface LoadingScreenProps {
  title: string;
  subtitle?: string;
  progress: number; // 0 to 100
}

const GAMEPLAY_TIPS = [
  'Match four pieces to create a rocket!',
  'Combine special boosters for bigger explosions!',
  'Complete levels to earn kingdom stars!',
  'Save your boosters for difficult levels!',
  'Match an L or T shape to forge a Royal Bomb!',
  'Match five in a line for a Rainbow Prism!',
  'Double-tap a Rocket or Bomb to detonate it right away!',
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  title,
  subtitle = 'Preparing royal tiles...',
  progress,
}) => {
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * GAMEPLAY_TIPS.length));
  const [bgFailed, setBgFailed] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTipIndex((prev) => (prev + 1) % GAMEPLAY_TIPS.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-[70] flex flex-col items-center justify-between bg-slate-950 overflow-hidden pt-safe pb-safe px-safe"
      role="status"
      aria-live="polite"
    >
      {/* Castle backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        {!bgFailed ? (
          <img
            src={GAME_ASSETS.citadel}
            alt="Kingdom Citadel"
            referrerPolicy="no-referrer"
            onError={() => setBgFailed(true)}
            className="w-full h-full object-cover opacity-35 scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/95" />
      </div>

      {/* Top Brand */}
      <div className="relative z-10 pt-8 px-4 flex justify-center w-full">
        <BrandLogo className="w-full max-w-[260px] sm:max-w-[320px]" />
      </div>

      {/* Center Animated Castle Emblem & Destination Title */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-b from-indigo-800 to-slate-900 border-2 border-amber-400/70 shadow-[0_0_30px_rgba(251,191,36,0.25)] flex items-center justify-center mb-5 animate-float-slow">
          <svg viewBox="0 0 80 80" className="w-16 h-16" aria-hidden="true">
            <rect x="16" y="34" width="48" height="36" rx="4" fill="#cbd5e1" stroke="#475569" strokeWidth="2.5" />
            <rect x="12" y="24" width="14" height="46" rx="2" fill="#e2e8f0" stroke="#475569" strokeWidth="2.5" />
            <rect x="54" y="24" width="14" height="46" rx="2" fill="#e2e8f0" stroke="#475569" strokeWidth="2.5" />
            <polygon points="10,24 19,10 28,24" fill="#ef4444" stroke="#7f1d1d" strokeWidth="2" />
            <polygon points="52,24 61,10 70,24" fill="#ef4444" stroke="#7f1d1d" strokeWidth="2" />
            <polygon points="30,34 40,14 50,34" fill="#2563eb" stroke="#1e3a8a" strokeWidth="2" />
            <path d="M33 70V52C33 48 47 48 47 52V70Z" fill="#92400e" stroke="#451a03" strokeWidth="2" />
            <circle cx="40" cy="8" r="3.5" fill="#fbbf24" />
          </svg>
        </div>

        <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-200 leading-tight">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">{subtitle}</p>
      </motion.div>

      {/* Bottom Progress Bar + Rotating Gameplay Tip */}
      <div className="relative z-10 w-full max-w-md mx-auto px-5 pb-8 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300">Loading</span>
            <span className="font-num text-amber-300">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-900 border border-amber-400/45 p-0.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-300 to-emerald-400 transition-[width] duration-150 ease-out"
              style={{ width: `${Math.max(10, progress)}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-amber-400/30 px-4 py-3 flex items-center gap-2.5 shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <p className="text-xs sm:text-sm text-slate-100 font-medium leading-snug">
            <span className="text-amber-300 font-bold mr-1">Tip:</span>
            {GAMEPLAY_TIPS[tipIndex]}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
