import React, { useEffect, useState } from 'react';
import { ArrowLeft, Castle, Lock, Play, Star } from 'lucide-react';
import { LEVELS } from '../data/levels';
import { LevelConfig, PlayerProgress } from '../types/game';
import { COLOR_PALETTE, GemSvg, ObstacleSvg } from './GemIcons';
import { GAME_ASSETS, isAssetCached, preloadImageAsset } from '../utils/assetLoader';
import { LevelMapSkeleton } from './Skeletons';

interface LevelMapScreenProps {
  progress: PlayerProgress;
  onSelectLevel: (levelId: number) => void;
  onBackHome: () => void;
  onOpenKingdom: () => void;
}

const DIFFICULTY_STYLES: Record<LevelConfig['difficulty'], string> = {
  Easy: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
  Normal: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
  Hard: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
  Royal: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
};

export const LevelMapScreen: React.FC<LevelMapScreenProps> = ({
  progress,
  onSelectLevel,
  onBackHome,
  onOpenKingdom,
}) => {
  const [ready, setReady] = useState(() => isAssetCached(GAME_ASSETS.map));
  const [mapFailed, setMapFailed] = useState(false);
  const [previewLevel, setPreviewLevel] = useState<LevelConfig | null>(
    LEVELS.find((l) => l.id === progress.unlockedLevel) || LEVELS[0]
  );

  useEffect(() => {
    if (ready) return;
    let active = true;
    const safety = window.setTimeout(() => {
      if (active) setReady(true);
    }, 1500);
    preloadImageAsset(GAME_ASSETS.map, 1400).then((ok) => {
      if (!active) return;
      if (!ok) setMapFailed(true);
      setReady(true);
    });
    return () => {
      active = false;
      window.clearTimeout(safety);
    };
  }, [ready]);

  if (!ready) {
    return <LevelMapSkeleton />;
  }

  const totalPossibleStars = LEVELS.length * 3;
  const totalEarnedStars = Object.values(progress.levelStars).reduce((a, b) => a + b, 0);

  return (
    <div className="relative flex-1 flex flex-col min-h-[calc(100vh-64px)] overflow-hidden pb-safe">
      <div className="fixed inset-0 z-0 pointer-events-none">
        {!mapFailed ? (
          <img
            src={GAME_ASSETS.map}
            alt="Kingdom adventure map"
            referrerPolicy="no-referrer"
            onError={() => setMapFailed(true)}
            className="w-full h-full object-cover opacity-45"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/60 to-slate-950/90" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-5 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackHome}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-100 text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Menu</span>
            </button>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-amber-200 leading-none">
                Kingdom Trail
              </h1>
              <p className="text-xs text-slate-300 mt-1 font-num">
                {totalEarnedStars} / {totalPossibleStars} Stars Collected · {progress.unlockedLevel}/{LEVELS.length} Unlocked
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenKingdom}
            className="px-4 py-2 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 border-b-4 border-amber-900 text-slate-950 text-sm font-bold flex items-center gap-2 cursor-pointer hover:brightness-110 active:translate-y-0.5 transition-all"
          >
            <Castle className="w-4 h-4" />
            <span>Restore Kingdom</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start flex-1">
          <div className="lg:col-span-8 bg-slate-900/80 border-2 border-amber-400/30 rounded-3xl p-4 sm:p-6 shadow-2xl">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
              {LEVELS.map((lvl) => {
                const isUnlocked = lvl.id <= progress.unlockedLevel;
                const isCurrent = lvl.id === progress.unlockedLevel;
                const stars = progress.levelStars[lvl.id] || 0;
                const isSelected = previewLevel?.id === lvl.id;

                return (
                  <button
                    key={lvl.id}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => setPreviewLevel(lvl)}
                    className={`relative flex flex-col items-center justify-center rounded-2xl p-3 min-h-[96px] border-2 transition-all ${
                      !isUnlocked
                        ? 'bg-slate-950/70 border-slate-800 text-slate-500 cursor-not-allowed opacity-75'
                        : isSelected
                          ? 'bg-gradient-to-b from-amber-400 to-amber-600 border-white text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.5)] scale-[1.03] cursor-pointer'
                          : isCurrent
                            ? 'bg-gradient-to-b from-emerald-500 to-emerald-700 border-amber-300 text-white shadow-lg cursor-pointer hover:brightness-110'
                            : 'bg-gradient-to-b from-sky-600 to-indigo-800 border-sky-400/50 text-white shadow-md cursor-pointer hover:brightness-110'
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute -top-2.5 px-2 py-0.5 rounded-md bg-rose-600 border border-rose-200 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                        Next
                      </span>
                    )}

                    <div className="flex items-center justify-center mb-1.5">
                      {isUnlocked ? (
                        <span className="font-display text-2xl font-bold leading-none">
                          {lvl.id}
                        </span>
                      ) : (
                        <Lock className="w-5 h-5 text-slate-500" />
                      )}
                    </div>

                    <span
                      className={`text-[11px] font-semibold truncate w-full text-center ${
                        isSelected ? 'text-slate-950' : isUnlocked ? 'text-slate-100' : 'text-slate-500'
                      }`}
                    >
                      {lvl.name}
                    </span>

                    <div className="flex items-center gap-0.5 mt-1.5">
                      {[1, 2, 3].map((idx) => (
                        <Star
                          key={idx}
                          className={`w-3.5 h-3.5 ${
                            stars >= idx
                              ? 'text-yellow-300 fill-yellow-300 drop-shadow'
                              : isSelected
                                ? 'text-amber-900/40'
                                : 'text-slate-950/50'
                          }`}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="lg:col-span-4 bg-slate-900/90 border-2 border-amber-400/40 rounded-3xl p-5 shadow-2xl sticky top-4">
            {previewLevel && (
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      {previewLevel.region}
                    </span>
                    <h2 className="font-display text-2xl font-bold text-white mt-0.5">
                      Level {previewLevel.id}: {previewLevel.name}
                    </h2>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg border text-xs font-bold shrink-0 ${
                      DIFFICULTY_STYLES[previewLevel.difficulty]
                    }`}
                  >
                    {previewLevel.difficulty}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center bg-slate-950/70 rounded-2xl p-3 border border-slate-800">
                  <div>
                    <div className="text-[11px] text-slate-400 font-semibold">Moves</div>
                    <div className="font-num text-lg font-bold text-white">{previewLevel.moves}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-semibold">Reward</div>
                    <div className="font-num text-lg font-bold text-amber-300">+{previewLevel.coinReward}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-semibold">Best</div>
                    <div className="font-num text-lg font-bold text-emerald-300">
                      {(progress.levelHighScores[previewLevel.id] || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Level Objectives
                  </div>
                  <div className="flex flex-col gap-2">
                    {previewLevel.objectives.map((obj) => (
                      <div
                        key={obj.id}
                        className="flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 shrink-0">
                            {obj.type === 'color' && obj.color ? (
                              <GemSvg color={obj.color} />
                            ) : (
                              <ObstacleSvg obstacle={obj.type === 'crate' ? 'crate' : obj.type === 'ice' ? 'ice' : 'stone'} />
                            )}
                          </div>
                          <span className="text-sm font-semibold text-slate-100">
                            {obj.type === 'color' && obj.color
                              ? `${COLOR_PALETTE[obj.color].label} Gems`
                              : obj.label}
                          </span>
                        </div>
                        <span className="font-num text-sm font-bold text-amber-300">
                          ×{obj.target}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectLevel(previewLevel.id)}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-700 hover:brightness-110 active:translate-y-0.5 border-b-4 border-emerald-900 text-white font-display font-bold text-lg flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>Start Level {previewLevel.id}</span>
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};
