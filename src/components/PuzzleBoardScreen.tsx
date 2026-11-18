import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Crosshair,
  Hammer,
  Lightbulb,
  Pause,
  Shuffle,
  Star,
} from 'lucide-react';
import {
  ActiveEffect,
  BoosterType,
  FloatingText,
  LevelConfig,
  ParticleBurst,
  PlayerProgress,
  SpecialType,
  TileCell,
  TileColor,
} from '../types/game';
import {
  applyGravityAndRefill,
  cloneBoard,
  createInitialBoard,
  findMatchClusters,
  findValidMoves,
  genTileId,
  GRID_SIZE,
  isSwappable,
  shuffleBoardTiles,
} from '../engine/match3';
import { COLOR_PALETTE, GemSvg, ObstacleSvg, SpecialOverlaySvg } from './GemIcons';
import { soundEngine } from '../audio/soundEngine';

interface PuzzleBoardScreenProps {
  level: LevelConfig;
  progress: PlayerProgress;
  onUseBooster: (type: BoosterType) => void;
  onWin: (score: number, stars: number, movesLeft: number) => void;
  onLose: (score: number) => void;
  onPause: () => void;
  extraMovesSignal: number;
  restartSignal: number;
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const PuzzleBoardScreen: React.FC<PuzzleBoardScreenProps> = ({
  level,
  progress,
  onUseBooster,
  onWin,
  onLose,
  onPause,
  extraMovesSignal,
  restartSignal,
}) => {
  const [board, setBoard] = useState<TileCell[][]>(() => createInitialBoard(level));
  const [movesLeft, setMovesLeft] = useState<number>(level.moves);
  const [score, setScore] = useState<number>(0);
  const [objProgress, setObjProgress] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    level.objectives.forEach((o) => {
      init[o.id] = 0;
    });
    return init;
  });

  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [armedBooster, setArmedBooster] = useState<'hammer' | 'cannon' | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [hintCoords, setHintCoords] = useState<Array<{ row: number; col: number }>>([]);
  const [effects, setEffects] = useState<ActiveEffect[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [particles, setParticles] = useState<ParticleBurst[]>([]);
  const [boardShaking, setBoardShaking] = useState(false);
  const [shuffleNotice, setShuffleNotice] = useState(false);

  const isResolvingRef = useRef(false);
  const outcomeRef = useRef<'playing' | 'won' | 'lost'>('playing');
  const boardRef = useRef(board);
  boardRef.current = board;
  const movesRef = useRef(movesLeft);
  movesRef.current = movesLeft;
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const objRef = useRef(objProgress);
  objRef.current = objProgress;

  const pointerStartRef = useRef<{ row: number; col: number; x: number; y: number } | null>(null);
  const mountedRef = useRef(true);
  const prevStarsRef = useRef<number>(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Reset board on level change or restartSignal
  useEffect(() => {
    const fresh = createInitialBoard(level);
    setBoard(fresh);
    setMovesLeft(level.moves);
    setScore(0);
    const initObj: Record<string, number> = {};
    level.objectives.forEach((o) => {
      initObj[o.id] = 0;
    });
    setObjProgress(initObj);
    setSelected(null);
    setArmedBooster(null);
    setHintCoords([]);
    setEffects([]);
    setFloatingTexts([]);
    setParticles([]);
    setIsResolving(false);
    isResolvingRef.current = false;
    outcomeRef.current = 'playing';
    prevStarsRef.current = 0;
  }, [level, restartSignal]);

  // Handle +5 extra moves purchased on FailureModal
  useEffect(() => {
    if (extraMovesSignal > 0 && outcomeRef.current === 'lost') {
      outcomeRef.current = 'playing';
      setMovesLeft((m) => m + 5);
      movesRef.current += 5;
      setIsResolving(false);
      isResolvingRef.current = false;
    }
  }, [extraMovesSignal]);

  // Idle Hint Timer (5 seconds)
  useEffect(() => {
    if (isResolving || outcomeRef.current !== 'playing') {
      setHintCoords([]);
      return;
    }
    const timer = window.setTimeout(() => {
      const valid = findValidMoves(boardRef.current);
      if (valid.length > 0 && outcomeRef.current === 'playing' && !isResolvingRef.current) {
        const best = valid[0];
        setHintCoords([
          { row: best.r1, col: best.c1 },
          { row: best.r2, col: best.c2 },
        ]);
      }
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [board, isResolving, movesLeft]);

  const spawnFloatingText = useCallback(
    (row: number, col: number, text: string, tone: FloatingText['tone'] = 'gold') => {
      const id = `ft-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setFloatingTexts((prev) => [...prev.slice(-6), { id, row, col, text, tone }]);
      window.setTimeout(() => {
        if (!mountedRef.current) return;
        setFloatingTexts((prev) => prev.filter((f) => f.id !== id));
      }, 850);
    },
    []
  );

  const spawnParticlesForCells = useCallback((cells: Array<{ row: number; col: number; color: TileColor | null }>) => {
    const newBursts: ParticleBurst[] = [];
    cells.slice(0, 18).forEach((cell) => {
      const hex = cell.color ? COLOR_PALETTE[cell.color].hex : '#fbbf24';
      const cx = ((cell.col + 0.5) / GRID_SIZE) * 100;
      const cy = ((cell.row + 0.5) / GRID_SIZE) * 100;
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 4 + Math.random() * 8;
        newBursts.push({
          id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          x: cx,
          y: cy,
          color: hex,
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
          size: 5 + Math.random() * 5,
        });
      }
    });
    setParticles((prev) => [...prev.slice(-30), ...newBursts]);
    window.setTimeout(() => {
      if (!mountedRef.current) return;
      const ids = new Set(newBursts.map((b) => b.id));
      setParticles((prev) => prev.filter((p) => !ids.has(p.id)));
    }, 450);
  }, []);

  const triggerEffect = useCallback((eff: Omit<ActiveEffect, 'id'>) => {
    const id = `eff-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setEffects((prev) => [...prev, { ...eff, id }]);
    window.setTimeout(() => {
      if (!mountedRef.current) return;
      setEffects((prev) => prev.filter((e) => e.id !== id));
    }, 360);
  }, []);

  const triggerShake = useCallback(() => {
    setBoardShaking(true);
    window.setTimeout(() => {
      if (mountedRef.current) setBoardShaking(false);
    }, 300);
  }, []);

  const checkAllObjectivesMet = useCallback(
    (progressMap: Record<string, number>) => {
      return level.objectives.every((obj) => (progressMap[obj.id] || 0) >= obj.target);
    },
    [level.objectives]
  );

  const computeStars = useCallback(
    (finalScore: number) => {
      if (finalScore >= level.starThresholds[2]) return 3;
      if (finalScore >= level.starThresholds[1]) return 2;
      return 1;
    },
    [level.starThresholds]
  );

  // Expand special activations + damage obstacles + update objectives & score
  const clearCellsWithChain = useCallback(
    (
      currentBoard: TileCell[][],
      directColorCells: Array<{ row: number; col: number }>,
      specialTriggers: Array<{ row: number; col: number; forceType?: SpecialType; targetColor?: TileColor }>,
      spawnReplacements: Array<{ row: number; col: number; color: TileColor; special: SpecialType }>,
      allowAdjacentCrateDamage: boolean
    ) => {
      const next = cloneBoard(currentBoard);
      const toBlast = new Map<string, { bySpecial: boolean }>();
      const visitedSpecials = new Set<string>();
      const queue = [...specialTriggers];

      directColorCells.forEach(({ row, col }) => {
        toBlast.set(`${row},${col}`, { bySpecial: false });
      });

      // Adjacent crate damage for normal color matches
      if (allowAdjacentCrateDamage) {
        const dirs = [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1],
        ];
        directColorCells.forEach(({ row, col }) => {
          dirs.forEach(([dr, dc]) => {
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
              if (next[nr][nc].obstacle === 'crate') {
                toBlast.set(`${nr},${nc}`, { bySpecial: false });
              }
            }
          });
        });
      }

      // Check if any direct cell already holds a special
      directColorCells.forEach(({ row, col }) => {
        const sp = next[row][col].special;
        if (sp !== 'none') {
          queue.push({ row, col });
        }
      });

      while (queue.length > 0) {
        const item = queue.shift()!;
        const key = `${item.row},${item.col}`;
        if (visitedSpecials.has(key)) continue;
        visitedSpecials.add(key);

        const cell = next[item.row][item.col];
        const spType = item.forceType || cell.special;
        if (spType === 'none') continue;

        toBlast.set(key, { bySpecial: true });

        const markBlast = (r: number, c: number) => {
          if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return;
          if (next[r][c].isVoid) return;
          const k = `${r},${c}`;
          toBlast.set(k, { bySpecial: true });
          if (next[r][c].special !== 'none' && !visitedSpecials.has(k)) {
            queue.push({ row: r, col: c });
          }
        };

        if (spType === 'rocket_h') {
          soundEngine.playRocket();
          triggerEffect({ type: 'beam_h', row: item.row, col: item.col });
          for (let c = 0; c < GRID_SIZE; c++) markBlast(item.row, c);
        } else if (spType === 'rocket_v') {
          soundEngine.playRocket();
          triggerEffect({ type: 'beam_v', row: item.row, col: item.col });
          for (let r = 0; r < GRID_SIZE; r++) markBlast(r, item.col);
        } else if (spType === 'bomb') {
          soundEngine.playBomb();
          triggerShake();
          triggerEffect({ type: 'explosion', row: item.row, col: item.col });
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              markBlast(item.row + dr, item.col + dc);
            }
          }
        } else if (spType === 'prism') {
          soundEngine.playPrism();
          triggerShake();
          // Determine color to clear: explicit targetColor or most abundant on board
          let chosenColor = item.targetColor;
          if (!chosenColor) {
            const counts: Partial<Record<TileColor, number>> = {};
            for (let r = 0; r < GRID_SIZE; r++) {
              for (let c = 0; c < GRID_SIZE; c++) {
                const colVal = next[r][c].color;
                if (colVal) counts[colVal] = (counts[colVal] || 0) + 1;
              }
            }
            let bestCount = -1;
            (Object.keys(counts) as TileColor[]).forEach((cKey) => {
              if ((counts[cKey] || 0) > bestCount) {
                bestCount = counts[cKey] || 0;
                chosenColor = cKey;
              }
            });
          }
          if (chosenColor) {
            for (let r = 0; r < GRID_SIZE; r++) {
              for (let c = 0; c < GRID_SIZE; c++) {
                if (next[r][c].color === chosenColor) {
                  markBlast(r, c);
                }
              }
            }
          }
        }
      }

      // Apply destruction & tally points / objectives
      const spawnMap = new Map<string, { color: TileColor; special: SpecialType }>();
      spawnReplacements.forEach((s) => spawnMap.set(`${s.row},${s.col}`, { color: s.color, special: s.special }));

      let gainedScore = 0;
      const objDeltas: Record<string, number> = {};
      const clearedForParticles: Array<{ row: number; col: number; color: TileColor | null }> = [];
      let brokeObstacle = false;

      const addObjectiveCount = (type: 'color' | 'crate' | 'ice' | 'stone', color?: TileColor | null) => {
        level.objectives.forEach((o) => {
          if (o.type === type && (type !== 'color' || o.color === color)) {
            objDeltas[o.id] = (objDeltas[o.id] || 0) + 1;
          }
        });
      };

      toBlast.forEach(({ bySpecial }, key) => {
        const [rStr, cStr] = key.split(',');
        const r = Number(rStr);
        const c = Number(cStr);
        const cell = next[r][c];
        if (cell.isVoid) return;

        // Stones only break on special/booster blasts
        if (cell.obstacle === 'stone' && !bySpecial) {
          return;
        }

        if (cell.obstacle === 'crate') {
          brokeObstacle = true;
          addObjectiveCount('crate');
          gainedScore += 60;
          clearedForParticles.push({ row: r, col: c, color: 'yellow' });
          next[r][c] = {
            ...cell,
            obstacle: 'none',
            obstacleHp: 0,
            color: null,
            special: 'none',
          };
          return;
        }

        if (cell.obstacle === 'stone') {
          brokeObstacle = true;
          addObjectiveCount('stone');
          gainedScore += 90;
          clearedForParticles.push({ row: r, col: c, color: 'blue' });
          next[r][c] = {
            ...cell,
            obstacle: 'none',
            obstacleHp: 0,
            color: null,
            special: 'none',
          };
          return;
        }

        if (cell.obstacle === 'ice') {
          brokeObstacle = true;
          addObjectiveCount('ice');
          gainedScore += 50;
        }

        if (cell.color) {
          addObjectiveCount('color', cell.color);
          clearedForParticles.push({ row: r, col: c, color: cell.color });
          gainedScore += 30;
        } else if (cell.special === 'prism') {
          clearedForParticles.push({ row: r, col: c, color: 'purple' });
          gainedScore += 80;
        }

        const spawn = spawnMap.get(key);
        if (spawn && cell.obstacle === 'none') {
          next[r][c] = {
            ...cell,
            id: genTileId(),
            color: spawn.special === 'prism' ? null : spawn.color,
            special: spawn.special,
            obstacle: 'none',
            obstacleHp: 0,
            isNew: true,
          };
          soundEngine.playSpecialCreate();
        } else {
          next[r][c] = {
            ...cell,
            id: genTileId(),
            color: null,
            special: 'none',
            obstacle: 'none',
            obstacleHp: 0,
          };
        }
      });

      if (brokeObstacle) soundEngine.playObstacleBreak();
      spawnParticlesForCells(clearedForParticles);

      return { nextBoard: next, gainedScore, objDeltas };
    },
    [level.objectives, spawnParticlesForCells, triggerEffect, triggerShake]
  );

  // Full cascade loop after an initial board action
  const runCascadesAndFinishTurn = useCallback(
    async (
      startingBoard: TileCell[][],
      initialScoreGain: number,
      initialObjDeltas: Record<string, number>,
      remainingMovesAfterAction: number
    ) => {
      let current = startingBoard;
      let totalGain = initialScoreGain;
      const mergedDeltas = { ...initialObjDeltas };

      const applyDeltasAndScore = (gain: number, deltas: Record<string, number>) => {
        if (gain > 0) {
          const nextScore = scoreRef.current + gain;
          scoreRef.current = nextScore;
          setScore(nextScore);
        }
        if (Object.keys(deltas).length > 0) {
          const updatedObj = { ...objRef.current };
          Object.entries(deltas).forEach(([k, v]) => {
            updatedObj[k] = (updatedObj[k] || 0) + v;
          });
          objRef.current = updatedObj;
          setObjProgress(updatedObj);
        }
      };

      applyDeltasAndScore(totalGain, mergedDeltas);
      setBoard(current);
      await wait(190);

      // Gravity + Refill + Auto-cascading matches
      let combo = 1;
      while (mountedRef.current) {
        current = applyGravityAndRefill(current, level);
        setBoard(current);
        await wait(200);
        if (!mountedRef.current) return;

        const clusters = findMatchClusters(current);
        if (clusters.length === 0) break;

        combo += 1;
        soundEngine.playMatch(combo);

        const directCells: Array<{ row: number; col: number }> = [];
        const spawns: Array<{ row: number; col: number; color: TileColor; special: SpecialType }> = [];

        clusters.forEach((cl) => {
          cl.cells.forEach((c) => directCells.push(c));
          if (cl.spawnSpecial !== 'none') {
            spawns.push({
              row: cl.anchor.row,
              col: cl.anchor.col,
              color: cl.color,
              special: cl.spawnSpecial,
            });
          }
        });

        const anchorSample = clusters[0].anchor;
        const { nextBoard, gainedScore, objDeltas } = clearCellsWithChain(
          current,
          directCells,
          [],
          spawns,
          true
        );

        const comboBonus = Math.round(gainedScore * (1 + (combo - 1) * 0.35));
        spawnFloatingText(
          anchorSample.row,
          anchorSample.col,
          combo >= 3 ? `COMBO ×${combo}! +${comboBonus}` : `+${comboBonus}`,
          combo >= 3 ? 'combo' : 'gold'
        );

        applyDeltasAndScore(comboBonus, objDeltas);
        current = nextBoard;
        setBoard(current);
        await wait(190);
      }

      if (!mountedRef.current) return;

      // Check Victory first!
      if (checkAllObjectivesMet(objRef.current)) {
        outcomeRef.current = 'won';
        const bonusScore = remainingMovesAfterAction * 150;
        const finalScore = scoreRef.current + bonusScore;
        scoreRef.current = finalScore;
        setScore(finalScore);
        const stars = computeStars(finalScore);
        await wait(260);
        if (!mountedRef.current) return;
        soundEngine.playWin();
        onWin(finalScore, stars, remainingMovesAfterAction);
        isResolvingRef.current = false;
        setIsResolving(false);
        return;
      }

      // Check Loss (out of moves)
      if (remainingMovesAfterAction <= 0) {
        outcomeRef.current = 'lost';
        await wait(220);
        if (!mountedRef.current) return;
        soundEngine.playLose();
        onLose(scoreRef.current);
        isResolvingRef.current = false;
        setIsResolving(false);
        return;
      }

      // Deadlock detection & automatic shuffle
      if (findValidMoves(current).length === 0) {
        setShuffleNotice(true);
        await wait(450);
        current = shuffleBoardTiles(current, level);
        setBoard(current);
        await wait(350);
        if (mountedRef.current) setShuffleNotice(false);
      }

      if (mountedRef.current) {
        isResolvingRef.current = false;
        setIsResolving(false);
      }
    },
    [
      checkAllObjectivesMet,
      clearCellsWithChain,
      computeStars,
      level,
      onLose,
      onWin,
      spawnFloatingText,
    ]
  );

  // Handle Swap between two adjacent tiles
  const attemptSwap = useCallback(
    async (r1: number, c1: number, r2: number, c2: number) => {
      if (isResolvingRef.current || outcomeRef.current !== 'playing') return;
      if (r2 < 0 || r2 >= GRID_SIZE || c2 < 0 || c2 >= GRID_SIZE) return;

      const b = boardRef.current;
      const cellA = b[r1][c1];
      const cellB = b[r2][c2];

      if (!isSwappable(cellA) || !isSwappable(cellB)) {
        soundEngine.playInvalidSwap();
        setSelected(null);
        return;
      }

      isResolvingRef.current = true;
      setIsResolving(true);
      setSelected(null);
      setHintCoords([]);
      soundEngine.playSwap();

      // Perform visual swap
      const swapped = cloneBoard(b);
      swapped[r1][c1] = { ...cellB, row: r1, col: c1 };
      swapped[r2][c2] = { ...cellA, row: r2, col: c2 };
      setBoard(swapped);
      await wait(155);
      if (!mountedRef.current) return;

      const newA = swapped[r1][c1];
      const newB = swapped[r2][c2];

      // 1. Prism + Prism (Full Board Clear!)
      if (newA.special === 'prism' && newB.special === 'prism') {
        const nextMoves = Math.max(0, movesRef.current - 1);
        movesRef.current = nextMoves;
        setMovesLeft(nextMoves);

        soundEngine.playPrism();
        triggerShake();
        const allCells: Array<{ row: number; col: number }> = [];
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (!swapped[r][c].isVoid) allCells.push({ row: r, col: c });
          }
        }
        const { nextBoard, gainedScore, objDeltas } = clearCellsWithChain(
          swapped,
          [],
          allCells.map((p) => ({ row: p.row, col: p.col, forceType: 'bomb' as SpecialType })),
          [],
          false
        );
        spawnFloatingText(r2, c2, 'ROYAL NOVA!', 'combo');
        await runCascadesAndFinishTurn(nextBoard, gainedScore + 500, objDeltas, nextMoves);
        return;
      }

      // 2. Prism + Colored Gem or Special
      if (newA.special === 'prism' || newB.special === 'prism') {
        const prismPos = newA.special === 'prism' ? { row: r1, col: c1 } : { row: r2, col: c2 };
        const partner = newA.special === 'prism' ? newB : newA;
        const nextMoves = Math.max(0, movesRef.current - 1);
        movesRef.current = nextMoves;
        setMovesLeft(nextMoves);

        if (partner.special !== 'none' && partner.color) {
          // Convert all gems of partner's color into partner's special and detonate!
          const converted = cloneBoard(swapped);
          const triggers: Array<{ row: number; col: number }> = [prismPos];
          for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
              if (converted[r][c].color === partner.color) {
                converted[r][c].special = partner.special;
                triggers.push({ row: r, col: c });
              }
            }
          }
          const { nextBoard, gainedScore, objDeltas } = clearCellsWithChain(converted, [], triggers, [], false);
          spawnFloatingText(r2, c2, 'PRISM STORM!', 'combo');
          await runCascadesAndFinishTurn(nextBoard, gainedScore + 300, objDeltas, nextMoves);
          return;
        }

        const { nextBoard, gainedScore, objDeltas } = clearCellsWithChain(
          swapped,
          [],
          [{ row: prismPos.row, col: prismPos.col, forceType: 'prism', targetColor: partner.color || undefined }],
          [],
          false
        );
        spawnFloatingText(r2, c2, `PRISM BLAST! +${gainedScore}`, 'combo');
        await runCascadesAndFinishTurn(nextBoard, gainedScore, objDeltas, nextMoves);
        return;
      }

      // 3. Special + Special Combo (Rocket+Rocket, Rocket+Bomb, Bomb+Bomb)
      if (newA.special !== 'none' && newB.special !== 'none') {
        const nextMoves = Math.max(0, movesRef.current - 1);
        movesRef.current = nextMoves;
        setMovesLeft(nextMoves);

        const comboBoard = cloneBoard(swapped);
        const triggers: Array<{ row: number; col: number; forceType?: SpecialType }> = [];

        if (newA.special === 'bomb' && newB.special === 'bomb') {
          // 5x5 mega explosion
          soundEngine.playBomb();
          triggerShake();
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              const rr = r2 + dr;
              const cc = c2 + dc;
              if (rr >= 0 && rr < GRID_SIZE && cc >= 0 && cc < GRID_SIZE) {
                triggers.push({ row: rr, col: cc, forceType: 'bomb' });
              }
            }
          }
          spawnFloatingText(r2, c2, 'MEGA BLAST!', 'combo');
        } else if (newA.special === 'bomb' || newB.special === 'bomb') {
          // Rocket + Bomb: 3 rows & 3 cols!
          soundEngine.playBomb();
          triggerShake();
          for (let offset = -1; offset <= 1; offset++) {
            const rr = Math.max(0, Math.min(GRID_SIZE - 1, r2 + offset));
            const cc = Math.max(0, Math.min(GRID_SIZE - 1, c2 + offset));
            triggers.push({ row: rr, col: c2, forceType: 'rocket_h' });
            triggers.push({ row: r2, col: cc, forceType: 'rocket_v' });
          }
          spawnFloatingText(r2, c2, 'TRIPLE CROSS!', 'combo');
        } else {
          // Rocket + Rocket: Cross!
          triggers.push({ row: r2, col: c2, forceType: 'rocket_h' });
          triggers.push({ row: r2, col: c2, forceType: 'rocket_v' });
          spawnFloatingText(r2, c2, 'CROSS ROCKET!', 'combo');
        }

        const { nextBoard, gainedScore, objDeltas } = clearCellsWithChain(comboBoard, [], triggers, [], false);
        await runCascadesAndFinishTurn(nextBoard, gainedScore + 180, objDeltas, nextMoves);
        return;
      }

      // 4. Single Rocket or Bomb swapped with normal tile
      if (newA.special !== 'none' || newB.special !== 'none') {
        const nextMoves = Math.max(0, movesRef.current - 1);
        movesRef.current = nextMoves;
        setMovesLeft(nextMoves);

        const spPos = newA.special !== 'none' ? { row: r1, col: c1 } : { row: r2, col: c2 };
        const { nextBoard, gainedScore, objDeltas } = clearCellsWithChain(swapped, [], [spPos], [], false);
        spawnFloatingText(spPos.row, spPos.col, `+${gainedScore}`, 'gold');
        await runCascadesAndFinishTurn(nextBoard, gainedScore, objDeltas, nextMoves);
        return;
      }

      // 5. Standard Match-3 Swap
      const clusters = findMatchClusters(swapped, { row: r2, col: c2 });
      if (clusters.length === 0) {
        soundEngine.playInvalidSwap();
        setBoard(b);
        await wait(140);
        if (mountedRef.current) {
          isResolvingRef.current = false;
          setIsResolving(false);
        }
        return;
      }

      const nextMoves = Math.max(0, movesRef.current - 1);
      movesRef.current = nextMoves;
      setMovesLeft(nextMoves);

      soundEngine.playMatch(1);

      const directCells: Array<{ row: number; col: number }> = [];
      const spawns: Array<{ row: number; col: number; color: TileColor; special: SpecialType }> = [];
      clusters.forEach((cl) => {
        cl.cells.forEach((c) => directCells.push(c));
        if (cl.spawnSpecial !== 'none') {
          spawns.push({
            row: cl.anchor.row,
            col: cl.anchor.col,
            color: cl.color,
            special: cl.spawnSpecial,
          });
        }
      });

      const { nextBoard, gainedScore, objDeltas } = clearCellsWithChain(
        swapped,
        directCells,
        [],
        spawns,
        true
      );
      spawnFloatingText(r2, c2, `+${gainedScore}`, 'gold');
      await runCascadesAndFinishTurn(nextBoard, gainedScore, objDeltas, nextMoves);
    },
    [clearCellsWithChain, runCascadesAndFinishTurn, spawnFloatingText, triggerShake]
  );

  // Trigger a single Special piece directly by double-clicking/tapping it
  const triggerSpecialDirectly = useCallback(
    async (row: number, col: number) => {
      if (isResolvingRef.current || outcomeRef.current !== 'playing') return;
      const cell = boardRef.current[row][col];
      if (cell.special === 'none' || cell.obstacle === 'ice') return;

      isResolvingRef.current = true;
      setIsResolving(true);
      setSelected(null);
      setHintCoords([]);

      const nextMoves = Math.max(0, movesRef.current - 1);
      movesRef.current = nextMoves;
      setMovesLeft(nextMoves);

      const { nextBoard, gainedScore, objDeltas } = clearCellsWithChain(
        boardRef.current,
        [],
        [{ row, col }],
        [],
        false
      );
      spawnFloatingText(row, col, `+${gainedScore}`, 'gold');
      await runCascadesAndFinishTurn(nextBoard, gainedScore, objDeltas, nextMoves);
    },
    [clearCellsWithChain, runCascadesAndFinishTurn, spawnFloatingText]
  );

  // Apply In-Game Boosters (Hammer / Cross Cannon / Shuffle)
  const handleCellWithBooster = useCallback(
    async (row: number, col: number, booster: 'hammer' | 'cannon') => {
      if (isResolvingRef.current || outcomeRef.current !== 'playing') return;
      const target = boardRef.current[row][col];
      if (target.isVoid) return;

      isResolvingRef.current = true;
      setIsResolving(true);
      setArmedBooster(null);
      setSelected(null);
      onUseBooster(booster);

      if (booster === 'hammer') {
        soundEngine.playBomb();
        triggerShake();
        const singleBoard = cloneBoard(boardRef.current);
        const c = singleBoard[row][col];
        const deltas: Record<string, number> = {};
        let pts = 80;
        const incObj = (type: 'color' | 'crate' | 'ice' | 'stone', color?: TileColor | null) => {
          level.objectives.forEach((o) => {
            if (o.type === type && (type !== 'color' || o.color === color)) {
              deltas[o.id] = (deltas[o.id] || 0) + 1;
            }
          });
        };
        if (c.obstacle === 'crate') incObj('crate');
        else if (c.obstacle === 'stone') incObj('stone');
        else if (c.obstacle === 'ice') {
          incObj('ice');
          if (c.color) incObj('color', c.color);
        } else if (c.color) {
          incObj('color', c.color);
        }

        if (c.special !== 'none') {
          const res = clearCellsWithChain(singleBoard, [], [{ row, col }], [], false);
          spawnFloatingText(row, col, `HAMMER! +${res.gainedScore}`, 'emerald');
          await runCascadesAndFinishTurn(res.nextBoard, res.gainedScore, res.objDeltas, movesRef.current);
          return;
        }

        spawnParticlesForCells([{ row, col, color: c.color || 'yellow' }]);
        singleBoard[row][col] = {
          ...c,
          id: genTileId(),
          color: null,
          special: 'none',
          obstacle: 'none',
          obstacleHp: 0,
        };
        spawnFloatingText(row, col, `SMASH! +${pts}`, 'emerald');
        await runCascadesAndFinishTurn(singleBoard, pts, deltas, movesRef.current);
        return;
      }

      // Cross Cannon: fires both horizontal and vertical rockets from (row, col) without costing a move!
      soundEngine.playRocket();
      triggerShake();
      const { nextBoard, gainedScore, objDeltas } = clearCellsWithChain(
        boardRef.current,
        [],
        [
          { row, col, forceType: 'rocket_h' },
          { row, col, forceType: 'rocket_v' },
        ],
        [],
        false
      );
      spawnFloatingText(row, col, `CANNON BLAST! +${gainedScore}`, 'combo');
      await runCascadesAndFinishTurn(nextBoard, gainedScore, objDeltas, movesRef.current);
    },
    [
      clearCellsWithChain,
      level.objectives,
      onUseBooster,
      runCascadesAndFinishTurn,
      spawnFloatingText,
      spawnParticlesForCells,
      triggerShake,
    ]
  );

  const handleShuffleBooster = useCallback(async () => {
    if (isResolvingRef.current || outcomeRef.current !== 'playing') return;
    if (progress.boosters.shuffle <= 0) return;
    isResolvingRef.current = true;
    setIsResolving(true);
    onUseBooster('shuffle');
    soundEngine.playSpecialCreate();
    setShuffleNotice(true);
    const shuffled = shuffleBoardTiles(boardRef.current, level);
    setBoard(shuffled);
    await wait(350);
    if (mountedRef.current) {
      setShuffleNotice(false);
      isResolvingRef.current = false;
      setIsResolving(false);
    }
  }, [level, onUseBooster, progress.boosters.shuffle]);

  const handleTilePointerDown = (row: number, col: number, e: React.PointerEvent) => {
    if (isResolvingRef.current || outcomeRef.current !== 'playing') return;
    pointerStartRef.current = { row, col, x: e.clientX, y: e.clientY };
  };

  const handleTilePointerMove = (e: React.PointerEvent) => {
    const start = pointerStartRef.current;
    if (!start || isResolvingRef.current || armedBooster) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const threshold = 20;
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;

    pointerStartRef.current = null;
    if (Math.abs(dx) > Math.abs(dy)) {
      attemptSwap(start.row, start.col, start.row, start.col + (dx > 0 ? 1 : -1));
    } else {
      attemptSwap(start.row, start.col, start.row + (dy > 0 ? 1 : -1), start.col);
    }
  };

  const handleTileClick = (row: number, col: number) => {
    pointerStartRef.current = null;
    if (isResolvingRef.current || outcomeRef.current !== 'playing') return;

    if (armedBooster) {
      handleCellWithBooster(row, col, armedBooster);
      return;
    }

    const clickedCell = boardRef.current[row][col];
    if (clickedCell.isVoid) return;

    if (!selected) {
      if (isSwappable(clickedCell)) {
        soundEngine.playClick();
        setSelected({ row, col });
      } else {
        soundEngine.playInvalidSwap();
      }
      return;
    }

    if (selected.row === row && selected.col === col) {
      if (clickedCell.special !== 'none') {
        triggerSpecialDirectly(row, col);
      } else {
        setSelected(null);
      }
      return;
    }

    const dist = Math.abs(selected.row - row) + Math.abs(selected.col - col);
    if (dist === 1) {
      attemptSwap(selected.row, selected.col, row, col);
    } else if (isSwappable(clickedCell)) {
      soundEngine.playClick();
      setSelected({ row, col });
    } else {
      setSelected(null);
    }
  };

  const currentStarsEarned = useMemo(() => {
    let earned = 0;
    for (const th of level.starThresholds) {
      if (score >= th) earned += 1;
    }
    return earned;
  }, [level.starThresholds, score]);

  useEffect(() => {
    if (currentStarsEarned > prevStarsRef.current && outcomeRef.current === 'playing') {
      soundEngine.playStarEarn(currentStarsEarned - 1);
    }
    prevStarsRef.current = currentStarsEarned;
  }, [currentStarsEarned]);

  const starProgressPct = useMemo(() => {
    const maxStar = level.starThresholds[2];
    return Math.min(100, Math.round((score / maxStar) * 100));
  }, [level.starThresholds, score]);

  const nextStarInfo = useMemo(() => {
    if (currentStarsEarned >= 3) return 'All 3 Stars Unlocked!';
    const nextThreshold = level.starThresholds[currentStarsEarned];
    const remaining = Math.max(0, nextThreshold - score);
    return `${remaining.toLocaleString()} pts to ${currentStarsEarned + 1}★`;
  }, [currentStarsEarned, level.starThresholds, score]);

  const hintSet = useMemo(
    () => new Set(hintCoords.map((h) => `${h.row},${h.col}`)),
    [hintCoords]
  );

  return (
    <div
      className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 pb-4 pt-1 flex flex-col lg:grid lg:grid-cols-12 gap-3 sm:gap-5 items-center lg:items-start justify-center"
      onPointerUp={() => {
        pointerStartRef.current = null;
      }}
    >
      {/* Left / Top HUD Column */}
      <aside className="w-full lg:col-span-4 flex flex-col gap-3">
        {/* Level Banner & Moves + Pause */}
        <div className="bg-slate-900/95 border-2 border-amber-400/40 rounded-3xl p-3.5 sm:p-4 shadow-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 shadow-inner shrink-0 ${
                movesLeft <= 5
                  ? 'bg-rose-950 border-rose-400 text-rose-200'
                  : 'bg-indigo-950 border-amber-400 text-amber-200'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider leading-none">Moves</span>
              <span className="font-num text-2xl font-bold leading-tight">{movesLeft}</span>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Level {level.id} · {level.difficulty}
              </div>
              <h1 className="font-display text-lg sm:text-xl font-bold text-white leading-tight">
                {level.name}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={onPause}
            aria-label="Pause Level"
            className="w-11 h-11 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-white cursor-pointer shrink-0"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>

        {/* Objectives & Visual Star-Meter Panel */}
        <div className="bg-slate-900/95 border-2 border-slate-700/80 rounded-3xl p-3.5 sm:p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Star Meter
            </span>
            <div className="flex items-center gap-2">
              <span className="font-num text-[11px] font-semibold text-slate-300">
                {nextStarInfo}
              </span>
              <span className="font-num text-xs font-bold text-amber-300">
                {score.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Visual Star-Meter Track with Milestone Crests */}
          <div
            className="relative pt-1 pb-5 mb-2"
            role="progressbar"
            aria-label="Star meter progress"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={level.starThresholds[2]}
          >
            {/* Track Background */}
            <div className="relative h-4 bg-slate-950 rounded-full overflow-hidden border-2 border-slate-800 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-emerald-400 transition-[width] duration-300 ease-out relative"
                style={{ width: `${starProgressPct}%` }}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-white/40 rounded-full" />
              </div>

              {/* Milestone Tick Dividers */}
              {level.starThresholds.slice(0, 2).map((th) => {
                const posPct = Math.min(96, Math.round((th / level.starThresholds[2]) * 100));
                return (
                  <div
                    key={`tick-${th}`}
                    style={{ left: `${posPct}%` }}
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-900/80"
                  />
                );
              })}
            </div>

            {/* Positioned 1★, 2★, 3★ Badges */}
            {level.starThresholds.map((th, idx) => {
              const posPct =
                idx === 2 ? 98 : Math.min(92, Math.max(12, Math.round((th / level.starThresholds[2]) * 100)));
              const unlocked = score >= th;

              return (
                <div
                  key={`star-node-${th}`}
                  style={{ left: `${posPct}%` }}
                  className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-md transition-transform duration-200 ${
                      unlocked
                        ? 'bg-gradient-to-b from-yellow-300 to-amber-500 border-amber-100 shadow-[0_0_12px_rgba(250,204,21,0.85)] animate-star-pop'
                        : 'bg-slate-900 border-slate-600'
                    }`}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        unlocked ? 'text-amber-950 fill-amber-950' : 'text-slate-500'
                      }`}
                    />
                  </div>
                  <span
                    className={`font-num text-[10px] mt-0.5 leading-none ${
                      unlocked ? 'text-yellow-300 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {th}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Level Objectives
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
            {level.objectives.map((obj) => {
              const current = objProgress[obj.id] || 0;
              const remaining = Math.max(0, obj.target - current);
              const done = remaining === 0;

              return (
                <div
                  key={obj.id}
                  className={`flex items-center justify-between rounded-2xl px-3 py-2 border transition-colors ${
                    done
                      ? 'bg-emerald-950/60 border-emerald-500/50'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 shrink-0">
                      {obj.type === 'color' && obj.color ? (
                        <GemSvg color={obj.color} />
                      ) : (
                        <ObstacleSvg
                          obstacle={obj.type === 'crate' ? 'crate' : obj.type === 'ice' ? 'ice' : 'stone'}
                        />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {obj.type === 'color' && obj.color
                        ? COLOR_PALETTE[obj.color].label
                        : obj.label}
                    </span>
                  </div>
                  {done ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="font-num text-sm font-bold text-white shrink-0 ml-1">
                      {remaining}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop Booster Bar (hidden on tiny mobile, shown below board on mobile) */}
        <div className="hidden lg:flex flex-col gap-2 bg-slate-900/95 border-2 border-slate-700/80 rounded-3xl p-4 shadow-xl">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Royal Boosters
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isResolving || progress.boosters.hammer <= 0}
              onClick={() => setArmedBooster((b) => (b === 'hammer' ? null : 'hammer'))}
              className={`rounded-2xl p-2.5 border-2 flex flex-col items-center gap-1 transition-all ${
                armedBooster === 'hammer'
                  ? 'bg-amber-500 border-white text-slate-950 scale-105 cursor-pointer'
                  : progress.boosters.hammer > 0
                    ? 'bg-slate-950 border-amber-400/40 text-white hover:bg-slate-800 cursor-pointer'
                    : 'bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Hammer className="w-5 h-5" />
              <span className="text-[11px] font-bold">Hammer</span>
              <span className="font-num text-xs font-bold">×{progress.boosters.hammer}</span>
            </button>

            <button
              type="button"
              disabled={isResolving || progress.boosters.cannon <= 0}
              onClick={() => setArmedBooster((b) => (b === 'cannon' ? null : 'cannon'))}
              className={`rounded-2xl p-2.5 border-2 flex flex-col items-center gap-1 transition-all ${
                armedBooster === 'cannon'
                  ? 'bg-sky-400 border-white text-slate-950 scale-105 cursor-pointer'
                  : progress.boosters.cannon > 0
                    ? 'bg-slate-950 border-sky-400/40 text-white hover:bg-slate-800 cursor-pointer'
                    : 'bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Crosshair className="w-5 h-5" />
              <span className="text-[11px] font-bold">Cannon</span>
              <span className="font-num text-xs font-bold">×{progress.boosters.cannon}</span>
            </button>

            <button
              type="button"
              disabled={isResolving || progress.boosters.shuffle <= 0}
              onClick={handleShuffleBooster}
              className={`rounded-2xl p-2.5 border-2 flex flex-col items-center gap-1 transition-all ${
                progress.boosters.shuffle > 0
                  ? 'bg-slate-950 border-emerald-400/40 text-white hover:bg-slate-800 cursor-pointer'
                  : 'bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Shuffle className="w-5 h-5" />
              <span className="text-[11px] font-bold">Shuffle</span>
              <span className="font-num text-xs font-bold">×{progress.boosters.shuffle}</span>
            </button>
          </div>
          {armedBooster && (
            <p className="text-xs text-amber-300 font-semibold text-center mt-1">
              Tap any board tile to trigger {armedBooster === 'hammer' ? 'Royal Hammer' : 'Cross Cannon'}!
            </p>
          )}
        </div>
      </aside>

      {/* Center 8x8 Match-3 Board */}
      <section className="w-full lg:col-span-8 flex flex-col items-center justify-center">
        <div
          className={`relative w-full max-w-[520px] aspect-square bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950 p-2 sm:p-3.5 rounded-[28px] border-4 border-amber-400/70 shadow-[0_18px_50px_rgba(0,0,0,0.75)] select-none touch-none ${
            boardShaking ? 'animate-board-shake' : ''
          }`}
        >
          {/* Shuffle / Armed Booster Banner */}
          {shuffleNotice && (
            <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 z-30 bg-slate-950/90 border-2 border-amber-400 rounded-2xl py-3 px-4 text-center shadow-2xl animate-pop-in">
              <span className="font-display text-lg font-bold text-amber-300">
                Reshuffling Kingdom Gems...
              </span>
            </div>
          )}

          {/* 8x8 Grid */}
          <div className="grid grid-cols-8 grid-rows-8 gap-1 sm:gap-1.5 w-full h-full relative">
            {board.map((rowArr, r) =>
              rowArr.map((cell, c) => {
                if (cell.isVoid) {
                  return <div key={`void-${r}-${c}`} className="w-full h-full rounded-xl bg-transparent" />;
                }

                const isSel = selected?.row === r && selected?.col === c;
                const isHinted = hintSet.has(`${r},${c}`);
                const swappable = isSwappable(cell);

                return (
                  <button
                    key={cell.id}
                    type="button"
                    aria-label={`Row ${r + 1} Column ${c + 1} ${cell.color || cell.obstacle}`}
                    onPointerDown={(e) => handleTilePointerDown(r, c, e)}
                    onPointerMove={handleTilePointerMove}
                    onClick={() => handleTileClick(r, c)}
                    className={`relative w-full h-full rounded-xl flex items-center justify-center p-1 transition-transform duration-150 ${
                      (r + c) % 2 === 0 ? 'bg-slate-800/75' : 'bg-slate-800/45'
                    } ${
                      isSel
                        ? 'ring-3 ring-yellow-300 bg-amber-400/20 scale-108 z-10 shadow-[0_0_16px_rgba(253,224,71,0.7)]'
                        : armedBooster
                          ? 'hover:ring-2 hover:ring-amber-300 cursor-crosshair'
                          : swappable
                            ? 'hover:brightness-110 active:scale-95 cursor-pointer'
                            : 'cursor-default'
                    } ${cell.isNew ? 'animate-tile-drop' : ''} ${isHinted ? 'animate-pulse-hint ring-2 ring-emerald-300' : ''}`}
                  >
                    {/* Base Gem */}
                    {cell.color && cell.special !== 'prism' && (
                      <GemSvg color={cell.color} className="w-full h-full drop-shadow-[0_3px_4px_rgba(0,0,0,0.45)]" />
                    )}

                    {/* Special Power-up Overlay */}
                    {cell.special !== 'none' && (
                      <SpecialOverlaySvg special={cell.special} color={cell.color} />
                    )}

                    {/* Obstacle Overlay */}
                    {cell.obstacle !== 'none' && (
                      <div className="absolute inset-0 p-0.5 pointer-events-none">
                        <ObstacleSvg obstacle={cell.obstacle} />
                      </div>
                    )}
                  </button>
                );
              })
            )}

            {/* Beam & Explosion Effects Overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-20">
              {effects.map((eff) => {
                if (eff.type === 'beam_h') {
                  return (
                    <div
                      key={eff.id}
                      style={{ top: `${((eff.row + 0.2) / GRID_SIZE) * 100}%`, height: `${(0.6 / GRID_SIZE) * 100}%` }}
                      className="absolute inset-x-0 bg-gradient-to-r from-amber-300 via-white to-amber-300 rounded-full shadow-[0_0_24px_#fbbf24] animate-beam-h"
                    />
                  );
                }
                if (eff.type === 'beam_v') {
                  return (
                    <div
                      key={eff.id}
                      style={{ left: `${((eff.col + 0.2) / GRID_SIZE) * 100}%`, width: `${(0.6 / GRID_SIZE) * 100}%` }}
                      className="absolute inset-y-0 bg-gradient-to-b from-amber-300 via-white to-amber-300 rounded-full shadow-[0_0_24px_#fbbf24] animate-beam-v"
                    />
                  );
                }
                return (
                  <div
                    key={eff.id}
                    style={{
                      left: `${((eff.col + 0.5) / GRID_SIZE) * 100}%`,
                      top: `${((eff.row + 0.5) / GRID_SIZE) * 100}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-radial from-white via-amber-400/80 to-transparent animate-pop-in"
                  />
                );
              })}

              {/* Particle Bursts */}
              {particles.map((p) => (
                <div
                  key={p.id}
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: p.color,
                    transform: `translate(${p.dx * 4}px, ${p.dy * 4}px) scale(0.4)`,
                    transition: 'transform 400ms ease-out, opacity 400ms ease-out',
                  }}
                  className="absolute rounded-full shadow-sm opacity-90"
                />
              ))}

              {/* Floating Score Texts */}
              {floatingTexts.map((ft) => (
                <div
                  key={ft.id}
                  style={{
                    left: `${((ft.col + 0.5) / GRID_SIZE) * 100}%`,
                    top: `${((ft.row + 0.2) / GRID_SIZE) * 100}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 font-display font-bold text-sm sm:text-lg whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] animate-pop-in ${
                    ft.tone === 'combo'
                      ? 'text-yellow-300 scale-110'
                      : ft.tone === 'emerald'
                        ? 'text-emerald-300'
                        : 'text-white'
                  }`}
                >
                  {ft.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Booster Bar + Quick Hint button */}
        <div className="w-full max-w-[520px] mt-3 flex items-center justify-between gap-2 lg:hidden">
          <button
            type="button"
            disabled={isResolving || progress.boosters.hammer <= 0}
            onClick={() => setArmedBooster((b) => (b === 'hammer' ? null : 'hammer'))}
            className={`flex-1 py-2.5 px-3 rounded-2xl border-2 flex items-center justify-center gap-1.5 text-xs font-bold ${
              armedBooster === 'hammer'
                ? 'bg-amber-400 border-white text-slate-950'
                : progress.boosters.hammer > 0
                  ? 'bg-slate-900 border-amber-400/40 text-white'
                  : 'bg-slate-900/50 border-slate-800 text-slate-600'
            }`}
          >
            <Hammer className="w-4 h-4" />
            <span>Hammer</span>
            <span className="font-num">×{progress.boosters.hammer}</span>
          </button>

          <button
            type="button"
            disabled={isResolving || progress.boosters.cannon <= 0}
            onClick={() => setArmedBooster((b) => (b === 'cannon' ? null : 'cannon'))}
            className={`flex-1 py-2.5 px-3 rounded-2xl border-2 flex items-center justify-center gap-1.5 text-xs font-bold ${
              armedBooster === 'cannon'
                ? 'bg-sky-400 border-white text-slate-950'
                : progress.boosters.cannon > 0
                  ? 'bg-slate-900 border-sky-400/40 text-white'
                  : 'bg-slate-900/50 border-slate-800 text-slate-600'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            <span>Cannon</span>
            <span className="font-num">×{progress.boosters.cannon}</span>
          </button>

          <button
            type="button"
            disabled={isResolving || progress.boosters.shuffle <= 0}
            onClick={handleShuffleBooster}
            className={`flex-1 py-2.5 px-3 rounded-2xl border-2 flex items-center justify-center gap-1.5 text-xs font-bold ${
              progress.boosters.shuffle > 0
                ? 'bg-slate-900 border-emerald-400/40 text-white'
                : 'bg-slate-900/50 border-slate-800 text-slate-600'
            }`}
          >
            <Shuffle className="w-4 h-4" />
            <span>Shuffle</span>
            <span className="font-num">×{progress.boosters.shuffle}</span>
          </button>
        </div>

        {/* Helpful Hint Trigger & Special Legend */}
        <div className="w-full max-w-[520px] mt-2 flex items-center justify-between gap-2 px-1 text-[11px] text-slate-400">
          <span>4-Match = Rocket · L/T = Bomb · 5-Match = Prism</span>
          <button
            type="button"
            onClick={() => {
              const valid = findValidMoves(boardRef.current);
              if (valid.length > 0) {
                soundEngine.playClick();
                setHintCoords([
                  { row: valid[0].r1, col: valid[0].c1 },
                  { row: valid[0].r2, col: valid[0].c2 },
                ]);
              }
            }}
            className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-semibold cursor-pointer shrink-0"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Hint</span>
          </button>
        </div>
      </section>
    </div>
  );
};
