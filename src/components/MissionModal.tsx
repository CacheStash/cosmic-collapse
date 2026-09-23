import type { MissionConfig, PlanetType } from '../types/game';
import { CelestialNode } from './CelestialNode';
import { X, Award, AlertTriangle, Compass, ChevronRight, Play } from 'lucide-react';
import { MISSIONS } from '../data/missions';

interface MissionModalProps {
  type: 'briefing' | 'victory' | 'gameover' | 'codex' | 'level_select';
  currentMission: MissionConfig;
  score: number;
  movesLeft: number;
  gatheredPlanets: Partial<Record<PlanetType, number>>;
  onClose: () => void;
  onStartMission: () => void;
  onNextMission: () => void;
  onRetryMission: () => void;
  onSelectMission: (mission: MissionConfig) => void;
}

export const MissionModal: React.FC<MissionModalProps> = ({
  type,
  currentMission,
  score,
  movesLeft,
  gatheredPlanets,
  onClose,
  onStartMission,
  onNextMission,
  onRetryMission,
  onSelectMission,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      {/* 1. MISSION BRIEFING MODAL */}
      {type === 'briefing' && (
        <div className="glass-panel border-cyan-500/50 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-[0_0_50px_rgba(0,240,255,0.2)]">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
            <div className="flex items-center gap-2 text-cyan-400">
              <Compass className="animate-spin-slow" size={22} />
              <span className="font-orbitron font-extrabold text-sm tracking-wider">
                MISSION BRIEFING
              </span>
            </div>
            <span className="text-xs font-mono-code text-slate-400">
              SEC-{currentMission.id}.0
            </span>
          </div>

          <div className="my-4">
            <h2 className="font-orbitron font-black text-xl text-white tracking-wide">
              {currentMission.title}
            </h2>
            <div className="text-xs font-mono-code text-cyan-300 mt-0.5">
              {currentMission.subtitle}
            </div>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              {currentMission.description}
            </p>
          </div>

          {/* Objectives Summary */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 my-4 space-y-3">
            <div className="text-xs font-mono-code text-slate-400 uppercase tracking-wider">
              Telemetry Directives:
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono-code">MOVES BUDGET:</span>
                <span className="font-orbitron font-bold text-amber-300">
                  {currentMission.moves}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono-code">ENERGY GOAL:</span>
                <span className="font-orbitron font-bold text-cyan-300">
                  {currentMission.targetScore.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-xs text-slate-400 font-mono-code mb-2">
                EXTRACTION QUOTAS:
              </div>
              <div className="flex flex-wrap gap-4">
                {Object.entries(currentMission.requiredPlanets).map(([pType, count]) => (
                  <div key={pType} className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700">
                    <CelestialNode type={pType as PlanetType} size={28} />
                    <span className="text-xs font-mono-code text-slate-200">
                      x{count}
                    </span>
                  </div>
                ))}
                {currentMission.specialGoal && (
                  <div className="flex items-center gap-2 bg-purple-950/60 px-3 py-1.5 rounded-lg border border-purple-500/50">
                    <span className="text-sm text-purple-300 font-bold">★ SPECIALS</span>
                    <span className="text-xs font-mono-code text-purple-200">
                      x{currentMission.specialGoal}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onStartMission}
            className="w-full py-3.5 rounded-xl font-orbitron font-bold text-sm tracking-wider uppercase bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play size={18} />
            ENGAGE THRUSTERS
          </button>
        </div>
      )}

      {/* 2. VICTORY MODAL */}
      {type === 'victory' && (
        <div className="glass-panel border-emerald-500/50 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-[0_0_60px_rgba(16,185,129,0.3)]">
          <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 mb-3 animate-bounce">
            <Award size={36} />
          </div>
          <div className="text-center">
            <div className="text-xs font-mono-code text-emerald-400 tracking-widest uppercase">
              ORBIT STABILIZED
            </div>
            <h2 className="font-orbitron font-black text-2xl text-white mt-1">
              MISSION ACCOMPLISHED!
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              All celestial extraction quotas satisfied. Warp hyperdrive primed for subsequent sector.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 my-5 space-y-2">
            <div className="flex justify-between items-center text-sm font-mono-code">
              <span className="text-slate-400">FINAL SCORE:</span>
              <span className="font-orbitron font-bold text-amber-300 text-lg">
                {score.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm font-mono-code">
              <span className="text-slate-400">ORBITAL MOVES SURPLUS:</span>
              <span className="font-orbitron font-bold text-cyan-300">
                +{movesLeft} moves (+{movesLeft * 250} pts)
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onRetryMission}
              className="flex-1 py-3 rounded-xl font-orbitron font-bold text-xs tracking-wider uppercase bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            >
              REPLAY SECTOR
            </button>
            <button
              onClick={onNextMission}
              className="flex-1 py-3 rounded-xl font-orbitron font-bold text-xs tracking-wider uppercase bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-1.5"
            >
              <span>NEXT SECTOR</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 3. GAME OVER MODAL */}
      {type === 'gameover' && (
        <div className="glass-panel border-rose-500/50 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-[0_0_60px_rgba(244,63,94,0.3)]">
          <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-400 mb-3 animate-pulse">
            <AlertTriangle size={36} />
          </div>
          <div className="text-center">
            <div className="text-xs font-mono-code text-rose-400 tracking-widest uppercase">
              CRITICAL SYSTEM FAILURE
            </div>
            <h2 className="font-orbitron font-black text-2xl text-white mt-1">
              ORBITAL DECAY DETECTED
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Thruster fuel depleted before completing planetary excavation quotas. The vessel has drifted into the void.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 my-5 space-y-2">
            <div className="flex justify-between items-center text-sm font-mono-code">
              <span className="text-slate-400">SCORE ACCRUED:</span>
              <span className="font-orbitron font-bold text-amber-300">
                {score.toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono-code mt-2">
              UNFINISHED QUOTAS:
            </div>
            <div className="flex flex-wrap gap-3 mt-1">
              {Object.entries(currentMission.requiredPlanets).map(([pType, count]) => {
                const current = gatheredPlanets[pType as PlanetType] || 0;
                const isDone = current >= (count || 0);
                return (
                  <div
                    key={pType}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono-code border ${
                      isDone
                        ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                        : 'border-rose-500/40 bg-rose-950/40 text-rose-300'
                    }`}
                  >
                    <span>{pType}:</span>
                    <span>{current}/{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-orbitron font-bold text-xs tracking-wider uppercase bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            >
              DISMISS
            </button>
            <button
              onClick={onRetryMission}
              className="flex-1 py-3 rounded-xl font-orbitron font-bold text-xs tracking-wider uppercase bg-gradient-to-r from-rose-500 to-orange-600 hover:from-rose-400 hover:to-orange-500 text-slate-950 shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all"
            >
              RETRY SECTOR
            </button>
          </div>
        </div>
      )}

      {/* 4. COSMIC CODEX & COMBINATIONS GUIDE MODAL */}
      {type === 'codex' && (
        <div className="glass-panel border-purple-500/50 rounded-2xl max-w-2xl w-full p-6 text-slate-100 max-h-[85vh] overflow-y-auto shadow-[0_0_50px_rgba(176,38,255,0.25)]">
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/30">
            <h2 className="font-orbitron font-black text-lg text-purple-300 flex items-center gap-2">
              <span>COSMIC CODEX & TACTICAL MANUAL</span>
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Section: Celestial Bodies */}
          <div className="mt-4">
            <div className="text-xs font-mono-code text-cyan-400 font-bold uppercase tracking-wider mb-2">
              1. Celestial Bodies (Planetary Nodes)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center gap-3">
                <CelestialNode type="terrestrial" size={38} />
                <div>
                  <div className="font-orbitron font-bold text-xs text-cyan-300">Terrestrial</div>
                  <div className="text-[11px] text-slate-400 leading-tight">Swirling cloud maps & ocean continents.</div>
                </div>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center gap-3">
                <CelestialNode type="gas_giant" size={38} />
                <div>
                  <div className="font-orbitron font-bold text-xs text-amber-300">Gas Giant (Jovian)</div>
                  <div className="text-[11px] text-slate-400 leading-tight">Amber storm bands & equatorial ring.</div>
                </div>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center gap-3">
                <CelestialNode type="ice_dwarf" size={38} />
                <div>
                  <div className="font-orbitron font-bold text-xs text-teal-300">Ice Dwarf (Glacial)</div>
                  <div className="text-[11px] text-slate-400 leading-tight">Crystalline turquoise with reflective sheen.</div>
                </div>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center gap-3">
                <CelestialNode type="volcanic" size={38} />
                <div>
                  <div className="font-orbitron font-bold text-xs text-orange-400">Volcanic (Molten)</div>
                  <div className="text-[11px] text-slate-400 leading-tight">Cracked obsidian crust with magma seams.</div>
                </div>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center gap-3">
                <CelestialNode type="toxic" size={38} />
                <div>
                  <div className="font-orbitron font-bold text-xs text-lime-400">Toxic (Acidic)</div>
                  <div className="text-[11px] text-slate-400 leading-tight">Neon lime with bubbling acid haze.</div>
                </div>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center gap-3">
                <CelestialNode type="neutron" size={38} />
                <div>
                  <div className="font-orbitron font-bold text-xs text-purple-300">Neutron Core</div>
                  <div className="text-[11px] text-slate-400 leading-tight">Ultra-dense violet sphere with magnetic arcs.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Special Celestial Anomalies */}
          <div className="mt-5">
            <div className="text-xs font-mono-code text-amber-400 font-bold uppercase tracking-wider mb-2">
              2. Special Anomalies & Combinations
            </div>
            <div className="space-y-2">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-cyan-500/30 flex items-start gap-3">
                <CelestialNode type="terrestrial" special="pulsar_h" size={38} />
                <div>
                  <div className="font-orbitron font-bold text-xs text-cyan-300">
                    MATCH-4 LINE ➔ PULSAR BEAM
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Emits high-intensity anti-matter laser beam that cleaves an entire row (horizontal) or column (vertical).
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-amber-500/30 flex items-start gap-3">
                <CelestialNode type="volcanic" special="supernova" size={38} />
                <div>
                  <div className="font-orbitron font-bold text-xs text-amber-300">
                    MATCH-5 (T OR L) ➔ SUPERNOVA CORE
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Unstable pulsing star that triggers a 3x3 surrounding zone blast shockwave and screen rumble.
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-purple-500/30 flex items-start gap-3">
                <CelestialNode type="neutron" special="singularity" size={38} />
                <div>
                  <div className="font-orbitron font-bold text-xs text-purple-300">
                    MATCH-5 (LINE) ➔ SINGULARITY / BLACK HOLE
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Gravitational vortex. Swapping with any planet collapses and eradicates all instances of that planet from the entire board!
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-fuchsia-500/30 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-fuchsia-950/80 border border-fuchsia-400 flex items-center justify-center font-orbitron font-black text-xs text-fuchsia-300">
                  COMBO
                </div>
                <div>
                  <div className="font-orbitron font-bold text-xs text-fuchsia-300">
                    PULSAR + SUPERNOVA ➔ GAMMA-RAY BURST
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Eradicates 3 parallel rows and 3 parallel columns simultaneously with high-intensity plasma lasers.
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-indigo-500/30 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-400 flex items-center justify-center font-orbitron font-black text-xs text-indigo-300">
                  EVENT
                </div>
                <div>
                  <div className="font-orbitron font-bold text-xs text-indigo-300">
                    BLACK HOLE + SPECIAL ➔ EVENT HORIZON COLLAPSE
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Converts all instances of the swapped planet into that special element, triggering a massive chain cascade.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-5 py-3 rounded-xl font-orbitron font-bold text-xs tracking-wider uppercase bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 transition-all"
          >
            CLOSE CODEX
          </button>
        </div>
      )}

      {/* 5. LEVEL / SECTOR SELECT MODAL */}
      {type === 'level_select' && (
        <div className="glass-panel border-cyan-500/50 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-[0_0_50px_rgba(0,240,255,0.2)]">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
            <h2 className="font-orbitron font-black text-lg text-cyan-300">
              SECTOR NAVIGATION MATRIX
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-2.5 my-4">
            {MISSIONS.map(m => {
              const isSelected = m.id === currentMission.id;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    onSelectMission(m);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 hover:bg-slate-800/70'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-orbitron font-bold text-sm text-white">
                        {m.title}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-mono-code px-1.5 py-0.2 rounded bg-cyan-400 text-slate-950 font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono-code text-slate-400 mt-0.5">
                      Target: {m.targetScore.toLocaleString()} pts • {m.moves} Moves
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400" />
                </div>
              );
            })}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-orbitron font-bold text-xs tracking-wider uppercase bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            CANCEL
          </button>
        </div>
      )}
    </div>
  );
};
