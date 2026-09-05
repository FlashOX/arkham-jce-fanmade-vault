# Plan d'hébergement — contenu fan-made Arkham Horror LCG

## Objectif
Remplacer les liens Drive personnels par une solution de stockage + catalogue, sans dépendance à un individu, pérenne, et 100% gratuite.

## Principes directeurs
1. **Pas de dépendance à une personne** — aucun compte, identifiant ou paiement rattaché à un seul individu
2. **Pérennité** — le contenu doit survivre au départ de n'importe quel contributeur
3. **Gratuité totale** — ni le stockage des fichiers, ni l'hébergement du site catalogue ne doivent coûter d'argent

## Architecture retenue

```
[Site catalogue] --liens--> [Fichiers hébergés]
 GitHub Pages           archive.org (upload via l'outil `ia`)
 (org GitHub)
```

### 1. Stockage des fichiers — archive.org
- Upload via l'outil en ligne de commande `ia` (API IAS3), pas le formulaire web (limité par le navigateur)
- Gratuit, pas de plafond réaliste, infrastructure à but non lucratif
- Chaque campagne = un "item" archive.org avec URL stable et permanente
- **Attention modération** : contenu fan-made original OK ; éviter d'y mettre des scans d'assets officiels FFG/Edge (images de cartes, livrets) — risque de retrait

### 2. Catalogue / consultation — GitHub Pages
- Site statique gratuit, hébergé sur une **organisation GitHub** (pas un compte perso)
- Liste les campagnes avec description + lien direct vers le fichier sur archive.org
- Génération simple (Markdown → HTML), maintenable par n'importe qui avec accès à l'org

### 3. Distribution renforcée (optionnel) — torrent + webseed
- `.torrent` par campagne avec le lien archive.org en webseed (BEP19)
- Le P2P absorbe le trafic ; archive.org sert de filet permanent si plus personne ne seed

## Gouvernance — le vrai rempart contre la dépendance
- **Organisation GitHub** avec 2-3 admins minimum (pas de compte perso)
- **Compte(s) archive.org** avec accès upload partagé entre plusieurs personnes de la communauté
- Un **README** documentant la procédure d'upload, pour que n'importe qui puisse reprendre le flambeau

## Coût total : 0 €

## Points auxquels tu n'avais peut-être pas pensé
- **Nom de domaine** : si tu utilises un domaine perso au-dessus de GitHub Pages, ça recrée une dépendance. Reste sur l'URL par défaut (`org.github.io`) ou prends un domaine payé/détenu collectivement.
- **Métadonnées cohérentes** : nommer les items archive.org de façon prévisible (ex. `ahlcg-fr-nom-campagne`) évite de perdre la trace si le lien depuis le site casse.
- **Vérification périodique** : un script simple qui teste 1x/an que tous les liens du catalogue répondent encore, pour détecter un item supprimé/déplacé.
- **Droit d'auteur** : le contenu fan-made original (scénarios, texte, cartes custom) est protégé côté modération archive.org, mais vérifie que la communauté est claire sur ce qui est réutilisable ou non par des tiers.
- **Historique/versions** : si des campagnes évoluent (correctifs, v2), Git (via GitHub) donne un historique de versions gratuit que le simple stockage archive.org n'offre pas — utile si vous versionnez aussi les fichiers sources (pas juste les PDFs finaux) dans le repo.

## Prochaines étapes concrètes
1. Créer l'organisation GitHub (2-3 admins de confiance)
2. Créer 1-2 comptes archive.org partagés (accès upload)
3. Installer et tester `ia` pour uploader une première campagne
4. Monter le site catalogue minimal sur GitHub Pages
5. Rédiger le README de procédure
