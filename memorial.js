import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const memories = [
  {
    name: "Memoria colectiva",
    message: "Cada rostro construye la palabra.",
    type: "Imagen",
    relation: "Proyecto",
    files: [{ name: "referencia.jpg", type: "image", url: "https://picsum.photos/300?1" }]
  },
  {
    name: "Presencia",
    message: "Recordar también es resistir.",
    type: "Imagen",
    relation: "Proyecto",
    files: [{ name: "referencia.jpg", type: "image", url: "https://picsum.photos/300?2" }]
  },
  {
    name: "Archivo pendiente",
    message: "Esta memoria aún no tiene fotografía.",
    type: "Escrito",
    relation: "Proyecto",
    files: []
  },
  {
    name: "Registro sin fotografía",
    message: "Buscamos archivos que completen su historia.",
    type: "Documento",
    relation: "Proyecto",
    files: []
  }
];

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
    "11111",
    "00100",
    "00100",
    "00100",
    "00100",
    "00100",
    "11111"
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

const container = document.getElementById("threeContainer");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  35,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);

camera.position.set(0, 4.8, 34);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});

renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0, 3.2, 0);
controls.minDistance = 10;
controls.maxDistance = 55;

const memorialGroup = new THREE.Group();
scene.add(memorialGroup);

scene.add(new THREE.AmbientLight(0xfff2df, 1.5));

const keyLight = new THREE.DirectionalLight(0xffd9a3, 3.6);
keyLight.position.set(-7, 10, 9);
scene.add(keyLight);

const warmLight = new THREE.PointLight(0xffc27a, 2.8, 24);
warmLight.position.set(-8, 4, 8);
scene.add(warmLight);

const purpleLight = new THREE.PointLight(0x6b5fae, 1.5, 22);
purpleLight.position.set(9, 5, -4);
scene.add(purpleLight);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(95, 44),
  new THREE.MeshStandardMaterial({
    color: 0x2b241c,
    roughness: 0.65,
    metalness: 0.04
  })
);

floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.05;
scene.add(floor);

const wall = new THREE.Mesh(
  new THREE.PlaneGeometry(95, 28),
  new THREE.MeshStandardMaterial({
    color: 0x3a332b,
    roughness: 0.85
  })
);

wall.position.set(0, 8.8, -4.2);
scene.add(wall);

const letters = [
  { label: "M", x: -18 },
  { label: "E", x: -12 },
  { label: "M", x: -6 },
  { label: "O", x: 0 },
  { label: "R", x: 6 },
  { label: "I", x: 12 },
  { label: "A", x: 18 }
];

function makePhotoTexture(memory) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 640;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#e8d7bf";
  ctx.fillRect(0, 0, 512, 640);

  ctx.strokeStyle = "#6e5436";
  ctx.lineWidth = 16;
  ctx.strokeRect(26, 26, 460, 588);

  ctx.fillStyle = "#17111f";
  ctx.textAlign = "center";

  ctx.font = "bold 30px Georgia";
  ctx.fillText(memory.name, 256, 105);

  ctx.font = "22px Georgia";
  ctx.fillText(memory.type, 256, 150);

  ctx.font = "19px Georgia";

  const words = memory.message.split(" ");
  let line = "";
  let y = 240;

  words.forEach(word => {
    const test = line + word + " ";

    if (ctx.measureText(test).width > 410) {
      ctx.fillText(line, 256, y);
      line = word + " ";
      y += 30;
    } else {
      line = test;
    }
  });

  ctx.fillText(line, 256, y);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

function createFrame(memory) {
  const group = new THREE.Group();

  const backing = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.9, 0.08),
    new THREE.MeshStandardMaterial({
      color: 0x2b1d13,
      roughness: 0.72,
      metalness: 0.08
    })
  );

  const photo = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, 0.78),
    new THREE.MeshStandardMaterial({
      map: makePhotoTexture(memory),
      roughness: 0.65,
      metalness: 0.04,
      side: THREE.DoubleSide
    })
  );

  photo.position.z = 0.052;

  backing.userData.isFrame = true;
  backing.userData.memory = memory;

  photo.userData.isFrame = true;
  photo.userData.memory = memory;

  group.add(backing);
  group.add(photo);

  return group;
}

function createBlock() {
  const block = new THREE.Mesh(
    new THREE.BoxGeometry(0.78, 0.9, 0.7),
    new THREE.MeshStandardMaterial({
      color: 0x4a2d17,
      roughness: 0.55,
      metalness: 0.14
    })
  );

  block.castShadow = true;
  block.receiveShadow = true;

  return block;
}

function createLetter(label, startX) {
  const letterGroup = new THREE.Group();
  letterGroup.position.set(startX, 0, 0);

  const map = letterMaps[label];

  const cellW = 0.78;
  const cellH = 0.9;
  const gap = 0.03;

  let memoryIndex = 0;

  map.forEach((rowPattern, row) => {
    rowPattern.split("").forEach((value, col) => {
      if (value !== "1") return;

      const x = (col - 2) * (cellW + gap);
      const y = (6 - row) * (cellH + gap) + 0.45;

      const block = createBlock();
      block.position.set(x, y, 0);
      letterGroup.add(block);

      const memory = memories[memoryIndex % memories.length];
      const frame = createFrame(memory);

      frame.position.set(x, y, 0.42);
      frame.rotation.set(0, 0, 0);

      letterGroup.add(frame);

      memoryIndex++;
    });
  });

  memorialGroup.add(letterGroup);
}

letters.forEach(letter => {
  createLetter(letter.label, letter.x);
});

document.getElementById("fullWordButton").addEventListener("click", () => {
  controls.target.set(0, 3.2, 0);
  camera.position.set(0, 4.8, 34);
  controls.update();
});

document.getElementById("zoomIn").addEventListener("click", () => {
  camera.position.multiplyScalar(0.9);
});

document.getElementById("zoomOut").addEventListener("click", () => {
  camera.position.multiplyScalar(1.1);
});

document.getElementById("resetView").addEventListener("click", () => {
  controls.target.set(0, 3.2, 0);
  camera.position.set(0, 4.8, 34);
  controls.update();
});

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

renderer.domElement.addEventListener("click", event => {
  const rect = renderer.domElement.getBoundingClientRect();

  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(memorialGroup.children, true);

  if (!intersects.length) return;

  const hit = intersects[0].object;

  if (hit.userData.isFrame) {
    openModal(hit.userData.memory);
  }
});

function openModal(memory) {
  const modal = document.getElementById("memoryModal");
  const modalMedia = document.getElementById("modalMedia");
  const modalFiles = document.getElementById("modalFiles");

  modal.classList.add("active");

  modalMedia.innerHTML = "";
  modalFiles.innerHTML = "";

  document.getElementById("modalTitle").textContent = memory.name;
  document.getElementById("modalMeta").textContent =
    `${memory.type} · Aporte: ${memory.relation}`;
  document.getElementById("modalMessage").textContent = memory.message;

  const preview = memory.files[0];

  if (preview && preview.type === "image") {
    const img = document.createElement("img");
    img.src = preview.url;
    modalMedia.appendChild(img);
  }

  memory.files.forEach(file => {
    const li = document.createElement("li");
    li.textContent = file.name;
    modalFiles.appendChild(li);
  });
}

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("memoryModal").classList.remove("active");
});

document.getElementById("memoryModal").addEventListener("click", event => {
  if (event.target.id === "memoryModal") {
    document.getElementById("memoryModal").classList.remove("active");
  }
});

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