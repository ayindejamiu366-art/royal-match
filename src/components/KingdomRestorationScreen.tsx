import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Coins, Hammer, Sparkles, Star } from 'lucide-react';
import { RESTORATION_PROJECTS } from '../data/kingdom';
import { PlayerProgress, RestorationProject } from '../types/game';
import { getAvailableStars } from '../storage/progress';
import { GAME_ASSETS, isAssetCached, preloadImageAsset } from '../utils/assetLoader';
import { KingdomRestorationSkeleton } from './Skeletons';

interface KingdomRestorationScreenProps {
  progress: PlayerProgress;
  onRestoreProject: (project: RestorationProject) => void;
  onBackHome: () => void;
  onOpenMap: () => void;
}

const StructureArt: React.FC<{ id: string }> = ({ id }) => {
  switch (id) {
    case 'fountain':
      return (
        <svg viewBox="0 0 120 96" className="w-28 h-24 drop-shadow-[0_6px_12px_rgba(0,0,0,0.5)]">
          <ellipse cx="60" cy="76" rx="48" ry="14" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
          <ellipse cx="60" cy="73" rx="40" ry="10" fill="#38bdf8" />
          <rect x="52" y="42" width="16" height="30" rx="4" fill="#e2e8f0" stroke="#475569" strokeWidth="2.5" />
          <ellipse cx="60" cy="43" rx="22" ry="7" fill="#f1f5f9" stroke="#475569" strokeWidth="2.5" />
          <path d="M60 40C52 16 40 24 38 42M60 40C68 16 80 24 82 42M60 40V14" stroke="#bae6fd" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <circle cx="60" cy="14" r="4" fill="#e0f2fe" />
        </svg>
      );
    case 'rose_beds':
      return (
        <svg viewBox="0 0 100 72" className="w-24 h-18 drop-shadow-lg">
          <rect x="8" y="34" width="84" height="28" rx="12" fill="#15803d" stroke="#052e16" strokeWidth="3" />
          <circle cx="24" cy="36" r="8" fill="#f43f5e" stroke="#ffe4e6" strokeWidth="2" />
          <circle cx="42" cy="30" r="9" fill="#e11d48" stroke="#ffe4e6" strokeWidth="2" />
          <circle cx="60" cy="37" r="8" fill="#fb7185" stroke="#ffe4e6" strokeWidth="2" />
          <circle cx="77" cy="32" r="8" fill="#e11d48" stroke="#ffe4e6" strokeWidth="2" />
        </svg>
      );
    case 'lantern_lamps':
      return (
        <svg viewBox="0 0 80 100" className="w-16 h-20 drop-shadow-lg">
          <rect x="36" y="36" width="8" height="54" rx="3" fill="#475569" stroke="#0f172a" strokeWidth="2" />
          <rect x="28" y="84" width="24" height="10" rx="3" fill="#334155" />
          <polygon points="24,36 56,36 48,14 32,14" fill="#fef08a" stroke="#b45309" strokeWidth="3" />
          <polygon points="20,16 60,16 40,4" fill="#f59e0b" stroke="#78350f" strokeWidth="2.5" />
        </svg>
      );
    case 'royal_banners':
      return (
        <svg viewBox="0 0 120 70" className="w-28 h-16 drop-shadow-lg">
          <path d="M18 8H42V54L30 44L18 54Z" fill="#2563eb" stroke="#fbbf24" strokeWidth="3" />
          <path d="M78 8H102V54L90 44L78 54Z" fill="#dc2626" stroke="#fbbf24" strokeWidth="3" />
          <circle cx="30" cy="26" r="6" fill="#fde047" />
          <circle cx="90" cy="26" r="6" fill="#fde047" />
        </svg>
      );
    case 'knight_statues':
      return (
        <svg viewBox="0 0 80 90" className="w-16 h-20 drop-shadow-lg">
          <rect x="20" y="60" width="40" height="24" rx="4" fill="#94a3b8" stroke="#334155" strokeWidth="2.5" />
          <path d="M26 60L30 28L40 16L50 28L54 60Z" fill="#fbbf24" stroke="#78350f" strokeWidth="2.5" />
          <circle cx="40" cy="24" r="9" fill="#fde047" stroke="#78350f" strokeWidth="2" />
        </svg>
      );
    case 'sun_gazebo':
      return (
        <svg viewBox="0 0 110 100" className="w-24 h-22 drop-shadow-lg">
          <path d="M16 42Q55 6 94 42Z" fill="#f59e0b" stroke="#78350f" strokeWidth="3" />
          <rect x="24" y="42" width="8" height="44" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
          <rect x="51" y="42" width="8" height="44" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
          <rect x="78" y="42" width="8" height="44" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
          <rect x="14" y="84" width="82" height="10" rx="4" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
        </svg>
      );
    case 'stargaze_dome':
      return (
        <svg viewBox="0 0 100 100" className="w-22 h-22 drop-shadow-lg">
          <rect x="24" y="46" width="52" height="44" rx="6" fill="#e2e8f0" stroke="#475569" strokeWidth="3" />
          <path d="M20 48C20 20 80 20 80 48Z" fill="#3b82f6" stroke="#fbbf24" strokeWidth="3" />
          <rect x="56" y="16" width="26" height="9" rx="4" transform="rotate(-25 56 16)" fill="#f59e0b" stroke="#451a03" strokeWidth="2" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 140 80" className="w-32 h-18 drop-shadow-lg">
          <rect x="16" y="34" width="108" height="16" rx="5" fill="#fef3c7" stroke="#92400e" strokeWidth="3" />
          <rect x="22" y="28" width="96" height="8" rx="3" fill="#ef4444" />
          <rect x="28" y="50" width="10" height="22" fill="#78350f" />
          <rect x="102" y="50" width="10" height="22" fill="#78350f" />
          <circle cx="48" cy="24" r="6" fill="#fbbf24" />
          <circle cx="70" cy="22" r="7" fill="#38bdf8" />
          <circle cx="92" cy="24" r="6" fill="#10b981" />
        </svg>
      );
  }
};

export const KingdomRestorationScreen: React.FC<KingdomRestorationScreenProps> = ({
  progress,
  onRestoreProject,
  onBackHome,
  onOpenMap,
}) => {
  const [ready, setReady] = useState(() => isAssetCached(GAME_ASSETS.citadel));
  const [bgFailed, setBgFailed] = useState(false);
  const [recentBuiltId, setRecentBuiltId] = useState<string | null>(null);

  useEffect(() => {
    if (ready) return;
    let active = true;
    const safety = window.setTimeout(() => {
      if (active) setReady(true);
    }, 1500);
    preloadImageAsset(GAME_ASSETS.citadel, 1400).then((ok) => {
      if (!active) return;
      if (!ok) setBgFailed(true);
      setReady(true);
    });
    return () => {
      active = false;
      window.clearTimeout(safety);
    };
  }, [ready]);

  if (!ready) {
    return <KingdomRestorationSkeleton />;
  }

  const availableStars = getAvailableStars(progress);
  const restoredCount = progress.restoredIds.length;
  const completionPct = Math.round((restoredCount / RESTORATION_PROJECTS.length) * 100);

  const handleBuild = (proj: RestorationProject) => {
    setRecentBuiltId(proj.id);
    onRestoreProject(proj);
    window.setTimeout(() => setRecentBuiltId(null), 900);
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 pb-safe gap-4">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackHome}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-100 text-sm font-bold flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Menu</span>
          </button>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-amber-200 leading-none">
              Royal Restoration
            </h1>
            <p className="text-xs text-slate-300 mt-1 font-num">
              {restoredCount} / {RESTORATION_PROJECTS.length} Landmarks Built ({completionPct}%)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-yellow-400/40 rounded-xl px-3 py-2">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-num text-sm font-bold text-yellow-200">{availableStars} Stars Ready</span>
          </div>
          <button
            type="button"
            onClick={onOpenMap}
            className="px-4 py-2 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 border-b-4 border-emerald-900 text-white text-sm font-bold cursor-pointer hover:brightness-110"
          >
            Earn Stars
          </button>
        </div>
      </div>

      {/* Interactive Castle Courtyard Canvas + Restoration List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Interactive Illustrated Scene */}
        <div className="lg:col-span-7 relative rounded-3xl overflow-hidden border-2 border-amber-400/40 shadow-2xl aspect-[16/10] bg-slate-900">
          {!bgFailed ? (
            <img
              src={GAME_ASSETS.citadel}
              alt="Royal Castle Courtyard"
              referrerPolicy="no-referrer"
              onError={() => setBgFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-sky-600 via-emerald-700 to-stone-700" />
          )}

          {/* Progress Bar Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-3 bg-slate-950/75 border border-amber-400/30 rounded-2xl px-3.5 py-2">
            <span className="text-xs font-bold text-amber-200">Kingdom Prosperity</span>
            <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <span className="font-num text-xs font-bold text-white">{completionPct}%</span>
          </div>

          {/* Placed Landmarks */}
          {RESTORATION_PROJECTS.map((proj) => {
            const isBuilt = progress.restoredIds.includes(proj.id);
            const justBuilt = recentBuiltId === proj.id;
            return (
              <div
                key={proj.id}
                style={{ left: `${proj.xPercent}%`, top: `${proj.yPercent}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              >
                {isBuilt ? (
                  <div className={`relative flex flex-col items-center ${justBuilt ? 'animate-pop-in' : ''}`}>
                    <StructureArt id={proj.id} />
                    {justBuilt && (
                      <Sparkles className="w-8 h-8 text-yellow-300 absolute -top-4 animate-ping" />
                    )}
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-950/70 border-2 border-dashed border-amber-300/70 flex items-center justify-center shadow">
                    <Hammer className="w-4 h-4 text-amber-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Restoration Task Cards */}
        <div className="lg:col-span-5 flex flex-col gap-3 max-h-[540px] overflow-y-auto pr-1">
          {RESTORATION_PROJECTS.map((proj) => {
            const isBuilt = progress.restoredIds.includes(proj.id);
            const canAfford = availableStars >= proj.starCost;

            return (
              <div
                key={proj.id}
                className={`rounded-2xl p-4 border-2 flex items-center justify-between gap-3 transition-all ${
                  isBuilt
                    ? 'bg-emerald-950/50 border-emerald-500/40'
                    : 'bg-slate-900/90 border-amber-400/30'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-base text-white truncate">
                      {proj.name}
                    </h3>
                    {isBuilt && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">{proj.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs font-num">
                    <span className="text-yellow-300 font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-300" />
                      {proj.starCost} Stars
                    </span>
                    <span className="text-amber-300 font-bold flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      +{proj.coinBonus} Coins
                    </span>
                  </div>
                </div>

                {isBuilt ? (
                  <span className="px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold shrink-0">
                    Restored
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => handleBuild(proj)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all ${
                      canAfford
                        ? 'bg-gradient-to-b from-amber-400 to-amber-600 border-b-4 border-amber-900 text-slate-950 hover:brightness-110 active:translate-y-0.5 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <Hammer className="w-3.5 h-3.5" />
                    <span>Build</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
