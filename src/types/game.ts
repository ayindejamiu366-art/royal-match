export type TileColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple';

export type SpecialType = 'none' | 'rocket_h' | 'rocket_v' | 'bomb' | 'prism';

export type ObstacleType = 'none' | 'crate' | 'ice' | 'stone';

export type BoosterType = 'hammer' | 'cannon' | 'shuffle';

export type ScreenName = 'TITLE' | 'MAP' | 'PLAY' | 'KINGDOM';

export interface TileCell {
  id: string;
  row: number;
  col: number;
  color: TileColor | null;
  special: SpecialType;
  obstacle: ObstacleType;
  obstacleHp: number;
  isVoid: boolean;
  isNew?: boolean;
}

export interface ObjectiveDef {
  id: string;
  type: 'color' | 'crate' | 'ice' | 'stone';
  color?: TileColor;
  target: number;
  label: string;
}

export type DifficultyRating = 'Easy' | 'Normal' | 'Hard' | 'Royal';

export interface LevelConfig {
  id: number;
  name: string;
  region: string;
  moves: number;
  difficulty: DifficultyRating;
  colorsCount: 4 | 5;
  objectives: ObjectiveDef[];
  starThresholds: [number, number, number];
  coinReward: number;
  voidCells?: Array<[number, number]>;
  crates?: Array<[number, number]>;
  ices?: Array<[number, number]>;
  stones?: Array<[number, number]>;
}

export interface RestorationProject {
  id: string;
  name: string;
  description: string;
  zone: 'courtyard' | 'gardens';
  starCost: number;
  coinBonus: number;
  order: number;
  xPercent: number;
  yPercent: number;
}

export interface DailyRewardDay {
  day: number;
  label: string;
  coins: number;
  booster?: BoosterType;
  boosterCount?: number;
}

export interface AudioSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  volume: number;
}

export interface PlayerProgress {
  playerName: string;
  coins: number;
  starsEarnedTotal: number;
  starsSpent: number;
  lives: number;
  maxLives: number;
  lastLifeTimestamp: number;
  unlockedLevel: number;
  levelStars: Record<number, number>;
  levelHighScores: Record<number, number>;
  boosters: Record<BoosterType, number>;
  restoredIds: string[];
  dailyStreak: number;
  lastDailyClaimDate: string | null;
  lastFreeChestTimestamp: number;
  audio: AudioSettings;
}

export interface ActiveEffect {
  id: string;
  type: 'beam_h' | 'beam_v' | 'explosion' | 'prism_ray';
  row: number;
  col: number;
  color?: TileColor | 'rainbow';
  targetRow?: number;
  targetCol?: number;
}

export interface FloatingText {
  id: string;
  row: number;
  col: number;
  text: string;
  tone: 'gold' | 'combo' | 'emerald' | 'crimson';
}

export interface ParticleBurst {
  id: string;
  x: number;
  y: number;
  color: string;
  dx: number;
  dy: number;
  size: number;
}
