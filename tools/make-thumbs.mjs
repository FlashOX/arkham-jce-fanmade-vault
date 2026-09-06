// Génère les miniatures des fiches à partir des couvertures de paquet.
//
// Les couvertures fan-made suivent un gabarit commun : bandeau logo en haut,
// illustration au centre, titre en bas. On recadre la bande illustrée puis on
// redimensionne. Le cadrage fin dans la fiche est fait en CSS (object-fit:cover).
//
// Usage : npm run thumbs
// Dépend de `sharp` (devDependency).

import { mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "img", "thumbs");
const OUT_WIDTH = 640; // largeur cible de la miniature
const JPEG_QUALITY = 80;

// Bande illustrée en fraction de la hauteur de la couverture (gabarit "Ligue").
const ART_TOP = 0.2;
const ART_BOTTOM = 0.82;

// id de fiche  ->  soit "sous-dossier/fichier", soit { src, top?, bottom? }
// pour surcharger la bande illustrée quand la couverture s'écarte du gabarit.
const MAP = {
  // --- Cycle 1 (couvertures gabarit "Ligue") ---
  "face-au-wendigo": "cycle 1/face_a10.jpg",
  "jouet-dune-illusion": "cycle 1/jouet_10.jpg",
  "le-festival": "cycle 1/festiv10.jpg",
  "le-palais-du-rire": "cycle 1/couv_l10.jpg",
  "le-pont-des-soupirs": "cycle 1/le_pon10.jpg",
  "le-wyrm-de-pensher": "cycle 1/le_wyr10.jpg",
  "les-seuils-de-la-croyance": "cycle 1/les_se10.jpg",
  "pulsions-cynegetiques": { src: "cycle 1/00_cou13.jpg", top: 0.19, bottom: 0.76 },

  // --- Cycle 2 ---
  "desolation-a-bord-du-constellation": "covers/S2/desolation-a-bord-du-constellation.jpg",
  "la-symphonie-derich-zann": { src: "covers/S2/symphonie d'erich zann.png", top: 0.2, bottom: 0.8 },
  "les-chiens-de-tindalos": "covers/S2/les-chiens-de-tindalos.jpg",
  "au-bord-du-gouffre": "covers/S2/au-bord-du-gouffre.jpg",
  "sang-verse-a-salem": "covers/S2/sang-verse-a-salem.jpg",
  "la-couleur-tombee-du-ciel": "covers/S2/la-couleur-tombee-du-ciel.jpg",
  "levenement-de-svalbard": "covers/S2/levenement-de-svalbard.jpg",
  "lhotel-du-grand-chene": "covers/S2/lhotel-du-grand-chene.jpg",
  // illustration pleine page (pas le gabarit) -> on garde le haut (visage)
  "investigateurs-fan-made-cycle-2": { src: "covers/S2/investigateurs.png", top: 0, bottom: 0.58 },
};

await mkdir(OUT_DIR, { recursive: true });

let done = 0;
for (const [id, entry] of Object.entries(MAP)) {
  const rel = typeof entry === "string" ? entry : entry.src;
  const fTop = (typeof entry === "object" && entry.top) || ART_TOP;
  const fBottom = (typeof entry === "object" && entry.bottom) || ART_BOTTOM;
  const src = path.join(ROOT, "img", rel);
  if (!existsSync(src)) {
    console.warn(`! source absente, ignoré : ${rel}`);
    continue;
  }
  const { width, height } = await sharp(src).metadata();
  const top = Math.round(height * fTop);
  const cropH = Math.round(height * (fBottom - fTop));

  const out = path.join(OUT_DIR, `${id}.jpg`);
  await sharp(src)
    .extract({ left: 0, top, width, height: cropH })
    .resize({ width: OUT_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toFile(out);

  const small = width < OUT_WIDTH ? "  (source basse résolution)" : "";
  console.log(`✓ ${id}.jpg  ←  ${rel}${small}`);
  done++;
}

// Récap des fichiers sources non mappés, dossier par dossier
const usedRel = new Set(
  Object.values(MAP).map((e) => (typeof e === "string" ? e : e.src)),
);
const srcDirs = [...new Set([...usedRel].map((r) => path.posix.dirname(r)))];
for (const d of srcDirs) {
  const present = await readdir(path.join(ROOT, "img", d)).catch(() => []);
  const unused = present.filter(
    (f) => /\.(jpe?g|png)$/i.test(f) && !usedRel.has(`${d}/${f}`),
  );
  if (unused.length) console.log(`\nNon mappés dans img/${d}/ : ${unused.join(", ")}`);
}

console.log(`\n${done} miniature(s) écrite(s) dans img/thumbs/`);
