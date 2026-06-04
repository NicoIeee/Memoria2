// memorial.js
// REEMPLAZA COMPLETO TU ARCHIVO memorial.js POR ESTE
// AJUSTE:
// - LAS LETRAS SE MANTIENEN IGUAL
// - EL FONDO AHORA ES MAS ANCHO Y PROFUNDO
// - EL SUELO CUBRE TODA LA VISTA
// - TODOS LOS FRAMES PROYECTAN SOMBRA AL SUELO
// - LA CAMARA YA NO TIENE LIMITE LATERAL DE GIRO

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";

/* =========================================================
   CONFIGURACION GENERAL
   ========================================================= */

const MODO_DEMO_RELLENAR_PALABRA = true;
const MOSTRAR_GUIA_LETRAS = false;

const INCLUIR_CARA_TRASERA = false;
const INCLUIR_DIAGONALES = true;

const ALTURA_OBJETIVO_LETRA = 4.2;
const ANCHO_FRAME = 0.31;
const ALTO_FRAME = 0.43;
const PROFUNDIDAD_FRAME = 0.04;
const DISTANCIA_MINIMA_ENTRE_FRAMES = 0.34;
const OFFSET_FRAME = 0.028;
const MAX_FRAMES_POR_LETRA = 68;

const USAR_ESCENARIO_REFERENCIA = true;
const BACKGROUND_FILE = "models/memoriafondo.glb";
const MOSTRAR_FONDO_GLB = false;

const POSICION_LETRAS_INICIAL = new THREE.Vector3(0, 1.48, -7.6);
const POSICION_CAMARA_INICIAL = new THREE.Vector3(0, 5.2, 18.2);
const OBJETIVO_CAMARA_INICIAL = new THREE.Vector3(0, 2.75, -7.6);

const ACTIVAR_SOMBRAS_SUAVES_FRAMES = true;

const CUPOS_POR_CARA = {
  front: 34,
  left: 12,
  right: 12,
  top: 8,
  diagonal: 6,
  back: 0
};

/* =========================================================
   ARCHIVOS GLB DE LETRAS
   ========================================================= */

const letterFiles = [
  {
    order: 0,
    key: "M1",
    label: "M",
    file: "models/M1 memoria.glb",
    x: -6.6,
    rotation: { x: -Math.PI / 2, y: 0, z: 0 }
  },
  {
    order: 1,
    key: "E",
    label: "E",
    file: "models/E memoria.glb",
    x: -4.4,
    rotation: { x: -Math.PI / 2, y: 0, z: 0 }
  },
  {
    order: 2,
    key: "M2",
    label: "M",
    file: "models/M2 memoria.glb",
    x: -2.2,
    rotation: { x: -Math.PI / 2, y: 0, z: 0 }
  },
  {
    order: 3,
    key: "O",
    label: "O",
    file: "models/O memoria.glb",
    x: 0,
    rotation: { x: -Math.PI / 2, y: 0, z: 0 }
  },
  {
    order: 4,
    key: "R",
    label: "R",
    file: "models/R memoria.glb",
    x: 2.2,
    rotation: { x: -Math.PI / 2, y: 0, z: 0 }
  },
  {
    order: 5,
    key: "I",
    label: "I",
    file: "models/I memoria.glb",
    x: 4.4,
    rotation: { x: -Math.PI / 2, y: 0, z: 0 }
  },
  {
    order: 6,
    key: "A",
    label: "A",
    file: "models/A memoria.glb",
    x: 6.6,
    rotation: { x: -Math.PI / 2, y: 0, z: 0 }
  }
];

/* =========================================================
   MEMORIAS
   ========================================================= */

const defaultMemories = [
  {
    personId: "p001",
    name: "Memoria colectiva",
    message: "Cada rostro construye la palabra.",
    type: "Imagen",
    relation: "Proyecto",
    files: [
      {
        name: "referencia.jpg",
        type: "image",
        url: "https://picsum.photos/400/520?1"
      }
    ]
  },
  {
    personId: "p002",
    name: "Presencia",
    message: "Recordar tambien es resistir.",
    type: "Imagen",
    relation: "Proyecto",
    files: [
      {
        name: "referencia.jpg",
        type: "image",
        url: "https://picsum.photos/400/520?2"
      }
    ]
  },
  {
    personId: "p003",
    name: "Archivo pendiente",
    message: "Esta memoria aun no tiene fotografia.",
    type: "Escrito",
    relation: "Proyecto",
    files: []
  },
  {
    personId: "p004",
    name: "Registro sin fotografia",
    message: "Buscamos archivos que completen su historia.",
    type: "Documento",
    relation: "Proyecto",
    files: []
  }
];

function getMemories() {
  const saved = localStorage.getItem("memories");

  if (!saved) {
    localStorage.setItem("memories", JSON.stringify(defaultMemories));
    return defaultMemories.slice();
  }

  try {
    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem("memories", JSON.stringify(defaultMemories));
      return defaultMemories.slice();
    }

    return parsed;
  } catch (error) {
    localStorage.setItem("memories", JSON.stringify(defaultMemories));
    return defaultMemories.slice();
  }
}

const memories = getMemories();

/* =========================================================
   ESCENA THREE
   ========================================================= */

const container = document.getElementById("threeContainer");

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x111111, 35, 115);

const camera = new THREE.PerspectiveCamera(
  35,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);

camera.position.copy(POSICION_CAMARA_INICIAL);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false
});

renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.localClippingEnabled = false;
renderer.setClearColor(0x0a0a0a, 1);

container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.copy(OBJETIVO_CAMARA_INICIAL);

controls.enablePan = true;
controls.screenSpacePanning = false;

controls.minDistance = 5;
controls.maxDistance = 55;

/*
  SIN LIMITE LATERAL:
  ahora puedes girar por toda la habitacion.
*/
controls.minAzimuthAngle = -Infinity;
controls.maxAzimuthAngle = Infinity;

controls.minPolarAngle = 0.15;
controls.maxPolarAngle = Math.PI - 0.15;

controls.rotateSpeed = 0.72;
controls.zoomSpeed = 0.85;
controls.panSpeed = 0.6;

const memorialGroup = new THREE.Group();
memorialGroup.position.copy(POSICION_LETRAS_INICIAL);
memorialGroup.rotation.set(0, 0, 0);
scene.add(memorialGroup);

/* =========================================================
   ILUMINACION
   ========================================================= */

scene.add(new THREE.AmbientLight(0xffffff, 0.92));

const keyLight = new THREE.DirectionalLight(0xffffff, 2.7);
keyLight.position.set(-10, 14, 18);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 4096;
keyLight.shadow.mapSize.height = 4096;
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 90;
keyLight.shadow.camera.left = -42;
keyLight.shadow.camera.right = 42;
keyLight.shadow.camera.top = 32;
keyLight.shadow.camera.bottom = -18;
keyLight.shadow.bias = -0.00008;
scene.add(keyLight);

const frontLight = new THREE.PointLight(0xffffff, 1.7, 56);
frontLight.position.set(0, 6.4, 12);
frontLight.castShadow = true;
frontLight.shadow.mapSize.width = 1024;
frontLight.shadow.mapSize.height = 1024;
scene.add(frontLight);

const centerFillLight = new THREE.PointLight(0xd9e0e7, 1.2, 55);
centerFillLight.position.set(0, 5.0, -7.5);
scene.add(centerFillLight);

const backGlowLight = new THREE.PointLight(0xcfd6dd, 0.75, 38);
backGlowLight.position.set(0, 5.8, -24);
scene.add(backGlowLight);

const floorBounceLight = new THREE.PointLight(0xbec5cc, 0.42, 30);
floorBounceLight.position.set(0, 0.9, -6.5);
scene.add(floorBounceLight);

/* =========================================================
   ESCENARIO REFERENCIA
   ========================================================= */

let backgroundModel = null;
let referenceRoom = null;

function createStoneMaterial(color, roughness = 0.88, metalness = 0.04) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    side: THREE.DoubleSide
  });
}

function createPanelLine(width, height, depth, color = 0x505357) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    createStoneMaterial(color, 0.96, 0.02)
  );
}

function createReferenceRoom() {
  const room = new THREE.Group();
  room.name = "reference-room";

  /*
    FONDO MAS GRANDE:
    - roomWidth mas ancho para que quepa toda la palabra MEMORIA
    - roomDepth mas profundo para separar pared frontal/trasera
    - floorDepth extra hacia la camara para cubrir toda la vista
  */
  const roomWidth = 58;
  const roomHeight = 12;
  const roomDepth = 54;
  const roomCenterZ = -10;
  const floorDepth = 86;

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(roomWidth, 0.48, floorDepth),
    new THREE.MeshStandardMaterial({
      color: 0xb4b8bc,
      roughness: 0.16,
      metalness: 0.06,
      side: THREE.DoubleSide
    })
  );
  floor.position.set(0, -0.24, roomCenterZ + 6);
  floor.receiveShadow = true;
  room.add(floor);

  const floorReflect = new THREE.Mesh(
    new THREE.PlaneGeometry(roomWidth - 2.4, floorDepth - 2.4),
    new THREE.MeshStandardMaterial({
      color: 0xd2d6da,
      roughness: 0.12,
      metalness: 0.04,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  );
  floorReflect.rotation.x = -Math.PI / 2;
  floorReflect.position.set(0, 0.025, roomCenterZ + 6);
  floorReflect.receiveShadow = true;
  room.add(floorReflect);

  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(roomWidth, roomHeight, 0.9),
    createStoneMaterial(0x64676b, 0.92, 0.02)
  );
  backWall.position.set(0, roomHeight / 2, roomCenterZ - roomDepth / 2);
  backWall.receiveShadow = true;
  room.add(backWall);

  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, roomHeight, floorDepth),
    createStoneMaterial(0x6c7074, 0.92, 0.02)
  );
  leftWall.position.set(-roomWidth / 2, roomHeight / 2, roomCenterZ + 6);
  leftWall.receiveShadow = true;
  room.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, roomHeight, floorDepth),
    createStoneMaterial(0x6c7074, 0.92, 0.02)
  );
  rightWall.position.set(roomWidth / 2, roomHeight / 2, roomCenterZ + 6);
  rightWall.receiveShadow = true;
  room.add(rightWall);

  const ceiling = new THREE.Mesh(
    new THREE.BoxGeometry(roomWidth, 0.75, roomDepth + 12),
    createStoneMaterial(0x73777b, 0.95, 0.02)
  );
  ceiling.position.set(0, roomHeight + 0.38, roomCenterZ - 1.5);
  ceiling.receiveShadow = true;
  room.add(ceiling);

  /*
    FRANJA SUPERIOR FRONTAL COMO EN EL PNG.
  */
  const frontLintel = new THREE.Mesh(
    new THREE.BoxGeometry(roomWidth + 2, 1.95, 1.45),
    createStoneMaterial(0x7e8387, 0.95, 0.02)
  );
  frontLintel.position.set(0, roomHeight + 0.32, roomCenterZ + roomDepth / 2 + 5.2);
  frontLintel.receiveShadow = true;
  room.add(frontLintel);

  const frontTopSlab = new THREE.Mesh(
    new THREE.BoxGeometry(roomWidth + 3.2, 1.2, 7.5),
    createStoneMaterial(0x7b8084, 0.95, 0.02)
  );
  frontTopSlab.position.set(0, roomHeight + 1.42, roomCenterZ + roomDepth / 2 + 2.7);
  frontTopSlab.receiveShadow = true;
  room.add(frontTopSlab);

  /*
    LINEAS DE PANELES EN MURO TRASERO.
  */
  const verticalBackLines = [-19.3, -9.65, 0, 9.65, 19.3];

  verticalBackLines.forEach(x => {
    const line = createPanelLine(0.08, roomHeight - 0.9, 0.08, 0x4f5357);
    line.position.set(x, roomHeight / 2 + 0.05, roomCenterZ - roomDepth / 2 + 0.48);
    room.add(line);
  });

  const horizontalBackLines = [3.9, 7.6];

  horizontalBackLines.forEach(y => {
    const line = createPanelLine(roomWidth - 1.4, 0.08, 0.08, 0x4f5357);
    line.position.set(0, y, roomCenterZ - roomDepth / 2 + 0.5);
    room.add(line);
  });

  /*
    COSTILLAS LATERALES COMO EN LA IMAGEN PNG.
  */
  const ribOffset = roomWidth / 2 - 1.25;
  const ribPositions = [-ribOffset, -ribOffset + 0.8, ribOffset - 0.8, ribOffset];

  ribPositions.forEach(x => {
    const rib = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, roomHeight - 0.7, 0.34),
      createStoneMaterial(0x55595d, 0.96, 0.02)
    );
    rib.position.set(x, roomHeight / 2 + 0.18, roomCenterZ - roomDepth / 2 + 1.3);
    rib.receiveShadow = true;
    room.add(rib);
  });

  /*
    LINEAS LATERALES PARA DAR PROFUNDIDAD.
  */
  const sidePanelZ = [
    roomCenterZ - 22,
    roomCenterZ - 12,
    roomCenterZ - 2,
    roomCenterZ + 8,
    roomCenterZ + 18
  ];

  sidePanelZ.forEach(z => {
    const leftLine = createPanelLine(0.08, roomHeight - 1, 0.08, 0x55595d);
    leftLine.position.set(-roomWidth / 2 + 0.5, roomHeight / 2, z);
    leftLine.rotation.y = Math.PI / 2;
    room.add(leftLine);

    const rightLine = createPanelLine(0.08, roomHeight - 1, 0.08, 0x55595d);
    rightLine.position.set(roomWidth / 2 - 0.5, roomHeight / 2, z);
    rightLine.rotation.y = Math.PI / 2;
    room.add(rightLine);
  });

  const topOpeningLight = new THREE.PointLight(0xe6edf3, 1.25, 52);
  topOpeningLight.position.set(0, 9.0, roomCenterZ + 4);
  room.add(topOpeningLight);

  const backLight = new THREE.PointLight(0xd4dbe2, 0.7, 34);
  backLight.position.set(0, 6.0, roomCenterZ - roomDepth / 2 + 3.2);
  room.add(backLight);

  room.userData.roomWidth = roomWidth;
  room.userData.roomHeight = roomHeight;
  room.userData.roomDepth = roomDepth;
  room.userData.floorDepth = floorDepth;
  room.userData.roomCenterZ = roomCenterZ;

  return room;
}

function posicionarMemorialDentroDeSalaReferencia() {
  if (!referenceRoom) {
    memorialGroup.position.copy(POSICION_LETRAS_INICIAL);
    memorialGroup.rotation.set(0, 0, 0);
    return;
  }

  const roomDepth = referenceRoom.userData.roomDepth;
  const roomCenterZ = referenceRoom.userData.roomCenterZ;

  memorialGroup.position.set(0, 1.48, roomCenterZ + 3.2);
  memorialGroup.rotation.set(0, 0, 0);

  camera.position.set(0, 5.2, roomCenterZ + roomDepth / 2 + 12);
  controls.target.set(0, 2.65, roomCenterZ + 2.6);

  controls.minDistance = 5;
  controls.maxDistance = 55;

  controls.minAzimuthAngle = -Infinity;
  controls.maxAzimuthAngle = Infinity;

  controls.minPolarAngle = 0.15;
  controls.maxPolarAngle = Math.PI - 0.15;

  controls.update();
}

function loadBackgroundModel() {
  if (USAR_ESCENARIO_REFERENCIA) {
    referenceRoom = createReferenceRoom();
    scene.add(referenceRoom);
    posicionarMemorialDentroDeSalaReferencia();
    return;
  }

  if (!MOSTRAR_FONDO_GLB) {
    return;
  }

  const loader = new GLTFLoader();

  loader.load(
    encodeURI(BACKGROUND_FILE),
    gltf => {
      backgroundModel = gltf.scene;
      scene.add(backgroundModel);
    },
    undefined,
    error => {
      console.warn("No se pudo cargar el fondo 3D:", BACKGROUND_FILE, error);
    }
  );
}

/* =========================================================
   LOADERS
   ========================================================= */

const loader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = "anonymous";

const loadedLetters = [];

/* =========================================================
   UTILIDADES
   ========================================================= */

function getObjectBox(object) {
  object.updateWorldMatrix(true, true);

  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();

  box.getSize(size);
  box.getCenter(center);

  return { box, size, center };
}

function centerObject(object) {
  const box = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();

  box.getCenter(center);
  object.position.sub(center);
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(" ");
  let line = "";
  let currentY = y;

  words.forEach(word => {
    const testLine = line + word + " ";

    if (ctx.measureText(testLine).width > maxWidth) {
      ctx.fillText(line, x, currentY);
      line = word + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  });

  if (line.trim()) {
    ctx.fillText(line, x, currentY);
  }
}

/* =========================================================
   SOMBRAS SUAVES BAJO FRAMES
   ========================================================= */

function createSoftShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;

  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);

  gradient.addColorStop(0, "rgba(0, 0, 0, 0.28)");
  gradient.addColorStop(0.38, "rgba(0, 0, 0, 0.16)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return texture;
}

const softShadowTexture = createSoftShadowTexture();

function createFrameFloorShadow() {
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.55, 0.42),
    new THREE.MeshBasicMaterial({
      map: softShadowTexture,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  );

  shadow.rotation.x = -Math.PI / 2;
  shadow.renderOrder = 1;

  return shadow;
}

/* =========================================================
   TEXTURAS DE FRAME
   ========================================================= */

function makeTextCardTexture(memory) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 640;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ead9c0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#6f5538";
  ctx.lineWidth = 16;
  ctx.strokeRect(24, 24, 464, 592);

  ctx.fillStyle = "#17111f";
  ctx.textAlign = "center";

  ctx.font = "bold 30px Georgia";
  wrapCanvasText(ctx, memory.name || "Memoria", 256, 100, 410, 34);

  ctx.font = "22px Georgia";
  ctx.fillText(memory.type || "Aporte", 256, 170);

  ctx.font = "19px Georgia";
  wrapCanvasText(
    ctx,
    memory.message || "Memoria aportada al proyecto.",
    256,
    250,
    410,
    30
  );

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}

function getFrameTexture(memory) {
  const firstFile = memory.files && memory.files.length ? memory.files[0] : null;

  if (firstFile && firstFile.type === "image" && firstFile.url) {
    const texture = textureLoader.load(
      firstFile.url,
      loadedTexture => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.needsUpdate = true;
      },
      undefined,
      () => {}
    );

    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  return makeTextCardTexture(memory);
}

/* =========================================================
   FRAME
   ========================================================= */

function createFrame(memory) {
  const group = new THREE.Group();

  const backing = new THREE.Mesh(
    new THREE.BoxGeometry(
      ANCHO_FRAME * 1.08,
      ALTO_FRAME * 1.08,
      PROFUNDIDAD_FRAME
    ),
    new THREE.MeshStandardMaterial({
      color: 0x2b1d13,
      roughness: 0.72,
      metalness: 0.08
    })
  );

  const frameTexture = getFrameTexture(memory);

  const frontPhoto = new THREE.Mesh(
    new THREE.PlaneGeometry(ANCHO_FRAME, ALTO_FRAME),
    new THREE.MeshStandardMaterial({
      map: frameTexture,
      roughness: 0.62,
      metalness: 0.04,
      side: THREE.DoubleSide
    })
  );

  const backPhoto = new THREE.Mesh(
    new THREE.PlaneGeometry(ANCHO_FRAME, ALTO_FRAME),
    new THREE.MeshStandardMaterial({
      map: frameTexture,
      roughness: 0.62,
      metalness: 0.04,
      side: THREE.DoubleSide
    })
  );

  frontPhoto.position.z = PROFUNDIDAD_FRAME / 2 + 0.004;
  backPhoto.position.z = -(PROFUNDIDAD_FRAME / 2 + 0.004);
  backPhoto.rotation.y = Math.PI;

  backing.castShadow = true;
  backing.receiveShadow = true;

  frontPhoto.castShadow = true;
  frontPhoto.receiveShadow = true;

  backPhoto.castShadow = true;
  backPhoto.receiveShadow = true;

  backing.userData.isFrame = true;
  backing.userData.memory = memory;

  frontPhoto.userData.isFrame = true;
  frontPhoto.userData.memory = memory;

  backPhoto.userData.isFrame = true;
  backPhoto.userData.memory = memory;

  group.userData.isFrame = true;
  group.userData.memory = memory;

  group.add(backing);
  group.add(frontPhoto);
  group.add(backPhoto);

  group.traverse(child => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return group;
}

/* =========================================================
   LETRAS COMO ESTRUCTURA INVISIBLE
   ========================================================= */

function styleLetterStructure(model) {
  model.traverse(child => {
    if (!child.isMesh) {
      return;
    }

    child.castShadow = false;
    child.receiveShadow = false;

    child.material = new THREE.MeshStandardMaterial({
      color: 0x4a2d17,
      roughness: 0.56,
      metalness: 0.14,
      transparent: true,
      opacity: MOSTRAR_GUIA_LETRAS ? 0.13 : 0,
      depthWrite: false,
      side: THREE.DoubleSide
    });
  });
}

function prepareGLBLetter(model, rotationConfig) {
  styleLetterStructure(model);

  model.rotation.set(
    rotationConfig.x || 0,
    rotationConfig.y || 0,
    rotationConfig.z || 0
  );

  const wrapper = new THREE.Group();
  wrapper.add(model);

  centerObject(wrapper);

  const current = getObjectBox(wrapper);
  const scale = ALTURA_OBJETIVO_LETRA / Math.max(current.size.y, 0.01);

  wrapper.scale.setScalar(scale);

  const finalBox = new THREE.Box3().setFromObject(wrapper);
  wrapper.position.y -= finalBox.min.y;

  return wrapper;
}

/* =========================================================
   SLOTS SOBRE LA SUPERFICIE 3D
   ========================================================= */

function getSurfaceSide(normal) {
  if (normal.z > 0.48) return "front";
  if (normal.z < -0.48) return "back";
  if (normal.x > 0.48) return "right";
  if (normal.x < -0.48) return "left";
  if (normal.y > 0.46) return "top";
  return "diagonal";
}

function filterSlots(slots, minDistance, maxSlots) {
  if (!slots.length || maxSlots <= 0) {
    return [];
  }

  const orderedSlots = slots
    .map(slot => {
      const value =
        Math.sin(
          slot.position.x * 12.9898 +
          slot.position.y * 78.233 +
          slot.position.z * 37.719
        ) * 43758.5453;

      return {
        position: slot.position,
        normal: slot.normal,
        sortValue: value - Math.floor(value)
      };
    })
    .sort((a, b) => a.sortValue - b.sortValue);

  const selected = [];

  for (const slot of orderedSlots) {
    let tooClose = false;

    for (const existing of selected) {
      if (slot.position.distanceTo(existing.position) < minDistance) {
        tooClose = true;
        break;
      }
    }

    if (!tooClose) {
      selected.push(slot);
    }

    if (selected.length >= maxSlots) {
      break;
    }
  }

  return selected;
}

function createSurfaceSlots(letterGroup, structureObject) {
  letterGroup.updateWorldMatrix(true, true);
  structureObject.updateWorldMatrix(true, true);

  const slotsBySide = {
    front: [],
    back: [],
    left: [],
    right: [],
    top: [],
    diagonal: []
  };

  structureObject.traverse(child => {
    if (!child.isMesh || !child.geometry || !child.geometry.attributes.position) {
      return;
    }

    const sampler = new MeshSurfaceSampler(child).build();

    const samplePosition = new THREE.Vector3();
    const sampleNormal = new THREE.Vector3();

    for (let i = 0; i < 3200; i++) {
      sampler.sample(samplePosition, sampleNormal);

      const worldPosition = samplePosition.clone();
      const worldNormal = sampleNormal.clone();

      child.localToWorld(worldPosition);
      worldNormal.transformDirection(child.matrixWorld).normalize();

      const localPosition = letterGroup.worldToLocal(worldPosition.clone());

      const inverseMatrix = new THREE.Matrix4()
        .copy(letterGroup.matrixWorld)
        .invert();

      const localNormal = worldNormal
        .clone()
        .transformDirection(inverseMatrix)
        .normalize();

      if (localNormal.y < -0.66) {
        continue;
      }

      const side = getSurfaceSide(localNormal);

      slotsBySide[side].push({
        position: localPosition,
        normal: localNormal
      });
    }
  });

  const finalSlots = [];

  finalSlots.push(
    ...filterSlots(
      slotsBySide.front,
      DISTANCIA_MINIMA_ENTRE_FRAMES,
      CUPOS_POR_CARA.front
    )
  );

  finalSlots.push(
    ...filterSlots(
      slotsBySide.left,
      DISTANCIA_MINIMA_ENTRE_FRAMES,
      CUPOS_POR_CARA.left
    )
  );

  finalSlots.push(
    ...filterSlots(
      slotsBySide.right,
      DISTANCIA_MINIMA_ENTRE_FRAMES,
      CUPOS_POR_CARA.right
    )
  );

  finalSlots.push(
    ...filterSlots(
      slotsBySide.top,
      DISTANCIA_MINIMA_ENTRE_FRAMES,
      CUPOS_POR_CARA.top
    )
  );

  if (INCLUIR_DIAGONALES) {
    finalSlots.push(
      ...filterSlots(
        slotsBySide.diagonal,
        DISTANCIA_MINIMA_ENTRE_FRAMES,
        CUPOS_POR_CARA.diagonal
      )
    );
  }

  if (INCLUIR_CARA_TRASERA) {
    finalSlots.push(
      ...filterSlots(
        slotsBySide.back,
        DISTANCIA_MINIMA_ENTRE_FRAMES,
        CUPOS_POR_CARA.back
      )
    );
  }

  return finalSlots.slice(0, MAX_FRAMES_POR_LETRA);
}

/* =========================================================
   AÑADIR FRAMES A LETRAS
   ========================================================= */

function addFramesOn3DStructure(letterGroup, structureObject) {
  const slots = createSurfaceSlots(letterGroup, structureObject);

  const framesGroup = new THREE.Group();
  framesGroup.name = "frames-" + letterGroup.name;

  const shadowsGroup = new THREE.Group();
  shadowsGroup.name = "frame-shadows-" + letterGroup.name;

  const totalFrames = MODO_DEMO_RELLENAR_PALABRA
    ? slots.length
    : Math.min(slots.length, memories.length);

  for (let i = 0; i < totalFrames; i++) {
    const memory = memories[i % memories.length];
    const slot = slots[i];
    const frame = createFrame(memory);

    const position = slot.position.clone().add(
      slot.normal.clone().multiplyScalar(OFFSET_FRAME)
    );

    frame.position.copy(position);

    const quaternion = new THREE.Quaternion();

    quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      slot.normal.clone().normalize()
    );

    frame.quaternion.copy(quaternion);

    framesGroup.add(frame);

    if (ACTIVAR_SOMBRAS_SUAVES_FRAMES) {
      const shadow = createFrameFloorShadow();

      shadow.position.set(
        position.x,
        -memorialGroup.position.y + 0.035,
        position.z
      );

      shadow.scale.setScalar(0.9 + (i % 5) * 0.07);
      shadow.rotation.z = ((i % 7) - 3) * 0.08;

      shadowsGroup.add(shadow);
    }
  }

  letterGroup.add(shadowsGroup);
  letterGroup.add(framesGroup);
}

/* =========================================================
   FALLBACK SI FALLA UNA LETRA
   ========================================================= */

function addFramesOnFallbackVolume(letterGroup) {
  const framesGroup = new THREE.Group();
  framesGroup.name = "fallback-frames-" + letterGroup.name;

  const shadowsGroup = new THREE.Group();
  shadowsGroup.name = "fallback-frame-shadows-" + letterGroup.name;

  const slots = [];
  const cols = 4;
  const rows = 8;
  const depth = 0.42;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = (col - (cols - 1) / 2) * 0.42;
      const y = row * 0.56 + 0.18;

      slots.push({
        position: new THREE.Vector3(x, y, depth),
        normal: new THREE.Vector3(0, 0, 1)
      });

      slots.push({
        position: new THREE.Vector3(-0.88, y, x * 0.65),
        normal: new THREE.Vector3(-1, 0, 0)
      });

      slots.push({
        position: new THREE.Vector3(0.88, y, x * 0.65),
        normal: new THREE.Vector3(1, 0, 0)
      });

      if (row === rows - 1) {
        slots.push({
          position: new THREE.Vector3(x, y + 0.22, 0),
          normal: new THREE.Vector3(0, 1, 0)
        });
      }
    }
  }

  const totalFrames = MODO_DEMO_RELLENAR_PALABRA
    ? slots.length
    : Math.min(slots.length, memories.length);

  for (let i = 0; i < totalFrames; i++) {
    const memory = memories[i % memories.length];
    const slot = slots[i];
    const frame = createFrame(memory);

    frame.position.copy(slot.position);

    const quaternion = new THREE.Quaternion();

    quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      slot.normal.clone().normalize()
    );

    frame.quaternion.copy(quaternion);

    framesGroup.add(frame);

    if (ACTIVAR_SOMBRAS_SUAVES_FRAMES) {
      const shadow = createFrameFloorShadow();

      shadow.position.set(
        slot.position.x,
        -memorialGroup.position.y + 0.035,
        slot.position.z
      );

      shadow.scale.setScalar(0.9 + (i % 5) * 0.07);
      shadow.rotation.z = ((i % 7) - 3) * 0.08;

      shadowsGroup.add(shadow);
    }
  }

  letterGroup.add(shadowsGroup);
  letterGroup.add(framesGroup);
}

/* =========================================================
   CARGA DE LETRAS
   ========================================================= */

function createLetter(data, glbScene) {
  const letterGroup = new THREE.Group();
  letterGroup.name = data.key;
  letterGroup.position.set(data.x, 0, 0);

  const structure = prepareGLBLetter(glbScene, data.rotation);

  letterGroup.add(structure);
  memorialGroup.add(letterGroup);

  letterGroup.updateWorldMatrix(true, true);
  addFramesOn3DStructure(letterGroup, structure);

  loadedLetters.push({
    order: data.order,
    group: letterGroup
  });

  arrangeWord();

  structure.visible = MOSTRAR_GUIA_LETRAS;

  if (USAR_ESCENARIO_REFERENCIA) {
    posicionarMemorialDentroDeSalaReferencia();
  } else {
    fitMemorialView();
  }
}

function createFallbackLetter(data) {
  const letterGroup = new THREE.Group();
  letterGroup.name = data.key;
  letterGroup.position.set(data.x, 0, 0);

  const fallbackStructure = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, ALTURA_OBJETIVO_LETRA, 0.9),
    new THREE.MeshStandardMaterial({
      color: 0x4a2d17,
      transparent: true,
      opacity: MOSTRAR_GUIA_LETRAS ? 0.12 : 0,
      depthWrite: false
    })
  );

  fallbackStructure.visible = MOSTRAR_GUIA_LETRAS;

  letterGroup.add(fallbackStructure);
  memorialGroup.add(letterGroup);

  addFramesOnFallbackVolume(letterGroup);

  loadedLetters.push({
    order: data.order,
    group: letterGroup
  });

  arrangeWord();

  if (USAR_ESCENARIO_REFERENCIA) {
    posicionarMemorialDentroDeSalaReferencia();
  } else {
    fitMemorialView();
  }
}

function arrangeWord() {
  const orderedLetters = loadedLetters.slice().sort((a, b) => a.order - b.order);

  orderedLetters.forEach(item => {
    const data = letterFiles.find(letter => letter.order === item.order);

    if (!data) {
      return;
    }

    item.group.position.x = data.x;
    item.group.position.y = 0;
    item.group.position.z = 0;
  });
}

function loadLetters() {
  const sortedLetters = letterFiles.slice().sort((a, b) => a.order - b.order);

  sortedLetters.forEach(data => {
    loader.load(
      encodeURI(data.file),
      gltf => {
        createLetter(data, gltf.scene);
      },
      undefined,
      error => {
        console.warn("No se pudo cargar la letra:", data.file, error);
        createFallbackLetter(data);
      }
    );
  });
}

loadBackgroundModel();
loadLetters();

/* =========================================================
   CAMARA
   ========================================================= */

function fitMemorialView() {
  controls.target.copy(OBJETIVO_CAMARA_INICIAL);
  camera.position.copy(POSICION_CAMARA_INICIAL);
  controls.update();
}

document.getElementById("fullWordButton").addEventListener("click", () => {
  if (USAR_ESCENARIO_REFERENCIA) {
    posicionarMemorialDentroDeSalaReferencia();
  } else {
    fitMemorialView();
  }
});

document.getElementById("zoomIn").addEventListener("click", () => {
  camera.position.multiplyScalar(0.94);
});

document.getElementById("zoomOut").addEventListener("click", () => {
  camera.position.multiplyScalar(1.06);
});

document.getElementById("resetView").addEventListener("click", () => {
  if (USAR_ESCENARIO_REFERENCIA) {
    posicionarMemorialDentroDeSalaReferencia();
  } else {
    fitMemorialView();
  }
});

/* =========================================================
   INTERACCION
   ========================================================= */

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

renderer.domElement.addEventListener("click", event => {
  const rect = renderer.domElement.getBoundingClientRect();

  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(memorialGroup.children, true);

  if (!intersects.length) {
    return;
  }

  const hit = intersects[0].object;

  if (hit.userData.isFrame) {
    openModal(hit.userData.memory);
  }
});

/* =========================================================
   MODAL
   ========================================================= */

function openModal(memory) {
  const modal = document.getElementById("memoryModal");
  const modalMedia = document.getElementById("modalMedia");
  const modalFiles = document.getElementById("modalFiles");

  modal.classList.add("active");

  modalMedia.innerHTML = "";
  modalFiles.innerHTML = "";

  document.getElementById("modalTitle").textContent = memory.name || "Memoria";

  document.getElementById("modalMeta").textContent =
    (memory.type || "Aporte") + " · Aporte: " + (memory.relation || "Proyecto");

  document.getElementById("modalMessage").textContent =
    memory.message || "Memoria aportada al proyecto.";

  const preview = memory.files && memory.files.length ? memory.files[0] : null;

  if (preview) {
    if (preview.type === "image") {
      const img = document.createElement("img");
      img.src = preview.url;
      modalMedia.appendChild(img);
    }

    if (preview.type === "video") {
      const video = document.createElement("video");
      video.src = preview.url;
      video.controls = true;
      modalMedia.appendChild(video);
    }

    if (preview.type === "audio") {
      const audio = document.createElement("audio");
      audio.src = preview.url;
      audio.controls = true;
      modalMedia.appendChild(audio);
    }
  }

  if (memory.files && memory.files.length) {
    memory.files.forEach(file => {
      const li = document.createElement("li");
      li.textContent = file.name;
      modalFiles.appendChild(li);
    });
  }
}

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("memoryModal").classList.remove("active");
});

document.getElementById("memoryModal").addEventListener("click", event => {
  if (event.target.id === "memoryModal") {
    document.getElementById("memoryModal").classList.remove("active");
  }
});

/* =========================================================
   ANIMACION Y RESIZE
   ========================================================= */

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});