import type { LaserVFX, ShockwaveVFX, SingularityVFX, FloatingTextVFX } from '../types/game';

interface BoardVFXProps {
  lasers: LaserVFX[];
  shockwaves: ShockwaveVFX[];
  singularities: SingularityVFX[];
  floatingTexts: FloatingTextVFX[];
  cellSize: number;
}

export const BoardVFX: React.FC<BoardVFXProps> = ({
  lasers,
  shockwaves,
  singularities,
  floatingTexts,
  cellSize,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {/* 1. Laser Beams (Pulsars & Gamma Ray Bursts) */}
      {lasers.map(laser => {
        if (laser.type === 'h') {
          const top = laser.index * cellSize + cellSize / 2;
          return (
            <div
              key={laser.id}
              className="absolute left-0 right-0 h-4 -translate-y-1/2 laser-beam-h"
              style={{ top }}
            >
              <div className="w-full h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#00f0ff] opacity-90" />
              <div className="w-full h-1 bg-white mx-auto -mt-2.5 shadow-[0_0_12px_#ffffff]" />
            </div>
          );
        } else if (laser.type === 'v') {
          const left = laser.index * cellSize + cellSize / 2;
          return (
            <div
              key={laser.id}
              className="absolute top-0 bottom-0 w-4 -translate-x-1/2 laser-beam-v"
              style={{ left }}
            >
              <div className="w-full h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#00f0ff] opacity-90" />
              <div className="w-1 h-full bg-white mx-auto -ml-0.5 shadow-[0_0_12px_#ffffff]" />
            </div>
          );
        } else if (laser.type === 'gamma') {
          const center = laser.index * cellSize + cellSize / 2;
          return (
            <div
              key={laser.id}
              className="absolute left-0 right-0 h-24 -translate-y-1/2 laser-beam-h"
              style={{ top: center }}
            >
              <div className="w-full h-full bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-80 shadow-[0_0_40px_#b026ff]" />
              <div className="w-full h-4 bg-gradient-to-r from-transparent via-cyan-300 to-transparent mx-auto -mt-14 shadow-[0_0_25px_#00f0ff]" />
              <div className="w-full h-1 bg-white mx-auto -mt-2.5 shadow-[0_0_15px_#ffffff]" />
            </div>
          );
        }
        return null;
      })}

      {/* 2. Supernova Thermal Shockwaves */}
      {shockwaves.map(wave => {
        const top = wave.row * cellSize + cellSize / 2;
        const left = wave.col * cellSize + cellSize / 2;
        return (
          <div
            key={wave.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 shockwave-blast"
            style={{ top, left, width: cellSize * 3, height: cellSize * 3 }}
          >
            <div className="w-full h-full rounded-full border-4 border-amber-400 bg-radial from-white via-orange-500/40 to-transparent shadow-[0_0_50px_#ff7700]" />
          </div>
        );
      })}

      {/* 3. Singularity / Black Hole Gravitational Inward Pull */}
      {singularities.map(sing => {
        const top = sing.row * cellSize + cellSize / 2;
        const left = sing.col * cellSize + cellSize / 2;
        return (
          <div
            key={sing.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ top, left, width: cellSize * 4, height: cellSize * 4 }}
          >
            <div className="w-full h-full rounded-full border border-violet-500/80 animate-ping opacity-60" />
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/70 singularity-swirl shadow-[inset_0_0_30px_#b026ff]" />
          </div>
        );
      })}

      {/* 4. Floating Score / Combo Badges */}
      {floatingTexts.map(f => {
        const top = f.row * cellSize + cellSize / 2;
        const left = f.col * cellSize + cellSize / 2;
        return (
          <div
            key={f.id}
            className="absolute font-orbitron font-bold text-xs sm:text-sm tracking-wider -translate-x-1/2 -translate-y-1/2 animate-bounce pointer-events-none drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]"
            style={{
              top,
              left,
              color: f.color,
            }}
          >
            {f.text}
          </div>
        );
      })}
    </div>
  );
};
