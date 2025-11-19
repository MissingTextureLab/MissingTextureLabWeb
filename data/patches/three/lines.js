
// --- ESCENA ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 100);
camera.position.set(0, 0, 7);

// --- LUCES ---
scene.add(new THREE.AmbientLight(0xffffff, 0.15));
const light = new THREE.PointLight(0xffffff, 1.5);
light.position.set(5, 5, 5);
scene.add(light);

// --- LÍNEAS + NOISE ---
const LINE_COUNT = 1200;
const POINTS_PER_LINE = 80;
const noise = new SimplexNoise();
const lines = new THREE.Group();
scene.add(lines);

// --- BLOOM ---
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(canvas.clientWidth, canvas.clientHeight),
  0.6,
  0.25,
  0.0
);
composer.addPass(bloomPass);

//  Generador de líneas

function generateFlowLines(seed = 0) {
  lines.clear();

  for (let i = 0; i < LINE_COUNT; i++) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(POINTS_PER_LINE * 3);

    let x = (Math.random() - 0.5) * 10;
    let y = (Math.random() - 0.5) * 10;
    let z = (Math.random() - 0.5) * 10;

    for (let j = 0; j < POINTS_PER_LINE; j++) {
      const idx = j * 3;
      pos[idx] = x;
      pos[idx + 1] = y;
      pos[idx + 2] = z;

      const v = new THREE.Vector3(
        noise.noise3d(x * 0.1 + seed, y * 0.1 + seed, z * 0.1 + seed),
        noise.noise3d(y * 0.1 + 10 + seed, z * 0.1 + 10 + seed, x * 0.1 + 10 + seed),
        noise.noise3d(z * 0.1 + 20 + seed, x * 0.1 + 20 + seed, y * 0.1 + 20 + seed)
      ).multiplyScalar(0.2);

      x += v.x;
      y += v.y;
      z += v.z;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(`hsl(${220 + Math.random() * 60}, 60%, 65%)`),
      opacity: 0.35,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    lines.add(new THREE.Line(geo, mat));
  }
}

generateFlowLines();


// ANIMACIÓN

function animateFlowLines() {
  lines.rotation.y += 0.001;

  lines.children.forEach((line, i) => {
    const pos = line.geometry.attributes.position.array;

    for (let j = 0; j < pos.length; j += 3) {
      const nx = pos[j] * 0.03 + i * 0.01;
      const ny = pos[j + 1] * 0.03 + i * 0.01;
      const nz = pos[j + 2] * 0.03;

      pos[j]     += noise.noise3d(nx, ny, nz) * 0.002;
      pos[j + 1] += noise.noise3d(ny, nz, nx) * 0.002;
      pos[j + 2] += noise.noise3d(nz, nx, ny) * 0.002;
    }

    line.geometry.attributes.position.needsUpdate = true;
  });
}

// LOOP PRINCIPAL

function animate() {
  window._threeAnimationId = requestAnimationFrame(animate);

  animateFlowLines();
  bloomPass.strength = 0.6;

  composer.render();
}

animate();


// RESIZE

function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  composer.setSize(w, h);
}

resize();
window.addEventListener("resize", resize);

// CLICK — regenerar líneas

window.addEventListener("click", (e) => {
  // Evita regenerar si haces click encima de UI
  if (!canvas.contains(e.target)) return;

  generateFlowLines(Math.random() * 1000);
});
