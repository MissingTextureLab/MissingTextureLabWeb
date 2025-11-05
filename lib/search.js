import fs from "fs/promises";

let INDEX = null;

export async function loadIndex() {
  if (INDEX) return INDEX;
  const path = new URL("../data/vectors.json", import.meta.url);
  INDEX = JSON.parse(await fs.readFile(path, "utf8"));
  return INDEX;
}

function cosine(a, b) {
  let dot=0, na=0, nb=0;
  for (let i=0;i<a.length;i++){ const x=a[i], y=b[i]; dot+=x*y; na+=x*x; nb+=y*y; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-10);
}

export async function retrieve(queryEmbedding, k=6, minScore=0.25) {
  const { vectors } = await loadIndex();
  const scored = vectors.map(v => ({ v, score: cosine(queryEmbedding, v.embedding) }))
                        .sort((a,b)=>b.score-a.score)
                        .filter(x => x.score >= minScore)
                        .slice(0,k);
  return scored.map(s => s.v);
}