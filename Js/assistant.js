// ===== assistant.js =====
// Chat permanente tipo “Leandro” con seguimiento ocular y conexión a /api/chat
// Depende opcionalmente de: startDrag(win, e), bringToFront(win)

import { bringToFront } from './windows.js';
import { startDrag } from './files.js';

// ---------- Estado global ----------
let Chat = { history: [], sending: false, bubbleEl: null, inputEl: null, sendBtn: null };
let typing = false;
const queue = [];

// ---------- Utilidades ----------
const has = (fnName) => typeof window[fnName] === 'function';
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// ---------- Estilos ----------
function injectAssistantStyles() {
  if (document.getElementById('assistant-style')) return;
  const style = document.createElement('style');
  style.id = 'assistant-style';
  style.textContent = `
  .window-assistant {
    width: 640px; height: 420px; min-width: 420px; min-height: 320px;
    resize: none !important; overflow: hidden !important; z-index: 12000;
  }
  .window-assistant .window-header {
    background: linear-gradient(135deg, var(--frutiger-purple), var(--frutiger-light));
    height: var(--titlebar-h);
    display: flex; align-items: center; justify-content: space-between; border: none;
  }
  .window-assistant .window-header .window-buttons { display: none !important; }

  .window-assistant .window-content {
    position: relative; width: 100%; height: calc(100% - var(--titlebar-h));
    background: transparent; display: grid; padding: 0; margin: 0; overflow: hidden;
  }

  .assistant-root {
    width: 100%; height: 100%;
    display: grid; grid-template-columns: 260px 1fr; grid-template-rows: 1fr auto; gap: 0;
    background: transparent;
  }

  .assistant-eye-wrap {
    grid-row: 1 / span 2; grid-column: 1 / 2;
    display: grid; place-items: center;
    background:
      radial-gradient(60% 60% at 50% 30%, rgba(168,85,247,0.25), transparent 70%),
      linear-gradient(180deg, rgba(168,85,247,0.12), rgba(76,29,149,0.18));
  }
  .eye-box { width: 90%; max-width: 220px; aspect-ratio: 1/1; display: grid; place-items: center; }
  .assistant-eye { width: 100%; height: 100%; display: block; background: transparent; }

  .assistant-bubble {
    grid-column: 2 / 3; grid-row: 1 / 2;
    padding: 14px; background: rgba(255,255,255,0.88);
    color: var(--frutiger-dark); font-size: 13px; line-height: 1.4;
    overflow: auto; border: none;
  }
  .assistant-typing { white-space: pre-wrap; }

  .assistant-controls {
    grid-column: 2 / 3; grid-row: 2 / 3;
    display: flex; align-items: center; gap: 8px; padding: 10px 12px;
    background: rgba(168,85,247,0.08);
  }
  .assistant-input {
    flex: 1; min-width: 160px;
    border: 1px solid var(--chrome-dark); background: #fff; color: #111; padding: 8px 10px;
    font-size: 13px;
  }
  .assistant-send {
    font-size: 12px; font-weight: 700; padding: 8px 10px;
    background: var(--frutiger-purple); color: #fff; border: none; cursor: pointer;
  }
  .assistant-send[disabled] { opacity: .6; cursor: not-allowed; }
  `;
  document.head.appendChild(style);
}

// ---------- Comunicación con backend ----------
async function streamFromVercel(messages, onToken) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok || !res.body) throw new Error('Chat API no disponible (' + res.status + ')');
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    full += chunk;
    onToken?.(chunk, full);
  }
  return full;
}

// ---------- Chat lógico ----------
async function ask(prompt) {
  if (!prompt || Chat.sending) return;
  Chat.sending = true;
  Chat.inputEl.value = '';
  Chat.sendBtn.disabled = true;
  Chat.bubbleEl.textContent = '';
  Chat.history.push({ role: 'user', content: String(prompt) });
  try {
    const answer = await streamFromVercel(Chat.history, (_, full) => {
      Chat.bubbleEl.textContent = full;
    });
    Chat.history.push({ role: 'assistant', content: answer });
  } catch (err) {
    console.error(err);
    say('❌ Error de chat. ¿Está configurado /api/chat y la clave?');
  } finally {
    Chat.sending = false;
    Chat.sendBtn.disabled = false;
  }
}

// ---------- Render UI ----------
function createAssistantWindow() {
  injectAssistantStyles();

  const win = document.createElement('div');
  win.className = 'window window-assistant';
  win.id = 'win-assistant';

  const header = document.createElement('div');
  header.className = 'window-header';
  header.innerHTML = `<span>Leandro</span><div class="window-buttons"></div>`;

  const content = document.createElement('div');
  content.className = 'window-content';

  const root = document.createElement('div');
  root.className = 'assistant-root';

  const eyeWrap = document.createElement('div');
  eyeWrap.className = 'assistant-eye-wrap';
  const eyeBox = document.createElement('div');
  eyeBox.className = 'eye-box';
  eyeBox.innerHTML = getEyeSVG();
  eyeWrap.appendChild(eyeBox);

  const bubble = document.createElement('div');
  bubble.className = 'assistant-bubble';
  const typing = document.createElement('div');
  typing.className = 'assistant-typing';
  bubble.appendChild(typing);
  Chat.bubbleEl = typing;

  const controls = document.createElement('div');
  controls.className = 'assistant-controls';

  const input = document.createElement('input');
  input.className = 'assistant-input';
  input.type = 'text';
  input.placeholder = 'Escríbeme sobre tu portfolio…';
  Chat.inputEl = input;

  const send = document.createElement('button');
  send.className = 'assistant-send';
  send.textContent = 'Enviar';
  Chat.sendBtn = send;

  controls.appendChild(input);
  controls.appendChild(send);

  root.appendChild(eyeWrap);
  root.appendChild(bubble);
  root.appendChild(controls);

  content.appendChild(root);
  win.appendChild(header);
  win.appendChild(content);
  document.body.appendChild(win);

  const taskbarH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--taskbar-h')) || 40;
  const H = win.offsetHeight || 420;
  win.style.left = '16px';
  win.style.top = (window.innerHeight - taskbarH - H - 16) + 'px';
  win.style.display = 'block';
  win.style.resize = 'none';

  bringToFront(win);
  header.addEventListener('mousedown', (e) => startDrag(win, e));
  setupEyeTracking(win);

  send.addEventListener('click', () => ask(input.value.trim()));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input.value.trim()); }
  });

  say('Hola, soy tu asistente. Pídeme info sobre tu trabajo y te respondo con lo que hay en tu portfolio 💜.');
  return win;
}

// ---------- Ojo SVG + seguimiento ----------
function getEyeSVG() {
  const cx = 80, cy = 80, irisR = 26;
  return `
  <svg class="assistant-eye" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="iris-grad" cx="50%" cy="50%" r="50%">
        <stop offset="0%"  stop-color="#b380ff"/>
        <stop offset="35%" stop-color="#a45cf7"/>
        <stop offset="70%" stop-color="#7a3ee3"/>
        <stop offset="100%" stop-color="#4c1d95"/>
      </radialGradient>
      <clipPath id="aperture">
        <ellipse id="apertureEllipse" cx="${cx}" cy="${cy}" rx="60" ry="60"></ellipse>
      </clipPath>
    </defs>
    <g id="eyeball" clip-path="url(#aperture)">
      <circle id="iris"  cx="${cx}" cy="${cy}" r="${irisR}" fill="url(#iris-grad)"/>
      <circle id="pupil" cx="${cx}" cy="${cy}" r="10.5" fill="var(--frutiger-dark)"/>
      <circle id="highlight1" cx="${cx+9}" cy="${cy-8}" r="3.2" fill="rgba(255,255,255,0.9)"/>
      <circle id="highlight2" cx="${cx}"   cy="${cy}"   r="1.6" fill="rgba(255,255,255,0.65)"/>
    </g>
  </svg>`;
}

// 🔹 Seguimiento de ojo (idéntico al tuyo)
function setupEyeTracking(win) {
  const svg = win.querySelector('.assistant-eye');
  const iris = svg?.querySelector('#iris');
  const pupil = svg?.querySelector('#pupil');
  const h1 = svg?.querySelector('#highlight1');
  const h2 = svg?.querySelector('#highlight2');
  const ap = svg?.querySelector('#apertureEllipse');
  if (!svg || !iris || !pupil) return;

  if (ap) ap.setAttribute('ry', '60');
  const CX = 80, CY = 80;
  const irisR0 = parseFloat(iris.getAttribute('r')) || 26;
  const pupilR0 = parseFloat(pupil.getAttribute('r')) || 10.5;
  const MAX_IRIS_OFFSET = 22, MAX_PUPIL_OFFSET = 30;
  const K_IRIS = 36, C_IRIS = 14, K_PUP = 48, C_PUP = 18;
  const PUP_MIN = 8.8, PUP_MAX = 12.8, PUP_DILATE_V = 0.45;

  const S = {
    lastMouse: { x: window.innerWidth/2, y: window.innerHeight/2 },
    energy: 0,
    iris: { x: CX, y: CY, vx: 0, vy: 0 },
    pupil: { x: CX, y: CY, vx: 0, vy: 0 },
    tI: { x: CX, y: CY },
    tP: { x: CX, y: CY },
    raf: 0,
    destroyed: false
  };

  function springStep(state, target, k, c, dt) {
    state.vx += (k * (target.x - state.x) - c * state.vx) * dt;
    state.vy += (k * (target.y - state.y) - c * state.vy) * dt;
    state.x += state.vx * dt; state.y += state.vy * dt;
  }

  function computeTargets(x, y) {
    const rect = svg.getBoundingClientRect();
    const cxPx = rect.left + rect.width / 2;
    const cyPx = rect.top + rect.height / 2;
    const dx = x - cxPx, dy = y - cyPx;
    const d = Math.hypot(dx, dy);
    const rLimit = Math.max(1, Math.min(rect.width, rect.height) / 2);
    const ratio = clamp(d / rLimit, 0, 1);
    const ux = dx / (d || 1), uy = dy / (d || 1);
    S.tI.x = CX + ux * MAX_IRIS_OFFSET * ratio;
    S.tI.y = CY + uy * MAX_IRIS_OFFSET * ratio;
    S.tP.x = CX + ux * MAX_PUPIL_OFFSET * ratio;
    S.tP.y = CY + uy * MAX_PUPIL_OFFSET * ratio;
  }

  document.addEventListener('pointermove', (e) => {
    S.lastMouse = { x: e.clientX, y: e.clientY };
    S.energy = clamp(S.energy * 0.9 + Math.hypot(e.movementX||0, e.movementY||0) * 0.6, 0, 120);
  }, { passive: true });

  let lastTS = performance.now();
  function tick(now) {
    if (S.destroyed) return;
    const dt = clamp((now - lastTS) / 1000, 0, 0.033);
    lastTS = now;
    computeTargets(S.lastMouse.x, S.lastMouse.y);
    springStep(S.iris, S.tI, K_IRIS, C_IRIS, dt);
    springStep(S.pupil, S.tP, K_PUP, C_PUP, dt);
    iris.setAttribute('cx', S.iris.x);
    iris.setAttribute('cy', S.iris.y);
    pupil.setAttribute('cx', S.pupil.x);
    pupil.setAttribute('cy', S.pupil.y);
    if (h1 && h2) {
      h1.setAttribute('cx', S.pupil.x + 9);
      h1.setAttribute('cy', S.pupil.y - 8);
      h2.setAttribute('cx', S.pupil.x + 5);
      h2.setAttribute('cy', S.pupil.y - 3);
    }
    const k = clamp(S.energy / 100, 0, 1);
    const pr = clamp(pupilR0 + (PUP_MAX - pupilR0) * (k * PUP_DILATE_V)
                               - (pupilR0 - PUP_MIN) * (1 - k) * 0.12,
                     PUP_MIN, PUP_MAX);
    pupil.setAttribute('r', pr);
    S.raf = requestAnimationFrame(tick);
  }
  S.raf = requestAnimationFrame(tick);
}

// ---------- Cola de tipeo ----------
async function typeInto(el, text, speed = 16) {
  return new Promise((resolve) => {
    el.textContent = '';
    let i = 0; typing = true;
    const id = setInterval(() => {
      el.textContent += text.charAt(i++);
      if (i >= text.length) { clearInterval(id); typing = false; resolve(); }
    }, speed);
  });
}
function say(msg) {
  const bubble = document.querySelector('#win-assistant .assistant-typing');
  if (!bubble) return;
  queue.push(String(msg));
  if (!typing) processQueue(bubble);
}
async function processQueue(bubble) {
  if (!queue.length) return;
  const msg = queue.shift();
  await typeInto(bubble, msg);
  setTimeout(() => processQueue(bubble), 250);
}

// ---------- API pública ----------
export const Assistant = {
  ensure() { return document.getElementById('win-assistant') || createAssistantWindow(); },
  say, ask,
};

// ---------- Inicializador ----------
export function initAssistant() {
  window.addEventListener('DOMContentLoaded', () => {
    const win = Assistant.ensure();
    bringToFront(win);
  });
}
