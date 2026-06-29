export const LANE_POSITIONS = [-4, 0, 4];
export const LANE_WIDTH = 4;
export const ROAD_WIDTH = 12;
export const SEGMENT_LENGTH = 40;
export const NUM_SEGMENTS = 10;
export const COIN_SPAWN_INTERVAL = 1.2;
export const PLAYER_MAX_HEALTH = 100;
export const WORLD_SPEED_FACTOR = 0.2;
export const SPAWN_DISTANCE = -200;
export const DESPAWN_DISTANCE = 30;
export const COLLECT_RADIUS = 1.5;
export const COLLISION_X_THRESHOLD = 1.6;
export const COLLISION_Z_THRESHOLD = 2.5;
export const ONCOMING_LANES = [-16, -20];
export const ONCOMING_OFFSET = -18;

export const DIFFICULTY = {
  easy:   { label:'Easy',   baseSpeed:40, maxSpeed:140, speedIncrement:0.15, trafficSpawnMin:2.0, trafficSpawnMax:4.0, collisionDamage:15, nitroBoost:30, trafficSpeedFactor:0.45, twoWay:false, movingCoins:false },
  medium: { label:'Medium', baseSpeed:60, maxSpeed:200, speedIncrement:0.3,  trafficSpawnMin:1.2, trafficSpawnMax:3.0, collisionDamage:20, nitroBoost:40, trafficSpeedFactor:0.55, twoWay:true,  movingCoins:true },
  hard:   { label:'Hard',   baseSpeed:80, maxSpeed:250, speedIncrement:0.5,  trafficSpawnMin:0.7, trafficSpawnMax:2.0, collisionDamage:30, nitroBoost:50, trafficSpeedFactor:0.65, twoWay:true,  movingCoins:true },
};

export const ACCELERATION = 60;
export const BRAKE_DECELERATION = 100;
export const FRICTION = 20;
export const NITRO_DURATION = 1.8;

export const VEHICLE_CATALOG = [
  { id:'sport_bike',  name:'Sport Bike',    cat:'bikes',   price:0,    speed:85, handling:90, hp:60,  scale:0.7 },
  { id:'chopper',     name:'Chopper',       cat:'bikes',   price:500,  speed:70, handling:60, hp:70,  scale:0.85 },
  { id:'dirt_bike',   name:'Dirt Bike',     cat:'bikes',   price:300,  speed:78, handling:85, hp:65,  scale:0.75 },
  { id:'sedan',       name:'Sedan',         cat:'cars',    price:0,    speed:80, handling:75, hp:80,  scale:1.0 },
  { id:'suv',         name:'SUV',           cat:'cars',    price:800,  speed:75, handling:70, hp:95,  scale:1.05 },
  { id:'muscle',      name:'Muscle Car',    cat:'cars',    price:1200, speed:95, handling:65, hp:85,  scale:1.0 },
  { id:'supercar',    name:'Supercar',      cat:'cars',    price:2000, speed:99, handling:85, hp:70,  scale:0.95 },
  { id:'hatchback',   name:'Hatchback',     cat:'cars',    price:200,  speed:75, handling:80, hp:75,  scale:0.9 },
  { id:'pickup',      name:'Pickup',        cat:'trucks',  price:600,  speed:70, handling:65, hp:90,  scale:1.1 },
  { id:'semi',        name:'Semi Truck',    cat:'trucks',  price:1500, speed:60, handling:40, hp:100, scale:1.3 },
  { id:'tanker',      name:'Tanker',        cat:'trucks',  price:2500, speed:55, handling:35, hp:100, scale:1.4 },
  { id:'city_bus',    name:'City Bus',      cat:'buses',   price:1000, speed:65, handling:50, hp:95,  scale:1.2 },
  { id:'school_bus',  name:'School Bus',    cat:'buses',   price:800,  speed:60, handling:55, hp:90,  scale:1.15 },
  { id:'tour_bus',    name:'Tour Bus',      cat:'buses',   price:1800, speed:70, handling:45, hp:95,  scale:1.25 },
  { id:'bicycle',     name:'Bicycle',       cat:'special', price:100,  speed:40, handling:95, hp:30,  scale:0.6 },
  { id:'formula',     name:'Formula Racer', cat:'special', price:3000, speed:99, handling:95, hp:60,  scale:0.9 },
];

export const GARAGE_DEFAULTS = { owned:['sedan','sport_bike'], selected:'sedan' };

export const LEVELS = [
  { id:1, name:'Jungle',        env:'jungle',     weather:'clear',        dist:0,    sky:0x87CEEB, fogNear:80,  fogFar:350, grass:0x4a7c3f, roadColor:0x3a3a3a },
  { id:2, name:'City',          env:'city',        weather:'clear',        dist:600,  sky:0x8899bb, fogNear:70,  fogFar:320, grass:0x555555, roadColor:0x333333 },
  { id:3, name:'Mountains',     env:'mountains',   weather:'clear',        dist:1400, sky:0x6688cc, fogNear:90,  fogFar:400, grass:0x5a8a4a, roadColor:0x3a3a3a },
  { id:4, name:'Jungle Rain',   env:'jungle',     weather:'rain',         dist:2400, sky:0x556677, fogNear:40,  fogFar:200, grass:0x3a6c2f, roadColor:0x2a2a2a },
  { id:5, name:'City Rain',     env:'city',        weather:'rain',         dist:3600, sky:0x445566, fogNear:35,  fogFar:180, grass:0x444444, roadColor:0x252525 },
  { id:6, name:'Mt. Rain',      env:'mountains',   weather:'rain',         dist:5000, sky:0x445577, fogNear:40,  fogFar:200, grass:0x4a7a3a, roadColor:0x2a2a2a },
  { id:7, name:'Jungle Storm',  env:'jungle',     weather:'thunderstorm', dist:6600, sky:0x2a2a3a, fogNear:25,  fogFar:130, grass:0x2a5c1f, roadColor:0x1a1a1a },
  { id:8, name:'City Storm',    env:'city',        weather:'thunderstorm', dist:8400, sky:0x222233, fogNear:25,  fogFar:120, grass:0x333333, roadColor:0x181818 },
  { id:9, name:'Mt. Storm',     env:'mountains',   weather:'thunderstorm', dist:10400,sky:0x1a1a2a, fogNear:20,  fogFar:100, grass:0x3a6a2a, roadColor:0x1a1a1a },
];
