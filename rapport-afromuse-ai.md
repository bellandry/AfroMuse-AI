# Rapport de livraison — AfroMuse AI

**Date :** 15 août 2026  
**Périmètre :** plateforme web et bot WhatsApp de génération musicale africaine, crédits et paiements.

## Résumé exécutif

AfroMuse AI dispose désormais d’un **MVP full-stack** qui matérialise l’expérience produit principale : une landing page premium mobile-first, un studio de création musicale, une bibliothèque personnelle, un portefeuille de crédits, des checkout à lien unique et un socle WhatsApp orienté conversation. L’architecture sépare explicitement les fournisseurs de musique, de paiement et de WhatsApp afin de pouvoir changer un prestataire sans réécrire les parcours métier.

L’application est volontairement conçue comme un **produit hybride web + WhatsApp**. Le web est l’espace de contrôle, de création détaillée et de bibliothèque ; WhatsApp est le raccourci conversationnel pour l’authentification du numéro, la consultation du solde, le paiement et la réception de l’audio.

> **Réponse à votre question :** oui, l’adaptateur WhatsApp est prévu pour **OpenWA tel que présenté sur [open-wa.org](https://www.open-wa.org/)**. C’est la passerelle HTTP open source, auto-hébergée, avec API REST, multi-sessions, webhooks HMAC et clés d’API annoncée sur ce site [1]. L’application n’embarque pas OpenWA dans son propre serveur : elle se connecte à une instance OpenWA séparée via une URL et des secrets serveur.

| Domaine | État actuel | Remarque de production |
| --- | --- | --- |
| Landing page et identité visuelle | **Implémenté** | Interface responsive, démo audio originale, FAQ, CGU et confidentialité. |
| Studio web de création | **Implémenté** | Style africain, humeur, durée, voix/instrumental et prompt. |
| Génération via ElevenLabs Music | **Adaptateur implémenté** | Nécessite la clé réelle pour une génération de production. |
| Bibliothèque et stockage audio | **Implémenté** | Métadonnées, stockage objet, statuts et surfaces d’interface. |
| Crédits et ledger | **Implémenté** | Réservation, consommation, libération et remboursement traçables. |
| Paystack | **Conservé** | Checkout et validation HMAC présents. |
| Chariow | **Ajouté** | Checkout, Pulses HMAC et déduplication de livraison. |
| OpenWA | **Adaptateur implémenté** | Nécessite une instance OpenWA durable et connectée à WhatsApp. |
| Tests automatisés | **Passants** | 3 tests Vitest : Chariow, Paystack et OpenWA. |

## Produit livré

### Expérience marketing et identité

La page d’accueil a été construite autour d’une direction **studio afro-futuriste premium** : fond obsidienne, ambre comme couleur d’action, énergie violette pour la musique et vert réservé aux conversations WhatsApp. L’identité reste cohérente entre landing, connexion et studio.

La landing comprend une proposition de valeur, une démonstration audio originale Afro-fusion, une mise en scène du parcours WhatsApp, trois packs de crédits, une FAQ et des liens légaux. Elle a été vérifiée en format desktop et mobile.

### Création musicale et bibliothèque

Le studio accepte les styles suivants : **Afrobeats, Amapiano, Coupé-décalé, Highlife, Mbalax, Rumba, Gospel et Afro-fusion**. L’utilisateur choisit également une humeur, une durée de 30, 60 ou 120 secondes, la présence d’une voix et la langue.

La création produit une ligne de génération avec les états `queued`, `processing`, `completed`, `failed` et `cancelled`. Le système réserve les crédits avant traitement ; la consommation intervient quand la sortie aboutit. En cas d’échec, la réservation est libérée. Les sorties sont déposées dans le stockage objet et reliées à une entrée de bibliothèque.

L’adaptateur `MusicProvider` encapsule ElevenLabs Music. La documentation ElevenLabs indique que l’API accepte un prompt ou un plan de composition, une durée et un indicateur instrumental ; elle refuse les prompts visant des artistes, des paroles ou des œuvres protégées [2] [3]. Le formulaire affiche donc un avertissement pour maintenir un bon niveau de conformité dès l’amont.

### Authentification, compte et identité WhatsApp

Better Auth est installé côté serveur avec la base Drizzle. Le socle prévoit une connexion Google, un magic link email et une vérification d’email. Le compte possède un seul numéro WhatsApp actif. Toute nouvelle liaison supprime atomiquement l’ancienne identité du compte avant d’enregistrer le nouveau numéro.

Le parcours OTP WhatsApp fonctionne ainsi : lorsqu’un numéro inconnu écrit au bot, celui-ci demande une adresse email. Si le compte existe, un code à six chiffres est envoyé par email. L’utilisateur répond avec le code ; une fois validé, le numéro est associé au compte. Une tentative avec un numéro déjà rattaché à un autre compte est refusée.

### Crédits, commandes et paiements

Le portefeuille est associé à un utilisateur et le ledger conserve toutes les écritures. Les types d’écriture comprennent notamment `purchase`, `reserve`, `consume`, `release`, `refund`, `bonus` et `adjustment`. Les références métier rendent les opérations idempotentes : une même commande ou une même génération ne peut pas être créditée deux fois.

Le modèle de commande dissocie le **payeur** du **bénéficiaire**. Un lien unique est créé pour une commande et reste toujours rattaché au compte AfroMuse ayant demandé la recharge. Le paiement peut donc être effectué par un tiers sans risque de créditer le mauvais compte.

| Prestataire | Rôle dans AfroMuse | Protection côté serveur |
| --- | --- | --- |
| **Chariow** | Prestataire par défaut dans le portefeuille et le bot | Checkout API, métadonnée `order_ref`, stockage du sale ID, signature HMAC-SHA256, déduplication par `x-pulse-delivery-id`. |
| **Paystack** | Alternative conservée | Initialisation transactionnelle et vérification HMAC-SHA512. |
| **Flutterwave** | Adaptateur déjà préparé | Checkout et validation de secret de webhook prévus. |

Chariow est particulièrement adapté à ce besoin lorsque les packs sont configurés comme des produits numériques publiés dans la boutique Chariow. Son endpoint `/checkout` renvoie un état à traiter (`payment`, `completed` ou `already_purchased`) et une URL de paiement pour un achat payant [4]. AfroMuse ne se fie jamais à la redirection navigateur pour créditer un compte : le crédit réel dépend du **Pulse** (webhook) signé. Chariow recommande également de dédupliquer avec l’en-tête `x-pulse-delivery-id`, ce qui est appliqué dans le modèle d’événements de paiement [5] [6].

Un remboursement reçu par webhook génère une écriture `refund`, décompte les crédits associés et change la commande en statut `refunded`. Une politique métier complémentaire devra préciser le traitement des utilisateurs ayant déjà consommé leurs crédits avant un remboursement.

### Bot WhatsApp OpenWA

L’adaptateur `OpenWAProvider` est volontairement isolé. Il gère l’envoi de texte, l’envoi d’un fichier audio distant et la vérification du webhook entrant. Les commandes actuellement prévues sont :

| Commande | Réponse métier |
| --- | --- |
| `aide` | Présente le menu et les commandes disponibles. |
| `email votre@adresse.com` | Lance le parcours OTP pour un numéro inconnu. |
| `crédits` | Retourne le solde du portefeuille. |
| `statut` ou `bibliothèque` | Retourne les dernières générations. |
| `acheter` | Génère un lien unique Chariow du pack Créateur. |
| `créer` | Présente la syntaxe de création guidée. |

Lorsqu’une génération aboutit et qu’un numéro vérifié est lié au compte, l’audio est automatiquement envoyé sur WhatsApp. Une erreur de livraison WhatsApp ne fait pas échouer la génération elle-même ; elle est journalisée afin de pouvoir être rejouée plus tard.

OpenWA est une solution **auto-hébergée** et l’instance doit rester disponible. Le site officiel annonce une API REST, des webhooks HMAC, une authentification par clés, ainsi que deux moteurs possibles : `whatsapp-web.js` et `baileys` [1]. En conséquence, l’instance OpenWA doit être déployée séparément de l’application web, avec son propre stockage de session et une URL HTTPS publique destinée au webhook AfroMuse.

## Parcours utilisateur de bout en bout

### Parcours web

1. L’utilisateur découvre AfroMuse sur la landing, écoute l’extrait de démonstration et clique sur **Commencer**.
2. Il se connecte avec Google ou demande un magic link email.
3. Une fois dans le studio, il renseigne un titre, un prompt, un style, une humeur, une durée et le format vocal ou instrumental.
4. AfroMuse estime le coût, réserve les crédits, crée l’enregistrement de génération puis suit son statut.
5. Quand le morceau est prêt, il est stocké dans la bibliothèque. L’utilisateur peut l’écouter et, après activation finale du bouton, le télécharger.
6. Si le solde est insuffisant, l’utilisateur choisit Chariow, Paystack ou Flutterwave. Un checkout unique est créé pour son compte, même si le payeur final est différent.
7. Le webhook signé du prestataire marque la commande payée et crédite le portefeuille une seule fois.

### Parcours WhatsApp

1. L’utilisateur écrit au bot. Si son numéro n’est pas reconnu, le bot demande son email.
2. AfroMuse envoie un OTP sur l’email du compte ; le code envoyé dans WhatsApp relie le numéro au compte.
3. L’utilisateur demande son solde, consulte ses créations ou lance une création guidée.
4. Le bot contrôle les crédits avant toute génération. En cas de solde insuffisant, il envoie un lien Chariow unique.
5. La transaction validée par webhook crédite le bénéficiaire de la commande.
6. L’audio fini est envoyé dans la conversation et reste disponible dans la bibliothèque web.

## Architecture et sécurité

L’architecture repose sur trois frontières de responsabilité :

| Couche | Responsabilité | Choix d’implémentation |
| --- | --- | --- |
| Application web | UX, studio, bibliothèque, portefeuille | React, Tailwind, shadcn/Base UI, tRPC. |
| Serveur AfroMuse | Auth, règles métier, crédits, commandes, webhooks | Express, Better Auth, Drizzle, MySQL, stockage objet. |
| Prestataires | Musique, paiement, WhatsApp | Adaptateurs `MusicProvider`, `PaymentProvider`, `WhatsAppProvider`. |

Les appels à ElevenLabs, Chariow, Paystack et OpenWA restent côté serveur. Les signatures sont validées sur le corps brut des requêtes de webhook. Les événements externes sont mémorisés afin d’absorber les retries. La base possède également une table d’audit, prête à recevoir les événements sensibles.

Les tests actuellement exécutés sont passants : validation de la signature Chariow HMAC-SHA256, validation Paystack HMAC-SHA512 et refus des signatures OpenWA invalides. La vérification TypeScript passe également sans erreur.

## Configuration nécessaire avant lancement réel

Les variables suivantes ne doivent être ajoutées que via le gestionnaire de secrets du projet. Elles ne doivent jamais être déposées dans le code ou dans un dépôt Git.

| Groupe | Secrets nécessaires |
| --- | --- |
| Authentification | `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Email | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` |
| Musique | `ELEVENLABS_API_KEY` |
| Chariow | `CHARIOW_API_KEY`, `CHARIOW_WEBHOOK_SECRET`, `CHARIOW_PRODUCT_STARTER`, `CHARIOW_PRODUCT_CREATOR`, `CHARIOW_PRODUCT_STUDIO` |
| Paystack | `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY` |
| OpenWA | `OPENWA_BASE_URL`, `OPENWA_API_KEY`, `OPENWA_WEBHOOK_SECRET` |

Dans Chariow, il faut créer trois **produits numériques publiés** correspondant aux packs AfroMuse puis reporter leurs IDs publics dans les trois variables `CHARIOW_PRODUCT_*`. Il faut ensuite configurer un Pulse HTTPS vers `https://votre-domaine/api/webhooks/chariow`, idéalement filtré sur les produits de crédits et les événements de vente réussie ou de remboursement. La documentation Chariow précise que les produits non publiés ne peuvent pas être achetés via l’API et que les produits de type service, coaching ou pay-what-you-want ne sont pas pris en charge par ce flux [4].

Pour OpenWA, il faut déployer une instance distincte, connecter le numéro WhatsApp, générer sa clé d’API, configurer la destination de webhook `https://votre-domaine/api/webhooks/openwa` et transmettre le secret correspondant. Pour un bot à session persistante, une instance durable est recommandée ; une application autoscalée ne doit pas contenir le processus WhatsApp ou son état de session.

## Limites conscientes du MVP

Le MVP est structuré et testé au niveau unitaire pour les signatures, mais les flux externes ne peuvent pas être validés de bout en bout sans les secrets, les produits Chariow publiés, l’instance OpenWA et un environnement de staging. Les points suivants restent donc des activités de mise en service et non des défauts cachés :

| Sujet | État | Action avant lancement commercial |
| --- | --- | --- |
| Google, magic link et OTP email réels | Code prêt, secrets absents | Fournir les identifiants et tester les redirections sur le domaine final. |
| ElevenLabs réel | Adaptateur prêt, clé absente | Valider le coût par durée, la politique de droits et les temps de réponse. |
| Traitement asynchrone durable | Modèle de statut prêt | Déployer un callback fournisseur ou un job durable avec retries et backoff persistés. |
| OpenWA en production | Adaptateur prêt | Héberger séparément, connecter WhatsApp et tester la réception des webhooks. |
| Téléchargement UI | Données et stockage prêts | Connecter le bouton de bibliothèque à l’URL signée de l’asset. |
| Admin et support | Schéma/audit prêts | Ajouter un espace admin pour retrouver commandes, événements et livraisons. |

## Feuille de route vers un produit abouti

### Phase 1 — Mise en service contrôlée

La priorité est de connecter les secrets, de publier les trois produits Chariow et de déployer OpenWA sur une instance durable. Il faut ensuite exécuter un test d’acceptation complet : inscription, OTP, achat Chariow, replay de Pulse, crédit idempotent, génération ElevenLabs, réception WhatsApp et téléchargement web.

### Phase 2 — Fiabilité des opérations

Le produit doit obtenir une vraie orchestration durable des générations : verrou de job, retries exponentiels, dead-letter queue, reprise après panne et alerte d’échec. Une table de livraison WhatsApp permettra de différencier la réussite audio de la génération elle-même et de rejouer une livraison sans refaire le morceau.

### Phase 3 — Expérience musicale avancée

Les prochains écrans pourront inclure les paroles contrôlées, les plans de composition ElevenLabs, la génération de variantes, les stems, les cover arts, les favoris, les playlists et des exports enrichis. Il sera utile d’ajouter une estimation de coût explicite avant lancement ainsi qu’un historique complet des paramètres de prompt.

### Phase 4 — Croissance, opérations et conformité

Un back-office doit permettre de rechercher un compte, de voir le ledger, d’inspecter un webhook, d’accorder un bonus, de traiter une réclamation et de vérifier les volumes par pays ou canal. À ce stade, il faut également définir les CGU commerciales finalisées, la politique de remboursement, la conservation des données, la modération de prompt, les plafonds de dépense et la gestion de risque sur les paiements.

### Phase 5 — Migration WhatsApp officielle

OpenWA est cohérent pour un démarrage contrôlé, mais l’API officielle Meta doit rester l’objectif pour une distribution à grande échelle. L’adaptateur `WhatsAppProvider` limite le coût de cette migration : il faudra remplacer l’implémentation, non les règles d’OTP, de crédits ou de livraison audio.

## Références

[1] [OpenWA — Open Source WhatsApp API Gateway](https://www.open-wa.org/)  
[2] [ElevenLabs — Generate music with Eleven Music](https://elevenlabs.io/docs/eleven-api/guides/cookbooks/music)  
[3] [ElevenLabs — Compose music API reference](https://elevenlabs.io/docs/api-reference/music/compose)  
[4] [Chariow — Initiate Checkout API reference](https://chariow.dev/api-reference/checkout/init-checkout)  
[5] [Chariow — Checkout guide](https://chariow.dev/en/guides/checkout)  
[6] [Chariow — Pulses and webhook delivery](https://chariow.dev/en/guides/pulses)  
[7] [Chariow — Integration best practices](https://chariow.dev/en/guides/best-practices)
