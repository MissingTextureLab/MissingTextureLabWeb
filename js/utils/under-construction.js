// under_construction.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function initUnderConstruction() {
  const container = document.getElementById('under-construction');
  if (!container) return;

  // === ESCENA, CÁMARA Y RENDERER ===
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0B0B0B);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = 0;
    renderer.domElement.style.left = 0;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

  // === LUCES ===
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  const key = new THREE.DirectionalLight(0x99ccff, 1.4);
  key.position.set(3, 3, 5);
  const fill = new THREE.PointLight(0xff88ff, 1.3, 20);
  fill.position.set(-3, -2, 4);
  scene.add(ambient, key, fill);

  // === CARGAR MODELO GLB ===
  const loader = new GLTFLoader();
  let model;

  loader.load(
    'models/gear.glb', // 🧩 cambia la ruta a tu modelo real
    (gltf) => {
      model = gltf.scene;
      scene.add(model);

      // Centrar modelo y escalar automáticamente
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      model.position.sub(center); // centramos el modelo en (0,0,0)

      // Escalado automático para que siempre entre en cámara
      const maxDim = Math.max(size.x, size.y, size.z);
      const desiredSize = 2.5; // tamaño relativo en pantalla
      const scale = desiredSize / maxDim;
      model.scale.setScalar(scale);

      console.log(`✅ Modelo cargado y centrado. Escala aplicada: ${scale.toFixed(3)}`);
    },
    undefined,
    (err) => console.error('❌ Error al cargar el modelo GLB:', err)
  );

    // === ANIMACIÓN ===
    let t = 0;
    function animate() {
        requestAnimationFrame(animate);
        t += 0.01;

        if (model) {
        model.rotation.y += 0.01;
        model.rotation.x = Math.sin(t * 0.4) * 0.1;
        model.position.y = Math.sin(t) * 0.2;
        }

        renderer.render(scene, camera);
    }
    animate();

    // === RESIZE ROBUSTO ===
    function handleResize() {
        const rect = container.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        if (w <= 0 || h <= 0) return; // evita render vacío
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }

    // Observa cambios reales del contenedor
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // Fallback por si cambia el viewport o se maximiza
    window.addEventListener('resize', handleResize);

    // Primer ajuste tras montar
    setTimeout(handleResize, 100);

}
