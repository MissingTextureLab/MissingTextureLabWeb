// about.js — igual que antes pero con contraste y fondo oscuro
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function initAbout3D() {
  const canvas = document.getElementById("about-canvas");
  if (!canvas) return;
  const container = canvas.parentElement;

  // === ESCENA Y CÁMARA ===
  const scene = new THREE.Scene();

  // Fondo oscuro semitransparente para ganar contraste
  const backgroundColor = new THREE.Color(0x0b0b0b);
  scene.background = backgroundColor;

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.offsetWidth, container.offsetHeight); // 🔹 igual que under_construction.js
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.inset = 0; // 🔹 garantiza que cubre todo el contenedor
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  container.appendChild(renderer.domElement);

  // === ILUMINACIÓN ===
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(3, 3, 5);
  const rimLight = new THREE.PointLight(0x99ccff, 1.2, 25);
  rimLight.position.set(-3, -2, 4);
  scene.add(ambient, keyLight, rimLight);

  // === MODELOS ===
  const loader = new GLTFLoader();
  const paths = [
    './models/about/piano.glb',
    './models/about/computer.glb',
    './models/about/pencils.glb',
    './models/about/metronome.glb'
  ];

  const objs = [];
  let active = 0;
  const backgroundClones = [];

  function scaleToFit(model) {
    const fov = camera.fov * (Math.PI / 180);
    const dist = Math.abs(camera.position.z);
    const height = 2 * Math.tan(fov / 2) * dist;
    const scaleFactor = height / 2.5;
    model.scale.setScalar(scaleFactor);
  }

  // === Cargar modelos ===
  paths.forEach((p, i) => {
    loader.load(
      p,
      gltf => {
        const model = gltf.scene;
        model.visible = (i === 0);
        scaleToFit(model);
        model.traverse(c => {
          if (c.isMesh) {
            // ⚙️ Materiales más metálicos y luminosos
            c.material.metalness = 1.0;
            c.material.roughness = 0.2;
            c.material.color = new THREE.Color().setHSL(0.55 + Math.random() * 0.1, 0.8, 0.6);
            c.material.envMapIntensity = 1.5;
          }
        });
        scene.add(model);
        objs[i] = model;
        if (i === 0) createBackgroundClones(model);
      },
      undefined,
      e => console.warn(`Error cargando ${p}`, e)
    );
  });

  // === Crear copias de fondo ===
  function createBackgroundClones(model) {
    clearBackgroundClones();
    const count = 25;
    for (let i = 0; i < count; i++) {
      const clone = model.clone(true);
      clone.traverse(c => {
        if (c.isMesh) {
          c.material = c.material.clone();
          c.material.transparent = true;
          c.material.opacity = 0.25; // 🔆 más visibles
          c.material.metalness = 0.8;
          c.material.roughness = 0.3;
        }
      });
      const scale = 0.2 + Math.random() * 0.4;
      clone.scale.multiplyScalar(scale);
      clone.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * -15
      );
      clone.rotation.y = Math.random() * Math.PI;
      clone.rotation.x = Math.random() * Math.PI * 0.2;
      scene.add(clone);
      backgroundClones.push({
        mesh: clone,
        drift: new THREE.Vector3(
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.001
        )
      });
    }
  }

  function clearBackgroundClones() {
    backgroundClones.forEach(c => scene.remove(c.mesh));
    backgroundClones.length = 0;
  }

  // === INTERACCIÓN RATÓN ===
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  container.addEventListener("mousemove", e => {
    const r = container.getBoundingClientRect();
    mouseX = (e.clientX - r.width / 2) / (r.width / 2);
    mouseY = (e.clientY - r.height / 2) / (r.height / 2);
  });

  container.addEventListener("click", () => {
    if (!objs.length) return;
    objs[active].visible = false;
    active = (active + 1) % objs.length;
    objs[active].visible = true;
    createBackgroundClones(objs[active]);
  });

  // === HYDRA OVERLAY ===
  const hydraCanvas = document.createElement("canvas");
  Object.assign(hydraCanvas.style, {
    position: "absolute", inset: 0,
    pointerEvents: "none", width: "100%", height: "100%"
  });
  container.appendChild(hydraCanvas);

  const hydra = new Hydra({
    canvas: hydraCanvas,
    detectAudio: false,
    makeGlobal: true
  });

  s0.init({ src: renderer.domElement });
  src(s0)
    .contrast(1.3) // 💪 más contraste
    .saturate(1.2)
    .colorama(() => 0.4 + Math.abs(targetY) * 0.3)
    .blend(o0, 0.4)
    .out(o0);

  // === ANIMACIÓN ===
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.01;
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    const obj = objs[active];
    if (obj) {
      obj.rotation.y += 0.012;
      obj.rotation.x = Math.sin(t * 0.4) * 0.1 + targetY * 0.15;
    }

    camera.position.x += (targetX * 1.2 - camera.position.x) * 0.05;
    camera.position.y += (-targetY * 0.3 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    backgroundClones.forEach(c => {
      c.mesh.position.add(c.drift);
      c.mesh.rotation.y += 0.002;
    });

    renderer.render(scene, camera);
    render(o0);
  }
  animate();

  // === RESPONSIVE ===
  function resize() {
    const w = container.offsetWidth;
    const h = container.offsetHeight;

    // 🔹 Ajuste real del renderer
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = `${w}px`;
    renderer.domElement.style.height = `${h}px`;

    // 🔹 Ajuste cámara
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    // 🔹 Ajuste Hydra overlay
    hydra.setResolution(w, h);

    // 🔹 Reescalar objetos
    objs.forEach(o => o && scaleToFit(o));
  }
  window.addEventListener('resize', resize);
  resize();
  // === PANEL DESPLEGABLE FIJO CON EMOJI ===
  const aboutText = document.getElementById("about-text");
  if (aboutText) {
    // 🔹 Crear botón fuera del panel (en el contenedor)
    const toggleBtn = document.createElement("button");
    toggleBtn.id = "about-toggle";
    toggleBtn.textContent = "💬"; // emoji inicial
    container.appendChild(toggleBtn);

    // 🔹 Estilos básicos
    Object.assign(toggleBtn.style, {
      position: "absolute",
      top: "12px",
      left: "12px",
      zIndex: 50,
      background: "rgba(0,0,0,0.4)",
      color: "white",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: "8px",
      width: "36px",
      height: "36px",
      cursor: "pointer",
      fontSize: "1.2rem",
      lineHeight: "1.2",
      backdropFilter: "blur(4px)",
      transition: "all 0.3s ease",
    });

    toggleBtn.addEventListener("mouseenter", () => {
      toggleBtn.style.background = "rgba(255,255,255,0.1)";
    });
    toggleBtn.addEventListener("mouseleave", () => {
      toggleBtn.style.background = "rgba(0,0,0,0.4)";
    });

    // 🔹 Estado y comportamiento
    let isCollapsed = false;

    toggleBtn.addEventListener("click", () => {
      isCollapsed = !isCollapsed;

      if (isCollapsed) {
        aboutText.style.transform = "translateX(-100%)";
        aboutText.style.opacity = "0";
        toggleBtn.textContent = "📄"; // emoji cuando el panel está oculto
        toggleBtn.style.left = "12px";
        toggleBtn.style.background = "rgba(0,0,0,0.7)";
      } else {
        aboutText.style.transform = "translateX(0)";
        aboutText.style.opacity = "1";
        toggleBtn.textContent = "💬"; // emoji cuando está desplegado
        toggleBtn.style.background = "rgba(0,0,0,0.4)";
      }
    });

    // 🔹 Transiciones suaves
    aboutText.style.transition =
      "transform 0.6s cubic-bezier(.25,.8,.25,1), opacity 0.5s ease";
  }

}
