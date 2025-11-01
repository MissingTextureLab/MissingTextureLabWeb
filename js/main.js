import { renderDesktop } from './desktop.js';
import { initUI } from './ui.js';
import './windows.js';
import './files.js';      // ✅ tu nuevo sistema de archivos
import './movement1.js';


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