import { AudioSettings } from '../types/game';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private settings: AudioSettings = {
    musicEnabled: true,
    sfxEnabled: true,
    volume: 0.65,
  };
  private musicInterval: number | null = null;
  private musicStep = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock() {
    this.ensureContext();
    if (this.settings.musicEnabled && this.musicInterval === null) {
      this.startMusic();
    }
  }

  public updateSettings(next: AudioSettings) {
    this.settings = { ...next };
    if (!this.settings.musicEnabled) {
      this.stopMusic();
    } else if (this.ctx && this.musicInterval === null) {
      this.startMusic();
    }
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainLevel = 0.2,
    delay = 0,
    slideToFreq?: number
  ) {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideToFreq), now + duration);
    }

    const vol = Math.max(0.001, gainLevel * this.settings.volume);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(vol, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private playNoiseBurst(duration: number, gainLevel = 0.18, filterFreq = 900) {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const sampleCount = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;

    const gain = ctx.createGain();
    gain.gain.value = gainLevel * this.settings.volume;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start();
  }

  public playClick() {
    this.playTone(620, 0.06, 'triangle', 0.14, 0, 780);
  }

  public playSwap() {
    this.playTone(380, 0.09, 'sine', 0.14, 0, 520);
  }

  public playInvalidSwap() {
    this.playTone(230, 0.12, 'triangle', 0.16, 0, 170);
    this.playTone(185, 0.12, 'triangle', 0.14, 0.09, 140);
  }

  public playMatch(combo = 1) {
    const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66];
    const base = scale[Math.min(combo - 1, scale.length - 1)];
    this.playTone(base, 0.16, 'triangle', 0.18, 0, base * 1.12);
    this.playTone(base * 1.25, 0.18, 'sine', 0.12, 0.04);
  }

  public playSpecialCreate() {
    this.playTone(523.25, 0.12, 'triangle', 0.16, 0);
    this.playTone(659.25, 0.12, 'triangle', 0.16, 0.07);
    this.playTone(1046.5, 0.22, 'sine', 0.2, 0.14);
  }

  public playRocket() {
    this.playTone(280, 0.22, 'sawtooth', 0.12, 0, 920);
    this.playNoiseBurst(0.18, 0.16, 1600);
  }

  public playBomb() {
    this.playTone(150, 0.3, 'sawtooth', 0.22, 0, 48);
    this.playNoiseBurst(0.32, 0.28, 700);
  }

  public playPrism() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.22, 'sine', 0.15, idx * 0.045);
    });
  }

  public playObstacleBreak() {
    this.playTone(190, 0.1, 'square', 0.12, 0, 110);
    this.playNoiseBurst(0.12, 0.16, 1100);
  }

  public playCoin() {
    this.playTone(987.77, 0.09, 'sine', 0.16, 0);
    this.playTone(1318.51, 0.18, 'sine', 0.18, 0.07);
  }

  public playStarEarn(index: number) {
    const pitches = [659.25, 783.99, 1046.5];
    const p = pitches[Math.min(index, 2)];
    this.playTone(p, 0.25, 'triangle', 0.22, 0, p * 1.05);
  }

  public playBuild() {
    const chord = [440, 554.37, 659.25, 880];
    chord.forEach((n, idx) => {
      this.playTone(n, 0.28, 'triangle', 0.16, idx * 0.07);
    });
  }

  public playWin() {
    const fanfare = [
      { f: 523.25, d: 0.14, t: 0 },
      { f: 659.25, d: 0.14, t: 0.12 },
      { f: 783.99, d: 0.14, t: 0.24 },
      { f: 1046.5, d: 0.42, t: 0.36 },
      { f: 783.99, d: 0.14, t: 0.56 },
      { f: 1046.5, d: 0.5, t: 0.7 },
    ];
    fanfare.forEach((n) => this.playTone(n.f, n.d, 'triangle', 0.22, n.t));
  }

  public playLose() {
    this.playTone(392, 0.2, 'triangle', 0.18, 0, 349.23);
    this.playTone(349.23, 0.2, 'triangle', 0.18, 0.2, 311.13);
    this.playTone(293.66, 0.42, 'sine', 0.18, 0.4, 246.94);
  }

  public startMusic() {
    if (typeof window === 'undefined' || !this.settings.musicEnabled) return;
    if (this.musicInterval !== null) return;

    const melody = [
      523.25, 659.25, 783.99, 659.25,
      587.33, 698.46, 880.0, 698.46,
      523.25, 659.25, 783.99, 1046.5,
      783.99, 659.25, 587.33, 493.88,
    ];

    this.musicInterval = window.setInterval(() => {
      if (!this.settings.musicEnabled) return;
      const ctx = this.ctx;
      if (!ctx || ctx.state !== 'running') return;

      const freq = melody[this.musicStep % melody.length];
      this.musicStep += 1;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 0.5, now);

      const level = 0.045 * this.settings.volume;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.002, level), now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.44);
    }, 460);
  }

  public stopMusic() {
    if (this.musicInterval !== null) {
      window.clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
