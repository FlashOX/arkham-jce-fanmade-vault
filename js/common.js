// Helpers partagés par index.html, item.html et archives.html.

const TYPE_LABEL = {
  scenario: "Scénario",
  campagne: "Campagne",
  investigateurs: "Investigateurs",
  "cartes-joueur": "Cartes joueur",
  autre: "Autre",
};

// Regroupe un type de fiche vers l'une des 4 couleurs de tag/chip.
const chipKeyForType = (type) =>
  ["campagne", "scenario", "investigateurs"].includes(type) ? type : "autre";

// Page d'un item archive.org, et zip généré à la volée avec tous ses fichiers.
const IA_DETAILS = (id) => `https://archive.org/details/${encodeURIComponent(id)}`;
const IA_ARCHIVE = (id) => `https://archive.org/compress/${encodeURIComponent(id)}`;

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
