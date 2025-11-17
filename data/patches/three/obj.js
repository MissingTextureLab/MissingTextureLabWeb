// ==================================================
// THREE.js HOLOGRAMA MAYA – Estilo clásico (wireframe visible)
// + cambio de modelos + control de escala + rotación 3D avanzada
// ==================================================

function getSize() {
  return {
    w: canvas.clientWidth || 800,
    h: canvas.clientHeight || 600
  };
}

let { w, h } = getSize();

// =======================
// 🌌 ESCENA
// =======================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x01030a);

// =======================
// 🎥 CÁMARA
// =======================
const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
camera.position.set(0, 1, 2.5);

// =======================
// 🖥 RENDERER
// =======================
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(w, h);

// =======================
// 🌀 CONTROLS
// =======================
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 0.4, 0);

// ==================================================
// ⭐ HOLOGRAMA (wireframe estilo Maya – versión clásica)
// ==================================================

function createHologram(mesh) {
  const geo = mesh.geometry;
  const group = new THREE.Group();

  // --------------------------------------------------
  // 1) SOLO WIREFRAME — limpio, exterior, luminoso
  // --------------------------------------------------
  const edges = new THREE.EdgesGeometry(geo, 10);
  const wire = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({
      color: 0x7fe4ff,
      transparent: true,
      opacity: 1.0,
      linewidth: 1.2,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );

  wire.renderOrder = 999;
  group.add(wire);

  // --------------------------------------------------
  // 2) SUPER GLOW SUAVE (solo borde, no volumen)
  // --------------------------------------------------
  const glow = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({
      color: 0x0077cc,
      transparent: true,
      opacity: 0.05,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    })
  );
  glow.scale.multiplyScalar(1.04);
  glow.renderOrder = 1;
  group.add(glow);

  return group;
}

// =================================================
// ✨ PARTICLE SPARKS
// ==================================================
let sparks, sparkPositions, sparkSpeeds;

function createSparks() {
  const n = 220;
  sparkPositions = new Float32Array(n * 3);
  sparkSpeeds = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 1.2 + Math.random() * 0.4;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const y = -0.3 + Math.random() * 0.8;

    const idx = i * 3;
    sparkPositions[idx] = x;
    sparkPositions[idx + 1] = y;
    sparkPositions[idx + 2] = z;

    sparkSpeeds[i] = 0.1 + Math.random() * 0.2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));

  sparks = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color: 0x66ddff,
      size: 0.012,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );

  scene.add(sparks);
}

createSparks();

// ==================================================
// 📂 MODELOS A ROTAR (scale + initial rotation)
// ==================================================
const modelList = [
  { path: "models/about/computer.glb",  scale: 0.03,  initialRotation: { x:0, y:0,   z:0} },
  { path: "models/about/piano.glb",     scale: 0.005, initialRotation: {x:0, y:0,   z:0} },
  { path: "models/about/metronome.glb", scale: 0.5,   initialRotation: {x:0, y:0, z:0} },
  { path: "models/gear.glb",            scale: 1.0,   initialRotation: {x:0, y:0,   z:0} }
];

let modelRoot = null;
let currentModelIndex = -1;
const loader = new GLTFLoader();

// ==================================================
// 🚀 LOAD MODEL
// ==================================================
function loadModel(path, scaleValue, initialRotation) {
  loader.load(
    path,
    gltf => {
      modelRoot = new THREE.Group();

      gltf.scene.traverse(obj => {
        if (obj.isMesh) {

          // 🔥 NORMALIZAR su rotación interna
          obj.rotation.set(0, 0, 0);

          const holo = createHologram(obj);

          modelRoot.add(holo);
        }
      });

      // Escala aplicada al root
      modelRoot.scale.set(scaleValue, scaleValue, scaleValue);

      // Rotación inicial correcta
      if (initialRotation) {
        modelRoot.rotation.set(
          initialRotation.x,
          initialRotation.y,
          initialRotation.z
        );
      }

      modelRoot.position.y = 0.1;

      scene.add(modelRoot);
      fadeInModel();
    },
    null,
    err => console.error("❌ Load error:", err)
  );
}

// ==================================================
// 🔁 AUTO-SWITCH
// ==================================================
function loadNextModel() {
  currentModelIndex = (currentModelIndex + 1) % modelList.length;
  const m = modelList[currentModelIndex];

  fadeOutModel(() => loadModel(m.path, m.scale, m.initialRotation));

  scheduleNextModel();
}

const minChangeTime = 5;
const maxChangeTime = 10;

function scheduleNextModel() {
  const t = minChangeTime + Math.random() * (maxChangeTime - minChangeTime);
  setTimeout(loadNextModel, t * 1000);
}

loadNextModel();

// ==================================================
// ✨ FADE TRANSITIONS
// ==================================================
function fadeOutModel(done) {
  if (!modelRoot) return done();

  let t = 0;
  (function fade() {
    t += 0.05;
    modelRoot.traverse(o => {
      if (o.material) {
        o.material.transparent = true;
        o.material.opacity = 1 - t;
      }
    });

    if (t >= 1) {
      scene.remove(modelRoot);
      modelRoot = null;
      done();
    } else requestAnimationFrame(fade);
  })();
}

function fadeInModel() {
  if (!modelRoot) return;

  modelRoot.traverse(o => {
    if (o.material) {
      o.material.transparent = true;
      o.material.opacity = 0;
    }
  });

  let t = 0;
  (function fade() {
    t += 0.05;
    modelRoot.traverse(o => {
      if (o.material) o.material.opacity = Math.min(1, t);
    });

    if (t < 1) requestAnimationFrame(fade);
  })();
}

// ==================================================
// 🎞 POST-PROCESADO (Bloom + Scanlines suave)
// ==================================================
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloom = new UnrealBloomPass(
  new THREE.Vector2(w, h),
  0.00,
  0.00,
  0.0
);
composer.addPass(bloom);

const ScanShader = {
  uniforms: { tDiffuse:{ value:null }, time:{ value:0 } },
  vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader:`
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform float time;

    void main() {
      vec3 col = texture2D(tDiffuse, vUv).rgb;
      float scan = sin(vUv.y * 950.0 + time * 18.0) * 0.025;
      col -= scan;
      gl_FragColor = vec4(col, 1.0);
    }
  `
};
const scanPass = new ShaderPass(ScanShader);
composer.addPass(scanPass);

// ==================================================
// 🔄 RESPONSIVE
// ==================================================
function resize() {
  ({ w, h } = getSize());
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
}
window.addEventListener("resize", resize);
resize();

// ==================================================
// 🎬 ANIMACIÓN
// ==================================================
const clock = new THREE.Clock();

function animate() {
  window._threeAnimationId = requestAnimationFrame(animate);

  const t = clock.getElapsedTime();
  scanPass.uniforms.time.value = t;

  if (modelRoot) {
    const dt = clock.getDelta();

    // 🔥 Rotación 3D completa para mostrar profundidad
    modelRoot.rotation.y += 0.6 * dt;
    modelRoot.rotation.x = Math.sin(t * 0.6) * 0.35;
    modelRoot.rotation.z = Math.cos(t * 0.4) * 0.25;

    // Levitar suavemente
    modelRoot.position.y = 0.1 + Math.sin(t * 2.0) * 0.015;
  }

  // Sparks
  if (sparks) {
    const posAttr = sparks.geometry.attributes.position;
    for (let i = 0; i < sparkSpeeds.length; i++) {
      const id = i * 3;
      posAttr.array[id + 1] += sparkSpeeds[i] * 0.01;
      if (posAttr.array[id + 1] > 0.7) posAttr.array[id + 1] = -0.3;
    }
    posAttr.needsUpdate = true;
    sparks.rotation.y += 0.06;
  }

  controls.update();
  composer.render();
}

animate();
