/**
 * Constellation Skill Forge - Procedural Web Audio Synthesizer
 * High-performance, zero-latency audio synthesis for skill matrix animations
 */

class ConstellationAudioSynthesizer {
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
   * Option 1: Cosmic Astral & Crystal Chime (กลุ่มดาวและคริสตัลอวกาศ)
   */
  playCosmicCrystal(onFinish) {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    this.stopAll();

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.7, now);
    masterGain.connect(ctx.destination);

    // 1. Warm Cosmic Sub Ambient Hum
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(110, now); // A2
    subOsc.frequency.exponentialRampToValueAtTime(220, now + 3.2); // Glide up to A3

    subGain.gain.setValueAtTime(0.01, now);
    subGain.gain.linearRampToValueAtTime(0.12, now + 1.5);
    subGain.gain.linearRampToValueAtTime(0.18, now + 3.0);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 4.2);

    subOsc.connect(subGain);
    subGain.connect(masterGain);
    subOsc.start(now);
    subOsc.stop(now + 4.5);
    this.activeNodes.push(subOsc);

    // 2. 5 Star Nodes Connection Chimes (Pentatonic: C5, D5, F5, G5, A5)
    const starPitches = [523.25, 587.33, 698.46, 783.99, 880.00];
    const starTimes = [0.2, 0.8, 1.4, 2.0, 2.6];

    starTimes.forEach((t, i) => {
      const starTime = now + t;
      const freq = starPitches[i];

      // Primary Glass Tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, starTime);

      // Bell Overtone (Inharmonic 2.76x for crystal bell characteristic)
      const overtone = ctx.createOscillator();
      const overGain = ctx.createGain();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 2.76, starTime);

      gain.gain.setValueAtTime(0.001, starTime);
      gain.gain.linearRampToValueAtTime(0.14, starTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, starTime + 0.9);

      overGain.gain.setValueAtTime(0.001, starTime);
      overGain.gain.linearRampToValueAtTime(0.06, starTime + 0.01);
      overGain.gain.exponentialRampToValueAtTime(0.001, starTime + 0.4);

      osc.connect(gain);
      overtone.connect(overGain);
      gain.connect(masterGain);
      overGain.connect(masterGain);

      osc.start(starTime);
      osc.stop(starTime + 1.0);
      overtone.start(starTime);
      overtone.stop(starTime + 0.5);
      this.activeNodes.push(osc, overtone);
    });

    // 3. Constellation Aligned Reveal Burst (at 3.2s)
    const burstTime = now + 3.2;
    const burstChord = [523.25, 659.25, 783.99, 987.77, 1318.51, 1567.98]; // C Maj9 arpeggio
    burstChord.forEach((f, idx) => {
      const noteTime = burstTime + idx * 0.035;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 2.2);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(noteTime);
      osc.stop(noteTime + 2.5);
      this.activeNodes.push(osc);
    });

    // Ethereal Sparkle Shimmer Noise
    this.createSparkleSweep(ctx, masterGain, burstTime, 1.8);

    if (onFinish) setTimeout(onFinish, 4500);
  }

  /**
   * Option 2: High-Tech Cyber Scan (แนวไซไฟ AI Matrix)
   */
  playCyberMatrix(onFinish) {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    this.stopAll();

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.65, now);
    masterGain.connect(ctx.destination);

    // 1. Cyber Scanning Data Pulses
    const pulseCount = 14;
    for (let i = 0; i < pulseCount; i++) {
      const t = now + (i * 0.2);
      const freq = 400 + Math.pow(i / pulseCount, 1.5) * 1200;

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = i % 2 === 0 ? 'triangle' : 'square';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.2, t);
      filter.Q.setValueAtTime(3, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.09, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start(t);
      osc.stop(t + 0.15);
      this.activeNodes.push(osc);
    }

    // 2. Futuristic Power Sweep
    const sweepOsc = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweepOsc.type = 'sawtooth';
    sweepOsc.frequency.setValueAtTime(150, now);
    sweepOsc.frequency.exponentialRampToValueAtTime(1400, now + 3.0);

    const sweepFilter = ctx.createBiquadFilter();
    sweepFilter.type = 'lowpass';
    sweepFilter.frequency.setValueAtTime(300, now);
    sweepFilter.frequency.exponentialRampToValueAtTime(3000, now + 3.0);

    sweepGain.gain.setValueAtTime(0.01, now);
    sweepGain.gain.linearRampToValueAtTime(0.08, now + 2.2);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 3.1);

    sweepOsc.connect(sweepFilter);
    sweepFilter.connect(sweepGain);
    sweepGain.connect(masterGain);
    sweepOsc.start(now);
    sweepOsc.stop(now + 3.2);
    this.activeNodes.push(sweepOsc);

    // 3. Hologram Confirmation Tone (at 3.1s)
    const revealTime = now + 3.1;
    const cyberChords = [880, 1108.73, 1318.51, 1760]; // A major cyber chime
    cyberChords.forEach(f => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, revealTime);

      gain.gain.setValueAtTime(0.001, revealTime);
      gain.gain.linearRampToValueAtTime(0.16, revealTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, revealTime + 1.4);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(revealTime);
      osc.stop(revealTime + 1.6);
      this.activeNodes.push(osc);
    });

    if (onFinish) setTimeout(onFinish, 4200);
  }

  /**
   * Option 3: Magic Fantasy & Chimes (แนวเวทมนตร์และพิณแก้ว)
   */
  playMagicFantasy(onFinish) {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    this.stopAll();

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.7, now);
    masterGain.connect(ctx.destination);

    // 1. Ascending Harp Glissando (12 Plucks across D major scale)
    const harpNotes = [
      293.66, 329.63, 369.99, 440.00, 493.88, 587.33,
      659.25, 739.99, 880.00, 987.77, 1174.66, 1318.51
    ];

    harpNotes.forEach((freq, idx) => {
      const pluckTime = now + (idx * 0.22);
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, pluckTime);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, pluckTime);

      gain.gain.setValueAtTime(0.001, pluckTime);
      gain.gain.linearRampToValueAtTime(0.12, pluckTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, pluckTime + 0.7);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(masterGain);

      osc1.start(pluckTime);
      osc1.stop(pluckTime + 0.8);
      osc2.start(pluckTime);
      osc2.stop(pluckTime + 0.8);
      this.activeNodes.push(osc1, osc2);
    });

    // 2. Fairy Wind Chimes Tinkling (Random twinkling between 2.5kHz and 6kHz)
    for (let j = 0; j < 10; j++) {
      const chimeTime = now + 0.5 + Math.random() * 2.5;
      const chimeFreq = 2200 + Math.random() * 3800;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(chimeFreq, chimeTime);

      gain.gain.setValueAtTime(0.001, chimeTime);
      gain.gain.linearRampToValueAtTime(0.05, chimeTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, chimeTime + 0.35);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(chimeTime);
      osc.stop(chimeTime + 0.4);
      this.activeNodes.push(osc);
    }

    // 3. Triumphal Major 9th Chime Chord (at 3.1s)
    const revealTime = now + 3.1;
    const finalChord = [587.33, 739.99, 880.00, 1108.73, 1318.51]; // D maj9
    finalChord.forEach(f => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, revealTime);

      gain.gain.setValueAtTime(0.001, revealTime);
      gain.gain.linearRampToValueAtTime(0.18, revealTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, revealTime + 2.5);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(revealTime);
      osc.stop(revealTime + 2.8);
      this.activeNodes.push(osc);
    });

    if (onFinish) setTimeout(onFinish, 4500);
  }

  createSparkleSweep(ctx, dest, startTime, duration) {
    const bufferSize = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, startTime);
    filter.frequency.exponentialRampToValueAtTime(6500, startTime + duration);
    filter.Q.setValueAtTime(5, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.06, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    whiteNoise.start(startTime);
    whiteNoise.stop(startTime + duration);
    this.activeNodes.push(whiteNoise);
  }
}

export const constellationAudio = new ConstellationAudioSynthesizer();
