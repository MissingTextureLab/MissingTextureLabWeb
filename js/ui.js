import * as THREE from 'three';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';

import { arrangeIcons, getSelectedFolder } from './desktop.js';
import { openProperties } from './windows.js';

// ==== Selectores rápidos ====
const menu = () => document.getElementById('desktop-menu');
const startBtn = () => document.querySelector('.start-btn');
const startMenu = () => document.getElementById('start-menu');
const clockEl = () => document.getElementById('clock');
const screensaver = () => document.getElementById('screensaver');
const screensaverLogo = () => document.getElementById('screensaver-logo');

// ============================
// 🖱️ MENÚ CONTEXTUAL
// ============================
function showContextMenu(html, x, y) {
  const el = menu();
  if (!el) return;
  el.innerHTML = html;
  el.style.display = 'block';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
}
function hideContextMenu() {
  const el = menu();
  if (el) el.style.display = 'none';
}
function bindContextMenu() {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const icon = e.target.closest('.icon');
    if (icon) {
      const name = icon.dataset.name;
      showContextMenu(`
        <div class="context-menu-item" id="open-properties">🔍 Properties of ${name}</div>
        <div class="context-menu-item" id="arrange-icons">🧩 Arrange Icons</div>
      `, e.clientX, e.clientY);
      document.getElementById('open-properties')?.addEventListener('click', () => {
        const sel = getSelectedFolder?.();
        if (sel) openProperties(sel);
        hideContextMenu();
      });
    } else {
      showContextMenu(`
        <div class="context-menu-item" id="arrange-icons">🧩 Arrange Icons</div>
      `, e.clientX, e.clientY);
    }
  });
  document.addEventListener('click', hideContextMenu);
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'arrange-icons') {
      arrangeIcons?.();
      hideContextMenu();
    }
  });
}

// ============================
// 🪟 START MENU
// ============================
function bindStartMenu() {
  const btn = startBtn();
  const sm = startMenu();
  if (!btn || !sm) return;
  btn.addEventListener('click', () => {
    sm.style.display = (sm.style.display === 'flex') ? 'none' : 'flex';
  });
  document.getElementById('Repo de la Web!')?.addEventListener('click', () => {
    window.open('https://github.com/MissingTextureLab/MissingTextureLabWeb', '_blank');
    sm.style.display = 'none';
  });
  document.getElementById('shutdown')?.addEventListener('click', () => {
    enterScreensaver(true);
    sm.style.display = 'none';
  });
}

// ============================
// ⏰ RELOJ
// ============================
function updateClock() {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12; h = h ? h : 12;
  const el = clockEl();
  if (el) el.textContent = `${h}:${m} ${ampm}`;
}
function initClock() {
  updateClock();
  setInterval(updateClock, 60000);
}

// ============================
// 💤 SCREENSAVER
// ============================
function enterScreensaver(isBoot = false) {
  document.querySelectorAll('.window').forEach(w => w.remove());
  const tb = document.getElementById('taskbar');
  if (tb) tb.innerHTML = '';

  const s = screensaver();
  const logo = screensaverLogo();
  if (!s || !logo) return;

  s.classList.add('active');
  if (isBoot) s.classList.add('booting');

  logo.classList.remove('animate-in');
  void logo.offsetWidth;
  logo.classList.add('animate-in');

  startThreeScreensaver();
}

function exitScreensaver() {
  const s = screensaver();
  if (!s) return;
  s.classList.remove('active', 'booting', 'flash');
}

function bindScreensaver() {
  const logo = screensaverLogo();
  if (!logo) return;

  logo.addEventListener('click', () => {
    const s = screensaver();
    if (!s) return;
    s.classList.add('flash');
    setTimeout(exitScreensaver, 250);
  });

  logo.addEventListener('click', () => {
    logo.classList.add('clicked');
    setTimeout(() => logo.classList.remove('clicked'), 150);
  });

  document.addEventListener('DOMContentLoaded', () => enterScreensaver(true));
}

// ============================
// 🌌 Fondo 3D del screensaver
// ============================
function startThreeScreensaver() {
  if (window.saver3D) return;
  const canvas = document.getElementById("three-bg");
  if (!canvas) return console.warn("⚠️ No se encontró el canvas three-bg");

  const DPR = window.devicePixelRatio || 1;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(DPR);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 7);

  scene.add(new THREE.AmbientLight(0xffffff, 0.15));
  const light = new THREE.PointLight(0xffffff, 1.5);
  light.position.set(5, 5, 5);
  scene.add(light);

  const LINE_COUNT = 1200;
  const POINTS_PER_LINE = 80;
  const noise = new SimplexNoise();
  const lines = new THREE.Group();
  scene.add(lines);

  // ✨ BLOOM setup — estable (sin animaciones)
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.6,   // intensidad fija del brillo
    0.25,  // radio de difusión
    0.0    // umbral (todo contribuye)
  );
  composer.addPass(bloomPass);

  window.addEventListener("resize", () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });

  function makeFlowLines(seed = 0) {
    while (lines.children.length) lines.remove(lines.children[0]);
    for (let i = 0; i < LINE_COUNT; i++) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(POINTS_PER_LINE * 3);
      let x = (Math.random() - 0.5) * 10;
      let y = (Math.random() - 0.5) * 10;
      let z = (Math.random() - 0.5) * 10;
      for (let j = 0; j < POINTS_PER_LINE; j++) {
        const idx = j * 3;
        positions[idx] = x;
        positions[idx + 1] = y;
        positions[idx + 2] = z;
        const v = new THREE.Vector3(
          noise.noise3d(x * 0.1 + seed, y * 0.1 + seed, z * 0.1 + seed),
          noise.noise3d(y * 0.1 + 10 + seed, z * 0.1 + 10 + seed, x * 0.1 + 10 + seed),
          noise.noise3d(z * 0.1 + 20 + seed, x * 0.1 + 20 + seed, y * 0.1 + 20 + seed)
        ).multiplyScalar(0.2);
        x += v.x; y += v.y; z += v.z;
      }
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(`hsl(${(Math.random() * 60 + 220) | 0}, 60%, 65%)`),
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
      });
      lines.add(new THREE.Line(geometry, mat));
    }
  }

  makeFlowLines();

  window.addEventListener("click", (e) => {
    const logo = document.getElementById("screensaver-logo");
    if (logo && logo.contains(e.target)) return;
    makeFlowLines(Math.random() * 1000);
  });

  // === Hydra (igual que antes) ===
  if (window.Hydra) {
    const hydraCanvas = document.createElement("canvas");
    Object.assign(hydraCanvas.style, {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      mixBlendMode: "screen"
    });
    canvas.parentElement.appendChild(hydraCanvas);

    const hydra = new Hydra({ canvas: hydraCanvas, detectAudio: false, makeGlobal: true });

    const syncHydraResolution = () => {
      const rect = renderer.domElement.getBoundingClientRect();
      const w = Math.floor(rect.width * DPR);
      const h = Math.floor(rect.height * DPR);
      renderer.setSize(rect.width, rect.height, false);
      hydraCanvas.width = w;
      hydraCanvas.height = h;
      requestAnimationFrame(() => hydra.setResolution(w, h));
    };
    syncHydraResolution();
    window.addEventListener("resize", syncHydraResolution);
    setTimeout(syncHydraResolution, 250);

    let mouseX = 0.5;
    let mouseY = 0.5;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX / window.innerWidth;
      mouseY = e.clientY / window.innerHeight;
    });

    if (window.s0 && window.src && window.out && window.render) {
      s0.init({ src: renderer.domElement });

      src(o0)
        .blend(src(s0).scrollX(() => (mouseX - 0.5) * 0.01)
                      .scrollY(() => (mouseY - 0.5) * 0.01), 0.12)
        .colorama(() => 0.02 + mouseX * 0.4)
        .contrast(1.03)
        .brightness(0.015)
        .out(o0);
    }
  }

  // 🧠 ANIMACIÓN — sin bloom dinámico
  function animate() {
    requestAnimationFrame(animate);
    lines.rotation.y += 0.001;
    lines.children.forEach((line, i) => {
      const pos = line.geometry.attributes.position.array;
      for (let j = 0; j < pos.length; j += 3) {
        const nx = pos[j] * 0.03 + i * 0.01;
        const ny = pos[j + 1] * 0.03 + i * 0.01;
        const nz = pos[j + 2] * 0.03;
        pos[j] += noise.noise3d(nx, ny, nz) * 0.002;
        pos[j + 1] += noise.noise3d(ny, nz, nx) * 0.002;
        pos[j + 2] += noise.noise3d(nz, nx, ny) * 0.002;
      }
      line.geometry.attributes.position.needsUpdate = true;
    });

    // 💡 Bloom fijo
    bloomPass.strength = 0.6;

    composer.render(scene, camera);
    if (window.render) render(o0);
  }

  animate();

  console.log("✅ Flowfield + Hydra + Bloom fijo sin animaciones");
}


window.startThreeScreensaver = startThreeScreensaver;

// ============================
// 🚀 Inicialización global
// ============================
export function initUI() {
  bindContextMenu();
  bindStartMenu();
  initClock();
  bindScreensaver();
}
