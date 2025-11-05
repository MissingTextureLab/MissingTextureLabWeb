// api/chat.js — versión Node 22 + openai@6.8.0
import "dotenv/config";
import OpenAI from "openai";
import { retrieve } from "../lib/search.js";
import http from "http";

// Cliente OpenAI
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function handleChat(req, res) {
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Método no permitido" }));
    return;
  }

  let body = "";
  for await (const chunk of req) body += chunk;
  const { messages = [] } = JSON.parse(body || "{}");

  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";

  // 1) Embedding del mensaje
  const emb = await client.embeddings.create({
    model: process.env.OPENAI_EMB_MODEL || "text-embedding-3-large",
    input: lastUser,
  });

  // 2) Buscar contexto
  const hits = await retrieve(emb.data[0].embedding, 6);
  const context = hits.map((h) => `### ${h.title}\n${h.text}`).join("\n\n");

  // 3) Mensajes finales
  const system = `
Eres "Leandro", el asistente del portfolio MissingTexture_Lab (Andrés Vidal).
Usa el contexto para responder sobre su trabajo, arte, VR y música.
`;

  const messagesFull = [
    { role: "system", content: system },
    { role: "system", content: "CONTEXT:\n" + context },
    ...messages,
  ];

  // 4) Stream de la respuesta
  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Transfer-Encoding": "chunked",
  });

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: messagesFull,
    stream: true,
  });

  for await (const event of response.stream) {
    const delta = event.choices?.[0]?.delta?.content;
    if (delta) res.write(delta);
  }

  res.end();
}

// Pequeño servidor local (para probar sin Vercel)
const server = http.createServer((req, res) => {
  if (req.url === "/api/chat") return handleChat(req, res);
  res.writeHead(404);
  res.end("Not found");
});

const PORT = 3000;
server.listen(PORT, () => console.log(`💬 API local escuchando en http://localhost:${PORT}/api/chat`));
