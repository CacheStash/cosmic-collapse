import type { PlanetType, SpecialType } from '../types/game';

interface CelestialNodeProps {
  type: PlanetType;
  special?: SpecialType;
  size?: number;
  isSelected?: boolean;
  isMatched?: boolean;
  className?: string;
}

export const CelestialNode: React.FC<CelestialNodeProps> = ({
  type,
  special = 'none',
  size = 56,
  isSelected = false,
  isMatched = false,
  className = '',
}) => {
  const half = size / 2;
  const radius = size * 0.42;

  // Render planet body based on type
  const renderPlanetBody = () => {
    switch (type) {
      case 'terrestrial':
        return (
          <g>
            <defs>
              <radialGradient id={`grad-terr-${size}`} cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#48cae4" />
                <stop offset="40%" stopColor="#0077b6" />
                <stop offset="85%" stopColor="#023e8a" />
                <stop offset="100%" stopColor="#03045e" />
              </radialGradient>
              <linearGradient id={`cloud-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#90e0ef" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Base Ocean Sphere */}
            <circle cx={half} cy={half} r={radius} fill={`url(#grad-terr-${size})`} />
            {/* Continents */}
            <path
              d={`M ${half - radius * 0.5} ${half - radius * 0.3} Q ${half - radius * 0.2} ${half - radius * 0.6} ${half + radius * 0.2} ${half - radius * 0.4} Q ${half + radius * 0.5} ${half} ${half + radius * 0.1} ${half + radius * 0.4} Q ${half - radius * 0.3} ${half + radius * 0.2} ${half - radius * 0.5} ${half - radius * 0.3} Z`}
              fill="#2d6a4f"
              opacity="0.8"
            />
            <path
              d={`M ${half - radius * 0.2} ${half + radius * 0.1} Q ${half + radius * 0.3} ${half + radius * 0.5} ${half - radius * 0.1} ${half + radius * 0.7} Q ${half - radius * 0.6} ${half + radius * 0.5} ${half - radius * 0.2} ${half + radius * 0.1} Z`}
              fill="#40916c"
              opacity="0.85"
            />
            {/* Swirling Atmosphere Clouds */}
            <path
              d={`M ${half - radius * 0.8} ${half - radius * 0.1} Q ${half} ${half - radius * 0.4} ${half + radius * 0.7} ${half - radius * 0.2}`}
              stroke={`url(#cloud-${size})`}
              strokeWidth={size * 0.08}
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={`M ${half - radius * 0.6} ${half + radius * 0.3} Q ${half + radius * 0.1} ${half + radius * 0.2} ${half + radius * 0.8} ${half + radius * 0.5}`}
              stroke={`url(#cloud-${size})`}
              strokeWidth={size * 0.06}
              strokeLinecap="round"
              fill="none"
            />
            {/* Atmospheric Glow Rim */}
            <circle
              cx={half}
              cy={half}
              r={radius}
              stroke="#00f0ff"
              strokeWidth={size * 0.04}
              strokeOpacity="0.6"
              fill="none"
            />
          </g>
        );

      case 'gas_giant':
        return (
          <g>
            <defs>
              <linearGradient id={`grad-jovian-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f39c12" />
                <stop offset="25%" stopColor="#d35400" />
                <stop offset="45%" stopColor="#e67e22" />
                <stop offset="65%" stopColor="#c0392b" />
                <stop offset="85%" stopColor="#e67e22" />
                <stop offset="100%" stopColor="#b9770e" />
              </linearGradient>
            </defs>
            {/* Gas Giant Sphere */}
            <circle cx={half} cy={half} r={radius} fill={`url(#grad-jovian-${size})`} />
            {/* Swirling Storms / Red Spot */}
            <ellipse
              cx={half + radius * 0.3}
              cy={half + radius * 0.2}
              rx={radius * 0.25}
              ry={radius * 0.15}
              fill="#962d00"
              opacity="0.8"
            />
            {/* Tilted Planetary Rings */}
            <ellipse
              cx={half}
              cy={half}
              rx={radius * 1.5}
              ry={radius * 0.38}
              fill="none"
              stroke="#f5b041"
              strokeWidth={size * 0.07}
              strokeOpacity="0.75"
              transform={`rotate(-22 ${half} ${half})`}
            />
            <ellipse
              cx={half}
              cy={half}
              rx={radius * 1.3}
              ry={radius * 0.3}
              fill="none"
              stroke="#edbb99"
              strokeWidth={size * 0.03}
              strokeOpacity="0.5"
              transform={`rotate(-22 ${half} ${half})`}
            />
          </g>
        );

      case 'ice_dwarf':
        return (
          <g>
            <defs>
              <radialGradient id={`grad-ice-${size}`} cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#e0fbfc" />
                <stop offset="45%" stopColor="#98c1d9" />
                <stop offset="80%" stopColor="#3d5a80" />
                <stop offset="100%" stopColor="#293241" />
              </radialGradient>
            </defs>
            {/* Icy Crystalline Sphere */}
            <circle cx={half} cy={half} r={radius} fill={`url(#grad-ice-${size})`} />
            {/* Crystalline Facets / Fissures */}
            <polygon
              points={`${half - radius * 0.4},${half - radius * 0.4} ${half},${half - radius * 0.7} ${half + radius * 0.3},${half - radius * 0.3} ${half - radius * 0.1},${half}`}
              fill="#ffffff"
              opacity="0.45"
            />
            <path
              d={`M ${half - radius * 0.6} ${half + radius * 0.2} L ${half - radius * 0.1} ${half + radius * 0.5} L ${half + radius * 0.5} ${half + radius * 0.2} L ${half + radius * 0.2} ${half - radius * 0.1}`}
              stroke="#c5f6fa"
              strokeWidth={size * 0.03}
              fill="none"
              opacity="0.8"
            />
            {/* Reflective Sheen Sparkle */}
            <circle cx={half - radius * 0.35} cy={half - radius * 0.35} r={radius * 0.14} fill="#ffffff" opacity="0.9" />
            <circle cx={half} cy={half} r={radius} stroke="#a5f3fc" strokeWidth={size * 0.03} strokeOpacity="0.7" fill="none" />
          </g>
        );

      case 'volcanic':
        return (
          <g>
            <defs>
              <radialGradient id={`grad-magma-${size}`} cx="45%" cy="45%" r="65%">
                <stop offset="0%" stopColor="#ff4800" />
                <stop offset="50%" stopColor="#c01500" />
                <stop offset="85%" stopColor="#2b1108" />
                <stop offset="100%" stopColor="#140803" />
              </radialGradient>
            </defs>
            {/* Obsidian Crust Base */}
            <circle cx={half} cy={half} r={radius} fill={`url(#grad-magma-${size})`} />
            {/* Glowing Magma Seams */}
            <path
              d={`M ${half - radius * 0.7} ${half - radius * 0.2} Q ${half - radius * 0.1} ${half} ${half + radius * 0.6} ${half - radius * 0.4}`}
              stroke="#ff7700"
              strokeWidth={size * 0.05}
              fill="none"
            />
            <path
              d={`M ${half - radius * 0.2} ${half - radius * 0.6} Q ${half} ${half - radius * 0.1} ${half + radius * 0.4} ${half + radius * 0.6}`}
              stroke="#ffcc00"
              strokeWidth={size * 0.03}
              fill="none"
            />
            <path
              d={`M ${half - radius * 0.5} ${half + radius * 0.4} Q ${half} ${half + radius * 0.6} ${half + radius * 0.5} ${half + radius * 0.2}`}
              stroke="#ff3700"
              strokeWidth={size * 0.04}
              fill="none"
            />
            {/* Magma Chamber Glow */}
            <circle cx={half - radius * 0.1} cy={half} r={radius * 0.22} fill="#ffdd00" opacity="0.6" filter="blur(1px)" />
            {/* Rim Ember Glow */}
            <circle cx={half} cy={half} r={radius} stroke="#ff5500" strokeWidth={size * 0.03} strokeOpacity="0.8" fill="none" />
          </g>
        );

      case 'toxic':
        return (
          <g>
            <defs>
              <radialGradient id={`grad-toxic-${size}`} cx="35%" cy="35%" r="70%">
                <stop offset="0%" stopColor="#a3e635" />
                <stop offset="40%" stopColor="#65a30d" />
                <stop offset="80%" stopColor="#365314" />
                <stop offset="100%" stopColor="#1a2e05" />
              </radialGradient>
            </defs>
            {/* Acidic Toxic Sphere */}
            <circle cx={half} cy={half} r={radius} fill={`url(#grad-toxic-${size})`} />
            {/* Bubbling Cloud Layers */}
            <circle cx={half - radius * 0.3} cy={half - radius * 0.2} r={radius * 0.22} fill="#bef264" opacity="0.6" />
            <circle cx={half + radius * 0.3} cy={half + radius * 0.2} r={radius * 0.28} fill="#84cc16" opacity="0.7" />
            <circle cx={half - radius * 0.2} cy={half + radius * 0.4} r={radius * 0.18} fill="#d9f99d" opacity="0.5" />
            {/* Toxic Haze Rings */}
            <circle cx={half} cy={half} r={radius * 1.05} stroke="#84cc16" strokeWidth={size * 0.03} strokeDasharray="3,3" strokeOpacity="0.8" fill="none" />
          </g>
        );

      case 'neutron':
        return (
          <g>
            <defs>
              <radialGradient id={`grad-neutron-${size}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#e879f9" />
                <stop offset="70%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#3b0764" />
              </radialGradient>
            </defs>
            {/* High-density violet sphere */}
            <circle cx={half} cy={half} r={radius * 0.9} fill={`url(#grad-neutron-${size})`} />
            {/* Magnetic Corona Flare Arcs */}
            <ellipse
              cx={half}
              cy={half}
              rx={radius * 1.3}
              ry={radius * 0.45}
              fill="none"
              stroke="#c084fc"
              strokeWidth={size * 0.04}
              strokeOpacity="0.8"
              transform={`rotate(45 ${half} ${half})`}
            />
            <ellipse
              cx={half}
              cy={half}
              rx={radius * 1.3}
              ry={radius * 0.45}
              fill="none"
              stroke="#f0abfc"
              strokeWidth={size * 0.04}
              strokeOpacity="0.8"
              transform={`rotate(-45 ${half} ${half})`}
            />
            {/* Central energy flash */}
            <circle cx={half} cy={half} r={radius * 0.25} fill="#ffffff" opacity="0.9" />
          </g>
        );
    }
  };

  // Render Special Celestial Effects (Pulsar, Supernova, Singularity)
  const renderSpecialOverlay = () => {
    switch (special) {
      case 'pulsar_h':
        return (
          <g className="animate-pulse">
            {/* Horizontal Laser Polarity Markers */}
            <line
              x1={half - radius * 1.3}
              y1={half}
              x2={half + radius * 1.3}
              y2={half}
              stroke="#00f0ff"
              strokeWidth={size * 0.08}
              strokeLinecap="round"
              filter="drop-shadow(0 0 6px #00f0ff)"
            />
            <line
              x1={half - radius * 1.3}
              y1={half}
              x2={half + radius * 1.3}
              y2={half}
              stroke="#ffffff"
              strokeWidth={size * 0.03}
            />
            {/* Polarity Arrows */}
            <polygon
              points={`${half - radius * 1.3},${half} ${half - radius * 1.05},${half - size * 0.08} ${half - radius * 1.05},${half + size * 0.08}`}
              fill="#00f0ff"
            />
            <polygon
              points={`${half + radius * 1.3},${half} ${half + radius * 1.05},${half - size * 0.08} ${half + radius * 1.05},${half + size * 0.08}`}
              fill="#00f0ff"
            />
          </g>
        );

      case 'pulsar_v':
        return (
          <g className="animate-pulse">
            {/* Vertical Laser Polarity Markers */}
            <line
              x1={half}
              y1={half - radius * 1.3}
              x2={half}
              y2={half + radius * 1.3}
              stroke="#00f0ff"
              strokeWidth={size * 0.08}
              strokeLinecap="round"
              filter="drop-shadow(0 0 6px #00f0ff)"
            />
            <line
              x1={half}
              y1={half - radius * 1.3}
              x2={half}
              y2={half + radius * 1.3}
              stroke="#ffffff"
              strokeWidth={size * 0.03}
            />
            {/* Polarity Arrows */}
            <polygon
              points={`${half},${half - radius * 1.3} ${half - size * 0.08},${half - radius * 1.05} ${half + size * 0.08},${half - radius * 1.05}`}
              fill="#00f0ff"
            />
            <polygon
              points={`${half},${half + radius * 1.3} ${half - size * 0.08},${half + radius * 1.05} ${half + size * 0.08},${half + radius * 1.05}`}
              fill="#00f0ff"
            />
          </g>
        );

      case 'supernova':
        return (
          <g className="animate-spin-slow">
            {/* Unstable Solar Flares & Corona */}
            <circle
              cx={half}
              cy={half}
              r={radius * 1.25}
              fill="none"
              stroke="#ffaa00"
              strokeWidth={size * 0.06}
              strokeDasharray="4,6"
              filter="drop-shadow(0 0 8px #ff7700)"
            />
            <polygon
              points={`${half},${half - radius * 1.3} ${half + radius * 0.3},${half - radius * 0.8} ${half + radius * 1.3},${half} ${half + radius * 0.8},${half + radius * 0.3} ${half},${half + radius * 1.3} ${half - radius * 0.3},${half + radius * 0.8} ${half - radius * 1.3},${half} ${half - radius * 0.8},${half - radius * 0.3}`}
              fill="none"
              stroke="#ffffff"
              strokeWidth={size * 0.03}
              opacity="0.8"
            />
            <circle
              cx={half}
              cy={half}
              r={radius * 0.5}
              fill="#ffffff"
              opacity="0.8"
              filter="drop-shadow(0 0 10px #ffffff)"
            />
          </g>
        );

      case 'singularity':
        return (
          <g className="singularity-swirl">
            {/* Swirling Gravitational Accretion Disk */}
            <circle
              cx={half}
              cy={half}
              r={radius * 1.2}
              fill="none"
              stroke="#b026ff"
              strokeWidth={size * 0.09}
              strokeDasharray="8,4"
              filter="drop-shadow(0 0 8px #00f0ff)"
            />
            <circle
              cx={half}
              cy={half}
              r={radius * 0.75}
              fill="#030008"
              stroke="#00f0ff"
              strokeWidth={size * 0.04}
            />
            <circle
              cx={half}
              cy={half}
              r={radius * 0.4}
              fill="#000000"
              stroke="#ffffff"
              strokeWidth={size * 0.02}
            />
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center transition-transform duration-200 ${
        isSelected ? 'scale-110 z-20' : 'hover:scale-105'
      } ${isMatched ? 'scale-0 opacity-0 transition-all duration-300' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={`overflow-visible ${isSelected ? 'filter drop-shadow(0 0 12px #00f0ff)' : ''}`}
      >
        {renderPlanetBody()}
        {renderSpecialOverlay()}

        {/* Selection Reticle HUD */}
        {isSelected && (
          <g>
            <circle
              cx={half}
              cy={half}
              r={radius * 1.25}
              fill="none"
              stroke="#00f0ff"
              strokeWidth={2}
              strokeDasharray="6,4"
              className="animate-spin-slow"
            />
            {/* Corner brackets */}
            <path
              d={`M ${half - radius * 1.3} ${half - radius * 0.8} L ${half - radius * 1.3} ${half - radius * 1.3} L ${half - radius * 0.8} ${half - radius * 1.3}`}
              stroke="#00f0ff"
              strokeWidth={2}
              fill="none"
            />
            <path
              d={`M ${half + radius * 1.3} ${half - radius * 0.8} L ${half + radius * 1.3} ${half - radius * 1.3} L ${half + radius * 0.8} ${half - radius * 1.3}`}
              stroke="#00f0ff"
              strokeWidth={2}
              fill="none"
            />
            <path
              d={`M ${half - radius * 1.3} ${half + radius * 0.8} L ${half - radius * 1.3} ${half + radius * 1.3} L ${half - radius * 0.8} ${half + radius * 1.3}`}
              stroke="#00f0ff"
              strokeWidth={2}
              fill="none"
            />
            <path
              d={`M ${half + radius * 1.3} ${half + radius * 0.8} L ${half + radius * 1.3} ${half + radius * 1.3} L ${half + radius * 0.8} ${half + radius * 1.3}`}
              stroke="#00f0ff"
              strokeWidth={2}
              fill="none"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
