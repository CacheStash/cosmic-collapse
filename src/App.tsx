import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import type {
  Tile,
  Position,
  PlanetType,
  MissionConfig,
  GameStatus,
  GameMode,
  LaserVFX,
  ShockwaveVFX,
  SingularityVFX,
  FloatingTextVFX,
} from './types/game';
import {
  createInitialGrid,
  cloneGrid,
  findMatches,
  isAdjacent,
  checkSwapMatch,
  findPossibleMove,
  applyGravityAndRefill,
  GRID_ROWS,
  GRID_COLS,
  createTile,
} from './logic/gridLogic';
import { MISSIONS } from './data/missions';
import { audioEngine } from './audio/audioEngine';
import { BackgroundStarfield } from './components/BackgroundStarfield';
import { CockpitHUD } from './components/CockpitHUD';
import { GameBoard } from './components/GameBoard';
import { MissionModal } from './components/MissionModal';

export const App: React.FC = () => {
  // Game Setup & Status
  const [currentMission, setCurrentMission] = useState<MissionConfig>(MISSIONS[0]);
  const [gameMode, setGameMode] = useState<GameMode>('mission');
  const [status, setStatus] = useState<GameStatus>('briefing');
  const [modalType, setModalType] = useState<
    'briefing' | 'victory' | 'gameover' | 'codex' | 'level_select' | null
  >('briefing');

  // Board & State
  const [grid, setGrid] = useState<Tile[][]>(() => createInitialGrid());
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [hintPos, setHintPos] = useState<[Position, Position] | null>(null);
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isWarping, setIsWarping] = useState<boolean>(false);

  // Scores & Telemetry
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('cosmic_collapse_hi') || '0', 10);
  });
  const [movesLeft, setMovesLeft] = useState<number>(currentMission.moves);
  const [combo, setCombo] = useState<number>(1);
  const [gatheredPlanets, setGatheredPlanets] = useState<Partial<Record<PlanetType, number>>>({});
  const [createdSpecials, setCreatedSpecials] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // VFX queues
  const [lasers, setLasers] = useState<LaserVFX[]>([]);
  const [shockwaves, setShockwaves] = useState<ShockwaveVFX[]>([]);
  const [singularities, setSingularities] = useState<SingularityVFX[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextVFX[]>([]);

  // Sound initializer ref
  const hasStartedAudio = useRef(false);

  // Start background ambient drone on initial interaction
  const initAudio = () => {
    if (!hasStartedAudio.current) {
      hasStartedAudio.current = true;
      audioEngine.startAmbientDrone();
    }
  };

  // Trigger screen shake
  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  };

  // Add floating score / text VFX
  const addFloatingText = (text: string, row: number, col: number, color = '#00f0ff') => {
    const id = `txt-${Date.now()}-${Math.random()}`;
    setFloatingTexts(prev => [...prev, { id, text, color, row, col, timestamp: Date.now() }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(f => f.id !== id));
    }, 1200);
  };

  // Add Laser VFX
  const triggerLaser = (type: 'h' | 'v' | 'gamma', index: number) => {
    const id = `laser-${Date.now()}-${Math.random()}`;
    setLasers(prev => [...prev, { id, type, index, timestamp: Date.now() }]);
    audioEngine.playPulsarLaser();
    setTimeout(() => {
      setLasers(prev => prev.filter(l => l.id !== id));
    }, 550);
  };

  // Add Shockwave VFX
  const triggerShockwave = (row: number, col: number) => {
    const id = `shock-${Date.now()}-${Math.random()}`;
    setShockwaves(prev => [...prev, { id, row, col, timestamp: Date.now() }]);
    audioEngine.playSupernovaExplosion();
    triggerShake();
    setTimeout(() => {
      setShockwaves(prev => prev.filter(s => s.id !== id));
    }, 650);
  };

  // Add Singularity VFX
  const triggerSingularity = (row: number, col: number, targetType?: PlanetType) => {
    const id = `sing-${Date.now()}-${Math.random()}`;
    setSingularities(prev => [...prev, { id, row, col, targetType, timestamp: Date.now() }]);
    audioEngine.playSingularityVortex();
    triggerShake();
    setTimeout(() => {
      setSingularities(prev => prev.filter(s => s.id !== id));
    }, 900);
  };

  // Update High Score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('cosmic_collapse_hi', score.toString());
    }
  }, [score, highScore]);

  // Check victory / gameover conditions
  const checkMissionStatus = useCallback((
    currentScore: number,
    currentMoves: number,
    planets: Partial<Record<PlanetType, number>>,
    specialsCount: number
  ) => {
    if (gameMode !== 'mission') return;

    // Check Victory
    const allPlanetsDone = Object.entries(currentMission.requiredPlanets).every(
      ([pType, requiredCount]) => (planets[pType as PlanetType] || 0) >= (requiredCount || 0)
    );

    const specialsDone = !currentMission.specialGoal || specialsCount >= currentMission.specialGoal;
    const scoreDone = currentScore >= currentMission.targetScore;

    if (allPlanetsDone && specialsDone && scoreDone) {
      setStatus('victory');
      setModalType('victory');
      audioEngine.playVictoryFanfare();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#ffd700', '#b026ff', '#ffffff'],
      });
      return;
    }

    // Check Failure
    if (currentMoves <= 0) {
      setStatus('gameover');
      setModalType('gameover');
      audioEngine.playDefeat();
    }
  }, [currentMission, gameMode]);

  // Execute Cascade Evaluation Loop
  const resolveCascade = async (
    initialGrid: Tile[][],
    currentComboTier: number = 1
  ): Promise<void> => {
    setIsResolving(true);
    let workingGrid = cloneGrid(initialGrid);
    let comboMultiplier = currentComboTier;

    while (true) {
      const matchGroups = findMatches(workingGrid);
      if (matchGroups.length === 0) {
        break;
      }

      setCombo(comboMultiplier);
      if (comboMultiplier >= 3) {
        setIsWarping(true);
      }

      // Collect all matched positions & specials to create
      const matchedSet = new Set<string>();
      const gatheredThisRound: Partial<Record<PlanetType, number>> = {};
      let specialsAdded = 0;

      matchGroups.forEach(group => {
        group.positions.forEach(p => {
          matchedSet.add(`${p.row},${p.col}`);
        });

        // Tally gathered planets
        gatheredThisRound[group.type] = (gatheredThisRound[group.type] || 0) + group.positions.length;

        // Check if a special node is created
        if (group.createSpecial) {
          specialsAdded++;
        }
      });

      // Award Points
      const basePoints = matchedSet.size * 60;
      const roundScore = basePoints * comboMultiplier;
      setScore(prev => prev + roundScore);

      // Play chime according to combo tier
      audioEngine.playMatchChime(comboMultiplier);

      // Visual text
      const firstPos = matchGroups[0].positions[0];
      const bonusText =
        comboMultiplier > 1
          ? `+${roundScore} (x${comboMultiplier})`
          : `+${roundScore}`;
      addFloatingText(
        bonusText,
        firstPos.row,
        firstPos.col,
        comboMultiplier > 2 ? '#ffd700' : '#00f0ff'
      );

      // Update state tallies
      setGatheredPlanets(prev => {
        const next = { ...prev };
        Object.entries(gatheredThisRound).forEach(([pType, count]) => {
          next[pType as PlanetType] = (next[pType as PlanetType] || 0) + count;
        });
        return next;
      });

      if (specialsAdded > 0) {
        setCreatedSpecials(prev => prev + specialsAdded);
      }

      // Mark matched tiles visually for collapse animation
      const animGrid = cloneGrid(workingGrid);
      matchedSet.forEach(key => {
        const [r, c] = key.split(',').map(Number);
        animGrid[r][c].isMatched = true;
      });
      setGrid(animGrid);
      await new Promise(res => setTimeout(res, 260));

      // Create null grid for gravity refill and place newly created specials
      const sparseGrid: (Tile | null)[][] = animGrid.map(row =>
        row.map(tile => (tile.isMatched ? null : tile))
      );

      // Place newly forged special anomalies
      matchGroups.forEach(group => {
        if (group.createSpecial) {
          const { row, col, special } = group.createSpecial;
          const forgedTile = createTile(row, col, group.type, special);
          sparseGrid[row][col] = forgedTile;
          addFloatingText(
            special === 'singularity'
              ? 'SINGULARITY!'
              : special === 'supernova'
              ? 'SUPERNOVA!'
              : 'PULSAR!',
            row,
            col,
            '#ffd700'
          );
        }
      });

      // Apply Gravity Drop & Spawn Refills
      const { newGrid } = applyGravityAndRefill(sparseGrid);
      workingGrid = newGrid;
      setGrid(workingGrid);
      audioEngine.playTileSlide();

      await new Promise(res => setTimeout(res, 280));
      comboMultiplier++;
    }

    setIsResolving(false);
    setIsWarping(false);
    setCombo(1);

    // Check if board has no valid moves left -> reshuffle
    if (!findPossibleMove(workingGrid)) {
      addFloatingText('GRAVITATIONAL RESHUFFLE', 3, 3, '#b026ff');
      const reshuffled = createInitialGrid();
      setGrid(reshuffled);
    }
  };

  // Special Swap Handler: Singularity, Pulsars, Supernova combos
  const handleSpecialSwap = async (
    pos1: Position,
    pos2: Position,
    tile1: Tile,
    tile2: Tile
  ) => {
    setIsResolving(true);
    let workingGrid = cloneGrid(grid);

    // Swap positions first
    workingGrid[pos1.row][pos1.col] = { ...tile2, row: pos1.row, col: pos1.col };
    workingGrid[pos2.row][pos2.col] = { ...tile1, row: pos2.row, col: pos2.col };
    setGrid(workingGrid);
    audioEngine.playTileSlide();
    await new Promise(res => setTimeout(res, 200));

    const s1 = tile1.special;
    const s2 = tile2.special;

    const sparseGrid: (Tile | null)[][] = workingGrid.map(row => row.map(t => ({ ...t })));
    let pointsToAdd = 0;
    const gathered: Partial<Record<PlanetType, number>> = {};

    // 1. Black Hole + Black Hole: BIG CRUNCH / COSMIC RESET
    if (s1 === 'singularity' && s2 === 'singularity') {
      triggerSingularity(pos1.row, pos1.col);
      triggerSingularity(pos2.row, pos2.col);
      addFloatingText('BIG CRUNCH! COSMIC RESET', 3, 3, '#ffffff');

      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const t = sparseGrid[r][c];
          if (t) {
            gathered[t.type] = (gathered[t.type] || 0) + 1;
            sparseGrid[r][c] = null;
          }
        }
      }
      pointsToAdd += 12000;
    }
    // 2. Black Hole + Special (Pulsar or Supernova): EVENT HORIZON COLLAPSE
    else if (
      (s1 === 'singularity' && s2 !== 'none') ||
      (s2 === 'singularity' && s1 !== 'none')
    ) {
      const specialTile = s1 === 'singularity' ? tile2 : tile1;
      const blackHolePos = s1 === 'singularity' ? pos1 : pos2;
      triggerSingularity(blackHolePos.row, blackHolePos.col);
      addFloatingText('EVENT HORIZON COLLAPSE!', blackHolePos.row, blackHolePos.col, '#b026ff');

      // Convert ALL instances of that planet type into the special
      const targetType = specialTile.type;
      const targetSpecial = specialTile.special;

      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const t = sparseGrid[r][c];
          if (t && t.type === targetType) {
            sparseGrid[r][c] = {
              ...t,
              special: targetSpecial,
            };
          }
        }
      }
      pointsToAdd += 4000;
      setGrid(cloneGrid(sparseGrid as Tile[][]));
      await new Promise(res => setTimeout(res, 400));

      // Now detonate all of them!
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const t = sparseGrid[r][c];
          if (t && t.type === targetType) {
            gathered[t.type] = (gathered[t.type] || 0) + 1;
            sparseGrid[r][c] = null;
            if (targetSpecial === 'supernova') {
              triggerShockwave(r, c);
            } else if (targetSpecial.startsWith('pulsar')) {
              triggerLaser(targetSpecial === 'pulsar_h' ? 'h' : 'v', targetSpecial === 'pulsar_h' ? r : c);
            }
          }
        }
      }
    }
    // 3. Black Hole + Regular Planet: Gravitational Collapse of all instances
    else if (s1 === 'singularity' || s2 === 'singularity') {
      const blackHolePos = s1 === 'singularity' ? pos1 : pos2;
      const targetPlanet = s1 === 'singularity' ? tile2.type : tile1.type;

      triggerSingularity(blackHolePos.row, blackHolePos.col, targetPlanet);
      addFloatingText(`COLLAPSE: ${targetPlanet.toUpperCase()}`, blackHolePos.row, blackHolePos.col, '#00f0ff');

      // Clear black hole
      sparseGrid[blackHolePos.row][blackHolePos.col] = null;

      // Clear all instances of targetPlanet
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const t = sparseGrid[r][c];
          if (t && t.type === targetPlanet) {
            gathered[targetPlanet] = (gathered[targetPlanet] || 0) + 1;
            sparseGrid[r][c] = null;
          }
        }
      }
      pointsToAdd += 3500;
    }
    // 4. Pulsar + Supernova: GAMMA-RAY BURST
    else if (
      (s1.startsWith('pulsar') && s2 === 'supernova') ||
      (s2.startsWith('pulsar') && s1 === 'supernova')
    ) {
      const centerRow = pos2.row;
      const centerCol = pos2.col;
      triggerShockwave(centerRow, centerCol);
      triggerLaser('gamma', centerRow);
      triggerLaser('v', centerCol);
      addFloatingText('GAMMA-RAY BURST!', centerRow, centerCol, '#ffd700');

      // Eradicate 3 rows and 3 columns around the blast
      const rowsToClear = [centerRow - 1, centerRow, centerRow + 1].filter(r => r >= 0 && r < GRID_ROWS);
      const colsToClear = [centerCol - 1, centerCol, centerCol + 1].filter(c => c >= 0 && c < GRID_COLS);

      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          if (rowsToClear.includes(r) || colsToClear.includes(c)) {
            const t = sparseGrid[r][c];
            if (t) {
              gathered[t.type] = (gathered[t.type] || 0) + 1;
              sparseGrid[r][c] = null;
            }
          }
        }
      }
      pointsToAdd += 5000;
    }
    // 5. Pulsar + Pulsar: Cross Beam
    else if (s1.startsWith('pulsar') && s2.startsWith('pulsar')) {
      triggerLaser('h', pos2.row);
      triggerLaser('v', pos2.col);
      addFloatingText('CROSS PULSAR!', pos2.row, pos2.col, '#00f0ff');

      for (let c = 0; c < GRID_COLS; c++) {
        const t = sparseGrid[pos2.row][c];
        if (t) {
          gathered[t.type] = (gathered[t.type] || 0) + 1;
          sparseGrid[pos2.row][c] = null;
        }
      }
      for (let r = 0; r < GRID_ROWS; r++) {
        const t = sparseGrid[r][pos2.col];
        if (t) {
          gathered[t.type] = (gathered[t.type] || 0) + 1;
          sparseGrid[r][pos2.col] = null;
        }
      }
      pointsToAdd += 3000;
    }
    // 6. Supernova + Supernova: Mega Nova 5x5
    else if (s1 === 'supernova' && s2 === 'supernova') {
      triggerShockwave(pos2.row, pos2.col);
      addFloatingText('MEGA NOVA BLAST!', pos2.row, pos2.col, '#ff7700');

      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const r = pos2.row + dr;
          const c = pos2.col + dc;
          if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
            const t = sparseGrid[r][c];
            if (t) {
              gathered[t.type] = (gathered[t.type] || 0) + 1;
              sparseGrid[r][c] = null;
            }
          }
        }
      }
      pointsToAdd += 4500;
    }

    // Update tallies
    setScore(prev => prev + pointsToAdd);
    setGatheredPlanets(prev => {
      const next = { ...prev };
      Object.entries(gathered).forEach(([pType, count]) => {
        next[pType as PlanetType] = (next[pType as PlanetType] || 0) + count;
      });
      return next;
    });

    await new Promise(res => setTimeout(res, 350));

    // Refill and then trigger cascade
    const { newGrid } = applyGravityAndRefill(sparseGrid);
    setGrid(newGrid);
    await new Promise(res => setTimeout(res, 280));
    await resolveCascade(newGrid, 2);
  };

  // Main Tile Swap Handler
  const handleTileSwap = async (pos1: Position, pos2: Position) => {
    if (isResolving || status === 'victory' || status === 'gameover') return;
    initAudio();

    if (!isAdjacent(pos1, pos2)) {
      setSelectedPos(pos2);
      return;
    }

    setHintPos(null);
    setSelectedPos(null);

    const tile1 = grid[pos1.row][pos1.col];
    const tile2 = grid[pos2.row][pos2.col];

    const { isValid, isSpecialCombo } = checkSwapMatch(grid, pos1, pos2);

    if (!isValid) {
      // Invalid Move: perform swap and roll-back animation
      audioEngine.playSwapError();
      const tempGrid = cloneGrid(grid);
      tempGrid[pos1.row][pos1.col] = { ...tile2, row: pos1.row, col: pos1.col };
      tempGrid[pos2.row][pos2.col] = { ...tile1, row: pos2.row, col: pos2.col };
      setGrid(tempGrid);

      setTimeout(() => {
        setGrid(grid);
      }, 250);
      return;
    }

    // Valid move -> decrement movesLeft
    const nextMoves = movesLeft - 1;
    if (gameMode === 'mission') {
      setMovesLeft(nextMoves);
    }

    if (isSpecialCombo) {
      await handleSpecialSwap(pos1, pos2, tile1, tile2);
    } else {
      // Regular swap with match
      audioEngine.playTileSlide();
      const swappedGrid = cloneGrid(grid);
      swappedGrid[pos1.row][pos1.col] = { ...tile2, row: pos1.row, col: pos1.col };
      swappedGrid[pos2.row][pos2.col] = { ...tile1, row: pos2.row, col: pos2.col };
      setGrid(swappedGrid);

      // Check if either tile was a single special anomaly being detonated
      if (tile1.special !== 'none' || tile2.special !== 'none') {
        if (tile1.special === 'pulsar_h' || tile2.special === 'pulsar_h') {
          triggerLaser('h', pos2.row);
        } else if (tile1.special === 'pulsar_v' || tile2.special === 'pulsar_v') {
          triggerLaser('v', pos2.col);
        } else if (tile1.special === 'supernova' || tile2.special === 'supernova') {
          triggerShockwave(pos2.row, pos2.col);
        }
      }

      await new Promise(res => setTimeout(res, 200));
      await resolveCascade(swappedGrid, 1);
    }

    // Check mission status
    checkMissionStatus(score, nextMoves, gatheredPlanets, createdSpecials);
  };

  // Tile Click handler
  const handleTileClick = (pos: Position) => {
    initAudio();
    if (isResolving || status === 'victory' || status === 'gameover') return;

    if (!selectedPos) {
      setSelectedPos(pos);
    } else if (selectedPos.row === pos.row && selectedPos.col === pos.col) {
      setSelectedPos(null);
    } else if (isAdjacent(selectedPos, pos)) {
      handleTileSwap(selectedPos, pos);
    } else {
      setSelectedPos(pos);
    }
  };

  // Request Hint
  const handleRequestHint = () => {
    initAudio();
    const hint = findPossibleMove(grid);
    if (hint) {
      setHintPos(hint);
      audioEngine.playMatchChime(1);
      setTimeout(() => setHintPos(null), 3000);
    } else {
      addFloatingText('NO ALIGNMENTS FOUND', 3, 3, '#f43f5e');
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    initAudio();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioEngine.setMute(nextMuted);
  };

  // Reset Game
  const resetGame = (mission: MissionConfig = currentMission) => {
    initAudio();
    setGrid(createInitialGrid());
    setSelectedPos(null);
    setHintPos(null);
    setMovesLeft(mission.moves);
    setScore(0);
    setGatheredPlanets({});
    setCreatedSpecials(0);
    setStatus('playing');
    setModalType(null);
  };

  // Next Mission
  const handleNextMission = () => {
    const nextIdx = (currentMission.id % MISSIONS.length);
    const nextMission = MISSIONS[nextIdx];
    setCurrentMission(nextMission);
    resetGame(nextMission);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between py-3 px-2 sm:px-4 text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* Dynamic 3D WebGL Background Starfield */}
      <BackgroundStarfield isWarping={isWarping} />

      {/* Cockpit HUD */}
      <CockpitHUD
        score={score}
        highScore={highScore}
        movesLeft={movesLeft}
        combo={combo}
        currentMission={currentMission}
        gatheredPlanets={gatheredPlanets}
        createdSpecials={createdSpecials}
        isMuted={isMuted}
        gameMode={gameMode}
        onToggleMute={handleToggleMute}
        onRestart={() => resetGame()}
        onRequestHint={handleRequestHint}
        onOpenCodex={() => setModalType('codex')}
        onOpenLevelSelect={() => setModalType('level_select')}
        onToggleGameMode={() => {
          const nextMode = gameMode === 'mission' ? 'endless' : 'mission';
          setGameMode(nextMode);
          addFloatingText(
            nextMode === 'endless' ? 'MODE: ENDLESS VOYAGE' : 'MODE: PLANETARY EXCAVATION',
            3,
            3,
            '#00f0ff'
          );
        }}
      />

      {/* Main Game Board */}
      <main className="flex-1 flex flex-col items-center justify-center z-10">
        <GameBoard
          grid={grid}
          selectedPos={selectedPos}
          hintPos={hintPos}
          isResolving={isResolving}
          isShaking={isShaking}
          lasers={lasers}
          shockwaves={shockwaves}
          singularities={singularities}
          floatingTexts={floatingTexts}
          onTileClick={handleTileClick}
          onTileSwap={handleTileSwap}
        />
      </main>

      {/* Cockpit Status Footer */}
      <footer className="w-full max-w-4xl mx-auto mt-2 text-center text-[11px] font-mono-code text-slate-500/80 z-10 flex flex-wrap items-center justify-between px-3">
        <span>GRAV-DRIVE: ONLINE</span>
        <span className="text-cyan-400/80">ALIGN 3 TO COLLAPSE • MATCH 4 FOR PULSAR • MATCH 5 FOR SINGULARITY</span>
        <span>CACHE-STASH ORBITAL TELEMETRY</span>
      </footer>

      {/* Modal Dialogs */}
      {modalType && (
        <MissionModal
          type={modalType}
          currentMission={currentMission}
          score={score}
          movesLeft={movesLeft}
          gatheredPlanets={gatheredPlanets}
          onClose={() => setModalType(null)}
          onStartMission={() => {
            resetGame();
          }}
          onNextMission={handleNextMission}
          onRetryMission={() => resetGame()}
          onSelectMission={mission => {
            setCurrentMission(mission);
            resetGame(mission);
          }}
        />
      )}
    </div>
  );
};

export default App;
