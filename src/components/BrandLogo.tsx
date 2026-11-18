import React from 'react';

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'w-full max-w-[440px]' }) => {
  return (
    <svg
      viewBox="0 0 540 155"
      className={`${className} drop-shadow-[0_12px_28px_rgba(0,0,0,0.7)]`}
      role="img"
      aria-label="Kingdom Blast"
    >
      <defs>
        <linearGradient id="kbTitleGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="48%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="kbBannerNavy" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      {/* Crown crest */}
      <path
        d="M238 36L245 14L261 25L270 7L279 25L295 14L302 36Z"
        fill="url(#kbTitleGold)"
        stroke="#451a03"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Ribbon base */}
      <path
        d="M72 44H468L450 96H90Z"
        fill="url(#kbBannerNavy)"
        stroke="#fbbf24"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <text
        x="270"
        y="81"
        textAnchor="middle"
        fill="url(#kbTitleGold)"
        stroke="#1e1b4b"
        strokeWidth="6"
        paintOrder="stroke"
        style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: '46px', letterSpacing: '3px' }}
      >
        KINGDOM
      </text>
      <rect
        x="148"
        y="95"
        width="244"
        height="46"
        rx="14"
        fill="#b91c1c"
        stroke="#fde047"
        strokeWidth="3.5"
      />
      <text
        x="270"
        y="128"
        textAnchor="middle"
        fill="#fffbeb"
        stroke="#450a0a"
        strokeWidth="4"
        paintOrder="stroke"
        style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: '30px', letterSpacing: '4px' }}
      >
        BLAST
      </text>
    </svg>
  );
};
