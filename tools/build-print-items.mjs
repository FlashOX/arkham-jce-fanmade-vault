// Prépare le contenu des items archive.org à partir des dossiers sources.
//
// Lit data/print-manifest.json et produit, par fiche :
//   dist/print/ahlcg-fr-<id>/
//     ahlcg-fr-<id>-guide.pdf          (si présent)
//     ahlcg-fr-<id>-planche-a4.pdf     (si présent)
//     ahlcg-fr-<id>-cartes-avec-bleed.zip
//
// Usage :
//   node tools/build-print-items.mjs                 -> toutes les entrées du manifeste
//   node tools/build-print-items.mjs face-au-wendigo le-festival
//
// Dépendances : 7-Zip (`7z`) sur le PATH (ou var SEVENZIP).

import { existsSync, mkdirSync, copyFileSync, statSync, rmSync, readdirSync } from "node:fs";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "dist", "print");
const MANIFEST = path.join(ROOT, "data", "print-manifest.json");

const SEVENZIP_CANDIDATES = [
  process.env.SEVENZIP,
  "7z",
  "C:/Users/nasso/scoop/shims/7z.exe",
  "C:/Program Files/7-Zip/7z.exe",
].filter(Boolean);

function runFrom(candidates, args, opts) {
  for (const bin of candidates.filter(Boolean)) {
    try {
      return execFileSync(bin, args, { stdio: ["ignore", "ignore", "inherit"], ...opts });
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
  }
  throw new Error(`binaire introuvable (essayé : ${candidates.filter(Boolean).join(", ")})`);
}
const sevenzip = (args, opts) => runFrom(SEVENZIP_CANDIDATES, args, opts);
const pdfunite = (args, opts) =>
  runFrom(
    [process.env.PDFUNITE, "pdfunite", "C:/Users/nasso/scoop/shims/pdfunite.exe"],
    args,
    opts,
  );

const mo = (n) => (n / 1048576).toFixed(1).padStart(7) + " Mo";
const dirSize = (d) =>
  readdirSync(d, { withFileTypes: true }).reduce((s, e) => {
    const p = path.join(d, e.name);
    return s + (e.isDirectory() ? dirSize(p) : statSync(p).size);
  }, 0);

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const only = process.argv.slice(2);
const entries = Object.entries(manifest.items).filter(([id]) => !only.length || only.includes(id));
if (!entries.length) {
  console.error(only.length ? `Aucune entrée : ${only.join(", ")}` : "Manifeste vide.");
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
let grand = 0;
const summary = [];

for (const [id, it] of entries) {
  const root = manifest.roots[it.source];
  if (!root) { console.error(`! ${id} : source "${it.source}" inconnue`); continue; }
  const itemDir = path.join(OUT, `ahlcg-fr-${id}`);
  rmSync(itemDir, { recursive: true, force: true });
  mkdirSync(itemDir, { recursive: true });

  const files = [];
  const put = (relSrc, destName) => {
    if (!relSrc) return;
    const src = path.resolve(root, relSrc);
    if (!existsSync(src)) { console.error(`! ${id} : source absente ${relSrc}`); return; }
    const dest = path.join(itemDir, destName);
    copyFileSync(src, dest);
    files.push([destName, statSync(dest).size]);
  };

  put(it.guide, `ahlcg-fr-${id}-guide.pdf`);

  // planche :
  //   "chemin"            -> un PDF copié
  //   ["a.pdf","b.pdf"]   -> PDF fusionnés (pdfunite)
  //   { impose: "dir" }   -> images de cartes imposées en A4 (tools/impose.mjs)
  if (it.planche && typeof it.planche === "object" && !Array.isArray(it.planche) && it.planche.impose) {
    const dir = path.resolve(root, it.planche.impose);
    const dest = path.join(itemDir, `ahlcg-fr-${id}-planche-a4.pdf`);
    if (!existsSync(dir)) console.error(`! ${id} : dossier à imposer absent ${it.planche.impose}`);
    else {
      execFileSync("node", [path.join(ROOT, "tools/impose.mjs"), dir, dest], { stdio: "inherit" });
      files.push([path.basename(dest), statSync(dest).size]);
    }
  } else if (Array.isArray(it.planche)) {
    const srcs = it.planche.map((rel) => path.resolve(root, rel));
    const missing = srcs.filter((p) => !existsSync(p));
    if (missing.length) {
      console.error(`! ${id} : ${missing.length} PDF planche absent(s), ex. ${path.basename(missing[0])}`);
    } else {
      // pdfunite (poppler Windows) plante sur les chemins accentués :
      // on recopie d'abord les sources sous des noms ASCII dans un dossier temp.
      const tmp = path.join(itemDir, "_merge");
      mkdirSync(tmp, { recursive: true });
      const ascii = srcs.map((s, i) => {
        const d = path.join(tmp, `${String(i).padStart(3, "0")}.pdf`);
        copyFileSync(s, d);
        return d;
      });
      const dest = path.join(itemDir, `ahlcg-fr-${id}-planche-a4.pdf`);
      pdfunite([...ascii, dest]);
      rmSync(tmp, { recursive: true, force: true });
      files.push([path.basename(dest), statSync(dest).size]);
    }
  } else {
    put(it.planche, `ahlcg-fr-${id}-planche-a4.pdf`);
  }

  if (it.imagesDir) {
    const imgSrc = path.resolve(root, it.imagesDir);
    if (!existsSync(imgSrc)) {
      console.error(`! ${id} : dossier images absent ${it.imagesDir}`);
    } else {
      const suffix = it.imagesBleed === false ? "cartes-sans-bleed" : "cartes-avec-bleed";
      const zip = path.join(itemDir, `ahlcg-fr-${id}-${suffix}.zip`);
      sevenzip(["a", "-tzip", "-mx=0", "-bso0", "-bsp0", zip, "."], { cwd: imgSrc });
      files.push([path.basename(zip), statSync(zip).size]);
    }
  }

  const total = files.reduce((s, [, n]) => s + n, 0);
  grand += total;
  summary.push([id, files, total, it.note]);
}

console.log(`\nStaging -> ${path.relative(ROOT, OUT)}\n`);
for (const [id, files, total, note] of summary) {
  console.log(`ahlcg-fr-${id}`);
  for (const [n, s] of files) console.log(`   ${mo(s)}  ${n}`);
  if (!files.length) console.log("   (aucun fichier !)");
  if (note) console.log(`   ⚠ ${note}`);
  console.log(`   ${"".padStart(7)}${"".padStart(4)}------  total ${mo(total)}\n`);
}
console.log(`TOTAL : ${mo(grand)} pour ${summary.length} item(s)`);
