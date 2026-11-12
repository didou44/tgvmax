# Mon TGV Max

Petite app iPhone pour suivre la rentabilité de l'abonnement Max Jeune
(par rapport au plein tarif ou à la Carte Avantage) et ne jamais oublier
de confirmer un trajet à 0 €.

- Lecture des captures « Choisissez un tarif » de SNCF Connect, sur le
  téléphone, sans IA : reconnaissance de texte (Tesseract) puis règles
  (`parser.js`).
- Rappels : deux événements de 15 min la veille (9 h et 14 h par défaut),
  avec une notification à l'heure, via un fichier .ics (Calendrier de
  l'iPhone) ou un lien Google Agenda.
- Données gardées sur le téléphone. Sauvegarde : Plus → Exporter / Importer.

## Mettre en ligne (GitHub Pages)

1. Sur github.com : **New repository** → nom `mon-tgvmax` → Public → Create.
2. **Add file → Upload files** : dépose tous les fichiers de ce dossier → Commit.
3. **Settings → Pages** : Source « Deploy from a branch », branche `main`,
   dossier `/ (root)` → Save. Attends 1 à 2 minutes.
4. Ouvre `https://<ton-pseudo>.github.io/mon-tgvmax/` dans **Safari** sur l'iPhone,
   puis **Partager → Sur l'écran d'accueil**.

## Mettre à jour

Remplace les fichiers modifiés dans le dépôt (Upload files), puis ferme et
rouvre l'app sur l'iPhone.
