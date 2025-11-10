// ==========================================================
// 🎛️ live_lab_optimized.js — Hydra + Strudel + Three.js con soporte móvil
// ==========================================================
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { SimplexNoise } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/math/SimplexNoise.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js";

import { bringToFront, addToTaskbar } from "../windows.js";

let hydra;
let portfolioCodes = [];
let strudelEmbedLoaded = false;

// ==========================================================
// 📏 Fix viewport en móviles (Safari, Chrome)
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
// 🎨 Asegurar Hydra cargada
// ==========================================================
async function ensureHydra() {
  if (!window.Hydra)
    await lazyLoadScript("https://unpkg.com/hydra-synth@1.3.29/dist/hydra-synth.js");
  console.log("🎨 Hydra lista.");
}

// ==========================================================
// 🧩 Asegurar Three.js y dependencias
// ==========================================================
async function ensureThree() {
  if (window.THREE) return;
  window.THREE = THREE;
  window.SimplexNoise = SimplexNoise;
  window.EffectComposer = EffectComposer;
  window.RenderPass = RenderPass;
  window.UnrealBloomPass = UnrealBloomPass;
  console.log("✅ Three.js y dependencias globales listas (desde import ESM).");
}

// ==========================================================
// 🧹 Limpieza global para Three.js overlays
// ==========================================================
function cleanupThreeOverlay() {
  const overlay = window._threeCanvas;
  if (overlay) {
    try {
      overlay.remove();
      console.log("🧹 Canvas Three.js eliminado.");
    } catch (e) {
      console.warn("⚠️ No se pudo eliminar el canvas Three:", e);
    }
  }
  window._threeCanvas = null;
  if (window._threeAnimationId) {
    cancelAnimationFrame(window._threeAnimationId);
    window._threeAnimationId = null;
  }
}

// ==========================================================
// ✂️ Limpieza de código export default en patches
// ==========================================================
function sanitizePatchCode(raw) {
  if (!raw) return "";
  return raw
    .replace(/^export\s+default\s*`/, "")
    .replace(/`;\s*$/, "")
    .replace(/`\s*$/, "")
    .replace(/\uFEFF/g, "")
    .replace(/\r/g, "")
    .trim();
}

// ==========================================================
// 💾 Obtener código desde item.code o item.path
// ==========================================================
async function getPatchCode(item) {
  if (item.code) return sanitizePatchCode(item.code);

  if (item.path) {
    try {
      const res = await fetch(item.path);
      if (!res.ok) throw new Error(`Error al cargar patch: ${item.path}`);
      const text = await res.text();
      return sanitizePatchCode(text);
    } catch (err) {
      console.error("⚠️ Error cargando patch externo:", err);
      return "";
    }
  }
  return "";
}

// ==========================================================
// 🎴 Cargar tarjetas desde JSON
// ==========================================================
async function loadPortfolioCodes() {
  try {
    const res = await fetch("./data/live-lab.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`Error al cargar JSON (${res.status})`);

    portfolioCodes = await res.json();
    populateCards();
    console.log("📦 Tarjetas cargadas:", portfolioCodes.length);

    if (portfolioCodes.length > 0) {
      await handleCardClick(portfolioCodes[0]);
      console.log(`🎬 Primer patch cargado automáticamente: ${portfolioCodes[0].title}`);
    }
  } catch (err) {
    console.error("⚠️ No se pudieron cargar las tarjetas:", err);
  }
}

// ==========================================================
// 🧠 Lógica principal de selección de tarjeta
// ==========================================================
async function handleCardClick(item) {
  cleanupThreeOverlay(); // 🔹 Limpia antes de cambiar de patch

  const hydraContainer = document.getElementById("hydra-container");
  const strudelWrapper = document.getElementById("strudel-wrapper");
  const overlay = document.getElementById("audio-unlock");

  if (hydra) {
    try {
      hydra.synth.stop();
      hydra.resizeObserver?.disconnect?.();
      hydra.canvas?.getContext("webgl")?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch (e) {
      console.warn("Hydra stop warning:", e);
    }
    hydra = null;
  }

  if (overlay) overlay.style.display = "none";

  const panel = document.getElementById("lab-left");
  const toggle = document.getElementById("lab-folder-toggle");
  if (document.body.classList.contains("mobile-mode") && panel && toggle) {
    panel.classList.remove("open");
    toggle.classList.remove("active");
    toggle.textContent = "📂";
  }

  // === STRUDEL ===
  if (item.type === "strudel") {
    toggleVisible(hydraContainer, false);
    toggleVisible(strudelWrapper, true);

    const mask = document.getElementById("strudel-mask");
    try {
      if (window.Tone?.Transport?.state !== "stopped") {
        await window.Tone.Transport.stop();
      }
      if (window.Tone?.context) {
        await window.Tone.context.close();
        console.log("🎧 Contexto Tone cerrado.");
      }
    } catch (err) {
      console.warn("⚠️ Error al limpiar Strudel anterior:", err);
    }

    mask.innerHTML = "";
    mask.style.opacity = 0;
    setTimeout(() => (mask.style.opacity = 1), 150);

    if (!strudelEmbedLoaded) {
      await lazyLoadScript("https://unpkg.com/@strudel/embed@latest");
      strudelEmbedLoaded = true;
      console.log("🎶 @strudel/embed cargado.");
    }

    const code = await getPatchCode(item);
    const latinSafe = code
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\x00-\xFF]/g, "");

    const repl = document.createElement("strudel-repl");
    repl.setAttribute("code", latinSafe);
    Object.assign(repl.style, {
      width: "100%",
      height: "100%",
      display: "block",
      background: "rgba(10,10,15,0.95)",
      border: "none",
    });

    mask.appendChild(repl);
    console.log("🎼 Código original (UTF-8):", code);

    if (window.Tone && Tone.context?.state === "suspended") {
      overlay.style.display = "flex";
      overlay.onclick = () =>
        Tone.context.resume().then(() => (overlay.style.display = "none"));
    }
    return;
  }

  // === HYDRA / HYDRA-THREE ===
  if (item.type === "hydra" || item.type === "hydra-three") {
    toggleVisible(strudelWrapper, false);
    toggleVisible(hydraContainer, true);

    const code = await getPatchCode(item);
    const codeArea = document.getElementById("hydra-code");
    codeArea.value = code;

    requestAnimationFrame(() => runHydraCode());
  }
}

// ==========================================================
// 💾 Tarjetas
// ==========================================================
function populateCards() {
  const container = document.getElementById("lab-cards");
  if (!container) return;
  container.innerHTML = "";

  portfolioCodes.forEach((item) => {
    const card = document.createElement("div");
    card.className = "lab-card";

    let tagsHTML = `<small class="tag ${item.type}">${item.type.toUpperCase()}</small>`;
    if (item.usesThree || item.type === "hydra-three") {
      tagsHTML += `<small class="tag three">THREE</small>`;
    }

    card.innerHTML = `
      <span class="lab-title">${item.title}</span>
      ${tagsHTML}
    `;

    card.onclick = () => handleCardClick(item);
    container.appendChild(card);
  });
}

// ==========================================================
// 🌈 HYDRA (entorno completo optimizado)
// ==========================================================
async function runHydraCode() {
  cleanupThreeOverlay(); // 🔹 Limpia antes de ejecutar nuevo código Hydra

  const container = document.getElementById("hydra-container");
  const canvas = document.getElementById("hydra-canvas");
  if (!canvas || !container) return;

  const code = document.getElementById("hydra-code")?.value?.trim() || "";

  canvas.style.transition = "opacity 0.25s ease";
  canvas.style.opacity = "0.0";
  await new Promise((r) => setTimeout(r, 250));

  const rect = container.getBoundingClientRect();
  canvas.width = rect.width || window.innerWidth;
  canvas.height = rect.height || window.innerHeight;

  if (hydra) {
    try {
      hydra.synth.stop();
    } catch (e) {
      console.warn("Hydra cleanup warning:", e);
    }
    hydra = null;
  }

  try {
    hydra = new window.Hydra({
      canvas,
      detectAudio: false,
      makeGlobal: true,
    });
    window._hydra = hydra;
    hydra.setResolution(canvas.width, canvas.height);
    console.log("🎨 Hydra inicializada sin flash.");

    requestAnimationFrame(async () => {
      try {
        if (code && code.length > 5) {
          if (code.includes("THREE") || code.includes("new THREE.")) await ensureThree();
          new Function(code)();
          console.log("🎛️ Patch Hydra ejecutado correctamente.");
        } else {
          osc(10, 0.1, 1.2).modulate(noise(2)).kaleid(3).out(o0);
        }
      } catch (err) {
        console.error("❌ Error ejecutando código Hydra:", err);
      }

      setTimeout(() => (canvas.style.opacity = "1.0"), 60);
    });

    window.addEventListener("resize", () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      hydra.synth.setResolution(w, h);
      hydra.setResolution(w, h);
    });
  } catch (err) {
    console.error("❌ Error al iniciar Hydra:", err);
    canvas.style.opacity = "1.0";
  }
}

// ==========================================================
// 🎛️ Controles de ventana
// ==========================================================
function setupWindowControls(win, isMobile) {
  const header = win.querySelector(".lab-header");
  let maximized = false;
  let prevRect = null;

  if (isMobile) {
    header.querySelector(".close-btn")?.addEventListener("click", () => win.remove());
    return;
  }

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

  header.querySelector(".min-btn").onclick = () => (win.style.display = "none");
  header.querySelector(".max-btn").onclick = () => {
    if (!maximized) {
      prevRect = {
        left: win.style.left,
        top: win.style.top,
        width: win.style.width,
        height: win.style.height,
      };
      Object.assign(win.style, {
        left: 0,
        top: 0,
        width: window.innerWidth + "px",
        height: window.innerHeight - 40 + "px",
      });
      maximized = true;
    } else {
      Object.assign(win.style, prevRect);
      maximized = false;
    }
  };

  header.querySelector(".close-btn").onclick = async () => {
    cleanupThreeOverlay(); // 🔹 Limpia al cerrar
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
// 🚀 Crear ventana principal
// ==========================================================
async function createUI() {
  const win = document.createElement("div");
  win.id = "live-lab";
  win.className = "window window-live-lab simple";
  win.dataset.task = "live-lab";

  const isMobile =
    document.body.classList.contains("mobile-mode") ||
    window.matchMedia("(max-width: 800px)").matches;

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
        <div class="lab-cards" id="lab-cards"></div>
      </div>
      <div class="lab-main">
        <div id="strudel-wrapper" class="strudel-zone" style="opacity:0;visibility:hidden;">
          <div id="strudel-mask"></div>
        </div>
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
        <div id="audio-unlock" style="display:none;"><p>🔊 Haz click para habilitar el audio</p></div>
      </div>
    </div>
    <button id="lab-folder-toggle" title="Mostrar/Ocultar panel">📁</button>
  `;

  document.body.appendChild(win);

  const isM = isMobile;
  if (isM) {
    Object.assign(win.style, {
      position: "fixed",
      inset: "0",
      width: "100vw",
      height: "var(--real-vh)",
      margin: "0",
      border: "none",
      borderRadius: "0",
      background: "rgba(10,10,15,0.92)",
      backdropFilter: "blur(10px)",
    });
    win.querySelector(".min-btn")?.remove();
    win.querySelector(".max-btn")?.remove();
    document.body.classList.add("mobile-mode");
  }

  setupWindowControls(win, isM);
  setupPanelToggle();

  document.getElementById("hydra-run").onclick = () => runHydraCode();

  const editor = document.getElementById("hydra-editor");
  const hideBtn = document.getElementById("hydra-hide");
  const showBtn = document.getElementById("hydra-show");

  hideBtn.onclick = () => {
    editor.style.display = "none";
    showBtn.style.display = "block";
  };

  showBtn.onclick = () => {
    editor.style.display = "flex";
    showBtn.style.display = "none";
  };

  await loadPortfolioCodes();
  if (!isM) addToTaskbar("Live Lab", "🎛️");
  bringToFront(win);
}

// ==========================================================
// 🚀 Export principal
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
  console.log("✅ Live Lab (Hydra + Strudel + Three.js + móvil) listo.");
}
