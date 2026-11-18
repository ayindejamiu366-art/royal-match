import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Star } from 'lucide-react';
import { BootProgress, GAME_ASSETS } from '../utils/assetLoader';
import { BrandLogo } from './BrandLogo';

interface SplashScreenProps {
  bootProgress: BootProgress;
}

const FLOATING_STARS = [
  { x: '14%', y: '24%', size: 'w-5 h-5', delay: '0s', color: 'text-yellow-300 fill-yellow-300' },
  { x: '84%', y: '22%', size: 'w-6 h-6', delay: '0.4s', color: 'text-amber-300 fill-amber-300' },
  { x: '20%', y: '56%', size: 'w-4 h-4', delay: '0.9s', color: 'text-sky-300 fill-sky-300' },
  { x: '80%', y: '52%', size: 'w-5 h-5', delay: '1.3s', color: 'text-emerald-300 fill-emerald-300' },
  { x: '30%', y: '16%', size: 'w-4 h-4', delay: '0.7s', color: 'text-rose-300 fill-rose-300' },
  { x: '70%', y: '17%', size: 'w-4 h-4', delay: '1.1s', color: 'text-yellow-200 fill-yellow-200' },
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ bootProgress }) => {
  const [bgFailed, setBgFailed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[80] flex flex-col justify-between bg-slate-950 overflow-hidden pt-safe pb-safe px-safe"
      aria-live="polite"
      aria-label="Loading Kingdom Blast"
    >
      {/* 1 & 2. Background fades in + Castle appears with subtle zoom */}
      <div className="absolute inset-0 pointer-events-none">
        {!bgFailed ? (
          <img
            src={GAME_ASSETS.keyart}
            alt="Kingdom Blast Castle"
            referrerPolicy="no-referrer"
            onError={() => setBgFailed(true)}
            className="w-full h-full object-cover object-center animate-splash-zoom"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-sky-700 via-indigo-900 to-slate-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/65 via-indigo-950/35 to-slate-950/92" />
      </div>

      {/* Top Spacer */}
      <div className="relative z-10 pt-4 text-center">
        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-200/80">
          Royal Puzzle Adventure
        </span>
      </div>

      {/* 3 & 4. Centerpiece Logo + Ambient Glow + Floating Magical Stars */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
        <div className="relative w-full max-w-[460px] flex items-center justify-center">
          {/* Subtle golden halo behind logo */}
          <div
            aria-hidden="true"
            className="absolute w-72 h-40 sm:w-96 sm:h-48 rounded-full bg-amber-400/25 blur-3xl animate-royal-glow pointer-events-none"
          />

          {/* Floating Stars */}
          {FLOATING_STARS.map((st, idx) => (
            <div
              key={idx}
              style={{ left: st.x, top: st.y, animationDelay: st.delay }}
              className="absolute pointer-events-none animate-star-twinkle"
              aria-hidden="true"
            >
              <Star className={`${st.size} ${st.color} drop-shadow-[0_0_8px_rgba(253,224,71,0.85)]`} />
            </div>
          ))}

          {/* Smooth Logo Entrance */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex justify-center relative z-10"
          >
            <BrandLogo className="w-full max-w-[340px] sm:max-w-[440px]" />
          </motion.div>
        </div>
      </div>

      {/* 5. Bottom Animated Loading Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="relative z-10 w-full max-w-md mx-auto px-5 pb-6 flex flex-col items-center gap-2.5"
      >
        <div className="w-full flex items-center justify-between text-xs font-bold text-amber-100">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{bootProgress.stageLabel}</span>
          </span>
          <span className="font-num text-amber-300">{bootProgress.percent}%</span>
        </div>

        <div className="w-full h-3.5 rounded-full bg-slate-900/90 border border-amber-400/50 p-0.5 shadow-inner overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 transition-[width] duration-200 ease-out"
            style={{ width: `${Math.max(8, bootProgress.percent)}%` }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
