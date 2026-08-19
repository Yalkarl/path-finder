/**
 * Target Lock Readiness Gauge - Procedural Web Audio Synthesizer (Aggressive / ดุดัน & หนักแน่น)
 * Heavy Cyberpunk Industrial Bass, Tactical Railgun Lock-On, and Earth-Shaking Sub Impact.
 */

function createDistortionCurve(amount = 25) {
  const k = typeof amount === 'number' ? amount : 25;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

class TargetLockAudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.activeNodes = [];
    this.distortionCurve = createDistortionCurve(30);
  }

  getAudioContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  stopAll() {
    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {
        // ignore already stopped nodes
      }
    });
    this.activeNodes = [];
  }

  /**
   * Main Heavy Aggressive Target Lock Sequence (9.8s synced with animation)
   */
  playQuantumLock(onFinish) {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    this.stopAll();

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.85, now);
    masterGain.connect(ctx.destination);

    // =========================================================================
    // 1. Heavy Reese Bass & Industrial Sub Growl (0.0s - 7.9s)
    // =========================================================================
    const subOsc1 = ctx.createOscillator();
    const subOsc2 = ctx.createOscillator();
    const subFilter = ctx.createBiquadFilter();
    const subDistort = ctx.createWaveShaper();
    const subGain = ctx.createGain();

    subOsc1.type = 'sawtooth';
    subOsc2.type = 'sawtooth';
    subOsc1.frequency.setValueAtTime(55.0, now); // A1
    subOsc2.frequency.setValueAtTime(56.2, now); // Detuned A1 for heavy beating reese growl

    subOsc1.frequency.linearRampToValueAtTime(73.42, now + 5.0); // D2
    subOsc2.frequency.linearRampToValueAtTime(74.80, now + 5.0);
    subOsc1.frequency.linearRampToValueAtTime(110.0, now + 7.5); // A2
    subOsc2.frequency.linearRampToValueAtTime(111.8, now + 7.5);

    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(180, now);
    subFilter.frequency.linearRampToValueAtTime(420, now + 6.8);
    subFilter.frequency.linearRampToValueAtTime(800, now + 7.8);
    subFilter.Q.setValueAtTime(4.0, now);

    subDistort.curve = this.distortionCurve;

    subGain.gain.setValueAtTime(0.01, now);
    subGain.gain.linearRampToValueAtTime(0.28, now + 1.2);
    subGain.gain.linearRampToValueAtTime(0.38, now + 6.8);
    subGain.gain.linearRampToValueAtTime(0.48, now + 7.8);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 7.95); // Dramatic tension breath before impact

    subOsc1.connect(subFilter);
    subOsc2.connect(subFilter);
    subFilter.connect(subDistort);
    subDistort.connect(subGain);
    subGain.connect(masterGain);

    subOsc1.start(now);
    subOsc1.stop(now + 8.0);
    subOsc2.start(now);
    subOsc2.stop(now + 8.0);
    this.activeNodes.push(subOsc1, subOsc2);

    // =========================================================================
    // 2. Heavy Tactical Heartbeat Sub Kicks (0.2s, 1.6s, 3.0s, 4.4s)
    // =========================================================================
    const kickTimes = [0.2, 1.6, 3.0, 4.4];
    kickTimes.forEach((t) => {
      const kickTime = now + t;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, kickTime);
      osc.frequency.exponentialRampToValueAtTime(32, kickTime + 0.35); // Deep sub pitch drop

      gain.gain.setValueAtTime(0.45, kickTime);
      gain.gain.exponentialRampToValueAtTime(0.001, kickTime + 0.5);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(kickTime);
      osc.stop(kickTime + 0.55);
      this.activeNodes.push(osc);

      // Heavy Metallic Servo Clack
      this.createHeavyClack(ctx, masterGain, kickTime);
    });

    // =========================================================================
    // 3. Tactical Cyber Weapon Lock-On Mech Pulses (5.0s - 6.8s)
    // =========================================================================
    const lockTimes = [5.0, 5.45, 5.85, 6.2, 6.5, 6.75];
    const lockFreqs = [220, 293.66, 369.99, 440, 587.33, 739.99]; // Heavy mid-frequency lock tones

    lockTimes.forEach((t, idx) => {
      const lockTime = now + t;
      const f = lockFreqs[idx];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, lockTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(f * 1.5, lockTime);
      filter.Q.setValueAtTime(5, lockTime);

      gain.gain.setValueAtTime(0.001, lockTime);
      gain.gain.linearRampToValueAtTime(0.22, lockTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, lockTime + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start(lockTime);
      osc.stop(lockTime + 0.2);
      this.activeNodes.push(osc);

      this.createHeavyClack(ctx, masterGain, lockTime, 0.25);
    });

    // =========================================================================
    // 4. Aggressive Hyper-Charged Overdrive Riser (6.8s - 7.95s)
    // =========================================================================
    const riserTime = now + 6.8;
    const riserOsc1 = ctx.createOscillator();
    const riserOsc2 = ctx.createOscillator();
    const riserFilter = ctx.createBiquadFilter();
    const riserDistort = ctx.createWaveShaper();
    const riserGain = ctx.createGain();

    riserOsc1.type = 'sawtooth';
    riserOsc2.type = 'sawtooth';
    riserOsc1.frequency.setValueAtTime(80, riserTime);
    riserOsc2.frequency.setValueAtTime(82, riserTime);
    riserOsc1.frequency.exponentialRampToValueAtTime(950, riserTime + 1.15);
    riserOsc2.frequency.exponentialRampToValueAtTime(960, riserTime + 1.15);

    riserFilter.type = 'bandpass';
    riserFilter.frequency.setValueAtTime(150, riserTime);
    riserFilter.frequency.exponentialRampToValueAtTime(3800, riserTime + 1.15);
    riserFilter.Q.setValueAtTime(6.0, riserTime);

    riserDistort.curve = this.distortionCurve;

    riserGain.gain.setValueAtTime(0.01, riserTime);
    riserGain.gain.linearRampToValueAtTime(0.35, riserTime + 0.8);
    riserGain.gain.linearRampToValueAtTime(0.55, riserTime + 1.12);
    riserGain.gain.exponentialRampToValueAtTime(0.0001, riserTime + 1.15); // Drop to zero for tension impact gap

    riserOsc1.connect(riserFilter);
    riserOsc2.connect(riserFilter);
    riserFilter.connect(riserDistort);
    riserDistort.connect(riserGain);
    riserGain.connect(masterGain);

    riserOsc1.start(riserTime);
    riserOsc1.stop(riserTime + 1.18);
    riserOsc2.start(riserTime);
    riserOsc2.stop(riserTime + 1.18);
    this.activeNodes.push(riserOsc1, riserOsc2);

    // =========================================================================
    // 5. Devastating Railgun Blast & Heavy Seismic Impact (8.0s)
    // =========================================================================
    const impactTime = now + 8.0;

    // Massive 808 Seismic Sub Drop (Punch)
    const subImpact = ctx.createOscillator();
    const subImpactGain = ctx.createGain();
    subImpact.type = 'sine';
    subImpact.frequency.setValueAtTime(160, impactTime);
    subImpact.frequency.exponentialRampToValueAtTime(28, impactTime + 0.6); // Deep 28Hz sub shake

    subImpactGain.gain.setValueAtTime(0.95, impactTime);
    subImpactGain.gain.exponentialRampToValueAtTime(0.001, impactTime + 1.8);

    subImpact.connect(subImpactGain);
    subImpactGain.connect(masterGain);
    subImpact.start(impactTime);
    subImpact.stop(impactTime + 1.9);
    this.activeNodes.push(subImpact);

    // Heavy Industrial Distortion Snap
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    const snapFilter = ctx.createBiquadFilter();
    snapOsc.type = 'sawtooth';
    snapOsc.frequency.setValueAtTime(450, impactTime);
    snapOsc.frequency.exponentialRampToValueAtTime(60, impactTime + 0.15);

    snapFilter.type = 'lowpass';
    snapFilter.frequency.setValueAtTime(4000, impactTime);
    snapFilter.frequency.exponentialRampToValueAtTime(200, impactTime + 0.2);

    snapGain.gain.setValueAtTime(0.7, impactTime);
    snapGain.gain.exponentialRampToValueAtTime(0.001, impactTime + 0.25);

    snapOsc.connect(snapFilter);
    snapFilter.connect(snapGain);
    snapGain.connect(masterGain);
    snapOsc.start(impactTime);
    snapOsc.stop(impactTime + 0.3);
    this.activeNodes.push(snapOsc);

    // Heavy Shockwave Explosive Noise Sweep
    this.createHeavyExplosionNoise(ctx, masterGain, impactTime, 2.0);

    // =========================================================================
    // 6. Epic Dark Cyberpunk Victory Power Chords (8.15s - 9.8s)
    // =========================================================================
    const resolveTime = now + 8.15;
    // D Power Chord Stack (D2: 73.4Hz, A2: 110Hz, D3: 146.8Hz, F#3: 185Hz, A3: 220Hz, D4: 293.6Hz)
    const epicChords = [73.42, 110.00, 146.83, 185.00, 220.00, 293.66];

    epicChords.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, resolveTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800 + (idx * 200), resolveTime);
      filter.frequency.exponentialRampToValueAtTime(250, resolveTime + 1.6);

      gain.gain.setValueAtTime(0.001, resolveTime);
      gain.gain.linearRampToValueAtTime(0.16, resolveTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, resolveTime + 1.65);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start(resolveTime);
      osc.stop(resolveTime + 1.7);
      this.activeNodes.push(osc);
    });

    if (onFinish) {
      setTimeout(onFinish, 9800);
    }
  }

  createHeavyClack(ctx, dest, startTime, volume = 0.35) {
    const bufferSize = Math.floor(ctx.sampleRate * 0.08);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.012));
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, startTime);
    filter.Q.setValueAtTime(3.5, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    whiteNoise.start(startTime);
    whiteNoise.stop(startTime + 0.08);
    this.activeNodes.push(whiteNoise);
  }

  createHeavyExplosionNoise(ctx, dest, startTime, duration) {
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.45));
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, startTime);
    filter.frequency.exponentialRampToValueAtTime(120, startTime + duration);
    filter.Q.setValueAtTime(3.0, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.65, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    whiteNoise.start(startTime);
    whiteNoise.stop(startTime + duration);
    this.activeNodes.push(whiteNoise);
  }
}

export const targetLockAudio = new TargetLockAudioSynthesizer();
