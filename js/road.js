import * as THREE from 'three';
import { ROAD_WIDTH, SEGMENT_LENGTH, NUM_SEGMENTS, LANE_WIDTH } from './constants.js';

const _trunkGeo = new THREE.BoxGeometry(0.3, 2.5, 0.3);
const _trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.9 });
const _canopyGeo1 = new THREE.SphereGeometry(1.2, 6, 5);
const _canopyGeo2 = new THREE.ConeGeometry(1.3, 2.5, 6);
const _canopyMats = [
  new THREE.MeshStandardMaterial({ color: 0x2d6b1e, roughness: 0.8 }),
  new THREE.MeshStandardMaterial({ color: 0x3a8a2a, roughness: 0.8 }),
  new THREE.MeshStandardMaterial({ color: 0x1e5512, roughness: 0.8 }),
];

const _bldgMats = [
  new THREE.MeshStandardMaterial({ color: 0x8899aa, roughness: 0.6, metalness: 0.3 }),
  new THREE.MeshStandardMaterial({ color: 0x998877, roughness: 0.6, metalness: 0.2 }),
  new THREE.MeshStandardMaterial({ color: 0x667788, roughness: 0.6, metalness: 0.3 }),
  new THREE.MeshStandardMaterial({ color: 0xaa9988, roughness: 0.6, metalness: 0.2 }),
];
const _windowMat = new THREE.MeshBasicMaterial({ color: 0xaaddff });
const _darkWindowMat = new THREE.MeshBasicMaterial({ color: 0x334455 });

const _mountainGeo = new THREE.ConeGeometry(25, 40, 6);
const _mountainMat = new THREE.MeshStandardMaterial({ color: 0x556655, roughness: 1 });
const _snowMat = new THREE.MeshStandardMaterial({ color: 0xeeeeff, roughness: 0.5 });

const _lightPoleGeo = new THREE.CylinderGeometry(0.08, 0.08, 5, 6);
const _lightPoleMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.5, metalness: 0.5 });
const _lightBulbGeo = new THREE.SphereGeometry(0.2, 6, 6);
const _lightBulbMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });

const _palmTrunkGeo = new THREE.CylinderGeometry(0.15, 0.25, 4, 6);
const _palmLeafGeo = new THREE.ConeGeometry(2.5, 2, 5);
const _palmLeafMat = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.7, side: THREE.DoubleSide });

const _rockGeo = new THREE.DodecahedronGeometry(1.2, 0);
const _rockMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 });

const _cactusGeo = new THREE.CylinderGeometry(0.2, 0.2, 2.5, 6);
const _cactusMat = new THREE.MeshStandardMaterial({ color: 0x2d6b1e, roughness: 0.8 });

const _guardrailPostGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.0, 4);
const _guardrailBarGeo = new THREE.BoxGeometry(0.08, 0.08, 8);
const _guardrailMat = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.3, metalness: 0.7 });

export class Road {
  constructor(scene, difficulty, levelEnv) {
    this.scene = scene;
    this.segments = [];
    this.twoWay = difficulty ? difficulty.twoWay : false;
    this.env = levelEnv || 'jungle';
    this.grassColor = 0x4a7c3f;
    this.roadColor = 0x3a3a3a;
    this.buildSegments();
  }

  setEnvironment(env, grassColor, roadColor) {
    this.env = env;
    if (grassColor !== undefined) this.grassColor = grassColor;
    if (roadColor !== undefined) this.roadColor = roadColor;
    for (const seg of this.segments) this.scene.remove(seg);
    this.segments = [];
    this.buildSegments();
  }

  buildSegments() {
    const roadMat = new THREE.MeshStandardMaterial({ color: this.roadColor, roughness: 0.9 });
    const markingMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xddaa00 });
    const barrierMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.7 });
    const grassMat = new THREE.MeshStandardMaterial({ color: this.grassColor, roughness: 1 });
    const medianGrassMat = new THREE.MeshStandardMaterial({ color: this.grassColor, roughness: 1 });

    const markingGeo = new THREE.BoxGeometry(0.25, 0.04, 3);
    const yellowGeo = new THREE.BoxGeometry(0.2, 0.04, 4);
    const half = SEGMENT_LENGTH / 2;
    const dashSpacing = 8;
    const dashCount = SEGMENT_LENGTH / dashSpacing;

    const playerRoadX = 0;
    const oncomingRoadX = this.twoWay ? -18 : -999;

    for (let i = 0; i < NUM_SEGMENTS; i++) {
      const group = new THREE.Group();

      // === PLAYER ROAD (right side) ===
      const playerRoad = new THREE.Mesh(
        new THREE.BoxGeometry(ROAD_WIDTH, 0.2, SEGMENT_LENGTH), roadMat
      );
      playerRoad.position.set(playerRoadX, -0.1, 0);
      playerRoad.receiveShadow = true;
      group.add(playerRoad);

      // lane markings on player road
      for (let li = 0; li < 2; li++) {
        const mx = playerRoadX + (li - 0.5) * LANE_WIDTH;
        for (let d = 0; d < dashCount; d++) {
          const mark = new THREE.Mesh(markingGeo, markingMat);
          mark.position.set(mx, 0.02, -half + dashSpacing * d + 2.5);
          group.add(mark);
        }
      }

      // yellow edge lines on player road
      const edgeGeo = new THREE.BoxGeometry(0.3, 0.06, SEGMENT_LENGTH);
      for (let s of [-1, 1]) {
        const edge = new THREE.Mesh(edgeGeo, yellowMat);
        edge.position.set(playerRoadX + s * (ROAD_WIDTH / 2), 0.02, 0);
        group.add(edge);
      }

      // barrier posts on player road edges
      const barrierGeo = new THREE.BoxGeometry(0.4, 0.7, SEGMENT_LENGTH);
      for (let side of [-1, 1]) {
        const bar = new THREE.Mesh(barrierGeo, barrierMat);
        bar.position.set(playerRoadX + side * (ROAD_WIDTH / 2 + 0.2), 0.35, 0);
        group.add(bar);
      }

      // === ONCOMING ROAD (left side) ===
      if (this.twoWay) {
        const oncomingRoad = new THREE.Mesh(
          new THREE.BoxGeometry(ROAD_WIDTH, 0.2, SEGMENT_LENGTH), roadMat
        );
        oncomingRoad.position.set(oncomingRoadX, -0.1, 0);
        oncomingRoad.receiveShadow = true;
        group.add(oncomingRoad);

        // white lane dashes on oncoming road (two lanes going opposite direction)
        for (let li = 0; li < 2; li++) {
          const mx = oncomingRoadX + (li - 0.5) * LANE_WIDTH;
          for (let d = 0; d < dashCount; d++) {
            const mark = new THREE.Mesh(markingGeo, markingMat);
            mark.position.set(mx, 0.02, -half + dashSpacing * d + 2.5);
            group.add(mark);
          }
        }

        // yellow edge lines on oncoming road
        for (let s of [-1, 1]) {
          const edge = new THREE.Mesh(edgeGeo, yellowMat);
          edge.position.set(oncomingRoadX + s * (ROAD_WIDTH / 2), 0.02, 0);
          group.add(edge);
        }
          group.add(edge);
        }

        // barriers on oncoming road edges
        for (let side of [-1, 1]) {
          const bar = new THREE.Mesh(barrierGeo, barrierMat);
          bar.position.set(oncomingRoadX + side * (ROAD_WIDTH / 2 + 0.2), 0.35, 0);
          group.add(bar);
        }

        // === MEDIAN GRASS GAP between the two roads ===
        const medianWidth = 6;
        const medianGeo = new THREE.BoxGeometry(medianWidth, 0.15, SEGMENT_LENGTH);
        const medianGrass = new THREE.Mesh(medianGeo, medianGrassMat);
        medianGrass.position.set((playerRoadX - ROAD_WIDTH / 2 + oncomingRoadX + ROAD_WIDTH / 2) / 2, -0.13, 0);
        medianGrass.receiveShadow = true;
        group.add(medianGrass);

        // guardrail posts along median
        const postSpacing = 4;
        const postCount = Math.floor(SEGMENT_LENGTH / postSpacing);
        for (let p = 0; p < postCount; p++) {
          const z = -half + postSpacing * p + 2;
          // right side of median (player road side)
          const postR = new THREE.Mesh(_guardrailPostGeo, _guardrailMat);
          postR.position.set(playerRoadX - ROAD_WIDTH / 2 - 0.3, 0.5, z);
          group.add(postR);
          // left side of median (oncoming road side)
          const postL = new THREE.Mesh(_guardrailPostGeo, _guardrailMat);
          postL.position.set(oncomingRoadX + ROAD_WIDTH / 2 + 0.3, 0.5, z);
          group.add(postL);
        }
        // horizontal guardrail bars on both sides of median
        const barRight = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.06, SEGMENT_LENGTH), _guardrailMat
        );
        barRight.position.set(playerRoadX - ROAD_WIDTH / 2 - 0.3, 0.8, 0);
        group.add(barRight);
        const barLeft = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.06, SEGMENT_LENGTH), _guardrailMat
        );
        barLeft.position.set(oncomingRoadX + ROAD_WIDTH / 2 + 0.3, 0.8, 0);
        group.add(barLeft);
      }

      // === GRASS STRIPS ===
      if (this.twoWay) {
        // right grass (right of player road)
        const rightGrass = new THREE.Mesh(
          new THREE.BoxGeometry(16, 0.15, SEGMENT_LENGTH), grassMat
        );
        rightGrass.position.set(playerRoadX + ROAD_WIDTH / 2 + 8.5, -0.13, 0);
        group.add(rightGrass);

        // left grass (left of oncoming road)
        const leftGrass = new THREE.Mesh(
          new THREE.BoxGeometry(16, 0.15, SEGMENT_LENGTH), grassMat
        );
        leftGrass.position.set(oncomingRoadX - ROAD_WIDTH / 2 - 8.5, -0.13, 0);
        group.add(leftGrass);
      } else {
        for (let side of [-1, 1]) {
          const grassGeo = new THREE.BoxGeometry(10, 0.15, SEGMENT_LENGTH);
          const g = new THREE.Mesh(grassGeo, grassMat);
          g.position.set(playerRoadX + side * (ROAD_WIDTH / 2 + 5.5), -0.13, 0);
          group.add(g);
        }
      }

      this.addScenery(group, half, playerRoadX, oncomingRoadX);

      group.position.z = -i * SEGMENT_LENGTH;
      this.scene.add(group);
      this.segments.push(group);
    }
  }

  addScenery(group, half, playerRoadX, oncomingRoadX) {
    const count = 4 + Math.floor(Math.random() * 3);
    for (let j = 0; j < count; j++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const z = -half + Math.random() * SEGMENT_LENGTH;
      let xBase;
      if (this.twoWay) {
        if (side > 0) {
          xBase = playerRoadX + ROAD_WIDTH / 2 + 5 + Math.random() * 12;
        } else {
          xBase = oncomingRoadX - ROAD_WIDTH / 2 - 5 - Math.random() * 12;
        }
      } else {
        xBase = playerRoadX + side * (ROAD_WIDTH / 2 + 4 + Math.random() * 12);
      }

      const r = Math.random();
      if (this.env === 'jungle') {
        if (r < 0.4) this.addTree(group, xBase, z);
        else if (r < 0.6) this.addPalmTree(group, xBase, z);
        else if (r < 0.75) this.addRock(group, xBase, z);
        else if (r < 0.85) this.addBuilding(group, xBase, z, side);
      } else if (this.env === 'city') {
        if (r < 0.15) this.addTree(group, xBase, z);
        else if (r < 0.65) this.addBuilding(group, xBase, z, side);
        else if (r < 0.8) this.addLightPole(group, xBase, z);
        else this.addRock(group, xBase, z);
      } else if (this.env === 'mountains') {
        if (r < 0.25) this.addTree(group, xBase, z);
        else if (r < 0.45) this.addRock(group, xBase, z);
        else if (r < 0.6) this.addCactus(group, xBase, z);
        else if (r < 0.7) this.addBuilding(group, xBase, z, side);
        else this.addLightPole(group, xBase, z);
      }
    }

    if (Math.random() < 0.35) {
      const mx = this.twoWay
        ? (Math.random() > 0.5 ? 1 : -1) * (40 + Math.random() * 30)
        : (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 20);
      this.addMountain(group, mx, -half + Math.random() * SEGMENT_LENGTH, 0.6 + Math.random() * 0.8);
    }
  }

  addTree(group, x, z) {
    const trunk = new THREE.Mesh(_trunkGeo, _trunkMat);
    trunk.position.set(x, 1.25, z);
    trunk.castShadow = true;
    group.add(trunk);

    const useSphere = Math.random() > 0.4;
    const canopy = new THREE.Mesh(
      useSphere ? _canopyGeo1 : _canopyGeo2,
      _canopyMats[Math.floor(Math.random() * _canopyMats.length)]
    );
    canopy.position.set(x, useSphere ? 3.5 : 3.8, z);
    canopy.scale.setScalar(0.8 + Math.random() * 0.6);
    canopy.castShadow = true;
    group.add(canopy);
  }

  addPalmTree(group, x, z) {
    const trunk = new THREE.Mesh(_palmTrunkGeo, _trunkMat);
    trunk.position.set(x, 2, z);
    trunk.rotation.x = (Math.random() - 0.5) * 0.15;
    trunk.castShadow = true;
    group.add(trunk);

    for (let i = 0; i < 5; i++) {
      const leaf = new THREE.Mesh(_palmLeafGeo, _palmLeafMat);
      leaf.position.set(x, 4.2, z);
      leaf.rotation.y = (i / 5) * Math.PI * 2;
      leaf.rotation.x = 0.5;
      leaf.scale.setScalar(0.6 + Math.random() * 0.3);
      group.add(leaf);
    }
  }

  addRock(group, x, z) {
    const rock = new THREE.Mesh(_rockGeo, _rockMat);
    rock.position.set(x, 0.4 + Math.random() * 0.3, z);
    rock.scale.setScalar(0.5 + Math.random() * 1.0);
    rock.rotation.y = Math.random() * Math.PI * 2;
    rock.castShadow = true;
    group.add(rock);
  }

  addCactus(group, x, z) {
    const c = new THREE.Mesh(_cactusGeo, _cactusMat);
    c.position.set(x, 1.25, z);
    c.castShadow = true;
    group.add(c);

    if (Math.random() > 0.5) {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1, 5), _cactusMat);
      arm.position.set(x + 0.3, 1.8, z);
      arm.rotation.z = -0.6;
      group.add(arm);
    }
  }

  addBuilding(group, x, z, side) {
    const w = 3 + Math.random() * 4;
    const h = 4 + Math.random() * 12;
    const d = 3 + Math.random() * 4;
    const mat = _bldgMats[Math.floor(Math.random() * _bldgMats.length)];

    const bldg = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    bldg.position.set(x, h / 2, z);
    bldg.castShadow = true;
    group.add(bldg);

    const winRows = Math.floor(h / 1.8);
    const winCols = Math.floor(w / 1.2);
    for (let r = 0; r < winRows; r++) {
      for (let c = 0; c < winCols; c++) {
        if (Math.random() < 0.3) continue;
        const wm = Math.random() > 0.3 ? _windowMat : _darkWindowMat;
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.05), wm);
        const wx = x - w / 2 + 0.8 + c * 1.2;
        const wy = 1.5 + r * 1.8;
        const wz = side > 0 ? z - d / 2 - 0.02 : z + d / 2 + 0.02;
        win.position.set(wx, wy, wz);
        group.add(win);
      }
    }
  }

  addMountain(group, x, z, scale) {
    const m = new THREE.Mesh(_mountainGeo, _mountainMat);
    m.position.set(x, 15 * scale, z);
    m.scale.setScalar(scale);
    m.castShadow = true;
    group.add(m);

    const snow = new THREE.Mesh(new THREE.ConeGeometry(10 * scale, 12 * scale, 6), _snowMat);
    snow.position.set(x, 28 * scale, z);
    group.add(snow);
  }

  addLightPole(group, x, z) {
    const pole = new THREE.Mesh(_lightPoleGeo, _lightPoleMat);
    pole.position.set(x, 2.5, z);
    group.add(pole);

    const bulb = new THREE.Mesh(_lightBulbGeo, _lightBulbMat);
    bulb.position.set(x, 5.1, z);
    group.add(bulb);
  }

  update(worldSpeed, deltaTime) {
    const step = worldSpeed * deltaTime;
    for (const seg of this.segments) {
      seg.position.z += step;
      if (seg.position.z > SEGMENT_LENGTH) {
        seg.position.z -= NUM_SEGMENTS * SEGMENT_LENGTH;
      }
    }
  }

  reset() {
    this.segments.forEach((seg, i) => {
      seg.position.z = -i * SEGMENT_LENGTH;
    });
  }
}
