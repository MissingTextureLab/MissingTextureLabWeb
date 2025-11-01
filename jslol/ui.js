// ui.js — menú contextual, start menu, settings/shutdown, reloj y screensaver

import { arrangeIcons, getSelectedFolder } from './desktop.js';
import { openProperties } from './windows.js';

// ==== Selectores rápidos ====
const menu       = () => document.getElementById('desktop-menu');
const startBtn   = () => document.querySelector('.start-btn');
const startMenu  = () => document.getElementById('start-menu');
const clockEl    = () => document.getElementById('clock');
const screensaver = () => document.getElementById('screensaver');
const screensaverLogo = () => document.getElementById('screensaver-logo');

// ============================
// 🖱️ MENÚ CONTEXTUAL
// ============================

function showContextMenu(html, x, y) {
  const el = menu();
  if (!el) return;
  el.innerHTML = html;
  el.style.display = 'block';
  el.style.left = `${x}px`;
  el.style.top  = `${y}px`;
}

function hideContextMenu() {
  const el = menu();
  if (el) el.style.display = 'none';
}

function bindContextMenu() {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const icon = e.target.closest('.icon');

    // Si se clicó un icono
    if (icon) {
      const name = icon.dataset.name;
      showContextMenu(`
        <div class="context-menu-item" id="open-properties">🔍 Properties of ${name}</div>
        <div class="context-menu-item" id="arrange-icons">🧩 Arrange Icons</div>
      `, e.clientX, e.clientY);

      // Evento Properties
      document.getElementById('open-properties')?.addEventListener('click', () => {
        const sel = getSelectedFolder?.();
        if (sel) openProperties(sel);
        hideContextMenu();
      });

    // Si clicas en el fondo del escritorio
    } else {
      showContextMenu(`
        <div class="context-menu-item" id="arrange-icons">🧩 Arrange Icons</div>
      `, e.clientX, e.clientY);
    }
  });

  // Cualquier click fuera cierra
  document.addEventListener('click', hideContextMenu);

  // “Arrange Icons” — disponible en ambos contextos
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'arrange-icons') {
      arrangeIcons?.();
      hideContextMenu();
    }
  });
}

// ============================
// 🪟 START MENU
// ============================

function bindStartMenu() {
  const btn = startBtn();
  const sm = startMenu();
  if (!btn || !sm) return;

  btn.addEventListener('click', () => {
    sm.style.display = (sm.style.display === 'flex') ? 'none' : 'flex';
  });

  // Settings
  document.getElementById('settings')?.addEventListener('click', () => {
    alert('⚙️ Configuración del sistema\n\n• Tema visual\n• Tamaño de iconos\n• Comportamiento del escritorio');
    sm.style.display = 'none';
  });

  // Shutdown → screensaver
  document.getElementById('shutdown')?.addEventListener('click', () => {
    enterScreensaver(true);
    sm.style.display = 'none';
  });
}

// ============================
// ⏰ RELOJ
// ============================

function updateClock() {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12; h = h ? h : 12;

  const el = clockEl();
  if (el) el.textContent = `${h}:${m} ${ampm}`;
}

function initClock() {
  updateClock();
  setInterval(updateClock, 60000);
}

// ============================
// 💤 SCREENSAVER
// ============================

function enterScreensaver(isBoot = false) {
  // Cierra ventanas y vacía taskbar
  document.querySelectorAll('.window').forEach(w => w.remove());
  const tb = document.getElementById('taskbar');
  if (tb) tb.innerHTML = '';

  const s = screensaver();
  const logo = screensaverLogo();
  if (!s || !logo) return;

  s.classList.add('active');
  if (isBoot) s.classList.add('booting');

  // Reinicia animación
  logo.classList.remove('animate-in');
  void logo.offsetWidth;
  logo.classList.add('animate-in');
}

function exitScreensaver() {
  const s = screensaver();
  if (!s) return;
  s.classList.remove('active', 'booting', 'flash');
}

function bindScreensaver() {
  const logo = screensaverLogo();
  if (!logo) return;

  // Click → flash y salida
  logo.addEventListener('click', () => {
    const s = screensaver();
    if (!s) return;
    s.classList.add('flash');
    setTimeout(exitScreensaver, 220);
  });

  // Efecto visual click pop
  logo.addEventListener('click', () => {
    logo.classList.add('clicked');
    setTimeout(() => logo.classList.remove('clicked'), 150);
  });

  // Mostrar screensaver al arrancar
  document.addEventListener('DOMContentLoaded', () => {
    enterScreensaver(true);
  });
}

// ============================
// 🚀 INICIALIZACIÓN GLOBAL
// ============================

export function initUI() {
  bindContextMenu();
  bindStartMenu();
  initClock();
  bindScreensaver();
}
