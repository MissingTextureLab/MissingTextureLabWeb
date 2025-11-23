let video;
let asciiDiv;
const density = "Ñ@#W$9876543210?!abc;:+=-,._  ";

const frameInterval = 60;
let lastUpdate = 0;

// ⭐ Añadido nuevo modo "gradientReverse"
let mode = "gradient";
// modos: "gradient", "gradientReverse", "matrixGreen", "matrixPurple"

let modeButton;

p.setup = () => {
  p.noCanvas();

  video = p.createCapture(p.VIDEO);
  video.size(60, 40);
  video.hide();

  asciiDiv = p.createDiv();
  asciiDiv.style("font-family", "monospace");
  asciiDiv.style("font-size", "16px");
  asciiDiv.style("line-height", "14px");
  asciiDiv.style("white-space", "pre");

  asciiDiv.style("background-color", "#050505");
  asciiDiv.style("padding", "10px");
  asciiDiv.style("display", "inline-block");
  asciiDiv.style("width", (60 * 9) + "px");
  asciiDiv.style("margin", "0 auto");

  // ⭐ Botón
  modeButton = p.createButton("Cambiar estilo ASCII");
  modeButton.mousePressed(changeMode);
  modeButton.style("padding", "6px 12px");
  modeButton.style("margin", "12px auto");
  modeButton.style("display", "block");
  modeButton.style("font-size", "14px");
  modeButton.style("border-radius", "6px");

  // estilo minimalista con contorno
  modeButton.style("background", "transparent");
  modeButton.style("color", "#ffffff");
  modeButton.style("border", "2px solid #ffffff");
  modeButton.style("cursor", "pointer");
};

function changeMode() {
  if (mode === "gradient") {
    mode = "gradientReverse";
    modeButton.html("Modo: Gradiente Morado → Verde");

  } else if (mode === "gradientReverse") {
    mode = "matrixGreen";
    modeButton.html("Modo: MATRIX VERDE");

  } else if (mode === "matrixGreen") {
    mode = "matrixPurple";
    modeButton.html("Modo: MATRIX MORADA");

  } else {
    mode = "gradient";
    modeButton.html("Modo: Gradiente Verde → Morado");
  }
}

p.draw = () => {
  const now = p.millis();
  if (now - lastUpdate < frameInterval) return;
  lastUpdate = now;

  video.loadPixels();
  let asciiRows = [];

  for (let y = 0; y < video.height; y++) {
    let row = [];

    for (let x = 0; x < video.width; x++) {

      const ix = video.width - 1 - x;

      const index = (ix + y * video.width) * 4;
      const r = video.pixels[index + 0];
      const g = video.pixels[index + 1];
      const b = video.pixels[index + 2];

      const avg = (r + g + b) / 3;
      const charIndex = p.floor(p.map(avg, 0, 255, density.length - 1, 0));
      const c = density.charAt(charIndex);

      let R, G, B;

      // ⭐ MODOS DE COLOR
      if (mode === "matrixGreen") {
        R = 0;
        G = p.map(avg, 0, 255, 50, 255);
        B = 0;

      } else if (mode === "matrixPurple") {
        R = p.map(avg, 0, 255, 80, 255);
        G = 0;
        B = p.map(avg, 0, 255, 120, 255);

      } else if (mode === "gradientReverse") {
        // ⭐ Nuevo modo morado → verde
        let t = avg / 255;
        R = p.lerp(180, 0, t);
        G = p.lerp(0, 255, t);
        B = p.lerp(255, 0, t);

      } else {
        // Modo original verde → morado
        let t = avg / 255;
        R = p.lerp(0, 180, t);
        G = p.lerp(255, 0, t);
        B = p.lerp(0, 255, t);
      }

      row.push(`<span style="color: rgb(${R}, ${G}, ${B})">${c}</span>`);
    }

    asciiRows.push(row.join(""));
  }

  asciiDiv.html(asciiRows.join("\n"));
};
