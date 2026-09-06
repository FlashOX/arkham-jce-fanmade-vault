# Les Archives Miskatoniques

Catalogue communautaire de contenu **fan-made** francophone pour *Horreur à Arkham :
le Jeu de Cartes* (scénarios indépendants, campagnes, enquêteurs).

➡️ **https://flashox.github.io/arkham-jce-fanmade-vault/**

## Pourquoi ce projet

Le contenu fan-made circule aujourd'hui via des liens Google Drive personnels : si le
contributeur s'en va ou ferme son compte, tout disparaît. Ce projet remplace ça par une
solution pérenne et sans dépendance à une personne :

- **Fichiers** hébergés sur [archive.org](https://archive.org) — infrastructure à but non
  lucratif, URL stables, gratuit. 1 fiche = 1 item.
- **Catalogue** = site statique (`index.html`) servi par GitHub Pages, piloté par
  [`data/catalogue.json`](data/catalogue.json) (validé par [`data/catalogue.schema.json`](data/catalogue.schema.json)).

## État

🚧 **Proof of concept.** Le catalogue liste ~40 fiches issues du recensement de la
communauté ; l'hébergement archive.org est en cours de mise en place. Architecture
détaillée dans [`plan_hebergement_ahlcg.md`](plan_hebergement_ahlcg.md).

## Contribuer

- Ajouter / héberger un contenu : [`CONTRIBUTING.md`](CONTRIBUTING.md) (procédure `ia`
  vers archive.org + `archive` dans la fiche).
- Développement local : `npm install` puis `npm run validate` (schéma) et
  `npm run thumbs` (miniatures).
