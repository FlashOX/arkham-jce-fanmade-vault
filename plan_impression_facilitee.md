# Plan : impression facilitée (MBPrint puis MPC)

Objectif : réduire la friction pour un joueur qui veut commander une impression
pro du contenu du catalogue, en s'appuyant sur nos zips d'images « avec bleed »
et nos planches A4 déjà hébergés. Priorité 1 = **MBPrint** (cible historique du
projet), priorité 2 = **MPC**, sur le modèle de ce que fait Inexorable Fate
pour le contenu anglophone.

Principe qui traverse tout le document : on **facilite la préparation du
fichier**, on ne commande jamais à la place de l'utilisateur — l'achat reste
entièrement de son ressort.

Recherché et sourcé le 2026-09-12 (voir sources en fin de document).

---

## 1. MBPrint (priorité 1)

### Ce qu'on sait

MB PRINT (mbprint.pl, imprimeur polonais spécialisé jeux de société) propose
deux façons de préparer une commande de cartes :

1. **PDF prêt à imprimer préparé à la main**, avec des specs précises :
   - format PDF, 300 dpi, CMYK (profil Coated Fogra 39) de préférence — un
     fichier RGB est auto-converti (risque de dérive colorimétrique) ;
   - fond perdu : 3 mm sur chaque bord (une carte 63×88 mm devient un
     fichier 69×94 mm) ;
   - marge de sécurité : 4 mm depuis le bord fini ;
   - texte vectorisé, calques aplatis, transparences supprimées ;
   - **pas de traits de coupe / repères** dans le fichier envoyé ;
   - un PDF par format de carte (un item de commande par dimension).
2. **Générateur PDF en ligne** : [generator.mbprint.pl](https://generator.mbprint.pl/?lang=en)
   *« Card designs → PDF ready in 2 minutes »*. On y upload des images de
   cartes (PNG/JPG/TIFF/WebP/BMP), on choisit :
   - un format de carte dans une liste de gabarits standard (dont
     **63.5 × 89 mm**, quasi identique à notre 63.5 × 88.9 mm) ou un format
     custom ;
   - la méthode de bleed : **« FILES HAVE NO BLEED - GENERATE »** (avec choix
     étirement du dernier pixel ou effet miroir) **ou « FILES INCLUDE
     BLEEDS »** — donc les images déjà bleedées sont supportées nativement ;
   - un dos par défaut (« Default back ») pour les cartes qui n'ont pas de
     dos individuel ;
   - possibilité d'**importer un deck entier en ZIP ou en JSON**
     (« IMPORT DECK (ZIP / JSON) »).
   Le générateur produit alors un PDF conforme aux specs MB PRINT
   automatiquement (bleed, marge de sécurité, résolution).

### Pourquoi c'est une bonne nouvelle pour nous

Notre zip `*-cartes-avec-bleed.zip` (gabarit Shomm « Poker - 3.2 marge »,
826 × 1126 px @300 dpi = 3.2 mm de bleed/bord) tombe quasiment pile dans le
format attendu par l'option **« FILES INCLUDE BLEEDS »** du générateur — a
priori utilisable **tel quel**, sans passer par notre propre `impose.mjs` ni
dépendre des planches Shomm. C'est potentiellement plus fiable que notre
imposition maison (cf. l'épisode des cartes coupées sur le Cycle 1) puisque
c'est l'imprimeur lui-même qui connaît et maintient ses specs.

### Plan d'action

1. **Test à blanc** (avant d'écrire quoi que ce soit de définitif) : prendre
   le zip d'un item déjà en ligne (ex. Le Festival) et le passer pour de vrai
   dans le générateur — format 63.5×89 mm, « FILES INCLUDE BLEEDS ». Vérifier :
   - que le pairage recto/verso se fait bien à partir de notre convention de
     nommage (`<Nom de la carte>-Recto` / `-Verso`) — sinon noter le
     renommage nécessaire ;
   - que le PDF généré est visuellement correct (marges, alignement, aucune
     carte coupée) — même diligence que pour `impose.mjs` : rendu + relecture
     avant de recommander l'outil à qui que ce soit ;
   - le rendu concret de « FILES HAVE NO BLEED » avec nos images *sans*
     bleed, pour comparer les deux options.
2. **Regarder l'import ZIP/JSON** : voir si on peut construire nous-mêmes ce
   fichier (recto+verso+dos déjà mappés) pour un import en un clic côté
   générateur, plutôt que de laisser chacun remapper à la main.
3. **Documenter** : rédiger la section/page « Comment imprimer » (déjà en
   TODO) avec un tutoriel pas-à-pas dédié MBPrint — où trouver le zip sur la
   fiche, réglages à choisir dans le générateur, puis comment commander
   ensuite chez MB PRINT (upload du PDF généré, choix papier/quantité).
4. **Option d'industrialisation** (seulement si le test à blanc est
   concluant) : script qui prépare, pour chaque fiche, un zip/JSON
   pré-formaté « prêt à importer » dans le générateur, livré comme fichier
   supplémentaire de l'item archive.org. Décision à prendre après le test à
   blanc, pas avant.

---

## 2. MPC / MakePlayingCards (priorité 2)

### Ce qu'on sait

La communauté anglophone AHLCG (dont Inexorable Fate) s'appuie sur
l'extension Chrome **« MPC Project Helper »** (icône flocon, par north101 ;
doc à [mpc.north101.co.uk/help](https://mpc.north101.co.uk/help), reprise
telle quelle sur [inexorablefate.com/help](https://inexorablefate.com/help)).
Attention : ce n'est **pas** le même outil que l'écosystème « MPC Autofill »
de chilli-axe (qui passe par Google Drive + un outil desktop de
« glisser-déposer » automatisé côté navigateur) — plus lourd, pas retenu pour
l'instant.

Deux façons d'utiliser l'extension :

1. **Charger un fichier projet `.json` déjà préparé** — c'est ce qu'héberge
   Inexorable Fate pour chaque scénario officiel/fan-made anglophone :
   l'extension pré-remplit directement l'étape 5 du configurateur MPC
   (l'upload est déjà fait), il ne reste qu'à choisir papier/quantité et
   commander. Limite technique : image cache MPC parfois capricieux quand on
   recharge le projet de quelqu'un d'autre (contournable en redemandant à
   l'auteur du fichier de « rafraîchir » son projet côté MPC).
2. **Créer un projet depuis des images de cartes**, uploadées directement
   dans l'extension, avec une convention de nommage précise :
   - `001-nom-a.png` (recto), `001-nom-b.png` (verso) — préfixe numérique
     pour l'ordre, suffixe `-a`/`-b` (ou `-1`/`-2`, `-front`/`-back`) pour le
     pairage automatique ;
   - un dos commun se nomme `back.png` et s'applique par défaut à tout recto
     sans dos identifié ;
   - `-xN` avant le suffixe pour dupliquer une carte (ex. `002-carte-x2-a.png`) ;
   - cartes paysage (actes, agendas, enquêteurs) : orientées verticalement
     dans le fichier, texte du recto lisible du bas vers le haut, texte du
     verso du haut vers le bas (pour qu'une fois recto/verso posés côte à
     côte, le bas des deux se rejoigne au centre).
   - limite : **612 cartes par projet** taille Arkham ; au-delà, l'extension
     scinde automatiquement en plusieurs commandes.

Spec image MPC (cartes taille Arkham) : mini 750×1050 px @300 dpi + 36 px
(~3.05 mm) de bleed/bord → **822×1122 px minimum**. Nos images avec bleed
(826×1126 px, 3.2 mm) **dépassent déjà ce minimum** — compatibles sans
retouche de résolution, seul le nommage doit changer.

### Plan d'action

1. **Renommage** : nos fichiers sont `<Nom de la carte>-Recto.jpg/png` /
   `-Verso.jpg/png`, sans préfixe numérique ni suffixe `-a`/`-b` — pas
   compatible tel quel avec la convention attendue par l'extension. Écrire un
   petit script (`tools/prep-mpc.mjs` ?) qui produit, à la demande, une copie
   renommée d'un zip d'images (numérotation dans l'ordre existant, suffixes
   `-a`/`-b`, détection d'un dos commun → `back.png`).
2. **Test à blanc** sur un item Cycle 1 : créer un projet dans l'extension à
   partir des images renommées, vérifier le pairage automatique, la taille de
   carte sélectionnée, et l'orientation des cartes paysage.
3. **Envisager la génération de fichiers projet `.json`** (comme Inexorable
   Fate) — plus ambitieux : il faut d'abord comprendre le format exact du
   `.json` (probablement en créant un projet-test dans l'extension et en
   l'exportant pour l'étudier), et ça pose la question de l'hébergement des
   images une fois uploadées (MPC lui-même après un premier upload « pour
   de vrai », ou ailleurs). À ne considérer qu'après le succès du renommage
   simple, et pas avant d'avoir avancé sur MBPrint.
4. **Documenter** dans la page « Comment imprimer » : lien vers l'extension,
   convention de nommage attendue, et rappel que MBPrint reste la piste
   recommandée en premier (pas de compte MPC nécessaire, moins cher pour un
   joueur seul en zone Europe).

---

## Notes transverses

- Même diligence que pour `impose.mjs` : aucun rendu ni fichier généré par un
  de ces outils n'est recommandé publiquement avant vérification visuelle
  (pages rendues, cartes non coupées, marges correctes).
- Garder les fichiers de test dans le scratchpad de la session ; ne rien
  committer avant validation.
- Une fois un flux validé (MBPrint ou MPC), cocher l'item correspondant dans
  `TODO.md` (section Contenu, page « Comment imprimer ») et y renvoyer.
- Rien ici ne change le contenu déjà hébergé sur archive.org — ce chantier
  ajoute des *instructions* et, éventuellement, un *fichier supplémentaire*
  par item ; il ne remplace pas le guide/planche/zip existants.

## Sources consultées (2026-09-12)

- [mbprint.pl/en](https://mbprint.pl/en/) — page d'accueil, produits, calculateur.
- [mbprint.pl/en/instruction/cards](https://mbprint.pl/en/instruction/cards/) — specs de préparation de fichier + présentation du générateur.
- [generator.mbprint.pl](https://generator.mbprint.pl/?lang=en) — le générateur PDF lui-même (formats, méthodes de bleed, import ZIP/JSON).
- [inexorablefate.com/help](https://inexorablefate.com/help) — procédure complète MPC via l'extension.
- [MPC Project Helper (Chrome Web Store)](https://chrome.google.com/webstore/detail/mpc-project-helper/oigcfklkajlgkeblpngmbgjniiejabko) — l'extension elle-même.
- [chilli-axe/mpc-autofill (GitHub)](https://github.com/chilli-axe/mpc-autofill) — écosystème alternatif (Google Drive + outil desktop), noté mais pas retenu pour l'instant.
