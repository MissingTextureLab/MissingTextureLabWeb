 // === Escena básica ===
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 100);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  camera.position.z = 2;

  // === Partículas ===
  const count = 800;
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 4;
  particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.035,
    transparent: true,
    opacity: 0.9,
  });

  const points = new THREE.Points(particles, material);
  scene.add(points);

  let hue = 0;

  // === Animación ultrasuave ===
  const update = () => {
    const t = performance.now() * 0.0002;

    // 🔹 Oscilación muy lenta en vez de rotación constante
    points.rotation.x = Math.sin(t * 0.3) * 0.15;
    points.rotation.y = Math.cos(t * 0.2) * 0.15;

    // 🔹 Respiración / zoom in-out sutil
    const scale = 1 + Math.sin(t * 0.5) * 0.03;
    points.scale.set(scale, scale, scale);

    // 🔹 Color progresivo
    hue = (hue + 0.0004) % 1;
    material.color.setHSL(hue, 1, 0.5);

    renderer.render(scene, camera);
    requestAnimationFrame(update);
  };
  update();

  // === Integrar con Hydra ===
  s0.init({ src: renderer.domElement });
  src(s0)
    .modulate(osc(2, 0.05, 1.5))  // modulación sutil
    .colorama([0, 0.1, 0.2, 0.3, 0.4, 0.5].ease())
    .saturate(1.2)
    .brightness(-0.05)
    .out();