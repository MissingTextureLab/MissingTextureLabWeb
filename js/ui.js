import * as THREE from 'three';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

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
  document.getElementById('settings')?.addEventListener('click', () => {
    alert('⚙️ Configuración del sistema\n\n• Tema visual\n• Tamaño de iconos\n• Comportamiento del escritorio');
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

  // animación del logo
  logo.classList.remove('animate-in');
  void logo.offsetWidth;
  logo.classList.add('animate-in');

  // iniciar Three.js
  startThreeScreensaver();
}

function exitScreensaver() {
  const s = screensaver();
  if (!s) return;
  s.classList.remove('active', 'booting', 'flash');
}

// === Efecto visual y click ===
function bindScreensaver() {
  const logo = screensaverLogo();
  if (!logo) return;

  // Click → flash y salida
  logo.addEventListener('click', () => {
    const s = screensaver();
    if (!s) return;
    s.classList.add('flash');
    setTimeout(exitScreensaver, 250);
  });

  // Click pop
  logo.addEventListener('click', () => {
    logo.classList.add('clicked');
    setTimeout(() => logo.classList.remove('clicked'), 150);
  });

  // Mostrar screensaver al arrancar
  document.addEventListener('DOMContentLoaded', () => {
    enterScreensaver(true);
  });
}

// ============================
// 🌌 Fondo 3D del screensaver con shader corporativo
// ============================
function startThreeScreensaver() {
  if (window.saver3D) return;
  const canvas = document.getElementById("three-bg");
  if (!canvas) return console.warn("⚠️ No se encontró el canvas three-bg");

  // === Setup básico ===
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 7);

  scene.add(new THREE.AmbientLight(0xffffff, 0.15));
  const light = new THREE.PointLight(0xffffff, 1.5);
  light.position.set(5, 5, 5);
  scene.add(light);

  // === Parámetros ===
  const LINE_COUNT = 1200;
  const POINTS_PER_LINE = 80;
  const noise = new SimplexNoise();
  const lines = new THREE.Group();
  scene.add(lines);

  // === Crear muchas líneas ===
  for (let i = 0; i < LINE_COUNT; i++) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(POINTS_PER_LINE * 3);

    // Línea inicial
    let x = (Math.random() - 0.5) * 10;
    let y = (Math.random() - 0.5) * 10;
    let z = (Math.random() - 0.5) * 10;

    for (let j = 0; j < POINTS_PER_LINE; j++) {
      const idx = j * 3;
      positions[idx] = x;
      positions[idx + 1] = y;
      positions[idx + 2] = z;

      // movimiento fluido tipo flujo de ruido
      const v = new THREE.Vector3(
        noise.noise(x * 0.1, y * 0.1, z * 0.1),
        noise.noise(y * 0.1 + 10, z * 0.1 + 10, x * 0.1 + 10),
        noise.noise(z * 0.1 + 20, x * 0.1 + 20, y * 0.1 + 20)
      ).multiplyScalar(0.2);

      x += v.x;
      y += v.y;
      z += v.z;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(`hsl(${(Math.random() * 60 + 220) | 0}, 60%, 65%)`),
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });

    const line = new THREE.Line(geometry, mat);
    lines.add(line);
  }

  // === Animación ===
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.003;

    lines.rotation.x = Math.sin(t * 0.5) * 0.1;
    lines.rotation.y += 0.001;

    lines.children.forEach((line, i) => {
      const pos = line.geometry.attributes.position.array;
      for (let j = 0; j < pos.length; j += 3) {
        const nx = pos[j] * 0.03 + t + i * 0.01;
        const ny = pos[j + 1] * 0.03 + i * 0.01;
        const nz = pos[j + 2] * 0.03 + t * 0.5;
        pos[j] += noise.noise(nx, ny, nz) * 0.002;
        pos[j + 1] += noise.noise(ny, nz, nx) * 0.002;
        pos[j + 2] += noise.noise(nz, nx, ny) * 0.002;
      }
      line.geometry.attributes.position.needsUpdate = true;
    });

    renderer.render(scene, camera);
    render(o0);
  }

  // === Hydra overlay (tranquilo) ===
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
  let mx = 0, my = 0;
  window.addEventListener("mousemove", e => {
    mx = e.clientX / window.innerWidth;
    my = e.clientY / window.innerHeight;
  });

  s0.init({ src: renderer.domElement });
  src(s0)
    .colorama(() => 0.05 + mx * 0.15)
    .luma(0.2)
    .saturate(1.2)
    .blend(o0, 0.4)
    .out(o0);

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
// === Interacciones suaves ===
let intensity = 0;
window.addEventListener("click", (e) => {
  // mini flash radial en la posición del click
  const ripple = new THREE.Mesh(
    new THREE.RingGeometry(0.01, 0.02, 64),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4
    })
  );
  ripple.position.set(0, 0, -3);
  scene.add(ripple);

  gsap.to(ripple.scale, {
    x: 20, y: 20, z: 20,
    duration: 1.2,
    ease: "power2.out",
    onComplete: () => scene.remove(ripple)
  });
  gsap.to(ripple.material, { opacity: 0, duration: 1.2, ease: "power1.inOut" });

  // leve aumento de colorama (Hydra) momentáneo
  intensity = 0.25;
});

// === Sincroniza intensidad con Hydra ===
src(s0)
  .colorama(() => 0.05 + mx * 0.15 + intensity)
  .luma(0.2)
  .saturate(1.2)
  .blend(o0, 0.4)
  .out(o0);

// decaimiento gradual de intensidad
function animate() {
  requestAnimationFrame(animate);
  t += 0.003;

  intensity *= 0.95; // 🔹 cada frame, se apaga un poco
  lines.rotation.y += 0.001;

  renderer.render(scene, camera);
  render(o0);
}
  animate();
  
  console.log("✅ Flowfield lines + hydra colorama suave activo");
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
