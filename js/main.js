// main.js — versión estable
import { renderDesktop } from './desktop.js';
import { initUI } from './ui.js';
import './windows.js';
import { arrangeIcons } from './utils/movement1.js';
import { initAbout3D } from './apps/about.js';
import { openLiveLabWindow } from './apps/live_lab.js';
import { initMobileMode } from './utils/mobile.js';

initMobileMode();
window.openLiveLabWindow = openLiveLabWindow;

// Detectar móvil
export const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
if (isMobile) document.body.classList.add('mobile');

// Archivos por carpeta (ejemplo)
export const filesByFolder = {
  "About": [
    {
      name: "Sobre mí",
      kind: "app",
      action: () => initAbout3D()
    }
  ]
};

// Escuchar eventos del sistema
window.addEventListener('taskbar:open-folder', (ev) => {
  const { name } = ev.detail || {};
  if (typeof openFolder === 'function' && name) {
    openFolder(name);
  }
});

// === ARRANQUE ===
document.addEventListener('DOMContentLoaded', () => {
  renderDesktop();
  initUI();

  // 🟣 Forzar screensaver activo tras render inicial
  const s = document.getElementById('screensaver');
  if (s && !s.classList.contains('active')) {
    s.classList.add('active', 'booting');
  }

  // 🔄 Esperar hasta que la función exista antes de ejecutarla
  let tries = 0;
  const waitForScreensaver = setInterval(() => {
    if (typeof window.startThreeScreensaver === 'function') {
      clearInterval(waitForScreensaver);
      window.startThreeScreensaver();
      console.log('🚀 startThreeScreensaver() inicializado correctamente');
    } else if (tries++ > 20) { // después de ~2 s aborta
      clearInterval(waitForScreensaver);
      console.warn('⚠️ No se pudo iniciar startThreeScreensaver()');
    }
  }, 100);
});
