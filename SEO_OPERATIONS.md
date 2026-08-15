# Exploitation SEO et découvrabilité IA — AfroMuse AI

## Ce qui est en place

AfroMuse rend désormais ses pages publiques côté serveur. L’accueil, le contact, les pages de confiance, les hubs de contenu et les fiches éditoriales renvoient un HTML exploitable sans JavaScript, avec une métadonnée par URL. Les zones d’application — connexion, studio, compte, crédits et bibliothèque — conservent un shell client et reçoivent une directive `noindex, follow` afin de ne pas exposer de données privées ou de pages minces à l’indexation.

| Élément | URL ou mécanisme | Rôle |
|---|---|---|
| Rendu public | Routes publiques SSR | HTML, titre, description, Open Graph et canonique dans la réponse initiale |
| Corpus éditorial | `/styles`, `/ambiances`, `/guides`, `/cas-usages` | Hubs contrôlés et premières fiches qualitatives, sans génération combinatoire d’URLs |
| Crawl | `/robots.txt`, `/sitemap.xml` | Déclaration des chemins indexables et interdiction des zones privées |
| Assistants | `/llms.txt` | Résumé expérimental lisible par machine ; il ne remplace ni le HTML ni les sitemaps |
| Données structurées | JSON-LD dans les pages publiques | `Organization`, `WebSite`, `SoftwareApplication`, `FAQPage`, `ContactPage`, `Article`/`WebPage` et `BreadcrumbList` selon la route |
| Confiance | CGU, confidentialité, mentions, cookies, contenu IA, contact | Pages publiques interliées et explicitement marquées comme brouillons à finaliser |

## Variables de déploiement à renseigner

| Variable | Exemple | Effet |
|---|---|---|
| `CANONICAL_ORIGIN` | `https://www.afromuse.ai` | Produit les URL canoniques, `og:url` et les images Open Graph absolues |
| `SITE_NAME` | `AfroMuse AI` | Alimente le nom Open Graph du site |

Ne déployez pas avec une URL de prévisualisation comme origine canonique. Après le choix du domaine final, ajoutez ces deux variables dans les paramètres de production, redémarrez, puis vérifiez le HTML brut d’au moins l’accueil, une fiche de style et une page légale.

Dans l’environnement de développement, ces variables peuvent rester absentes : les balises canoniques et les URL Open Graph absolues sont alors volontairement omises plutôt que construites depuis une requête ou un hôte non fiable. En production, leur présence est obligatoire avant la soumission des sitemaps.

## Politique robots actuelle

La configuration autorise explicitement `OAI-SearchBot` et `Claude-SearchBot`, qui peuvent servir aux expériences de recherche de leurs fournisseurs, et interdit `GPTBot` par défaut. Cette décision sépare la découverte dans certains produits de recherche de l’usage associé à GPTBot ; elle peut être modifiée dans `server/seo.ts` selon votre politique de gouvernance. L’accès à un crawler ne garantit ni indexation, ni citation, ni recommandation par un assistant.[1] [2]

## Check-list après publication

1. Confirmez que le domaine final répond en HTTPS et que `CANONICAL_ORIGIN` correspond exactement à son URL publique.
2. Ouvrez `https://votre-domaine/robots.txt`, `https://votre-domaine/sitemap.xml` et `https://votre-domaine/llms.txt`.
3. Ajoutez le site à Google Search Console, validez le domaine puis soumettez le sitemap. Répétez l’opération dans Bing Webmaster Tools.[3] [4]
4. Contrôlez le HTML brut avec `curl` ou un outil d’inspection : une fiche doit contenir son titre, sa description, une canonique et le texte de la page ; `/app` doit inclure `noindex, follow`.
5. Testez les données structurées avec le validateur Schema.org et l’outil de résultats enrichis de Google. Les données structurées doivent toujours correspondre au contenu visible.[5]
6. Suivez chaque mois les pages découvertes, indexées, les requêtes, impressions, clics, erreurs de couverture et les inscriptions attribuées au contenu organique.

## Gouvernance éditoriale

Chaque nouvelle fiche doit être utile de façon autonome : définition claire, angle original, exemple de prompt créé pour AfroMuse, date de mise à jour et liens internes pertinents. Ne publiez pas une combinaison style × ambiance uniquement parce qu’elle est techniquement générable. Les pages répétitives, incomplètes ou sans intention de recherche doivent rester `noindex` et hors sitemap.

Les textes sur les genres, cultures et usages musicaux doivent être relus pour leur exactitude et complétés de sources lorsqu’ils avancent des faits historiques ou culturels. Évitez de construire les prompts autour de noms d’artistes, d’œuvres ou de paroles existantes.

## Informations nécessaires avant la publication commerciale

Les pages de confiance sont fonctionnelles, mais elles ne remplacent pas une vérification juridique. Avant leur publication définitive, renseignez l’entité qui exploite AfroMuse, sa forme juridique, son pays, son adresse, l’email de contact, le responsable des données, les durées de conservation, les prestataires réellement activés, la politique de remboursement et la juridiction applicable. Faites réviser les textes par un conseil qualifié pour les pays visés.

## Validation réalisée

La compilation TypeScript, le build web + SSR et les neuf tests Vitest du projet ont été exécutés avec succès. La vérification HTTP locale a confirmé le rendu SSR d’une fiche publique, la présence du sitemap, les règles robots et la directive `noindex` de la zone privée. Les pages de styles, de détail et de politique de contenu IA ont aussi été vérifiées visuellement en desktop et mobile.

## Références

[1] [OpenAI — Overview of OpenAI Crawlers](https://developers.openai.com/api/docs/bots)

[2] [Anthropic — Crawling the web and controlling crawler access](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)

[3] [Google Search Central — Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

[4] [Google Search Central — Search Console guide](https://developers.google.com/search/docs/monitor-debug/search-console-start)

[5] [Google Search Central — Introduction to structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
