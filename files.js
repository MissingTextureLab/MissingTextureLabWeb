// ===== desktop-files.js =====
// Requiere que existan: desktop, folders, bringToFront, addToTaskbar, activeWindow, offsetX, offsetY

// 1) Define aquí los archivos por carpeta (edítalo a tu gusto)
// 1) Define aquí los archivos por carpeta (edítalo a tu gusto)
const filesByFolder = {
  "Music": [
    { name: "ExpoMaria",              kind: "site",     host: "web",      url: "https://bbaa.usal.es/actividades/la-folklorica" }, // página web
    { name: "Música tati",            kind: "song",     host: "spotify",  url: "https://" },
    { name: "Bandcamp",               kind: "site",     host: "bandcamp", url: "https://freewatermarkremover.bandcamp.com" },
    { name: "Perfil Spotify",         kind: "site",     host: "spotify",  url: "https://open.spotify.com/intl-es/artist/4MTxGkUNTkNzbZHIfLvkGH" },
    { name: "Mixes dj",               kind: "playlist", host: "youtube",  url: "https://www.youtube.com/playlist?list=PL-GwSH3Z4NF1uhCdIUDfBS4T7-w42JWR3" },
    { name: "Hackaton",               kind: "link",     host: "web",      url: "https://valenciaplaza.com/musica-opera-valencia-comunitat-valenciana/la-music-hackaton-de-valencia-transforma-las-naves-en-un-estudio-de-experimentacion-sonora" },
    { name: "Modul",                  kind: "link",     host: "web",      url: "https://www.instagram.com/p/DEflCYvsHDh/?img_index=4" },
  ],

  "Videos": [
    // (tus existentes)
    { name: "Con esos ojitos",        kind: "video", host: "youtube", url: "https://www.youtube.com/watch?v=df1wnWwtuQc" },
    { name: "Windows66",              kind: "video", host: "youtube", url: "https://www.youtube.com/watch?v=yalKehB3IYo" },
    { name: "segunda intermisión",    kind: "video", host: "youtube", url: "https://youtu.be/wGGo4pKWG84?si=Lm6oeCQsIzO19Ddm" },
    { name: "SOMETIMES U CANT TRUST IN WHAT SEEMS REAL",      kind: "video", host: "youtube", url: "https://youtu.be/O80O1P7qKXg?si=ll1zQ6nGrevnqw94" },
    { name: "videoarte sahara",       kind: "video", host: "youtube", url: "" },
  ],

  "Live": [
    { name: "Volumens1",              kind: "link", host: "web", url: "https://volumens.es/vo7-2023" },
    { name: "Volumens2",              kind: "link", host: "web", url: "https://volumens.es/2024-ecosystem" },
    { name: "videomapingCCCC",        kind: "link", host: "web", url: "https://www.consorcimuseus.gva.es/actividades/videomapping-al-cccc-ciutat-glitch/?lang=es" },
    { name: "VRSportingClubRuzafa",   kind: "link", host: "web", url: "https://www.facebook.com/masterAVM/posts/este-viernes-17022023-en-sporting-club-ruzafa-de-valencia-sound-no-sound-23-prop/584907886984629" },
  ],

  "Code": [
    { name: "P5.js y P5.xr",          kind: "project", host: "web",  url: "https://editor.p5js.org/lanesvm/sketches" }, // pon repo o demo
    { name: "aplicaciónMovilAbletone",kind: "project", host: "web",  url: "" },
    { name: "AjedrezChess",           kind: "project", host: "web",  url: "" },
  ],

  "VR y 3D": [
    { name: "Cyclops",                               kind: "link", host: "web", url: "" },
    { name: "ThemissingArchive",                     kind: "link", host: "web", url: "" },
    { name: "NobodyIsAnIsland",                      kind: "link", host: "web", url: "" },
    { name: "Hand trackingVR",                       kind: "link", host: "web", url: "" },
    { name: "Cuadro3D",               kind: "link", host: "web", url: "" },
    { name: "Realidad virtual y diversidad funcional", kind: "link", host: "web", url: "" },
    { name: "Arte digital y deportes",               kind: "link", host: "web", url: "" },
  ],

  // Mantengo tu carpeta Documents original
  "Documents": [
    { name: "Render Sala VR",         kind: "photo", host: "drive", url: "https://drive.google.com/file/d/1ZyxWVUTSRQponMLKJIHGFEDCBA/view?usp=sharing" }
  ]
};


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

  // Drag ventana
header.addEventListener('mousedown', e => {
  if (e.target.closest('.window-buttons')) return;
  startDrag(win, e);
});
}

// 6) Sobrescribe openFolder para listar archivos con miniaturas
function badgeFor(file){
  const t = file.kind === 'song' ? 'Song' : file.kind === 'video' ? 'Video' : 'Photo';
  const h = file.host[0].toUpperCase() + file.host.slice(1);
  return `${t} · ${h}`;
}

function openFolder(name){
  // intenta reusar si ya existía abierta
  if(document.getElementById(`win-${name}`)){
    const win = document.getElementById(`win-${name}`);
    win.style.display = 'block'; bringToFront(win); return;
  }
  const folder = folders.find(f => f.name === name);
  const files = folder?.files ?? [];

  const windowEl = document.createElement('div');
  windowEl.className = 'window';
  windowEl.id = `win-${name}`;

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
    content.innerHTML = `
      <h3>📁 ${name}</h3>
      <p style="margin-top:12px;opacity:.8">
        Esta carpeta está vacía. Añade archivos en <code>filesByFolder["${name}"]</code>.
      </p>`;
  } else {
    const grid = document.createElement('div');
    grid.className = 'file-grid';
    files.forEach(file => {
      const card = document.createElement('div');
      card.className = 'file-card';
      card.innerHTML = `
        <div class="file-thumb-wrap">
          <img class="file-thumb" alt="${file.name}">
          <div class="file-badge">${badgeFor(file)}</div>
        </div>
        <div class="file-meta"><span class="file-name">${file.name}</span></div>
      `;
      ensureThumb(file, card.querySelector('.file-thumb'));
      card.addEventListener('dblclick',()=> openFile(file));
      grid.appendChild(card);
    });
    content.appendChild(grid);
  }

  windowEl.appendChild(header); windowEl.appendChild(content);
  document.body.appendChild(windowEl);

  const W = Math.min(860, Math.floor(window.innerWidth * 0.9));
  const H = Math.min(580, Math.floor(window.innerHeight * 0.8));
  windowEl.style.left = ((window.innerWidth - W)/2) + 'px';
  windowEl.style.top  = ((window.innerHeight - H)/2) + 'px';
  windowEl.style.width = W + 'px';
  windowEl.style.height = H + 'px';
  windowEl.style.display = 'block';

  bringToFront(windowEl); addToTaskbar(name);

  header.querySelector('.close-btn').addEventListener('click',()=>{
    windowEl.remove();
    const taskIcon = document.getElementById(`task-${name}`);
    if (taskIcon) taskIcon.remove();
  });
  header.querySelector('.min-btn').addEventListener('click',()=> windowEl.style.display='none');

  let maximized = false;
  header.querySelector('.max-btn').addEventListener('click',()=>{
    if(!maximized){
      windowEl.dataset.prev = JSON.stringify({
        left: windowEl.style.left, top: windowEl.style.top,
        width: windowEl.style.width, height: windowEl.style.height
      });
      windowEl.style.left = 0; windowEl.style.top = 0;
      windowEl.style.width = window.innerWidth+'px';
      windowEl.style.height = (window.innerHeight-40)+'px';
      maximized = true;
    } else {
      const prev = JSON.parse(windowEl.dataset.prev);
      windowEl.style.left = prev.left; windowEl.style.top = prev.top;
      windowEl.style.width = prev.width; windowEl.style.height = prev.height;
      maximized = false;
    }
  });

  header.addEventListener('mousedown', e => {
  if (e.target.closest('.window-buttons')) return;
  startDrag(windowEl /* o win */, e);
  });
}

// 7) Inyecta la lista de archivos al cargar
document.addEventListener('DOMContentLoaded', () => {
  for (const f of folders) f.files = filesByFolder[f.name] || [];
});

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
