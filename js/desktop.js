import { folders, GRID_SIZE, GRID_PADDING } from './data.js';
import { openFolder, initFiles } from './files.js';
import { initAssistant } from './assistant.js';

initAssistant();
initFiles();

const desktop = document.getElementById('desktop');
let selectedFolder = null;

export function renderDesktop() {
  desktop.innerHTML = '';

  folders.forEach(folder => {
    const icon = document.createElement('div');
    icon.className = 'icon';
    icon.draggable = true;
    icon.dataset.name = folder.name;

    icon.innerHTML = `
      <img src="${folder.icon}" class="icon-img" alt="${folder.name}">
      <span>${folder.name}</span>
    `;

    // Posición
    icon.style.left = `${GRID_PADDING + folder.x * GRID_SIZE}px`;
    icon.style.top = `${GRID_PADDING + folder.y * GRID_SIZE}px`;

    // Selección
    icon.addEventListener('click', e => {
      if (e.detail === 2) return;
      document.querySelectorAll('.icon').forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
      selectedFolder = folder.name;
    });

    // Doble clic -> abrir
    icon.addEventListener('dblclick', () => openFolder(folder.name));

    desktop.appendChild(icon);
  });
}

// ❌ Eliminado el listener global “desktop.addEventListener('dblclick', …)”
// porque ya tenemos el de cada icono individual.

export function getSelectedFolder() {
  if (!selectedFolder) return null;
  return folders.find(f => f.name === selectedFolder) || null;
}

export { arrangeIcons } from './movement1.js';
