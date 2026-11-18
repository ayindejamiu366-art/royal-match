import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { LEVELS } from './data/levels';
import { soundEngine } from './audio/soundEngine';
import {
  BoosterType,
  DailyRewardDay,
  PlayerProgress,
  RestorationProject,
  ScreenName,
} from './types/game';
import {
  createDefaultProgress,
  getTodayIsoDate,
  loadProgress,
  reconcileLives,
  saveProgress,
} from './storage/progress';
import {
  BootProgress,
  GAME_ASSETS,
  initializeGameAssets,
  preloadImageAsset,
} from './utils/assetLoader';
import { TopHud } from './components/TopHud';
import { TitleScreen } from './components/TitleScreen';
import { LevelMapScreen } from './components/LevelMapScreen';
import { PuzzleBoardScreen } from './components/PuzzleBoardScreen';
import { KingdomRestorationScreen } from './components/KingdomRestorationScreen';
import { SplashScreen } from './components/SplashScreen';
import { LoadingScreen } from './components/LoadingScreen';
import {
  DailyRewardsModal,
  FailureModal,
  PauseModal,
  PlayerProfileModal,
  SettingsModal,
  ShopModal,
  VictoryModal,
} from './components/Modals';

interface SectionLoaderState {
  title: string;
  subtitle: string;
  progress: number;
}

export default function App() {
  const [progress, setProgress] = useState<PlayerProgress>(() => loadProgress());
  const [screen, setScreen] = useState<ScreenName>('TITLE');
  const [activeLevelId, setActiveLevelId] = useState<number>(() => loadProgress().unlockedLevel);

  const [showSplash, setShowSplash] = useState(true);
  const [bootProgress, setBootProgress] = useState<BootProgress>({
    percent: 10,
    stageLabel: 'Summoning Royal Assets...',
    done: false,
    hadErrors: false,
  });
  const [sectionLoader, setSectionLoader] = useState<SectionLoaderState | null>(null);

  const [showShop, setShowShop] = useState(false);
  const [showDaily, setShowDaily] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [victoryState, setVictoryState] = useState<{
    score: number;
    stars: number;
    movesLeft: number;
  } | null>(null);
  const [failureState, setFailureState] = useState<{ score: number } | null>(null);

  const [extraMovesSignal, setExtraMovesSignal] = useState(0);
  const [restartSignal, setRestartSignal] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const transitionTimerRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const clearLoaderTimers = useCallback(() => {
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    if (progressIntervalRef.current !== null) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearLoaderTimers();
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    };
  }, [clearLoaderTimers]);

  // Initial App Boot Splash Sequence (real asset & font initialization + short anti-flash min duration)
  useEffect(() => {
    let active = true;
    const hardFailsafe = window.setTimeout(() => {
      if (active) setShowSplash(false);
    }, 4500);

    initializeGameAssets((state) => {
      if (active) setBootProgress(state);
    }, 1150).then(() => {
      if (!active) return;
      window.clearTimeout(hardFailsafe);
      setShowSplash(false);
    });

    return () => {
      active = false;
      window.clearTimeout(hardFailsafe);
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // Sync audio settings & persist progress
  useEffect(() => {
    soundEngine.updateSettings(progress.audio);
    saveProgress(progress);
  }, [progress]);

  // Periodically reconcile regenerating lives
  useEffect(() => {
    const id = window.setInterval(() => {
      setProgress((prev) => {
        const next = reconcileLives(prev);
        return next.lives !== prev.lives ? next : prev;
      });
    }, 10000);
    return () => window.clearInterval(id);
  }, []);

  // Unlock Web Audio on first user pointer/key gesture
  useEffect(() => {
    const unlock = () => {
      soundEngine.unlock();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Esc key pauses during active gameplay
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && screen === 'PLAY' && !victoryState && !failureState && !sectionLoader) {
        setIsPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, victoryState, failureState, sectionLoader]);

  const activeLevel = LEVELS.find((l) => l.id === activeLevelId) || LEVELS[0];

  // Smooth Loading Screen transition for major sections & levels (never stalls, cleans timers)
  const runSectionTransition = useCallback(
    async (
      title: string,
      subtitle: string,
      assetToWarm: string | null,
      durationMs: number,
      onComplete: () => void
    ) => {
      clearLoaderTimers();
      setSectionLoader({ title, subtitle, progress: 15 });

      const startTime = performance.now();
      progressIntervalRef.current = window.setInterval(() => {
        const elapsed = performance.now() - startTime;
        const pct = Math.min(92, Math.round(15 + (elapsed / durationMs) * 77));
        setSectionLoader((prev) => (prev ? { ...prev, progress: pct } : null));
      }, 45);

      if (assetToWarm) {
        await Promise.all([
          preloadImageAsset(assetToWarm, 2000),
          new Promise<void>((r) => {
            transitionTimerRef.current = window.setTimeout(r, durationMs);
          }),
        ]);
      } else {
        await new Promise<void>((r) => {
          transitionTimerRef.current = window.setTimeout(r, durationMs);
        });
      }

      clearLoaderTimers();
      setSectionLoader((prev) => (prev ? { ...prev, progress: 100 } : null));
      onComplete();

      transitionTimerRef.current = window.setTimeout(() => {
        setSectionLoader(null);
      }, 110);
    },
    [clearLoaderTimers]
  );

  const navigateToSection = useCallback(
    (target: ScreenName) => {
      if (target === screen) return;
      soundEngine.playClick();

      if (target === 'MAP') {
        const fromGame = screen === 'PLAY';
        runSectionTransition(
          'Kingdom Trail',
          fromGame ? 'Returning to the royal map...' : 'Charting your next chapter...',
          GAME_ASSETS.map,
          fromGame ? 420 : 320,
          () => setScreen('MAP')
        );
        return;
      }

      if (target === 'KINGDOM') {
        runSectionTransition(
          'Royal Courtyard',
          'Entering the citadel restoration grounds...',
          GAME_ASSETS.citadel,
          340,
          () => setScreen('KINGDOM')
        );
        return;
      }

      setScreen(target);
    },
    [runSectionTransition, screen]
  );

  const startLevel = useCallback(
    (levelId: number) => {
      soundEngine.unlock();
      soundEngine.playClick();
      const fresh = reconcileLives(progress);
      if (fresh.lives <= 0) {
        setProgress(fresh);
        setShowShop(true);
        showToast('Out of hearts! Refill in the Royal Shop or wait for regeneration.');
        return;
      }

      const targetLevel = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
      setVictoryState(null);
      setFailureState(null);
      setIsPaused(false);

      runSectionTransition(
        `Level ${targetLevel.id}: ${targetLevel.name}`,
        `${targetLevel.region} · ${targetLevel.moves} Moves`,
        null,
        460,
        () => {
          setActiveLevelId(levelId);
          setRestartSignal((s) => s + 1);
          setScreen('PLAY');
        }
      );
    },
    [progress, runSectionTransition, showToast]
  );

  const handleUseBooster = useCallback((type: BoosterType) => {
    setProgress((prev) => ({
      ...prev,
      boosters: {
        ...prev.boosters,
        [type]: Math.max(0, prev.boosters[type] - 1),
      },
    }));
  }, []);

  const handleWin = useCallback(
    (score: number, stars: number, movesLeft: number) => {
      setVictoryState({ score, stars, movesLeft });
      setProgress((prev) => {
        const oldStars = prev.levelStars[activeLevel.id] || 0;
        const starDelta = Math.max(0, stars - oldStars);
        const totalCoinsWon = activeLevel.coinReward + movesLeft * 10;
        const nextUnlocked = Math.min(LEVELS.length, Math.max(prev.unlockedLevel, activeLevel.id + 1));

        return {
          ...prev,
          coins: prev.coins + totalCoinsWon,
          starsEarnedTotal: prev.starsEarnedTotal + starDelta,
          unlockedLevel: nextUnlocked,
          levelStars: {
            ...prev.levelStars,
            [activeLevel.id]: Math.max(oldStars, stars),
          },
          levelHighScores: {
            ...prev.levelHighScores,
            [activeLevel.id]: Math.max(prev.levelHighScores[activeLevel.id] || 0, score),
          },
        };
      });
    },
    [activeLevel]
  );

  const handleLose = useCallback((score: number) => {
    setFailureState({ score });
    setProgress((prev) => {
      const wasFull = prev.lives >= prev.maxLives;
      return {
        ...prev,
        lives: Math.max(0, prev.lives - 1),
        lastLifeTimestamp: wasFull ? Date.now() : prev.lastLifeTimestamp,
      };
    });
  }, []);

  const handleBuyExtraMoves = useCallback(() => {
    if (progress.coins < 100) return;
    soundEngine.playCoin();
    setProgress((prev) => ({
      ...prev,
      coins: prev.coins - 100,
      lives: Math.min(prev.maxLives, prev.lives + 1),
    }));
    setFailureState(null);
    setExtraMovesSignal((s) => s + 1);
  }, [progress.coins]);

  const handleRetryFromFailure = useCallback(() => {
    if (progress.lives <= 0) {
      setShowShop(true);
      return;
    }
    soundEngine.playClick();
    setFailureState(null);
    setRestartSignal((s) => s + 1);
  }, [progress.lives]);

  const handleClaimDaily = useCallback(
    (reward: DailyRewardDay) => {
      soundEngine.playWin();
      const today = getTodayIsoDate();
      setProgress((prev) => {
        const nextBoosters = { ...prev.boosters };
        if (reward.booster && reward.boosterCount) {
          nextBoosters[reward.booster] = (nextBoosters[reward.booster] || 0) + reward.boosterCount;
        }
        return {
          ...prev,
          coins: prev.coins + reward.coins,
          boosters: nextBoosters,
          dailyStreak: prev.dailyStreak + 1,
          lastDailyClaimDate: today,
        };
      });
      showToast(`Claimed ${reward.label}: +${reward.coins} Coins!`);
    },
    [showToast]
  );

  const handleBuyBooster = useCallback(
    (type: BoosterType, cost: number) => {
      if (progress.coins < cost) return;
      soundEngine.playCoin();
      setProgress((prev) => ({
        ...prev,
        coins: prev.coins - cost,
        boosters: {
          ...prev.boosters,
          [type]: prev.boosters[type] + 1,
        },
      }));
    },
    [progress.coins]
  );

  const handleRefillLives = useCallback(() => {
    if (progress.coins < 120 || progress.lives >= progress.maxLives) return;
    soundEngine.playCoin();
    setProgress((prev) => ({
      ...prev,
      coins: prev.coins - 120,
      lives: prev.maxLives,
      lastLifeTimestamp: Date.now(),
    }));
    showToast('All 5 Hearts Restored!');
  }, [progress.coins, progress.lives, progress.maxLives, showToast]);

  const handleClaimFreeChest = useCallback(() => {
    soundEngine.playWin();
    setProgress((prev) => ({
      ...prev,
      coins: prev.coins + 120,
      boosters: {
        ...prev.boosters,
        hammer: prev.boosters.hammer + 1,
      },
      lastFreeChestTimestamp: Date.now(),
    }));
    showToast('Free Royal Chest opened: +120 Coins & +1 Hammer!');
  }, [showToast]);

  const handleRestoreProject = useCallback(
    (project: RestorationProject) => {
      soundEngine.playBuild();
      setProgress((prev) => {
        const avail = prev.starsEarnedTotal - prev.starsSpent;
        if (avail < project.starCost || prev.restoredIds.includes(project.id)) return prev;
        return {
          ...prev,
          starsSpent: prev.starsSpent + project.starCost,
          coins: prev.coins + project.coinBonus,
          restoredIds: [...prev.restoredIds, project.id],
        };
      });
      showToast(`Built ${project.name}! (+${project.coinBonus} Coins)`);
    },
    [showToast]
  );

  const toggleMasterAudio = useCallback(() => {
    soundEngine.unlock();
    setProgress((prev) => {
      const anyOn = prev.audio.musicEnabled || prev.audio.sfxEnabled;
      return {
        ...prev,
        audio: {
          ...prev.audio,
          musicEnabled: !anyOn,
          sfxEnabled: !anyOn,
        },
      };
    });
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col relative overflow-x-hidden">
        {/* Launch Splash Screen */}
        <AnimatePresence>
          {showSplash && <SplashScreen bootProgress={bootProgress} />}
        </AnimatePresence>

        {/* Contextual Loading Screen for Levels & Major Sections */}
        <AnimatePresence>
          {sectionLoader && (
            <LoadingScreen
              title={sectionLoader.title}
              subtitle={sectionLoader.subtitle}
              progress={sectionLoader.progress}
            />
          )}
        </AnimatePresence>

        {/* Persistent Top HUD */}
        <TopHud
          progress={progress}
          onOpenSettings={() => {
            soundEngine.playClick();
            setShowSettings(true);
          }}
          onOpenShop={() => {
            soundEngine.playClick();
            setShowShop(true);
          }}
          onToggleAudio={toggleMasterAudio}
          onOpenProfile={() => {
            soundEngine.playClick();
            setShowProfile(true);
          }}
        />

        {/* Toast Feedback */}
        {toastMsg && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 border-2 border-amber-400 text-amber-200 px-4 py-2.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold animate-pop-in whitespace-nowrap">
            {toastMsg}
          </div>
        )}

        {/* Active Game Screen with Smooth Transitions */}
        <AnimatePresence mode="wait">
          {screen === 'TITLE' && (
            <motion.div
              key="screen-title"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col"
            >
              <TitleScreen
                progress={progress}
                onPlayCurrent={() => startLevel(progress.unlockedLevel)}
                onOpenMap={() => navigateToSection('MAP')}
                onOpenKingdom={() => navigateToSection('KINGDOM')}
                onOpenShop={() => {
                  soundEngine.playClick();
                  setShowShop(true);
                }}
                onOpenDaily={() => {
                  soundEngine.playClick();
                  setShowDaily(true);
                }}
                onOpenProfile={() => {
                  soundEngine.playClick();
                  setShowProfile(true);
                }}
                isHotkeysActive={
                  !showSplash && !sectionLoader && !showShop && !showDaily && !showSettings && !showProfile
                }
              />
            </motion.div>
          )}

          {screen === 'MAP' && (
            <motion.div
              key="screen-map"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col"
            >
              <LevelMapScreen
                progress={progress}
                onSelectLevel={(id) => startLevel(id)}
                onBackHome={() => navigateToSection('TITLE')}
                onOpenKingdom={() => navigateToSection('KINGDOM')}
              />
            </motion.div>
          )}

          {screen === 'KINGDOM' && (
            <motion.div
              key="screen-kingdom"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col"
            >
              <KingdomRestorationScreen
                progress={progress}
                onRestoreProject={handleRestoreProject}
                onBackHome={() => navigateToSection('TITLE')}
                onOpenMap={() => navigateToSection('MAP')}
              />
            </motion.div>
          )}

          {screen === 'PLAY' && (
            <motion.div
              key={`screen-play-${activeLevel.id}`}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col"
            >
              <PuzzleBoardScreen
                level={activeLevel}
                progress={progress}
                onUseBooster={handleUseBooster}
                onWin={handleWin}
                onLose={handleLose}
                onPause={() => {
                  soundEngine.playClick();
                  setIsPaused(true);
                }}
                extraMovesSignal={extraMovesSignal}
                restartSignal={restartSignal}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gameplay Modals */}
        <AnimatePresence>
          {screen === 'PLAY' && victoryState && (
            <VictoryModal
              level={activeLevel}
              score={victoryState.score}
              starsEarned={victoryState.stars}
              movesLeft={victoryState.movesLeft}
              hasNextLevel={activeLevel.id < LEVELS.length}
              onNextLevel={() => startLevel(activeLevel.id + 1)}
              onBackToMap={() => {
                setVictoryState(null);
                navigateToSection('MAP');
              }}
              onOpenKingdom={() => {
                setVictoryState(null);
                navigateToSection('KINGDOM');
              }}
            />
          )}

          {screen === 'PLAY' && failureState && (
            <FailureModal
              level={activeLevel}
              score={failureState.score}
              coins={progress.coins}
              lives={progress.lives}
              onBuyExtraMoves={handleBuyExtraMoves}
              onRetry={handleRetryFromFailure}
              onBackToMap={() => {
                setFailureState(null);
                navigateToSection('MAP');
              }}
            />
          )}

          {screen === 'PLAY' && isPaused && !victoryState && !failureState && (
            <PauseModal
              level={activeLevel}
              musicEnabled={progress.audio.musicEnabled}
              sfxEnabled={progress.audio.sfxEnabled}
              onToggleMusic={() =>
                setProgress((p) => ({
                  ...p,
                  audio: { ...p.audio, musicEnabled: !p.audio.musicEnabled },
                }))
              }
              onToggleSfx={() =>
                setProgress((p) => ({
                  ...p,
                  audio: { ...p.audio, sfxEnabled: !p.audio.sfxEnabled },
                }))
              }
              onResume={() => setIsPaused(false)}
              onRestart={() => {
                setIsPaused(false);
                setRestartSignal((s) => s + 1);
              }}
              onQuit={() => {
                setIsPaused(false);
                navigateToSection('MAP');
              }}
            />
          )}

          {/* Global Modals */}
          {showDaily && (
            <DailyRewardsModal
              progress={progress}
              onClaim={handleClaimDaily}
              onClose={() => setShowDaily(false)}
            />
          )}

          {showShop && (
            <ShopModal
              progress={progress}
              onBuyBooster={handleBuyBooster}
              onRefillLives={handleRefillLives}
              onClaimFreeChest={handleClaimFreeChest}
              onClose={() => setShowShop(false)}
            />
          )}

          {showProfile && (
            <PlayerProfileModal
              progress={progress}
              onClose={() => setShowProfile(false)}
              onOpenSettings={() => setShowSettings(true)}
            />
          )}

          {showSettings && (
            <SettingsModal
              progress={progress}
              onUpdateName={(playerName) => {
                setProgress((p) => ({ ...p, playerName }));
                showToast('Player profile updated!');
              }}
              onUpdateAudio={(patch) =>
                setProgress((p) => ({ ...p, audio: { ...p.audio, ...patch } }))
              }
              onResetProgress={() => {
                const fresh = createDefaultProgress();
                setProgress(fresh);
                setActiveLevelId(1);
                setScreen('TITLE');
                setShowSettings(false);
                showToast('All saved progress reset.');
              }}
              onClose={() => setShowSettings(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
