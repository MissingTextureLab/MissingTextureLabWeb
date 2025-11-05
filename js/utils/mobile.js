// ============================
// mobile.js — modo móvil adaptado
// ============================

export const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export function initMobileMode() {
  if (!isMobile) return;

  document.body.classList.add("mobile");

  // 🔹 Evita zoom con dos dedos o arrastres raros
  document.addEventListener("touchmove", e => {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  // 🔹 Click directo en iconos o tarjetas
  document.addEventListener("click", e => {
    const card = e.target.closest(".file-card");
    const icon = e.target.closest(".icon");

    // 👉 Si pulsa una tarjeta de archivo
    if (card) {
      const data = card.dataset.file;
      if (data && typeof window.openFile === "function") {
        const file = JSON.parse(decodeURIComponent(data));
        window.openFile(file);
      }
      return;
    }

    // 👉 Si pulsa un icono de carpeta en el escritorio
    if (icon && typeof window.openFolder === "function") {
      const folderName = icon.textContent.trim();
      window.openFolder(folderName);
      return;
    }
  });

  // 🔹 Ajusta tamaño del escritorio al viewport
  const desktop = document.getElementById('desktop');
  if (desktop) {
    Object.assign(desktop.style, {
      width: '100vw',
      height: 'calc(100vh - var(--taskbar-h, 48px))',
      position: 'fixed',
      top: '0',
      left: '0',
      overflow: 'hidden',
      zIndex: '1'
    });
  }

  // 🔹 Oculta la ventana del asistente si existe
  const assistant = document.querySelector(".window-assistant");
  if (assistant) assistant.style.display = "none";
}
