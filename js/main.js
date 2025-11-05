import { renderDesktop } from './desktop.js';
import { initUI } from './ui.js';
import './windows.js';
import { arrangeIcons } from './utils/movement1.js';
import { initAbout3D } from './apps/about.js';
import { openLiveLabWindow } from './apps/live_lab.js';
import { initMobileMode } from './utils/mobile.js';


window.openLiveLabWindow = openLiveLabWindow;
initMobileMode();

export const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
if (isMobile) document.body.classList.add('mobile');

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
