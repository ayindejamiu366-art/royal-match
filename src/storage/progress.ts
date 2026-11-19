import { PlayerProgress } from '../types/game';

const STORAGE_KEY = 'kingdom_blast_save_v1';
export const LIFE_REGEN_MS = 15 * 60 * 1000;
export const FREE_CHEST_COOLDOWN_MS = 4 * 60 * 60 * 1000;

export function getTodayIsoDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function createDefaultProgress(): PlayerProgress {
  return {
    playerName: 'Architect Aurelian',
    coins: 350,
    starsEarnedTotal: 0,
    starsSpent: 0,
    lives: 5,
    maxLives: 5,
    lastLifeTimestamp: Date.now(),
    unlockedLevel: 1,
    levelStars: {},
    levelHighScores: {},
    boosters: {
      hammer: 2,
      cannon: 1,
      shuffle: 2,
    },
    restoredIds: [],
    dailyStreak: 0,
    lastDailyClaimDate: null,
    lastFreeChestTimestamp: 0,
    audio: {
      musicEnabled: true,
      sfxEnabled: true,
      volume: 0.65,
    },
  };
}

export function reconcileLives(progress: PlayerProgress, now = Date.now()): PlayerProgress {
  if (progress.lives >= progress.maxLives) {
    return { ...progress, lives: progress.maxLives, lastLifeTimestamp: now };
  }
  const elapsed = Math.max(0, now - progress.lastLifeTimestamp);
  const gained = Math.floor(elapsed / LIFE_REGEN_MS);
  if (gained <= 0) return progress;

  const nextLives = Math.min(progress.maxLives, progress.lives + gained);
  const remainderMs = nextLives >= progress.maxLives ? 0 : elapsed % LIFE_REGEN_MS;
  return {
    ...progress,
    lives: nextLives,
    lastLifeTimestamp: now - remainderMs,
  };
}

export function loadProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProgress();
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>;
    const defaults = createDefaultProgress();
    const merged: PlayerProgress = {
      ...defaults,
      ...parsed,
      boosters: { ...defaults.boosters, ...(parsed.boosters || {}) },
      audio: { ...defaults.audio, ...(parsed.audio || {}) },
      levelStars: parsed.levelStars || {},
      levelHighScores: parsed.levelHighScores || {},
      restoredIds: Array.isArray(parsed.restoredIds) ? parsed.restoredIds : [],
    };
    return reconcileLives(merged);
  } catch {
    return createDefaultProgress();
  }
}

export function saveProgress(progress: PlayerProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function canClaimDailyReward(progress: PlayerProgress): boolean {
  const today = getTodayIsoDate();
  return progress.lastDailyClaimDate !== today;
}

export function getAvailableStars(progress: PlayerProgress): number {
  return Math.max(0, progress.starsEarnedTotal - progress.starsSpent);
}
