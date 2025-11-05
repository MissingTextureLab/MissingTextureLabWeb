import fs from "fs/promises";
import crypto from "crypto";

// Usa la librería oficial (instala: npm i openai)
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL_EMB = process.env.OPENAI_EMB_MODEL || "text-embedding-3-large";

const srcPath = new URL("../data/portfolio.json", import.meta.url);
const outPath = new URL("../data/vectors.json", import.meta.url);

const data = JSON.parse(await fs.readFile(srcPath, "utf8"));

function hashId(s){ return crypto.createHash("sha1").update(s).digest("hex").slice(0,16); }

const vectors = [];
for (const item of data) {
  const content = `${item.title}\n${item.section}\n${item.text}`;
  const { data: embRes } = await client.embeddings.create({
    model: MODEL_EMB,
    input: content
  });
  vectors.push({
    id: item.id || hashId(content),
    title: item.title,
    section: item.section,
    text: item.text,
    embedding: embRes[0].embedding
  });
  console.log("Emb:", item.title);
}

await fs.writeFile(outPath, JSON.stringify({ model: MODEL_EMB, vectors }, null, 2));
console.log("Guardado <3", outPath.pathname);
