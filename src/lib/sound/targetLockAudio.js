/**
 * Target Lock Readiness Gauge - Procedural Web Audio Synthesizer
 * High-tech, futuristic quantum radar, biometric lock-on, and sonic impact audio synthesis.
 */

class TargetLockAudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.activeNodes = [];
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
   * Main Target Lock High-Tech Quantum Audio Sequence (9.8s synced with animation)
   */
  playQuantumLock(onFinish) {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    this.stopAll();

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.75, now);
    masterGain.connect(ctx.destination);

    // =========================================================================
    // 1. Ambient Futuristic Sub Drone (0.0s - 8.0s)
    // =========================================================================
    const droneOsc = ctx.createOscillator();
    const droneGain = ctx.createGain();
    droneOsc.type = 'sine';
    droneOsc.frequency.setValueAtTime(82.41, now); // E2
    droneOsc.frequency.linearRampToValueAtTime(110.00, now + 6.0); // Glide to A2
    droneOsc.frequency.linearRampToValueAtTime(164.81, now + 8.0); // Glide to E3

    droneGain.gain.setValueAtTime(0.01, now);
    droneGain.gain.linearRampToValueAtTime(0.18, now + 2.0);
    droneGain.gain.linearRampToValueAtTime(0.22, now + 6.8);
    droneGain.gain.linearRampToValueAtTime(0.28, now + 7.9);
    droneGain.gain.exponentialRampToValueAtTime(0.001, now + 8.2);

    droneOsc.connect(droneGain);
    droneGain.connect(masterGain);
    droneOsc.start(now);
    droneOsc.stop(now + 8.3);
    this.activeNodes.push(droneOsc);

    // =========================================================================
    // 2. High-Tech Sonar Radar Sweeps (0.2s, 1.6s, 3.0s, 4.4s)
    // =========================================================================
    const sonarPings = [0.3, 1.7, 3.1, 4.5];
    sonarPings.forEach((t, i) => {
      const pingTime = now + t;
      const freq = 880 + (i * 110); // A5 ascending

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, pingTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, pingTime + 0.35);

      // Glass overtone for sonar ping
      const overtone = ctx.createOscillator();
      const overGain = ctx.createGain();
      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2.0, pingTime);

      gain.gain.setValueAtTime(0.001, pingTime);
      gain.gain.linearRampToValueAtTime(0.12, pingTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, pingTime + 0.8);

      overGain.gain.setValueAtTime(0.001, pingTime);
      overGain.gain.linearRampToValueAtTime(0.05, pingTime + 0.01);
      overGain.gain.exponentialRampToValueAtTime(0.0001, pingTime + 0.4);

      osc.connect(gain);
      overtone.connect(overGain);
      gain.connect(masterGain);
      overGain.connect(masterGain);

      osc.start(pingTime);
      osc.stop(pingTime + 0.9);
      overtone.start(pingTime);
      overtone.stop(pingTime + 0.5);
      this.activeNodes.push(osc, overtone);
    });

    // =========================================================================
    // 3. Accelerating Target Lock-On Telemetry Beeps (5.2s - 6.8s)
    // =========================================================================
    const lockBeepPitches = [987.77, 1174.66, 1318.51, 1567.98, 1760.00, 2093.00]; // B5 to C7
    const lockBeepTimes = [5.2, 5.6, 5.95, 6.25, 6.5, 6.7];

    lockBeepTimes.forEach((t, i) => {
      const beepTime = now + t;
      const f = lockBeepPitches[i];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, beepTime);

      gain.gain.setValueAtTime(0.001, beepTime);
      gain.gain.linearRampToValueAtTime(0.15, beepTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, beepTime + 0.12);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(beepTime);
      osc.stop(beepTime + 0.15);
      this.activeNodes.push(osc);
    });

    // =========================================================================
    // 4. Quantum Energy Charge Riser (6.8s - 8.0s)
    // =========================================================================
    const riserTime = now + 6.8;
    const riserOsc1 = ctx.createOscillator();
    const riserOsc2 = ctx.createOscillator();
    const riserFilter = ctx.createBiquadFilter();
    const riserGain = ctx.createGain();

    riserOsc1.type = 'sawtooth';
    riserOsc2.type = 'sine';
    riserOsc1.frequency.setValueAtTime(110, riserTime);
    riserOsc2.frequency.setValueAtTime(112, riserTime);
    riserOsc1.frequency.exponentialRampToValueAtTime(880, riserTime + 1.2);
    riserOsc2.frequency.exponentialRampToValueAtTime(884, riserTime + 1.2);

    riserFilter.type = 'bandpass';
    riserFilter.frequency.setValueAtTime(200, riserTime);
    riserFilter.frequency.exponentialRampToValueAtTime(3200, riserTime + 1.2);
    riserFilter.Q.setValueAtTime(3, riserTime);

    riserGain.gain.setValueAtTime(0.001, riserTime);
    riserGain.gain.linearRampToValueAtTime(0.24, riserTime + 1.0);
    riserGain.gain.linearRampToValueAtTime(0.35, riserTime + 1.18);
    riserGain.gain.exponentialRampToValueAtTime(0.0001, riserTime + 1.25);

    riserOsc1.connect(riserFilter);
    riserOsc2.connect(riserFilter);
    riserFilter.connect(riserGain);
    riserGain.connect(masterGain);

    riserOsc1.start(riserTime);
    riserOsc1.stop(riserTime + 1.25);
    riserOsc2.start(riserTime);
    riserOsc2.stop(riserTime + 1.25);
    this.activeNodes.push(riserOsc1, riserOsc2);

    // =========================================================================
    // 5. Sonic Boom / Quantum Core Lock Impact (8.0s)
    // =========================================================================
    const impactTime = now + 8.0;

    // Sub Bass Punch
    const subPunch = ctx.createOscillator();
    const subPunchGain = ctx.createGain();
    subPunch.type = 'sine';
    subPunch.frequency.setValueAtTime(130, impactTime);
    subPunch.frequency.exponentialRampToValueAtTime(38, impactTime + 0.45);

    subPunchGain.gain.setValueAtTime(0.65, impactTime);
    subPunchGain.gain.exponentialRampToValueAtTime(0.001, impactTime + 1.2);

    subPunch.connect(subPunchGain);
    subPunchGain.connect(masterGain);
    subPunch.start(impactTime);
    subPunch.stop(impactTime + 1.3);
    this.activeNodes.push(subPunch);

    // White Noise Cinematic Shockwave Sweep
    this.createImpactNoise(ctx, masterGain, impactTime, 1.5);

    // Cyber Crystal Laser Strike (Arpeggio: E6, G#6, B6, D#7, E7)
    const impactChimes = [1318.51, 1661.22, 1975.53, 2489.02, 2637.02];
    impactChimes.forEach((f, idx) => {
      const strikeTime = impactTime + (idx * 0.035);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, strikeTime);

      gain.gain.setValueAtTime(0.001, strikeTime);
      gain.gain.linearRampToValueAtTime(0.18, strikeTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 1.4);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(strikeTime);
      osc.stop(strikeTime + 1.5);
      this.activeNodes.push(osc);
    });

    // =========================================================================
    // 6. Grand Harmonic Resolve / Victory Chord (8.2s - 9.8s)
    // =========================================================================
    const resolveTime = now + 8.15;
    // E Major 9th Lydian (E3, B3, E4, G#4, D#5, F#5)
    const victoryChord = [164.81, 246.94, 329.63, 415.30, 622.25, 739.99];

    victoryChord.forEach((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, resolveTime);

      gain.gain.setValueAtTime(0.001, resolveTime);
      gain.gain.linearRampToValueAtTime(0.14, resolveTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, resolveTime + 1.6);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(resolveTime);
      osc.stop(resolveTime + 1.7);
      this.activeNodes.push(osc);
    });

    if (onFinish) {
      setTimeout(onFinish, 9800);
    }
  }

  /**
   * Standalone Shockwave Impact (can be triggered precisely when AI data arrives)
   */
  playImpactBurst() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.8, now);
    masterGain.connect(ctx.destination);

    // Deep Sub Punch
    const subPunch = ctx.createOscillator();
    const subPunchGain = ctx.createGain();
    subPunch.type = 'sine';
    subPunch.frequency.setValueAtTime(140, now);
    subPunch.frequency.exponentialRampToValueAtTime(36, now + 0.45);

    subPunchGain.gain.setValueAtTime(0.7, now);
    subPunchGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

    subPunch.connect(subPunchGain);
    subPunchGain.connect(masterGain);
    subPunch.start(now);
    subPunch.stop(now + 1.2);
    this.activeNodes.push(subPunch);

    // Shockwave Noise
    this.createImpactNoise(ctx, masterGain, now, 1.4);

    // Victory Sparkle Chord
    const chord = [329.63, 415.30, 493.88, 659.25, 987.77]; // E maj
    chord.forEach((f, idx) => {
      const t = now + (idx * 0.03);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 1.6);
      this.activeNodes.push(osc);
    });
  }

  createImpactNoise(ctx, dest, startTime, duration) {
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.25));
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4500, startTime);
    filter.frequency.exponentialRampToValueAtTime(300, startTime + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, startTime);
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
