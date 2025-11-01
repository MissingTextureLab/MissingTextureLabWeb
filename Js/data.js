export let folders = [
  { name: "VR y 3D",     x: 0, y: 0, icon: "icons/FolderVirtual.png", type: "folder", created: "2024-01-15", size: "15.2 MB", items: 24 },
  { name: "instalación", x: 1, y: 0, icon: "icons/FolderText.png",   type: "folder", created: "2024-01-08", size: "45.8 MB", items: 67 },
  { name: "Music",       x: 0, y: 1, icon: "icons/FoldeMusic.png",   type: "folder", created: "2024-02-10", size: "2.1 GB",  items: 156 },
  { name: "Code",        x: 0, y: 2, icon: "icons/FolderCode.png",    type: "folder", created: "2024-01-22", size: "850 MB",  items: 89 },
  { name: "Videos",      x: 0, y: 3, icon: "icons/FolderVideo.png",   type: "folder", created: "2024-03-05", size: "5.7 GB",  items: 42 },
  { name: "¿?",          x: 1, y: 1, icon: "icons/FolderRandom.png",  type: "folder", created: "2024-02-28", size: "12.4 GB", items: 8 },
  { name: "Readme",      x: 1, y: 2, icon: "icons/FolderMipcl.png",   type: "file",   created: "2024-03-15", size: "2.4 KB",  items: 1 }
];

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
export const GRID_SIZE = 110;
export const GRID_PADDING = 20;