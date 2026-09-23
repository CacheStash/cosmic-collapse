import React, { useState, useRef } from 'react';
import type { Tile, Position, LaserVFX, ShockwaveVFX, SingularityVFX, FloatingTextVFX } from '../types/game';
import { CelestialNode } from './CelestialNode';
import { BoardVFX } from './BoardVFX';

interface GameBoardProps {
  grid: Tile[][];
  selectedPos: Position | null;
  hintPos: [Position, Position] | null;
  isResolving: boolean;
  isShaking: boolean;
  lasers: LaserVFX[];
  shockwaves: ShockwaveVFX[];
  singularities: SingularityVFX[];
  floatingTexts: FloatingTextVFX[];
  onTileClick: (pos: Position) => void;
  onTileSwap: (pos1: Position, pos2: Position) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  grid,
  selectedPos,
  hintPos,
  isResolving,
  isShaking,
  lasers,
  shockwaves,
  singularities,
  floatingTexts,
  onTileClick,
  onTileSwap,
}) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; pos: Position } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Responsive tile size calculation
  // 8 columns. We can adapt from ~46px on small screens to ~64px on larger screens.
  const cellSize = 56; // Standard board cell size

  const handleTouchStart = (e: React.TouchEvent, pos: Position) => {
    if (isResolving) return;
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY, pos });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || isResolving) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    const threshold = 20;

    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      // Swiped!
      let targetRow = touchStart.pos.row;
      let targetCol = touchStart.pos.col;

      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal
        targetCol += dx > 0 ? 1 : -1;
      } else {
        // Vertical
        targetRow += dy > 0 ? 1 : -1;
      }

      if (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
        onTileSwap(touchStart.pos, { row: targetRow, col: targetCol });
      }
    } else {
      // Tap
      onTileClick(touchStart.pos);
    }
    setTouchStart(null);
  };

  // Mouse drag handling
  const handleMouseDown = (e: React.MouseEvent, pos: Position) => {
    if (isResolving) return;
    setTouchStart({ x: e.clientX, y: e.clientY, pos });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!touchStart || isResolving) return;
    const dx = e.clientX - touchStart.x;
    const dy = e.clientY - touchStart.y;
    const threshold = 18;

    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      let targetRow = touchStart.pos.row;
      let targetCol = touchStart.pos.col;

      if (Math.abs(dx) > Math.abs(dy)) {
        targetCol += dx > 0 ? 1 : -1;
      } else {
        targetRow += dy > 0 ? 1 : -1;
      }

      if (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
        onTileSwap(touchStart.pos, { row: targetRow, col: targetCol });
      }
    } else {
      onTileClick(touchStart.pos);
    }
    setTouchStart(null);
  };

  return (
    <div className="relative flex justify-center items-center select-none py-2">
      {/* Outer Cockpit Shield Border */}
      <div
        ref={boardRef}
        className={`relative p-2.5 sm:p-3.5 rounded-2xl glass-panel border-2 border-cyan-500/40 shadow-[0_0_35px_rgba(0,240,255,0.15)] transition-transform ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Corner Telemetry HUD Markers */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

        {/* Board Grid Container */}
        <div
          className="relative grid grid-cols-8 gap-1.5 sm:gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800 shadow-inner"
          style={{ width: cellSize * 8 + 16, height: cellSize * 8 + 16 }}
        >
          {/* Overlay VFX */}
          <BoardVFX
            lasers={lasers}
            shockwaves={shockwaves}
            singularities={singularities}
            floatingTexts={floatingTexts}
            cellSize={cellSize + 2}
          />

          {/* Grid Tiles */}
          {grid.map((row, r) =>
            row.map((tile, c) => {
              const isSelected = selectedPos?.row === r && selectedPos?.col === c;
              const isHint =
                hintPos !== null &&
                ((hintPos[0].row === r && hintPos[0].col === c) ||
                  (hintPos[1].row === r && hintPos[1].col === c));

              return (
                <div
                  key={tile.id}
                  onTouchStart={e => handleTouchStart(e, { row: r, col: c })}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={e => handleMouseDown(e, { row: r, col: c })}
                  onMouseUp={handleMouseUp}
                  className={`relative flex items-center justify-center cursor-pointer rounded-lg transition-all duration-150 ${
                    isHint ? 'ring-2 ring-amber-400/80 ring-offset-1 ring-offset-black animate-pulse' : ''
                  } ${
                    isSelected ? 'bg-cyan-950/40' : 'hover:bg-slate-900/40'
                  }`}
                  style={{ width: cellSize, height: cellSize }}
                >
                  {/* Subtle Grid Coordinates Subscript */}
                  <span className="absolute top-0.5 left-1 text-[8px] font-mono-code text-slate-700/50 pointer-events-none select-none">
                    {r},{c}
                  </span>

                  <CelestialNode
                    type={tile.type}
                    special={tile.special}
                    size={cellSize - 6}
                    isSelected={isSelected}
                    isMatched={tile.isMatched}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
