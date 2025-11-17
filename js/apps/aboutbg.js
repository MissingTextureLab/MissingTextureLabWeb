// about_hologram_background.js
// Mantiene INTACTO tu holograma Maya, pero envuelto en una función.

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

export function initHologramBackground(canvas) {
  // ============================
  //  CAMERA + RESOLUTION HELPERS
  // ============================
  function getSize() {
    return {
      w: canvas.clientWidth || 800,
      h: canvas.clientHeight || 600
    };
  }

  let { w, h } = getSize();

  // ============================
  // SCENE
  // ============================
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x01030a);

  // ============================
  // CAMERA
  // ============================
  const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
  camera.position.set(0, 1, 2.5);

  // ============================
  // RENDERER
  // ============================
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
  });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(w, h);

  // ============================
  // CONTROLS
  // ============================
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 0.4, 0);

  // =========================================================================
  // ✨ HOLOGRAM BUILDERS
  // =========================================================================

  function createHologram(mesh) {
    const geo = mesh.geometry;
    const group = new THREE.Group();

    const face = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({
        color: 0x009dff,
        transparent: true,
        opacity: 0.15,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    group.add(face);

    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(geo),
      new THREE.LineBasicMaterial({
        color: 0x7fe4ff,
        transparent: true,
        opacity: 0.9
      })
    );
    group.add(wire);

    const outline = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({
        color: 0x33ccff,
        transparent: true,
        opacity: 0.22,
        side: THREE.BackSide
      })
    );
    outline.scale.multiplyScalar(1.03);
    group.add(outline);

    const glow = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({
        color: 0x44ddff,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    glow.scale.multiplyScalar(1.06);
    group.add(glow);

    return group;
  }

  // =========================================================================
  // ✨ SPARKS
  // =========================================================================
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

  // =========================================================================
  // 📂 MODELS
  // =========================================================================
  const modelList = [
    { path: "models/about/computer.glb", scale: 0.03, initialRotation: { x:0, y:0, z:0 } },
    { path: "models/about/piano.glb",    scale: 0.005, initialRotation: { x:0, y:0, z:0 } },
    { path: "models/about/metronome.glb",scale: 0.5,   initialRotation: { x:0, y:0, z:0 } },
    { path: "models/gear.glb",           scale: 1.0,   initialRotation: { x:0, y:0, z:0 } }
  ];

  let modelRoot = null;
  let currentModelIndex = -1;
  const loader = new GLTFLoader();

  function loadModel(path, scaleValue, initialRotation) {
    loader.load(
      path,
      gltf => {
        modelRoot = new THREE.Group();

        gltf.scene.traverse(obj => {
          if (obj.isMesh) {
            obj.rotation.set(0, 0, 0);

            const holo = createHologram(obj);
            modelRoot.add(holo);
          }
        });

        modelRoot.scale.set(scaleValue, scaleValue, scaleValue);

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
      }
    );
  }

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

  // =========================================================================
  // FADE IN/OUT
  // =========================================================================
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

  // =========================================================================
  // POST-PROCESSING
  // =========================================================================
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(
    new THREE.Vector2(w, h),
    0.02,
    0.15,
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

  // =========================================================================
  // RESPONSIVE
  // =========================================================================
  function resize() {
    ({ w, h } = getSize());

    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    composer.setSize(w, h);
  }

  window.addEventListener("resize", resize);
  resize();

  // =========================================================================
  // ANIMATION LOOP
  // =========================================================================
  const clock = new THREE.Clock();

  function animate() {
    window._aboutHologramId = requestAnimationFrame(animate);

    const t = clock.getElapsedTime();
    scanPass.uniforms.time.value = t;

    if (modelRoot) {
      const dt = clock.getDelta();

      modelRoot.rotation.y += 0.6 * dt;
      modelRoot.rotation.x = Math.sin(t * 0.6) * 0.35;
      modelRoot.rotation.z = Math.cos(t * 0.4) * 0.25;

      modelRoot.position.y = 0.1 + Math.sin(t * 2.0) * 0.015;
    }

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

  // Return API in case you want to stop or refresh
  return { scene, camera, renderer };
}
