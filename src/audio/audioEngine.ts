// Procedural Web Audio Engine for "Cosmic Collapse"
// Generates deep-space ambient drones, magnetic latches, crystal chimes, lasers, and sub-bass implosions

class CosmicAudioEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;
  private droneOscillators: OscillatorNode[] = [];
  private droneInterval: number | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with browser autoplay policies
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Ambient master channel
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      this.ambientGain.connect(this.ctx.destination);

      // SFX master channel
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain && this.sfxGain && this.ctx) {
      const targetGainAmbient = muted ? 0 : 0.2;
      const targetGainSfx = muted ? 0 : 0.45;
      this.ambientGain.gain.setTargetAtTime(targetGainAmbient, this.ctx.currentTime, 0.05);
      this.sfxGain.gain.setTargetAtTime(targetGainSfx, this.ctx.currentTime, 0.05);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // --- Background Ambience: Deep Space Ethereal Drone ---
  public startAmbientDrone() {
    if (this.droneOscillators.length > 0) return;
    this.initContext();
    if (!this.ctx || !this.ambientGain) return;

    // Frequencies for a mysterious space chord: C2 (65.41Hz), G2 (98.00Hz), D#3 (155.56Hz), A#3 (233.08Hz)
    const baseFreqs = [55.0, 82.4, 110.0, 164.81];

    baseFreqs.forEach((freq, idx) => {
      if (!this.ctx || !this.ambientGain) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Slowly detune
      osc.detune.setValueAtTime((idx - 1.5) * 4, this.ctx.currentTime);

      // Low-pass warm filter
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260 + idx * 80, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);

      osc.start();
      this.droneOscillators.push(osc);
    });
  }

  public stopAmbientDrone() {
    this.droneOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Ignored
      }
    });
    this.droneOscillators = [];
    if (this.droneInterval) {
      clearInterval(this.droneInterval);
      this.droneInterval = null;
    }
  }

  // --- Tile Slide: Metallic Magnetic Latch ---
  public playTileSlide() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.04);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.Q.setValueAtTime(4, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  // --- Tile Swap Failure / Rollback ---
  public playSwapError() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.18);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  // --- Matches: Resonant Crystal Chimes ascending per combo tier ---
  public playMatchChime(tier: number = 1) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    // Celestial Pentatonic Scale: C5, D5, E5, G5, A5, C6, D6, E6, G6...
    const celestialFrequencies = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98, 1760.0];
    const index = Math.min(tier - 1, celestialFrequencies.length - 1);
    const baseFreq = celestialFrequencies[index >= 0 ? index : 0];

    // Bell-like FM synthesis: Carrier + Modulator
    const carrier = this.ctx.createOscillator();
    const modulator = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(baseFreq, t);

    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(baseFreq * 2.76, t); // Metallic ratio

    modGain.gain.setValueAtTime(baseFreq * 1.5, t);
    modGain.gain.exponentialRampToValueAtTime(1, t + 0.35);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(300, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    carrier.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    carrier.start(t);
    modulator.start(t);
    carrier.stop(t + 0.65);
    modulator.stop(t + 0.65);
  }

  // --- Pulsar Beam Laser ---
  public playPulsarLaser() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.4);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, t);
    filter.frequency.exponentialRampToValueAtTime(400, t + 0.4);
    filter.Q.setValueAtTime(6, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.45);
  }

  // --- Supernova Explosion (Sub-bass rumble + thermal blast) ---
  public playSupernovaExplosion() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // Sub-bass thud
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(120, t);
    subOsc.frequency.exponentialRampToValueAtTime(32, t + 0.7);

    subGain.gain.setValueAtTime(0.65, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(t);
    subOsc.stop(t + 0.75);

    // Noise blast
    this.playNoiseBlast(0.8, 450);
  }

  // --- Singularity / Black Hole Implosion ---
  public playSingularityVortex() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Downward gravitational pull then pitch snap
    osc.frequency.setValueAtTime(360, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.5);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.7);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.2);
    gain.gain.linearRampToValueAtTime(0.7, t + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.85);
  }

  // --- Victory Fanfare ---
  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const chord = [523.25, 659.25, 783.99, 1046.5]; // C Major
    const t = this.ctx.currentTime;

    chord.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.1);

      gain.gain.setValueAtTime(0.01, t + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.3, t + idx * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + idx * 0.1);
      osc.stop(t + 1.6);
    });
  }

  // --- Mission Failed Alarm ---
  public playDefeat() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(110, t + 0.6);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.7);
  }

  private playNoiseBlast(duration: number, cutoff: number) {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff * 2, t);
    filter.frequency.exponentialRampToValueAtTime(60, t + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    whiteNoise.start(t);
    whiteNoise.stop(t + duration);
  }
}

export const audioEngine = new CosmicAudioEngine();
