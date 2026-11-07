// Server tĩnh chạy local. Chỉ cần Node.
//   node tv-kiosk/serve.mjs        -> "/" = trang khung (tv-kiosk), "/game/" = game (game-local), cổng 8765 (bản đang sửa)
//   node tv-kiosk/serve.mjs dist   -> phục vụ thư mục dist/ y như trên Render, cổng 8766 (bản sẽ đưa lên mạng)
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const KIOSK = fileURLToPath(new URL(".", import.meta.url));
const DIST_MODE = process.argv[2] === "dist";
const DIST = join(KIOSK, "..", "dist");
const GAME = join(KIOSK, "..", "game-local");
const PORT = DIST_MODE ? 8766 : 8765;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png",
  ".webp": "image/webp", ".gif": "image/gif", ".mp3": "audio/mpeg", ".woff2": "font/woff2", ".woff": "font/woff",
  ".glb": "model/gltf-binary", ".hdr": "application/octet-stream", ".wasm": "application/wasm", ".txt": "text/plain",
};

createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p === "/game") { res.writeHead(301, { Location: "/game/" }).end(); return; }
  let base = DIST_MODE ? DIST : KIOSK;
  if (!DIST_MODE && p.startsWith("/game/")) { base = GAME; p = p.slice(5); }
  if (p.endsWith("/")) p += "index.html";
  const file = normalize(join(base, p));
  if (!file.startsWith(base)) { res.writeHead(403).end(); return; } // chặn ../
  try {
    const data = await readFile(file);
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream", "Cache-Control": "no-cache" }).end(data);
  } catch { res.writeHead(404).end("not found"); }
}).on("error", (e) => { console.log(e.code === "EADDRINUSE" ? `Server đã chạy sẵn: http://localhost:${PORT}/` : e.message); process.exit(0); })
  .listen(PORT, "127.0.0.1", () => console.log(`Mở trình duyệt: http://localhost:${PORT}/  (F11 để toàn màn hình, Ctrl+C để tắt)`));
