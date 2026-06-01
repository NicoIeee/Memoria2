import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

const memories = [
  {
    name:"Memoria colectiva",
    message:"Cada rostro construye la palabra.",
    type:"Imagen",
    relation:"Proyecto",
    files:[{ name:"referencia.jpg", type:"image", url:"https://picsum.photos/300?1" }]
  },
  {
    name:"Presencia",
    message:"Recordar también es resistir.",
    type:"Imagen",
    relation:"Proyecto",
    files:[{ name:"referencia.jpg", type:"image", url:"https://picsum.photos/300?2" }]
  },
  {
    name:"Archivo pendiente",
    message:"Esta memoria aún no tiene fotografía.",
    type:"Escrito",
    relation:"Proyecto",
    files:[]
  }
];

const container = document.getElementById("threeContainer");
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);

camera.position.set(0,4.4,18);

const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0,1.8,0);
controls.minDistance = 5;
controls.maxDistance = 34;

const memorialGroup = new THREE.Group();
scene.add(memorialGroup);

scene.add(new THREE.AmbientLight(0xfff2df,1.2));

const keyLight = new THREE.DirectionalLight(0xffd9a3,2.8);
keyLight.position.set(-6,8,8);
scene.add(keyLight);

const purpleLight = new THREE.PointLight(0x6b5fae,2.1,18);
purpleLight.position.set(8,4,-4);
scene.add(purpleLight);

const warmLight = new THREE.PointLight(0xffc27a,1.8,16);
warmLight.position.set(-8,2,6);
scene.add(warmLight);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(60,30),
  new THREE.MeshStandardMaterial({ color:0x2b261f, roughness:0.55 })
);

floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const wall = new THREE.Mesh(
  new THREE.PlaneGeometry(60,22),
  new THREE.MeshStandardMaterial({ color:0x3a332b, roughness:0.82 })
);

wall.position.set(0,7,-7);
scene.add(wall);

const loader = new GLTFLoader();

const letterFiles = [
  { key:"M1", label:"M", file:"models/M1 memoria.glb", x:-9 },
  { key:"E", label:"E", file:"models/E memoria.glb", x:-6 },
  { key:"M2", label:"M", file:"models/M2 memoria.glb", x:-3 },
  { key:"O", label:"O", file:"models/O memoria.glb", x:0 },
  { key:"R", label:"R", file:"models/R memoria.glb", x:3 },
  { key:"I", label:"I", file:"models/I memoria.glb", x:6 },
  { key:"A", label:"A", file:"models/A memoria.glb", x:9 }
];

let loadedLetters = [];
let selectedLetter = null;
let isolatedMode = false;

function makePhotoTexture(memory){
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 640;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#e8d7bf";
  ctx.fillRect(0,0,512,640);

  ctx.strokeStyle = "#7b5f3b";
  ctx.lineWidth = 12;
  ctx.strokeRect(28,28,456,584);

  ctx.fillStyle = "#17111f";
  ctx.textAlign = "center";

  ctx.font = "bold 34px Georgia";
  ctx.fillText(memory.name,256,110);

  ctx.font = "24px Georgia";
  ctx.fillText(memory.type,256,155);

  ctx.font = "20px Georgia";

  const words = memory.message.split(" ");
  let line = "";
  let y = 240;

  words.forEach(word=>{
    const test = line + word + " ";

    if(ctx.measureText(test).width > 410){
      ctx.fillText(line,256,y);
      line = word + " ";
      y += 30;
    }else{
      line = test;
    }
  });

  ctx.fillText(line,256,y);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function addFramesToLetter(letterObject){
  const box = new THREE.Box3().setFromObject(letterObject);
  const size = new THREE.Vector3();
  box.getSize(size);

  const frameGroup = new THREE.Group();
  letterObject.add(frameGroup);

  const frameW = Math.max(size.x * 0.18, 0.26);
  const frameH = Math.max(size.y * 0.22, 0.34);
  const depth = size.z * 0.52 + 0.05;

  const surfaces = [
    { name:"front", z:depth, rotY:0, cols:2, rows:3 },
    { name:"back", z:-depth, rotY:Math.PI, cols:2, rows:3 },
    { name:"left", x:-size.x * 0.52 - 0.05, rotY:-Math.PI/2, cols:2, rows:3 },
    { name:"right", x:size.x * 0.52 + 0.05, rotY:Math.PI/2, cols:2, rows:3 },
    { name:"top", y:size.y * 0.52 + 0.05, rotX:-Math.PI/2, cols:3, rows:1 }
  ];

  let memoryIndex = 0;

  surfaces.forEach(surface=>{
    for(let row=0; row<surface.rows; row++){
      for(let col=0; col<surface.cols; col++){
        const memory = memories[memoryIndex % memories.length];
        const texture = makePhotoTexture(memory);

        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(frameW,frameH),
          new THREE.MeshStandardMaterial({
            map:texture,
            roughness:0.65,
            side:THREE.DoubleSide
          })
        );

        plane.userData.isFrame = true;
        plane.userData.memory = memory;

        const px = (col - (surface.cols - 1) / 2) * frameW * 1.25;
        const py = (row - (surface.rows - 1) / 2) * frameH * 1.25;

        if(surface.name === "front" || surface.name === "back"){
          plane.position.set(px,py,surface.z);
          plane.rotation.y = surface.rotY;
        }

        if(surface.name === "left" || surface.name === "right"){
          plane.position.set(surface.x,py,px);
          plane.rotation.y = surface.rotY;
        }

        if(surface.name === "top"){
          plane.position.set(px,surface.y,py);
          plane.rotation.x = surface.rotX;
        }

        frameGroup.add(plane);
        memoryIndex++;
      }
    }
  });
}

function createFallbackLetter(data){
  const group = new THREE.Group();
  group.position.set(data.x,0,0);

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.8,4.2,1.2),
    new THREE.MeshStandardMaterial({ color:0x5a4632, roughness:0.55 })
  );

  group.add(mesh);
  addFramesToLetter(group);
  memorialGroup.add(group);

  loadedLetters.push({ key:data.key, label:data.label, object:group });
}

letterFiles.forEach(data=>{
  loader.load(
    encodeURI(data.file),
    gltf=>{
      const model = gltf.scene;
      model.position.set(data.x,0,0);
      model.scale.setScalar(1.4);

      model.traverse(child=>{
        if(child.isMesh){
          child.material = new THREE.MeshStandardMaterial({
            color:0x5a4632,
            roughness:0.55,
            metalness:0.18
          });
        }
      });

      addFramesToLetter(model);
      memorialGroup.add(model);
      loadedLetters.push({ key:data.key, label:data.label, object:model });
    },
    undefined,
    ()=>{
      createFallbackLetter(data);
    }
  );
});

const letterButtons = document.getElementById("letterButtons");

letterFiles.forEach(data=>{
  const button = document.createElement("button");
  button.textContent = data.label;

  button.addEventListener("click",()=>{
    const letter = loadedLetters.find(item=>item.key === data.key);

    if(letter){
      selectLetter(letter);
      focusObject(letter.object,7);
    }
  });

  letterButtons.appendChild(button);
});

function selectLetter(letter){
  selectedLetter = letter;

  document.getElementById("selectedLetterTitle").textContent = `Letra ${letter.label}`;
  document.getElementById("selectedLetterText").textContent =
    "Puedes aislarla para explorar sus frames en frente, laterales, parte trasera y parte superior.";
}

function focusObject(object,distance){
  const box = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  box.getCenter(center);

  controls.target.copy(center);
  camera.position.set(center.x, center.y + 2.2, center.z + distance);
  controls.update();
}

document.getElementById("isolateLetter").addEventListener("click",()=>{
  if(!selectedLetter) return;

  isolatedMode = true;

  loadedLetters.forEach(letter=>{
    letter.object.visible = letter.key === selectedLetter.key;
  });

  focusObject(selectedLetter.object,6);
});

document.getElementById("returnWord").addEventListener("click",()=>{
  isolatedMode = false;

  loadedLetters.forEach(letter=>{
    letter.object.visible = true;
  });

  focusObject(memorialGroup,18);
});

document.getElementById("fullWordButton").addEventListener("click",()=>{
  isolatedMode = false;

  loadedLetters.forEach(letter=>{
    letter.object.visible = true;
  });

  controls.target.set(0,1.8,0);
  camera.position.set(0,4.4,18);
  controls.update();
});

document.getElementById("zoomIn").addEventListener("click",()=>{
  camera.position.multiplyScalar(0.9);
});

document.getElementById("zoomOut").addEventListener("click",()=>{
  camera.position.multiplyScalar(1.1);
});

document.getElementById("resetView").addEventListener("click",()=>{
  isolatedMode = false;

  loadedLetters.forEach(letter=>{
    letter.object.visible = true;
  });

  controls.target.set(0,1.8,0);
  camera.position.set(0,4.4,18);
  controls.update();
});

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

renderer.domElement.addEventListener("click",event=>{
  const rect = renderer.domElement.getBoundingClientRect();

  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer,camera);

  const intersects = raycaster.intersectObjects(memorialGroup.children,true);

  if(!intersects.length) return;

  const hit = intersects[0].object;

  if(hit.userData.isFrame){
    openModal(hit.userData.memory);
  }
});

function openModal(memory){
  const modal = document.getElementById("memoryModal");
  const modalMedia = document.getElementById("modalMedia");
  const modalFiles = document.getElementById("modalFiles");

  modal.classList.add("active");
  modalMedia.innerHTML = "";
  modalFiles.innerHTML = "";

  document.getElementById("modalTitle").textContent = memory.name;
  document.getElementById("modalMeta").textContent = `${memory.type} · Aporte: ${memory.relation}`;
  document.getElementById("modalMessage").textContent = memory.message;

  const preview = memory.files[0];

  if(preview && preview.type === "image"){
    const img = document.createElement("img");
    img.src = preview.url;
    modalMedia.appendChild(img);
  }

  memory.files.forEach(file=>{
    const li = document.createElement("li");
    li.textContent = file.name;
    modalFiles.appendChild(li);
  });
}

document.getElementById("closeModal").addEventListener("click",()=>{
  document.getElementById("memoryModal").classList.remove("active");
});

document.getElementById("memoryModal").addEventListener("click",event=>{
  if(event.target.id === "memoryModal"){
    document.getElementById("memoryModal").classList.remove("active");
  }
});

function animate(){
  requestAnimationFrame(animate);

  controls.update();

  if(isolatedMode && selectedLetter){
    selectedLetter.object.rotation.y += 0.003;
  }

  renderer.render(scene,camera);
}

animate();

window.addEventListener("resize",()=>{
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});