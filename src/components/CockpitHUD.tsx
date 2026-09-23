import React from 'react';
import { Volume2, VolumeX, Lightbulb, RotateCcw, BookOpen, Layers, Zap } from 'lucide-react';
import type { PlanetType, MissionConfig, GameMode } from '../types/game';
import { CelestialNode } from './CelestialNode';

interface CockpitHUDProps {
  score: number;
  highScore: number;
  movesLeft: number;
  combo: number;
  currentMission: MissionConfig;
  gatheredPlanets: Partial<Record<PlanetType, number>>;
  createdSpecials: number;
  isMuted: boolean;
  gameMode: GameMode;
  onToggleMute: () => void;
  onRestart: () => void;
  onRequestHint: () => void;
  onOpenCodex: () => void;
  onOpenLevelSelect: () => void;
  onToggleGameMode: () => void;
}

export const CockpitHUD: React.FC<CockpitHUDProps> = ({
  score,
  highScore,
  movesLeft,
  combo,
  currentMission,
  gatheredPlanets,
  createdSpecials,
  isMuted,
  gameMode,
  onToggleMute,
  onRestart,
  onRequestHint,
  onOpenCodex,
  onOpenLevelSelect,
  onToggleGameMode,
}) => {
  const isLowMoves = movesLeft <= 5 && gameMode === 'mission';
  const scoreProgress = Math.min(100, Math.floor((score / currentMission.targetScore) * 100));

  return (
    <header className="w-full max-w-4xl mx-auto mb-3 px-3">
      {/* Top Telemetry Bar */}
      <div className="glass-panel rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 border border-cyan-500/30">
        {/* Left: Starship Title & Mode */}
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-extrabold text-sm sm:text-base tracking-wider text-cyan-400">
                COSMIC COLLAPSE
              </span>
              <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                ODYSSEY v1.0
              </span>
            </div>
            <div className="text-[11px] font-mono-code text-slate-400">
              {gameMode === 'mission' ? currentMission.title : 'ENDLESS COSMIC VOYAGE'}
            </div>
          </div>
        </div>

        {/* Center: Monospace Orbit / Moves Counter */}
        <div className="flex items-center gap-4">
          {gameMode === 'mission' ? (
            <div
              className={`px-3 py-1.5 rounded-lg border flex flex-col items-center min-w-[90px] transition-colors ${
                isLowMoves
                  ? 'bg-rose-950/70 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-slate-900/80 border-cyan-500/40 text-cyan-300'
              }`}
            >
              <span className="text-[9px] font-mono-code tracking-widest text-slate-400 uppercase">
                Orbital Moves
              </span>
              <span className="font-orbitron font-black text-xl leading-none mt-0.5">
                {movesLeft}
              </span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-lg border bg-slate-900/80 border-purple-500/40 text-purple-300 flex flex-col items-center min-w-[90px]">
              <span className="text-[9px] font-mono-code tracking-widest text-slate-400 uppercase">
                Flight Time
              </span>
              <span className="font-orbitron font-black text-lg leading-none mt-0.5">
                ENDLESS
              </span>
            </div>
          )}

          {/* Score & Combo */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-code text-slate-400">SCORE:</span>
              <span className="font-orbitron font-bold text-lg sm:text-xl text-amber-300">
                {score.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono-code text-slate-400">
              <span>HI: {highScore.toLocaleString()}</span>
              {combo > 1 && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold animate-pulse">
                  COMBO x{combo}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onRequestHint}
            title="Scan for Celestial Alignment (Hint)"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-cyan-950/80 border border-slate-700 hover:border-cyan-400 text-cyan-300 transition-all hover:scale-105 active:scale-95"
          >
            <Lightbulb size={16} />
          </button>

          <button
            onClick={onOpenCodex}
            title="Cosmic Codex & Rules"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-purple-950/80 border border-slate-700 hover:border-purple-400 text-purple-300 transition-all hover:scale-105 active:scale-95"
          >
            <BookOpen size={16} />
          </button>

          <button
            onClick={onOpenLevelSelect}
            title="Sector / Mission Select"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-500 text-slate-300 transition-all hover:scale-105 active:scale-95"
          >
            <Layers size={16} />
          </button>

          <button
            onClick={onToggleGameMode}
            title={`Switch to ${gameMode === 'mission' ? 'Endless' : 'Mission'} Mode`}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-amber-950/80 border border-slate-700 hover:border-amber-400 text-amber-300 transition-all hover:scale-105 active:scale-95"
          >
            <Zap size={16} />
          </button>

          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-500 text-slate-300 transition-all hover:scale-105 active:scale-95"
          >
            {isMuted ? <VolumeX size={16} className="text-rose-400" /> : <Volume2 size={16} className="text-emerald-400" />}
          </button>

          <button
            onClick={onRestart}
            title="Restart Sector Orbit"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-400 text-slate-300 hover:text-rose-300 transition-all hover:scale-105 active:scale-95"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Planetary Excavation Objectives Bar (Only in Mission Mode) */}
      {gameMode === 'mission' && (
        <div className="glass-panel rounded-xl mt-2 p-2.5 flex flex-wrap items-center justify-between gap-3 border border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs font-mono-code text-cyan-300">
            <span className="font-orbitron font-bold text-slate-400">OBJECTIVES:</span>
          </div>

          {/* Required Planet Extraction Trackers */}
          <div className="flex items-center flex-wrap gap-4">
            {Object.entries(currentMission.requiredPlanets).map(([pType, targetCount]) => {
              const current = gatheredPlanets[pType as PlanetType] || 0;
              const isDone = current >= (targetCount || 0);

              return (
                <div key={pType} className="flex items-center gap-2">
                  <CelestialNode type={pType as PlanetType} size={28} />
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono-code">
                      <span className={isDone ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                        {current} / {targetCount}
                      </span>
                      {isDone && <span className="text-[10px] text-emerald-400">✓</span>}
                    </div>
                    {/* Mini Progress bar */}
                    <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isDone ? 'bg-emerald-400' : 'bg-cyan-400'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.floor((current / (targetCount || 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Special goal tracker if applicable */}
            {currentMission.specialGoal && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full border border-purple-500/80 bg-purple-950/60 flex items-center justify-center text-[10px] font-bold text-purple-300">
                  ★
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono-code">
                    <span
                      className={
                        createdSpecials >= currentMission.specialGoal
                          ? 'text-emerald-400 font-bold'
                          : 'text-purple-300'
                      }
                    >
                      {createdSpecials} / {currentMission.specialGoal}
                    </span>
                  </div>
                  <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                    <div
                      className={`h-full transition-all duration-300 ${
                        createdSpecials >= currentMission.specialGoal
                          ? 'bg-emerald-400'
                          : 'bg-purple-400'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.floor((createdSpecials / currentMission.specialGoal) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Jump Drive Energy (Target Score Progress) */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono-code text-slate-400">ENERGY:</span>
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-amber-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${scoreProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono-code text-cyan-300 min-w-[28px]">
              {scoreProgress}%
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
