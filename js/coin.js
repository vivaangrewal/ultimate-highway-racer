import * as THREE from 'three';
import { LANE_POSITIONS, SPAWN_DISTANCE, DESPAWN_DISTANCE, COLLECT_RADIUS, COIN_SPAWN_INTERVAL } from './constants.js';

export class CoinManager {
  constructor(scene) {
    this.scene = scene;
    this.coins = [];
    this.spawnTimer = 0;
    this.movingCoins = false;

    const geo = new THREE.CylinderGeometry(0.45, 0.45, 0.08, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffcc00, metalness: 0.9, roughness: 0.15,
      emissive: 0xff8800, emissiveIntensity: 0.15,
    });
    this.template = new THREE.Mesh(geo, mat);
  }

  setMoving(enabled) {
    this.movingCoins = enabled;
  }

  spawnPattern() {
    if (Math.random() < 0.55) {
      const lane = Math.floor(Math.random() * 3);
      const c = this.template.clone();
      c.position.set(LANE_POSITIONS[lane], 1.0, SPAWN_DISTANCE);
      c.rotation.x = Math.PI / 2;
      c.userData = {
        baseX: LANE_POSITIONS[lane],
        moveDir: this.movingCoins ? (Math.random() > 0.5 ? 1 : -1) : 0,
        moveSpeed: this.movingCoins ? 2 + Math.random() * 3 : 0,
        moveRange: this.movingCoins ? 3.5 : 0,
        time: 0,
      };
      this.scene.add(c);
      this.coins.push(c);
    } else {
      const startLane = Math.floor(Math.random() * 3);
      for (let i = 0; i < 4; i++) {
        const lane = (startLane + i) % 3;
        const c = this.template.clone();
        c.position.set(LANE_POSITIONS[lane], 1.0, SPAWN_DISTANCE + i * 3);
        c.rotation.x = Math.PI / 2;
        c.userData = {
          baseX: LANE_POSITIONS[lane],
          moveDir: this.movingCoins ? (Math.random() > 0.5 ? 1 : -1) : 0,
          moveSpeed: this.movingCoins ? 2 + Math.random() * 3 : 0,
          moveRange: this.movingCoins ? 3.5 : 0,
          time: 0,
        };
        this.scene.add(c);
        this.coins.push(c);
      }
    }
  }

  update(worldSpeed, deltaTime) {
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= COIN_SPAWN_INTERVAL) {
      this.spawnPattern();
      this.spawnTimer = 0;
    }

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      c.position.z += worldSpeed * deltaTime;
      c.rotation.z += deltaTime * 4;

      if (c.userData.moveDir !== 0) {
        c.userData.time += deltaTime;
        c.position.x = c.userData.baseX + Math.sin(c.userData.time * c.userData.moveSpeed) * c.userData.moveRange;
      }

      if (c.position.z > DESPAWN_DISTANCE) {
        this.scene.remove(c);
        this.coins.splice(i, 1);
      }
    }
  }

  checkCollection(playerPos) {
    let count = 0;
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      const dx = playerPos.x - c.position.x;
      const dz = playerPos.z - c.position.z;
      if (dx * dx + dz * dz < COLLECT_RADIUS * COLLECT_RADIUS) {
        this.scene.remove(c);
        this.coins.splice(i, 1);
        count++;
      }
    }
    return count;
  }

  reset() {
    for (const c of this.coins) this.scene.remove(c);
    this.coins = [];
    this.spawnTimer = 0;
  }
}
