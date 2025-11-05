export let folders = [
  { name: "Sobre mí",                x: 0, y: 0, icon: "icons/FolderMipcl.png",  type: "folder" },
  { name: "Proyectos",               x: 1, y: 0, icon: "icons/FolderVirtual.png",   type: "folder" },
  {     name: "Lab",
    x: 0, y: 1,
    icon: "icons/FolderCode.png",
    type: "app",                
    action: "openLiveLabWindow"
  },  
  { name: "Educación",    x: 1, y: 1, icon: "icons/Foldertext.png",   type: "folder" },
  { name: "Futuro",x: 0, y: 2, icon: "icons/FolderRandom.png", type: "folder" },
 
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