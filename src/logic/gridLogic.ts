import type { PlanetType, SpecialType, Tile, Position, MatchGroup } from '../types/game';

export const GRID_ROWS = 8;
export const GRID_COLS = 8;

export const PLANET_TYPES: PlanetType[] = [
  'terrestrial',
  'gas_giant',
  'ice_dwarf',
  'volcanic',
  'toxic',
  'neutron',
];

// Helper to create a single tile
export function createTile(
  row: number,
  col: number,
  type?: PlanetType,
  special: SpecialType = 'none'
): Tile {
  const chosenType = type || PLANET_TYPES[Math.floor(Math.random() * PLANET_TYPES.length)];
  return {
    id: `tile-${row}-${col}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    row,
    col,
    type: chosenType,
    special,
    isMatched: false,
    isHighlighted: false,
  };
}

// Generate an 8x8 grid with zero 3-matches on initial load and at least one valid move
export function createInitialGrid(): Tile[][] {
  let grid: Tile[][] = [];
  let attempts = 0;

  do {
    grid = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      const row: Tile[] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        // Exclude types that would create an immediate match-3 with left 2 or top 2
        const forbidden: PlanetType[] = [];
        if (c >= 2 && row[c - 1].type === row[c - 2].type) {
          forbidden.push(row[c - 1].type);
        }
        if (r >= 2 && grid[r - 1][c].type === grid[r - 2][c].type) {
          forbidden.push(grid[r - 1][c].type);
        }

        const available = PLANET_TYPES.filter(t => !forbidden.includes(t));
        const chosen = available[Math.floor(Math.random() * available.length)];
        row.push(createTile(r, c, chosen));
      }
      grid.push(row);
    }
    attempts++;
  } while (!hasPossibleMoves(grid) && attempts < 50);

  return grid;
}

// Check if two positions are adjacent orthogonal neighbors
export function isAdjacent(pos1: Position, pos2: Position): boolean {
  const dr = Math.abs(pos1.row - pos2.row);
  const dc = Math.abs(pos1.col - pos2.col);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

// Clone grid helper
export function cloneGrid(grid: Tile[][]): Tile[][] {
  return grid.map(row => row.map(tile => ({ ...tile })));
}

// Find all matches on the grid
export function findMatches(grid: Tile[][]): MatchGroup[] {
  const matchedPositions = new Set<string>();
  const matchGroups: MatchGroup[] = [];

  const key = (r: number, c: number) => `${r},${c}`;

  // 1. Horizontal matches
  const hLines: Position[][] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    let matchLen = 1;
    for (let c = 0; c < GRID_COLS; c++) {
      const checkNext = c < GRID_COLS - 1 && grid[r][c].type === grid[r][c + 1].type;
      if (checkNext) {
        matchLen++;
      } else {
        if (matchLen >= 3) {
          const line: Position[] = [];
          for (let k = c - matchLen + 1; k <= c; k++) {
            line.push({ row: r, col: k });
          }
          hLines.push(line);
        }
        matchLen = 1;
      }
    }
  }

  // 2. Vertical matches
  const vLines: Position[][] = [];
  for (let c = 0; c < GRID_COLS; c++) {
    let matchLen = 1;
    for (let r = 0; r < GRID_ROWS; r++) {
      const checkNext = r < GRID_ROWS - 1 && grid[r][c].type === grid[r + 1][c].type;
      if (checkNext) {
        matchLen++;
      } else {
        if (matchLen >= 3) {
          const line: Position[] = [];
          for (let k = r - matchLen + 1; k <= r; k++) {
            line.push({ row: k, col: c });
          }
          vLines.push(line);
        }
        matchLen = 1;
      }
    }
  }

  // Detect intersections for T or L shapes (Supernova)
  const usedHLines = new Set<number>();
  const usedVLines = new Set<number>();

  hLines.forEach((hLine, hIdx) => {
    vLines.forEach((vLine, vIdx) => {
      // Check if same planet type
      const hType = grid[hLine[0].row][hLine[0].col].type;
      const vType = grid[vLine[0].row][vLine[0].col].type;
      if (hType === vType) {
        // Find intersection
        const intersection = hLine.find(hp =>
          vLine.some(vp => vp.row === hp.row && vp.col === hp.col)
        );
        if (intersection) {
          usedHLines.add(hIdx);
          usedVLines.add(vIdx);

          const combinedPos: Position[] = [...hLine];
          vLine.forEach(vp => {
            if (!combinedPos.some(p => p.row === vp.row && p.col === vp.col)) {
              combinedPos.push(vp);
            }
          });

          combinedPos.forEach(p => matchedPositions.add(key(p.row, p.col)));

          matchGroups.push({
            positions: combinedPos,
            type: hType,
            shape: 't_shape',
            createSpecial: {
              row: intersection.row,
              col: intersection.col,
              special: 'supernova',
            },
          });
        }
      }
    });
  });

  // Process remaining horizontal lines
  hLines.forEach((hLine, hIdx) => {
    if (usedHLines.has(hIdx)) return;
    const type = grid[hLine[0].row][hLine[0].col].type;
    hLine.forEach(p => matchedPositions.add(key(p.row, p.col)));

    if (hLine.length >= 5) {
      // Match-5 Line: Singularity / Black Hole
      const center = hLine[Math.floor(hLine.length / 2)];
      matchGroups.push({
        positions: hLine,
        type,
        shape: 'line5',
        createSpecial: {
          row: center.row,
          col: center.col,
          special: 'singularity',
        },
      });
    } else if (hLine.length === 4) {
      // Match-4 Line: Pulsar Beam (Horizontal)
      const center = hLine[1];
      matchGroups.push({
        positions: hLine,
        type,
        shape: 'line4_h',
        createSpecial: {
          row: center.row,
          col: center.col,
          special: 'pulsar_h',
        },
      });
    } else {
      matchGroups.push({
        positions: hLine,
        type,
        shape: 'line3',
      });
    }
  });

  // Process remaining vertical lines
  vLines.forEach((vLine, vIdx) => {
    if (usedVLines.has(vIdx)) return;
    const type = grid[vLine[0].row][vLine[0].col].type;
    vLine.forEach(p => matchedPositions.add(key(p.row, p.col)));

    if (vLine.length >= 5) {
      // Match-5 Line: Singularity / Black Hole
      const center = vLine[Math.floor(vLine.length / 2)];
      matchGroups.push({
        positions: vLine,
        type,
        shape: 'line5',
        createSpecial: {
          row: center.row,
          col: center.col,
          special: 'singularity',
        },
      });
    } else if (vLine.length === 4) {
      // Match-4 Line: Pulsar Beam (Vertical)
      const center = vLine[1];
      matchGroups.push({
        positions: vLine,
        type,
        shape: 'line4_v',
        createSpecial: {
          row: center.row,
          col: center.col,
          special: 'pulsar_v',
        },
      });
    } else {
      matchGroups.push({
        positions: vLine,
        type,
        shape: 'line3',
      });
    }
  });

  return matchGroups;
}

// Check if swapping two tiles results in any matches or special activations
export function checkSwapMatch(
  grid: Tile[][],
  pos1: Position,
  pos2: Position
): { isValid: boolean; isSpecialCombo: boolean } {
  const tile1 = grid[pos1.row][pos1.col];
  const tile2 = grid[pos2.row][pos2.col];

  // 1. Any Black Hole swap is ALWAYS valid (with planet or special)
  if (tile1.special === 'singularity' || tile2.special === 'singularity') {
    return { isValid: true, isSpecialCombo: true };
  }

  // 2. Special + Special swap (e.g. Pulsar + Supernova, Pulsar + Pulsar, Supernova + Supernova)
  if (tile1.special !== 'none' && tile2.special !== 'none') {
    return { isValid: true, isSpecialCombo: true };
  }

  // 3. Regular swap: check if matches are produced
  const tempGrid = cloneGrid(grid);
  const temp = tempGrid[pos1.row][pos1.col];
  tempGrid[pos1.row][pos1.col] = tempGrid[pos2.row][pos2.col];
  tempGrid[pos2.row][pos2.col] = temp;

  // Update coords
  tempGrid[pos1.row][pos1.col].row = pos1.row;
  tempGrid[pos1.row][pos1.col].col = pos1.col;
  tempGrid[pos2.row][pos2.col].row = pos2.row;
  tempGrid[pos2.row][pos2.col].col = pos2.col;

  const matches = findMatches(tempGrid);
  return { isValid: matches.length > 0, isSpecialCombo: false };
}

// Find possible valid moves on the grid for hints or deadlock detection
export function findPossibleMove(grid: Tile[][]): [Position, Position] | null {
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const pos1 = { row: r, col: c };

      // Check right neighbor
      if (c < GRID_COLS - 1) {
        const pos2 = { row: r, col: c + 1 };
        if (checkSwapMatch(grid, pos1, pos2).isValid) {
          return [pos1, pos2];
        }
      }

      // Check down neighbor
      if (r < GRID_ROWS - 1) {
        const pos2 = { row: r + 1, col: c };
        if (checkSwapMatch(grid, pos1, pos2).isValid) {
          return [pos1, pos2];
        }
      }
    }
  }
  return null;
}

export function hasPossibleMoves(grid: Tile[][]): boolean {
  return findPossibleMove(grid) !== null;
}

// Gravity & Refill: Drops down tiles into empty spaces and populates new tiles on top
export function applyGravityAndRefill(grid: (Tile | null)[][]): {
  newGrid: Tile[][];
  droppedCount: number;
} {
  const result: Tile[][] = [];
  let droppedCount = 0;

  // Process column by column
  for (let c = 0; c < GRID_COLS; c++) {
    const existingInCol: Tile[] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      const tile = grid[r][c];
      if (tile !== null) {
        existingInCol.push(tile);
      }
    }

    const emptySlots = GRID_ROWS - existingInCol.length;
    droppedCount += emptySlots;

    // Fill new tiles on top
    const newColTiles: Tile[] = [];
    for (let r = 0; r < emptySlots; r++) {
      const newTile = createTile(r, c);
      newTile.isNew = true;
      newColTiles.push(newTile);
    }

    // Existing tiles shift to bottom
    const shiftedColTiles: Tile[] = existingInCol.map((tile, idx) => ({
      ...tile,
      row: emptySlots + idx,
      col: c,
      isNew: false,
    }));

    const fullCol = [...newColTiles, ...shiftedColTiles];

    for (let r = 0; r < GRID_ROWS; r++) {
      if (!result[r]) result[r] = [];
      result[r][c] = fullCol[r];
    }
  }

  return { newGrid: result, droppedCount };
}
