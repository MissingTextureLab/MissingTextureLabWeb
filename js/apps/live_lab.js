// live_lab.js — Ventana "Live Lab" (Hydra + Strudel) incrustada en sistema OS
// ---------------------------------------------------------------------------

import { bringToFront } from '../windows.js';

let win, hydra, hydraCanvas, audioCtx, analyser, strudelState = null;
let presets = [];
let activeIndex = 0;
let libsReady = { hydra: false, strudel: false };

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

// ===== Cargar scripts Hydra y Strudel =====
function lazyLoadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function ensureLibs() {
  libsReady.hydra = !!window.Hydra;
  libsReady.strudel = !!(window.Strudel || (window.strudel && window.strudel.web));

  const loads = [];
  if (!libsReady.hydra) loads.push(lazyLoadScript('./libs/hydra-synth.js'));
  if (!libsReady.strudel) loads.push(lazyLoadScript('./libs/strudel-web.min.js'));

  if (loads.length) {
    try { await Promise.all(loads); } 
    catch(e) { console.warn('No se pudieron cargar algunas libs', e); }
  }

  libsReady.hydra = !!window.Hydra;
  libsReady.strudel = !!(window.Strudel || (window.strudel && window.strudel.web));
}

function makeWindow() {
  if (win) return win;

  // 🟣 Crear ventana base coherente con tu sistema
  win = document.createElement('div');
  win.id = 'win-Lab';
  win.className = 'window window-live-lab';

  const header = document.createElement('div');
  header.className = 'window-header';
  header.innerHTML = `
    <span>🎛️ Live Lab</span>
    <div class="window-buttons">
      <span class="min-btn">_</span>
      <span class="max-btn">□</span>
      <span class="close-btn">✕</span>
    </div>`;

  const content = document.createElement('div');
  content.className = 'window-content';
  content.innerHTML = `
    <div class="lab-root">
      <div class="lab-toolbar">
        <button class="lab-btn" id="prev">◀ Prev</button>
        <button class="lab-btn" id="next">Next ▶</button>
        <div class="spacer"></div>
        <button class="lab-btn" id="run">▶ Ejecutar</button>
        <button class="lab-btn" id="stop">■ Stop</button>
        <button class="lab-btn" id="save">💾 Guardar</button>
        <button class="lab-btn" id="delete">🗑️ Borrar</button>
      </div>

      <aside class="lab-sidebar">
        <div class="search">
          <input id="lab-search" placeholder="Filtrar… (tag, título)">
        </div>
        <ul class="lab-list" id="lab-list"></ul>
      </aside>

      <section class="lab-editor">
        <div class="tabs">
          <div class="tab active" data-tab="hydra">Hydra</div>
          <div class="tab" data-tab="strudel">Strudel</div>
        </div>
        <div class="editor-wrap"><textarea id="lab-editor"></textarea></div>
      </section>

      <section class="lab-preview">
        <div class="preview-top"><canvas id="hydra-canvas"></canvas></div>
        <div class="preview-bottom">
          <div class="meter" id="lab-meter"><div class="bar"></div></div>
          <div class="log" id="lab-log"></div>
        </div>
      </section>
    </div>
  `;

  win.appendChild(header);
  win.appendChild(content);
  document.body.appendChild(win);

  // Tamaño y posición inicial
  const W = Math.min(960, Math.floor(window.innerWidth * 0.9));
  const H = Math.min(640, Math.floor(window.innerHeight * 0.85));
  win.style.left = ((window.innerWidth - W) / 2) + 'px';
  win.style.top = ((window.innerHeight - H) / 2) + 'px';
  win.style.width = W + 'px';
  win.style.height = H + 'px';
  win.style.display = 'block';

  bringToFront(win);

  // === Botones ===
  header.querySelector('.close-btn').addEventListener('click', () => {
    win.remove();
    win = null;
    const taskBtn = document.querySelector('.task-btn[data-task="lab"]');
    if (taskBtn) taskBtn.remove();
  });
  header.querySelector('.min-btn').addEventListener('click', () => {
    win.style.display = 'none';
  });

  let maximized = false;
  header.querySelector('.max-btn').addEventListener('click', () => {
    if (!maximized) {
      win.dataset.prev = JSON.stringify({
        left: win.style.left, top: win.style.top,
        width: win.style.width, height: win.style.height
      });
      win.style.left = 0;
      win.style.top = 0;
      win.style.width = window.innerWidth + 'px';
      win.style.height = (window.innerHeight - 40) + 'px';
      maximized = true;
    } else {
      const prev = JSON.parse(win.dataset.prev);
      Object.assign(win.style, prev);
      maximized = false;
    }
  });

  // === Permitir arrastrar la ventana ===
  header.addEventListener('mousedown', e => {
    if (e.target.closest('.window-buttons')) return;
    if (typeof startDrag === 'function') startDrag(win, e);
  });

  // === Inicialización normal de Live Lab ===
  hydraCanvas = document.getElementById('hydra-canvas');
  ensureAudioMeter();
  return win;
}

// ===== Inicializar Hydra =====
function ensureHydra() {
  if (!libsReady.hydra) return;
  if (hydra) return hydra;
  hydra = new window.Hydra({
    canvas: hydraCanvas,
    detectAudio: false,
    makeGlobal: true,
  });
  return hydra;
}

// ===== Ejecutar Hydra o Strudel =====
function runActive() {
  const code = $('#lab-editor', win).value.trim();
  if (code.startsWith('s0') || code.includes('.out(')) {
    runHydra(code);
  } else {
    runStrudel(code);
  }
}

function runHydra(code) {
  ensureHydra();
  try {
    new Function(code)();
  } catch (e) {
    console.error('Hydra error:', e);
  }
}

async function ensureStrudel() {
  if (!libsReady.strudel) return null;
  const api = window.Strudel || window.strudel?.web || window.strudel;
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  await audioCtx.resume();
  if (!strudelState) strudelState = { api, running: false };
  return strudelState;
}

async function runStrudel(code) {
  const st = await ensureStrudel();
  if (!st) return;
  try {
    if (st.api.run) await st.api.run(code);
    else if (st.api.evaluate) await st.api.evaluate(code);
  } catch (e) {
    console.error('Strudel error:', e);
  }
}

function stopAll() {
  try { if (hydra && hydra.synth) hydra.synth.stop(); } catch {}
  try { if (strudelState?.api?.stop) strudelState.api.stop(); } catch {}
}

// ===== Export público =====
export async function openLiveLabWindow() {
  makeWindow();
  await ensureLibs();
}
