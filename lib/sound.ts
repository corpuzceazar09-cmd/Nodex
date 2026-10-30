// Lightweight Web Audio sound system. Ported from the reference game and kept
// dependency-free. Every method is a no-op when muted or when the browser has
// no AudioContext, so the app keeps working without audio.

type AudioContextCtor = typeof AudioContext;

function getAudioContextCtor(): AudioContextCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  return w.AudioContext ?? w.webkitAudioContext;
}

class SoundSystem {
  private ctx: AudioContext | null = null;
  private muted = false;

  /** Lazily create (and resume) the AudioContext. Safe to call any time. */
  init(): void {
    const Ctor = getAudioContextCtor();
    if (!Ctor) return;
    if (!this.ctx) {
      try {
        this.ctx = new Ctor();
      } catch {
        this.ctx = null;
        return;
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume().catch(() => undefined);
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType,
    gain: number,
    delay = 0,
    endFreq?: number,
  ): void {
    if (this.muted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx) return;

    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (endFreq !== undefined) {
      osc.frequency.linearRampToValueAtTime(endFreq, start + duration);
    }
    amp.gain.setValueAtTime(gain, start);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration);
  }

  playBtn(): void {
    this.tone(650, 0.04, "triangle", 0.1, 0, 320);
  }

  playSwitch(): void {
    this.tone(420, 0.05, "triangle", 0.2, 0, 880);
  }

  playTypewriter(): void {
    this.tone(520 + Math.random() * 80, 0.03, "square", 0.04);
  }

  playSnap(): void {
    this.tone(300, 0.06, "sine", 0.15, 0, 150);
  }

  playCorrect(): void {
    this.tone(587.33, 0.2, "square", 0.15);
    this.tone(880, 0.2, "square", 0.15, 0.1);
  }

  playIncorrect(): void {
    this.tone(160, 0.25, "sawtooth", 0.2, 0, 110);
  }

  playFanfare(): void {
    const notes: [number, number][] = [
      [523.25, 0],
      [659.25, 0.12],
      [783.99, 0.24],
      [1046.5, 0.36],
    ];
    notes.forEach(([freq, delay]) => this.tone(freq, 0.4, "square", 0.18, delay));
  }
}

export const sounds = new SoundSystem();
