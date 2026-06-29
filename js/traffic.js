import * as THREE from 'three';
import { LANE_POSITIONS, SPAWN_DISTANCE, DESPAWN_DISTANCE, COLLISION_X_THRESHOLD, COLLISION_Z_THRESHOLD, ONCOMING_LANES, ONCOMING_OFFSET } from './constants.js';

const COLORS = [
  0x2255aa, 0x44aa33, 0xaa2244, 0x887733, 0x6633aa,
  0x228888, 0xaa5522, 0x8899bb, 0xbb7722, 0x334455,
  0xcc3333, 0x33cc66, 0x3366cc, 0xddaa00, 0xffffff,
];

const _wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.16, 10);
const _bikeWheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 10);
const _wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
const _glassMat = new THREE.MeshStandardMaterial({ color: 0x88bbee, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.4 });
const _chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.05, metalness: 0.95 });
const _hlMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
const _tlMat = new THREE.MeshBasicMaterial({ color: 0xff1111 });

function addMesh(g, geo, mat, x, y, z, shadow) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (shadow) m.castShadow = true;
  g.add(m);
  return m;
}

function addWheels(g, pos, geo) {
  const wg = geo || _wheelGeo;
  for (const p of pos) {
    const w = new THREE.Mesh(wg, _wheelMat);
    w.rotation.x = Math.PI / 2;
    w.position.set(p[0], p[1], p[2]);
    g.add(w);
  }
}

function makeSedan(c) {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.2, metalness: 0.75 });
  addMesh(g, new THREE.BoxGeometry(1.8, 0.32, 4.2), m, 0, 0.26, 0, true);
  addMesh(g, new THREE.BoxGeometry(1.7, 0.1, 1.3), m, 0, 0.48, -1.1);
  addMesh(g, new THREE.BoxGeometry(1.7, 0.12, 0.9), m, 0, 0.49, 1.3);
  addMesh(g, new THREE.BoxGeometry(1.55, 0.3, 1.8), _glassMat, 0, 0.6, 0);
  addMesh(g, new THREE.BoxGeometry(1.85, 0.15, 0.08), _chromeMat, 0, 0.2, -2.12);
  for (const s of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.28, 0.12, 0.05), _hlMat, s * 0.7, 0.32, -2.1);
    addMesh(g, new THREE.BoxGeometry(0.22, 0.1, 0.05), _tlMat, s * 0.72, 0.32, 2.1);
  }
  addWheels(g, [[-0.95, 0.14, -1.3], [0.95, 0.14, -1.3], [-0.95, 0.14, 1.3], [0.95, 0.14, 1.3]]);
  return g;
}

function makeSUV(c) {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.25, metalness: 0.7 });
  addMesh(g, new THREE.BoxGeometry(1.9, 0.4, 4.5), m, 0, 0.32, 0, true);
  addMesh(g, new THREE.BoxGeometry(1.7, 0.38, 2.6), _glassMat, 0, 0.72, 0);
  addMesh(g, new THREE.BoxGeometry(1.65, 0.06, 2.4), m, 0, 0.92, 0);
  addMesh(g, new THREE.BoxGeometry(1.95, 0.18, 0.08), _chromeMat, 0, 0.24, -2.28);
  for (const s of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.3, 0.14, 0.05), _hlMat, s * 0.72, 0.38, -2.26);
    addMesh(g, new THREE.BoxGeometry(0.24, 0.1, 0.05), _tlMat, s * 0.74, 0.38, 2.26);
  }
  addWheels(g, [[-1.0, 0.18, -1.4], [1.0, 0.18, -1.4], [-1.0, 0.18, 1.4], [1.0, 0.18, 1.4]]);
  return g;
}

function makeTruck(c) {
  const g = new THREE.Group();
  const cm = new THREE.MeshStandardMaterial({ color: c, roughness: 0.3, metalness: 0.6 });
  const cargo = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 3.0), new THREE.MeshStandardMaterial({ color: 0x667788, roughness: 0.5 }));
  cargo.position.set(0, 0.8, 1.0); cargo.castShadow = true; g.add(cargo);
  addMesh(g, new THREE.BoxGeometry(2.0, 0.6, 1.6), cm, 0, 0.6, -1.4, true);
  addMesh(g, new THREE.BoxGeometry(1.8, 0.3, 1.2), _glassMat, 0, 0.95, -1.3);
  for (const s of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.3, 0.16, 0.06), _hlMat, s * 0.75, 0.35, -2.2);
    addMesh(g, new THREE.BoxGeometry(0.2, 0.12, 0.06), _tlMat, s * 0.8, 0.55, 2.52);
  }
  addWheels(g, [[-1.05, 0.2, -1.5], [1.05, 0.2, -1.5], [-1.05, 0.2, 1.8], [1.05, 0.2, 1.8]]);
  return g;
}

function makeBus(c) {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.35, metalness: 0.5 });
  addMesh(g, new THREE.BoxGeometry(2.0, 1.1, 5.5), m, 0, 0.75, 0, true);
  for (let i = -2; i <= 2; i++) {
    for (const s of [-1, 1]) {
      addMesh(g, new THREE.BoxGeometry(0.04, 0.3, 0.5), _glassMat, s * 1.02, 0.9, i * 1.0);
    }
  }
  addMesh(g, new THREE.BoxGeometry(2.0, 0.2, 0.1), _chromeMat, 0, 0.35, -2.77);
  for (const s of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.3, 0.14, 0.05), _hlMat, s * 0.7, 0.4, -2.76);
    addMesh(g, new THREE.BoxGeometry(0.2, 0.1, 0.05), _tlMat, s * 0.75, 0.4, 2.76);
  }
  addWheels(g, [[-1.05, 0.22, -1.8], [1.05, 0.22, -1.8], [-1.05, 0.22, 1.8], [1.05, 0.22, 1.8]]);
  return g;
}

function makeBike(c) {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.3, metalness: 0.7 });
  addMesh(g, new THREE.BoxGeometry(0.4, 0.3, 1.8), m, 0, 0.5, 0);
  addMesh(g, new THREE.BoxGeometry(0.35, 0.25, 0.6), _glassMat, 0, 0.7, -0.2);
  addMesh(g, new THREE.BoxGeometry(0.6, 0.08, 0.8), m, 0, 0.35, 0);
  addWheels(g, [[-0.3, 0.2, -0.7], [0.3, 0.2, -0.7], [-0.3, 0.2, 0.7], [0.3, 0.2, 0.7]]);
  return g;
}

function makeSportBike(c) {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.2, metalness: 0.8 });
  addMesh(g, new THREE.BoxGeometry(0.45, 0.25, 2.0), m, 0, 0.55, 0);
  addMesh(g, new THREE.BoxGeometry(0.4, 0.3, 0.5), _glassMat, 0, 0.75, -0.4);
  addMesh(g, new THREE.BoxGeometry(0.5, 0.06, 0.4), m, 0, 0.35, 0);
  addMesh(g, new THREE.BoxGeometry(0.08, 0.15, 0.8), _chromeMat, 0, 0.45, -0.3);
  const wGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 10);
  for (const p of [[-0.25, 0.2, -0.8], [0.25, 0.2, -0.8], [-0.25, 0.2, 0.8], [0.25, 0.2, 0.8]]) {
    const w = new THREE.Mesh(wGeo, _wheelMat);
    w.rotation.x = Math.PI / 2;
    w.position.set(p[0], p[1], p[2]);
    g.add(w);
  }
  return g;
}

function makeBicycle(c) {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.4, metalness: 0.6 });
  const frameGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 4);
  const f1 = new THREE.Mesh(frameGeo, m);
  f1.position.set(0, 0.55, 0); f1.rotation.x = 0.4; g.add(f1);
  const f2 = new THREE.Mesh(frameGeo, m);
  f2.position.set(0, 0.55, 0); f2.rotation.x = -0.4; g.add(f2);
  addMesh(g, new THREE.BoxGeometry(0.3, 0.05, 0.15), m, 0, 0.85, -0.2);
  const wGeo = new THREE.TorusGeometry(0.28, 0.03, 6, 12);
  for (const p of [[0, 0.28, -0.55], [0, 0.28, 0.55]]) {
    const w = new THREE.Mesh(wGeo, _wheelMat);
    w.position.set(p[0], p[1], p[2]);
    w.rotation.y = Math.PI / 2;
    g.add(w);
  }
  return g;
}

function makeSemi(c) {
  const g = new THREE.Group();
  const cm = new THREE.MeshStandardMaterial({ color: c, roughness: 0.3, metalness: 0.6 });
  const trailer = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.5, 6.0), new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5 }));
  trailer.position.set(0, 0.95, 1.5); trailer.castShadow = true; g.add(trailer);
  addMesh(g, new THREE.BoxGeometry(2.2, 0.7, 2.0), cm, 0, 0.65, -2.3, true);
  addMesh(g, new THREE.BoxGeometry(2.0, 0.35, 1.5), _glassMat, 0, 1.05, -2.2);
  for (const s of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.35, 0.18, 0.06), _hlMat, s * 0.8, 0.4, -3.32);
    addMesh(g, new THREE.BoxGeometry(0.25, 0.14, 0.06), _tlMat, s * 0.85, 0.6, 4.52);
  }
  addWheels(g, [[-1.1, 0.22, -2.8], [1.1, 0.22, -2.8], [-1.1, 0.22, 2.5], [1.1, 0.22, 2.5], [-1.1, 0.22, 3.5], [1.1, 0.22, 3.5]]);
  return g;
}

function makeFormula(c) {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.15, metalness: 0.85 });
  addMesh(g, new THREE.BoxGeometry(1.6, 0.2, 3.5), m, 0, 0.25, 0, true);
  addMesh(g, new THREE.BoxGeometry(1.0, 0.15, 0.8), _glassMat, 0, 0.42, -0.3);
  addMesh(g, new THREE.BoxGeometry(1.6, 0.08, 0.4), m, 0, 0.35, 1.5);
  addMesh(g, new THREE.BoxGeometry(0.5, 0.25, 0.15), _chromeMat, 0, 0.3, -1.75);
  for (const s of [-1, 1]) {
    addMesh(g, new THREE.BoxGeometry(0.2, 0.1, 0.05), _hlMat, s * 0.6, 0.28, -1.74);
    addMesh(g, new THREE.BoxGeometry(0.18, 0.08, 0.05), _tlMat, s * 0.6, 0.28, 1.74);
  }
  const wGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.14, 10);
  for (const p of [[-0.85, 0.14, -1.0], [0.85, 0.14, -1.0], [-0.85, 0.14, 1.0], [0.85, 0.14, 1.0]]) {
    const w = new THREE.Mesh(wGeo, _wheelMat);
    w.rotation.x = Math.PI / 2;
    w.position.set(p[0], p[1], p[2]);
    g.add(w);
  }
  return g;
}

const BUILDERS = {
  sedan: makeSedan, suv: makeSUV, muscle: makeSedan, supercar: makeSedan, hatchback: makeSedan,
  pickup: makeTruck, semi: makeSemi, tanker: makeTruck,
  city_bus: makeBus, school_bus: makeBus, tour_bus: makeBus,
  sport_bike: makeSportBike, chopper: makeBike, dirt_bike: makeBike,
  bicycle: makeBicycle, formula: makeFormula,
};

function randomColor() { return COLORS[Math.floor(Math.random() * COLORS.length)]; }

export class TrafficManager {
  constructor(scene) {
    this.scene = scene;
    this.cars = [];
    this.spawnTimer = 0;
    this.nextSpawn = 1.5;
    this.difficulty = null;
    this.oncomingSpawnTimer = 0;
    this.oncomingNextSpawn = 1;
  }

  setDifficulty(diff) {
    this.difficulty = diff;
    this.reset();
  }

  getSpawnInterval() {
    if (!this.difficulty) return 1.5 + Math.random() * 1.5;
    return this.difficulty.trafficSpawnMin + Math.random() * (this.difficulty.trafficSpawnMax - this.difficulty.trafficSpawnMin);
  }

  spawnCar(worldSpeed) {
    const lane = Math.floor(Math.random() * 3);
    const types = ['sedan', 'sedan', 'sedan', 'suv', 'hatchback', 'muscle', 'sport_bike', 'chopper', 'city_bus', 'pickup'];
    const type = types[Math.floor(Math.random() * types.length)];
    const color = randomColor();
    const builder = BUILDERS[type] || makeSedan;
    const car = builder(color);

    const speedFactor = this.difficulty ? this.difficulty.trafficSpeedFactor : 0.5;
    const relSpeed = speedFactor + Math.random() * 0.2 - 0.1;
    const ownSpeed = worldSpeed * Math.max(0.15, relSpeed);
    const netSpeed = worldSpeed - ownSpeed;

    const zOffset = Math.random() * -40;
    car.position.set(LANE_POSITIONS[lane], 0.5, SPAWN_DISTANCE + zOffset);
    car.userData = { lane, netSpeed, type };
    this.scene.add(car);
    this.cars.push(car);
  }

  spawnOncoming(worldSpeed) {
    const lane = ONCOMING_LANES[Math.floor(Math.random() * ONCOMING_LANES.length)];
    const types = ['sedan', 'suv', 'truck', 'bus', 'hatchback'];
    const type = types[Math.floor(Math.random() * types.length)];
    const color = randomColor();
    const builder = BUILDERS[type] || makeSedan;
    const car = builder(color);

    const ownSpeed = worldSpeed * (0.6 + Math.random() * 0.5);
    const netSpeed = worldSpeed + ownSpeed;

    car.position.set(lane, 0.5, SPAWN_DISTANCE + Math.random() * -40);
    car.rotation.y = Math.PI;
    car.userData = { lane, netSpeed, type, oncoming: true };
    this.scene.add(car);
    this.cars.push(car);
  }

  update(worldSpeed, deltaTime) {
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.nextSpawn) {
      this.spawnCar(worldSpeed);
      this.spawnTimer = 0;
      this.nextSpawn = this.getSpawnInterval();
    }

    if (this.difficulty && this.difficulty.twoWay) {
      this.oncomingSpawnTimer += deltaTime;
      if (this.oncomingSpawnTimer >= this.oncomingNextSpawn) {
        this.spawnOncoming(worldSpeed);
        this.oncomingSpawnTimer = 0;
        this.oncomingNextSpawn = 0.8 + Math.random() * 1.5;
      }
    }

    for (let i = this.cars.length - 1; i >= 0; i--) {
      const car = this.cars[i];
      car.position.z += car.userData.netSpeed * deltaTime;

      if (car.position.z > DESPAWN_DISTANCE || car.position.z < SPAWN_DISTANCE - 50) {
        this.scene.remove(car);
        this.cars.splice(i, 1);
      }
    }
  }

  checkCollision(playerBox) {
    for (const car of this.cars) {
      const dx = Math.abs(playerBox.x - car.position.x);
      const dz = Math.abs(playerBox.z - car.position.z);
      if (dx < COLLISION_X_THRESHOLD && dz < COLLISION_Z_THRESHOLD) {
        return true;
      }
    }
    return false;
  }

  reset() {
    for (const car of this.cars) this.scene.remove(car);
    this.cars = [];
    this.spawnTimer = 0;
    this.nextSpawn = this.getSpawnInterval();
    this.oncomingSpawnTimer = 0;
    this.oncomingNextSpawn = 1;
  }
}
