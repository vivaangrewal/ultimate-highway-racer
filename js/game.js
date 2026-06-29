import * as THREE from 'three';
import { Road } from './road.js';
import { PlayerCar } from './player.js';
import { TrafficManager } from './traffic.js';
import { CoinManager } from './coin.js';
import { UIManager } from './ui.js';
import { AudioManager } from './audio.js';
import { SaveManager } from './save.js';
import { Garage } from './garage.js';
import {
  DIFFICULTY, WORLD_SPEED_FACTOR, NITRO_DURATION,
  ACCELERATION, BRAKE_DECELERATION, FRICTION, LEVELS,
} from './constants.js';

export class Game {
  constructor() {
    this.ui = new UIManager();
    this.audio = new AudioManager();
    this.save = new SaveManager();
    this.garage = new Garage(this.save);
    this.ui.setGarage(this.garage);

    this.state = 'MENU';
    this.difficulty = DIFFICULTY.medium;
    this.diffKey = 'medium';
    this.username = 'Driver';

    this.speed = 0;
    this.targetSpeed = 0;
    this.topSpeed = 0;
    this.score = 0;
    this.distance = 0;
    this.coinCount = 0;
    this.worldSpeed = 0;
    this.nitroActive = false;
    this.nitroTimer = 0;

    this.currentLevel = 0;
    this.levelUnlocked = 1;

    this.keys = {};
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.road = null;
    this.player = null;
    this.traffic = null;
    this.coins = null;

    this.rain = null;
    this.rainCount = 800;
    this.lightningTimer = 0;
    this.lightningFlashing = false;
    this.lightningRestoreTime = 0;
    this.nameSprite = null;

    this.shakeAmount = 0;

    this.clock = new THREE.Clock();
    this.setupControls();
  }

  init(canvas) {
    try {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x87CEEB);
      this.scene.fog = new THREE.Fog(0x87CEEB, 80, 350);

      this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 600);
      this.camera.position.set(0, 6, 10);
      this.camera.lookAt(0, 0, -8);

      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.0;

      this.ambientLight = new THREE.AmbientLight(0x404060, 0.4);
      this.scene.add(this.ambientLight);
      this.hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x445533, 0.6);
      this.scene.add(this.hemiLight);

      const sun = new THREE.DirectionalLight(0xffeedd, 1.5);
      sun.position.set(40, 80, 30);
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      const sc = sun.shadow.camera;
      sc.left = -50; sc.right = 50; sc.top = 50; sc.bottom = -50;
      sc.near = 1; sc.far = 200;
      this.sunLight = sun;
      this.scene.add(sun);
    } catch(e) { console.error('Scene setup failed:', e); }

    try { this.traffic = new TrafficManager(this.scene); this.traffic.setDifficulty(this.difficulty); } catch(e) { console.error('Traffic failed:', e); }
    try { this.road = new Road(this.scene, this.difficulty); } catch(e) { console.error('Road failed:', e); }
    try { this.player = new PlayerCar(this.scene); } catch(e) { console.error('Player failed:', e); }
    try {
      const veh = this.garage.getSelectedVehicle();
      if (veh && this.player) this.player.applyVehicle(veh);
    } catch(e) { console.error('Vehicle apply failed:', e); }
    try { this.coins = new CoinManager(this.scene); } catch(e) { console.error('Coins failed:', e); }
    try { this.initRain(); } catch(e) { console.error('Rain failed:', e); }
    try { this.createNameSprite(); } catch(e) { console.error('Name sprite failed:', e); }

    window.addEventListener('resize', () => {
      if (this.camera) { this.camera.aspect = window.innerWidth / window.innerHeight; this.camera.updateProjectionMatrix(); }
      if (this.renderer) this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  initRain() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.rainCount * 3);
    for (let i = 0; i < this.rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = Math.random() * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xaaaacc, size: 0.12, transparent: true, opacity: 0.5 });
    this.rain = new THREE.Points(geo, mat);
    this.rain.visible = false;
    this.scene.add(this.rain);
  }

  drawNameBg(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(4, 4, 248, 56, 10);
    } else {
      ctx.rect(4, 4, 248, 56);
    }
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.username, 128, 32);
  }

  createNameSprite() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      this.drawNameBg(ctx);
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
      this.nameSprite = new THREE.Sprite(material);
      this.nameSprite.scale.set(3, 0.75, 1);
      this.nameSprite.position.y = 2.5;
      this.nameSprite.visible = false;
      this.scene.add(this.nameSprite);
    } catch(e) {
      console.warn('Name sprite failed:', e);
      this.nameSprite = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true }));
      this.nameSprite.visible = false;
      this.scene.add(this.nameSprite);
    }
  }

  updateNameSprite(name) {
    this.username = name || 'Driver';
    if (!this.nameSprite) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      this.drawNameBg(ctx);
      this.nameSprite.material.map.image = canvas;
      this.nameSprite.material.map.needsUpdate = true;
    } catch(e) { console.warn('Name sprite update:', e); }
  }

  setupControls() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      if (e.key === 'Escape') {
        if (this.state === 'PLAYING') this.pauseGame();
        else if (this.state === 'PAUSED') this.resumeGame();
      }
      if (e.key === ' ') { e.preventDefault(); if (this.state === 'PLAYING') this.activateNitro(); }
    });
    document.addEventListener('keyup', (e) => { this.keys[e.key] = false; });

    let tx = 0;
    document.addEventListener('touchstart', (e) => { if (this.state === 'PLAYING') tx = e.touches[0].clientX; });
    document.addEventListener('touchend', (e) => {
      if (this.state !== 'PLAYING') return;
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 20) this.player.switchLane(dx > 0 ? 1 : -1);
      else this.activateNitro();
    });
  }

  startGame(diffKey, username) {
    this.diffKey = diffKey || 'medium';
    this.difficulty = DIFFICULTY[this.diffKey];
    this.username = username || 'Driver';
    this.state = 'PLAYING';
    this.speed = this.difficulty.baseSpeed * 0.3;
    this.targetSpeed = this.difficulty.baseSpeed;
    this.topSpeed = 0;
    this.score = 0;
    this.distance = 0;
    this.coinCount = 0;
    this.worldSpeed = 0;
    this.nitroActive = false;
    this.nitroTimer = 0;
    this.currentLevel = 0;
    this.shakeAmount = 0;

    try { this.traffic.setDifficulty(this.difficulty); } catch(e) { console.warn('traffic setup:', e); }

    const lvl = LEVELS[0];
    this.scene.background.setHex(lvl.sky);
    this.scene.fog.color.setHex(lvl.fog);
    this.scene.fog.near = lvl.fogNear;
    this.scene.fog.far = lvl.fogFar;

    try {
      const oldRoad = this.road;
      if (oldRoad) { for (const s of oldRoad.segments) this.scene.remove(s); }
      this.road = new Road(this.scene, this.difficulty, lvl.env);
    } catch(e) { console.warn('road setup:', e); }

    try {
      const veh = this.garage.getSelectedVehicle();
      if (veh && this.player) this.player.applyVehicle(veh);
      if (this.player) this.player.reset();
    } catch(e) { console.warn('vehicle setup:', e); }

    try {
      this.coins.setMoving(this.difficulty.movingCoins);
      this.coins.reset();
    } catch(e) { console.warn('coins setup:', e); }

    this.updateNameSprite(this.username);
    this.nameSprite.visible = true;

    this.rain.visible = false;
    this.lightningTimer = 0;
    this.lightningFlashing = false;

    this.ui.showHUD();
    this.ui.setDifficultyBadge(this.diffKey);
    this.ui.updateLevel(lvl);
    this.audio.resume();
    try { this.audio.startEngine(); } catch(e) { console.warn('Engine sound init failed:', e); }
    this.clock.getDelta();
  }

  pauseGame() { if (this.state !== 'PLAYING') return; this.state = 'PAUSED'; this.ui.showPause(); }
  resumeGame() { if (this.state !== 'PAUSED') return; this.state = 'PLAYING'; this.ui.hidePause(); this.clock.getDelta(); }

  showMenu() {
    this.state = 'MENU';
    this.ui.showMainMenu();
    this.audio.stopEngine();
    if (this.player) this.player.setFireActive(false);
    if (this.nameSprite) this.nameSprite.visible = false;
    if (this.rain) this.rain.visible = false;
    if (this.road) this.road.reset();
    if (this.player) this.player.reset();
    if (this.traffic) this.traffic.reset();
    if (this.coins) this.coins.reset();
  }

  activateNitro() {
    if (this.nitroActive) return;
    this.nitroActive = true;
    this.nitroTimer = NITRO_DURATION;
    this.speed += this.difficulty.nitroBoost;
    this.audio.playNitro();
    if (this.player) this.player.setFireActive(true);
  }

  handleInput(dt) {
    if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) { this.player.switchLane(-1); this.keys['ArrowLeft'] = this.keys['a'] = this.keys['A'] = false; }
    if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) { this.player.switchLane(1); this.keys['ArrowRight'] = this.keys['d'] = this.keys['D'] = false; }

    if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
      this.targetSpeed = Math.min(this.difficulty.maxSpeed, this.targetSpeed + ACCELERATION * dt);
    } else if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
      this.targetSpeed = Math.max(10, this.targetSpeed - BRAKE_DECELERATION * dt);
    } else {
      this.targetSpeed = Math.min(this.difficulty.maxSpeed, this.targetSpeed + this.difficulty.speedIncrement * dt * 60);
    }
  }

  checkLevelUp() {
    let newLevel = 0;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (this.distance >= LEVELS[i].dist) { newLevel = i; break; }
    }
    if (newLevel !== this.currentLevel) {
      this.currentLevel = newLevel;
      const lvl = LEVELS[newLevel];

      this.scene.background.setHex(lvl.sky);
      this.scene.fog.color.setHex(lvl.fog);
      this.scene.fog.near = lvl.fogNear;
      this.scene.fog.far = lvl.fogFar;
      this.road.setEnvironment(lvl.env, lvl.grass, lvl.roadColor);

      if (lvl.weather === 'rain' || lvl.weather === 'thunderstorm') {
        this.rain.visible = true;
      } else {
        this.rain.visible = false;
      }
      if (lvl.weather === 'thunderstorm') {
        this.lightningTimer = 2 + Math.random() * 3;
      } else {
        this.lightningTimer = 0;
      }

      this.ui.updateLevel(lvl);
    }
  }

  updateWeather(dt) {
    if (!this.rain.visible) return;

    const positions = this.rain.geometry.attributes.position.array;
    for (let i = 0; i < this.rainCount; i++) {
      positions[i * 3 + 1] -= 0.5 + Math.random() * 0.3;
      positions[i * 3] += (Math.random() - 0.5) * 0.05;
      if (positions[i * 3 + 1] < -5) {
        positions[i * 3 + 1] = 45 + Math.random() * 10;
        positions[i * 3] = (Math.random() - 0.5) * 60;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
      }
    }
    this.rain.geometry.attributes.position.needsUpdate = true;

    if (this.lightningTimer > 0) {
      this.lightningTimer -= dt;
      if (this.lightningTimer <= 0) {
        this.lightningFlashing = true;
        this.lightningRestoreTime = 0.08 + Math.random() * 0.12;
        this.scene.background.setHex(0xffffff);
        this.ambientLight.intensity = 3.0;
        this.sunLight.intensity = 4.0;
      }
    }
    if (this.lightningFlashing) {
      this.lightningRestoreTime -= dt;
      if (this.lightningRestoreTime <= 0) {
        this.lightningFlashing = false;
        const lvl = LEVELS[this.currentLevel];
        this.scene.background.setHex(lvl.sky);
        this.ambientLight.intensity = 0.4;
        this.sunLight.intensity = 1.5;
        this.lightningTimer = 2 + Math.random() * 5;
      }
    }
  }

  update() {
    if (this.state !== 'PLAYING') return;
    try {
      const dt = Math.min(this.clock.getDelta(), 0.05);

      this.handleInput(dt);

      if (this.speed < this.targetSpeed) this.speed = Math.min(this.targetSpeed, this.speed + ACCELERATION * dt);
      else if (this.speed > this.targetSpeed) this.speed = Math.max(this.targetSpeed, this.speed - FRICTION * dt);

      if (this.nitroActive) {
        this.nitroTimer -= dt;
        if (this.nitroTimer <= 0) {
          this.nitroActive = false;
          if (this.player) this.player.setFireActive(false);
        }
      }
      if (this.speed > this.topSpeed) this.topSpeed = this.speed;

      this.worldSpeed = this.speed * WORLD_SPEED_FACTOR;
      this.distance += this.worldSpeed * dt * 5;
      this.score = Math.floor(this.distance * 0.1) + this.coinCount * 5;

      this.checkLevelUp();
      this.updateWeather(dt);

      this.road.update(this.worldSpeed, dt);
      this.player.update(dt);
      this.traffic.update(this.worldSpeed, dt);
      this.coins.update(this.worldSpeed, dt);

      if (this.nameSprite.visible) {
        this.nameSprite.position.x = this.player.x;
        this.nameSprite.position.z = this.player.z;
      }

      const coinsGained = this.coins.checkCollection(this.player.getPosition());
      if (coinsGained > 0) { this.coinCount += coinsGained; this.audio.playCoinPickup(); }

      if (this.traffic.checkCollision(this.player.getCollisionBox())) {
        this.player.takeDamage(this.difficulty.collisionDamage);
        this.audio.playCrash();
        this.shakeAmount = 0.4;
        if (this.player.health <= 0) { this.gameOver(); return; }
      }

      let camX = this.player.x * 0.3;
      let camY = 6;
      if (this.shakeAmount > 0) {
        camX += (Math.random() - 0.5) * this.shakeAmount;
        camY += (Math.random() - 0.5) * this.shakeAmount * 0.5;
        this.shakeAmount *= 0.88;
        if (this.shakeAmount < 0.01) this.shakeAmount = 0;
      }

      this.camera.position.x += (camX - this.camera.position.x) * 0.08;
      this.camera.position.y += (camY - this.camera.position.y) * 0.08;
      this.camera.lookAt(this.player.x * 0.1, 0.5, -8);

      this.ui.updateHUD({
        speed: this.speed, maxSpeed: this.difficulty.maxSpeed,
        score: this.score, coins: this.coinCount,
        health: this.player.health, maxHealth: this.player.maxHealth,
        distance: this.distance,
        nitroActive: this.nitroActive, nitroTimer: this.nitroTimer, nitroMaxTimer: NITRO_DURATION,
      });

      this.audio.updateEngine(this.speed, this.difficulty.maxSpeed, this.nitroActive);
    } catch(e) {
      console.error('Update error:', e);
    }
  }

  gameOver() {
    this.state = 'GAME_OVER';
    this.nameSprite.visible = false;
    this.rain.visible = false;
    this.audio.stopEngine();
    if (this.player) this.player.setFireActive(false);
    this.save.saveScore(this.score);
    this.save.addCoins(this.coinCount);
    this.audio.playCrash();
    this.ui.showGameOverData({
      username: this.username, score: this.score,
      distance: this.distance, coins: this.coinCount,
      topSpeed: this.topSpeed, bestScore: this.save.getBestScore(),
    });
  }

  render() {
    if (this.renderer && this.scene && this.camera) this.renderer.render(this.scene, this.camera);
  }
}
