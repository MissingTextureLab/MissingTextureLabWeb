// =======================
// windows.js — versión estable con comportamiento exacto
// =======================

let zCounter = 10;
export let activeWindow = null;
export let offsetX = 0;
export let offsetY = 0;

function normalizeName(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

// ---- Activar y traer al frente ----
export function bringToFront(win) {
  if (!win) return;
  zCounter++;
  win.style.zIndex = zCounter;

  document.querySelectorAll('.window.focused').forEach(w => w.classList.remove('focused'));
  win.classList.add('focused');

  const key = win.dataset.task;
  document.querySelectorAll('.task-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.task-btn[data-task="${key}"]`);
  if (btn) btn.classList.add('active');
}

// ---- Crear barra si no existe ----
function ensureTaskbar() {
  let tb = document.getElementById('taskbar');
  if (!tb) {
    tb = document.createElement('div');
    tb.id = 'taskbar';
    tb.className = 'taskbar';
    document.body.appendChild(tb);
  }
  return tb;
}

// ---- Añadir botón a la taskbar ----
export function addToTaskbar(name, icon = '📁') {
  const tb = ensureTaskbar();
  const key = normalizeName(name);

  // Evita duplicados
  if (tb.querySelector(`[data-task="${key}"]`)) return;

  const btn = document.createElement('button');
  btn.className = 'task-btn';
  btn.dataset.task = key;
  btn.innerHTML = `
    <span class="task-icon">${icon}</span>
    <span class="task-label">${name}</span>
  `;

  btn.addEventListener('click', () => {
    const win = document.getElementById(`win-${name}`);

    // Si la ventana no existe (se cerró), pide reabrirla
    if (!win) {
      window.dispatchEvent(new CustomEvent('taskbar:open-folder', { detail: { name } }));
      return;
    }

    // Si está oculta → mostrarla
    const isHidden = win.style.display === 'none' || getComputedStyle(win).display === 'none';
    if (isHidden) {
      win.style.display = 'block';
      bringToFront(win);
    } else {
      // Si ya está visible, solo la trae al frente
      bringToFront(win);
    }
  });

  tb.appendChild(btn);
}

// ---- Crear ventana de propiedades ----
export function openProperties(folder) {
  if (!folder) return;
  const key = normalizeName(folder.name);
  const winId = `win-${key}`;

  let win = document.getElementById(winId);
  if (win) {
    win.style.display = 'block';
    bringToFront(win);
    return;
  }

  // Crear ventana
  win = document.createElement('div');
  win.className = 'window window-properties';
  win.id = winId;
  win.dataset.task = key;

  const header = document.createElement('div');
  header.className = 'window-header';
  header.innerHTML = `
    <span class="window-title">${folder.icon || '📁'} ${folder.name}</span>
    <div class="window-buttons">
      <button class="min-btn" title="Minimize">_</button>
      <button class="close-btn" title="Close">✕</button>
    </div>
  `;

  const content = document.createElement('div');
  content.className = 'window-content';
  content.innerHTML = `
    <p><strong>Type:</strong> Folder</p>
    <p><strong>Items:</strong> ${folder.files?.length || 0}</p>
    <p><strong>Position:</strong> X=${folder.x ?? '—'}, Y=${folder.y ?? '—'}</p>
    <p><strong>Last modified:</strong> ${new Date().toLocaleString()}</p>
  `;

  win.append(header, content);
  document.body.appendChild(win);

  // Centrar ventana
  const W = 320, H = 200;
  win.style.width = `${W}px`;
  win.style.height = `${H}px`;
  win.style.left = `${(window.innerWidth - W) / 2}px`;
  win.style.top = `${(window.innerHeight - H) / 2}px`;

  bringToFront(win);
  addToTaskbar(folder.name, folder.icon);

  // === Botones ===

  // 🟣 Cerrar → elimina ventana y botón
  header.querySelector('.close-btn').addEventListener('click', () => {
    const tbBtn = document.querySelector(`.task-btn[data-task="${key}"]`);
    if (tbBtn) tbBtn.remove(); // ✅ botón eliminado al cerrar
    win.remove();
  });

  // 🟢 Minimizar → solo oculta la ventana, mantiene el botón
  header.querySelector('.min-btn').addEventListener('click', () => {
    win.style.display = 'none';
  });

  // Arrastre
  header.addEventListener('mousedown', (e) => {
    if (e.target.closest('.window-buttons')) return;
    if (typeof window.startDrag === 'function') window.startDrag(win, e);
  });

  win.addEventListener('mousedown', () => bringToFront(win));
}
