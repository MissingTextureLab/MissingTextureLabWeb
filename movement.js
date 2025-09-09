// --- Optimizaciones para el escritorio ---

// índice rápido de ocupación
const posIndex = new Map();
let lastHighlightedCell = null;
let dragOverRaf = false;
let desktopEventsBound = false;
let gridContainer = null;

// reconstruir índice de posiciones
function rebuildPosIndex() {
  posIndex.clear();
  for (const f of folders) posIndex.set(`${f.x},${f.y}`, f.name);
}

// mover iconos sin re-render completo
function moveIconToGrid(iconEl, gridX, gridY) {
  const name = iconEl.dataset.name;
  const current = folders.find(f => f.name === name);
  if (!current) return;

  const key = `${gridX},${gridY}`;
  const occupiedName = posIndex.get(key);

  if (occupiedName && occupiedName !== name) {
    // intercambio
    const other = folders.find(f => f.name === occupiedName);
    const [oldX, oldY] = [current.x, current.y];

    current.x = gridX; current.y = gridY;
    other.x = oldX;    other.y = oldY;

    const otherEl = desktop.querySelector(`.icon[data-name="${CSS.escape(other.name)}"]`);
    if (otherEl) {
      otherEl.style.left = (GRID_PADDING + other.x * GRID_SIZE) + 'px';
      otherEl.style.top  = (GRID_PADDING + other.y * GRID_SIZE) + 'px';
    }
  } else {
    // movimiento libre
    current.x = gridX; current.y = gridY;
  }

  iconEl.style.left = (GRID_PADDING + current.x * GRID_SIZE) + 'px';
  iconEl.style.top  = (GRID_PADDING + current.y * GRID_SIZE) + 'px';

  rebuildPosIndex();
}

// solo 1 vez los listeners globales
function bindDesktopEventsOnce() {
  if (desktopEventsBound) return;
  desktopEventsBound = true;

  desktop.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!isDragging) return;

    if (dragOverRaf) return;
    dragOverRaf = true;
    requestAnimationFrame(() => {
      highlightNearestGrid(e.clientX, e.clientY);
      dragOverRaf = false;
    });
  });

  desktop.addEventListener('drop', (e) => {
    e.preventDefault();
    if (draggedIcon) {
      const gridPos = getGridPosition(e.clientX, e.clientY);
      moveIconToGrid(draggedIcon, gridPos.x, gridPos.y);
    }
  });
}

// reutilizar cuadrícula
function ensureGrid() {
  if (!gridContainer) {
    gridContainer = document.createElement('div');
    gridContainer.id = 'grid-overlay';
    gridContainer.style.position = 'absolute';
    gridContainer.style.inset = '0';
    gridContainer.style.pointerEvents = 'none';
    desktop.appendChild(gridContainer);
  }
  gridContainer.innerHTML = '';
  const maxCols = Math.floor((window.innerWidth  - GRID_PADDING * 2) / GRID_SIZE);
  const maxRows = Math.floor((window.innerHeight - 60 - GRID_PADDING * 2) / GRID_SIZE);
  const frag = document.createDocumentFragment();
  for (let x = 0; x < maxCols; x++) {
    for (let y = 0; y < maxRows; y++) {
      const cell = document.createElement('div');
      cell.className = 'grid-position';
      cell.style.left = (GRID_PADDING + x * GRID_SIZE) + 'px';
      cell.style.top  = (GRID_PADDING + y * GRID_SIZE) + 'px';
      cell.dataset.gridX = x;
      cell.dataset.gridY = y;
      frag.appendChild(cell);
    }
  }
  gridContainer.appendChild(frag);
}

function showGrid() {
  ensureGrid();
  gridContainer.style.display = 'block';
}

function hideGrid() {
  if (gridContainer) {
    gridContainer.style.display = 'none';
    if (lastHighlightedCell) {
      lastHighlightedCell.classList.remove('highlight');
      lastHighlightedCell = null;
    }
  }
}

function highlightNearestGrid(clientX, clientY) {
  const gridPos = getGridPosition(clientX, clientY);
  const target = gridContainer?.querySelector(
    `[data-grid-x="${gridPos.x}"][data-grid-y="${gridPos.y}"]`
  );
  if (target !== lastHighlightedCell) {
    if (lastHighlightedCell) lastHighlightedCell.classList.remove('highlight');
    if (target) target.classList.add('highlight');
    lastHighlightedCell = target;
  }
}

// reorganizar iconos sin re-render total
function arrangeIcons() {
  folders.sort((a, b) => a.name.localeCompare(b.name));
  let x = 0, y = 0;
  const maxRows = Math.floor((window.innerHeight - 60 - GRID_PADDING * 2) / GRID_SIZE);

  for (const f of folders) {
    f.x = x; f.y = y;
    const el = desktop.querySelector(`.icon[data-name="${CSS.escape(f.name)}"]`);
    if (el) {
      el.style.left = (GRID_PADDING + f.x * GRID_SIZE) + 'px';
      el.style.top  = (GRID_PADDING + f.y * GRID_SIZE) + 'px';
    }
    y++;
    if (y >= maxRows) { y = 0; x++; }
  }
  rebuildPosIndex();
}

// inicialización tras cargar la página
document.addEventListener('DOMContentLoaded', () => {
  rebuildPosIndex();
  bindDesktopEventsOnce();
});
