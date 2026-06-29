import * as THREE from 'three';
import { LANE_POSITIONS, PLAYER_MAX_HEALTH } from './constants.js';

export class PlayerCar {
  constructor(scene) {
    this.scene = scene;
    this.health = PLAYER_MAX_HEALTH;
    this.maxHealth = PLAYER_MAX_HEALTH;
    this.currentLane = 1;
    this.targetX = LANE_POSITIONS[1];
    this.x = this.targetX;
    this.z = 0;
    this.laneSwitchSpeed = 10;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.steerAngle = 0;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.wheels = [];
    this.fireGroup = null;
    this.buildDefault();
    this.buildFire();
  }

  addMesh(geo, mat, x, y, z, shadow) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (shadow) m.castShadow = true;
    return m;
  }

  clearGroup() {
    const list = [...this.group.children];
    for (const c of list) {
      this.group.remove(c);
      c.traverse(function(child) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach(function(m) { m.dispose(); });
        }
      });
    }
    this.wheels = [];
  }

  buildFire() {
    try {
      this.fireGroup = new THREE.Group();
      this.fireGroup.visible = false;
      this.scene.add(this.fireGroup);

      var count = 30;
      var positions = new Float32Array(count * 3);
      var colors = new Float32Array(count * 3);
      for (var i = 0; i < count; i++) {
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 0.3;
        positions[i * 3 + 2] = 2.8 + Math.random() * 1.2;
        var t = i / count;
        colors[i * 3] = 1;
        colors[i * 3 + 1] = t < 0.4 ? 0.8 : (t < 0.7 ? 0.4 : 0.1);
        colors[i * 3 + 2] = 0;
      }
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      var mat = new THREE.PointsMaterial({ size: 0.35, vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
      this.fireGroup.add(new THREE.Points(geo, mat));

      var glowMat = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending });
      var glow = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), glowMat);
      glow.position.set(0, 0.3, 3.0);
      this.fireGroup.add(glow);
    } catch(e) { console.warn('Fire build:', e); }
  }

  setFireActive(active) {
    if (this.fireGroup) this.fireGroup.visible = active;
  }

  updateFire(dt) {
    if (!this.fireGroup || !this.fireGroup.visible) return;
    this.fireGroup.position.set(this.x, 0, this.z);
    var pts = this.fireGroup.children[0];
    if (!pts || !pts.geometry) return;
    var pos = pts.geometry.attributes.position.array;
    var t = performance.now() * 0.01;
    for (var i = 0; i < pos.length / 3; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 1] = 0.2 + Math.random() * 0.3;
      pos[i * 3 + 2] = 2.8 + Math.random() * 1.5 + Math.sin(t + i) * 0.3;
    }
    pts.geometry.attributes.position.needsUpdate = true;
  }

  buildWheels(bodyMat, darkMat) {
    var wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12);
    var rimGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.22, 8);
    var rimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.1, metalness: 0.9 });
    this.wheels = [];
    var wPos = [[-1.0, 0.15, -1.4], [1.0, 0.15, -1.4], [-1.0, 0.15, 1.4], [1.0, 0.15, 1.4]];
    for (var i = 0; i < wPos.length; i++) {
      var p = wPos[i];
      var wg = new THREE.Group();
      wg.add(new THREE.Mesh(wheelGeo, darkMat).rotateX(Math.PI / 2));
      wg.add(new THREE.Mesh(rimGeo, rimMat).rotateX(Math.PI / 2));
      wg.position.set(p[0], p[1], p[2]);
      this.group.add(wg);
      this.wheels.push(wg);
    }
  }

  buildDefault() {
    this.clearGroup();
    this.group.scale.setScalar(1);
    var bodyMat = new THREE.MeshStandardMaterial({ color: 0xcc1111, roughness: 0.2, metalness: 0.8 });
    var glassMat = new THREE.MeshStandardMaterial({ color: 0x88bbee, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.45 });
    var chromeMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.05, metalness: 0.95 });
    var darkMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    var hlMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
    var tlMat = new THREE.MeshBasicMaterial({ color: 0xff1111 });

    this.group.add(this.addMesh(new THREE.BoxGeometry(1.85, 0.35, 4.6), bodyMat, 0, 0.28, 0, true));
    this.group.add(this.addMesh(new THREE.BoxGeometry(1.75, 0.12, 1.4), bodyMat, 0, 0.52, -1.2));
    this.group.add(this.addMesh(new THREE.BoxGeometry(1.75, 0.15, 1.0), bodyMat, 0, 0.53, 1.4));
    this.group.add(this.addMesh(new THREE.BoxGeometry(1.65, 0.35, 1.9), glassMat, 0, 0.64, 0));
    var ws = this.addMesh(new THREE.BoxGeometry(1.6, 0.32, 0.08), glassMat, 0, 0.7, -0.95);
    ws.rotation.x = -0.35;
    this.group.add(ws);
    var rw = this.addMesh(new THREE.BoxGeometry(1.55, 0.28, 0.08), glassMat, 0, 0.68, 0.95);
    rw.rotation.x = 0.3;
    this.group.add(rw);
    this.group.add(this.addMesh(new THREE.BoxGeometry(1.9, 0.18, 0.12), chromeMat, 0, 0.22, -2.35));
    this.group.add(this.addMesh(new THREE.BoxGeometry(1.9, 0.18, 0.12), chromeMat, 0, 0.22, 2.35));
    this.group.add(this.addMesh(new THREE.BoxGeometry(1.2, 0.2, 0.05), darkMat, 0, 0.28, -2.32));
    for (var s = -1; s <= 1; s += 2) {
      this.group.add(this.addMesh(new THREE.BoxGeometry(0.3, 0.14, 0.06), hlMat, s * 0.72, 0.35, -2.33));
      this.group.add(this.addMesh(new THREE.BoxGeometry(0.25, 0.12, 0.06), tlMat, s * 0.75, 0.35, 2.33));
      this.group.add(this.addMesh(new THREE.BoxGeometry(0.06, 0.12, 3.6), bodyMat, s * 0.95, 0.15, 0));
    }
    this.buildWheels(bodyMat, darkMat);
  }

  buildCar(color, scale) {
    this.clearGroup();
    this.group.scale.setScalar(scale || 1);
    var bodyMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.2, metalness: 0.8 });
    var glassMat = new THREE.MeshStandardMaterial({ color: 0x88bbee, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.45 });
    var chromeMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.05, metalness: 0.95 });
    var darkMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    var hlMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
    var tlMat = new THREE.MeshBasicMaterial({ color: 0xff1111 });
    this.group.add(this.addMesh(new THREE.BoxGeometry(1.85, 0.35, 4.6), bodyMat, 0, 0.28, 0, true));
    this.group.add(this.addMesh(new THREE.BoxGeometry(1.75, 0.12, 1.4), bodyMat, 0, 0.52, -1.2));
    this.group.add(this.addMesh(new THREE.BoxGeometry(1.75, 0.15, 1.0), bodyMat, 0, 0.53, 1.4));
    this.group.add(this.addMesh(new THREE.BoxGeometry(1.65, 0.35, 1.9), glassMat, 0, 0.64, 0));
    var ws = this.addMesh(new THREE.BoxGeometry(1.6, 0.32, 0.08), glassMat, 0, 0.7, -0.95);
    ws.rotation.x = -0.35;
    this.group.add(ws);
    var rw = this.addMesh(new THREE.BoxGeometry(1.55, 0.28, 0.08), glassMat, 0, 0.68, 0.95);
    rw.rotation.x = 0.3;
    this.group.add(rw);
    this.group.add(this.addMesh(new THREE.BoxGeometry(1.9, 0.18, 0.12), chromeMat, 0, 0.22, -2.35));
    this.group.add(this.addMesh(new THREE.BoxGeometry(1.9, 0.18, 0.12), chromeMat, 0, 0.22, 2.35));
    this.group.add(this.addMesh(new THREE.BoxGeometry(1.2, 0.2, 0.05), darkMat, 0, 0.28, -2.32));
    for (var s = -1; s <= 1; s += 2) {
      this.group.add(this.addMesh(new THREE.BoxGeometry(0.3, 0.14, 0.06), hlMat, s * 0.72, 0.35, -2.33));
      this.group.add(this.addMesh(new THREE.BoxGeometry(0.25, 0.12, 0.06), tlMat, s * 0.75, 0.35, 2.33));
      this.group.add(this.addMesh(new THREE.BoxGeometry(0.06, 0.12, 3.6), bodyMat, s * 0.95, 0.15, 0));
    }
    this.buildWheels(bodyMat, darkMat);
  }

  buildBike(color, scale) {
    this.clearGroup();
    this.group.scale.setScalar(scale || 1);
    var bodyMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3, metalness: 0.7 });
    var chromeMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.05, metalness: 0.95 });
    var darkMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    var hlMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
    var tlMat = new THREE.MeshBasicMaterial({ color: 0xff1111 });
    this.group.add(this.addMesh(new THREE.BoxGeometry(0.4, 0.3, 2.2), bodyMat, 0, 0.5, 0, true));
    this.group.add(this.addMesh(new THREE.BoxGeometry(0.35, 0.12, 0.6), darkMat, 0, 0.7, 0.2));
    this.group.add(this.addMesh(new THREE.BoxGeometry(0.45, 0.25, 0.7), bodyMat, 0, 0.65, -0.4));
    this.group.add(this.addMesh(new THREE.BoxGeometry(0.7, 0.06, 0.06), chromeMat, 0, 0.75, -1.0));
    this.group.add(this.addMesh(new THREE.BoxGeometry(0.18, 0.12, 0.06), hlMat, 0, 0.65, -1.2));
    this.group.add(this.addMesh(new THREE.BoxGeometry(0.12, 0.08, 0.06), tlMat, 0, 0.55, 1.2));
    this.group.add(this.addMesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6), chromeMat, 0.2, 0.3, 0.3));
    var wheelGeo = new THREE.TorusGeometry(0.25, 0.07, 8, 12);
    this.wheels = [];
    var positions = [[0, 0.25, -1.0], [0, 0.25, 1.0]];
    for (var i = 0; i < positions.length; i++) {
      var p = positions[i];
      var wg = new THREE.Group();
      wg.add(new THREE.Mesh(wheelGeo, darkMat));
      wg.position.set(p[0], p[1], p[2]);
      wg.rotation.y = Math.PI / 2;
      this.group.add(wg);
      this.wheels.push(wg);
    }
  }

  buildTruck(color, scale) {
    this.clearGroup();
    this.group.scale.setScalar(scale || 1);
    var bodyMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.4, metalness: 0.5 });
    var glassMat = new THREE.MeshStandardMaterial({ color: 0x88bbee, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.45 });
    var darkMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    var chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.1, metalness: 0.9 });
    var hlMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
    var tlMat = new THREE.MeshBasicMaterial({ color: 0xff1111 });
    this.group.add(this.addMesh(new THREE.BoxGeometry(2.0, 0.8, 3.0), bodyMat, 0, 0.6, 0.8, true));
    this.group.add(this.addMesh(new THREE.BoxGeometry(2.0, 0.6, 0.08), bodyMat, 0, 1.0, -0.7));
    this.group.add(this.addMesh(new THREE.BoxGeometry(2.0, 0.6, 0.08), bodyMat, 0, 1.0, 2.3));
    this.group.add(this.addMesh(new THREE.BoxGeometry(0.08, 0.6, 3.0), bodyMat, -1.0, 1.0, 0.8));
    this.group.add(this.addMesh(new THREE.BoxGeometry(0.08, 0.6, 3.0), bodyMat, 1.0, 1.0, 0.8));
    this.group.add(this.addMesh(new THREE.BoxGeometry(1.9, 0.7, 1.6), bodyMat, 0, 0.7, -1.6));
    var ws = this.addMesh(new THREE.BoxGeometry(1.7, 0.5, 0.08), glassMat, 0, 0.85, -2.4);
    ws.rotation.x = -0.25;
    this.group.add(ws);
    this.group.add(this.addMesh(new THREE.BoxGeometry(2.1, 0.2, 0.15), chromeMat, 0, 0.2, -2.45));
    for (var s = -1; s <= 1; s += 2) {
      this.group.add(this.addMesh(new THREE.BoxGeometry(0.3, 0.15, 0.06), hlMat, s * 0.8, 0.35, -2.45));
      this.group.add(this.addMesh(new THREE.BoxGeometry(0.25, 0.12, 0.06), tlMat, s * 0.8, 0.35, 2.35));
    }
    this.buildWheels(bodyMat, darkMat);
  }

  buildBus(color, scale) {
    this.clearGroup();
    this.group.scale.setScalar(scale || 1);
    var bodyMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.35, metalness: 0.5 });
    var glassMat = new THREE.MeshStandardMaterial({ color: 0x88bbee, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.4 });
    var darkMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    var chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.1, metalness: 0.9 });
    var hlMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
    var tlMat = new THREE.MeshBasicMaterial({ color: 0xff1111 });
    this.group.add(this.addMesh(new THREE.BoxGeometry(2.0, 0.9, 5.5), bodyMat, 0, 0.65, 0, true));
    this.group.add(this.addMesh(new THREE.BoxGeometry(1.95, 0.1, 5.4), bodyMat, 0, 1.15, 0));
    var ws = this.addMesh(new THREE.BoxGeometry(1.8, 0.6, 0.08), glassMat, 0, 0.8, -2.75);
    ws.rotation.x = -0.15;
    this.group.add(ws);
    for (var s = -1; s <= 1; s += 2) {
      for (var i = 0; i < 4; i++) {
        this.group.add(this.addMesh(new THREE.BoxGeometry(0.06, 0.35, 0.5), glassMat, s * 1.01, 0.8, -1.5 + i * 1.2));
      }
    }
    this.group.add(this.addMesh(new THREE.BoxGeometry(2.1, 0.15, 0.12), chromeMat, 0, 0.2, -2.78));
    for (var s = -1; s <= 1; s += 2) {
      this.group.add(this.addMesh(new THREE.BoxGeometry(0.35, 0.15, 0.06), hlMat, s * 0.8, 0.4, -2.78));
      this.group.add(this.addMesh(new THREE.BoxGeometry(0.3, 0.12, 0.06), tlMat, s * 0.8, 0.4, 2.78));
    }
    this.buildWheels(bodyMat, darkMat);
  }

  buildSpecial(color, scale) {
    this.clearGroup();
    this.group.scale.setScalar(scale || 1);
    var bodyMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.15, metalness: 0.9 });
    var glassMat = new THREE.MeshStandardMaterial({ color: 0x88bbee, roughness: 0.05, metalness: 0.4, transparent: true, opacity: 0.4 });
    var darkMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    var chromeMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.05, metalness: 0.95 });
    var hlMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
    var tlMat = new THREE.MeshBasicMaterial({ color: 0xff1111 });
    this.group.add(this.addMesh(new THREE.BoxGeometry(1.8, 0.25, 4.2), bodyMat, 0, 0.22, 0, true));
    this.group.add(this.addMesh(new THREE.BoxGeometry(1.6, 0.1, 1.6), bodyMat, 0, 0.38, -0.8));
    var ws = this.addMesh(new THREE.BoxGeometry(1.4, 0.25, 0.06), glassMat, 0, 0.48, -0.5);
    ws.rotation.x = -0.4;
    this.group.add(ws);
    this.group.add(this.addMesh(new THREE.BoxGeometry(1.9, 0.1, 0.1), chromeMat, 0, 0.15, -2.15));
    this.group.add(this.addMesh(new THREE.BoxGeometry(1.9, 0.1, 0.1), chromeMat, 0, 0.15, 2.15));
    for (var s = -1; s <= 1; s += 2) {
      this.group.add(this.addMesh(new THREE.BoxGeometry(0.35, 0.1, 0.06), hlMat, s * 0.7, 0.25, -2.12));
      this.group.add(this.addMesh(new THREE.BoxGeometry(0.3, 0.08, 0.06), tlMat, s * 0.7, 0.25, 2.12));
    }
    this.buildWheels(bodyMat, darkMat);
  }

  applyVehicle(vehicleData) {
    try {
      var color = 0xcc1111;
      var scale = vehicleData.scale || 1.0;
      if (vehicleData.cat === 'bikes') this.buildBike(color, scale);
      else if (vehicleData.cat === 'trucks') this.buildTruck(color, scale);
      else if (vehicleData.cat === 'buses') this.buildBus(color, scale);
      else if (vehicleData.cat === 'special') this.buildSpecial(color, scale);
      else this.buildCar(color, scale);
      this.maxHealth = vehicleData.hp || 100;
      this.health = this.maxHealth;
    } catch(e) { console.warn('applyVehicle error:', e); }
  }

  switchLane(dir) {
    var nl = Math.max(0, Math.min(2, this.currentLane + dir));
    if (nl !== this.currentLane) { this.currentLane = nl; this.targetX = LANE_POSITIONS[nl]; }
  }

  update(dt) {
    var diff = this.targetX - this.x;
    if (Math.abs(diff) > 0.005) {
      this.x += Math.sign(diff) * Math.min(Math.abs(diff), this.laneSwitchSpeed * dt);
      this.steerAngle += (Math.sign(diff) * 0.15 - this.steerAngle) * 0.15;
    } else {
      this.x = this.targetX;
      this.steerAngle *= 0.85;
    }
    this.group.position.x = this.x;
    this.group.position.y = 0.5 + Math.sin(performance.now() * 0.005) * 0.01;
    this.group.rotation.z = -this.steerAngle * 0.08;
    for (var i = 0; i < this.wheels.length; i++) this.wheels[i].rotation.z += dt * 15;
    this.updateFire(dt);
    if (this.invincible) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) { this.invincible = false; this.group.visible = true; }
      else { this.group.visible = Math.floor(this.invincibleTimer * 12) % 2 === 0; }
    }
  }

  takeDamage(amount) {
    if (this.invincible) return;
    this.health = Math.max(0, this.health - amount);
    this.invincible = true;
    this.invincibleTimer = 1.0;
  }

  getCollisionBox() { return { x: this.x, z: this.z, halfX: 0.9, halfZ: 2.0 }; }
  getPosition() { return { x: this.x, z: this.z }; }

  reset() {
    this.health = this.maxHealth;
    this.currentLane = 1;
    this.targetX = LANE_POSITIONS[1];
    this.x = this.targetX;
    this.group.position.x = this.x;
    this.group.visible = true;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.steerAngle = 0;
    this.group.rotation.z = 0;
    this.setFireActive(false);
  }
}
