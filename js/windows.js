// =======================
// windows.js — versión estable con comportamiento exacto
// =======================

let zCounter = 10;
export let activeWindow = null;
export let offsetX = 0;
export let offsetY = 0;



export function normalizeName(name) {
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
    // 🪟 intenta localizar cualquier ventana que tenga ese key
    const win = document.querySelector(`.window[data-task="${key}"]`) ||
                document.getElementById(`win-${key}`);

    if (!win) {
      console.warn(`⚠️ No se encontró ventana para ${key}`);
      return;
    }

    const isHidden = getComputedStyle(win).display === 'none';
    if (isHidden) {
      // 🔄 restaurar
      win.style.display = 'block';
      bringToFront(win);
    } else {
      // 🔝 traer al frente
      bringToFront(win);
    }
  });

  tb.appendChild(btn);
}


// ---- Crear ventana de propiedades ----
export function openProperties(folder) {
  
  if (!folder) return;

  const baseName = `Propiedades: ${folder.name}`;
  const key = baseName.toLowerCase().replace(/\s+/g, '-');
  const winId = `win-${key}`;

  // Si ya existe → mostrar y traer al frente
  let win = document.getElementById(winId);
  if (win) {
    win.style.display = 'block';
    bringToFront(win);
    return;
  }

  // === Crear ventana ===
  win = document.createElement('div');
  win.className = 'window window-properties';
  win.id = winId;
  win.dataset.task = key;

  const header = document.createElement('div');
  header.className = 'window-header';
  header.innerHTML = `
    <span>${folder.icon || '📁'} Propiedades: ${folder.name}</span>
    <div class="window-buttons">
      <span class="min-btn">_</span>
      <span class="max-btn">□</span>
      <span class="close-btn">✕</span>
    </div>
  `;
  

  const content = document.createElement('div');
  content.className = 'window-content';
  content.innerHTML = `
    <div class="properties-content">
      <p><strong>Tipo:</strong> Carpeta</p>
      <p><strong>Elementos:</strong> ${folder.files?.length || 0}</p>
      <p><strong>Posición:</strong> X=${folder.x ?? '—'}, Y=${folder.y ?? '—'}</p>
      <p><strong>Última modificación:</strong> ${new Date().toLocaleString()}</p>
    </div>
  `;

  win.appendChild(header);
  win.appendChild(content);
  document.body.appendChild(win);

  // === Tamaño y posición inicial ===
  const W = Math.min(460, Math.floor(window.innerWidth * 0.55));
  const H = Math.min(300, Math.floor(window.innerHeight * 0.45));
  win.style.left = ((window.innerWidth - W) / 2) + 'px';
  win.style.top = ((window.innerHeight - H) / 2) + 'px';
  win.style.width = W + 'px';
  win.style.height = H + 'px';
  win.style.display = 'block';

  // 🔗 Añadir botón a taskbar con clave sincronizada
  addToTaskbar(baseName, '⚙️');
  bringToFront(win);

  // === Botones funcionales ===
  // Cerrar
  header.querySelector('.close-btn').addEventListener('click', () => {
    const tbBtn = document.querySelector(`.task-btn[data-task="${key}"]`);
    if (tbBtn) tbBtn.remove();
    win.remove();
  });

  // Minimizar
  header.querySelector('.min-btn').addEventListener('click', () => {
    win.style.display = 'none';
  });

  // Maximizar / restaurar
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
      win.style.left = prev.left;
      win.style.top = prev.top;
      win.style.width = prev.width;
      win.style.height = prev.height;
      maximized = false;
    }
  });

  header.addEventListener('mousedown', (e) => {
    if (e.target.closest('.window-buttons')) return;

    e.preventDefault();
    bringToFront(win);

    const rect = win.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    function onMouseMove(ev) {
      const maxLeft = window.innerWidth - win.offsetWidth;
      const taskbarH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--taskbar-h')) || 40;
      const maxTop = window.innerHeight - taskbarH - win.offsetHeight;

      const x = Math.max(0, Math.min(maxLeft, ev.clientX - offsetX));
      const y = Math.max(0, Math.min(maxTop, ev.clientY - offsetY));

      win.style.left = x + 'px';
      win.style.top = y + 'px';
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

}

// En tu windows.js o donde generes ventanas:
function openUnderConstructionWindow() {
  const win = document.createElement('div');
  win.className = 'window window-under-construction';
  win.innerHTML = `
    <div class="window-header">
      <span>En construcción 🚧</span>
      <div class="window-buttons">
        <span class="close-btn">✕</span>
      </div>
    </div>
    <div class="window-content">
      <div id="under-construction"></div>
      <div class="uc-text">🚧 Página en construcción — próximamente disponible 🚀</div>
    </div>
  `;
  document.body.appendChild(win);
  import('./under_construction.js').then(m => m.initUnderConstruction());
}