import * as THREE from "three";
import { MarchingCubes } from "three/addons/objects/MarchingCubes.js";

const container = document.getElementById("webgl");
const MESSAGE_TYPE = "IGAP_SCROLL";

const ALLOWED_ORIGINS = [];

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: "high-performance",
});

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

const blobGroup = new THREE.Group();
scene.add(blobGroup);

const params = {
  bgColor: "#e6e6e6",

  resolution: 96,
  isolation: 74,
  baseRadius: 1.6,
  subtract: 12,
  numOrbiters: 6,
  coreStrength: 0.95,
  orbiterStrength: 0.58,
  clusterSpread: 0.12,
  earlySpreadAmp: 0.045,
  fold2SpreadAmp: 0.085,
  velocitySpreadAmp: 0.07,
  orbitAmp: 0.028,
  velocityOrbitAmp: 0.065,
  downwardBias: 0.018,
  edgeClamp: 0.16,

  blobColor: "#ffffff",
  roughness: 0.55,
  metalness: 0.55,

  breathAmp: 0.035,
  breathSpeed: 0.9,

  primaryWaveAmp: 0.08,
  primaryWaveFreq: 3.0,
  primaryWaveSpeed: 0.9,
  primaryWaveBias: 0.33,

  secondaryWaveAmp: 0.05,
  secondaryWaveFreq: 5.0,
  secondaryWaveSpeed: 1.35,
  secondaryWaveBias: 1.2,

  swirlAmp: 0.03,
  swirlFreq: 4.0,
  swirlSpeed: 0.75,
  swirlScrollPhase: 2.2,

  ambientTurbulence: 0.012,
  earlyTurbulenceAmp: 0.03,
  fold2TurbulenceAmp: 0.085,
  velocityTurbulenceAmp: 0.1,

  turbulenceFreq1: 8.0,
  turbulenceFreq2: 11.0,
  turbulenceFreq3: 15.0,

  turbulenceSpeed1: 1.5,
  turbulenceSpeed2: 2.0,
  turbulenceSpeed3: 2.6,

  turbulenceMix2: 0.7,
  turbulenceMix3: 0.45,

  velocityScale: 7.5,
  velocityDecay: 0.9,

  earlyStart: 0.03,
  earlyEnd: 0.55,

  fold2Start: 0.18,
  fold2End: 1.1,

  fold3Start: 1.72,
  fold3End: 2.45,

  cameraX: 0.0,
  cameraY: 0.1,
  cameraZ: 6.2,

  lookAtX: 0.0,
  lookAtY: 0.0,

  finalCameraX: 0.0,
  finalCameraY: -0.2,
  finalCameraZ: 5.15,

  finalLookAtX: 0.0,
  finalLookAtY: -0.9,

  blobY: 0.08,
  finalBlobY: -1.95,
  blobScale: 0.6,
  finalBlobScale: 3.9,

  rotationAmpX: 0.08,
  rotationAmpY: 0.18,
  rotationSpeedX: 2.0,
  rotationSpeedY: 2.0,
  scrollRotationAmp: 0.8,
  finalStillness: 0.82,

  floorY: -3.45,
  shadowOpacity: 0,

  hemiIntensity: 2,
  hemiSkyColor: "#f2f2f2",
  hemiGroundColor: "#d1fff6",

  keyIntensity: 2.3,
  keyX: 2.6,
  keyY: 3.3,
  keyZ: 4.2,

  fillIntensity: 0.85,
  fillX: -3.5,
  fillY: 1.5,
  fillZ: 2.2,
};

scene.background = new THREE.Color(params.bgColor);

const hemiLight = new THREE.HemisphereLight(
  params.hemiSkyColor,
  params.hemiGroundColor,
  params.hemiIntensity
);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight(0xffffff, params.keyIntensity);
keyLight.position.set(params.keyX, params.keyY, params.keyZ);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.camera.near = 0.1;
keyLight.shadow.camera.far = 20;
keyLight.shadow.camera.left = -7;
keyLight.shadow.camera.right = 7;
keyLight.shadow.camera.top = 7;
keyLight.shadow.camera.bottom = -7;
keyLight.shadow.radius = 4;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, params.fillIntensity);
fillLight.position.set(params.fillX, params.fillY, params.fillZ);
scene.add(fillLight);

const shadowPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(24, 24),
  new THREE.ShadowMaterial({ opacity: params.shadowOpacity })
);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = params.floorY;
shadowPlane.receiveShadow = true;
scene.add(shadowPlane);

const blobMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color(params.blobColor),
  roughness: params.roughness,
  metalness: params.metalness,
});

const metaballSeeds = [
  { anchor: new THREE.Vector3(1.0, 0.2, 0.0).normalize(), phase: 0.0, weight: 1.0 },
  { anchor: new THREE.Vector3(-0.82, 0.42, 0.36).normalize(), phase: 1.1, weight: 0.96 },
  { anchor: new THREE.Vector3(0.32, -0.18, 0.94).normalize(), phase: 2.2, weight: 0.92 },
  { anchor: new THREE.Vector3(-0.18, -0.55, -0.92).normalize(), phase: 3.15, weight: 0.9 },
  { anchor: new THREE.Vector3(0.88, 0.38, -0.42).normalize(), phase: 4.25, weight: 0.95 },
  { anchor: new THREE.Vector3(0.05, 0.96, 0.24).normalize(), phase: 5.15, weight: 0.88 },
  { anchor: new THREE.Vector3(0.0, -1.0, 0.0), phase: 2.7, weight: 1.08 },
];

let blobMesh = null;

let targetScrollVh = 0;
let currentScrollVh = 0;
let targetVelocity = 0;
let scrollVelocity = 0;
let lastTime = performance.now();

function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0 || 0.0001), 0, 1);
  return t * t * (3 - 2 * t);
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function getStageSize() {
  return {
    width: Math.max(container.clientWidth, window.innerWidth, 1),
    height: Math.max(container.clientHeight, window.innerHeight, 1),
  };
}

function resizeRenderer() {
  const { width, height } = getStageSize();
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
}

function buildBlob() {
  if (blobMesh) {
    blobGroup.remove(blobMesh);

    if (typeof blobMesh.dispose === "function") {
      blobMesh.dispose();
    } else if (blobMesh.geometry) {
      blobMesh.geometry.dispose();
    }
  }

  blobMesh = new MarchingCubes(
    params.resolution,
    blobMaterial,
    false,
    false,
    120000
  );

  blobMesh.isolation = params.isolation;
  blobMesh.castShadow = true;
  blobMesh.receiveShadow = false;
  blobMesh.frustumCulled = false;
  blobMesh.enableUvs = false;
  blobMesh.enableColors = false;
  blobMesh.position.set(0, 0, 0);
  blobMesh.scale.setScalar(params.baseRadius * 2.0);

  blobGroup.add(blobMesh);
}

function applyMaterial() {
  scene.background.set(params.bgColor);
  blobMaterial.color.set(params.blobColor);
  blobMaterial.roughness = params.roughness;
  blobMaterial.metalness = params.metalness;
  blobMaterial.needsUpdate = true;
  shadowPlane.material.opacity = params.shadowOpacity;
  shadowPlane.position.y = params.floorY;
}

function applyLights() {
  hemiLight.intensity = params.hemiIntensity;
  hemiLight.color.set(params.hemiSkyColor);
  hemiLight.groundColor.set(params.hemiGroundColor);

  keyLight.intensity = params.keyIntensity;
  keyLight.position.set(params.keyX, params.keyY, params.keyZ);

  fillLight.intensity = params.fillIntensity;
  fillLight.position.set(params.fillX, params.fillY, params.fillZ);
}

function getScrollState() {
  const scrollVh = currentScrollVh;

  return {
    scrollVh,
    early: smoothstep(params.earlyStart, params.earlyEnd, scrollVh),
    fold2: smoothstep(params.fold2Start, params.fold2End, scrollVh),
    fold3: smoothstep(params.fold3Start, params.fold3End, scrollVh),
  };
}

function addMetaball(x, y, z, strength) {
  const edge = params.edgeClamp;

  blobMesh.addBall(
    clamp(x, edge, 1 - edge),
    clamp(y, edge, 1 - edge),
    clamp(z, edge, 1 - edge),
    strength,
    params.subtract
  );
}

function updateBlob(time, state) {
  blobMesh.reset();
  blobMesh.isolation = params.isolation;
  blobMesh.scale.setScalar(params.baseRadius * 2.0);

  const settle = state.fold3;
  const stillness = 1.0 - settle * params.finalStillness;

  const breathing =
    Math.sin(time * params.breathSpeed) * params.breathAmp * stillness;

  const turbulenceStrength =
    params.ambientTurbulence +
    state.early * params.earlyTurbulenceAmp +
    state.fold2 * params.fold2TurbulenceAmp +
    scrollVelocity * params.velocityTurbulenceAmp;

  let spread =
    params.clusterSpread +
    state.early * params.earlySpreadAmp +
    state.fold2 * params.fold2SpreadAmp +
    scrollVelocity * params.velocitySpreadAmp;

  spread = mix(spread, params.clusterSpread * 0.58, settle);

  const orbitAmp =
    (params.orbitAmp + scrollVelocity * params.velocityOrbitAmp) * stillness;

  const centerX = 0.5;
  const centerY = 0.5 - params.downwardBias * (0.45 + settle * 0.55);
  const centerZ = 0.5;

  const coreStrength =
    params.coreStrength +
    breathing * 1.75 +
    state.fold2 * 0.06 -
    settle * 0.04;

  addMetaball(
    centerX,
    centerY + breathing * 0.08,
    centerZ,
    Math.max(0.05, coreStrength)
  );

  const orbitCount = Math.min(params.numOrbiters, metaballSeeds.length - 1);

  for (let i = 0; i < orbitCount; i++) {
    const seed = metaballSeeds[i];
    const phase = seed.phase;
    const anchor = seed.anchor;

    const primaryWave =
      Math.sin(
        phase * params.primaryWaveFreq +
        time * params.primaryWaveSpeed +
        anchor.y * params.primaryWaveBias
      ) *
      params.primaryWaveAmp *
      stillness;

    const secondaryWave =
      Math.sin(
        phase * params.secondaryWaveFreq -
        time * params.secondaryWaveSpeed +
        anchor.x * params.secondaryWaveBias
      ) *
      params.secondaryWaveAmp *
      stillness;

    const swirl =
      Math.sin(
        phase * params.swirlFreq -
        time * params.swirlSpeed +
        state.early * params.swirlScrollPhase
      ) *
      params.swirlAmp *
      stillness;

    const turbulenceA =
      Math.sin(phase * params.turbulenceFreq1 + time * params.turbulenceSpeed1);

    const turbulenceB =
      Math.sin(phase * params.turbulenceFreq2 - time * params.turbulenceSpeed2) *
      params.turbulenceMix2;

    const turbulenceC =
      Math.sin(phase * params.turbulenceFreq3 + time * params.turbulenceSpeed3) *
      params.turbulenceMix3;

    const turbulence =
      (turbulenceA + turbulenceB + turbulenceC) * turbulenceStrength;

    const radialSpread = spread + primaryWave * 0.34 + secondaryWave * 0.22;

    const x =
      centerX +
      anchor.x * radialSpread +
      Math.sin(time * 0.83 + phase) * orbitAmp +
      Math.sin(time * 1.4 + phase * 1.3) * turbulence * 0.12;

    const y =
      centerY +
      anchor.y * radialSpread +
      Math.cos(time * 0.71 + phase * 1.2) * orbitAmp * 0.7 +
      swirl * 0.24 +
      Math.sin(time * 1.1 + phase * 1.6) * turbulence * 0.1;

    const z =
      centerZ +
      anchor.z * radialSpread +
      Math.cos(time * 0.92 + phase * 0.8) * orbitAmp +
      Math.cos(time * 1.3 + phase * 1.1) * turbulence * 0.12;

    const strength =
      params.orbiterStrength * seed.weight +
      breathing * 0.65 +
      state.fold2 * 0.045 +
      secondaryWave * 0.3 -
      settle * 0.025;

    addMetaball(x, y, z, Math.max(0.05, strength));
  }

  const bottomSeed = metaballSeeds[metaballSeeds.length - 1];
  const bottomStrength =
    params.orbiterStrength * bottomSeed.weight +
    settle * 0.12 +
    breathing * 0.4;

  addMetaball(
    centerX + Math.sin(time * 0.6) * orbitAmp * 0.35,
    centerY - spread * 0.78 - settle * 0.02,
    centerZ + Math.cos(time * 0.8) * orbitAmp * 0.28,
    Math.max(0.05, bottomStrength)
  );

  blobMesh.update();
}

function updateCameraAndTransforms(time, state) {
  const settle = state.fold3;

  const cameraX = mix(params.cameraX, params.finalCameraX, settle);
  const cameraY = mix(params.cameraY, params.finalCameraY, settle);
  const cameraZ = mix(params.cameraZ, params.finalCameraZ, settle);

  const lookAtX = mix(params.lookAtX, params.finalLookAtX, settle);
  const lookAtY = mix(params.lookAtY, params.finalLookAtY, settle);

  const blobY = mix(params.blobY, params.finalBlobY, settle);
  const blobScale = mix(params.blobScale, params.finalBlobScale, settle);

  const stillness = 1.0 - state.fold3 * params.finalStillness;

  blobGroup.position.y = blobY;
  blobGroup.scale.setScalar(blobScale);

  blobGroup.rotation.x =
    Math.cos(time * params.rotationSpeedX) *
    params.rotationAmpX *
    stillness;

  blobGroup.rotation.y =
    Math.sin(time * params.rotationSpeedY) *
    params.rotationAmpY *
    stillness +
    scrollVelocity * params.scrollRotationAmp * (1.0 - state.fold3 * 0.65);

  camera.position.set(cameraX, cameraY, cameraZ);
  camera.lookAt(lookAtX, lookAtY, 0);
}

function animate(now) {
  requestAnimationFrame(animate);

  const dt = Math.max(0.016, (now - lastTime) / 1000);
  lastTime = now;

  currentScrollVh = mix(currentScrollVh, targetScrollVh, 0.12);
  scrollVelocity = mix(scrollVelocity, targetVelocity, 0.16);

  scrollVelocity *= Math.pow(params.velocityDecay, dt * 60.0);
  targetVelocity *= Math.pow(0.86, dt * 60.0);

  const time = now * 0.001;
  const state = getScrollState();

  updateBlob(time, state);
  updateCameraAndTransforms(time, state);
  renderer.render(scene, camera);
}

function isAllowedOrigin(origin) {
  if (!ALLOWED_ORIGINS.length) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

window.addEventListener("message", (event) => {
  if (!isAllowedOrigin(event.origin)) return;

  const data = event.data;
  if (!data || data.type !== MESSAGE_TYPE) return;

  if (typeof data.scrollVh === "number") {
    targetScrollVh = Math.max(0, data.scrollVh);
  }

  if (typeof data.velocity === "number") {
    targetVelocity = clamp(data.velocity, 0, 1);
  }
});

window.addEventListener("resize", resizeRenderer);

buildBlob();
applyMaterial();
applyLights();
resizeRenderer();
animate(performance.now());

if (window.parent && window.parent !== window) {
  window.parent.postMessage({ type: "IGAP_BLOB_READY" }, "*");
}
  antialias: true,
  alpha: false,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  32,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

const blobGroup = new THREE.Group();
scene.add(blobGroup);

const params = {
  // scene
  bgColor: "#e6e6e6",

  // metaballs / volume
  resolution: 96,
  isolation: 74,
  baseRadius: 1.6,
  subtract: 12,
  numOrbiters: 6,
  coreStrength: 0.95,
  orbiterStrength: 0.58,
  clusterSpread: 0.12,
  earlySpreadAmp: 0.045,
  fold2SpreadAmp: 0.085,
  velocitySpreadAmp: 0.07,
  orbitAmp: 0.028,
  velocityOrbitAmp: 0.065,
  downwardBias: 0.018,
  edgeClamp: 0.16,

  // material
  blobColor: "#ffffff",
  roughness: 0.55,
  metalness: 0.55,

  // ambient motion
  breathAmp: 0.035,
  breathSpeed: 0.9,

  primaryWaveAmp: 0.08,
  primaryWaveFreq: 3.0,
  primaryWaveSpeed: 0.9,
  primaryWaveBias: 0.33,

  secondaryWaveAmp: 0.05,
  secondaryWaveFreq: 5.0,
  secondaryWaveSpeed: 1.35,
  secondaryWaveBias: 1.2,

  swirlAmp: 0.03,
  swirlFreq: 4.0,
  swirlSpeed: 0.75,
  swirlScrollPhase: 2.2,

  // turbulence
  ambientTurbulence: 0.012,
  earlyTurbulenceAmp: 0.03,
  fold2TurbulenceAmp: 0.085,
  velocityTurbulenceAmp: 0.1,

  turbulenceFreq1: 8.0,
  turbulenceFreq2: 11.0,
  turbulenceFreq3: 15.0,

  turbulenceSpeed1: 1.5,
  turbulenceSpeed2: 2.0,
  turbulenceSpeed3: 2.6,

  turbulenceMix2: 0.7,
  turbulenceMix3: 0.45,

  // scroll response
  velocityScale: 7.5,
  velocityDecay: 0.9,

  earlyStart: 0.03,
  earlyEnd: 0.55,

  fold2Start: 0.18,
  fold2End: 1.1,

  fold3Start: 1.72,
  fold3End: 2.45,

  // camera / framing
  cameraX: 0.0,
  cameraY: 0.1,
  cameraZ: 6.2,

  lookAtX: 0.0,
  lookAtY: 0.0,

  finalCameraX: 0.0,
  finalCameraY: -0.2,
  finalCameraZ: 5.15,

  finalLookAtX: 0.0,
  finalLookAtY: -0.9,

  // blob transforms
  blobY: 0.08,
  finalBlobY: -1.95,
  blobScale: 0.6,
  finalBlobScale: 3.9,

  rotationAmpX: 0.08,
  rotationAmpY: 0.18,
  rotationSpeedX: 2,
  rotationSpeedY: 2,
  scrollRotationAmp: 0.8,
  finalStillness: 0.82,

  // floor / shadow
  floorY: -3.45,
  shadowOpacity: 0,

  // lights
  hemiIntensity: 2,
  hemiSkyColor: "#f2f2f2",
  hemiGroundColor: "#d1fff6",

  keyIntensity: 2.3,
  keyX: 2.6,
  keyY: 3.3,
  keyZ: 4.2,

  fillIntensity: 0.85,
  fillX: -3.5,
  fillY: 1.5,
  fillZ: 2.2,
};

scene.background = new THREE.Color(params.bgColor);

const hemiLight = new THREE.HemisphereLight(
  params.hemiSkyColor,
  params.hemiGroundColor,
  params.hemiIntensity
);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight(0xffffff, params.keyIntensity);
keyLight.position.set(params.keyX, params.keyY, params.keyZ);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.camera.near = 0.1;
keyLight.shadow.camera.far = 20;
keyLight.shadow.camera.left = -7;
keyLight.shadow.camera.right = 7;
keyLight.shadow.camera.top = 7;
keyLight.shadow.camera.bottom = -7;
keyLight.shadow.radius = 4;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, params.fillIntensity);
fillLight.position.set(params.fillX, params.fillY, params.fillZ);
scene.add(fillLight);

const shadowPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(24, 24),
  new THREE.ShadowMaterial({ opacity: params.shadowOpacity })
);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = params.floorY;
shadowPlane.receiveShadow = true;
scene.add(shadowPlane);

const blobMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color(params.blobColor),
  roughness: params.roughness,
  metalness: params.metalness,
});

const metaballSeeds = [
  { anchor: new THREE.Vector3(1.0, 0.2, 0.0).normalize(), phase: 0.0, weight: 1.0 },
  { anchor: new THREE.Vector3(-0.82, 0.42, 0.36).normalize(), phase: 1.1, weight: 0.96 },
  { anchor: new THREE.Vector3(0.32, -0.18, 0.94).normalize(), phase: 2.2, weight: 0.92 },
  { anchor: new THREE.Vector3(-0.18, -0.55, -0.92).normalize(), phase: 3.15, weight: 0.9 },
  { anchor: new THREE.Vector3(0.88, 0.38, -0.42).normalize(), phase: 4.25, weight: 0.95 },
  { anchor: new THREE.Vector3(0.05, 0.96, 0.24).normalize(), phase: 5.15, weight: 0.88 },
  { anchor: new THREE.Vector3(0.0, -1.0, 0.0), phase: 2.7, weight: 1.08 },
];

let blobMesh = null;

function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0 || 0.0001), 0, 1);
  return t * t * (3 - 2 * t);
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function buildBlob() {
  if (blobMesh) {
    blobGroup.remove(blobMesh);

    if (blobMesh.material && blobMesh.material !== blobMaterial) {
      blobMesh.material.dispose();
    }

    if (typeof blobMesh.dispose === "function") {
      blobMesh.dispose();
    } else if (blobMesh.geometry) {
      blobMesh.geometry.dispose();
    }
  }

  blobMesh = new MarchingCubes(
    params.resolution,
    blobMaterial,
    false,
    false,
    120000
  );

  blobMesh.isolation = params.isolation;
  blobMesh.castShadow = true;
  blobMesh.receiveShadow = false;
  blobMesh.frustumCulled = false;
  blobMesh.enableUvs = false;
  blobMesh.enableColors = false;
  blobMesh.position.set(0, 0, 0);
  blobMesh.scale.setScalar(params.baseRadius * 2.0);

  blobGroup.add(blobMesh);
}

buildBlob();

function applyMaterial() {
  scene.background.set(params.bgColor);

  blobMaterial.color.set(params.blobColor);
  blobMaterial.roughness = params.roughness;
  blobMaterial.metalness = params.metalness;
  blobMaterial.needsUpdate = true;

  shadowPlane.material.opacity = params.shadowOpacity;
  shadowPlane.position.y = params.floorY;
}

function applyLights() {
  hemiLight.intensity = params.hemiIntensity;
  hemiLight.color.set(params.hemiSkyColor);
  hemiLight.groundColor.set(params.hemiGroundColor);

  keyLight.intensity = params.keyIntensity;
  keyLight.position.set(params.keyX, params.keyY, params.keyZ);

  fillLight.intensity = params.fillIntensity;
  fillLight.position.set(params.fillX, params.fillY, params.fillZ);
}

applyMaterial();
applyLights();

let currentScroll = window.scrollY;
let lastScroll = window.scrollY;
let scrollVelocity = 0;
let lastTime = performance.now();

window.addEventListener("scroll", () => {
  currentScroll = window.scrollY;
});

function getScrollState() {
  const vh = window.innerHeight;
  const scrollVh = currentScroll / vh;

  return {
    scrollVh,
    early: smoothstep(params.earlyStart, params.earlyEnd, scrollVh),
    fold2: smoothstep(params.fold2Start, params.fold2End, scrollVh),
    fold3: smoothstep(params.fold3Start, params.fold3End, scrollVh),
  };
}

function addMetaball(x, y, z, strength) {
  const edge = params.edgeClamp;

  blobMesh.addBall(
    clamp(x, edge, 1 - edge),
    clamp(y, edge, 1 - edge),
    clamp(z, edge, 1 - edge),
    strength,
    params.subtract
  );
}

function updateBlob(time, state) {
  blobMesh.reset();
  blobMesh.isolation = params.isolation;
  blobMesh.scale.setScalar(params.baseRadius * 2.0);

  const settle = state.fold3;
  const stillness = 1.0 - settle * params.finalStillness;

  const breathing =
    Math.sin(time * params.breathSpeed) * params.breathAmp * stillness;

  const turbulenceStrength =
    params.ambientTurbulence +
    state.early * params.earlyTurbulenceAmp +
    state.fold2 * params.fold2TurbulenceAmp +
    scrollVelocity * params.velocityTurbulenceAmp;

  let spread =
    params.clusterSpread +
    state.early * params.earlySpreadAmp +
    state.fold2 * params.fold2SpreadAmp +
    scrollVelocity * params.velocitySpreadAmp;

  spread = mix(spread, params.clusterSpread * 0.58, settle);

  const orbitAmp =
    (params.orbitAmp + scrollVelocity * params.velocityOrbitAmp) * stillness;

  const centerX = 0.5;
  const centerY = 0.5 - params.downwardBias * (0.45 + settle * 0.55);
  const centerZ = 0.5;

  const coreStrength =
    params.coreStrength +
    breathing * 1.75 +
    state.fold2 * 0.06 -
    settle * 0.04;

  addMetaball(
    centerX,
    centerY + breathing * 0.08,
    centerZ,
    Math.max(0.05, coreStrength)
  );

  const orbitCount = Math.min(params.numOrbiters, metaballSeeds.length - 1);

  for (let i = 0; i < orbitCount; i++) {
    const seed = metaballSeeds[i];
    const phase = seed.phase;
    const anchor = seed.anchor;

    const primaryWave =
      Math.sin(
        phase * params.primaryWaveFreq +
          time * params.primaryWaveSpeed +
          anchor.y * params.primaryWaveBias
      ) *
      params.primaryWaveAmp *
      stillness;

    const secondaryWave =
      Math.sin(
        phase * params.secondaryWaveFreq -
          time * params.secondaryWaveSpeed +
          anchor.x * params.secondaryWaveBias
      ) *
      params.secondaryWaveAmp *
      stillness;

    const swirl =
      Math.sin(
        phase * params.swirlFreq -
          time * params.swirlSpeed +
          state.early * params.swirlScrollPhase
      ) *
      params.swirlAmp *
      stillness;

    const turbulenceA =
      Math.sin(phase * params.turbulenceFreq1 + time * params.turbulenceSpeed1);

    const turbulenceB =
      Math.sin(phase * params.turbulenceFreq2 - time * params.turbulenceSpeed2) *
      params.turbulenceMix2;

    const turbulenceC =
      Math.sin(
        phase * params.turbulenceFreq3 + time * params.turbulenceSpeed3
      ) * params.turbulenceMix3;

    const turbulence =
      (turbulenceA + turbulenceB + turbulenceC) * turbulenceStrength;

    const radialSpread = spread + primaryWave * 0.34 + secondaryWave * 0.22;

    const x =
      centerX +
      anchor.x * radialSpread +
      Math.sin(time * 0.83 + phase) * orbitAmp +
      Math.sin(time * 1.4 + phase * 1.3) * turbulence * 0.12;

    const y =
      centerY +
      anchor.y * radialSpread +
      Math.cos(time * 0.71 + phase * 1.2) * orbitAmp * 0.7 +
      swirl * 0.24 +
      Math.sin(time * 1.1 + phase * 1.6) * turbulence * 0.1;

    const z =
      centerZ +
      anchor.z * radialSpread +
      Math.cos(time * 0.92 + phase * 0.8) * orbitAmp +
      Math.cos(time * 1.3 + phase * 1.1) * turbulence * 0.12;

    const strength =
      params.orbiterStrength * seed.weight +
      breathing * 0.65 +
      state.fold2 * 0.045 +
      secondaryWave * 0.3 -
      settle * 0.025;

    addMetaball(x, y, z, Math.max(0.05, strength));
  }

  const bottomSeed = metaballSeeds[metaballSeeds.length - 1];
  const bottomStrength =
    params.orbiterStrength * bottomSeed.weight + settle * 0.12 + breathing * 0.4;

  addMetaball(
    centerX + Math.sin(time * 0.6) * orbitAmp * 0.35,
    centerY - spread * 0.78 - settle * 0.02,
    centerZ + Math.cos(time * 0.8) * orbitAmp * 0.28,
    Math.max(0.05, bottomStrength)
  );

  blobMesh.update(); // this is the missing part
  
}

function updateCameraAndTransforms(time, state) {
  const settle = state.fold3;

  const cameraX = mix(params.cameraX, params.finalCameraX, settle);
  const cameraY = mix(params.cameraY, params.finalCameraY, settle);
  const cameraZ = mix(params.cameraZ, params.finalCameraZ, settle);

  const lookAtX = mix(params.lookAtX, params.finalLookAtX, settle);
  const lookAtY = mix(params.lookAtY, params.finalLookAtY, settle);

  const blobY = mix(params.blobY, params.finalBlobY, settle);
  const blobScale = mix(params.blobScale, params.finalBlobScale, settle);

  const stillness = 1.0 - state.fold3 * params.finalStillness;

  blobGroup.position.y = blobY;
  blobGroup.scale.setScalar(blobScale);

  blobGroup.rotation.x =
    Math.cos(time * params.rotationSpeedX) *
    params.rotationAmpX *
    stillness;

  blobGroup.rotation.y =
    Math.sin(time * params.rotationSpeedY) *
      params.rotationAmpY *
      stillness +
    scrollVelocity * params.scrollRotationAmp * (1.0 - state.fold3 * 0.65);

  camera.position.set(cameraX, cameraY, cameraZ);
  camera.lookAt(lookAtX, lookAtY, 0);
}

function animate(now) {
  requestAnimationFrame(animate);

  const dt = Math.max(0.016, (now - lastTime) / 1000);
  lastTime = now;

  const deltaScroll = currentScroll - lastScroll;
  lastScroll = currentScroll;

  const targetVelocity = clamp(
    (Math.abs(deltaScroll) / window.innerHeight) * params.velocityScale,
    0,
    1
  );

  scrollVelocity = mix(scrollVelocity, targetVelocity, 0.18);
  scrollVelocity *= Math.pow(params.velocityDecay, dt * 60.0);

  const time = now * 0.001;
  const state = getScrollState();

  updateBlob(time, state);
  updateCameraAndTransforms(time, state);
  renderer.render(scene, camera);
}

animate(performance.now());

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
}

window.addEventListener("resize", onResize);

const gui = new GUI({ title: "Metaball Controls" });

const sceneFolder = gui.addFolder("Scene");
sceneFolder.addColor(params, "bgColor").onChange(applyMaterial);

const volumeFolder = gui.addFolder("Metaballs");
volumeFolder
  .add(params, "resolution", 24, 96, 1)
  .name("resolution")
  .onFinishChange(buildBlob);
volumeFolder.add(params, "isolation", 20, 120, 1);
volumeFolder.add(params, "baseRadius", 0.7, 1.6, 0.01);
volumeFolder.add(params, "subtract", 4, 24, 0.1);
volumeFolder.add(params, "numOrbiters", 3, 6, 1);
volumeFolder.add(params, "coreStrength", 0.2, 1.8, 0.01);
volumeFolder.add(params, "orbiterStrength", 0.15, 1.3, 0.01);
volumeFolder.add(params, "clusterSpread", 0.02, 0.28, 0.001);
volumeFolder.add(params, "earlySpreadAmp", 0, 0.18, 0.001);
volumeFolder.add(params, "fold2SpreadAmp", 0, 0.24, 0.001);
volumeFolder.add(params, "velocitySpreadAmp", 0, 0.2, 0.001);
volumeFolder.add(params, "orbitAmp", 0, 0.12, 0.001);
volumeFolder.add(params, "velocityOrbitAmp", 0, 0.18, 0.001);
volumeFolder.add(params, "downwardBias", 0, 0.08, 0.001);
volumeFolder.add(params, "edgeClamp", 0.02, 0.24, 0.001);

const materialFolder = gui.addFolder("Material");
materialFolder.addColor(params, "blobColor").onChange(applyMaterial);
materialFolder.add(params, "roughness", 0, 1, 0.01).onChange(applyMaterial);
materialFolder.add(params, "metalness", 0, 1, 0.01).onChange(applyMaterial);

const motionFolder = gui.addFolder("Ambient Motion");
motionFolder.add(params, "breathAmp", 0, 0.12, 0.001);
motionFolder.add(params, "breathSpeed", 0, 3, 0.01);
motionFolder.add(params, "primaryWaveAmp", 0, 0.2, 0.001);
motionFolder.add(params, "primaryWaveFreq", 0, 10, 0.1);
motionFolder.add(params, "primaryWaveSpeed", 0, 3, 0.01);
motionFolder.add(params, "primaryWaveBias", 0, 4, 0.01);
motionFolder.add(params, "secondaryWaveAmp", 0, 0.18, 0.001);
motionFolder.add(params, "secondaryWaveFreq", 0, 12, 0.1);
motionFolder.add(params, "secondaryWaveSpeed", 0, 4, 0.01);
motionFolder.add(params, "secondaryWaveBias", 0, 4, 0.01);
motionFolder.add(params, "swirlAmp", 0, 0.12, 0.001);
motionFolder.add(params, "swirlFreq", 0, 12, 0.1);
motionFolder.add(params, "swirlSpeed", 0, 3, 0.01);
motionFolder.add(params, "swirlScrollPhase", 0, 6, 0.01);

const turbFolder = gui.addFolder("Turbulence");
turbFolder.add(params, "ambientTurbulence", 0, 0.06, 0.001);
turbFolder.add(params, "earlyTurbulenceAmp", 0, 0.12, 0.001);
turbFolder.add(params, "fold2TurbulenceAmp", 0, 0.2, 0.001);
turbFolder.add(params, "velocityTurbulenceAmp", 0, 0.2, 0.001);
turbFolder.add(params, "turbulenceFreq1", 0, 20, 0.1);
turbFolder.add(params, "turbulenceFreq2", 0, 20, 0.1);
turbFolder.add(params, "turbulenceFreq3", 0, 20, 0.1);
turbFolder.add(params, "turbulenceSpeed1", 0, 5, 0.01);
turbFolder.add(params, "turbulenceSpeed2", 0, 5, 0.01);
turbFolder.add(params, "turbulenceSpeed3", 0, 5, 0.01);
turbFolder.add(params, "turbulenceMix2", 0, 1.5, 0.01);
turbFolder.add(params, "turbulenceMix3", 0, 1.5, 0.01);

const scrollFolder = gui.addFolder("Scroll Timing");
scrollFolder.add(params, "velocityScale", 0, 15, 0.1);
scrollFolder.add(params, "velocityDecay", 0.7, 0.99, 0.001);
scrollFolder.add(params, "earlyStart", 0, 1.2, 0.01);
scrollFolder.add(params, "earlyEnd", 0, 1.6, 0.01);
scrollFolder.add(params, "fold2Start", 0, 2, 0.01);
scrollFolder.add(params, "fold2End", 0, 2, 0.01);
scrollFolder.add(params, "fold3Start", 0.5, 3, 0.01);
scrollFolder.add(params, "fold3End", 0.5, 3, 0.01);

const cameraFolder = gui.addFolder("Camera + Final Fold");
cameraFolder.add(params, "cameraX", -3, 3, 0.01);
cameraFolder.add(params, "cameraY", -3, 3, 0.01);
cameraFolder.add(params, "cameraZ", 2, 10, 0.01);
cameraFolder.add(params, "lookAtX", -3, 3, 0.01);
cameraFolder.add(params, "lookAtY", -3, 3, 0.01);
cameraFolder.add(params, "finalCameraX", -3, 3, 0.01);
cameraFolder.add(params, "finalCameraY", -4, 2, 0.01);
cameraFolder.add(params, "finalCameraZ", 1.5, 8, 0.01);
cameraFolder.add(params, "finalLookAtX", -3, 3, 0.01);
cameraFolder.add(params, "finalLookAtY", -4, 2, 0.01);

const blobTransformFolder = gui.addFolder("Blob Transform");
blobTransformFolder.add(params, "blobY", -2, 2, 0.01);
blobTransformFolder.add(params, "finalBlobY", -4, 1, 0.01);
blobTransformFolder.add(params, "blobScale", 0.5, 2.5, 0.01);
blobTransformFolder.add(params, "finalBlobScale", 1, 7, 0.01);
blobTransformFolder.add(params, "rotationAmpX", 0, 0.4, 0.001);
blobTransformFolder.add(params, "rotationAmpY", 0, 0.6, 0.001);
blobTransformFolder.add(params, "rotationSpeedX", 0, 2, 0.01);
blobTransformFolder.add(params, "rotationSpeedY", 0, 2, 0.01);
blobTransformFolder.add(params, "scrollRotationAmp", 0, 0.8, 0.001);
blobTransformFolder.add(params, "finalStillness", 0, 1, 0.01);

const floorFolder = gui.addFolder("Floor + Shadow");
floorFolder.add(params, "floorY", -6, 0, 0.01).onChange(applyMaterial);
floorFolder.add(params, "shadowOpacity", 0, 0.5, 0.001).onChange(applyMaterial);

const lightFolder = gui.addFolder("Lighting");
lightFolder.add(params, "hemiIntensity", 0, 3, 0.01).onChange(applyLights);
lightFolder.addColor(params, "hemiSkyColor").onChange(applyLights);
lightFolder.addColor(params, "hemiGroundColor").onChange(applyLights);
lightFolder.add(params, "keyIntensity", 0, 5, 0.01).onChange(applyLights);
lightFolder.add(params, "keyX", -8, 8, 0.01).onChange(applyLights);
lightFolder.add(params, "keyY", -8, 8, 0.01).onChange(applyLights);
lightFolder.add(params, "keyZ", -8, 8, 0.01).onChange(applyLights);
lightFolder.add(params, "fillIntensity", 0, 4, 0.01).onChange(applyLights);
lightFolder.add(params, "fillX", -8, 8, 0.01).onChange(applyLights);
lightFolder.add(params, "fillY", -8, 8, 0.01).onChange(applyLights);
lightFolder.add(params, "fillZ", -8, 8, 0.01).onChange(applyLights);

gui.hide();
