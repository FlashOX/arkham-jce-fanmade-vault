// Génère (ou exécute) les commandes `ia upload` pour les items stagés dans dist/print/.
//
//   node tools/upload-print-items.mjs            -> affiche les commandes (dry-run)
//   node tools/upload-print-items.mjs --run      -> lance les uploads
//   node tools/upload-print-items.mjs --run face-au-wendigo le-festival
//
// `ia` doit être configuré (compte archive.org partagé). Voir CONTRIBUTING.md.

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const STAGE = path.join(ROOT, "dist", "print");
const SITE = "https://flashox.github.io/arkham-jce-fanmade-vault/";

const args = process.argv.slice(2);
const run = args.includes("--run");
const only = args.filter((a) => !a.startsWith("--"));

const cat = JSON.parse(readFileSync(path.join(ROOT, "data/catalogue.json"), "utf8"));
const manifest = JSON.parse(readFileSync(path.join(ROOT, "data/print-manifest.json"), "utf8"));
const byId = Object.fromEntries(cat.items.map((i) => [i.id, i]));

const TYPE_LABEL = {
  scenario: "scénario", campagne: "campagne",
  investigateurs: "pack d'enquêteurs", "cartes-joueur": "cartes joueur", autre: "contenu",
};

const q = (s) => (/[^\w@%+=:,./-]/.test(s) ? `"${s.replace(/(["$`\\])/g, "\\$1")}"` : s);

const dirs = readdirSync(STAGE, { withFileTypes: true })
  .filter((e) => e.isDirectory() && e.name.startsWith("ahlcg-fr-"))
  .map((e) => e.name)
  .filter((n) => !only.length || only.includes(n.replace(/^ahlcg-fr-/, "")));

if (!dirs.length) { console.error("Rien dans dist/print/ (lance `npm run build:print`)."); process.exit(1); }

for (const dirName of dirs) {
  const id = dirName.replace(/^ahlcg-fr-/, "");
  const fiche = byId[id];
  const man = manifest.items[id] || {};
  const cycle = fiche?.cycle || "";
  const files = readdirSync(path.join(STAGE, dirName)).sort();

  const md = [
    `title:${fiche?.titre || id} — ${TYPE_LABEL[fiche?.type] || "contenu"} fan-made${cycle ? " (" + cycle + ")" : ""}`,
    `mediatype:texts`,
    `language:fre`,
    man.creator ? `creator:${man.creator}` : null,
    `subject:Horreur à Arkham JCE`,
    `subject:fan-made`,
    `subject:français`,
    cycle ? `subject:${cycle}` : null,
    `description:${fiche?.titre || id} — contenu fan-made pour «Horreur à Arkham : le JCE»${cycle ? ", " + cycle + " (Les Dossiers d'Arkham)" : ""}. Planche d'impression A4 + images de cartes avec bleed + guide. Fiche : ${SITE}`,
  ].filter(Boolean);

  const ia = [
    "upload", dirName,
    ...files.map((f) => `dist/print/${dirName}/${f}`),
    ...md.flatMap((m) => [`--metadata=${m}`]),
    "--retries", "5",
  ];

  console.log(`\n# ${dirName}  (${files.length} fichiers)`);
  console.log(["ia", ...ia.map(q)].join(" "));

  if (run) {
    execFileSync("ia", ia, { cwd: ROOT, stdio: "inherit" });
  }
}

if (!run) console.log(`\n# Relance avec --run pour exécuter. Rappel : supprimer l'ancien zip de Face au Wendigo d'abord :`);
if (!run) console.log(`ia delete ahlcg-fr-face-au-wendigo ahlcg-fr-face-au-wendigo.zip`);
