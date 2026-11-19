import React from 'react';

export const BrandLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 200 60"
      className={className}
      role="img"
      aria-label="Kingdom Blast"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <text
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-family="'Fredoka', 'Plus Jakarta Sans', sans-serif"
        font-size="34"
        font-weight="800"
        fill="url(#logoGrad)"
        stroke="#020617"
        strokeWidth="2"
        letter-spacing="2"
        filter="url(#logoGlow)"
      >
        KINGDOM BLAST
      </text>
    </svg>
  );
};
