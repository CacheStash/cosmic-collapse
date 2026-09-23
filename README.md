# Cosmic Collapse: Match-3 Space Odyssey

A high-polish, sci-fi astronomical Match-3 puzzle web application built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **Three.js / WebGL**, and a procedural **Web Audio API** sound engine.

---

## Features & Celestial Mechanics

### Visual Architecture & Cockpit HUD
* **Deep Space Aesthetics:** `#0a0a12` void black, glowing electric cyan, stellar gold, neon violet, and supernova white.
* **Procedural 3D WebGL Background:** Dynamic starfield with 1800+ stars, multi-colored volumetric nebula dust clouds, and real-time mouse parallax response.
* **Cockpit HUD:** Glassmorphic telemetry panels, monospace orbital move counter, extraction quota progress rings, score telemetry, and sound/shake controls.

### Planetary Grid Bodies (Vector Shaded)
1. **Terrestrial (Earth-like):** Deep ocean blue, green continents, swirling cloud maps, atmospheric rim glow.
2. **Gas Giant (Jovian):** Amber/orange storm stripes with tilted planetary rings.
3. **Ice Dwarf (Glacial):** Crystalline turquoise, reflective sheen, sparkling ice fissures.
4. **Volcanic (Molten):** Cracked obsidian crust with glowing magma seams and ember glow.
5. **Toxic (Acidic):** Neon lime-green with bubbling cloud layers and bio-luminescent haze.
6. **Neutron Core:** High-density violet sphere with magnetic corona flare arcs.

### Cosmic Anomalies & Special Combinations
* **Match-4 (Line) ➔ Pulsar Beam (Horizontal / Vertical):** Fires an anti-matter plasma laser that cleaves an entire row or column.
* **Match-5 (T or L shape) ➔ Supernova Core:** Unstable star pulsing with solar flares; clears a 3x3 surrounding zone with a blinding thermal shockwave and screen rumble.
* **Match-5 (Straight Line) ➔ Singularity / Black Hole:** Swirling gravitational vortex. Swapping with any planet collapses and eradicates all instances of that planet across the entire board.
* **Pulsar + Supernova ➔ Gamma-Ray Burst:** Eradicates 3 parallel rows and 3 parallel columns simultaneously.
* **Black Hole + Any Special ➔ Event Horizon Collapse:** Converts all instances of that planet into that special element, triggering a massive chain cascade.
* **Black Hole + Black Hole ➔ Cosmic Reset / Big Crunch:** Eradicates the entire galaxy board with cosmic stardust release.
* **Pulsar + Pulsar ➔ Cross Laser:** Clears intersecting row and column simultaneously.
* **Supernova + Supernova ➔ Mega Nova Blast:** Clears an expanded 5x5 zone.

### Soundscape (Procedural Web Audio API)
* Ethereal deep space ambient drone synth (stereo low-pass resonant oscillators).
* Metallic magnetic latch tile slide.
* Celestial pentatonic crystal chimes ascending in pitch per combo tier.
* Pulsar laser discharge with resonant sweeps.
* Sub-bass implosion and thermal shockwave booms.
* Completely self-contained with zero external audio assets required.

---

## Development & Build

### Prerequisites
* Node.js 18+
* [pnpm](https://pnpm.io/) (preferred package manager)

### Local Development
```bash
pnpm install
pnpm dev
```

### Production Build
```bash
pnpm build
```
Build output is saved to `dist/`, fully optimized for Cloudflare Pages / Workers.

### Deployment to Cloudflare Pages
You can deploy directly using `./deploy.sh` or via Wrangler:
```bash
pnpm dlx wrangler pages deploy dist --project-name=cosmic-collapse
```
Or connect your GitHub repository `CacheStash/cosmic-collapse` in the Cloudflare Dashboard:
* **Framework preset:** `Vite`
* **Build command:** `pnpm build`
* **Build output directory:** `dist`

---

## License
MIT
