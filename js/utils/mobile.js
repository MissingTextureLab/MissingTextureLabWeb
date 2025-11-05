// ============================
// mobile.js — adaptación táctil y grid reactivo
// ============================

export const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export function initMobileMode() {
  if (!isMobile) return;

  document.body.classList.add("mobile");

  // 1️⃣ Evita arrastres de escritorio
  document.addEventListener("touchmove", e => {
    if (e.target.closest(".window") || e.target.closest(".icon")) {
      if (e.touches.length > 1) e.preventDefault(); // evita zoom y arrastre accidental
    }
  }, { passive: false });

  // 2️⃣ Reemplaza doble clic por tap
  document.addEventListener("click", e => {
    const card = e.target.closest(".file-card");
    if (card) {
      const data = card.dataset.file;
      if (data) {
        const file = JSON.parse(decodeURIComponent(data));
        if (file.kind === "project" && Array.isArray(file.links)) return;
        if (typeof window.openFile === "function") window.openFile(file);
      }
    }
    const icon = e.target.closest(".icon");
    if (icon && typeof window.openFolder === "function") {
      const name = icon.textContent.trim();
      window.openFolder(name);
    }
  });

  // 3️⃣ Ajusta automáticamente el tamaño del grid y los iconos
  adjustGridForMobile();
  window.addEventListener("resize", adjustGridForMobile);
  window.addEventListener("orientationchange", adjustGridForMobile);

  // 4️⃣ Recoloca iconos según tamaño de pantalla
  repositionIconsForMobile();
}

// ============================
// 🔹 Ajusta tamaño dinámico del grid
// ============================
function adjustGridForMobile() {
  const vh = window.innerHeight;
  const vw = window.innerWidth;

  // Queremos que quepan unos 8 iconos verticalmente
  const targetRows = 8;
  const gridSize = Math.floor(vh / targetRows);
  const padding = Math.floor(gridSize * 0.15);

  // Actualiza las variables globales si existen
  if (window.GRID_SIZE !== undefined) window.GRID_SIZE = gridSize;
  if (window.GRID_PADDING !== undefined) window.GRID_PADDING = padding;

  // Actualiza variables CSS para coherencia visual
  document.documentElement.style.setProperty('--grid-size', `${gridSize}px`);
  document.documentElement.style.setProperty('--grid-padding', `${padding}px`);
  document.documentElement.style.setProperty('--icon-size', `${gridSize * 0.7}px`);
}

// ============================
// 🔹 Reorganiza los iconos para pantallas pequeñas
// ============================
function repositionIconsForMobile() {
  if (!window.folders) return;

  const vw = window.innerWidth;
  const isWide = vw > 700; // si el móvil/tablet es ancho, usa dos columnas

  let x = 0, y = 0;
  const cols = isWide ? 2 : 1;

  window.folders.forEach((f, i) => {
    f.x = x;
    f.y = y;
    y++;
    if (y >= (isWide ? 8 : 10)) { // número de filas según orientación
      y = 0;
      x++;
    }
  });

  // Reposiciona los iconos visualmente
  const desktop = document.getElementById("desktop");
  if (!desktop) return;

  const GRID_SIZE = window.GRID_SIZE || 100;
  const GRID_PADDING = window.GRID_PADDING || 10;

  window.folders.forEach(f => {
    const el = desktop.querySelector(`.icon[data-name="${CSS.escape(f.name)}"]`);
    if (el) {
      el.style.left = `${GRID_PADDING + f.x * GRID_SIZE}px`;
      el.style.top  = `${GRID_PADDING + f.y * GRID_SIZE}px`;
    }
  });
}

if (isMobile) {
  window.addEventListener("load", () => {
    adjustMobileGrid();
    repositionMobileIcons();
    window.addEventListener("resize", () => {
      adjustMobileGrid();
      repositionMobileIcons();
    });
  });
}

function adjustMobileGrid() {
  const vh = window.innerHeight;
  const vw = window.innerWidth;

  // calcula tamaño ideal (8 filas visibles)
  const targetRows = 8;
  const gridSize = Math.floor(vh / targetRows);
  const padding = Math.floor(gridSize * 0.15);

  // aplica a variables globales y CSS
  window.GRID_SIZE = gridSize;
  window.GRID_PADDING = padding;
  document.documentElement.style.setProperty('--grid-size', `${gridSize}px`);
  document.documentElement.style.setProperty('--grid-padding', `${padding}px`);
}

function repositionMobileIcons() {
  if (!window.folders || !document.getElementById("desktop")) return;

  const desktop = document.getElementById("desktop");
  const GRID_SIZE = window.GRID_SIZE || 100;
  const GRID_PADDING = window.GRID_PADDING || 10;

  const vw = window.innerWidth;
  const isWide = vw > 700; // tablets o landscape
  const cols = isWide ? 2 : 1;

  let x = 0, y = 0;
  for (const f of window.folders) {
    f.x = x;
    f.y = y;

    const el = desktop.querySelector(`.icon[data-name="${CSS.escape(f.name)}"]`);
    if (el) {
      el.style.left = `${GRID_PADDING + f.x * GRID_SIZE}px`;
      el.style.top  = `${GRID_PADDING + f.y * GRID_SIZE}px`;
    }

    y++;
    if (y >= 8) { // máximo de filas visibles
      y = 0;
      x++;
      if (x >= cols) x = 0; // reset si hay más columnas
    }
  }
}

