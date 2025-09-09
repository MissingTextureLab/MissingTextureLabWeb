/* ===== desktop-assistant.js (bola + fondo morado suave) =====
   Requiere (si existen): startDrag(win, e), bringToFront(win)
*/
(() => {
  // ---------- Estilos ----------
  const style = document.createElement('style');
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

  /* Panel del ojo: fondo morado suave + bola centrada */
  .assistant-eye-wrap {
    grid-row: 1 / span 2; grid-column: 1 / 2;
    display: grid; place-items: center; padding: 0;
    background:
      radial-gradient(60% 60% at 50% 30%, rgba(168,85,247,0.25), transparent 70%),
      linear-gradient(180deg, rgba(168,85,247,0.12), rgba(76,29,149,0.18));
    border: none; overflow: visible; position: relative;
  }

  .eye-box {
    width: 90%; max-width: 220px; aspect-ratio: 1/1;
    display: grid; place-items: center; overflow: visible;
  }

  .assistant-eye {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
  background: transparent !important;  /* 👈 sin fondo del SVG */
}


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
    background: rgba(168,85,247,0.08); border: none;
  }
  .assistant-chip {
    font-size: 11px; font-weight: 700; padding: 6px 8px;
    background: var(--chrome-silver); border: 1px solid var(--chrome-dark);
    color: var(--frutiger-dark); cursor: pointer; user-select: none;
  }
  .assistant-chip:hover { background: var(--frutiger-light); color: #fff; }
  .assistant-chip:active { transform: translateY(0); }
  `;
  document.head.appendChild(style);

  // ---------- Utils ----------
  const has = (fnName) => typeof window[fnName] === 'function';
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  // ---------- Crear ventana ----------
  function createAssistantWindow() {
    const win = document.createElement('div');
    win.className = 'window window-assistant';
    win.id = 'win-assistant';

    const header = document.createElement('div');
    header.className = 'window-header';
    header.innerHTML = `<span>Asistente · MissingTexture</span><div class="window-buttons"></div>`;

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

    const controls = document.createElement('div');
    controls.className = 'assistant-controls';
    const chip1 = document.createElement('div'); chip1.className = 'assistant-chip'; chip1.textContent = 'Consejo';
    const chip2 = document.createElement('div'); chip2.className = 'assistant-chip'; chip2.textContent = 'Estado';
    const chip3 = document.createElement('div'); chip3.className = 'assistant-chip'; chip3.textContent = 'Ayuda';
    controls.appendChild(chip1); controls.appendChild(chip2); controls.appendChild(chip3);

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
    win.style.top  = (window.innerHeight - taskbarH - H - 16) + 'px';
    win.style.display = 'block';
    win.style.resize = 'none';

    if (has('bringToFront')) bringToFront(win);
    header.addEventListener('mousedown', (e) => { if (has('startDrag')) startDrag(win, e); });

    setupEyeTracking(win);

    chip1.addEventListener('click', () => Assistant.tip());
    chip2.addEventListener('click', () => Assistant.say(getStatusMessage()));
    chip3.addEventListener('click', () => Assistant.say('Doble click abre archivos. Arrastra ventanas desde su barra de título. Yo te doy tips cuando quieras.'));

    Assistant.say('Solo la bola, con fondo morado suave 💜.');
    return win;
  }

  // ---------- SVG: SOLO la bola ----------
function getEyeSVG() {
  const cx = 80, cy = 80, irisR = 26;
  return `
  <svg class="assistant-eye" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img">
    <defs>
      <!-- Gradiente del iris (morado suave) -->
      <radialGradient id="iris-grad" cx="50%" cy="50%" r="50%">
        <stop offset="0%"  stop-color="#b380ff"/>
        <stop offset="35%" stop-color="#a45cf7"/>
        <stop offset="70%" stop-color="#7a3ee3"/>
        <stop offset="100%" stop-color="#4c1d95"/>
      </radialGradient>
    </defs>

    <!-- SOLO la bola: sin sombras, sin anillo, sin filtros -->
    <g id="eyeball" style="mix-blend-mode:normal;">
      <circle id="iris"  cx="${cx}" cy="${cy}" r="${irisR}" fill="url(#iris-grad)" stroke="none"/>
      <circle id="pupil" cx="${cx}" cy="${cy}" r="10.5" fill="var(--frutiger-dark)" stroke="none"/>
      <circle id="highlight1" cx="${cx+9}" cy="${cy-8}" r="" fill="rgba(255,255,255,0.9)" stroke="none"/>
      <circle id="highlight2" cx="${cx}" cy="${cy}" r="1.6" fill="rgba(255,255,255,0.65)" stroke="none"/>
    </g>
  </svg>`;
}


  // ---------- Seguimiento de mirada ----------
  function setupEyeTracking(win) {
    const svg = win.querySelector('.assistant-eye');
    const iris = svg?.querySelector('#iris');
    const pupil = svg?.querySelector('#pupil');
    const h1 = svg?.querySelector('#highlight1');
    const h2 = svg?.querySelector('#highlight2');
    if (!svg || !iris || !pupil) return;

    const center = { x: 80, y: 80 };
    const irisR = 26;
    const maxOffset = 20;

    function lookAt(clientX, clientY) {
      const box = svg.getBoundingClientRect();
      const dx = clientX - (box.left + box.width * 0.5);
      const dy = clientY - (box.top + box.height * 0.5);
      const angle = Math.atan2(dy, dx);
      const dist = Math.min(Math.hypot(dx, dy) / 18, maxOffset);
      const offX = Math.cos(angle) * dist;
      const offY = Math.sin(angle) * dist;

      const ix = clamp(center.x + offX, center.x - (irisR - 3), center.x + (irisR - 3));
      const iy = clamp(center.y + offY, center.y - (irisR - 3), center.y + (irisR - 3));
      iris.setAttribute('cx', ix); iris.setAttribute('cy', iy);

      const px = clamp(center.x + offX * 1.4, center.x - (irisR - 6), center.x + (irisR - 6));
      const py = clamp(center.y + offY * 1.4, center.y - (irisR - 6), center.y + (irisR - 6));
      pupil.setAttribute('cx', px); pupil.setAttribute('cy', py);

      if (h1 && h2) {
        h1.setAttribute('cx', px + 9); h1.setAttribute('cy', py - 8);
        h2.setAttribute('cx', px + 5); h2.setAttribute('cy', py - 3);
      }
    }
    window.addEventListener('mousemove', (e) => lookAt(e.clientX, e.clientY));
  }

  // ---------- Mensajes ----------
  const queue = [];
  let typing = false;
  function typeInto(el, text, speed = 16) {
    return new Promise((resolve) => {
      el.textContent = ''; let i = 0; typing = true;
      const id = setInterval(() => {
        el.textContent += text.charAt(i++);
        if (i >= text.length) { clearInterval(id); typing = false; resolve(); }
      }, speed);
    });
  }
  function say(msg) {
    const bubble = document.querySelector('#win-assistant .assistant-typing');
    if (!bubble) return; queue.push(String(msg)); if (!typing) processQueue(bubble);
  }
  async function processQueue(bubble) {
    if (!queue.length) return; const msg = queue.shift();
    await typeInto(bubble, msg); setTimeout(() => processQueue(bubble), 250);
  }

  // ---------- Consejos ----------
  let tips = [
    '💜 Mantén tu escritorio ordenado: arrastra iconos y evita solaparlos.',
    '💜 Mueve ventanas desde la barra de título; Spotify es tamaño fijo.',
    '💜 Puedes centrar una ventana abriéndola de nuevo desde su carpeta.',
    '💜 Usa miniaturas para reconocer contenido más rápido.',
  ];
  function setTips(arr) { tips = Array.isArray(arr) && arr.length ? arr : tips; }
  function tip(msg) { say(msg || tips[Math.floor(Math.random() * tips.length)]); }

  function getStatusMessage() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    return `Son las ${hh}:${mm}. Todo estable. Ventanas activas listas.`;
  }

  // ---------- API pública ----------
  const Assistant = {
    ensure() { return document.getElementById('win-assistant') || createAssistantWindow(); },
    say, tip, setTips,
  };
  window.Assistant = Assistant;

  // ---------- Auto-arranque ----------
  window.addEventListener('DOMContentLoaded', () => {
    const win = Assistant.ensure();
    if (has('bringToFront')) bringToFront(win);
  });
})();
