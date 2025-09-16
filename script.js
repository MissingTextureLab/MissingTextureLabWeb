const desktop = document.getElementById('desktop');
const menu = document.getElementById('desktop-menu');
const startBtn = document.querySelector('.start-btn');
const startMenu = document.getElementById('start-menu');
const taskbar = document.getElementById('taskbar');

let activeWindow = null, offsetX = 0, offsetY = 0;
let draggedIcon = null;
let isDragging = false;
let selectedIcon = null;

// Configuración de la cuadrícula (ajustada para iconos más grandes)
const GRID_SIZE = 110;
const GRID_PADDING = 20;

// 🔹 Carpetas iniciales con posiciones en cuadrícula
let folders = [
    { name: "VR y 3D", x: 0, y: 0, icon: "icons/FolderVirtual.png", type: "folder", created: "2024-01-15", size: "15.2 MB", items: 24 },
        { name: "instalación", x: 1, y: 0, icon: "icons/FolderText.png", type: "folder", created: "2024-01-08", size: "45.8 MB", items: 67 },
    { name: "Music", x: 0, y: 1, icon: "icons/FoldeMusic.png", type: "folder", created: "2024-02-10", size: "2.1 GB", items: 156 },
    { name: "Code", x: 0, y: 2, icon: "icons/FolderCode.png", type: "folder", created: "2024-01-22", size: "850 MB", items: 89 },
    { name: "Videos", x: 0, y: 3, icon: "icons/FolderVideo.png", type: "folder", created: "2024-03-05", size: "5.7 GB", items: 42 },
    { name: "¿?", x: 1, y: 1, icon: "icons/FolderRandom.png", type: "folder", created: "2024-02-28", size: "12.4 GB", items: 8 },
    { name: "Readme", x: 1, y: 2, icon: "icons/FolderMipcl.png", type: "file", created: "2024-03-15", size: "2.4 KB", items: 1 }
];

renderDesktop();

function renderDesktop(){
    desktop.innerHTML = '';
    
    folders.forEach((folder)=>{
        const icon = document.createElement('div');
        icon.className = 'icon';
        icon.draggable = true;
        icon.dataset.name = folder.name;
        
        
    icon.innerHTML = `
    <img src="${folder.icon}" class="icon-img">
    <span>${folder.name}</span>
    `;
        
        // Posicionar en la cuadrícula
        const x = GRID_PADDING + folder.x * GRID_SIZE;
        const y = GRID_PADDING + folder.y * GRID_SIZE;
        icon.style.left = x + 'px';
        icon.style.top = y + 'px';
        
        desktop.appendChild(icon);

        // Eventos de selección y doble clic
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.icon').forEach(ic => ic.classList.remove('selected'));
            icon.classList.add('selected');
            selectedIcon = folder;
        });
        
        icon.addEventListener('dblclick', () => {
            openFolder(folder.name);
        });

        // Eventos de arrastre
        icon.addEventListener('dragstart', (e) => {
            draggedIcon = icon;
            isDragging = true;
            icon.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', folder.name);
            
            // Mostrar cuadrícula
            showGrid();
        });

        icon.addEventListener('dragend', (e) => {
            icon.classList.remove('dragging');
            hideGrid();
            isDragging = false;
            draggedIcon = null;
        });
    });
}

function getGridPosition(clientX, clientY) {
    const rect = desktop.getBoundingClientRect();
    const x = clientX - rect.left - GRID_PADDING;
    const y = clientY - rect.top - GRID_PADDING;
    
    const gridX = Math.max(0, Math.round(x / GRID_SIZE));
    const gridY = Math.max(0, Math.round(y / GRID_SIZE));
    
    return { x: gridX, y: gridY };
}

function moveIconToGrid(icon, gridX, gridY) {
    const folderName = icon.dataset.name;
    
    // Verificar si la posición está ocupada
    const occupied = folders.find(f => f.x === gridX && f.y === gridY && f.name !== folderName);
    if (occupied) {
        // Intercambiar posiciones
        const currentFolder = folders.find(f => f.name === folderName);
        const tempX = currentFolder.x;
        const tempY = currentFolder.y;
        
        currentFolder.x = gridX;
        currentFolder.y = gridY;
        occupied.x = tempX;
        occupied.y = tempY;
    } else {
        // Mover a posición libre
        const folder = folders.find(f => f.name === folderName);
        folder.x = gridX;
        folder.y = gridY;
    }
    
    renderDesktop();
}

function showGrid() {
    // Crear líneas de cuadrícula temporales
    const maxCols = Math.floor((window.innerWidth - GRID_PADDING * 2) / GRID_SIZE);
    const maxRows = Math.floor((window.innerHeight - 60 - GRID_PADDING * 2) / GRID_SIZE);
    
    for (let x = 0; x < maxCols; x++) {
        for (let y = 0; y < maxRows; y++) {
            const gridCell = document.createElement('div');
            gridCell.className = 'grid-position';
            gridCell.style.left = (GRID_PADDING + x * GRID_SIZE) + 'px';
            gridCell.style.top = (GRID_PADDING + y * GRID_SIZE) + 'px';
            gridCell.dataset.gridX = x;
            gridCell.dataset.gridY = y;
            desktop.appendChild(gridCell);
        }
    }
}

function hideGrid() {
    document.querySelectorAll('.grid-position').forEach(cell => cell.remove());
}

function highlightNearestGrid(clientX, clientY) {
    const gridPos = getGridPosition(clientX, clientY);
    
    // Limpiar highlights anteriores
    document.querySelectorAll('.grid-position').forEach(cell => {
        cell.classList.remove('highlight');
    });
    
    // Highlight de la celda más cercana
    const targetCell = document.querySelector(`[data-grid-x="${gridPos.x}"][data-grid-y="${gridPos.y}"]`);
    if (targetCell) {
        targetCell.classList.add('highlight');
    }
}

function arrangeIcons() {
    // Reorganizar iconos automáticamente
    folders.sort((a, b) => a.name.localeCompare(b.name));
    
    let x = 0, y = 0;
    const maxRows = Math.floor((window.innerHeight - 60 - GRID_PADDING * 2) / GRID_SIZE);
    
    folders.forEach((folder, index) => {
        folder.x = x;
        folder.y = y;
        
        y++;
        if (y >= maxRows) {
            y = 0;
            x++;
        }
    });
    
    renderDesktop();
}

function openFolder(name){
    // Si ya está abierto, mostrarlo
    if(document.getElementById(`win-${name}`)){
        const win = document.getElementById(`win-${name}`);
        win.style.display = 'block';
        bringToFront(win);
        return;
    }

    // Crear nueva ventana
    const windowEl = document.createElement('div');
    windowEl.className = 'window';
    windowEl.id = `win-${name}`;

    const header = document.createElement('div');
    header.className = 'window-header';
    header.innerHTML = `<span>${name}</span>
        <div class="window-buttons">
            <span class="min-btn">_</span>
            <span class="max-btn">□</span>
            <span class="close-btn">✕</span>
        </div>`;
    
    const content = document.createElement('div');
    content.className = 'window-content';
    content.innerHTML = `
        <h3>📁 ${name}</h3>
        <p style="margin-top: 12px; color: var(--frutiger-dark); opacity: 0.8;">
            Este es el contenido de la carpeta ${name}. Aquí podrías mostrar archivos, subcarpetas y otras opciones.
        </p>
        <div style="margin-top: 20px; padding: 12px; background: rgba(168, 85, 247, 0.1); border-radius: 8px;">
            <p style="font-size: 11px; color: var(--frutiger-purple);">💡 Tip: Haz clic derecho en los iconos del escritorio para ver sus propiedades.</p>
        </div>
    `;

    windowEl.appendChild(header);
    windowEl.appendChild(content);
    document.body.appendChild(windowEl);

    // Posición centrada
    const winWidth = 500;
    const winHeight = 350;
    const x = (window.innerWidth - winWidth) / 2;
    const y = (window.innerHeight - winHeight) / 2;
    windowEl.style.left = x + 'px';
    windowEl.style.top = y + 'px';
    windowEl.style.width = winWidth + 'px';
    windowEl.style.height = winHeight + 'px';
    windowEl.style.display = 'block';

    bringToFront(windowEl);
    addToTaskbar(name);

    // Eventos de botones
    header.querySelector('.close-btn').addEventListener('click',()=>{
        windowEl.remove();
        const taskIcon = document.getElementById(`task-${name}`);
        if(taskIcon) taskIcon.remove();
    });
    header.querySelector('.min-btn').addEventListener('click',()=>{
        windowEl.style.display = 'none';
    });
    let maximized = false;
    header.querySelector('.max-btn').addEventListener('click',()=>{
        if(!maximized){
            windowEl.dataset.prev = JSON.stringify({
                left: windowEl.style.left,
                top: windowEl.style.top,
                width: windowEl.style.width,
                height: windowEl.style.height
            });
            windowEl.style.left = 0;
            windowEl.style.top = 0;
            windowEl.style.width = window.innerWidth+'px';
            windowEl.style.height = (window.innerHeight-40)+'px';
            maximized = true;
        }else{
            const prev = JSON.parse(windowEl.dataset.prev);
            windowEl.style.left = prev.left;
            windowEl.style.top = prev.top;
            windowEl.style.width = prev.width;
            windowEl.style.height = prev.height;
            maximized = false;
        }
    });

    // Mover ventana
    header.addEventListener('mousedown',e=>{
        if(e.target.closest('.window-buttons')) return;
        activeWindow = windowEl;
        offsetX = e.clientX - windowEl.getBoundingClientRect().left;
        offsetY = e.clientY - windowEl.getBoundingClientRect().top;
        bringToFront(windowEl);
    });
}

function openProperties(folder) {
    const name = `${folder.name}-Properties`;
    
    // Si ya está abierto, mostrarlo
    if(document.getElementById(`win-${name}`)){
        const win = document.getElementById(`win-${name}`);
        win.style.display = 'block';
        bringToFront(win);
        return;
    }

    // Crear ventana de propiedades
    const windowEl = document.createElement('div');
    windowEl.className = 'window';
    windowEl.id = `win-${name}`;

    const header = document.createElement('div');
    header.className = 'window-header';
    header.innerHTML = `<span>${folder.name} Properties</span>
        <div class="window-buttons">
            <span class="min-btn">_</span>
            <span class="max-btn">□</span>
            <span class="close-btn">✕</span>
        </div>`;
    
    const content = document.createElement('div');
    content.className = 'window-content';
    

    
    content.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <img src="${folder.icon}" class="properties-icon">
                <h3 style="color: var(--frutiger-purple); margin: 0;">${folder.name}</h3>
                <p style="margin: 4px 0; font-size: 11px; color: var(--frutiger-dark); opacity: 0.8;">
                    ${folder.type === 'folder' ? 'Folder' : 'File'}
                </p>
            </div>
        </div>
        
        <div class="properties-section">
            <h4>📊 General</h4>
            <p><strong>Name:</strong> ${folder.name}</p>
            <p><strong>Type:</strong> ${folder.type === 'folder' ? 'File Folder' : 'Text Document'}</p>
            <p><strong>Size:</strong> ${folder.size}</p>
            ${folder.type === 'folder' ? `<p><strong>Contains:</strong> ${folder.items} items</p>` : ''}
        </div>
        
        <div class="properties-section">
            <h4>📅 Dates</h4>
            <p><strong>Created:</strong> ${folder.created}</p>
            <p><strong>Modified:</strong> ${new Date().toISOString().split('T')[0]}</p>
            <p><strong>Accessed:</strong> ${new Date().toISOString().split('T')[0]}</p>
        </div>
        
        <div class="properties-section">
            <h4>🔧 Attributes</h4>
            <p><strong>Location:</strong> Desktop</p>
            <p><strong>Hidden:</strong> No</p>
            <p><strong>Read-only:</strong> No</p>
        </div>
    `;

    windowEl.appendChild(header);
    windowEl.appendChild(content);
    document.body.appendChild(windowEl);

    // Posición y tamaño
    const winWidth = 400;
    const winHeight = 450;
    const x = (window.innerWidth - winWidth) / 2 + Math.random() * 100 - 50;
    const y = (window.innerHeight - winHeight) / 2 + Math.random() * 100 - 50;
    windowEl.style.left = x + 'px';
    windowEl.style.top = y + 'px';
    windowEl.style.width = winWidth + 'px';
    windowEl.style.height = winHeight + 'px';
    windowEl.style.display = 'block';

    bringToFront(windowEl);
    addToTaskbar(`${folder.name}-Properties`);

    // Eventos de botones
    header.querySelector('.close-btn').addEventListener('click',()=>{
        windowEl.remove();
        const taskIcon = document.getElementById(`task-${name}`);
        if(taskIcon) taskIcon.remove();
    });
    header.querySelector('.min-btn').addEventListener('click',()=>{
        windowEl.style.display = 'none';
    });
    let maximized = false;
    header.querySelector('.max-btn').addEventListener('click',()=>{
        if(!maximized){
            windowEl.dataset.prev = JSON.stringify({
                left: windowEl.style.left,
                top: windowEl.style.top,
                width: windowEl.style.width,
                height: windowEl.style.height
            });
            windowEl.style.left = 0;
            windowEl.style.top = 0;
            windowEl.style.width = window.innerWidth+'px';
            windowEl.style.height = (window.innerHeight-40)+'px';
            maximized = true;
        }else{
            const prev = JSON.parse(windowEl.dataset.prev);
            windowEl.style.left = prev.left;
            windowEl.style.top = prev.top;
            windowEl.style.width = prev.width;
            windowEl.style.height = prev.height;
            maximized = false;
        }
    });

    // Mover ventana
    header.addEventListener('mousedown',e=>{
        if(e.target.closest('.window-buttons')) return;
        activeWindow = windowEl;
        offsetX = e.clientX - windowEl.getBoundingClientRect().left;
        offsetY = e.clientY - windowEl.getBoundingClientRect().top;
        bringToFront(windowEl);
    });
}

function addToTaskbar(name){
    if(document.getElementById(`task-${name.replace(/\s+/g, '-')}`)) return; // ya existe
    const btn = document.createElement('div');
    btn.className = 'task-icon';
    btn.id = `task-${name.replace(/\s+/g, '-')}`;
    btn.textContent = name;
    btn.addEventListener('click',()=>{
        const win = document.getElementById(`win-${name}`) || document.getElementById(`win-${name.replace(/\s+/g, '-')}`);
        if(win && win.style.display==='none'){
            win.style.display='block';
            bringToFront(win);
        }else if(win){
            win.style.display='none';
        }
    });
    taskbar.appendChild(btn);
}

function bringToFront(win){
    document.querySelectorAll('.window').forEach(w=>w.style.zIndex=1);
    win.style.zIndex = 10;
}

// Drag windows
document.addEventListener('mousemove', e=>{
    if(activeWindow){
        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;
        x = Math.max(0, Math.min(x, window.innerWidth - activeWindow.offsetWidth));
        y = Math.max(0, Math.min(y, window.innerHeight - activeWindow.offsetHeight));
        activeWindow.style.left = x+'px';
        activeWindow.style.top = y+'px';
    }
});
document.addEventListener('mouseup',()=>activeWindow=null);

// Deseleccionar iconos al hacer clic en el desktop
desktop.addEventListener('click', (e) => {
    if (e.target === desktop) {
        document.querySelectorAll('.icon').forEach(ic => ic.classList.remove('selected'));
        selectedIcon = null;
    }
});

// Context menu
document.addEventListener('contextmenu',e=>{
    e.preventDefault();
    
    // Verificar si se hizo clic en un icono
    const clickedIcon = e.target.closest('.icon');
    if (clickedIcon) {
        const folderName = clickedIcon.dataset.name;
        selectedIcon = folders.find(f => f.name === folderName);
        
        // Actualizar el menú contextual para mostrar propiedades del icono específico
        menu.innerHTML = `
            <div class="context-menu-item" id="open-properties">Properties of ${folderName}</div>
            <div class="context-menu-item" id="arrange-icons">Arrange Icons</div>
        `;
        
        // Agregar evento para abrir propiedades
        document.getElementById('open-properties').addEventListener('click', () => {
            if (selectedIcon) {
                openProperties(selectedIcon);
            }
            menu.style.display = 'none';
        });
    } else {
        // Menú contextual del desktop
        menu.innerHTML = `
            <div class="context-menu-item" id="arrange-icons">Arrange Icons</div>
        `;
    }
    
    menu.style.display='block';
    menu.style.left = e.clientX+'px';
    menu.style.top = e.clientY+'px';
});

document.addEventListener('click',()=>menu.style.display='none');

// Start menu
startBtn.addEventListener('click',()=>{
    startMenu.style.display = startMenu.style.display==='flex'?'none':'flex';
});

// Menu events
document.getElementById('settings').addEventListener('click',()=>{
    alert('⚙️ Configuración del sistema\n\nAquí podrías ajustar:\n• Tema visual\n• Tamaño de iconos\n• Comportamiento del escritorio');
    startMenu.style.display = 'none';
});

document.getElementById('screensaver-logo').addEventListener('click', ()=>{
  // animación rápida de "encendido" (bloom a pico y vuelve)
  const logo = document.getElementById('screensaver-logo');
  logo.classList.add('clicked');
  setTimeout(()=> {
    exitScreensaver();
    logo.classList.remove('clicked');
  }, 150); // pequeño "pop" y salimos del overlay
});

// Agregar event listener para arrange icons (que puede aparecer en ambos contextos)
document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'arrange-icons') {
        arrangeIcons();
        menu.style.display = 'none';
    }
});

// Reloj
function updateClock(){
    const now = new Date();
    let h = now.getHours(), m = now.getMinutes().toString().padStart(2,'0');
    const ampm = h>=12?'PM':'AM';
    h = h%12; h = h?h:12;
    document.getElementById('clock').textContent = `${h}:${m} ${ampm}`;
}
updateClock(); setInterval(updateClock,60000);

// Prevenir selección de texto durante el arrastre
document.addEventListener('selectstart', e => {
    if (isDragging) e.preventDefault();
});

// ScreenSaver
function enterScreensaver(isBoot = false){
  document.querySelectorAll('.window').forEach(w => w.remove());
  taskbar.innerHTML = '';

  const s = document.getElementById('screensaver');
  const logo = document.getElementById('screensaver-logo');
  
  s.classList.add('active');

  // animación de entrada de la imagen
  logo.classList.remove('animate-in'); // por si acaso
  void logo.offsetWidth;               // truco para reiniciar animación
  logo.classList.add('animate-in');
}


function exitScreensaver(){
  const s = document.getElementById('screensaver');
  s.classList.remove('active');
  s.classList.remove('booting');
  s.classList.remove('flash');
}

// Apagar (Start > Shut Down)
document.getElementById('shutdown').addEventListener('click',()=>{
  enterScreensaver(true); // sin preguntar, apaga al instante
  startMenu.style.display = 'none';
});

// Encender con click en la imagen -> pequeño flash y salir
document.getElementById('screensaver-logo').addEventListener('click', ()=>{
  const s = document.getElementById('screensaver');
  s.classList.add('flash');           // flash corto
  setTimeout(()=> {                   // tras el flash, salimos
    exitScreensaver();
  }, 220);
});

// 👉 Mostrar el screensaver como PRIMERA pantalla al cargar la web
document.addEventListener('DOMContentLoaded', () => {
  enterScreensaver(true);

});
requestAnimationFrame(()=>document.querySelectorAll('.category-grid').forEach(g=>fitAllNames(g)));
