import React from 'react';
import { TileColor, SpecialType, ObstacleType } from '../types/game';

export const COLOR_PALETTE: Record<TileColor, { hex: string; label: string }> = {
  red: { hex: '#ef4444', label: 'Red Rubies' },
  blue: { hex: '#3b82f6', label: 'Blue Sapphires' },
  green: { hex: '#10b981', label: 'Emerald Clovers' },
  yellow: { hex: '#fbbf24', label: 'Amber Crowns' },
  purple: { hex: '#a855f7', label: 'Amethyst Stars' },
};

export const GemSvg: React.FC<{ color: TileColor; className?: string }> = ({ color, className }) => {
  const hex = COLOR_PALETTE[color].hex;
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke={hex}
      strokeWidth="2"
    >
      <path d="M12 2L20 10L12 18L4 10Z" strokeLinejoin="round" />
      <path d="M12 2L12 18" strokeLinecap="round" opacity="0.3" />
      <path d="M4 10L20 10" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
};

export const ObstacleSvg: React.FC<{ obstacle: ObstacleType; className?: string }> = ({ obstacle, className }) => {
  const colors: Record<ObstacleType, string> = {
    crate: '#8b5cf6',
    ice: '#22d3ee',
    stone: '#64748b',
    none: '#64748b',
  };
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke={colors[obstacle]}
      strokeWidth="2"
    >
      {obstacle === 'crate' && (
        <>
          <rect x="6" y="6" width="12" height="12" rx="2" />
          <path d="M6 12H18M12 6V18" />
        </>
      )}
      {obstacle === 'ice' && (
        <>
          <circle cx="12" cy="12" r="8" strokeDasharray="4 4" />
          <path d="M12 4V20M4 12H20" strokeDasharray="4 4" />
        </>
      )}
      {obstacle === 'stone' && (
        <>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M4 12H20M12 4V20" />
        </>
      )}
    </svg>
  );
};

export const SpecialOverlaySvg: React.FC<{ special: SpecialType; color?: TileColor | null; className?: string }> = ({ special, color, className }) => {
  const hex = color ? COLOR_PALETTE[color].hex : '#ffffff';
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke={hex}
      strokeWidth="2"
    >
      {special === 'rocket_h' && (
        <>
          <circle cx="12" cy="12" r="8" strokeDasharray="6 6" />
          <path d="M4 12H20M12 4V20" />
          <path d="M20 12L16 8M20 12L16 16" strokeLinecap="round" />
        </>
      )}
      {special === 'rocket_v' && (
        <>
          <circle cx="12" cy="12" r="8" strokeDasharray="6 6" />
          <path d="M4 12H20M12 4V20" />
          <path d="M12 20L8 16M12 20L16 16" strokeLinecap="round" />
        </>
      )}
      {special === 'bomb' && (
        <circle cx="12" cy="12" r="8" />
      )}
      {special === 'prism' && (
        <>
          <polygon points="12,2 20,10 12,18 4,10" strokeLinejoin="round" />
          <path d="M12 2V18M4 10H20" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
};
