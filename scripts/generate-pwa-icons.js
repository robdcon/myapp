const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const THEME = "#219591";

function baseSvg(size, { padding = 0 } = {}) {
  const inner = size - padding * 2;
  const radius = Math.round(inner * 0.18);
  const fontSize = Math.round(inner * 0.34);
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="${THEME}"/>
    <rect x="${padding}" y="${padding}" width="${inner}" height="${inner}" rx="${radius}" fill="${THEME}" stroke="white" stroke-opacity="0.15" stroke-width="${Math.max(1, Math.round(size*0.01))}"/>
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Segoe UI, Arial, sans-serif" font-weight="700" font-size="${fontSize}" fill="white">BM</text>
  </svg>`;
}

const outDir = path.join(__dirname, "..", "public", "icons");

async function run() {
  const targets = [
    { name: "icon-192.png", size: 192, padding: 0 },
    { name: "icon-512.png", size: 512, padding: 0 },
    { name: "icon-maskable-512.png", size: 512, padding: Math.round(512 * 0.1) },
    { name: "apple-touch-icon.png", size: 180, padding: 0 },
  ];

  for (const t of targets) {
    const svg = baseSvg(t.size, { padding: t.padding });
    await sharp(Buffer.from(svg)).png().toFile(path.join(outDir, t.name));
    console.log("wrote", t.name);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
