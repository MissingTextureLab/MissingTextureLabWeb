// ============================
// mobile.js — adaptación táctil y grid reactivo (versión optimizada + viewport fix)
// ============================

export const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export function initMobileMode() {
  if (!isMobile) return;

  // Usa clase unificada para coherencia CSS
  document.body.classList.add("mobile-mode");

  // ===============================
  // 📏 Viewport Fix para móviles reales
  // ===============================
  function fixMobileViewport() {
    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    document.documentElement.style.setProperty("--real-vh", `${vh}px`);
  }

  fixMobileViewport();
  window.addEventListener("resize", fixMobileViewport);
  window.addEventListener("orientationchange", fixMobileViewport);

  // 1️⃣ Desactiva arrastres y zoom accidental
  document.addEventListener(
    "touchmove",
    e => {
      if (e.touches.length > 1) e.preventDefault();
    },
    { passive: false }
  );

  // 2️⃣ Sustituye doble clic por tap simple (abrir iconos / carpetas)
  document.addEventListener("click", e => {
    const card = e.target.closest(".file-card");
    if (card) {
      const data = card.dataset.file;
      if (data) {
        const file = JSON.parse(decodeURIComponent(data));
        if (file.kind !== "project" && typeof window.openFile === "function") {
          window.openFile(file);
        }
      }
    }
    const icon = e.target.closest(".icon");
    if (icon && typeof window.openFolder === "function") {
      const name = icon.textContent.trim();
      window.openFolder(name);
    }
  });

  // 3️⃣ Ajuste dinámico de grid + reposición de iconos
  adjustMobileGrid();
  repositionMobileIcons();

  window.addEventListener("resize", () => {
    adjustMobileGrid();
    repositionMobileIcons();
  });
  window.addEventListener("orientationchange", () => {
    adjustMobileGrid();
    repositionMobileIcons();
  });
}

// ============================
// 🔹 Ajusta el tamaño del grid dinámicamente
// ============================
function adjustMobileGrid() {
  // 🔸 Usa la variable real de viewport si existe
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  const vw = window.innerWidth;

  // También sincroniza la variable CSS global
  document.documentElement.style.setProperty("--real-vh", `${vh}px`);

  // 8 filas visibles aproximadamente
  const targetRows = 8;
  const gridSize = Math.floor(vh / targetRows);
  const padding = Math.floor(gridSize * 0.15);

  // Variables globales y CSS coherentes
  window.GRID_SIZE = gridSize;
  window.GRID_PADDING = padding;

  document.documentElement.style.setProperty("--grid-size", `${gridSize}px`);
  document.documentElement.style.setProperty("--grid-padding", `${padding}px`);
  document.documentElement.style.setProperty("--icon-size", `${gridSize * 0.7}px`);
}

// ============================
// 🔹 Reposiciona los iconos según el tamaño del viewport
// ============================
function repositionMobileIcons() {
  if (!window.folders || !document.getElementById("desktop")) return;

  const desktop = document.getElementById("desktop");
  const GRID_SIZE = window.GRID_SIZE || 100;
  const GRID_PADDING = window.GRID_PADDING || 10;
  const vw = window.innerWidth;
  const isWide = vw > 700; // tablets o landscape
  const cols = isWide ? 3 : 2; // en horizontal, tres columnas

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
    // máximo de filas antes de pasar a nueva columna
    const maxRows = isWide ? 6 : 8;
    if (y >= maxRows) {
      y = 0;
      x++;
      if (x >= cols) x = 0; // reinicia si hay más columnas
    }
  }
}

// ============================
// 🚀 Inicializa en load si es móvil
// ============================
if (isMobile) {
  window.addEventListener("load", initMobileMode);
}
