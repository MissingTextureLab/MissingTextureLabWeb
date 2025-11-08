// ==========================================================
// 🎛️ live_lab.js — Hydra + Strudel (ventana OS adaptada a móvil y desktop)
// ==========================================================

import { bringToFront, addToTaskbar } from "../windows.js";

let hydra;
let portfolioCodes = []; // 🔹 ahora se cargan dinámicamente desde JSON

// ==========================================================
// 🔧 Utilidades
// ==========================================================

// Ocultar por opacidad para no perder contexto WebGL
function toggleVisible(el, show) {
  if (!el) return;
  el.style.opacity = show ? "1" : "0";
  el.style.visibility = show ? "visible" : "hidden";
  el.style.pointerEvents = show ? "auto" : "none";
}

// Carga dinámica de scripts externos
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

async function ensureHydra() {
  if (!window.Hydra)
    await lazyLoadScript("https://unpkg.com/hydra-synth@1.3.29/dist/hydra-synth.js");
  console.log("🎨 Hydra lista.");
}

// ==========================================================
// 🎴 Cargar tarjetas desde JSON
// ==========================================================
async function loadPortfolioCodes() {
  try {
    const res = await fetch("../data/live-lab.json");
    if (!res.ok) throw new Error(`Error al cargar JSON (${res.status})`);
    portfolioCodes = await res.json();
    console.log("📦 Tarjetas cargadas:", portfolioCodes);
    populateCards();
  } catch (err) {
    console.error("⚠️ No se pudieron cargar las tarjetas:", err);
  }
}

// ==========================================================
// 🧠 Lógica principal de selección
// ==========================================================
function handleCardClick(item) {
  const hydraContainer = document.getElementById("hydra-container");
  const strudelWrapper = document.getElementById("strudel-wrapper");
  const overlay = document.getElementById("audio-unlock");

  try { hydra?.synth?.stop(); } catch {}
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

    const oldIframe = document.getElementById("strudel-frame");
    if (oldIframe) oldIframe.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "strudel-frame";
    iframe.title = "Strudel Live Coding Environment";
    iframe.allowFullscreen = true;
    Object.assign(iframe.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      border: "0",
      overflow: "hidden",
      transform: "translateY(-2%)",
    });
    document.getElementById("strudel-mask").appendChild(iframe);

    const url = item.url + (item.url.includes("?") ? "&" : "?") + "_=" + Date.now();
    iframe.src = url;

    overlay.style.display = "flex";
    overlay.onclick = () => (overlay.style.display = "none");
    return;
  }

  // === HYDRA ===
  if (item.type === "hydra") {
    toggleVisible(strudelWrapper, false);
    toggleVisible(hydraContainer, true);

    const code = (item.code || "").trim();
    const codeArea = document.getElementById("hydra-code");
    codeArea.value = code;

    requestAnimationFrame(() => {
      const canvas = document.getElementById("hydra-canvas");
      if (!canvas) return;
      const w = hydraContainer.clientWidth || window.innerWidth;
      const h = hydraContainer.clientHeight || window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      canvas.style.display = "block";
      canvas.style.visibility = "visible";
      runHydraCode();
    });
  }
}

// ==========================================================
// 🪟 Crear ventana principal Live Lab
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
          <button id="hydra-show" title="Mostrar editor" style="display:none;">📝 Editor</button>
        </div>

        <div id="audio-unlock" style="display:none;">
          <p>🔊 Haz click para habilitar el audio</p>
        </div>
      </div>
    </div>

    <button id="lab-folder-toggle" title="Mostrar/Ocultar panel">📁</button>
  `;

  document.body.appendChild(win);

  // === Adaptación móvil ===
  if (isMobile) {
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
      zIndex: "9999",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      transition: "opacity .25s ease, transform .25s ease",
      opacity: "0",
      transform: "translateY(10px)",
    });
    win.querySelector(".min-btn")?.remove();
    win.querySelector(".max-btn")?.remove();

    requestAnimationFrame(() => {
      win.style.opacity = "1";
      win.style.transform = "translateY(0)";
    });

    document.body.classList.add("mobile-mode");
    win.style.maxWidth = "100vw";
    win.style.overflowX = "hidden";
  }

  setupWindowControls(win, isMobile);
  setupPanelToggle();
  setupHydraUI();

  await loadPortfolioCodes(); // 🔹 ahora se cargan desde JSON dinámico

  if (!isMobile) addToTaskbar("Live Lab", "🎛️");
  bringToFront(win);

  if (portfolioCodes.length > 0) handleCardClick(portfolioCodes[0]);
}

// ==========================================================
// 📁 Panel lateral
// ==========================================================
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
// 🎛️ Controles de ventana (desktop)
// ==========================================================
function setupWindowControls(win, isMobile) {
  const header = win.querySelector(".lab-header");
  let maximized = false;
  let prevRect = null;

  if (isMobile) {
    const closeBtn = header.querySelector(".close-btn");
    closeBtn.addEventListener("click", () => win.remove());
    return;
  }

  // arrastre
  header.addEventListener("mousedown", (e) => {
    if (e.target.closest(".lab-buttons")) return;
    e.preventDefault();
    bringToFront(win);

    const rect = win.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    function onMove(ev) {
      const x = ev.clientX - offsetX;
      const y = ev.clientY - offsetY;
      win.style.left = Math.max(0, x) + "px";
      win.style.top = Math.max(0, y) + "px";
    }

    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  header.querySelector(".min-btn").addEventListener("click", () => {
    win.style.display = "none";
  });

  header.querySelector(".max-btn").addEventListener("click", () => {
    if (!maximized) {
      prevRect = {
        left: win.style.left,
        top: win.style.top,
        width: win.style.width,
        height: win.style.height,
      };
      win.style.left = 0;
      win.style.top = 0;
      win.style.width = window.innerWidth + "px";
      win.style.height = window.innerHeight - 40 + "px";
      maximized = true;
    } else {
      Object.assign(win.style, prevRect);
      maximized = false;
    }
  });

  header.querySelector(".close-btn").addEventListener("click", () => {
    const tbBtn = document.querySelector('.task-btn[data-task="live-lab"]');
    if (tbBtn) tbBtn.remove();
    disposeLiveLab(win);
    win.remove();
  });
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
    card.innerHTML = `
      <img src="${item.thumb}" alt="${item.title}" class="lab-thumb"/>
      <span>${item.title}</span>
      <small class="tag ${item.type}">${item.type.toUpperCase()}</small>
    `;
    card.onclick = () => handleCardClick(item);
    container.appendChild(card);
  });
}

// ==========================================================
// 🌈 HYDRA
// ==========================================================
function setupHydraUI() {
  const runBtn = document.getElementById("hydra-run");
  const hideBtn = document.getElementById("hydra-hide");
  const showBtn = document.getElementById("hydra-show");

  runBtn.onclick = () => runHydraCode();

  hideBtn.onclick = () => {
    document.getElementById("hydra-editor").classList.add("hidden");
    showBtn.style.display = "inline-flex";
  };
  showBtn.onclick = () => {
    document.getElementById("hydra-editor").classList.remove("hidden");
    showBtn.style.display = "none";
  };
}

function runHydraCode() {
  const canvas = document.getElementById("hydra-canvas");
  if (!canvas) return console.warn("⚠️ Canvas Hydra no encontrado");
  const code = document.getElementById("hydra-code")?.value?.trim() || "";

  canvas.style.display = "block";
  canvas.style.visibility = "visible";

  try { hydra?.synth?.stop(); } catch {}
  hydra = null;

  requestAnimationFrame(() => {
    try {
      hydra = new window.Hydra({ canvas, detectAudio: false, makeGlobal: true });
      const container = document.getElementById("hydra-container");
      const resizeObserver = new ResizeObserver(() => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (hydra && hydra.setResolution) hydra.setResolution(w, h);
      });
      resizeObserver.observe(container);
      new Function(code)();
      console.log("🎨 Hydra inicializada correctamente.");
    } catch (err) {
      console.error("❌ Error al iniciar Hydra:", err);
    }
  });
}

// ==========================================================
// 🧹 Limpieza
// ==========================================================
function disposeLiveLab(win) {
  try { hydra?.synth?.stop(); } catch {}
  hydra = null;
  delete window.hydra;
  delete window.s0;
  delete window.o0;

  const iframe = win?.querySelector("#strudel-frame");
  if (iframe) iframe.remove();

  const overlay = win?.querySelector("#audio-unlock");
  if (overlay) overlay.style.display = "none";
}

// ==========================================================
// 🚀 Export principal
// ==========================================================
export async function openLiveLabWindow() {
  const existing = document.getElementById("live-lab");
  if (existing) {
    console.log("♻️ Reutilizando Live Lab existente");
    existing.style.display = "";
    bringToFront(existing);
    return;
  }
  await ensureHydra();
  await createUI();
  console.log("✅ Live Lab creado (modo adaptativo y JSON dinámico).");
}
