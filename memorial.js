// memorial.js

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/* =========================================================
   CONFIGURACIÓN PRINCIPAL
   ========================================================= */

const MODO_DEMO_RELLENAR_PALABRA = true;
const MOSTRAR_GUIA_LETRAS = false;

const INCLUIR_CARA_TRASERA = false;

const CELL_W = 0.48;
const CELL_H = 0.72;
const DEPTH = 0.72;

const ANCHO_FRAME = 0.36;
const ALTO_FRAME = 0.50;
const PROFUNDIDAD_FRAME = 0.045;

const GAP_ENTRE_LETRAS = 0.58;

/* =========================================================
   MAPA DE LETRAS 3D
   ========================================================= */

const letterMaps = {
  M: [
    "10001",
    "11011",
    "10101",
    "10101",
    "10001",
    "10001",
    "10001"
  ],
  E: [
    "11111",
    "10000",
    "10000",
    "11110",
    "10000",
    "10000",
    "11111"
  ],
  O: [
    "01110",
    "10001",
    "10001",
    "10001",
    "10001",
    "10001",
    "01110"
  ],
  R: [
    "11110",
    "10001",
    "10001",
    "11110",
    "10100",
    "10010",
    "10001"
  ],
  I: [
    "111",
    "010",
    "010",
    "010",
    "010",
    "010",
    "111"
  ],
  A: [
    "01110",
    "10001",
    "10001",
    "11111",
    "10001",
    "10001",
    "10001"
  ]
};

/* =========================================================
   ARCHIVOS GLB
   ========================================================= */

const letterFiles = [
  {
    order: 0,
    key: "M1",
    label: "M",
    file: "models/M1 memoria.glb"
  },
  {
    order: 1,
    key: "E",
    label: "E",
    file: "models/E memoria.glb"
  },
  {
    order: 2,
    key: "M2",
    label: "M",
    file: "models/M2 memoria.glb"
  },
  {
    order: 3,
    key: "O",
    label: "O",
    file: "models/O memoria.glb"
  },
  {
    order: 4,
    key: "R",
    label: "R",
    file: "models/R memoria.glb"
  },
  {
    order: 5,
    key: "I",
    label: "I",
    file: "models/I memoria.glb"
  },
  {
    order: 6,
    key: "A",
    label: "A",
    file: "models/A memoria.glb"
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
    message: "Recordar también es resistir.",
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
    message: "Esta memoria aún no tiene fotografía.",
    type: "Escrito",
    relation: "Proyecto",
    files: []
  },
  {
    personId: "p004",
    name: "Registro sin fotografía",
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
    return [...defaultMemories];
  }

  try {
    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem("memories", JSON.stringify(defaultMemories));
      return [...defaultMemories];
    }

    return parsed;
  } catch (error) {
    localStorage.setItem("memories", JSON.stringify(defaultMemories));
    return [...defaultMemories];
  }
}

const memories = getMemories();

/* =========================================================
   ESCENA THREE
   ========================================================= */

const container = document.getElementById("threeContainer");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  35,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);

camera.position.set(0, 4.9, 25);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});

renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;

container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0, 2.65, 0);
controls.minDistance = 8;
controls.maxDistance = 45;
controls.maxPolarAngle = Math.PI / 2.05;

const memorialGroup = new THREE.Group();
scene.add(memorialGroup);

/* =========================================================
   ILUMINACIÓN Y ESCENARIO
   ========================================================= */

scene.add(new THREE.AmbientLight(0xfff0da, 1.34));

const keyLight = new THREE.DirectionalLight(0xffd7a0, 3.3);
keyLight.position.set(-8, 10, 12);
keyLight.castShadow = true;
scene.add(keyLight);

const warmLight = new THREE.PointLight(0xffc27a, 2.3, 26);
warmLight.position.set(-7, 4, 8);
scene.add(warmLight);

const purpleLight = new THREE.PointLight(0x6b5fae, 1.1, 22);
purpleLight.position.set(8, 5, -4);
scene.add(purpleLight);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(90, 42),
  new THREE.MeshStandardMaterial({
    color: 0x2a221b,
    roughness: 0.72,
    metalness: 0.03
  })
);

floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.05;
floor.receiveShadow = true;
scene.add(floor);

const wall = new THREE.Mesh(
  new THREE.PlaneGeometry(90, 28),
  new THREE.MeshStandardMaterial({
    color: 0x4c3927,
    roughness: 0.9
  })
);

wall.position.set(0, 8.7, -4.4);
wall.receiveShadow = true;
scene.add(wall);

/* =========================================================
   LOADERS
   ========================================================= */

const loader = new GLTFLoader();

const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = "anonymous";

const loadedLetters = [];

/* =========================================================
   TEXTURAS
   ========================================================= */

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
   FRAMES
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

  const photoFront = new THREE.Mesh(
    new THREE.PlaneGeometry(ANCHO_FRAME, ALTO_FRAME),
    new THREE.MeshStandardMaterial({
      map: getFrameTexture(memory),
      roughness: 0.62,
      metalness: 0.04,
      side: THREE.FrontSide
    })
  );

  const photoBack = new THREE.Mesh(
    new THREE.PlaneGeometry(ANCHO_FRAME, ALTO_FRAME),
    new THREE.MeshStandardMaterial({
      map: getFrameTexture(memory),
      roughness: 0.62,
      metalness: 0.04,
      side: THREE.FrontSide
    })
  );

  photoFront.position.z = PROFUNDIDAD_FRAME / 2 + 0.005;

  photoBack.position.z = -(PROFUNDIDAD_FRAME / 2 + 0.005);
  photoBack.rotation.y = Math.PI;

  backing.castShadow = true;
  backing.receiveShadow = true;

  photoFront.castShadow = true;
  photoFront.receiveShadow = true;

  photoBack.castShadow = true;
  photoBack.receiveShadow = true;

  backing.userData.isFrame = true;
  backing.userData.memory = memory;

  photoFront.userData.isFrame = true;
  photoFront.userData.memory = memory;

  photoBack.userData.isFrame = true;
  photoBack.userData.memory = memory;

  group.userData.isFrame = true;
  group.userData.memory = memory;

  group.add(backing);
  group.add(photoFront);
  group.add(photoBack);

  return group;
}

function orientFrameToNormal(frame, normal) {
  const quaternion = new THREE.Quaternion();

  quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    normal.clone().normalize()
  );

  frame.quaternion.copy(quaternion);
}

/* =========================================================
   LETRA GLB COMO MOLDE INVISIBLE
   ========================================================= */

function styleLetterStructure(model) {
  model.traverse(child => {
    if (!child.isMesh) return;

    child.castShadow = false;
    child.receiveShadow = false;

    child.material = new THREE.MeshStandardMaterial({
      color: 0x7a512d,
      roughness: 0.6,
      metalness: 0.1,
      transparent: true,
      opacity: MOSTRAR_GUIA_LETRAS ? 0.16 : 0,
      depthWrite: false,
      side: THREE.DoubleSide
    });
  });
}

function getObjectBox(object) {
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

function prepareGLBLetter(model, label) {
  styleLetterStructure(model);

  const wrapper = new THREE.Group();
  wrapper.add(model);

  centerObject(wrapper);

  const map = letterMaps[label];
  const expectedHeight = map.length * CELL_H;

  const current = getObjectBox(wrapper);
  const scale = expectedHeight / Math.max(current.size.y, current.size.z, 0.01);

  wrapper.scale.setScalar(scale);

  const finalBox = new THREE.Box3().setFromObject(wrapper);
  wrapper.position.y -= finalBox.min.y;

  wrapper.visible = MOSTRAR_GUIA_LETRAS;

  return wrapper;
}

/* =========================================================
   LETRAS 3D DESDE MAPA
   ========================================================= */

function hasCell(map, row, col) {
  if (!map[row]) return false;
  return map[row][col] === "1";
}

function getLetterDimensions(label) {
  const map = letterMaps[label];
  const rows = map.length;
  const cols = map[0].length;

  return {
    rows,
    cols,
    width: cols * CELL_W,
    height: rows * CELL_H
  };
}

function addMappedFramesToLetter(letterGroup, label) {
  const map = letterMaps[label];
  const rows = map.length;
  const cols = map[0].length;

  const framesGroup = new THREE.Group();
  framesGroup.name = `frames-${letterGroup.name}`;

  let memoryIndex = 0;

  function nextMemory() {
    const memory = memories[memoryIndex % memories.length];
    memoryIndex++;
    return memory;
  }

  function addFrameAt(position, normal) {
    if (!MODO_DEMO_RELLENAR_PALABRA && memoryIndex >= memories.length) {
      return;
    }

    const frame = createFrame(nextMemory());
    frame.position.copy(position);
    orientFrameToNormal(frame, normal);
    framesGroup.add(frame);
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!hasCell(map, row, col)) continue;

      const x = (col - (cols - 1) / 2) * CELL_W;
      const y = (rows - 1 - row) * CELL_H + CELL_H / 2;

      addFrameAt(
        new THREE.Vector3(x, y, DEPTH / 2),
        new THREE.Vector3(0, 0, 1)
      );

      if (INCLUIR_CARA_TRASERA) {
        addFrameAt(
          new THREE.Vector3(x, y, -DEPTH / 2),
          new THREE.Vector3(0, 0, -1)
        );
      }

      if (!hasCell(map, row, col - 1)) {
        addFrameAt(
          new THREE.Vector3(x - CELL_W / 2, y, 0),
          new THREE.Vector3(-1, 0, 0)
        );
      }

      if (!hasCell(map, row, col + 1)) {
        addFrameAt(
          new THREE.Vector3(x + CELL_W / 2, y, 0),
          new THREE.Vector3(1, 0, 0)
        );
      }

      if (!hasCell(map, row - 1, col)) {
        addFrameAt(
          new THREE.Vector3(x, y + CELL_H / 2, 0),
          new THREE.Vector3(0, 1, 0)
        );
      }

      if (!hasCell(map, row + 1, col)) {
        addFrameAt(
          new THREE.Vector3(x, y - CELL_H / 2, 0),
          new THREE.Vector3(0, -1, 0)
        );
      }
    }
  }

  letterGroup.add(framesGroup);
}

/* =========================================================
   CREAR LETRAS
   ========================================================= */

function createLetter(data, glbScene) {
  const letterGroup = new THREE.Group();

  letterGroup.name = data.key;
  letterGroup.userData.order = data.order;
  letterGroup.userData.label = data.label;

  const structure = prepareGLBLetter(glbScene, data.label);

  letterGroup.add(structure);

  addMappedFramesToLetter(letterGroup, data.label);

  memorialGroup.add(letterGroup);

  loadedLetters.push({
    order: data.order,
    key: data.key,
    label: data.label,
    group: letterGroup
  });

  arrangeWord();
  fitMemorialView();
}

function createFallbackLetter(data) {
  const letterGroup = new THREE.Group();

  letterGroup.name = data.key;
  letterGroup.userData.order = data.order;
  letterGroup.userData.label = data.label;

  addMappedFramesToLetter(letterGroup, data.label);

  memorialGroup.add(letterGroup);

  loadedLetters.push({
    order: data.order,
    key: data.key,
    label: data.label,
    group: letterGroup
  });

  arrangeWord();
  fitMemorialView();
}

/* =========================================================
   ORDENAR PALABRA MEMORIA
   ========================================================= */

function arrangeWord() {
  if (!loadedLetters.length) return;

  const ordered = [...loadedLetters].sort((a, b) => a.order - b.order);

  const measurements = ordered.map(item => {
    const dimensions = getLetterDimensions(item.label);

    return {
      item,
      width: dimensions.width
    };
  });

  const totalWidth =
    measurements.reduce((sum, measurement) => sum + measurement.width, 0) +
    GAP_ENTRE_LETRAS * (measurements.length - 1);

  let cursor = -totalWidth / 2;

  measurements.forEach(measurement => {
    const centerX = cursor + measurement.width / 2;

    measurement.item.group.position.x = centerX;
    measurement.item.group.position.y = 0;
    measurement.item.group.position.z = 0;

    cursor += measurement.width + GAP_ENTRE_LETRAS;
  });
}

/* =========================================================
   CARGA DE MODELOS
   ========================================================= */

function loadLetters() {
  letterFiles.forEach(data => {
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

loadLetters();

/* =========================================================
   CÁMARA
   ========================================================= */

function fitMemorialView() {
  controls.target.set(0, 2.65, 0);
  camera.position.set(0, 4.9, 25);
  controls.update();
}

document.getElementById("fullWordButton").addEventListener("click", () => {
  fitMemorialView();
});

document.getElementById("zoomIn").addEventListener("click", () => {
  camera.position.multiplyScalar(0.9);
});

document.getElementById("zoomOut").addEventListener("click", () => {
  camera.position.multiplyScalar(1.1);
});

document.getElementById("resetView").addEventListener("click", () => {
  fitMemorialView();
});

/* =========================================================
   CLICK EN FRAMES
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
    `${memory.type || "Aporte"} · Aporte: ${memory.relation || "Proyecto"}`;

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
   ANIMACIÓN Y RESPONSIVE
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

  renderer.setSize(
    container.clientWidth,
    container.clientHeight
  );
});