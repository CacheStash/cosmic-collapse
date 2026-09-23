import type { MissionConfig } from '../types/game';


export const MISSIONS: MissionConfig[] = [
  {
    id: 1,
    title: 'SECTOR ALPHA: ORBIT INSERTION',
    subtitle: 'Kepler-452 Exoplanet Frontier',
    description: 'Stabilize planetary orbits by mining Terrestrial atmospheres and Jovian gas currents.',
    targetScore: 4000,
    moves: 22,
    requiredPlanets: {
      terrestrial: 18,
      gas_giant: 18,
    },
  },
  {
    id: 2,
    title: 'SECTOR BETA: CRYO-MAGMA RIFT',
    subtitle: 'Thermodynamic Boundary',
    description: 'Extract super-cooled Ice Dwarf crusts and high-energy Volcanic cores to fuel the starship jump-drive.',
    targetScore: 6500,
    moves: 20,
    requiredPlanets: {
      ice_dwarf: 22,
      volcanic: 20,
    },
  },
  {
    id: 3,
    title: 'SECTOR GAMMA: TOXIC NEBULA',
    subtitle: 'Acidic Clouddrift & Magnetic Storm',
    description: 'Clear dense acidic atmosphere layers and stabilize magnetic anomalies from Neutron Cores.',
    targetScore: 9000,
    moves: 20,
    requiredPlanets: {
      toxic: 25,
      neutron: 22,
    },
  },
  {
    id: 4,
    title: 'SECTOR DELTA: PULSAR CATACLYSM',
    subtitle: 'High-Energy Beam Arrays',
    description: 'Line up celestial bodies to trigger 4-planet Pulsar Lasers and pierce through deep space barricades.',
    targetScore: 13000,
    moves: 24,
    requiredPlanets: {
      volcanic: 25,
      gas_giant: 25,
    },
    specialGoal: 3, // Create at least 3 specials
  },
  {
    id: 5,
    title: 'SECTOR OMEGA: SINGULARITY EVENT',
    subtitle: 'Event Horizon Inward Collapse',
    description: 'Align a 5-planet singularity matrix to trigger a cosmic black hole collapse and escape the void.',
    targetScore: 20000,
    moves: 25,
    requiredPlanets: {
      terrestrial: 25,
      neutron: 25,
    },
    specialGoal: 5,
  },
];
