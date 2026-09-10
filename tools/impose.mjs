// Impose un dossier d'images de cartes (avec fond perdu) en planches A4 prêtes
// à imprimer : 3×3 cartes par page, traits de coupe, recto/verso pour duplex
// (bord long). Les cartes paysage sont pivotées pour rentrer dans la grille.
//
// Attendu : fichiers nommés "<n> - <Nom>-Recto.<ext>" / "-Verso.<ext>"
// (ext : jpg / jpeg / png). Taille carte = 63.5 × 88.9 mm + 3.2 mm de fond
// perdu sur chaque bord (gabarit Arkham "Poker - 3.2 marge").
//
//   node tools/impose.mjs "<dossier images>" "<sortie.pdf>"

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";

const MM = 72 / 25.4;
const A4 = [210 * MM, 297 * MM];
const COLS = 3, ROWS = 3;
const TRIM_W = 63.5 * MM, TRIM_H = 88.9 * MM; // carte finie
const BLEED = 3.2 * MM;                       // fond perdu par bord
const CARD_W = TRIM_W + 2 * BLEED, CARD_H = TRIM_H + 2 * BLEED;
const TICK_LEN = 5 * MM, TICK_GAP = 0.8 * MM, TICK_TH = 0.4;

const [, , SRC, OUT] = process.argv;
if (!SRC || !OUT) {
  console.error('Usage : node tools/impose.mjs "<dossier images>" "<sortie.pdf>"');
  process.exit(1);
}

// --- regroupe les images en cartes (recto/verso) ---
const rx = /^(.*?)-(recto|verso)\.(jpe?g|png)$/i;
const cards = new Map();
for (const f of readdirSync(SRC)) {
  const m = f.match(rx);
  if (!m) continue;
  const key = m[1].trim();
  if (!cards.has(key)) cards.set(key, {});
  cards.get(key)[m[2].toLowerCase()] = path.join(SRC, f);
}
const list = [...cards.entries()]
  .sort(([a], [b]) => a.localeCompare(b, "fr", { numeric: true }))
  .map(([name, v]) => ({ name, recto: v.recto, verso: v.verso }));

if (!list.length) { console.error("Aucune carte trouvée dans " + SRC); process.exit(1); }
const missingVerso = list.filter((c) => !c.verso).map((c) => c.name);
if (missingVerso.length) console.warn("! sans verso : " + missingVerso.join(", "));

// --- prépare les octets d'image (rotation des cartes paysage) ---
async function prep(file) {
  const buf = readFileSync(file);
  const meta = await sharp(buf).metadata();
  const landscape = meta.width > meta.height;
  const isPng = /\.png$/i.test(file);
  if (!landscape) return { bytes: buf, png: isPng };
  // paysage -> portrait : rotation 90° horaire, ré-encodage JPEG qualité haute
  const out = await sharp(buf).rotate(90).jpeg({ quality: 92 }).toBuffer();
  return { bytes: out, png: false };
}

const doc = await PDFDocument.create();
const embed = async (file, cache) => {
  if (cache.has(file)) return cache.get(file);
  const { bytes, png } = await prep(file);
  const img = png ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
  cache.set(file, img);
  return img;
};
const cache = new Map();

const [pw, ph] = A4;
const blockW = COLS * TRIM_W, blockH = ROWS * TRIM_H;
const bx = (pw - blockW) / 2;          // gauche du bloc
const by = (ph - blockH) / 2;          // bas du bloc
const cellX = (c) => bx + c * TRIM_W;
const cellY = (r) => by + (ROWS - 1 - r) * TRIM_H; // r=0 en haut

function cropMarks(page) {
  const line = (x1, y1, x2, y2) =>
    page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: TICK_TH });
  for (let c = 0; c <= COLS; c++) {
    const x = cellX(c);
    line(x, by + blockH + TICK_GAP, x, by + blockH + TICK_GAP + TICK_LEN);
    line(x, by - TICK_GAP, x, by - TICK_GAP - TICK_LEN);
  }
  for (let r = 0; r <= ROWS; r++) {
    const y = by + r * TRIM_H;
    line(bx - TICK_GAP, y, bx - TICK_GAP - TICK_LEN, y);
    line(bx + blockW + TICK_GAP, y, bx + blockW + TICK_GAP + TICK_LEN, y);
  }
}

const per = COLS * ROWS;
let pages = 0;
for (let g = 0; g < list.length; g += per) {
  const group = list.slice(g, g + per);

  // ---- page recto ----
  const front = doc.addPage(A4);
  for (let i = 0; i < group.length; i++) {
    const c = i % COLS, r = Math.floor(i / COLS);
    const img = await embed(group[i].recto, cache);
    front.drawImage(img, { x: cellX(c) - BLEED, y: cellY(r) - BLEED, width: CARD_W, height: CARD_H });
  }
  cropMarks(front);

  // ---- page verso (colonnes miroir pour duplex bord long) ----
  const back = doc.addPage(A4);
  for (let i = 0; i < group.length; i++) {
    if (!group[i].verso) continue;
    const c = COLS - 1 - (i % COLS), r = Math.floor(i / COLS);
    const img = await embed(group[i].verso, cache);
    back.drawImage(img, { x: cellX(c) - BLEED, y: cellY(r) - BLEED, width: CARD_W, height: CARD_H });
  }
  cropMarks(back);
  pages += 2;
}

writeFileSync(OUT, await doc.save());
console.log(`${list.length} cartes -> ${pages} pages A4 -> ${OUT}`);
