import { renderDesktop } from './desktop.js';
import { initUI } from './ui.js';
import './windows.js';
import './movement1.js';
import { initAbout3D } from './about.js';


export const filesByFolder = {
  "About": [
    {
      name: "Sobre mí",
      kind: "app",
      action: () => initAbout3D()   // ✅ llama directamente a la función importada
    }
  ],
  // otras carpetas...
};

// Escucha eventos del sistema
window.addEventListener('taskbar:open-folder', (ev) => {
  const { name } = ev.detail || {};
  if (typeof openFolder === 'function' && name) {
    openFolder(name);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  renderDesktop();
  initUI();
});
