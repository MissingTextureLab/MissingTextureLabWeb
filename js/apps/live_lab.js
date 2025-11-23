// CORE
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// MATH / NOISE
import { SimplexNoise } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/math/SimplexNoise.js";

// POSTPROCESSING
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js";

// TEXT / LOADERS
import { FontLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/geometries/TextGeometry.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";
import { OBJExporter } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/exporters/OBJExporter.js";

import { bringToFront, addToTaskbar } from "../windows.js";

let hydra;
let portfolioCodes = [];

let strudelEmbedLoaded = false;
let threeRenderer = null;
let threeResizeHandler = null;

// 🔥 NUEVO SISTEMA DE FILTROS Y ORDEN
let filteredCodes = [];
let currentFilter = "all";
let currentSort = "az";
let firstLoad = true;
// ==========================================================
// 📏 Fix viewport en móviles
// ==========================================================
function setRealVh() {
  document.documentElement.style.setProperty("--real-vh", `${window.innerHeight}px`);
}
window.addEventListener("resize", setRealVh);
window.addEventListener("orientationchange", setRealVh);
setRealVh();

// ==========================================================
// 🔧 Utilidades generales
// ==========================================================
function toggleVisible(el, show) {
  if (!el) return;
  el.style.opacity = show ? "1" : "0";
  el.style.visibility = show ? "visible" : "hidden";
  el.style.pointerEvents = show ? "auto" : "none";
}

const lazyLoadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });

// ==========================================================
// 🎨 Asegurar Hydra
// ==========================================================
async function ensureHydra() {
  if (!window.Hydra)
    await lazyLoadScript("https://unpkg.com/hydra-synth@1.3.29/dist/hydra-synth.js");
}

// ==========================================================
// 🧩 Asegurar Three
// ==========================================================
async function ensureThree() {
  if (window.THREE) return;
  window.THREE = THREE;
  window.OrbitControls = OrbitControls;
  window.SimplexNoise = SimplexNoise;
  window.EffectComposer = EffectComposer;
  window.RenderPass = RenderPass;
  window.UnrealBloomPass = UnrealBloomPass;
  window.FontLoader = FontLoader;
  window.TextGeometry = TextGeometry;
  window.ShaderPass = ShaderPass;
  window.GLTFLoader = GLTFLoader;
  window.OBJExporter = OBJExporter;
}

// ==========================================================
// 🧹 Limpieza Three
// ==========================================================
function cleanupThreeOverlay() {
  const overlay = window._threeCanvas;
  if (overlay) {
    try { overlay.remove(); } catch {}
  }
  window._threeCanvas = null;

  if (window._threeAnimationId) {
    cancelAnimationFrame(window._threeAnimationId);
    window._threeAnimationId = null;
  }
}

function cleanupThreeCore() {
  const cont = document.getElementById("three-container");
  const canvas = document.getElementById("three-canvas");

  if (threeResizeHandler) {
    window.removeEventListener("resize", threeResizeHandler);
    threeResizeHandler = null;
  }

  if (threeRenderer) {
    try { threeRenderer.dispose?.(); } catch {}
    threeRenderer = null;
  }

  if (canvas) {
    const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
    if (gl) gl.clear(gl.COLOR_BUFFER_BIT);
  }

  if (cont) {
    cont.style.opacity = "0";
    cont.style.visibility = "hidden";
  }
}

// ==========================================================
// 🧹 Limpieza Strudel
// ==========================================================
async function cleanupStrudel() {
  try {
    if (window.Tone?.Transport?.state !== "stopped") {
      await window.Tone.Transport.stop();
    }
    if (window.Tone?.context && window.Tone.context.state !== "closed") {
      await window.Tone.context.close();
    }
  } catch {}

  const mask = document.getElementById("strudel-mask");
  if (mask) mask.innerHTML = "";
}

// ==========================================================
// 💾 Sanitizar código
// ==========================================================
function sanitizePatchCode(raw) {
  if (!raw) return "";
  return raw
    .replace(/^export\s+default\s*`/, "")
    .replace(/`;\s*$/, "")
    .replace(/`\s*$/, "")
    .trim();
}

async function getPatchCode(item) {
  if (item.code) return sanitizePatchCode(item.code);

  if (item.path) {
    try {
      const res = await fetch(item.path);
      if (!res.ok) throw new Error("Patch no accesible");
      return sanitizePatchCode(await res.text());
    } catch (err) {
      console.warn("⚠ Error cargando patch:", err);
    }
  }
  return "";
}

// ==========================================================
// 🎴 Cargar JSON
// ==========================================================
async function loadPortfolioCodes() {
  try {
    const res = await fetch("./data/live-lab.json");
    portfolioCodes = await res.json();
    populateCards();

    if (portfolioCodes.length > 0) {
      await handleCardClick(portfolioCodes[0]);
    }
  } catch (err) {
    console.error("❌ No se pudo cargar JSON:", err);
  }
}

// ==========================================================
// 🧠 Lógica de selección de tarjeta
// ==========================================================
async function handleCardClick(item) {
  await cleanupStrudel();
  cleanupThreeOverlay();
  cleanupThreeCore();

  const hydraContainer = document.getElementById("hydra-container");
  const strudelWrapper = document.getElementById("strudel-wrapper");
  const threeContainer = document.getElementById("three-container");
  const p5Container = document.getElementById("p5-container");

  toggleVisible(strudelWrapper, false);
  toggleVisible(hydraContainer, false);
  toggleVisible(threeContainer, false);
  toggleVisible(p5Container, false);

  // === STRUDEL ===
  if (item.type === "strudel") {
    toggleVisible(strudelWrapper, true);

    const mask = document.getElementById("strudel-mask");
    if (mask) mask.innerHTML = "";

    if (!strudelEmbedLoaded) {
      await lazyLoadScript("https://unpkg.com/@strudel/embed@latest");
      strudelEmbedLoaded = true;
    }

    const code = await getPatchCode(item);
    const repl = document.createElement("strudel-repl");
    repl.setAttribute("code", code);
    repl.style = "width:100%; height:100%; background:black;";
    mask.appendChild(repl);
    return;
  }

  // === HYDRA ===
  if (item.type === "hydra" || item.type === "hydra-three") {
    toggleVisible(hydraContainer, true);

    const code = await getPatchCode(item);
    document.getElementById("hydra-code").value = code;

    requestAnimationFrame(() => runHydraCode());
    return;
  }

  // === P5 — IFRAME ===
  if (item.type === "p5") {
    toggleVisible(p5Container, true);

    const zone = document.getElementById("p5-canvas-zone");
    const url = item.path?.trim();

    if (!url) {
      zone.innerHTML = `
        <div style="
          display:flex; align-items:center; justify-content:center;
          width:100%; height:100%; background:#111; color:#ccc;">
          ❌ No hay 'path' definido para este sketch p5.js
        </div>`;
      return;
    }

    zone.innerHTML = `
    <iframe
      src="${url}"
      style="width:100%; height:100%; border:none;"

      allow="
        camera; 
        microphone; 
        fullscreen; 
        geolocation; 
        display-capture; 
        clipboard-read; 
        clipboard-write; 
        autoplay; 
        encrypted-media; 
        xr-spatial-tracking; 
        midi;
      "

      sandbox="
        allow-scripts 
        allow-same-origin 
        allow-forms 
        allow-downloads 
        allow-pointer-lock 
        allow-presentation 
        allow-modals 
        allow-popups
      "

      allowfullscreen
    ></iframe>
  `;
    return;
  }

// (PARTE 2 CONTINÚA…)
  // === THREE ===
  if (item.type === "three") {
    cleanupThreeCore();

    toggleVisible(threeContainer, true);

    const oldCanvas = document.getElementById("three-canvas");
    const newCanvas = oldCanvas.cloneNode(true);
    oldCanvas.parentNode.replaceChild(newCanvas, oldCanvas);

    const canvas = newCanvas;

    await ensureThree();
    const code = await getPatchCode(item);

    threeRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    threeRenderer.setPixelRatio(window.devicePixelRatio);

    const resize = () => {
      const w = threeContainer.clientWidth;
      const h = threeContainer.clientHeight;
      if (w && h) threeRenderer.setSize(w, h, false);
    };

    threeResizeHandler = resize;
    resize();
    window.addEventListener("resize", resize);

    try {
      new Function("THREE", "renderer", "canvas", code)(THREE, threeRenderer, canvas);
    } catch (e) {
      console.error("❌ Error Three:", e);
    }

    return;
  }

  console.warn("⚠ Tipo de tarjeta desconocido:", item.type);
}

// ==========================================================
// Tarjetas + FILTRO + ORDEN
// ==========================================================
function populateCards() {
  // 1️⃣ Filtro
  filteredCodes = portfolioCodes.filter((item) => {
    switch (currentFilter) {
      case "strudel":
        return item.type === "strudel";
      case "p5":
        return item.type === "p5";
      case "hydra":
        return item.type === "hydra" || item.type === "hydra-three";
      case "three":
        return item.type === "three";
      case "usesHydra":
        return item.usesHydra === true;
      case "usesThree":
        return item.usesThree === true;
      default:
        return true; // all
    }
  });

  // 2️⃣ Orden (excepto en el primer load)
  if (!firstLoad) {
    filteredCodes.sort((a, b) => {
      if (currentSort === "az") return a.title.localeCompare(b.title);
      if (currentSort === "za") return b.title.localeCompare(a.title);
      if (currentSort === "type") {
        const typePriority = {
          three: 1,
          strudel: 2,
          hydra: 3,
          "hydra-three": 4,
          p5: 5
        };
        return (typePriority[a.type] ?? 999) - (typePriority[b.type] ?? 999);
      }
      return 0;
    });
  }

  const container = document.getElementById("lab-cards");
  if (!container) return;
  container.innerHTML = "";

  filteredCodes.forEach((item) => {
    const card = document.createElement("div");
    card.className = "lab-card";

    // etiquetas base
    let tagsHTML = `<small class="tag ${item.type}">${item.type.toUpperCase()}</small>`;

    // THREE extra
    if (item.usesThree || item.type === "hydra-three") {
      tagsHTML += `<small class="tag three">THREE</small>`;
    }

    // HYDRA extra
    if (item.usesHydra && item.type !== "hydra" && item.type !== "hydra-three") {
      tagsHTML += `<small class="tag hydra">HYDRA</small>`;
    }

    // thumb opcional
    const thumb = item.thumb
      ? `<img class="lab-thumb" src="${item.thumb}" alt="${item.title}" />`
      : "";

    card.innerHTML = `
      ${thumb}
      <span class="lab-title">${item.title}</span>
      <div class="lab-tags">
        ${tagsHTML}
      </div>
    `;

    card.onclick = () => handleCardClick(item);
    container.appendChild(card);
  });

  firstLoad = false;
}

// ==========================================================
// HYDRA ENGINE
// ==========================================================
async function runHydraCode() {
  const container = document.getElementById("hydra-container");
  const canvas = document.getElementById("hydra-canvas");
  if (!container || !canvas) return;

  const code = document.getElementById("hydra-code").value.trim();

  const rect = container.getBoundingClientRect();
  canvas.width = rect.width || window.innerWidth;
  canvas.height = rect.height || window.innerHeight;

  if (hydra) {
    try {
      hydra.synth.stop();
    } catch {}
    hydra = null;
  }

  try {
    hydra = new window.Hydra({
      canvas,
      detectAudio: false,
      makeGlobal: true,
    });

    hydra.setResolution(canvas.width, canvas.height);

    requestAnimationFrame(() => {
      try {
        if (code.length > 5) {
          new Function(code)();
        } else {
          osc(10, 0.1, 1.2).kaleid(3).out();
        }
      } catch (err) {
        console.error("Hydra error:", err);
      }
    });
  } catch (err) {
    console.error("❌ Error Hydra:", err);
  }
}

// ==========================================================
// Ventanas
// ==========================================================
function setupWindowControls(win, isMobile) {
  const header = win.querySelector(".lab-header");
  let maximized = false;
  let prevRect = null;

  if (isMobile) {
    header.querySelector(".close-btn")?.addEventListener("click", () => win.remove());
    return;
  }

  // drag ventana
  header.addEventListener("mousedown", (e) => {
    if (e.target.closest(".lab-buttons")) return;
    e.preventDefault();
    bringToFront(win);

    const rect = win.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    function onMove(ev) {
      win.style.left = ev.clientX - offsetX + "px";
      win.style.top = ev.clientY - offsetY + "px";
    }

    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  // minimizar
  header.querySelector(".min-btn").onclick = () => (win.style.display = "none");

  // maximizar / restaurar
  header.querySelector(".max-btn").onclick = () => {
    if (!maximized) {
      prevRect = {
        left: win.style.left,
        top: win.style.top,
        width: win.style.width,
        height: win.style.height,
      };
      Object.assign(win.style, {
        left: "0px",
        top: "0px",
        width: window.innerWidth + "px",
        height: window.innerHeight - 40 + "px",
      });
      maximized = true;
    } else {
      Object.assign(win.style, prevRect);
      maximized = false;
    }
  };

  // cerrar
  header.querySelector(".close-btn").onclick = async () => {
    await cleanupStrudel();
    cleanupThreeOverlay();
    cleanupThreeCore();

    if (hydra) {
      try {
        hydra.synth.stop();
      } catch {}
      hydra = null;
    }

    document.querySelector('.task-btn[data-task="live-lab"]')?.remove();
    win.remove();
  };
}

function setupPanelToggle() {
  const panel = document.getElementById("lab-left");
  const toggle = document.getElementById("lab-folder-toggle");
  if (!panel || !toggle) return;

  toggle.addEventListener("click", () => {
    const isOpen = panel.classList.toggle("open");
    toggle.classList.toggle("active", isOpen);
    toggle.textContent = isOpen ? "📁" : "📂";
  });
}

// ==========================================================
// UI PRINCIPAL (con filtros encima de las tarjetas)
// ==========================================================


async function createUI() {
  const win = document.createElement("div");
  win.id = "live-lab";
  win.className = "window window-live-lab simple";
  win.dataset.task = "live-lab";

  const isMobile = window.matchMedia("(max-width: 800px)").matches;

  win.innerHTML = `
    <div class="lab-header window-header">
      <span>🎛️ Live Lab</span>
      <div class="lab-buttons window-buttons">
        <button class="min-btn">_</button>
        <button class="max-btn">□</button>
        <button class="close-btn">✕</button>
      </div>
    </div>
    <div class="lab-body">
      <div class="lab-left open" id="lab-left">

        <!-- 🔥 FILTROS Y ORDEN -->
        <div id="lab-filters">
          <select id="filter-type" class="emoji-select">
            <option value="all">Todos</option>
            <option value="three">Three.js</option>
            <option value="strudel">Strudel</option>
            <option value="hydra">Hydra</option>
            <option value="p5">p5.js</option>
          </select>

          <select id="sort-type">
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
            <option value="type">Por tipo</option>
          </select>
        </div>

        <div class="lab-cards" id="lab-cards"></div>
      </div>

      <div class="lab-main">
        <!-- THREE -->
        <div id="three-container" style="opacity:0;visibility:hidden;">
          <canvas id="three-canvas"></canvas>
        </div>

        <!-- STRUDEL -->
        <div id="strudel-wrapper" class="strudel-zone" style="opacity:0;visibility:hidden;">
          <div id="strudel-mask"></div>
        </div>

        <!-- HYDRA -->
        <div id="hydra-container" style="opacity:0;visibility:hidden;">
          <canvas id="hydra-canvas"></canvas>
          <div id="hydra-editor">
            <textarea id="hydra-code"></textarea>
            <div class="hydra-controls">
              <button id="hydra-run">▶ Run</button>
              <button id="hydra-hide">🌓 Hide Editor</button>
            </div>
          </div>
          <button id="hydra-show" style="display:none;">📝 Editor</button>
        </div>

        <!-- P5 NUEVO (solo iframe) -->
        <div id="p5-container" style="opacity:0;visibility:hidden;">
          <div id="p5-canvas-zone" style="width:100%; height:100%;"></div>
        </div>
      </div>
    </div>

    <button id="lab-folder-toggle">📁</button>
  `;

  document.body.appendChild(win);

  setupWindowControls(win, isMobile);
  setupPanelToggle();

  // Hydra botones
  document.getElementById("hydra-run").onclick = () => runHydraCode();

  const hideBtn = document.getElementById("hydra-hide");
  const editor = document.getElementById("hydra-editor");
  const showBtn = document.getElementById("hydra-show");

  hideBtn.onclick = () => {
    editor.style.display = "none";
    showBtn.style.display = "block";
  };
  showBtn.onclick = () => {
    editor.style.display = "flex";
    showBtn.style.display = "none";
  };

  // 🔥 Eventos de filtros
  const filterSelect = document.getElementById("filter-type");
  const sortSelect = document.getElementById("sort-type");

  if (filterSelect) {
    filterSelect.onchange = (e) => {
      currentFilter = e.target.value;
      populateCards();
    };
  }

  if (sortSelect) {
    sortSelect.onchange = (e) => {
      currentSort = e.target.value;
      populateCards();
    };
  }

  await loadPortfolioCodes();
  if (!isMobile) addToTaskbar("Live Lab", "🎛️");
  bringToFront(win);
}

// ==========================================================
// Export principal
// ==========================================================
export async function openLiveLabWindow() {
  const existing = document.getElementById("live-lab");
  if (existing) {
    existing.style.display = "";
    bringToFront(existing);
    return;
  }

  await ensureHydra();
  await createUI();
  console.log("✅ Live Lab listo (Hydra + Strudel + Three.js + p5 iframe + filtros).");
}

