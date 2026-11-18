import React from 'react';
import { ObstacleType, SpecialType, TileColor } from '../types/game';

export const COLOR_PALETTE: Record<TileColor, { bg: string; ring: string; hex: string; label: string }> = {
  red: {
    bg: 'from-rose-400 via-red-500 to-rose-700',
    ring: 'ring-rose-300/60',
    hex: '#ef4444',
    label: 'Ruby',
  },
  blue: {
    bg: 'from-sky-300 via-blue-500 to-indigo-700',
    ring: 'ring-sky-300/60',
    hex: '#3b82f6',
    label: 'Sapphire',
  },
  green: {
    bg: 'from-emerald-300 via-emerald-500 to-teal-700',
    ring: 'ring-emerald-300/60',
    hex: '#10b981',
    label: 'Emerald',
  },
  yellow: {
    bg: 'from-amber-200 via-amber-400 to-orange-600',
    ring: 'ring-amber-200/70',
    hex: '#f59e0b',
    label: 'Amber',
  },
  purple: {
    bg: 'from-fuchsia-300 via-purple-500 to-violet-800',
    ring: 'ring-purple-300/60',
    hex: '#a855f7',
    label: 'Amethyst',
  },
};

export const GemSvg: React.FC<{ color: TileColor; className?: string }> = ({ color, className = 'w-full h-full' }) => {
  switch (color) {
    case 'red':
      // Ruby Heart / Shield Gem
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="rubyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff7b8a" />
              <stop offset="50%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
          </defs>
          <path
            d="M32 56C32 56 8 41 8 23.5C8 14.9 14.8 9 22.5 9C27.4 9 30.6 11.7 32 14.5C33.4 11.7 36.6 9 41.5 9C49.2 9 56 14.9 56 23.5C56 41 32 56 32 56Z"
            fill="url(#rubyGrad)"
            stroke="#ffe4e6"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M21 15C16.5 15.8 13.5 19.6 14 24.5"
            stroke="#fff"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
          />
          <polygon points="32,20 42,29 32,44 22,29" fill="#fda4af" opacity="0.28" />
        </svg>
      );
    case 'blue':
      // Sapphire Faceted Diamond
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="sapphireGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>
          <polygon
            points="32,6 56,24 46,56 18,56 8,24"
            fill="url(#sapphireGrad)"
            stroke="#e0f2fe"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <polygon points="32,14 45,25 39,46 25,46 19,25" fill="#bae6fd" opacity="0.3" />
          <line x1="20" y1="16" x2="14" y2="23" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        </svg>
      );
    case 'green':
      // Emerald Four-Point Leaf / Clover Gem
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#065f46" />
            </linearGradient>
          </defs>
          <rect
            x="13"
            y="13"
            width="38"
            height="38"
            rx="12"
            transform="rotate(45 32 32)"
            fill="url(#emeraldGrad)"
            stroke="#d1fae5"
            strokeWidth="2.5"
          />
          <circle cx="32" cy="32" r="10" fill="#a7f3d0" opacity="0.35" />
          <path d="M23 18L29 13" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        </svg>
      );
    case 'yellow':
      // Royal Gold Crown Gem
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="48%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <path
            d="M10 47L14 21L25 31L32 14L39 31L50 21L54 47C54 50 51 52 47 52H17C13 52 10 50 10 47Z"
            fill="url(#amberGrad)"
            stroke="#fef9c3"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="37" r="4.5" fill="#ef4444" stroke="#fef9c3" strokeWidth="1.5" />
          <circle cx="20" cy="40" r="3" fill="#38bdf8" />
          <circle cx="44" cy="40" r="3" fill="#38bdf8" />
        </svg>
      );
    case 'purple':
      // Amethyst Star Crest
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="amethystGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f0abfc" />
              <stop offset="50%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#4c1d95" />
            </linearGradient>
          </defs>
          <polygon
            points="32,6 39,22 57,24 44,36 47,55 32,46 17,55 20,36 7,24 25,22"
            fill="url(#amethystGrad)"
            stroke="#f5d0fe"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <polygon points="32,16 36,26 46,27 38,34 40,44 32,39 24,44 26,34 18,27 28,26" fill="#fae8ff" opacity="0.28" />
        </svg>
      );
  }
};

export const SpecialOverlaySvg: React.FC<{ special: SpecialType; color: TileColor | null }> = ({ special }) => {
  if (special === 'none') return null;

  if (special === 'rocket_h' || special === 'rocket_v') {
    const isH = special === 'rocket_h';
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg
          viewBox="0 0 64 64"
          className={`w-[88%] h-[88%] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${isH ? '' : 'rotate-90'}`}
          aria-hidden="true"
        >
          <rect x="10" y="23" width="44" height="18" rx="9" fill="#fef3c7" stroke="#b45309" strokeWidth="2.5" />
          <polygon points="4,32 16,20 16,44" fill="#f97316" stroke="#fff7ed" strokeWidth="2" strokeLinejoin="round" />
          <polygon points="60,32 48,20 48,44" fill="#f97316" stroke="#fff7ed" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="32" cy="32" r="5" fill="#ef4444" />
        </svg>
      </div>
    );
  }

  if (special === 'bomb') {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg viewBox="0 0 64 64" className="w-[90%] h-[90%] drop-shadow-[0_3px_6px_rgba(0,0,0,0.55)]" aria-hidden="true">
          <defs>
            <radialGradient id="bombGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="60%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
          </defs>
          <path d="M36 14C39 8 46 8 49 11" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <circle cx="50" cy="11" r="4.5" fill="#facc15" />
          <circle cx="50" cy="11" r="2.2" fill="#ef4444" />
          <rect x="26" y="13" width="12" height="7" rx="2" fill="#d97706" stroke="#fef3c7" strokeWidth="1.5" />
          <circle cx="32" cy="38" r="18" fill="url(#bombGrad)" stroke="#fbbf24" strokeWidth="2.5" />
          <path d="M23 30C25 26 29 24 33 24" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.65" />
          <polygon points="32,29 34.5,35 41,35.5 36,39.5 37.5,46 32,42.5 26.5,46 28,39.5 23,35.5 29.5,35" fill="#fbbf24" />
        </svg>
      </div>
    );
  }

  if (special === 'prism') {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg viewBox="0 0 64 64" className="w-[92%] h-[92%] drop-shadow-[0_3px_8px_rgba(255,255,255,0.45)]" aria-hidden="true">
          <defs>
            <linearGradient id="prismGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="25%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="75%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="23" fill="url(#prismGrad)" stroke="#ffffff" strokeWidth="3" />
          <polygon points="32,12 48,26 42,48 22,48 16,26" fill="#ffffff" opacity="0.3" />
          <polygon points="32,19 36,28 45,29 38,35 40,44 32,39 24,44 26,35 19,29 28,28" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  return null;
};

export const ObstacleSvg: React.FC<{ obstacle: ObstacleType }> = ({ obstacle }) => {
  if (obstacle === 'crate') {
    return (
      <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow" aria-hidden="true">
        <rect x="6" y="6" width="52" height="52" rx="10" fill="#b45309" stroke="#78350f" strokeWidth="3" />
        <rect x="12" y="12" width="40" height="40" rx="5" fill="#d97706" stroke="#92400e" strokeWidth="2" />
        <line x1="12" y1="12" x2="52" y2="52" stroke="#92400e" strokeWidth="6" strokeLinecap="round" />
        <line x1="52" y1="12" x2="12" y2="52" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
        <circle cx="15" cy="15" r="2.5" fill="#fef3c7" />
        <circle cx="49" cy="15" r="2.5" fill="#fef3c7" />
        <circle cx="15" cy="49" r="2.5" fill="#fef3c7" />
        <circle cx="49" cy="49" r="2.5" fill="#fef3c7" />
      </svg>
    );
  }

  if (obstacle === 'stone') {
    return (
      <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow" aria-hidden="true">
        <rect x="6" y="6" width="52" height="52" rx="10" fill="#475569" stroke="#1e293b" strokeWidth="3" />
        <rect x="11" y="11" width="42" height="42" rx="6" fill="#64748b" stroke="#94a3b8" strokeWidth="2" />
        <path d="M18 22H46M18 32H46M18 42H46" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
        <polygon points="32,20 40,32 32,44 24,32" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2" />
      </svg>
    );
  }

  if (obstacle === 'ice') {
    return (
      <svg viewBox="0 0 64 64" className="w-full h-full pointer-events-none" aria-hidden="true">
        <rect
          x="3"
          y="3"
          width="58"
          height="58"
          rx="12"
          fill="#bae6fd"
          fillOpacity="0.34"
          stroke="#e0f2fe"
          strokeWidth="3"
        />
        <path d="M11 18L22 10M44 54L54 44M13 48L24 53" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" opacity="0.85" />
      </svg>
    );
  }

  return null;
};
