# Contribuer — héberger un contenu sur archive.org

Ce dépôt ne stocke pas les fichiers de jeu : ils vivent sur **archive.org**, le
catalogue (`data/catalogue.json`) ne fait qu'y pointer.

## Principe

**1 fiche du catalogue = 1 item archive.org.** Peu importe l'organisation du
dossier source (Drive…) : à l'upload, on range tout dans des **rôles** à nom
fixe. Un rôle absent = fichier simplement absent.

| Rôle | Contenu | Requis |
|---|---|---|
| `guide` | Guide / règles du scénario ou de la campagne (PDF) | oui |
| `print` | PDF prêt à imprimer (avec marges, imposé) | non |
| `cards` | Images de cartes (zip) — « avec marges » et « sans marges » = 2 entrées | non |
| `sets` | Sets de rencontre partagés d'une campagne (zip) | non |
| `scenario` | Bundle d'un scénario d'une campagne (zip) | non |
| `extension` | Add-on : enquêteur, classe, mini-extension (zip) | non |
| `cover` | Visuels de couverture (zip ou images) | non |
| `source` | Fichiers sources (projet Strange Eons `*.json`, etc.) | non |

## Prérequis

```bash
pipx install internetarchive      # ou : pip install --user internetarchive
ia configure                      # e-mail + mot de passe du compte archive.org PARTAGÉ
```

> Le compte archive.org est **partagé par la communauté** (voir gouvernance plus
> bas). Ne mets jamais tes identifiants perso.

## Identifiant de l'item

Convention : **`ahlcg-fr-` + l'`id` de la fiche** dans `catalogue.json`.

| Fiche (`id`) | Identifiant archive.org |
|---|---|
| `face-au-wendigo` | `ahlcg-fr-face-au-wendigo` |
| `matiere-noire` | `ahlcg-fr-matiere-noire` |

Règles archive.org : `[a-z0-9-]`, unique **globalement**, **immuable** une fois
créé. `npm run validate` vérifie que `archive.id` respecte la convention.

## Nommage des fichiers

Tous préfixés par l'identifiant de l'item :

```
ahlcg-fr-<id>-guide.pdf
ahlcg-fr-<id>-print.pdf
ahlcg-fr-<id>-cartes-marges.zip
ahlcg-fr-<id>-cartes-sans-marges.zip
```

Pour une campagne, un fichier par scénario / extension :

```
ahlcg-fr-<id>-sets.zip
ahlcg-fr-<id>-s1-<slug>.zip
ahlcg-fr-<id>-s3a-<slug>.zip
ahlcg-fr-<id>-ext-<slug>.zip
ahlcg-fr-<id>-guide-uhd.pdf
```

**On zippe les dossiers de cartes avant l'upload** (des dizaines de PNG en vrac =
upload lent, page d'item illisible, une vignette générée par fichier).

## Procédure — exemple : « Face au Wendigo »

1. Récupérer le dossier source et **renommer** les fichiers selon la convention.
   La correspondance est libre — ici :

   | Source (Drive) | Fichier normalisé | Rôle |
   |---|---|---|
   | `Guide du scénario.pdf` | `ahlcg-fr-face-au-wendigo-guide.pdf` | `guide` |
   | `Face au wendigo (1).pdf` | `ahlcg-fr-face-au-wendigo-print.pdf` | `print` |
   | `PNG avec marges.zip` | `ahlcg-fr-face-au-wendigo-cartes-marges.zip` | `cards` |
   | `JPEG sans marges.zip` | `ahlcg-fr-face-au-wendigo-cartes-sans-marges.zip` | `cards` |

2. Uploader :

   ```bash
   ia upload ahlcg-fr-face-au-wendigo \
     ahlcg-fr-face-au-wendigo-guide.pdf \
     ahlcg-fr-face-au-wendigo-print.pdf \
     ahlcg-fr-face-au-wendigo-cartes-marges.zip \
     ahlcg-fr-face-au-wendigo-cartes-sans-marges.zip \
     --metadata="title:Face au Wendigo — scénario fan-made (Cycle 1)" \
     --metadata="mediatype:texts" \
     --metadata="language:fre" \
     --metadata="creator:Ligue des Joueurs Francophones d'Arkham JCE" \
     --metadata="subject:Arkham Horror LCG" \
     --metadata="subject:fan-made" \
     --metadata="subject:français" \
     --metadata="subject:Cycle 1" \
     --metadata="date:2024" \
     --metadata="description:Scénario indépendant fan-made pour «Horreur à Arkham : le JCE». Cycle 1 de la Ligue des Joueurs Francophones. Source : https://arkhamhorrorfr.forumactif.com/t2401-cycle-1-de-scenarios-fan-made" \
     --retries 5
   ```

   - `mediatype:texts` → lecteur PDF en ligne sur la page de l'item.
   - Gros PDF (> ~500 Mo) : ajouter `--no-derive` pour éviter des heures de
     dérivés côté archive.org (le PDF reste téléchargeable et lisible).
   - L'upload reprend là où il s'est arrêté si on relance la commande.

3. Vérifier : `ia metadata ahlcg-fr-face-au-wendigo` puis ouvrir
   `https://archive.org/details/ahlcg-fr-face-au-wendigo`.

4. Renseigner la fiche dans `data/catalogue.json` :

   ```json
   "archive": {
     "id": "ahlcg-fr-face-au-wendigo",
     "fichiers": [
       { "role": "guide", "label": "Guide du scénario",        "file": "ahlcg-fr-face-au-wendigo-guide.pdf" },
       { "role": "print", "label": "PDF prêt à imprimer",       "file": "ahlcg-fr-face-au-wendigo-print.pdf" },
       { "role": "cards", "label": "Cartes avec marges (PNG)",  "file": "ahlcg-fr-face-au-wendigo-cartes-marges.zip" },
       { "role": "cards", "label": "Cartes sans marges (JPEG)", "file": "ahlcg-fr-face-au-wendigo-cartes-sans-marges.zip" }
     ]
   }
   ```

   puis `npm run validate`, commit, push.

## Cas d'une campagne — « Matière Noire »

Même item, un fichier par scénario / extension. Total possible : plusieurs Go —
c'est supporté par archive.org, mais :

- `--no-derive` **obligatoire** ici (guides UHD ~1 Go).
- `--retries 8`, et relancer la commande en cas de coupure (reprise auto).
- Le `project_fr.json` (sources Strange Eons) va en rôle `source`.

```json
"archive": {
  "id": "ahlcg-fr-matiere-noire",
  "fichiers": [
    { "role": "guide",     "label": "Guide de campagne",     "file": "ahlcg-fr-matiere-noire-guide.pdf" },
    { "role": "guide",     "label": "Guide UHD",             "file": "ahlcg-fr-matiere-noire-guide-uhd.pdf" },
    { "role": "print",     "label": "PDF prêt à imprimer",   "file": "ahlcg-fr-matiere-noire-print.pdf" },
    { "role": "sets",      "label": "Sets partagés",         "file": "ahlcg-fr-matiere-noire-sets.zip" },
    { "role": "scenario",  "label": "1 — The Tatterdemalion","file": "ahlcg-fr-matiere-noire-s1-tatterdemalion.zip" },
    { "role": "scenario",  "label": "2 — Electric Nightmare","file": "ahlcg-fr-matiere-noire-s2-electric-nightmare.zip" },
    { "role": "extension", "label": "Enquêtrice — Lola",     "file": "ahlcg-fr-matiere-noire-ext-lola.zip" },
    { "role": "source",    "label": "Projet (Strange Eons)", "file": "ahlcg-fr-matiere-noire-project_fr.json" }
  ]
}
```

## Collection & gouvernance

- Demander à archive.org une **collection dédiée** (`ahlcg-fanmade-fr`). Les
  admins de collection peuvent gérer / restaurer tous les items — c'est le point
  de contrôle partagé contre la perte de contenu.
- En attendant : uploader sans `collection` (ou `collection:opensource` si le
  compte y est autorisé), puis rattacher plus tard :
  `ia metadata ahlcg-fr-<id> -m collection:ahlcg-fanmade-fr`.
- Garder **une copie reconstructible hors archive.org** (le Drive reste le
  master). Si un item est retiré sur plainte, on ré-uploade.

## Droits

Le `guide` (texte original) = risque quasi nul. Les `print` et `cards` utilisent
le gabarit + le logo officiels → contenu le plus exposé à une plainte. Rien de
bloquant, mais ne jamais dépendre uniquement d'archive.org pour ces fichiers.

## Vérification périodique

Prévoir un contrôle annuel : tous les liens `archive.org/details/<id>` du
catalogue répondent-ils encore ? (script à ajouter dans `tools/`.)
