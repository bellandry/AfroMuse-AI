# Notes d’implémentation SEO

## Architecture constatée

Le projet utilise Vite avec un `root` client, des alias `@`, `@shared` et `@assets`, un build web dans `dist/public` et un serveur Express. La conversion SSR nécessitera donc une entrée client distincte, une entrée serveur, une configuration de build SSR qui reprend les alias et un routage Express qui rend uniquement les pages publiques.

## Portée de confidentialité

Les routes de connexion et d’application seront servies sans préchargement de données utilisateur et avec une directive `noindex`. Les pages publiques devront être vérifiées par leur HTML brut, leurs métadonnées uniques et leur réponse HTTP avant toute publication des pages programmatiques.

## Décision de rendu

Les pages publiques d’AfroMuse ne dépendent pas de requêtes utilisateur au premier rendu. Elles pourront donc être rendues côté serveur avec un cache de requêtes vide et un hydratage client identique. Les hubs et fiches SEO utiliseront une taxonomie de contenu versionnée dans `shared/`, lisible à la fois par le serveur, les composants React et les générateurs de sitemap. Cette approche évite de rendre des données privées dans le HTML tout en conservant une source de vérité pour les URLs et leurs métadonnées.
