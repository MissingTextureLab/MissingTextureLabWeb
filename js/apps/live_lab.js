// live_lab.js — versión estable (Hydra + Strudel @1.0.3 - licencia AGPL-3.0)
// -----------------------------------------------------------
// Este módulo integra Hydra y Strudel en tu sistema OS de Live Lab.
// Strudel se usa mediante @strudel/web, conforme a su licencia AGPL-3.0.
// Más info: https://codeberg.org/uzu/strudel/src/branch/main/packages/web
// -----------------------------------------------------------

let hydra, hydraCanvas, audioCtx;

// ====== Cargar scripts externos ======
const lazyLoadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => {
      console.log("✅ Cargado script:", src);
      resolve();
    };
    s.onerror = (e) => {
      console.error("❌ Error cargando script:", src, e);
      reject(e);
    };
    document.head.appendChild(s);
  });

// ====== Asegurar librerías ======
async function ensureLibs() {
  console.log("🧠 Comprobando librerías...");
  const loads = [];
  if (!window.Hydra)
    loads.push(
      lazyLoadScript("https://unpkg.com/hydra-synth@1.3.29/dist/hydra-synth.js")
    );
  if (typeof window.initStrudel !== "function")
    loads.push(lazyLoadScript("https://unpkg.com/@strudel/web@1.0.3"));
  if (loads.length) await Promise.all(loads);

  console.log("📦 Librerías listas:", {
    hydra: !!window.Hydra,
    strudel: typeof window.initStrudel === "function",
  });
}

// ====== Crear interfaz ======
function createUI() {
  const lab = document.createElement("div");
  lab.id = "live-lab";
  lab.className = "window window-live-lab simple";

  lab.innerHTML = `
    <div class="lab-header">
      <span>🎛️ Live Lab</span>
      <div class="lab-buttons">
        <button id="lab-run">▶</button>
        <button id="lab-stop">■</button>
        <button id="lab-clear">⟳</button>
      </div>
    </div>
    <div class="lab-body">
      <textarea id="lab-code">// escribe aquí tu código Hydra o Strudel</textarea>
      <canvas id="lab-canvas"></canvas>
    </div>
    <div id="lab-log"></div>
  `;
  document.body.appendChild(lab);

  const code = lab.querySelector("#lab-code");
  const canvas = lab.querySelector("#lab-canvas");
  const log = lab.querySelector("#lab-log");
  canvas.width = 640;
  canvas.height = 360;

  document.getElementById("lab-run").onclick = () => runCode(code.value, canvas, log);
  document.getElementById("lab-stop").onclick = stopAll;
  document.getElementById("lab-clear").onclick = () => (code.value = "");
}

// ====== Inicializar Strudel ======
async function ensureStrudel() {
  console.log("🎵 Inicializando Strudel...");

  // 1️⃣ Inicializar solo una vez
  if (!window.__strudelReady && typeof window.initStrudel === "function") {
    console.log("🚀 Llamando a initStrudel() (from @strudel/web)...");
    await window.initStrudel();
    window.__strudelReady = true;
    console.log("✅ Strudel inicializado (funciones globales activas)");
  }

  // 2️⃣ Crear o reanudar AudioContext
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    console.log("🎧 Creando nuevo AudioContext");
  }

  // Si sigue suspendido, esperar interacción
  if (audioCtx.state === "suspended") {
    console.log("⚠️ AudioContext suspendido — esperando click para reanudar...");
    await new Promise((resolve) => {
      const resume = () => {
        audioCtx.resume().then(() => {
          console.log("🎚 AudioContext reanudado manualmente");
          window.removeEventListener("click", resume);
          resolve();
        });
      };
      window.addEventListener("click", resume);
    });
  }
}


// ====== Inicializar Hydra ======
function ensureHydra(canvas) {
  if (!window.Hydra) return console.warn("⚠️ Hydra no cargada todavía");
  if (!hydra) {
    hydra = new window.Hydra({ canvas, detectAudio: false, makeGlobal: true });
    console.log("🎨 Hydra inicializada");
  }
  return hydra;
}

// ====== Ejecutar código ======
async function runCode(code, canvas, log) {
  log.textContent = "";
  await ensureLibs();
  if (audioCtx?.state === "suspended") await audioCtx.resume();
  // --- HYDRA ---
  if (code.includes("s0.") || code.includes(".out(")) {
    ensureHydra(canvas);
    try {
      new Function(code)();
      log.textContent = "🎨 Hydra ejecutado correctamente";
    } catch (e) {
      log.textContent = "❌ Hydra error: " + e.message;
      console.error(e);
    }
    return;
  }

  // --- STRUDEL ---
  await ensureStrudel();
  try {
    console.log("▶ Ejecutando Strudel...");
    new Function(code)(); // usa las funciones globales s(), n(), setcps(), etc.
    log.textContent = "🎵 Strudel ejecutado correctamente";
  } catch (e) {
    log.textContent = "❌ Strudel error: " + e.message;
    console.error("❌ Strudel error:", e);
  }
}

// ====== Stop ======
function stopAll() {
  try {
    if (hydra?.synth) hydra.synth.stop();
  } catch {}
  try {
    if (window.hush) window.hush(); // función global de Strudel para silenciar
  } catch {}
  console.log("🛑 Todo detenido");
}

// ====== Export principal ======
export async function openLiveLabWindow() {
  if (document.getElementById("live-lab")) return;
  createUI();
  await ensureLibs();

  // 🔊 Auto-init de Strudel al abrir
  if (typeof window.initStrudel === "function" && !window.__strudelReady) {
    console.log("🎚 Inicializando Strudel global al abrir ventana...");
    await window.initStrudel();
    window.__strudelReady = true;
  }

  console.log("✅ Live Lab listo.");
}
