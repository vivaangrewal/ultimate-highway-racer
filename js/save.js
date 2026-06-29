export class SaveManager {
  constructor() {
    this.prefix = 'uhr_';
  }

  set(key, value) {
    try { localStorage.setItem(this.prefix + key, JSON.stringify(value)); } catch (_) {}
  }

  get(key, def) {
    try {
      const v = localStorage.getItem(this.prefix + key);
      return v !== null ? JSON.parse(v) : def;
    } catch (_) { return def; }
  }

  saveScore(score) {
    const best = this.get('bestScore', 0);
    if (score > best) this.set('bestScore', score);
    this.set('lastScore', score);
  }

  getBestScore() { return this.get('bestScore', 0); }

  addCoins(coins) {
    const total = this.get('totalCoins', 0);
    this.set('totalCoins', total + coins);
  }

  getTotalCoins() { return this.get('totalCoins', 0); }

  getGarage() { return this.get('garage', null); }
  saveGarage(data) { this.set('garage', data); }
}
