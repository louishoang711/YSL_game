// Gộp trang khung (tv-kiosk) + game (game-local) thành thư mục tĩnh dist/ để đưa lên Render/bất kỳ host tĩnh nào.
//   dist/            <- trang khung (index.html, bg.png, ...)
//   dist/game/       <- game (index.html, assets/...)
// Chạy: node build.mjs   Xem thử: node tv-kiosk/serve.mjs dist  ->  http://localhost:8766/
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, "dist");
const KIOSK = join(ROOT, "tv-kiosk");
const GAME = join(ROOT, "game-local");

if (!existsSync(join(GAME, "index.html"))) throw new Error("Thiếu game-local/index.html");

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

// Chỉ chép file phục vụ web của trang khung (bỏ serve.mjs và start-tv.bat, là đồ chạy máy local)
const KIOSK_FILES = ["index.html", "bg.png", "diamond.png", "confetti.js", "press-fx.js", "game-tweaks.css"];
for (const f of KIOSK_FILES) cpSync(join(KIOSK, f), join(DIST, f));

// Game: bỏ file sao lưu .orig và .gitkeep
cpSync(GAME, join(DIST, "game"), { recursive: true, filter: (src) => !/\.(orig|gitkeep)$/.test(src) });

// Trang này là bản dựng cho sự kiện, không để công cụ tìm kiếm lập chỉ mục
writeFileSync(join(DIST, "robots.txt"), "User-agent: *\nDisallow: /\n");

let files = 0, bytes = 0;
const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); const s = statSync(p); if (s.isDirectory()) walk(p); else { files++; bytes += s.size; } } };
walk(DIST);
console.log(`dist/ sẵn sàng: ${files} file, ${(bytes / 1048576).toFixed(1)} MB`);
