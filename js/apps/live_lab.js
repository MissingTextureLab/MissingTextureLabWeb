// ==========================================================
// 🎛️ live_lab.js — Hydra + Strudel (ventana OS adaptada a móvil y desktop)
// ==========================================================

import { bringToFront, addToTaskbar } from "../windows.js";

let hydra;

// ====== Loader ======
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

// ====== Tarjetas ======
const portfolioCodes = [
  {
    title: "🌊 Oceanic Pulse",
    type: "strudel",
    thumb: "icons/wave.png",
    url: "https://strudel.cc/#Ly8gZmlsbCBpbiBnYXBzIGJldHdlZW4gZXZlbnRzCg...",
  },
  {
    title: "🌈 Hydra Patch",
    type: "hydra",
    thumb: "icons/hydra.png",
    code: `
osc(10,0.1,1.2).modulate(noise(2)).kaleid(3).out(o0)
`,
  },
];

// ==========================================================
// UI principal
// ==========================================================
function createUI() {
  const win = document.createElement("div");
  win.id = "live-lab";
  win.className = "window window-live-lab simple";
  win.dataset.task = "live-lab";

  // Detectar móvil
  const isMobile =
    document.body.classList.contains("mobile-mode") ||
    window.matchMedia("(max-width: 800px)").matches;

  // HTML base
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
      <div id="strudel-wrapper" style="
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        display: none;
        background: rgba(0,0,0,0.9);
        border-radius: 0 0 12px 12px;
        clip-path: inset(0 round 12px);
      ">
        <div id="strudel-mask" style="
          position:absolute;
          inset:0;
          width:100%;
          height:100%;
          overflow:hidden;
          clip-path: inset(0);
        ">
          <iframe
            id="strudel-frame"
            title="Strudel Live Coding Environment"
            allowfullscreen
            style="
              position:absolute;
              top:0;
              left:0;
              width:100%;
              height:100%;
              border:0;
              overflow:hidden;
              transform:translateY(-2%);
            "
          ></iframe>
        </div>
      </div>

        <div id="hydra-container" style="display:none;position:relative;width:100%;height:100%;">
          <canvas id="hydra-canvas"></canvas>
          <div id="hydra-editor">
            <textarea id="hydra-code"></textarea>
            <div class="hydra-controls">
              <button id="hydra-run">▶ Run</button>
              <button id="hydra-hide">🌓 Hide Editor</button>
              <button id="hydra-stop">■ Stop</button>
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

  // ==========================================================
  // Estilos adaptativos móviles (similar a “Sobre mí”)
  // ==========================================================
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

    // Quitar minimizar/maximizar
    win.querySelector(".min-btn")?.remove();
    win.querySelector(".max-btn")?.remove();

    const header = win.querySelector(".lab-header");
    header.style.justifyContent = "space-between";
    header.style.padding = "0.5rem 0.75rem";
    header.style.cursor = "default";
    header.style.background = "rgba(20,20,30,0.6)";
    header.style.borderBottom = "1px solid rgba(255,255,255,0.08)";

    const bodyEl = win.querySelector(".lab-body");
    Object.assign(bodyEl.style, {
      flex: "1",
      position: "absolute",
      top: "48px",
      left: "0",
      right: "0",
      bottom: "0",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    });

    const mainEl = win.querySelector(".lab-main");
    Object.assign(mainEl.style, {
      flex: "1",
      width: "100%",
      height: "100%",
      borderRadius: "0",
      overflow: "hidden",
    });

    const strudel = document.getElementById("strudel-wrapper");
    const hydraCont = document.getElementById("hydra-container");
    if (strudel && hydraCont) {
      strudel.style.width = hydraCont.style.width = "100%";
      strudel.style.height = hydraCont.style.height = "100%";
    }

    requestAnimationFrame(() => {
      win.style.opacity = "1";
      win.style.transform = "translateY(0)";
    });
  }

  // ==========================================================
  // Inicialización funcional
  // ==========================================================
  setupWindowControls(win, isMobile);
  setupPanelToggle();
  populateCards();
  setupHydraUI();

  if (!isMobile) addToTaskbar("Live Lab", "🎛️");
  bringToFront(win);
  handleCardClick(portfolioCodes[0]);
}

// ==========================================================
// Panel lateral (📁)
// ==========================================================
function setupPanelToggle() {
  const panel = document.getElementById("lab-left");
  const toggle = document.getElementById("lab-folder-toggle");
  const labBody = document.querySelector(".lab-body");
  if (!panel || !toggle || !labBody) return;

  panel.classList.add("open");
  toggle.classList.add("active");

  toggle.addEventListener("click", () => {
    const isOpen = panel.classList.toggle("open");
    toggle.classList.toggle("active", isOpen);
    toggle.textContent = isOpen ? "📁" : "📂";
    panel.style.width = isOpen ? "220px" : "0";
    labBody.style.gridTemplateColumns = isOpen ? "220px 1fr" : "0 1fr";
  });
}

// ==========================================================
// Controles de ventana
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
      const maxLeft = window.innerWidth - rect.width;
      const maxTop = window.innerHeight - rect.height - 40;
      win.style.left = Math.max(0, Math.min(x, maxLeft)) + "px";
      win.style.top = Math.max(0, Math.min(y, maxTop)) + "px";
    }

    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.classList.remove("dragging");
    }

    document.body.classList.add("dragging");
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
    win.remove();
  });
}

// ==========================================================
// Tarjetas
// ==========================================================
function populateCards() {
  const container = document.getElementById("lab-cards");
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
// HYDRA
// ==========================================================
function setupHydraUI() {
  const runBtn = document.getElementById("hydra-run");
  const stopBtn = document.getElementById("hydra-stop");
  const hideBtn = document.getElementById("hydra-hide");
  const showBtn = document.getElementById("hydra-show");

  runBtn.onclick = () => runHydraCode();
  stopBtn.onclick = () => stopHydra();

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
  const code = document.getElementById("hydra-code").value.trim();
  const canvas = document.getElementById("hydra-canvas");
  const container = document.getElementById("hydra-container");

  if (!hydra) {
    hydra = new window.Hydra({ canvas, detectAudio: false, makeGlobal: true });
  }

  setTimeout(() => {
    const wrapper = document.getElementById("strudel-wrapper");
    const iframe = document.getElementById("strudel-frame");
    if (wrapper && iframe) {
      const rect = wrapper.getBoundingClientRect();
      iframe.style.height = `${rect.height}px`;
    }
  }, 120);

  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  try {
    new Function(code)();
  } catch (err) {
    console.error("❌ Error al ejecutar código Hydra:", err);
  }
}

function stopHydra() {
  try {
    hydra?.synth?.stop();
  } catch {}
}

// ==========================================================
// STRUDEL / HYDRA HANDLER
// ==========================================================
function handleCardClick(item) {
  const iframe = document.getElementById("strudel-frame");
  const wrapper = document.getElementById("strudel-wrapper");
  const hydraContainer = document.getElementById("hydra-container");

  if (item.type === "strudel") {
    hydraContainer.style.display = "none";
    wrapper.style.display = "block";
    iframe.src = item.url;
    showAudioUnlock();

    if (document.body.classList.contains("mobile-mode") || window.innerWidth < 800) {
      wrapper.style.height = "calc(var(--real-vh) - 120px)";
      iframe.style.height = "100%";
      iframe.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    }
  }

  if (item.type === "hydra") {
    wrapper.style.display = "none";
    hydraContainer.style.display = "block";
    document.getElementById("hydra-code").value = item.code.trim();
    runHydraCode();
  }
}

function showAudioUnlock() {
  const overlay = document.getElementById("audio-unlock");
  overlay.style.display = "flex";
  overlay.style.position = "absolute";
  overlay.style.inset = 0;
  overlay.style.background = "rgba(0,0,0,0.7)";
  overlay.style.color = "#fff";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.cursor = "pointer";
  overlay.onclick = () => {
    overlay.style.display = "none";
  };
}

// ==========================================================
// Export principal
// ==========================================================
export async function openLiveLabWindow() {
  if (document.getElementById("live-lab")) return;
  await ensureHydra();
  createUI();
  console.log("✅ Live Lab listo (modo adaptativo y responsivo).");
}
