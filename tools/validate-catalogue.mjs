// Valide data/catalogue.json contre data/catalogue.schema.json.
// Usage : npm run validate

import { readFile } from "node:fs/promises";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(import.meta.dirname, "..");
const load = async (p) => JSON.parse(await readFile(path.join(ROOT, p), "utf8"));

const schema = await load("data/catalogue.schema.json");
const data = await load("data/catalogue.json");

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

if (validate(data)) {
  console.log(`✓ catalogue.json valide — ${data.items.length} fiches.`);
} else {
  console.error("✗ catalogue.json invalide :");
  for (const e of validate.errors) {
    console.error(`  ${e.instancePath || "/"} ${e.message}`);
  }
  process.exit(1);
}

// Contrôles complémentaires non exprimables en JSON Schema
let warn = 0;
const ids = new Set();
for (const it of data.items) {
  if (ids.has(it.id)) { console.warn(`! id en double : ${it.id}`); warn++; }
  ids.add(it.id);
  if (it.cycle && data.cycles && !data.cycles[it.cycle]) {
    console.warn(`! ${it.id} : cycle "${it.cycle}" absent du bloc cycles`); warn++;
  }
  if (it.archive && it.archive.id !== `ahlcg-fr-${it.id}`) {
    console.warn(`! ${it.id} : archive.id "${it.archive.id}" ≠ convention "ahlcg-fr-${it.id}"`); warn++;
  }
}
console.log(warn ? `${warn} avertissement(s).` : "Aucun avertissement.");
