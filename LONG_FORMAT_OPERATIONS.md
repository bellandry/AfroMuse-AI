# Chansons vocales longues — règles d’exploitation

## État de l’évolution

AfroMuse propose désormais, dans le studio, des instrumentaux et des chansons vocales de **30, 60, 120 ou 180 secondes**. Le mode vocal exige soit des paroles assistées, soit des paroles personnalisées. Les choix sont validés côté serveur et les crédits sont calculés selon la durée, la voix et l’usage de paroles.

| Format | Durée | Crédits actuels | État de disponibilité |
|---|---:|---:|---|
| Instrumental court | 30–60 s | 3–6 | Implémenté |
| Instrumental long | 120–180 s | 12–18 | Implémenté, validation fournisseur requise |
| Chanson vocale | 60 s | 10 | Implémenté, validation fournisseur requise |
| Chanson vocale avec paroles | 120 s | 21 | Implémenté, validation fournisseur requise |
| Chanson vocale avec paroles | 180 s | 31 | Implémenté, validation fournisseur requise |

Les crédits indiqués sont des règles produit internes et non une garantie de prix définitif. Ils devront être ajustés après mesure du coût fournisseur, du taux de réussite et du temps de génération réel.

## Capacités préparées et validation réelle

| Sujet | État préparé dans AfroMuse | Résultat réel validé |
|---|---|---|
| Langue vocale française | Sélection disponible dans le studio et transmise au fournisseur | **Non testé** sans clé Eleven Music |
| Langue vocale anglaise | Sélection disponible dans le studio et transmise au fournisseur | **Non testé** sans clé Eleven Music |
| Sélection automatique de langue | Disponible dans le studio | **Non testé** sans clé Eleven Music |
| Instrumental 120 secondes | Contrat, crédits et pipeline préparés | **Non testé** avec le compte fournisseur final |
| Instrumental 180 secondes | Contrat, crédits et pipeline préparés | **Non testé** avec le compte fournisseur final |
| Vocal 120/180 secondes avec paroles assistées | Contrat, instructions et interface préparés | **Non testé** avec le compte fournisseur final |
| Vocal 120/180 secondes avec paroles personnalisées | Contrat, validation et interface préparés | **Non testé** avec le compte fournisseur final |

> Aucune durée ni langue n’est actuellement certifiée par un essai réel dans l’environnement AfroMuse. Les formats sont visibles à des fins de préparation produit, mais ne doivent pas être présentés comme garantis avant le pilote contrôlé.

## Limites avant ouverture publique

L’implémentation utilise le point d’entrée simple d’Eleven Music avec une direction vocale, la langue sélectionnée et, selon le choix, des paroles utilisateur ou une instruction de paroles originales. L’interface et le schéma sont prêts pour les structures de chanson et un identifiant de plan fournisseur, mais le flux de **composition plan / compose detailed** ne doit pas être activé tant que ses paramètres exacts n’ont pas été validés avec la clé et le forfait ElevenLabs retenus.

Le pilotage réel reste obligatoire avant toute promesse sur les formats de deux à trois minutes. Il doit comparer au minimum 120 et 180 secondes, en vocal et instrumental, avec des paroles générées puis personnalisées. Les points à consigner sont la durée effective, le coût, la latence, les erreurs, la qualité de voix, la cohérence des paroles et la prise en charge des langues cibles.

## Politique de contenu

Les prompts et paroles doivent rester originaux. AfroMuse ne doit pas être utilisé pour demander l’imitation d’un artiste identifiable, la reproduction de paroles, d’une œuvre ou d’un enregistrement existant. Les utilisateurs qui collent leurs propres paroles confirment disposer des droits nécessaires.

## Prochaines étapes techniques bloquées

Le pilote exige `ELEVENLABS_API_KEY`. Après sa configuration, exécuter un échantillon faible et contrôlé, vérifier la réponse exacte de l’API pour les plans de composition et documenter le support réel des lyrics, stems et variantes audio. Seuls les fichiers effectivement fournis et autorisés par le prestataire seront ajoutés à la bibliothèque.

## Validation accomplie

Les contrôles unitaires couvrent les durées commercialisées, les combinaisons vocal/paroles, l’estimation de crédits et les règles précédemment en place. La suite comprend actuellement 19 tests réussis ; la compilation TypeScript et le build client/SSR/serveur ont également réussi.

## Références

[1] [ElevenLabs — Music overview](https://elevenlabs.io/docs/eleven-creative/products/music)

[2] [ElevenLabs — Composition plans](https://elevenlabs.io/docs/eleven-api/guides/how-to/music/composition-plans)

[3] [ElevenLabs — Compose music with details](https://elevenlabs.io/docs/api-reference/music/compose-detailed)
