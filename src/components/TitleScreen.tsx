import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Castle, Gift, Map, Play, ShoppingBag, User } from 'lucide-react';
import { PlayerProgress } from '../types/game';
import { canClaimDailyReward, getAvailableStars } from '../storage/progress';
import { RESTORATION_PROJECTS } from '../data/kingdom';
import { BrandLogo } from './BrandLogo';
import { GAME_ASSETS, isAssetCached, preloadImageAsset } from '../utils/assetLoader';
import { TitleScreenSkeleton } from './Skeletons';

interface TitleScreenProps {
  progress: PlayerProgress;
  onPlayCurrent: () => void;
  onOpenMap: () => void;
  onOpenKingdom: () => void;
  onOpenShop: () => void;
  onOpenDaily: () => void;
  onOpenProfile: () => void;
  isHotkeysActive?: boolean;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  progress,
  onPlayCurrent,
  onOpenMap,
  onOpenKingdom,
  onOpenShop,
  onOpenDaily,
  onOpenProfile,
  isHotkeysActive = true,
}) => {
  const [ready, setReady] = useState(() => isAssetCached(GAME_ASSETS.keyart));
  const [bgFailed, setBgFailed] = useState(false);
  const [portraitFailed, setPortraitFailed] = useState(false);

  const dailyReady = canClaimDailyReward(progress);
  const availableStars = getAvailableStars(progress);
  const canRestore = RESTORATION_PROJECTS.some(
    (p) => !progress.restoredIds.includes(p.id) && availableStars >= p.starCost
  );

  useEffect(() => {
    if (ready) return;
    let active = true;
    const safety = window.setTimeout(() => {
      if (active) setReady(true);
    }, 1500);
    preloadImageAsset(GAME_ASSETS.keyart, 1400).then((ok) => {
      if (!active) return;
      if (!ok) setBgFailed(true);
      setReady(true);
    });
    return () => {
      active = false;
      window.clearTimeout(safety);
    };
  }, [ready]);

  useEffect(() => {
    if (!isHotkeysActive) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return;
        e.preventDefault();
        onPlayCurrent();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onPlayCurrent, isHotkeysActive]);

  if (!ready) {
    return <TitleScreenSkeleton />;
  }

  return (
    <div className="relative flex-1 flex flex-col justify-between overflow-hidden min-h-[calc(100vh-64px)] pb-safe">
      <div className="absolute inset-0 z-0 pointer-events-none">
        {!bgFailed ? (
          <img
            src={GAME_ASSETS.keyart}
            alt="Kingdom Blast sunlit castle vista"
            referrerPolicy="no-referrer"
            onError={() => setBgFailed(true)}
            className="w-full h-full object-cover object-center scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-sky-700 via-indigo-900 to-slate-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/35 to-slate-950/90" />
      </div>

      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-4 sm:py-8 flex flex-col items-center justify-center gap-6">
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center max-w-xl animate-float-slow w-full"
        >
          <BrandLogo className="w-full max-w-[340px] sm:max-w-[460px]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-slate-950/85 border-2 border-amber-400/45 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5"
        >
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={onOpenProfile}
              className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400 bg-indigo-950 shrink-0 shadow-lg hover:brightness-110 transition-transform active:scale-95 cursor-pointer"
              title="View Player Profile"
            >
              {!portraitFailed ? (
                <img
                  src={GAME_ASSETS.monarch}
                  alt="Architect Aurelian"
                  referrerPolicy="no-referrer"
                  onError={() => setPortraitFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-display text-2xl text-amber-300">
                  A
                </div>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Royal Architect&apos;s Brief
                </p>
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="text-[11px] font-bold text-sky-300 hover:text-sky-200 flex items-center gap-1 cursor-pointer"
                >
                  <User className="w-3 h-3" />
                  <span>Profile</span>
                </button>
              </div>
              <p className="text-sm text-slate-100 leading-snug mt-0.5">
                Match gems, trigger power-ups, and restore {8 - progress.restoredIds.length > 0 ? `${8 - progress.restoredIds.length} remaining` : 'all'} castle landmarks!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onPlayCurrent}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-700 hover:brightness-110 active:translate-y-0.5 border-b-4 border-emerald-900 text-white font-display font-bold text-xl tracking-wide shadow-[0_8px_24px_rgba(16,185,129,0.45)] flex items-center justify-center gap-3 transition-all cursor-pointer"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>Play Level {progress.unlockedLevel}</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onOpenMap}
              className="py-3 px-4 rounded-2xl bg-gradient-to-b from-sky-500 to-blue-700 hover:brightness-110 active:translate-y-0.5 border-b-4 border-blue-950 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Map className="w-4 h-4 shrink-0" />
              <span>Level Map</span>
            </button>

            <button
              type="button"
              onClick={onOpenKingdom}
              className="relative py-3 px-4 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-600 hover:brightness-110 active:translate-y-0.5 border-b-4 border-amber-900 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Castle className="w-4 h-4 shrink-0" />
              <span>Kingdom</span>
              {canRestore && (
                <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-num font-bold bg-rose-600 text-white rounded-md">
                  Build
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenDaily}
              className="relative py-3 px-4 rounded-2xl bg-gradient-to-b from-purple-500 to-indigo-700 hover:brightness-110 active:translate-y-0.5 border-b-4 border-indigo-950 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Gift className="w-4 h-4 shrink-0" />
              <span>Daily Gift</span>
              {dailyReady && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-300 text-slate-950 rounded-md">
                  Ready
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenShop}
              className="py-3 px-4 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-800 hover:brightness-110 active:translate-y-0.5 border-b-4 border-slate-950 text-amber-200 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Royal Shop</span>
            </button>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 pb-3 px-4 text-center">
        <p className="text-xs sm:text-sm text-slate-200/90 font-medium tracking-wide drop-shadow">
          Swipe or click two adjacent gems to match · Space or Enter to play · Esc to pause
        </p>
      </footer>
    </div>
  );
};
