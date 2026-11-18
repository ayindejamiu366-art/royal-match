import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Award,
  Check,
  Coins,
  Crosshair,
  Gift,
  Hammer,
  Heart,
  Home,
  Play,
  RotateCcw,
  Shuffle,
  Sparkles,
  Star,
  Trophy,
  Volume2,
  X,
} from 'lucide-react';
import { DAILY_REWARDS, RESTORATION_PROJECTS } from '../data/kingdom';
import { LEVELS } from '../data/levels';
import { BoosterType, DailyRewardDay, LevelConfig, PlayerProgress } from '../types/game';
import { canClaimDailyReward, FREE_CHEST_COOLDOWN_MS } from '../storage/progress';
import { GAME_ASSETS } from '../utils/assetLoader';
import { PlayerProfileSkeleton, ShopModalSkeleton } from './Skeletons';

const modalCardMotion = {
  initial: { opacity: 0, scale: 0.93, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 8 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
};

/* ---------------- VICTORY MODAL ---------------- */
export const VictoryModal: React.FC<{
  level: LevelConfig;
  score: number;
  starsEarned: number;
  movesLeft: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onBackToMap: () => void;
  onOpenKingdom: () => void;
}> = ({ level, score, starsEarned, movesLeft, hasNextLevel, onNextLevel, onBackToMap, onOpenKingdom }) => {
  const bonusCoins = movesLeft * 10;
  const totalCoins = level.coinReward + bonusCoins;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4"
    >
      <motion.div
        {...modalCardMotion}
        className="w-full max-w-md bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 border-2 border-amber-400 rounded-3xl p-6 text-center shadow-2xl"
      >
        <div className="text-xs font-bold uppercase tracking-widest text-amber-300">
          Level {level.id} Complete
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">
          Royal Victory!
        </h2>

        {/* Animated Stars */}
        <div className="flex items-center justify-center gap-3 my-5">
          {[1, 2, 3].map((idx) => {
            const earned = starsEarned >= idx;
            return (
              <div
                key={idx}
                style={{ animationDelay: `${(idx - 1) * 140}ms` }}
                className={earned ? 'animate-star-pop opacity-0' : 'opacity-30'}
              >
                <Star
                  className={`w-12 h-12 ${
                    earned ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.7)]' : 'text-slate-600'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Score & Rewards */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950/75 border border-slate-800 rounded-2xl p-4 mb-5">
          <div>
            <div className="text-xs text-slate-400">Final Score</div>
            <div className="font-num text-2xl font-bold text-white">{score.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Coins Won</div>
            <div className="font-num text-2xl font-bold text-amber-300 flex items-center justify-center gap-1.5">
              <Coins className="w-5 h-5 text-amber-400" />
              +{totalCoins}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {hasNextLevel && (
            <button
              type="button"
              onClick={onNextLevel}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 border-b-4 border-emerald-900 text-white font-display font-bold text-lg flex items-center justify-center gap-2 cursor-pointer hover:brightness-110"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Next Level ({level.id + 1})</span>
            </button>
          )}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onOpenKingdom}
              className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm cursor-pointer"
            >
              Restore Castle
            </button>
            <button
              type="button"
              onClick={onBackToMap}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm cursor-pointer"
            >
              Level Map
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ---------------- FAILURE MODAL ---------------- */
export const FailureModal: React.FC<{
  level: LevelConfig;
  score: number;
  coins: number;
  lives: number;
  onBuyExtraMoves: () => void;
  onRetry: () => void;
  onBackToMap: () => void;
}> = ({ level, score, coins, lives, onBuyExtraMoves, onRetry, onBackToMap }) => {
  const canAffordMoves = coins >= 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4"
    >
      <motion.div
        {...modalCardMotion}
        className="w-full max-w-md bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 border-2 border-rose-500/60 rounded-3xl p-6 text-center shadow-2xl"
      >
        <div className="text-xs font-bold uppercase tracking-widest text-rose-300">
          Level {level.id} · {level.name}
        </div>
        <h2 className="font-display text-3xl font-bold text-white mt-1">Out of Moves!</h2>
        <p className="text-sm text-slate-300 mt-2">
          Score reached: <span className="font-num font-bold text-white">{score.toLocaleString()}</span>. You were so close!
        </p>

        <div className="flex flex-col gap-2.5 mt-6">
          <button
            type="button"
            disabled={!canAffordMoves}
            onClick={onBuyExtraMoves}
            className={`w-full py-3.5 px-5 rounded-2xl font-display font-bold text-base flex items-center justify-center gap-2 transition-all ${
              canAffordMoves
                ? 'bg-gradient-to-b from-amber-400 to-amber-600 border-b-4 border-amber-900 text-slate-950 cursor-pointer hover:brightness-110'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Coins className="w-5 h-5" />
            <span>+5 Extra Moves (100 Coins)</span>
          </button>

          <button
            type="button"
            disabled={lives <= 0}
            onClick={onRetry}
            className={`w-full py-3 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              lives > 0
                ? 'bg-gradient-to-b from-sky-500 to-blue-700 border-b-4 border-blue-950 text-white cursor-pointer hover:brightness-110'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{lives > 0 ? 'Retry Level (-1 Life)' : 'No Lives Remaining'}</span>
          </button>

          <button
            type="button"
            onClick={onBackToMap}
            className="w-full py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm cursor-pointer"
          >
            Back to Map
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ---------------- PAUSE MODAL ---------------- */
export const PauseModal: React.FC<{
  level: LevelConfig;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}> = ({ level, musicEnabled, sfxEnabled, onToggleMusic, onToggleSfx, onResume, onRestart, onQuit }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4"
    >
      <motion.div
        {...modalCardMotion}
        className="w-full max-w-sm bg-slate-900 border-2 border-amber-400/50 rounded-3xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold text-white">Game Paused</h2>
          <button
            type="button"
            onClick={onResume}
            aria-label="Resume game"
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Level {level.id}: {level.name}
        </p>

        <div className="flex flex-col gap-2.5 mb-5">
          <button
            type="button"
            onClick={onToggleMusic}
            className="flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-100 cursor-pointer"
          >
            <span>Background Music</span>
            <span className={musicEnabled ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {musicEnabled ? 'ON' : 'OFF'}
            </span>
          </button>
          <button
            type="button"
            onClick={onToggleSfx}
            className="flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-100 cursor-pointer"
          >
            <span>Sound Effects</span>
            <span className={sfxEnabled ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {sfxEnabled ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="w-full py-3 rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 border-b-4 border-emerald-900 text-white font-bold cursor-pointer"
          >
            Resume
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-200 font-bold text-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Level</span>
          </button>
          <button
            type="button"
            onClick={onQuit}
            className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Back to Map</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ---------------- DAILY REWARDS MODAL ---------------- */
export const DailyRewardsModal: React.FC<{
  progress: PlayerProgress;
  onClaim: (dayReward: DailyRewardDay) => void;
  onClose: () => void;
}> = ({ progress, onClaim, onClose }) => {
  const claimable = canClaimDailyReward(progress);
  const currentDayIndex = progress.dailyStreak % DAILY_REWARDS.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4"
    >
      <motion.div
        {...modalCardMotion}
        className="w-full max-w-lg bg-slate-900 border-2 border-purple-400/50 rounded-3xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-amber-400" />
            <h2 className="font-display text-2xl font-bold text-white">Daily Royal Gifts</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close daily rewards"
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-300 mb-4">
          Current Streak: <span className="font-num font-bold text-amber-300">{progress.dailyStreak} Days</span>. Return daily for bigger chests!
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          {DAILY_REWARDS.map((item, idx) => {
            const isPast = idx < currentDayIndex;
            const isToday = idx === currentDayIndex;

            return (
              <div
                key={item.day}
                className={`rounded-2xl p-3 border text-center flex flex-col items-center justify-between gap-1.5 ${
                  isToday && claimable
                    ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-300/40'
                    : isPast
                      ? 'bg-emerald-950/50 border-emerald-500/40 opacity-80'
                      : 'bg-slate-950/70 border-slate-800'
                } ${item.day === 7 ? 'col-span-2 sm:col-span-2' : ''}`}
              >
                <span className="text-[11px] font-bold uppercase text-slate-300">{item.label}</span>
                <div className="font-num text-sm font-bold text-amber-300 flex items-center gap-1">
                  <Coins className="w-4 h-4" />
                  +{item.coins}
                </div>
                {item.booster && (
                  <span className="text-[11px] text-sky-300 font-semibold">
                    +{item.boosterCount} {item.booster}
                  </span>
                )}
                {isPast && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!claimable}
          onClick={() => onClaim(DAILY_REWARDS[currentDayIndex])}
          className={`w-full py-3.5 rounded-2xl font-display font-bold text-lg transition-all ${
            claimable
              ? 'bg-gradient-to-b from-amber-400 to-amber-600 border-b-4 border-amber-900 text-slate-950 cursor-pointer hover:brightness-110'
              : 'bg-slate-800 text-slate-400 cursor-not-allowed'
          }`}
        >
          {claimable ? `Claim ${DAILY_REWARDS[currentDayIndex].label} Reward` : 'Already Claimed Today — Come Back Tomorrow!'}
        </button>
      </motion.div>
    </motion.div>
  );
};

/* ---------------- SHOP & FREE REWARD MODAL ---------------- */
export const ShopModal: React.FC<{
  progress: PlayerProgress;
  onBuyBooster: (type: BoosterType, cost: number) => void;
  onRefillLives: () => void;
  onClaimFreeChest: () => void;
  onClose: () => void;
}> = ({ progress, onBuyBooster, onRefillLives, onClaimFreeChest, onClose }) => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setHydrated(true), 180);
    return () => window.clearTimeout(t);
  }, []);

  const chestRemainingMs = Math.max(0, FREE_CHEST_COOLDOWN_MS - (Date.now() - progress.lastFreeChestTimestamp));
  const chestReady = chestRemainingMs === 0;
  const chestMins = Math.ceil(chestRemainingMs / 60000);

  const boosterItems: Array<{ type: BoosterType; name: string; desc: string; cost: number; icon: React.ReactNode }> = [
    {
      type: 'hammer',
      name: 'Royal Hammer',
      desc: 'Smash any single tile, crate, ice, or stone.',
      cost: 80,
      icon: <Hammer className="w-5 h-5 text-amber-300" />,
    },
    {
      type: 'cannon',
      name: 'Cross Cannon',
      desc: 'Clears an entire row & column from any tile.',
      cost: 120,
      icon: <Crosshair className="w-5 h-5 text-sky-300" />,
    },
    {
      type: 'shuffle',
      name: 'Wind Shuffle',
      desc: 'Reshuffles all gems without losing a move.',
      cost: 60,
      icon: <Shuffle className="w-5 h-5 text-emerald-300" />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4"
    >
      <motion.div
        {...modalCardMotion}
        className="w-full max-w-lg bg-slate-900 border-2 border-amber-400/50 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Royal Armory & Shop</h2>
            <p className="text-xs text-amber-300 font-num mt-0.5">Balance: {progress.coins.toLocaleString()} Coins</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shop"
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!hydrated ? (
          <ShopModalSkeleton />
        ) : (
          <>
            {/* Free Reward Chest */}
            <div className="rounded-2xl bg-gradient-to-r from-indigo-900/90 to-purple-900/90 border border-purple-400/40 p-4 mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Royal Free Chest</div>
                  <div className="text-xs text-slate-200">+120 Coins & +1 Hammer every 4 hours</div>
                </div>
              </div>
              <button
                type="button"
                disabled={!chestReady}
                onClick={onClaimFreeChest}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 ${
                  chestReady
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                    : 'bg-slate-800 text-slate-400 cursor-not-allowed font-num'
                }`}
              >
                {chestReady ? 'Claim Free' : `${chestMins}m`}
              </button>
            </div>

            {/* Life Refill */}
            <div className="rounded-2xl bg-slate-950/80 border border-rose-500/30 p-4 mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-rose-500 fill-rose-500 shrink-0" />
                <div>
                  <div className="font-bold text-sm text-white">Full Heart Refill ({progress.lives}/{progress.maxLives})</div>
                  <div className="text-xs text-slate-400">Restore all 5 hearts immediately</div>
                </div>
              </div>
              <button
                type="button"
                disabled={progress.lives >= progress.maxLives || progress.coins < 120}
                onClick={onRefillLives}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-num shrink-0 ${
                  progress.lives < progress.maxLives && progress.coins >= 120
                    ? 'bg-rose-500 hover:bg-rose-400 text-white cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {progress.lives >= progress.maxLives ? 'Full' : '120 Coins'}
              </button>
            </div>

            {/* Boosters */}
            <div className="flex flex-col gap-2.5">
              {boosterItems.map((b) => {
                const affordable = progress.coins >= b.cost;
                return (
                  <div
                    key={b.type}
                    className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                        {b.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{b.name}</span>
                          <span className="font-num text-xs text-emerald-300">Owned: {progress.boosters[b.type]}</span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">{b.desc}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!affordable}
                      onClick={() => onBuyBooster(b.type, b.cost)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold font-num shrink-0 ${
                        affordable
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {b.cost} Coins
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

/* ---------------- PLAYER PROFILE & ACHIEVEMENTS MODAL ---------------- */
export const PlayerProfileModal: React.FC<{
  progress: PlayerProgress;
  onClose: () => void;
  onOpenSettings: () => void;
}> = ({ progress, onClose, onOpenSettings }) => {
  const [hydrated, setHydrated] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setHydrated(true), 170);
    return () => window.clearTimeout(t);
  }, []);

  const clearedCount = Object.keys(progress.levelStars).length;
  const bestScore = Math.max(0, ...Object.values(progress.levelHighScores));

  const achievements = [
    {
      id: 'first_win',
      title: 'First Royal Victory',
      desc: 'Complete your first puzzle level.',
      done: clearedCount >= 1,
    },
    {
      id: 'star_collector',
      title: 'Star Collector',
      desc: 'Earn at least 15 kingdom stars.',
      done: progress.starsEarnedTotal >= 15,
    },
    {
      id: 'builder',
      title: 'Master Architect',
      desc: 'Restore 3 landmarks in the Citadel Courtyard.',
      done: progress.restoredIds.length >= 3,
    },
    {
      id: 'citadel_legend',
      title: 'Citadel Champion',
      desc: 'Reach Level 15 on the Kingdom Trail.',
      done: progress.unlockedLevel >= 15,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4"
    >
      <motion.div
        {...modalCardMotion}
        className="w-full max-w-lg bg-slate-900 border-2 border-amber-400/50 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="font-display text-2xl font-bold text-white">Player Profile</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile"
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!hydrated ? (
          <PlayerProfileSkeleton />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400 bg-indigo-950 shrink-0">
                  {!avatarFailed ? (
                    <img
                      src={GAME_ASSETS.monarch}
                      alt={progress.playerName}
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarFailed(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-display text-2xl text-amber-300">
                      A
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">{progress.playerName}</h3>
                  <p className="text-xs text-amber-300 font-num">
                    Unlocked Level {progress.unlockedLevel} / {LEVELS.length}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer"
              >
                Edit
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3">
                <div className="text-[11px] text-slate-400">Levels Won</div>
                <div className="font-num text-lg font-bold text-white">{clearedCount}</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3">
                <div className="text-[11px] text-slate-400">Total Stars</div>
                <div className="font-num text-lg font-bold text-yellow-300">{progress.starsEarnedTotal}</div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3">
                <div className="text-[11px] text-slate-400">Landmarks</div>
                <div className="font-num text-lg font-bold text-emerald-300">
                  {progress.restoredIds.length}/{RESTORATION_PROJECTS.length}
                </div>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3">
                <div className="text-[11px] text-slate-400">Best Score</div>
                <div className="font-num text-lg font-bold text-sky-300">{bestScore.toLocaleString()}</div>
              </div>
            </div>

            {/* Royal Achievements */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Royal Achievements
              </div>
              <div className="flex flex-col gap-2">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className={`rounded-2xl px-3.5 py-2.5 border flex items-center justify-between gap-3 ${
                      ach.done
                        ? 'bg-emerald-950/40 border-emerald-500/40'
                        : 'bg-slate-950/70 border-slate-800 opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Award className={`w-5 h-5 shrink-0 ${ach.done ? 'text-amber-300' : 'text-slate-600'}`} />
                      <div>
                        <div className="text-sm font-bold text-white">{ach.title}</div>
                        <div className="text-xs text-slate-400">{ach.desc}</div>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold shrink-0 ${
                        ach.done ? 'text-emerald-300' : 'text-slate-500'
                      }`}
                    >
                      {ach.done ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

/* ---------------- SETTINGS MODAL ---------------- */
export const SettingsModal: React.FC<{
  progress: PlayerProgress;
  onUpdateName: (name: string) => void;
  onUpdateAudio: (patch: Partial<PlayerProgress['audio']>) => void;
  onResetProgress: () => void;
  onClose: () => void;
}> = ({ progress, onUpdateName, onUpdateAudio, onResetProgress, onClose }) => {
  const [nameInput, setNameInput] = useState(progress.playerName);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4"
    >
      <motion.div
        {...modalCardMotion}
        className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold text-white">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Name */}
        <div className="mb-4">
          <label htmlFor="player-name-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Player Title
          </label>
          <div className="flex gap-2">
            <input
              id="player-name-input"
              type="text"
              maxLength={24}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => onUpdateName(nameInput.trim() || 'Architect Aurelian')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex flex-col gap-2.5 mb-5">
          <button
            type="button"
            onClick={() => onUpdateAudio({ musicEnabled: !progress.audio.musicEnabled })}
            className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-white cursor-pointer"
          >
            <span>Background Music</span>
            <span className={progress.audio.musicEnabled ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {progress.audio.musicEnabled ? 'Enabled' : 'Muted'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onUpdateAudio({ sfxEnabled: !progress.audio.sfxEnabled })}
            className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-white cursor-pointer"
          >
            <span>Sound Effects</span>
            <span className={progress.audio.sfxEnabled ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {progress.audio.sfxEnabled ? 'Enabled' : 'Muted'}
            </span>
          </button>

          <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-300" />
                Master Volume
              </span>
              <span className="font-num">{Math.round(progress.audio.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(progress.audio.volume * 100)}
              onChange={(e) => onUpdateAudio({ volume: Number(e.target.value) / 100 })}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Reset Progress (2-step confirmation) */}
        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="w-full py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 font-bold text-xs cursor-pointer"
          >
            Reset Saved Progress
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onResetProgress();
                setConfirmReset(false);
              }}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
            >
              Confirm Reset All Data
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
