import { LevelConfig, SpecialType, TileCell, TileColor } from '../types/game';

export const GRID_SIZE = 8;

const ALL_COLORS: TileColor[] = ['red', 'blue', 'green', 'yellow', 'purple'];

let nextTileUid = 1;
export function genTileId(): string {
  nextTileUid += 1;
  return `t-${nextTileUid}-${Math.random().toString(36).slice(2, 6)}`;
}

export function resetTileUid(): void {
  nextTileUid = 1;
}

export function getLevelColors(level: LevelConfig): TileColor[] {
  return ALL_COLORS.slice(0, level.colorsCount);
}

export function randomColor(colors: TileColor[]): TileColor {
  return colors[Math.floor(Math.random() * colors.length)];
}

export function cloneBoard(board: TileCell[][]): TileCell[][] {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

export function isSwappable(cell: TileCell): boolean {
  if (cell.isVoid) return false;
  if (cell.obstacle === 'crate' || cell.obstacle === 'stone' || cell.obstacle === 'ice') return false;
  if (!cell.color && cell.special !== 'prism') return false;
  return true;
}

export function isMatchableColorCell(cell: TileCell): boolean {
  if (cell.isVoid) return false;
  if (cell.obstacle === 'crate' || cell.obstacle === 'stone') return false;
  return cell.color !== null;
}

export interface MatchCluster {
  cells: Array<{ row: number; col: number }>;
  color: TileColor;
  spawnSpecial: SpecialType;
  anchor: { row: number; col: number };
}

export function findMatchClusters(
  board: TileCell[][],
  preferredAnchor?: { row: number; col: number }
): MatchCluster[] {
  const hRuns: Array<{ cells: Array<{ row: number; col: number }>; color: TileColor }> = [];
  const vRuns: Array<{ cells: Array<{ row: number; col: number }>; color: TileColor }> = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    let c = 0;
    while (c < GRID_SIZE) {
      const start = board[r][c];
      if (!isMatchableColorCell(start)) {
        c++;
        continue;
      }
      const color = start.color!;
      const run = [{ row: r, col: c }];
      let k = c + 1;
      while (k < GRID_SIZE && isMatchableColorCell(board[r][k]) && board[r][k].color === color) {
        run.push({ row: r, col: k });
        k++;
      }
      if (run.length >= 3) {
        hRuns.push({ cells: run, color });
      }
      c = k;
    }
  }

  for (let c = 0; c < GRID_SIZE; c++) {
    let r = 0;
    while (r < GRID_SIZE) {
      const start = board[r][c];
      if (!isMatchableColorCell(start)) {
        r++;
        continue;
      }
      const color = start.color!;
      const run = [{ row: r, col: c }];
      let k = r + 1;
      while (k < GRID_SIZE && isMatchableColorCell(board[k][c]) && board[k][c].color === color) {
        run.push({ row: k, col: c });
        k++;
      }
      if (run.length >= 3) {
        vRuns.push({ cells: run, color });
      }
      r = k;
    }
  }

  const allRuns = [
    ...hRuns.map((run, idx) => ({ ...run, dir: 'h' as const, id: idx })),
    ...vRuns.map((run, idx) => ({ ...run, dir: 'v' as const, id: hRuns.length + idx })),
  ];

  if (allRuns.length === 0) return [];

  const parent = allRuns.map((_, i) => i);
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[rb] = ra;
  };

  for (let i = 0; i < allRuns.length; i++) {
    for (let j = i + 1; j < allRuns.length; j++) {
      if (allRuns[i].color !== allRuns[j].color) continue;
      const intersects = allRuns[i].cells.some((c1) =>
        allRuns[j].cells.some((c2) => c1.row === c2.row && c1.col === c2.col)
      );
      if (intersects) {
        union(i, j);
      }
    }
  }

  const groups = new Map<number, typeof allRuns>();
  allRuns.forEach((run, i) => {
    const root = find(i);
    const list = groups.get(root) || [];
    list.push(run);
    groups.set(root, list);
  });

  const clusters: MatchCluster[] = [];

  groups.forEach((groupRuns) => {
    const coordMap = new Map<string, { row: number; col: number }>();
    let maxH = 0;
    let maxV = 0;
    let hasH = false;
    let hasV = false;

    groupRuns.forEach((run) => {
      if (run.dir === 'h') {
        hasH = true;
        maxH = Math.max(maxH, run.cells.length);
      } else {
        hasV = true;
        maxV = Math.max(maxV, run.cells.length);
      }
      run.cells.forEach((cell) => {
        coordMap.set(`${cell.row},${cell.col}`, cell);
      });
    });

    const uniqueCells = Array.from(coordMap.values());
    let spawnSpecial: SpecialType = 'none';

    if (maxH >= 5 || maxV >= 5) {
      spawnSpecial = 'prism';
    } else if (hasH && hasV) {
      spawnSpecial = 'bomb';
    } else if (maxH === 4) {
      spawnSpecial = 'rocket_v';
    } else if (maxV === 4) {
      spawnSpecial = 'rocket_h';
    }

    let anchor = uniqueCells[Math.floor(uniqueCells.length / 2)];
    if (preferredAnchor) {
      const matchedPreferred = uniqueCells.find(
        (c) => c.row === preferredAnchor.row && c.col === preferredAnchor.col
      );
      if (matchedPreferred) {
        anchor = matchedPreferred;
      }
    }

    if (spawnSpecial !== 'none' && board[anchor.row][anchor.col].obstacle === 'ice') {
      const cleanCell = uniqueCells.find((c) => board[c.row][c.col].obstacle === 'none');
      if (cleanCell) anchor = cleanCell;
    }

    clusters.push({
      cells: uniqueCells,
      color: groupRuns[0].color,
      spawnSpecial,
      anchor,
    });
  });

  return clusters;
}

export function findValidMoves(board: TileCell[][]): Array<{ r1: number; c1: number; r2: number; c2: number; score: number }> {
  const moves: Array<{ r1: number; c1: number; r2: number; c2: number; score: number }> = [];

  const testPair = (r1: number, c1: number, r2: number, c2: number) => {
    const a = board[r1][c1];
    const b = board[r2][c2];
    if (!isSwappable(a) || !isSwappable(b)) return;

    if (a.special !== 'none' || b.special !== 'none') {
      const comboBonus = a.special !== 'none' && b.special !== 'none' ? 10 : 5;
      moves.push({ r1, c1, r2, c2, score: comboBonus });
      return;
    }

    if (a.color === b.color) return;

    const copy = cloneBoard(board);
    const tmp = copy[r1][c1];
    copy[r1][c1] = { ...copy[r2][c2], row: r1, col: c1 };
    copy[r2][c2] = { ...tmp, row: r2, col: c2 };

    const clusters = findMatchClusters(copy);
    if (clusters.length > 0) {
      const totalMatched = clusters.reduce((acc, cl) => acc + cl.cells.length + (cl.spawnSpecial !== 'none' ? 4 : 0), 0);
      moves.push({ r1, c1, r2, c2, score: totalMatched });
    }
  };

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (c + 1 < GRID_SIZE) testPair(r, c, r, c + 1);
      if (r + 1 < GRID_SIZE) testPair(r, c, r + 1, c);
    }
  }

  moves.sort((a, b) => b.score - a.score);
  return moves;
}

export function createInitialBoard(level: LevelConfig): TileCell[][] {
  const colors = getLevelColors(level);
  const voidSet = new Set((level.voidCells || []).map(([r, c]) => `${r},${c}`));
  const crateSet = new Set((level.crates || []).map(([r, c]) => `${r},${c}`));
  const iceSet = new Set((level.ices || []).map(([r, c]) => `${r},${c}`));
  const stoneSet = new Set((level.stones || []).map(([r, c]) => `${r},${c}`));

  for (let attempt = 0; attempt < 40; attempt++) {
    const board: TileCell[][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      const row: TileCell[] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        const key = `${r},${c}`;
        if (voidSet.has(key)) {
          row.push({
            id: genTileId(),
            row: r,
            col: c,
            color: null,
            special: 'none',
            obstacle: 'none',
            obstacleHp: 0,
            isVoid: true,
          });
          continue;
        }
        if (crateSet.has(key)) {
          row.push({
            id: genTileId(),
            row: r,
            col: c,
            color: null,
            special: 'none',
            obstacle: 'crate',
            obstacleHp: 1,
            isVoid: false,
          });
          continue;
        }
        if (stoneSet.has(key)) {
          row.push({
            id: genTileId(),
            row: r,
            col: c,
            color: null,
            special: 'none',
            obstacle: 'stone',
            obstacleHp: 1,
            isVoid: false,
          });
          continue;
        }

        const forbidden = new Set<TileColor>();
        if (
          c >= 2 &&
          isMatchableColorCell(row[c - 1]) &&
          isMatchableColorCell(row[c - 2]) &&
          row[c - 1].color === row[c - 2].color
        ) {
          forbidden.add(row[c - 1].color!);
        }
        if (
          r >= 2 &&
          isMatchableColorCell(board[r - 1][c]) &&
          isMatchableColorCell(board[r - 2][c]) &&
          board[r - 1][c].color === board[r - 2][c].color
        ) {
          forbidden.add(board[r - 1][c].color!);
        }

        const available = colors.filter((col) => !forbidden.has(col));
        const chosen = available.length > 0 ? randomColor(available) : randomColor(colors);

        row.push({
          id: genTileId(),
          row: r,
            col: c,
            color: chosen,
            special: 'none',
            obstacle: iceSet.has(key) ? 'ice' : 'none',
            obstacleHp: iceSet.has(key) ? 1 : 0,
            isVoid: false,
          });
      }
      board.push(row);
    }

    if (findValidMoves(board).length > 0) {
      return board;
    }
  }

  const fallback = createSimpleFallbackBoard(level);
  return fallback;
}

function createSimpleFallbackBoard(level: LevelConfig): TileCell[][] {
  const colors = getLevelColors(level);
  const board: TileCell[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row: TileCell[] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      row.push({
        id: genTileId(),
        row: r,
        col: c,
        color: colors[(r * 2 + c) % colors.length],
        special: 'none',
        obstacle: 'none',
        obstacleHp: 0,
        isVoid: false,
      });
    }
    board.push(row);
  }
  return board;
}

export function shuffleBoardTiles(board: TileCell[][], level: LevelConfig): TileCell[][] {
  const colors = getLevelColors(level);

  for (let attempt = 0; attempt < 30; attempt++) {
    const next = cloneBoard(board);
    const swappableCoords: Array<{ r: number; c: number }> = [];
    const pool: Array<{ color: TileColor; special: SpecialType }> = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const cell = next[r][c];
        if (isSwappable(cell) && cell.color) {
          swappableCoords.push({ r, c });
          pool.push({ color: cell.color, special: cell.special });
        }
      }
    }

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    swappableCoords.forEach(({ r, c }, idx) => {
      next[r][c] = {
        ...next[r][c],
        color: pool[idx].color,
        special: pool[idx].special,
        isNew: true,
      };
    });

    if (findMatchClusters(next).length === 0 && findValidMoves(next).length > 0) {
      return next;
    }
  }

  const safe = cloneBoard(board);
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (isSwappable(safe[r][c])) {
        const forbidden = new Set<TileColor>();
        if (c >= 2 && safe[r][c - 1].color && safe[r][c - 1].color === safe[r][c - 2].color) {
          forbidden.add(safe[r][c - 1].color!);
        }
        if (r >= 2 && safe[r - 1][c].color && safe[r - 1][c].color === safe[r - 2][c].color) {
          forbidden.add(safe[r - 1][c].color!);
        }
        const opts = colors.filter((col) => !forbidden.has(col));
        safe[r][c].color = opts.length ? randomColor(opts) : randomColor(colors);
        safe[r][c].isNew = true;
      }
    }
  }
  return safe;
}

export function applyGravityAndRefill(board: TileCell[][], level: LevelConfig): TileCell[][] {
  const next = cloneBoard(board);
  const colors = getLevelColors(level);

  const isBlocker = (cell: TileCell) =>
    cell.isVoid || cell.obstacle === 'crate' || cell.obstacle === 'stone';

  const isMovableGem = (cell: TileCell) =>
    !isBlocker(cell) && cell.obstacle !== 'ice' && (cell.color !== null || cell.special === 'prism');

  const isEmptyPlayable = (cell: TileCell) =>
    !isBlocker(cell) && cell.color === null && cell.special === 'none';

  let moved = true;
  let guard = 0;
  while (moved && guard < 16) {
    moved = false;
    guard++;

    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = GRID_SIZE - 1; r >= 1; r--) {
        if (isEmptyPlayable(next[r][c])) {
          for (let above = r - 1; above >= 0; above--) {
            if (isBlocker(next[above][c]) || next[above][c].obstacle === 'ice') {
              break;
            }
            if (isMovableGem(next[above][c])) {
              const falling = next[above][c];
              next[r][c] = { ...falling, row: r, col: c, isNew: true };
              next[above][c] = {
                id: genTileId(),
                row: above,
                col: c,
                color: null,
                special: 'none',
                obstacle: 'none',
                obstacleHp: 0,
                isVoid: false,
              };
              moved = true;
              break;
            }
          }
        }
      }
    }

    for (let r = GRID_SIZE - 1; r >= 1; r--) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!isEmptyPlayable(next[r][c])) continue;
        const diagCols = c % 2 === 0 ? [c - 1, c + 1] : [c + 1, c - 1];
        for (const dc of diagCols) {
          if (dc >= 0 && dc < GRID_SIZE && isMovableGem(next[r - 1][dc])) {
            const sliding = next[r - 1][dc];
            next[r][c] = { ...sliding, row: r, col: c, isNew: true };
            next[r - 1][dc] = {
              id: genTileId(),
              row: r - 1,
              col: dc,
              color: null,
              special: 'none',
              obstacle: 'none',
              obstacleHp: 0,
              isVoid: false,
            };
            moved = true;
            break;
          }
        }
      }
    }

    for (let c = 0; c < GRID_SIZE; c++) {
      if (isEmptyPlayable(next[0][c])) {
        next[0][c] = {
          id: genTileId(),
          row: 0,
          col: c,
          color: randomColor(colors),
          special: 'none',
          obstacle: 'none',
          obstacleHp: 0,
          isVoid: false,
          isNew: true,
        };
        moved = true;
      }
    }
  }

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (isEmptyPlayable(next[r][c])) {
        next[r][c] = {
          id: genTileId(),
          row: r,
          col: c,
          color: randomColor(colors),
          special: 'none',
          obstacle: 'none',
          obstacleHp: 0,
          isVoid: false,
          isNew: true,
        };
      }
    }
  }

  return next;
}
