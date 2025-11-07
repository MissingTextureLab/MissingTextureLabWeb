import { folders } from './data.js';
import { bringToFront, addToTaskbar,normalizeName } from './windows.js';

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const gridEl = document.getElementById('grid-overlay');
let activeWindow = null;
let offsetX = 0;
let offsetY = 0;

// ========= Viewport Fix para móviles reales =========
function applyViewportFix() {
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  document.documentElement.style.setProperty('--real-vh', `${vh}px`);
}

applyViewportFix();
window.addEventListener('resize', applyViewportFix);
window.addEventListener('orientationchange', applyViewportFix);

// ✅ Definición segura antes de usarla
function safeQueryAllGrid(selector) {
  const el = document.getElementById('grid-overlay');
  if (!(el instanceof Element)) return [];
  try {
    return el.querySelectorAll(selector);
  } catch {
    return [];
  }
}
// 1) Define aquí los archivos por carpeta (edítalo a tu gusto)
const filesByFolder = {
  

  "Proyectos": [
    {
      category: "Música y sonido",
      name: "Expo María",
      kind: "project",
      subtitle: "Música para exposición · 2023",
      thumb: "https://bbaa.usal.es/wp-content/uploads/2022/06/eae_la-_folklorika_01.jpg",
      links: [
        { label: "Artículo", kind: "site", host: "web", url: "https://bbaa.usal.es/actividades/la-folklorica" },
        { label: "Spotify", kind: "song", host: "spotify", url: "https://open.spotify.com/intl-es/album/5TOZnTc0jaTr3m4ESH4OAU" }
      ]
    },
    {
      category: "Música y sonido",
      name: "Música Tati",
      kind: "song",
      host: "spotify",
      url: "https://",
      subtitle: "Composición original"
    },
    {
      category: "Música y sonido",
      name: "Hackaton",
      kind: "link",
      host: "web",
      url: "https://valenciaplaza.com/musica-opera-valencia-comunitat-valenciana/la-music-hackaton-de-valencia-transforma-las-naves-en-un-estudio-de-experimentacion-sonora",
      thumb: "//d31u1w5651ly23.cloudfront.net/articulos/articulos-312842.jpg",
      subtitle: "Evento experimental · Las Naves"
    },
    {
      category: "Música y sonido",
      name: "Modul",
      kind: "link",
      host: "web",
      url: "https://www.instagram.com/p/DEflCYvsHDh/?img_index=4",
      thumb: "https://drive.google.com/uc?export=view&id=1BQ8-DwEkPk2sArQoRh-p1c-tgmit05Hj",
      subtitle: "Instalación VR · 2024"
    },

    {
      category: "Audiovisual y videoarte",
      name: "Con esos ojitos",
      kind: "video",
      host: "youtube",
      url: "https://www.youtube.com/watch?v=df1wnWwtuQc"
    },
    {
      category: "Audiovisual y videoarte",
      name: "Windows 66",
      kind: "video",
      host: "youtube",
      url: "https://www.youtube.com/watch?v=yalKehB3IYo"
    },
    {
      category: "Audiovisual y videoarte",
      name: "Segunda intermisión",
      kind: "video",
      host: "youtube",
      url: "https://youtu.be/wGGo4pKWG84?si=Lm6oeCQsIzO19Ddm"
    },
    {
      category: "Audiovisual y videoarte",
      name: "Sometimes U Can't Trust In What Seems Real",
      kind: "video",
      host: "youtube",
      url: "https://youtu.be/O80O1P7qKXg?si=ll1zQ6nGrevnqw94",
      minTitleSize: 8.5
    },
    {
      category: "Audiovisual y videoarte",
      name: "Videoarte Sahara",
      kind: "video",
      host: "youtube",
      url: ""
    },

    {
      category: "Performance y directo",
      name: "Volumens Festival 2023",
      kind: "link",
      host: "web",
      url: "https://volumens.es/vo7-2023"
    },
    {
      category: "Performance y directo",
      name: "Volumens Ecosystem 2024",
      kind: "link",
      host: "web",
      url: "https://volumens.es/2024-ecosystem"
    },
    {
      category: "Performance y directo",
      name: "Videomapping CCCC",
      kind: "link",
      host: "web",
      url: "https://www.consorcimuseus.gva.es/actividades/videomapping-al-cccc-ciutat-glitch/?lang=es"
    },
    {
      category: "Performance y directo",
      name: "VR Sporting Club Ruzafa",
      kind: "link",
      host: "web",
      url: "https://www.facebook.com/masterAVM/posts/este-viernes-17022023-en-sporting-club-ruzafa-de-valencia-sound-no-sound-23-prop/584907886984629"
    },

    {
      category: "Instalación y VR",
      name: "Cyclops",
      kind: "link",
      host: "web",
      url: "",
      thumb: "https://drive.google.com/uc?export=view&id=1ju5mwsBQGtaA52hmnRGPQd9QA9LAQiA8"
    },
    {
      category: "Instalación y VR",
      name: "The Missing Archive",
      kind: "link",
      host: "web",
      url: "",
      thumb: "https://drive.google.com/uc?export=view&id=15K-gh0BFH97IWhGvxmGfEv2fTD2lu5ht"
    },
    {
      category: "Instalación y VR",
      name: "Nobody Is An Island",
      kind: "link",
      host: "web",
      url: "https://www.instagram.com/p/C38S6ttijD6/?img_index=1",
      thumb: "https://drive.google.com/uc?export=view&id=1BL2Kt9zuBodDraxHQEBbeLPP28c7NGxG"
    },
    {
      category: "Instalación y VR",
      name: "Hand Tracking VR",
      kind: "link",
      host: "web",
      url: ""
    },
    {
      category: "Instalación y VR",
      name: "Cuadro 3D",
      kind: "link",
      host: "web",
      url: "https://www.instagram.com/p/Cr9MiedogPW/?img_index=1",
      thumb: "https://drive.google.com/uc?export=view&id=1OYTo87y1dYFFA8KCDdaKhMk39g1mAkdO"
    },

    {
      category: "Código y experimentación",
      name: "P5.js y P5.xr",
      kind: "project",
      host: "web",
      url: "https://editor.p5js.org/lanesvm/sketches"
    },
    {
      category: "Código y experimentación",
      name: "Aplicación móvil Abletone",
      kind: "project",
      host: "web",
      url: ""
    },
    {
      category: "Código y experimentación",
      name: "Ajedrez Chess",
      kind: "project",
      host: "web",
      url: ""
    },

    {
      category: "Documentación y renders",
      name: "Render Sala VR",
      kind: "photo",
      host: "drive",
      url: "https://drive.google.com/file/d/1ZyxWVUTSRQponMLKJIHGFEDCBA/view?usp=sharing"
    }
  ]
};

// pasar a .json (hot reloads)

// 2) Helpers para IDs/embeds
function getYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    return u.searchParams.get("v");
  } catch { return null; }
}
function getSpotifyInfo(url) {
  try {
    // Formato URI: spotify:track:ID (o album/playlist/show/episode)
    if (url.startsWith('spotify:')) {
      const [, type, id] = url.split(':');
      const ok = ['track','album','playlist','show','episode'].includes(type);
      if (ok && id) return { type, id };
      return null;
    }

    // URLs web
    const u = new URL(url);
    let parts = u.pathname.split('/').filter(Boolean); // p.ej. ["intl-es","track","ID"] o ["track","ID"]

    // Normaliza prefijos opcionales
    if (parts[0] && parts[0].startsWith('intl-')) parts.shift(); // /intl-es/
    if (parts[0] === 'embed') parts.shift();                     // /embed/track/ID

    // Tipo e ID
    let type = parts[0];
    let id = parts[1];

    // Tipos soportados
    const allowed = ['track','album','playlist','show','episode'];
    if (allowed.includes(type) && id) return { type, id };

    // Fallback por si hay algo raro
    const m = u.pathname.match(/\/(track|album|playlist|show|episode)\/([A-Za-z0-9]+)/);
    if (m) return { type: m[1], id: m[2] };
  } catch {}
  return null;
}

function getDriveId(url) {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\/file\/d\/([^/]+)/);
    if (m) return m[1];
    return u.searchParams.get("id");
  } catch { return null; }
}

// 3) Thumbnails
function normalizeDriveImage(url, size = 'w640-h360') {
  try {
    const u = new URL(url, location.href);
    let id = null;

    // /file/d/ID/...
    const m = u.pathname.match(/\/file\/d\/([^/]+)/);
    if (m) id = m[1];

    // ...o ?id=ID
    if (!id) id = u.searchParams.get('id');

    if (!id) return url; // no parece de Drive, devuélvelo tal cual

    // Opción 1 (recomendada): thumbnail con tamaño (16:9 en ejemplo)
    // Cambia ‘w640-h360’ por lo que prefieras (wX-hY)
    return `https://drive.google.com/thumbnail?id=${id}&sz=${size}`;

    // Opción 2 (comentada): imagen “full” sin forzar tamaño
    // return `https://drive.google.com/uc?export=view&id=${id}`;
  } catch {
    return url;
  }
}

const spotifyThumbCache = new Map();
async function getSpotifyThumb(url) {
  const info = getSpotifyInfo(url);
  if (!info) return null;
  if (spotifyThumbCache.has(info.id)) return spotifyThumbCache.get(info.id);
  try {
    const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    const thumb = data.thumbnail_url || null;
    if (thumb) spotifyThumbCache.set(info.id, thumb);
    return thumb;
  } catch { return null; }
}
function getYouTubeThumb(url) {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}
function getDriveThumb(url) {
  const id = getDriveId(url);
  return id ? `https://drive.google.com/thumbnail?id=${id}` : null;
}
function placeholderThumb(kind) {
  const svg = kind === "song" ? "🎵" : kind === "video" ? "🎬" : "🖼️";
  const bg  = kind === "song" ? "#e9d5ff" : kind === "video" ? "#cffafe" : "#fde68a";
  return "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'>
       <rect width='100%' height='100%' fill='${bg}'/>
       <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='36'>${svg}</text>
     </svg>`
  );
}
async function ensureThumb(file, imgEl) {

  if (file.thumb) {
    // ⬇️ Normaliza si es de Drive; si no, lo deja tal cual
    const maybeDrive = /drive\.google\.com/.test(file.thumb);
    imgEl.src = maybeDrive ? normalizeDriveImage(file.thumb, 'w320-h180')
                           : file.thumb;
    return;
  }

  imgEl.src = placeholderThumb(file.kind);
  let real = null;
  if (file.host === "youtube") real = getYouTubeThumb(file.url);
  else if (file.host === "drive") real = getDriveThumb(file.url);
  else if (file.host === "spotify") real = await getSpotifyThumb(file.url);
  if (real) imgEl.src = real;
}

// 4) Embeds
function getEmbedHTML(file) {

  
  if (file.host === "youtube") {
    const id = getYouTubeId(file.url);
    if (!id) return `<p>No se pudo cargar YouTube.</p>`;
    return `<iframe
      src="https://www.youtube.com/embed/${id}?rel=0&modestbranding=1"
      title="${file.name}"
      style="width:100%;height:100%;display:block;border:0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    ></iframe>`;
  }

  if (file.host === "spotify") {
  const info = getSpotifyInfo(file.url);
  if (!info) return `<p>No se pudo cargar Spotify: URL no reconocida.</p>`;

  const baseByType = { track: 152, album: 352, playlist: 352, show: 232, episode: 232 };
  const baseH = baseByType[info.type] ?? 352;

    return `
    <iframe
        class="spoti-frame"
        src="https://open.spotify.com/embed/${info.type}/${info.id}"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        style="width:100%; height:${baseH}px; border:0; display:block; border-radius:12px"
        data-baseheight="${baseH}"
    ></iframe>`;
    }

  if (file.host === "drive") {
    const id = getDriveId(file.url);
    if (!id) return `<p>No se pudo cargar Google Drive.</p>`;
    if (file.kind === "photo") {
      return `<img
        src="https://drive.google.com/uc?export=view&id=${id}"
        alt="${file.name}"
        style="max-width:100%;height:auto;display:block;border:0"
      />`;
    } else {
      return `<iframe
        src="https://drive.google.com/file/d/${id}/preview"
        style="width:100%;height:100%;display:block;border:0"
        allow="autoplay"
      ></iframe>`;
    }
  }
  return `<p>Fuente no soportada.</p>`;
}


// 5) Ventana de archivo (embed)
function slug(s){ return s.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,''); }
function openFile(file) {
  // Si el archivo es "Sobre mí", abrimos la ventana personalizada
  

  // resto de tus condiciones normales
  if (file.type === "folder") {
    openFolder(file.name);
  }

  if (file.host === "web") {
    if (file.url && file.url.trim() !== "") {
      window.open(file.url, "_blank"); // abre en pestaña nueva
    } else {
      alert("Este enlace no tiene URL definida.");
    }
    return; // 🔑 MUY IMPORTANTE: no sigue, no genera ventana
  }
  
  const wId = `file-${(file.name || '').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]/g,'')}`;
  let win = document.getElementById(`win-${wId}`);
  if (win) { win.style.display = 'block'; bringToFront(win); return; }

  const isSpotify = file.host === 'spotify';
  const needsAspect = (file.host === 'youtube') || (file.host === 'drive' && file.kind === 'video');

  win = document.createElement('div');
  // 👉 SOLO Spotify usa su propia clase (sin window-media)
  win.className = isSpotify ? 'window window-spotify' : 'window window-media';
  if (file.kind === 'photo') win.classList.add('window-photo');
  win.id = `win-${wId}`;

  const header = document.createElement('div');
  header.className = 'window-header';
  header.innerHTML = `
    <span>${file.name}</span>
    <div class="window-buttons">
      <span class="min-btn">_</span>
      <span class="max-btn">□</span>
      <span class="close-btn">✕</span>
    </div>`;

  const content = document.createElement('div');
  content.className = 'window-content';

  // 👉 Contenido: Spotify sin wrappers; resto como antes
  content.innerHTML = isSpotify
    ? getEmbedHTML(file)                             // sin embed-fill (alto fijo)
    : `<div class="embed-fill">${getEmbedHTML(file)}</div>`;

  win.appendChild(header);
  win.appendChild(content);
  document.body.appendChild(win);

  // === Comportamiento específico para SPOTIFY (tamaño fijo por contenido) ===
  if (isSpotify) {
    // Tipo y dimensiones base del widget
    const info = getSpotifyInfo(file.url) || { type: 'album' };
    const baseH = ({ track:152, album:352, playlist:352, show:232, episode:232 }[info.type]) || 352;
    const baseW = ({ track:640, album:860, playlist:860, show:720, episode:720 }[info.type]) || 860;

    // Altura real del header (por si cambia en CSS)
    const headerH = Math.round(header.getBoundingClientRect().height || 32);

    // Ventana del tamaño del embed + barra
    const W = Math.min(baseW, window.innerWidth - 40);
    const H = Math.min(baseH + headerH, window.innerHeight - 40);

    // Ajustes visuales y bloqueo de resize
    win.style.width  = W + 'px';
    win.style.height = H + 'px';
    win.style.left   = Math.max(0, (window.innerWidth  - W) / 2) + 'px';
    win.style.top    = Math.max(0, (window.innerHeight - H) / 2) + 'px';
    win.style.display = 'block';
    win.style.resize = 'none'; // 

    // El contenido no debe añadir padding/fondos que cambien el alto útil
    content.style.padding = '0';
    content.style.background = 'transparent';
    content.style.overflow = 'hidden';

    // Oculta el botón de maximizar y anula su handler
    const maxBtn = header.querySelector('.max-btn');
    if (maxBtn) maxBtn.style.display = 'none';

    bringToFront(win);

    // Botones básicos y drag
    header.querySelector('.close-btn').addEventListener('click', () => win.remove());
    
    header.querySelector('.min-btn').addEventListener('click', () => { win.style.display = 'none'; });
    
    header.addEventListener('mousedown', e => {
      if (e.target.closest('.window-buttons')) return;
      activeWindow = win;
      offsetX = e.clientX - win.getBoundingClientRect().left;
      offsetY = e.clientY - win.getBoundingClientRect().top;
      bringToFront(win);
    });
    if (isMobile) {
    win.style.position = 'fixed';
    win.style.inset = '0';
    win.style.width = '100vw';
    win.style.height = '100vh';
    win.style.borderRadius = '0';
    win.style.zIndex = 9999;
    win.style.overflow = 'auto';
    }
    return; // 
  }

  // === LAYOUT GENÉRICO (YouTube/Drive/Foto) ===
  const headerH = header.offsetHeight || 40;
  const baseW = Math.min(960, Math.floor(window.innerWidth * 0.9));
  const contentH = needsAspect
    ? Math.round(baseW * 9 / 16)
    : Math.min(640, Math.floor(window.innerHeight * 0.7)) - headerH;
  const totalH = Math.min(contentH + headerH, window.innerHeight - 40);

  win.style.width  = baseW + 'px';
  win.style.height = totalH + 'px';
  win.style.left   = Math.max(0, (window.innerWidth  - baseW) / 2) + 'px';
  win.style.top    = Math.max(0, (window.innerHeight - totalH) / 2) + 'px';
  win.style.display = 'block';

  bringToFront(win);

  // Botones
  header.querySelector('.close-btn').addEventListener('click', () => win.remove());
  header.querySelector('.min-btn').addEventListener('click', () => { win.style.display = 'none'; });

  let maximized = false;
  header.querySelector('.max-btn').addEventListener('click', () => {
    if (!maximized) {
      win.dataset.prev = JSON.stringify({ left: win.style.left, top: win.style.top, width: win.style.width, height: win.style.height });
      win.style.left = 0; win.style.top = 0;
      win.style.width = window.innerWidth + 'px';
      win.style.height = (window.innerHeight - 40) + 'px';
      maximized = true;
    } else {
      const prev = JSON.parse(win.dataset.prev);
      win.style.left = prev.left; win.style.top = prev.top;
      win.style.width = prev.width; win.style.height = prev.height;
      maximized = false;
    }
  });

  if (!isMobile) {
    header.addEventListener('mousedown', e => {
      if (e.target.closest('.window-buttons')) return;
      startDrag(windowEl, e);
    });
  }
}

// 6) Sobrescribe openFolder para listar archivos con miniaturas
function badgeFor(file){
  const t = file.kind === 'song' ? 'Song' : file.kind === 'video' ? 'Video' : 'Photo';
  const h = file.host[0].toUpperCase() + file.host.slice(1);
  return `${t} · ${h}`;
}

// Mapeo de iconos por host o tipo
function iconFor(file) {
  if (file.host === "spotify") return "🎵";
  if (file.host === "youtube") return "🎥";
  if (file.host === "drive") return "📸";
  if (file.host === "web") return "🌐";
  return "🔗";
}
// Marca .no-links si la tarjeta no tiene botones de link
function markNoLinksFor(gridEl) {
  if (!gridEl) return;
  const apply = () => {
    gridEl.querySelectorAll('.file-card').forEach(card => {
      const links = card.querySelector('.file-links');
      if (links && links.children.length === 0) card.classList.add('no-links');
      else card.classList.remove('no-links');
    });
  };
  apply();
  const mo = new MutationObserver(apply);
  if (gridEl instanceof Node) {
    mo.observe(gridEl, { childList: true, subtree: false });
  }
}

// ============ Escalado automático y ajuste de nombres ============
function attachCardScaler(gridEl) {
  if (!(gridEl instanceof Element)) return; // Evita errores de tipo

  // --- Función interna: calcula escala de cada tarjeta ---
  function computeScaleFor(card) {
    if (!(card instanceof Element)) return;
    const baseW = parseFloat(getComputedStyle(card).getPropertyValue('--base-w')) || 240;
    const w = card.clientWidth || baseW;
    const s = Math.max(1, Math.min(1.8, w / baseW));
    card.style.setProperty('--scale', s);
  }

  // --- Recalcula todas las tarjetas del grid ---
  function updateAll() {
    requestAnimationFrame(() => {
      const cards = gridEl.querySelectorAll('.file-card');
      if (!cards.length) return;
      cards.forEach(computeScaleFor);
      fitAllNames(gridEl);
    });
  }

  // --- Observadores reactivos ---
  try {
    const ro = new ResizeObserver(updateAll);
    ro.observe(gridEl);
  } catch (err) {
    console.warn('ResizeObserver no disponible:', err);
  }

  const mo = new MutationObserver(updateAll);
  mo.observe(gridEl, { childList: true, subtree: false });

  // --- Recalcula al cargar imágenes ---
  gridEl.querySelectorAll('img').forEach(img => {
    if (!img.complete) {
      img.addEventListener('load', updateAll, { once: true });
      img.addEventListener('error', updateAll, { once: true });
    }
  });

  // --- Primer ajuste ---
  updateAll();
}






// ---- Subtítulo por defecto (si no lo pones tú) ----
function prettyHost(host){
  const map = { youtube:'YouTube', spotify:'Spotify', drive:'Drive', web:'Web' };
  if (!host) return '—';
  return map[host] || (host[0].toUpperCase() + host.slice(1));
}
function prettyKind(kind){
  const map = { song:'Canción', video:'Vídeo', photo:'Foto', project:'Proyecto', link:'Enlace' };
  return map[kind] || 'Ítem';
}
function computeSubtitle(file){
  if (file.subtitle && String(file.subtitle).trim() !== '') return file.subtitle.trim();
  const parts = [];
  if (file.category && String(file.category).trim() !== '') parts.push(String(file.category).trim());
  else parts.push(prettyKind(file.kind));
  if (file.host) parts.push(prettyHost(file.host));
  return parts.join(' · ');
}

// ---- Ajuste de título+subtítulo sin cortes (ancho y altura) ----
function fitNamesInCard(card){
  const nameEl = card.querySelector('.file-name');
  const subEl  = card.querySelector('.file-subtitle');
  const meta   = card.querySelector('.file-meta');
  if (!nameEl || !subEl || !meta) return;

  // Tamaños base desde el CSS (solo la primera vez)
  if (!nameEl.dataset.baseFontSize) {
    nameEl.dataset.baseFontSize = getComputedStyle(nameEl).fontSize || '40px';
  }
  const forced = nameEl.dataset.forceSize ? parseFloat(nameEl.dataset.forceSize) : null;
  const strict = nameEl.dataset.forceStrict === '1';
  const minAttr = nameEl.dataset.minSize ? parseFloat(nameEl.dataset.minSize) : NaN;
  const MIN = Number.isFinite(minAttr) ? minAttr : 12;
  const BASE = forced ?? parseFloat(nameEl.dataset.baseFontSize);

  // Función utilitaria
  const parentWidth = () => (nameEl.parentElement?.clientWidth || nameEl.clientWidth) - 6;
  const fitsMeta = () => meta.scrollHeight <= meta.clientHeight + 1;

  // Estado inicial: 1 línea, tamaño base
  nameEl.style.whiteSpace = 'nowrap';
  nameEl.style.fontSize = BASE + 'px';

  if (strict && forced) {
    // Solo ajusta subtítulo relativo y salir
    const namePx = parseFloat(getComputedStyle(nameEl).fontSize) || 16;
    subEl.style.display = subEl.textContent.trim() ? 'block' : 'none';
    subEl.style.whiteSpace = 'normal';
    subEl.style.overflow = 'visible';
    subEl.style.textOverflow = 'clip';
    subEl.style.fontSize = Math.max(10, Math.round(namePx * 0.78)) + 'px';
    subEl.style.lineHeight = '1.2';
    subEl.style.marginTop = '2px';
    return;
  }

  // 1) ENCAJAR EN ANCHO (1 línea)
  if (nameEl.scrollWidth > parentWidth()){
    let lo = MIN, hi = BASE, best = lo;
    for (let i=0; i<8; i++){
      const mid = (lo + hi) / 2;
      nameEl.style.fontSize = mid + 'px';
      if (nameEl.scrollWidth <= parentWidth()){ best = mid; lo = mid; } else { hi = mid; }
    }
    nameEl.style.fontSize = Math.max(MIN, Math.floor(best*10)/10) + 'px';
  }

  // 2) SUBTÍTULO relativo al título
  const namePxNow = parseFloat(getComputedStyle(nameEl).fontSize) || 16;
  subEl.style.display = subEl.textContent.trim() ? 'block' : 'none';
  subEl.style.whiteSpace = 'normal';
  subEl.style.overflow = 'visible';
  subEl.style.textOverflow = 'clip';
  subEl.style.fontSize = Math.max(10, Math.round(namePxNow * 0.78)) + 'px';
  subEl.style.lineHeight = '1.2';
  subEl.style.marginTop = '2px';

  // 3) ENCAJAR EN ALTURA (si el bloque meta se desborda)
  if (!fitsMeta()){
    // permitir wrap en el título para ganar altura efectiva
    nameEl.style.whiteSpace = 'normal';

    // intenta con tamaño base (más legible) y baja hasta que quepa
    nameEl.style.fontSize = BASE + 'px';

    let lo = MIN, hi = BASE, best = lo;
    for (let i=0; i<10; i++){
      const mid = (lo + hi) / 2;
      nameEl.style.fontSize = mid + 'px';
      subEl.style.fontSize = Math.max(10, Math.round(mid * 0.78)) + 'px';
      if (fitsMeta()){ best = mid; lo = mid; } else { hi = mid; }
    }

    // Ajuste final
    nameEl.style.fontSize = Math.max(MIN, Math.floor(best*10)/10) + 'px';

    // Si aún no cabe (titular extremo), última reducción hasta MIN
    if (!fitsMeta()){
      nameEl.style.fontSize = MIN + 'px';
      subEl.style.fontSize = Math.max(10, Math.round(MIN * 0.78)) + 'px';
    }
  }
}


function fitAllNames(scopeEl) {
  if (!scopeEl) return;
  scopeEl.querySelectorAll('.file-name').forEach(n => {
    fitTextToWidth(n);
    const sub = n.parentElement?.querySelector('.file-subtitle');
    if (!sub) return;

    const hasText = !!sub.textContent && sub.textContent.trim() !== '';
    if (!hasText) {
      sub.style.display = 'none';
      return;
    }

    sub.style.display = 'block';
    const namePx = parseFloat(getComputedStyle(n).fontSize) || 16;
    const subSize = Math.max(10, Math.round(namePx * 0.75));
    sub.style.fontSize = subSize + 'px';
    sub.style.lineHeight = '1.2';
    sub.style.opacity = '.8';
    sub.style.marginTop = '2px';
    sub.style.whiteSpace = 'nowrap';
    sub.style.overflow = 'hidden';
    sub.style.textOverflow = 'ellipsis';
  });
}

window.fitAllNames = fitAllNames; // opcional, por compatibilidad global


function encodeData(obj){
  try { return encodeURIComponent(JSON.stringify(obj)); } catch { return ''; }
}
function decodeData(str){
  try { return JSON.parse(decodeURIComponent(str || '')); } catch { return null; }
}

// ============ Categorías ============
function categoryFor(file){
  if (file.category && String(file.category).trim() !== '') return String(file.category).trim();
  const byKind = { song:'Música', video:'Vídeo', photo:'Fotos', project:'Proyectos', link:'Enlaces' };
  if (file.kind && byKind[file.kind]) return byKind[file.kind];
  if (file.host) return file.host.charAt(0).toUpperCase() + file.host.slice(1);
  return 'Sin categoría';
}
function groupByCategoryStable(files){
  const map = new Map();
  for (const f of files){
    const key = categoryFor(f);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(f);
  }
  return map;
}
function injectCategoryStylesOnce(){
  const id = 'category-sections-style';
  if (document.getElementById(id)) return;
  const st = document.createElement('style');
  st.id = id;
  st.textContent = `
    .category-section{ margin:16px 8px 14px; padding-top:10px; border-top:1px solid var(--frutiger-glass-border, rgba(168,85,247,.3)); }
    .category-title{ display:flex; align-items:baseline; gap:8px; font-weight:600; margin:0 2px 8px 2px; opacity:.95; letter-spacing:.2px; }
    .category-title small{ opacity:.6; font-weight:400; }
    .category-grid{ contain: layout style paint; } /* micro-opt GPU */
    /* Activa UNA fila con scroll horizontal si lo deseas:
    .file-grid.row-one-line{
      display:grid; grid-auto-flow:column; grid-auto-columns:minmax(240px, 1fr);
      overflow-x:auto; overflow-y:visible; gap:var(--grid-gap, 12px); padding-bottom:4px; scroll-snap-type:x proximity;
    }
    .file-grid.row-one-line .file-card{ scroll-snap-align:start; }
    */
  `;
  document.head.appendChild(st);
}

// ============ Tipografía: ajuste O(log n) ============
function fitTextToWidth(el){
  
  if (!el) return;

  const forced = el.dataset.forceSize ? parseFloat(el.dataset.forceSize) : null;
  const strict = el.dataset.forceStrict === '1';
  const minSizeAttr = el.dataset.minSize ? parseFloat(el.dataset.minSize) : NaN;
  const MIN = Number.isFinite(minSizeAttr) ? minSizeAttr : 15;

  if (!el.dataset.baseFontSize) {
    el.dataset.baseFontSize = getComputedStyle(el).fontSize || '30px';
  }
  const base = forced ?? parseFloat(el.dataset.baseFontSize) ;

  if (forced && strict){
    el.style.fontSize = forced + 'px';
    return;
  }

  // Búsqueda binaria para un único reflow por paso (tope ~8 iteraciones)
  let lo = MIN, hi = base, best = MIN;
  // Si base < MIN, sube límites
  if (hi < lo) { hi = lo; }
  const parentWidth = (el.parentElement?.clientWidth || el.clientWidth) - 10;

  // Si con base ya cabe, aplícalo
  el.style.fontSize = base + 'px';
  if (el.scrollWidth <= parentWidth){
    return;
  }

  for (let i=0; i<8; i++){
    const mid = (lo + hi) / 2;
    el.style.fontSize = mid + 'px';
    if (el.scrollWidth <= parentWidth){
      best = mid; lo = mid; // cabe → intenta más grande
    } else {
      hi = mid; // no cabe → reduce
    }
  }
  el.style.fontSize = Math.max(MIN, Math.floor(best * 10)/10) + 'px';
}





  



// ============ Tarjeta de archivo (sin listeners por botón; delegación) ============
function buildFileCard(file){
  const card = document.createElement('div');
  card.className = 'file-card';
  card.dataset.file = encodeData(file);

  // Estructura común
  card.innerHTML = `
    <div class="file-thumb-wrap"><img class="file-thumb" alt="${file.name}"></div>
    <div class="file-meta">
      <span class="file-name">${file.name}</span>
      <span class="file-subtitle"></span>
      <div class="file-links"></div>
    </div>`;

  // Thumbnail
  ensureThumb(file, card.querySelector('.file-thumb'));

  // Subtítulo: usa el tuyo o generamos uno; lo persistimos en el objeto
  const subEl = card.querySelector('.file-subtitle');
  const computedSub = computeSubtitle(file);
  subEl.textContent = computedSub;
  file.subtitle = computedSub;

  // Links (solo en project con links)
  const linksDiv = card.querySelector('.file-links');
  if (file.kind === "project" && Array.isArray(file.links)){
    const frag = document.createDocumentFragment();
    for (const link of file.links){
      const btn = document.createElement('button');
      btn.className = 'file-link-btn';
      btn.dataset.link = encodeData(link);
      btn.innerHTML = `${iconFor(link)} ${link.label}`;
      frag.appendChild(btn);
    }
    linksDiv.appendChild(frag);
  }

  // Overrides opcionales por-item
  const nameEl = card.querySelector('.file-name');
  if (file.titleSize)       nameEl.dataset.forceSize   = String(file.titleSize);
  if (file.titleSizeStrict) nameEl.dataset.forceStrict = '1';
  if (file.minTitleSize)    nameEl.dataset.minSize     = String(file.minTitleSize);

  // Wrap interior (mantiene tu sistema de escala)
  const inner = document.createElement('div');
  inner.className = 'file-card-inner';
  while (card.firstChild) inner.appendChild(card.firstChild);
  card.appendChild(inner);

  // Ajuste inicial
  fitNamesInCard(card);

  return card;
}

// ============ openFolder (render por categorías + delegación de eventos) ============
function openFolder(name) {
  

  // Si ya existe la ventana, solo la traemos al frente
  const existing = document.getElementById(`win-${name}`);
  if (existing) {
    existing.style.display = 'block';
    bringToFront(existing);
    return;
  }

  const folder = folders.find(f => f.name === name);
  const files = folder?.files ?? [];

  
  //carpetaslinks
  if (folder && folder.type === "link" && folder.url) {
    window.open(folder.url, "_blank");
    return; // ⛔️ no seguimos, no abrimos ventana
  }
  // ================================
  // 🧪 CASO ESPECIAL: carpeta "Lab"
  // ================================
  if (name === "Lab") {
    // Si la función global está disponible, úsala
    if (typeof window.openLiveLabWindow === 'function') {
      window.openLiveLabWindow();
      return; // no continuar con el resto
    }

    // Si no está cargada, mostramos aviso y salimos
    console.warn('⚠ No se pudo abrir el Live Lab: openLiveLabWindow no encontrada');
    alert('La app Live Lab no está disponible o no se ha cargado aún.');
    return;
  }
  // ================================
  // 🟣 CASO ESPECIAL: carpeta "Sobre mí"
  // ================================
  if (name === "Sobre mí") {
    const windowEl = document.createElement('div');

    const key = normalizeName(name || folder.name || 'ventana');
    windowEl.dataset.task = key;
    windowEl.className = 'window window-about3d';
    windowEl.id = `win-${name}`;


    // Header estándar
    const header = document.createElement('div');
    header.className = 'window-header';
    header.innerHTML = `
      <span>${name}</span>
      <div class="window-buttons">
        <span class="min-btn">_</span>
        <span class="max-btn">□</span>
        <span class="close-btn">✕</span>
      </div>`;

    // Contenedor principal con canvas
    const content = document.createElement('div');
    content.className = 'window-content';
    content.innerHTML = `
  <div class="about-layout">
    <canvas id="about-canvas"></canvas>
    <div id="about-text">
      <section data-index="0">
        <h2>Andrés Vidal Martín Martín</h2>
        <p>Artista, educador y tecnólogo. Trabajo con sistemas interactivos, música generativa y arte digital. Mi práctica se centra en las relaciones entre el arte, la tecnología y la educación, explorando cómo los entornos interactivos, la realidad virtual, el tracking de datos y otras técnicas digitales pueden integrarse en los procesos educativos</p>
      </section>
      <section data-index="1">
        <h2>Mi enfoque</h2>
        <p>Trabajo desde una perspectiva queentiende el software, la programacióny lo audiovisual como herramientaspedagógicas y creativas, orientadassiempre al diseño de sistemas deaprendizaje accesibles.Un valor presente en toda mi línea de trabajo es el de la diversidad (cultural, funcional, de género, etc.</p>
      </section>
      <section data-index="2">
        <h2>Instalaciones</h2>
        <p>Desarrollo entornos virtuales y experiencias inmersivas que combinan arte y educación. Actualmente trabajando en mi proyecto de divulgación @MissingTexture_Lab</p>
      </section>
      <section data-index="3">
        <h2>Contacto</h2>
        <p>MissingTexture_Lab — espacio de experimentación entre imagen, sonido y tecnología. andresvidalmartinmartin@gmail.com</p>
      </section>
    </div>
  </div>
`;

    windowEl.appendChild(header);
    windowEl.appendChild(content);
    document.body.appendChild(windowEl);

    if (isMobile) {
      windowEl.style.position = 'fixed';
      windowEl.style.inset = '0';
      windowEl.style.width = '100vw';
      windowEl.style.height = '100vh';
      windowEl.style.borderRadius = '0';
      windowEl.style.zIndex = 9999;
      windowEl.style.overflowY = 'auto';
    } else {
      const W = Math.min(860, Math.floor(window.innerWidth * 0.9));
      const H = Math.min(580, Math.floor(window.innerHeight * 0.8));
      windowEl.style.left = ((window.innerWidth - W) / 2) + 'px';
      windowEl.style.top = ((window.innerHeight - H) / 2) + 'px';
      windowEl.style.width = W + 'px';
      windowEl.style.height = H + 'px';
    }
    windowEl.style.display = 'block';
    bringToFront(windowEl);
    addToTaskbar(name);

    // Botones
    header.querySelector('.close-btn').addEventListener('click', () => {
      windowEl.remove();
      const key = name.toLowerCase().replace(/\s+/g, '-');
      const taskBtn = document.querySelector(`.task-btn[data-task="${key}"]`);
      if (taskBtn) taskBtn.remove();
    });
    header.querySelector('.min-btn').addEventListener('click', () => {
      windowEl.style.display = 'none';
    });

    // Maximizar / restaurar
    let maximized = false;
    header.querySelector('.max-btn').addEventListener('click', () => {
      if (!maximized) {
        windowEl.dataset.prev = JSON.stringify({
          left: windowEl.style.left, top: windowEl.style.top,
          width: windowEl.style.width, height: windowEl.style.height
        });
        windowEl.style.left = 0;
        windowEl.style.top = 0;
        windowEl.style.width = window.innerWidth + 'px';
        windowEl.style.height = (window.innerHeight - 40) + 'px';
        maximized = true;
      } else {
        const prev = JSON.parse(windowEl.dataset.prev);
        windowEl.style.left = prev.left;
        windowEl.style.top = prev.top;
        windowEl.style.width = prev.width;
        windowEl.style.height = prev.height;
        maximized = false;
      }
    });

    if (!isMobile) {
      header.addEventListener('mousedown', e => {
        if (e.target.closest('.window-buttons')) return;
        startDrag(windowEl, e);
      });
    }

    // Inicializar la escena Three.js
    import('./apps/about.js').then(m => {
      if (m.initAbout3D) m.initAbout3D();
    });

    return; // 🔚 salir aquí (no ejecutar la parte normal)
  }

  // ================================
  // 📁 CASO NORMAL: resto de carpetas
  // ================================

  injectCategoryStylesOnce();

  const windowEl = document.createElement('div');
  windowEl.className = 'window';
  windowEl.id = `win-${name}`;

  const key = normalizeName(name || folder.name || 'ventana');
  windowEl.dataset.task = key;
  windowEl.id = `win-${key}`;

  const header = document.createElement('div');
  header.className = 'window-header';
  header.innerHTML = `
    <span>${name}</span>
    <div class="window-buttons">
      <span class="min-btn">_</span>
      <span class="max-btn">□</span>
      <span class="close-btn">✕</span>
    </div>`;

  const content = document.createElement('div');
  content.className = 'window-content';

  if (!files.length) {
    // === Carpeta vacía → mostrar engine 3D “en construcción” ===
    content.innerHTML = `
      <div class="under-construction-wrap">
        <div id="under-construction"></div>
        <div class="uc-text">🚧 Esta sección está en construcción 🚧</div>
      </div>
    `;

    // Cargar el motor 3D flotante
    import('./utils/under-construction.js').then(m => m.initUnderConstruction());
  } else {
    const sectionsWrap = document.createElement('div');
    sectionsWrap.className = 'category-sections-wrap';

    const grouped = groupByCategoryStable(files);
    const fragSections = document.createDocumentFragment();

    grouped.forEach((arr, catName) => {
      const section = document.createElement('section');
      section.className = 'category-section';
      section.dataset.category = catName;

      const title = document.createElement('div');
      title.className = 'category-title';
      title.innerHTML = `${catName} <small>(${arr.length})</small>`;
      section.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'file-grid category-grid';

      const fragCards = document.createDocumentFragment();
      for (const file of arr) {
        const card = buildFileCard(file);
        fragCards.appendChild(card);
      }
      grid.appendChild(fragCards);
      section.appendChild(grid);
      fragSections.appendChild(section);

      markNoLinksFor(grid);
      attachCardScaler(grid);
    });

    sectionsWrap.appendChild(fragSections);
    content.appendChild(sectionsWrap);

    // Eventos internos
    content.addEventListener('click', (ev) => {
      const btn = ev.target.closest('.file-link-btn');
      if (!btn) return;
      const link = decodeData(btn.dataset.link);
      if (link) openFile(link);
    });

    content.addEventListener('dblclick', (ev) => {
      const card = ev.target.closest('.file-card');
      if (!card) return;
      const file = decodeData(card.dataset.file);
      if (!file) return;
      if (file.kind === 'project' && Array.isArray(file.links)) return;
      openFile(file);
    });
  }

  windowEl.appendChild(header);
  windowEl.appendChild(content);
  document.body.appendChild(windowEl);

  // Tamaño / posición inicial
  const W = Math.min(860, Math.floor(window.innerWidth * 0.9));
  const H = Math.min(580, Math.floor(window.innerHeight * 0.8));
  windowEl.style.left = ((window.innerWidth - W) / 2) + 'px';
  windowEl.style.top = ((window.innerHeight - H) / 2) + 'px';
  windowEl.style.width = W + 'px';
  windowEl.style.height = H + 'px';
  windowEl.style.display = 'block';

  bringToFront(windowEl);
  addToTaskbar(name);

  // Botones
  header.querySelector('.close-btn').addEventListener('click', () => {
    windowEl.remove();
    const key = name.toLowerCase().replace(/\s+/g, '-');
    const taskBtn = document.querySelector(`.task-btn[data-task="${key}"]`);
    if (taskBtn) taskBtn.remove();
  });
  header.querySelector('.min-btn').addEventListener('click', () => {
    windowEl.style.display = 'none';
  });

  let maximized = false;
  header.querySelector('.max-btn').addEventListener('click', () => {
    if (!maximized) {
      windowEl.dataset.prev = JSON.stringify({
        left: windowEl.style.left, top: windowEl.style.top,
        width: windowEl.style.width, height: windowEl.style.height
      });
      windowEl.style.left = 0;
      windowEl.style.top = 0;
      windowEl.style.width = window.innerWidth + 'px';
      windowEl.style.height = (window.innerHeight - 40) + 'px';
      maximized = true;
    } else {
      const prev = JSON.parse(windowEl.dataset.prev);
      windowEl.style.left = prev.left;
      windowEl.style.top = prev.top;
      windowEl.style.width = prev.width;
      windowEl.style.height = prev.height;
      maximized = false;
    }
  });

  if (!isMobile) {
    header.addEventListener('mousedown', e => {
      if (e.target.closest('.window-buttons')) return;
      startDrag(windowEl, e);
    });
  }
}




// 7) Inyecta la lista de archivos al cargar
export function initFiles() {
  if (window.__FILES_INIT__) return;
  window.__FILES_INIT__ = true;
  for (const f of folders) f.files = filesByFolder[f.name] || [];
}

// ===== Drag robusto con overlay =====
let dragShield = null;

function ensureDragShield() {
  if (!dragShield) {
    dragShield = document.createElement('div');
    dragShield.className = 'drag-shield';
    document.body.appendChild(dragShield);
  }
}

function startDrag(win, e) {
  e.preventDefault();

  activeWindow = win;
  const rect = win.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
  bringToFront(win);

  ensureDragShield();
  dragShield.style.display = 'block';
  document.body.classList.add('dragging');

  function onMouseMove(ev) {
    // límites dentro de la pantalla y por encima de la taskbar
    const maxLeft = window.innerWidth - win.offsetWidth;
    const taskbarH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--taskbar-h')) || 40;
    const maxTop  = window.innerHeight - taskbarH - win.offsetHeight;

    const x = Math.max(0, Math.min(maxLeft, ev.clientX - offsetX));
    const y = Math.max(0, Math.min(maxTop,  ev.clientY - offsetY));

    win.style.left = x + 'px';
    win.style.top  = y + 'px';
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    if (dragShield) dragShield.style.display = 'none';
    document.body.classList.remove('dragging');
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}
window.fitAllNames = function(scopeEl){
  scopeEl.querySelectorAll('.file-card').forEach(card => fitNamesInCard(card));
};

export {
  openFolder,
  openFile,
  startDrag
};



// =============================
// 📱 Modo móvil ajustado
// =============================

if (isMobile) {
  document.body.classList.add('mobile-mode');

  // 1️⃣ Ajusta escritorio al tamaño del viewport
  const desktop = document.getElementById('desktop');
  if (desktop) {
    Object.assign(desktop.style, {
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      inset: '0',
      overflow: 'hidden'
    });
  }

  // 2️⃣ Oculta el asistente si está visible
  const assistant = document.querySelector('.window-assistant');
  if (assistant) assistant.style.display = 'none';

  // 3️⃣ Sustituye el doble clic por un solo clic para abrir carpetas/archivos
  document.addEventListener('click', (e) => {
    const icon = e.target.closest('.icon');
    const card = e.target.closest('.file-card');
    const linkBtn = e.target.closest('.file-link-btn');

    // 👉 Si hace tap en una tarjeta de archivo
    if (card) {
      const data = card.dataset.file;
      if (data) {
        const file = JSON.parse(decodeURIComponent(data));
        openFile(file);
      }
      return;
    }

    // 👉 Si pulsa un botón de link en un proyecto
    if (linkBtn) {
      const link = JSON.parse(decodeURIComponent(linkBtn.dataset.link));
      if (link) openFile(link);
      return;
    }

    // 👉 Si pulsa un icono del escritorio
    if (icon) {
      const name = icon.textContent.trim();
      openFolder(name);
    }
  }, { passive: true });

  // 4️⃣ 🔹 Mantén el drag en ventanas, pero no en iconos
  document.addEventListener('touchstart', (e) => {
    const header = e.target.closest('.window-header');
    if (header && !e.target.closest('.window-buttons')) {
      const win = header.parentElement;
      if (!win) return;

      // inicia drag
      const taskbarH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--taskbar-h')) || 48;
      const maxTop = window.innerHeight - taskbarH - win.offsetHeight;
      const rect = win.getBoundingClientRect();
      const offsetX = e.touches[0].clientX - rect.left;
      const offsetY = e.touches[0].clientY - rect.top;

      bringToFront(win);

      function onTouchMove(ev) {
        ev.preventDefault();
        const x = ev.touches[0].clientX - offsetX;
        const y = ev.touches[0].clientY - offsetY;
        win.style.left = `${Math.max(0, Math.min(window.innerWidth - rect.width, x))}px`;
        win.style.top = `${Math.max(0, Math.min(window.innerHeight - rect.height, y))}px`;
      }

      function onTouchEnd() {
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
      }

      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd);
    }
  }, { passive: true });
}

// =============================
// 🧪 Ajuste mejorado para Live Lab (sin desbordes)
// =============================
function fixLiveLabWindowSize() {
  const win = document.querySelector('.window-livelab, #win-Lab, [id*="LiveLab"]');
  if (!win) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = isMobile ? 0 : 40;

  // --- Medidas base ---
  const rect = win.getBoundingClientRect();
  const W = Math.min(rect.width, vw - margin);
  const H = Math.min(rect.height, vh - margin);

  // --- Ajustes visuales comunes ---
  Object.assign(win.style, {
    position: 'fixed',
    zIndex: 9999,
    overflow: 'hidden',
    maxWidth: `${vw - margin}px`,
    maxHeight: `${vh - margin}px`
  });

  // --- En móvil: fullscreen ---
  if (isMobile) {
    Object.assign(win.style, {
      left: '0',
      top: '0',
      width: '100vw',
      height: '100vh',
      borderRadius: '0',
      overflow: 'auto',
      touchAction: 'none'
    });
    return;
  }

  // --- En escritorio: centrado con límite ---
  const left = Math.max(0, Math.min((vw - W) / 2, vw - W - margin / 2));
  const top  = Math.max(0, Math.min((vh - H) / 2, vh - H - margin / 2));

  win.style.left = `${left}px`;
  win.style.top  = `${top}px`;
  win.style.width  = `${W}px`;
  win.style.height = `${H}px`;
}

// Reaplica cada vez que cambia el DOM o se redimensiona
const labObserver = new MutationObserver(() => fixLiveLabWindowSize());
labObserver.observe(document.body, { childList: true, subtree: true });
window.addEventListener('resize', fixLiveLabWindowSize);
