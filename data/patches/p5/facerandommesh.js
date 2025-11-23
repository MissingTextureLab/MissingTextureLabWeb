let faceMesh;
let video;
let faces = [];
let randomPath = [];

let showNumbers = false;
let randomMode = false;

const faceZones = [
  [0, 16], [70, 90], [90, 105],
  [130, 143], [243, 256],
  [168, 197], [308, 327]
];

let btnNumbers, btnRandom;

let options = {
  maxFaces: 1,
  refineLandmarks: false,
  flipHorizontal: false
};

p.preload = () => {};

p.setup = () => {
  p.createCanvas(640, 480);

  // Video
  video = p.createCapture(p.VIDEO);
  video.size(640, 480);
  video.hide();

  // ⭐ ML5 v1.3.0 → FaceMesh se crea así:
  faceMesh = ml5.faceMesh(video.elt, options, () => {
    console.log("FaceMesh listo!");
  });

  // ⭐ ML5 v1.3.0 → recibe predicciones así:
  faceMesh.on("predict", res => {
    faces = res;
  });

  p.noFill();
  p.strokeWeight(2);

  // Botón números
  btnNumbers = p.createButton("Mostrar números");
  btnNumbers.position(10, 10);
  btnNumbers.mousePressed(() => {
    showNumbers = !showNumbers;
    btnNumbers.html(showNumbers ? "Ocultar números" : "Mostrar números");
  });

  // Botón random
  btnRandom = p.createButton("Randomizar líneas");
  btnRandom.position(10, 40);
  btnRandom.mousePressed(() => {
    randomMode = true;
    makeRandomLines();
  });
};

p.draw = () => {
  p.background(5, 0, 15, 25);
  drawScanlines();

  if (faces.length === 0) return;

  let pts = faces[0].keypoints;

  if (randomMode) drawRandomGlow(pts);
  else drawFaceGlow(pts);

  if (showNumbers) {
    p.noStroke();
    p.fill(138, 11, 210);
    p.textSize(8);
    pts.forEach((pt, i) => p.text(i, pt.x, pt.y));
  }
};

// =========================================================
//                   GLOW + RANDOM LINES
// =========================================================

function drawFaceGlow(pts) {
  p.strokeWeight(6);
  p.stroke(200, 60, 255, 35);
  drawFaceLines(pts);

  p.strokeWeight(3);
  p.stroke(220, 120, 255, 60);
  drawFaceLines(pts);

  p.strokeWeight(2);
  p.stroke(200, 60, 255);
  drawFaceLines(pts);
}

function drawRandomGlow(pts) {
  p.strokeWeight(6);
  p.stroke(200, 60, 255, 35);
  drawRandomLines(pts);

  p.strokeWeight(3);
  p.stroke(220, 120, 255, 60);
  drawRandomLines(pts);

  p.strokeWeight(1.5);
  p.stroke(200, 60, 255);
  drawRandomLines(pts);
}

function makeRandomLines() {
  randomPath = [];
  let total = p.floor(p.random(40, 120));

  let zoneIndex = p.floor(p.random(faceZones.length));
  let zone = faceZones[zoneIndex];

  let current = p.floor(p.random(zone[0], zone[1]));
  randomPath.push(current);

  for (let i = 1; i < total; i++) {
    if (p.random(1) < 0.7) {
      let next = p.floor(p.random(zone[0], zone[1]));
      randomPath.push(next);

    } else {
      zoneIndex = p.floor(p.random(faceZones.length));
      zone = faceZones[zoneIndex];
      let next = p.floor(p.random(zone[0], zone[1]));
      randomPath.push(next);
    }
  }
}

function drawRandomLines(pts) {
  p.stroke(200, 60, 255, 25);
  p.strokeWeight(6);
  p.beginShape();
  randomPath.forEach(id => p.vertex(pts[id].x, pts[id].y));
  p.endShape();

  p.stroke(220, 120, 255, 65);
  p.strokeWeight(3);
  p.beginShape();
  randomPath.forEach(id => p.vertex(pts[id].x, pts[id].y));
  p.endShape();

  p.stroke(200, 60, 255);
  p.strokeWeight(1.8);
  p.beginShape();
  randomPath.forEach(id => p.vertex(pts[id].x, pts[id].y));
  p.endShape();
}

// =========================================================
//                     FACE LINES
// =========================================================

function drawFaceLines(pts) {
  drawStrip(pts, 0, 16);
  drawStrip(pts, 70, 90);
  drawStrip(pts, 90, 105);

  drawLoop(pts, 130, 143);
  drawLoop(pts, 243, 256);

  drawStrip(pts, 168, 197);
  drawLoop(pts, 308, 327);
}

function drawStrip(pts, a, b) {
  p.beginShape();
  for (let i = a; i <= b; i++) p.vertex(pts[i].x, pts[i].y);
  p.endShape();
}

function drawLoop(pts, a, b) {
  p.beginShape();
  for (let i = a; i <= b; i++) p.vertex(pts[i].x, pts[i].y);
  p.endShape(p.CLOSE);
}

function drawScanlines() {
  p.stroke(255, 0, 255, 8);
  p.strokeWeight(1);
  for (let y = 0; y < p.height; y += 6) {
    p.line(0, y, p.width, y);
  }
}