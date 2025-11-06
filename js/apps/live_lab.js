// live_lab.js — Hydra + Strudel (ventana OS con header oscuro + icono lateral tipo carpeta)
// -----------------------------------------------------------
// Mantiene estética original, integra Hydra y Strudel con panel lateral desplegable mediante icono 📁
// -----------------------------------------------------------

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

// ====== Crear interfaz ======
function createUI() {
  const win = document.createElement("div");
  win.id = "live-lab";
  win.className = "window window-live-lab simple";
  Object.assign(win.style, {
    position: "absolute",
    top: "60px",
    left: "80px",
    width: "80vw",
    height: "80vh",
    display: "block",
  });
  win.dataset.task = "live-lab";

  // 🎛️ Header clásico gris oscuro
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
        <iframe
          id="strudel-frame"
          title="Strudel Live Coding Environment"
          style="width:100%;height:100%;border:0;display:none;"
        ></iframe>

        <div
          id="hydra-container"
          style="display:none;position:relative;width:100%;height:100%;"
        >
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

  // Inicializa comportamiento
  setupWindowControls(win);
  setupPanelToggle();
  populateCards();
  setupHydraUI();

  // Taskbar
  addToTaskbar("Live Lab", "🎛️");
  bringToFront(win);

  // Autocargar primer patch
  handleCardClick(portfolioCodes[0]);
}

// ====== Panel lateral (toggle con icono 📁) ======
function setupPanelToggle() {
  const panel = document.getElementById("lab-left");
  const toggle = document.getElementById("lab-folder-toggle");
  const labBody = document.querySelector(".lab-body");
  if (!panel || !toggle || !labBody) return;

  // Estado inicial abierto
  panel.classList.add("open");
  toggle.classList.add("active");

  toggle.addEventListener("click", () => {
    const isOpen = panel.classList.toggle("open");
    toggle.classList.toggle("active", isOpen);

    // 🔄 Cambio de emoji según estado
    toggle.textContent = isOpen ? "📁" : "📂";

    // 🔧 Ajuste visual
    if (isOpen) {
      panel.style.width = "220px";
      labBody.style.gridTemplateColumns = "220px 1fr";
    } else {
      panel.style.width = "0";
      labBody.style.gridTemplateColumns = "0 1fr";
    }
  });
}

// ====== Controles de ventana ======
function setupWindowControls(win) {
  const header = win.querySelector(".lab-header");
  let maximized = false;
  let prevRect = null;

  // --- Mover ondrag ---
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
      win.style.transform = "";
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

  // --- Minimizar ---
  header.querySelector(".min-btn").addEventListener("click", () => {
    win.style.display = "none";
  });

  // --- Maximizar / restaurar ---
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

  // --- Cerrar ---
  header.querySelector(".close-btn").addEventListener("click", () => {
    const tbBtn = document.querySelector('.task-btn[data-task="live-lab"]');
    if (tbBtn) tbBtn.remove();
    win.remove();
  });
}

// ====== Tarjetas ======
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

// ====== HYDRA ======
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
  const code = document.getElementById("hydra-code").value;
  const canvas = document.getElementById("hydra-canvas");
  if (!hydra)
    hydra = new window.Hydra({ canvas, detectAudio: false, makeGlobal: true });
  new Function(code)();
}

function stopHydra() {
  try {
    hydra?.synth?.stop();
  } catch {}
}

// ====== STRUDEL / HYDRA HANDLER ======
function handleCardClick(item) {
  const iframe = document.getElementById("strudel-frame");
  const hydraContainer = document.getElementById("hydra-container");

  if (item.type === "strudel") {
    hydraContainer.style.display = "none";
    iframe.style.display = "block";
    iframe.src = item.url;
    showAudioUnlock();
  }
  if (item.type === "hydra") {
    iframe.style.display = "none";
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

// ====== Export principal ======
export async function openLiveLabWindow() {
  if (document.getElementById("live-lab")) return;
  await ensureHydra();
  createUI();
  console.log("✅ Live Lab listo (icono 📁 + barra gris OS).");
}


