export class AudioManager {
  constructor() {
    this.ctx = null;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Audio not available');
    }
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    this.engineGain = null;
    this.engineRunning = false;
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  tone(freq, dur, type, vol) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + dur);
  }

  playCoinPickup() {
    this.tone(880, 0.08, 'sine', 0.12);
    setTimeout(() => this.tone(1320, 0.1, 'sine', 0.1), 40);
  }

  playCrash() {
    this.tone(100, 0.25, 'sawtooth', 0.15);
    this.tone(55, 0.35, 'square', 0.1);
  }

  playNitro() {
    this.tone(180, 0.4, 'sawtooth', 0.08);
    setTimeout(() => this.tone(300, 0.3, 'sawtooth', 0.06), 100);
  }

  startEngine() {
    if (!this.ctx || this.engineRunning) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.value = 0;
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc1.type = 'sawtooth';
      this.engineOsc1.frequency.value = 60;
      this.engineOsc1.connect(this.engineGain);
      this.engineOsc1.start();

      this.engineOsc2 = this.ctx.createOscillator();
      this.engineOsc2.type = 'square';
      this.engineOsc2.frequency.value = 30;
      const gain2 = this.ctx.createGain();
      gain2.gain.value = 0.3;
      this.engineOsc2.connect(gain2);
      gain2.connect(this.engineGain);
      this.engineOsc2.start();

      this.engineRunning = true;
    } catch (e) {
      console.warn('Engine sound failed:', e);
      this.engineOsc1 = null;
      this.engineOsc2 = null;
      this.engineGain = null;
      this.engineRunning = false;
    }
  }

  stopEngine() {
    if (!this.engineRunning) return;
    try {
      if (this.engineOsc1) { this.engineOsc1.stop(); this.engineOsc1.disconnect(); }
      if (this.engineOsc2) { this.engineOsc2.stop(); this.engineOsc2.disconnect(); }
      if (this.engineGain) this.engineGain.disconnect();
    } catch (e) {}
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    this.engineGain = null;
    this.engineRunning = false;
  }

  updateEngine(speed, maxSpeed, nitro) {
    if (!this.engineRunning || !this.engineGain) return;
    const pct = Math.min(speed / maxSpeed, 1.0);
    const freq = 55 + pct * 180;
    const vol = 0.02 + pct * 0.06;
    this.engineOsc1.frequency.value = freq;
    this.engineOsc2.frequency.value = freq * 0.5;
    const targetVol = nitro ? vol * 1.5 : vol;
    this.engineGain.gain.value += (targetVol - this.engineGain.gain.value) * 0.1;
  }
}
