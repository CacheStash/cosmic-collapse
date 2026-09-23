export type PlanetType =
  | 'terrestrial' // Earth-like blue/green swirling atmosphere
  | 'gas_giant'   // Jovian amber/orange with equatorial rings
  | 'ice_dwarf'   // Glacial crystalline turquoise
  | 'volcanic'    // Molten cracked obsidian with glowing magma
  | 'toxic'       // Acidic neon lime-green with bubbling cloud layers
  | 'neutron';    // Neutron Core violet sphere with magnetic corona

export type SpecialType =
  | 'none'
  | 'pulsar_h'    // Match-4: Horizontal beam cleaves row
  | 'pulsar_v'    // Match-4: Vertical beam cleaves col
  | 'supernova'   // Match-5 (T/L shape): 3x3 blast shockwave
  | 'singularity';// Match-5 (Line): Black Hole, collapses all of swapped type

export interface Tile {
  id: string;
  row: number;
  col: number;
  type: PlanetType;
  special: SpecialType;
  isMatched?: boolean;
  isHighlighted?: boolean;
  isNew?: boolean;
  animOffsetX?: number;
  animOffsetY?: number;
}

export interface Position {
  row: number;
  col: number;
}

export interface MatchGroup {
  positions: Position[];
  type: PlanetType;
  shape: 'line3' | 'line4_h' | 'line4_v' | 'line5' | 't_shape' | 'l_shape';
  createSpecial?: {
    row: number;
    col: number;
    special: SpecialType;
  };
}

export interface LaserVFX {
  id: string;
  type: 'h' | 'v' | 'gamma';
  index: number; // row or col index
  timestamp: number;
}

export interface ShockwaveVFX {
  id: string;
  row: number;
  col: number;
  timestamp: number;
}

export interface SingularityVFX {
  id: string;
  row: number;
  col: number;
  targetType?: PlanetType;
  timestamp: number;
}

export interface FloatingTextVFX {
  id: string;
  text: string;
  color: string;
  row: number;
  col: number;
  timestamp: number;
}

export interface MissionConfig {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  targetScore: number;
  moves: number;
  requiredPlanets: Partial<Record<PlanetType, number>>;
  specialGoal?: number;
}

export type GameStatus = 'briefing' | 'playing' | 'resolving' | 'victory' | 'gameover';
export type GameMode = 'mission' | 'endless';
