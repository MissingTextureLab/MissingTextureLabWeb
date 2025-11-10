// === Flowfield + Bloom para Hydra (versión final intensa, sin resize) ===
(() => {
  window.dispatchEvent(new Event("hydra:cleanup"));
// === Escena básica ===
const container = document.getElementById("hydra-container");
const width = container.clientWidth;
const height = container.clientHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio); // nitidez en pantallas HiDPI
renderer.setSize(width, height);
renderer.setClearColor(0x000000, 1);
camera.position.z = 7;

container.appendChild(renderer.domElement);
  // === Iluminación ===
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));
  const light = new THREE.PointLight(0xffffff, 1.8);
  light.position.set(5, 5, 5);
  scene.add(light);

  // === Bloom postprocessing ===
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(innerWidth, innerHeight),
    0.85,
    0.3,
    0.0
  );
  composer.addPass(bloomPass);

  // === Líneas Flowfield ===
  const simplex = new SimplexNoise();
  const lines = new THREE.Group();
  scene.add(lines);

  const LINE_COUNT = 900;
  const POINTS_PER_LINE = 60;

  function makeFlowLines(seed = 0) {
    while (lines.children.length) lines.remove(lines.children[0]);
    for (let i = 0; i < LINE_COUNT; i++) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(POINTS_PER_LINE * 3);
      let x = (Math.random() - 0.5) * 10;
      let y = (Math.random() - 0.5) * 10;
      let z = (Math.random() - 0.5) * 10;
      for (let j = 0; j < POINTS_PER_LINE; j++) {
        const idx = j * 3;
        positions[idx] = x;
        positions[idx + 1] = y;
        positions[idx + 2] = z;
        const v = new THREE.Vector3(
          simplex.noise3d(x * 0.1 + seed, y * 0.1 + seed, z * 0.1 + seed),
          simplex.noise3d(y * 0.1 + 10 + seed, z * 0.1 + 10 + seed, x * 0.1 + 10 + seed),
          simplex.noise3d(z * 0.1 + 20 + seed, x * 0.1 + 20 + seed, y * 0.1 + 20 + seed)
        ).multiplyScalar(0.2);
        x += v.x;
        y += v.y;
        z += v.z;
      }
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color("hsl(" + ((Math.random() * 40 + 260) | 0) + ", 75%, 70%)"),
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending,
      });
      lines.add(new THREE.Line(geometry, mat));
    }
  }
  makeFlowLines();

  // === Click para regenerar líneas ===
  window.addEventListener("click", (e) => {
    // Si haces click dentro del contenedor, regenera el campo
    if (document.getElementById("hydra-container").contains(e.target)) {
      makeFlowLines(Math.random() * 1000);
    }
  });

  // === Movimiento ===
  let hue = 0;
  let running = true;
  window._threeAnimationId = null;

  const animate = () => {
    if (!running) return;
    window._threeAnimationId = requestAnimationFrame(animate);

    lines.rotation.y += 0.001;
    lines.children.forEach((line, i) => {
      const pos = line.geometry.attributes.position.array;
      for (let j = 0; j < pos.length; j += 3) {
        const nx = pos[j] * 0.03 + i * 0.01;
        const ny = pos[j + 1] * 0.03 + i * 0.01;
        const nz = pos[j + 2] * 0.03;
        pos[j] += simplex.noise3d(nx, ny, nz) * 0.002;
        pos[j + 1] += simplex.noise3d(ny, nz, nx) * 0.002;
        pos[j + 2] += simplex.noise3d(nz, nx, ny) * 0.002;
      }
      line.geometry.attributes.position.needsUpdate = true;
    });

    hue = (hue + 0.0003) % 1;
    bloomPass.strength = 0.8 + Math.sin(performance.now() * 0.001) * 0.15;
    composer.render(scene, camera);
  };
  animate();

  // === Integrar con Hydra (1:1, sin capas extra) ===
  s0.init({ src: renderer.domElement });
  setResolution(window.innerWidth, window.innerHeight);
  src(s0).out(o0);
  render(o0);

  // === Limpieza automática al cambiar patch ===
  function cleanup() {
    running = false;
    cancelAnimationFrame(window._threeAnimationId);
    try {
      renderer.domElement.remove();
    } catch (_) {}
    window.removeEventListener("hydra:cleanup", cleanup);
    console.log("Flowfield + Bloom eliminado correctamente.");
  }
  window.addEventListener("hydra:cleanup", cleanup);
})();
