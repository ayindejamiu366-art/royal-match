import React, { useEffect, useState } from 'react';
import { Coins, Heart, Settings, Star, Volume2, VolumeX } from 'lucide-react';
import { PlayerProgress } from '../types/game';
import { getAvailableStars, LIFE_REGEN_MS } from '../storage/progress';

interface TopHudProps {
  progress: PlayerProgress;
  onOpenSettings: () => void;
  onOpenShop: () => void;
  onToggleAudio: () => void;
  onOpenProfile: () => void;
}

const MONARCH_AVATAR = '/src/assets/images/kingdom_character_monarch_1795006924096.jpg';

export const TopHud: React.FC<TopHudProps> = ({
  progress,
  onOpenSettings,
  onOpenShop,
  onToggleAudio,
  onOpenProfile,
}) => {
  const [countdownText, setCountdownText] = useState<string>('');
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      if (progress.lives >= progress.maxLives) {
        setCountdownText('MAX');
        return;
      }
      const elapsed = Date.now() - progress.lastLifeTimestamp;
      const remaining = Math.max(0, LIFE_REGEN_MS - (elapsed % LIFE_REGEN_MS));
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setCountdownText(`${mins}:${String(secs).padStart(2, '0')}`);
    };
    updateTimer();
    const id = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(id);
  }, [progress.lives, progress.maxLives, progress.lastLifeTimestamp]);

  const availableStars = getAvailableStars(progress);
  const soundOn = progress.audio.musicEnabled || progress.audio.sfxEnabled;

  return (
    <header className="w-full max-w-6xl mx-auto px-3 sm:px-6 pt-safe pb-2 flex items-center justify-between gap-2 sm:gap-4 z-20 relative">
      <button
        type="button"
        onClick={onOpenProfile}
        className="flex items-center gap-2.5 bg-slate-900/90 hover:bg-slate-800 border border-amber-400/35 rounded-2xl px-2.5 py-1.5 shadow-lg transition-transform active:scale-95 cursor-pointer shrink-0"
        title="Player Profile & Achievements"
      >
        <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-amber-400 bg-indigo-900 flex items-center justify-center shrink-0">
          {!avatarFailed ? (
            <img
              src={MONARCH_AVATAR}
              alt={progress.playerName}
              referrerPolicy="no-referrer"
              onError={() => setAvatarFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-display font-bold text-amber-300 text-base">A</span>
          )}
        </div>
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-xs font-bold text-amber-200 max-w-[125px] truncate">
            {progress.playerName}
          </span>
          <span className="text-[11px] text-slate-300 font-num">
            Level {progress.unlockedLevel}
          </span>
        </div>
      </button>

      <div className="flex items-center gap-1.5 sm:gap-3">
        <button
          type="button"
          onClick={onOpenShop}
          className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-rose-400/35 rounded-xl px-2.5 py-1.5 shadow-md transition-transform active:scale-95 cursor-pointer"
          title="Lives (Tap for Shop)"
        >
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
          <span className="font-num text-xs sm:text-sm font-bold text-white">
            {progress.lives}/{progress.maxLives}
          </span>
          {progress.lives < progress.maxLives && (
            <span className="hidden md:inline font-num text-[11px] text-rose-300">
              {countdownText}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenShop}
          className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-amber-400/40 rounded-xl px-2.5 py-1.5 shadow-md transition-transform active:scale-95 cursor-pointer"
          title="Coins (Tap for Shop)"
        >
          <Coins className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-num text-xs sm:text-sm font-bold text-amber-200">
            {progress.coins.toLocaleString()}
          </span>
        </button>

        <div
          className="flex items-center gap-1.5 bg-slate-900/90 border border-yellow-300/35 rounded-xl px-2.5 py-1.5 shadow-md"
          title="Available Stars for Kingdom Restoration"
        >
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0" />
          <span className="font-num text-xs sm:text-sm font-bold text-yellow-200">
            {availableStars}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onToggleAudio}
          aria-label={soundOn ? 'Mute Sound' : 'Unmute Sound'}
          className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 transition-transform active:scale-95 cursor-pointer"
        >
          {soundOn ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Open Settings"
          className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 transition-transform active:scale-95 cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
