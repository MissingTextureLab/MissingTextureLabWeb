export let folders = [

  { name: "Sobre mí",    x: 0, y: 0, icon: "icons/FolderMipcl.png",      type: "folder" },
  { name: "Proyectos",   x: 1, y: 0, icon: "icons/FolderVirtual.png",    type: "folder" },
  { name: "Currículum",   x: 2, y: 0, icon: "icons/foldertext.png",       type: "app", action: "openImageWindow"},

  { name: "Lab",         x: 0, y: 3, icon: "icons/FolderCode.png",       type: "app", action: "openLiveLabWindow" },
  { name: "Futuro",      x: 0, y: 4, icon: "icons/FolderRandom.png",     type: "folder" },

  // 🌐 Enlaces externos
  { name: "Instagram",   x: 0, y: 6, icon: "icons/FolderInstagram.png",  type: "link", url: "https://instagram.com/missingtexture_lab" },
  { name: "Github",      x: 1, y: 6, icon: "icons/FolderGithub.png",     type: "link", url: "https://github.com/MissingTextureLab" },
  { name: "Youtube",     x: 2, y: 6, icon: "icons/YoutubeFolder.png",    type: "link", url: "https://www.youtube.com/@missingtexture_lab" },

  { name: "Privado",     x: 3, y: 6, icon: "icons/FolderLocked.png",     type: "folder" },
  { name: "Ajustes", icon: "icons/FolderAjustes.png", type: "app", action: "openAppInfo" },
];

// —— Versión móvil —— //
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

if (isMobile) {
  folders = [
    { name: "Sobre mí",    icon: "icons/FolderMipcl.png",      type: "folder" },
    { name: "Proyectos",   x: 1, y: 0, icon: "icons/FolderVirtual.png",    type: "folder" },
    { name: "Currículum",   icon: "icons/foldertext.png",    type: "app", action: "openImageWindow"},
    { name: "Lab",         icon: "icons/FolderCode.png",       type: "app", action: "openLiveLabWindow" },
    { name: "Futuro",      icon: "icons/FolderRandom.png",     type: "folder" },
    // 🌐 Enlaces externos móviles también
    { name: "Instagram",   icon: "icons/FolderInstagram.png",  type: "link", url: "https://instagram.com/missingtexture_lab" },
    { name: "Github",      icon: "icons/FolderGithub.png",     type: "link", url: "https://github.com/MissingTextureLab" },
    { name: "Youtube",     icon: "icons/YoutubeFolder.png",    type: "link", url: "https://www.youtube.com/@missingtexture_lab" },
    { name: "Privado",     icon: "icons/FolderLocked.png",     type: "folder" },
    { name: "Ajustes", icon: "icons/FolderAjustes.png", type: "app", action: "openAppInfo" },
  ];

  // 🎚️ Ajuste general del grid e iconos
  const GRID_SCALE = 0.85; // ⬅️ reduce todo el grid (0.7 = más pequeño, 1.0 = pantalla completa)
  const ICON_SCALE = 1;  // ⬅️ tamaño relativo del icono dentro de su celda

  function distributeAppGrid() {
    const vw = window.innerWidth * GRID_SCALE;
    const vh = window.innerHeight * GRID_SCALE;
    const iconCount = folders.length;

    // 🔹 Fuerza siempre 3 columnas (4 si pantalla muy ancha)
    const aspect = vw / vh;
    let cols = 3;
    if (aspect > 1.3) cols = 4;

    const rows = Math.ceil(iconCount / cols);

    // 🔹 Calcula tamaño de celdas
    const cellW = vw / cols;
    const cellH = vh / rows;

    const iconW = cellW * ICON_SCALE;
    const iconH = cellH * ICON_SCALE;
    const offsetX = (cellW - iconW) / 2;
    const offsetY = (cellH - iconH) / 2;

    // 🔹 Asigna posiciones y aplica estilos
    let i = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (i >= iconCount) break;
        folders[i].x = x;
        folders[i].y = y;
        i++;
      }
    }

    const desktop = document.getElementById("desktop");
    if (desktop) {
      const icons = desktop.querySelectorAll(".icon");
      icons.forEach((el, idx) => {
        const f = folders[idx];
        if (!f) return;
        el.style.position = "absolute";
        el.style.left = `${f.x * cellW + offsetX + (window.innerWidth * (1 - GRID_SCALE)) / 2}px`;
        el.style.top  = `${f.y * cellH + offsetY + (window.innerHeight * (1 - GRID_SCALE)) / 4}px`;
        el.style.width = `${iconW}px`;
        el.style.height = `${iconH}px`;
        el.style.transition = "all 0.25s ease";
      });
    }
  }

  window.addEventListener("load", distributeAppGrid);
  window.addEventListener("resize", distributeAppGrid);
  window.addEventListener("orientationchange", distributeAppGrid);
}



// —— Persistencia simple en localStorage ——
const LS_KEY = "mtl_desktop_folders";

export function loadFolders() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) folders = parsed;
  } catch {}
}

export function saveFolders() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(folders));
  } catch {}
}

export function updateFolderPosition(name, x, y) {
  const f = folders.find(f => f.name === name);
  if (!f) return;
  f.x = x; f.y = y;
  saveFolders();
}
// Configuración de cuadrícula
export const GRID_SIZE = 100;
export const GRID_PADDING = 20;

