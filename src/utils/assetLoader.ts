export const GAME_ASSETS = {
  keyart: '/src/assets/images/kingdom_backdrop_keyart_1795006922932.jpg',
  monarch: '/src/assets/images/kingdom_character_monarch_1795006924096.jpg',
  map: '/src/assets/images/kingdom_map_illustration_1795006924124.jpg',
  citadel: '/src/assets/images/kingdom_restoration_citadel_1795006925072.jpg',
} as const;

const loadedCache = new Map<string, boolean>();

export function isAssetCached(url: string): boolean {
  return loadedCache.get(url) === true;
}

export function preloadImageAsset(url: string, timeoutMs = 3500): Promise<boolean> {
  if (loadedCache.get(url)) return Promise.resolve(true);

  return new Promise((resolve) => {
    if (typeof Image === 'undefined') {
      resolve(true);
      return;
    }

    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      globalThis.clearTimeout(timer);
      loadedCache.set(url, ok);
      resolve(ok);
    };

    const timer = globalThis.setTimeout(() => finish(false), timeoutMs);
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    img.onload = () => finish(true);
    img.onerror = () => finish(false);
    img.src = url;
  });
}

export interface BootProgress {
  percent: number;
  stageLabel: string;
  done: boolean;
  hadErrors: boolean;
}

export async function initializeGameAssets(
  onProgress: (state: BootProgress) => void,
  minDurationMs = 1150
): Promise<BootProgress> {
  const start = performance.now();
  const urls = Object.values(GAME_ASSETS);
  const totalSteps = urls.length + 1;
  let completed = 0;
  let hadErrors = false;

  const report = (stageLabel: string, done = false) => {
    const percent = Math.min(100, Math.round((completed / totalSteps) * 100));
    onProgress({ percent, stageLabel, done, hadErrors });
  };

  report('Summoning Royal Assets...');

  const fontPromise =
    typeof document !== 'undefined' && document.fonts?.ready
      ? Promise.race([
          document.fonts.ready.then(() => true),
          new Promise<boolean>((r) => globalThis.setTimeout(() => r(true), 1200)),
        ])
      : Promise.resolve(true);

  await fontPromise;
  completed += 1;
  report('Polishing Kingdom Gems...');

  const stageNames = [
    'Drawing Sunlit Citadel...',
    'Greeting Architect Aurelian...',
    'Charting Kingdom Trail...',
    'Opening Courtyard Gates...',
  ];

  await Promise.all(
    urls.map(async (url, idx) => {
      const ok = await preloadImageAsset(url, 3200);
      if (!ok) hadErrors = true;
      completed += 1;
      report(stageNames[idx] || 'Preparing Kingdom...');
    })
  );

  const elapsed = performance.now() - start;
  if (elapsed < minDurationMs) {
    await new Promise((r) => globalThis.setTimeout(r, minDurationMs - elapsed));
  }

  const finalState: BootProgress = {
    percent: 100,
    stageLabel: 'Welcome to Kingdom Blast!',
    done: true,
    hadErrors,
  };
  onProgress(finalState);
  return finalState;
}
