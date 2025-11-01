// about.js — Ventana “Sobre mí” con texto + fondo 3D reactivo

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// ========= Crear ventana =========
export function openAboutWindow() {
  // Evitar duplicados
  if (document.getElementById("about-window")) return;

  const win = document.createElement("div");
  win.id = "about-window";
  win.className = "window window-about";
  win.innerHTML = `
    <div class="window-header">Sobre mí</div>
    <div class="window-content" id="about-container">
      <canvas id="bg-scene"></canvas>
      <div id="about-text"><pre>
> Andrés Vidal Martín Martín
> artista_educador_tecnólogo / MissingTexture_Lab

Mi práctica se mueve entre la arquitectura virtual,
los sistemas interactivos y los rituales audiovisuales.
Trabajo con el error como lenguaje,
el glitch como identidad y la transparencia como ética.

Cada obra es un sistema y un síntoma:
una negociación entre la mirada humana y el algoritmo.

> current_mode: hybrid
> favorite_error: missing texture
      </pre></div>
    </div>
  `;
  document.body.appendChild(win);

  injectStyles();
  initScene();
}

// ========= Estilos dinámicos =========
function injectStyles() {
  if (document.getElementById("about-style")) return;
  const style = document.createElement("style");
  style.id = "about-style";
  style.textContent = `
  .window-about {
    position: absolute;
    width: 680px;
    height: 460px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: #000;
    border: 1px solid #00ff88;
    display: flex;
    flex-direction: column;
    resize: none;
    overflow: hidden;
    z-index: 2000;
  }

  .window-about .window-header {
    background: #002b1f;
    color: #00ff88;
    font-family: 'Cascadia Code', monospace;
    font-size: 0.9rem;
    padding: 6px 10px;
    cursor: grab;
    user-select: none;
    border-bottom: 1px solid #00ff88;
  }

  #about-container {
    position: relative;
    flex: 1;
    overflow: hidden;
  }

  #bg-scene {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  #about-text {
    position: relative;
    z-index: 1;
    color: #00ff88;
    font-family: 'Cascadia Code', monospace;
    font-size: 0.9rem;
    padding: 1.5rem;
    line-height: 1.5;
    overflow-y: scroll;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
  }

  #about-text::-webkit-scrollbar { width: 4px; }
  #about-text::-webkit-scrollbar-thumb {
    background: #00ff88;
    border-radius: 2px;
  }
  `;
  document.head.appendChild(style);
}

// ========= Fondo 3D reactivo =========
function initScene() {
  const canvas = document.getElementById("bg-scene");
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 3;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const container = document.getElementById("about-container");
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // ---- Partículas ----
  const particles = new THREE.Group();
  const geometry = new THREE.SphereGeometry(0.02, 8, 8);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
  for (let i = 0; i < 200; i++) {
    const p = new THREE.Mesh(geometry, material);
    p.position.set((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
    particles.add(p);
  }
  scene.add(particles);

  // ---- Luces ----
  scene.add(new THREE.AmbientLight(0x00ff88, 0.3));
  const pointLight = new THREE.PointLight(0x00ff88, 1.5);
  pointLight.position.set(2, 2, 3);
  scene.add(pointLight);

  // ---- Scroll reactivo ----
  const textEl = document.getElementById("about-text");
  let scrollY = 0;
  textEl.addEventListener("scroll", () => {
    const maxScroll = textEl.scrollHeight - textEl.clientHeight;
    scrollY = textEl.scrollTop / maxScroll;
  });

  // ---- Animación ----
  function animate() {
    requestAnimationFrame(animate);
    particles.rotation.y += 0.002;
    particles.rotation.x = scrollY * 2 * Math.PI;
    camera.position.z = 3 + scrollY * 1.5;
    renderer.render(scene, camera);
  }
  animate();

  // ---- Resize dinámico ----
  window.addEventListener("resize", () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}
