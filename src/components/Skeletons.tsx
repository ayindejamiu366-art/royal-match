import React from 'react';

const SkelBox: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-slate-800/80 border border-slate-700/60 skeleton-shimmer ${className}`} />
);

/* A. Main Menu Skeleton matching TitleScreen dimensions */
export const TitleScreenSkeleton: React.FC = () => {
  return (
    <div className="relative flex-1 flex flex-col justify-between overflow-hidden min-h-[calc(100vh-64px)] bg-slate-950">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/60 via-slate-900/40 to-slate-950 skeleton-shimmer pointer-events-none" />
      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-6 flex flex-col items-center justify-center gap-6">
        <SkelBox className="w-72 sm:w-96 h-28 rounded-3xl" />

        <div className="w-full max-w-md bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3.5">
            <SkelBox className="w-16 h-16 rounded-2xl shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <SkelBox className="h-3.5 w-28 rounded-md" />
              <SkelBox className="h-4 w-full rounded-md" />
              <SkelBox className="h-4 w-3/4 rounded-md" />
            </div>
          </div>

          <SkelBox className="w-full h-14 rounded-2xl" />

          <div className="grid grid-cols-2 gap-2.5">
            <SkelBox className="h-12 rounded-2xl" />
            <SkelBox className="h-12 rounded-2xl" />
            <SkelBox className="h-12 rounded-2xl" />
            <SkelBox className="h-12 rounded-2xl" />
          </div>
        </div>
      </main>
    </div>
  );
};

/* B. Level Selection Skeleton matching LevelMapScreen */
export const LevelMapSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-5 flex-1">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SkelBox className="w-24 h-10 rounded-xl" />
          <div className="flex flex-col gap-1.5">
            <SkelBox className="w-40 h-7 rounded-lg" />
            <SkelBox className="w-48 h-3.5 rounded-md" />
          </div>
        </div>
        <SkelBox className="w-36 h-10 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 bg-slate-900/80 border-2 border-slate-800 rounded-3xl p-4 sm:p-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <SkelBox key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-4 bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-5 flex flex-col gap-4">
          <SkelBox className="h-7 w-3/4 rounded-lg" />
          <div className="grid grid-cols-3 gap-2">
            <SkelBox className="h-14 rounded-xl" />
            <SkelBox className="h-14 rounded-xl" />
            <SkelBox className="h-14 rounded-xl" />
          </div>
          <SkelBox className="h-12 rounded-xl" />
          <SkelBox className="h-12 rounded-xl" />
          <SkelBox className="h-12 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

/* C. Shop Skeleton matching ShopModal */
export const ShopModalSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-3">
      <SkelBox className="h-20 rounded-2xl" />
      <SkelBox className="h-18 rounded-2xl" />
      <SkelBox className="h-16 rounded-2xl" />
      <SkelBox className="h-16 rounded-2xl" />
      <SkelBox className="h-16 rounded-2xl" />
    </div>
  );
};

/* D. Player Profile Skeleton */
export const PlayerProfileSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3.5">
        <SkelBox className="w-16 h-16 rounded-2xl shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <SkelBox className="h-5 w-40 rounded-lg" />
          <SkelBox className="h-3.5 w-28 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <SkelBox className="h-16 rounded-2xl" />
        <SkelBox className="h-16 rounded-2xl" />
        <SkelBox className="h-16 rounded-2xl" />
        <SkelBox className="h-16 rounded-2xl" />
      </div>
      <div className="flex flex-col gap-2">
        <SkelBox className="h-14 rounded-2xl" />
        <SkelBox className="h-14 rounded-2xl" />
        <SkelBox className="h-14 rounded-2xl" />
      </div>
    </div>
  );
};

/* E. Kingdom Restoration Skeleton matching KingdomRestorationScreen */
export const KingdomRestorationSkeleton: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SkelBox className="w-24 h-10 rounded-xl" />
          <div className="flex flex-col gap-1.5">
            <SkelBox className="w-44 h-7 rounded-lg" />
            <SkelBox className="w-36 h-3.5 rounded-md" />
          </div>
        </div>
        <div className="flex gap-2">
          <SkelBox className="w-32 h-10 rounded-xl" />
          <SkelBox className="w-28 h-10 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <SkelBox className="lg:col-span-7 aspect-[16/10] rounded-3xl" />
        <div className="lg:col-span-5 flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkelBox key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
};
