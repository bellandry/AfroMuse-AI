# Validation des intégrations — 15 août 2026

## OpenWA

L’intégration actuelle cible bien **OpenWA** tel que présenté sur [open-wa.org](https://www.open-wa.org). Le site l’identifie comme une passerelle API HTTP WhatsApp open source et auto-hébergée. Il annonce une API REST, des webhooks temps réel avec HMAC, une authentification par clés d’API et une architecture multi-sessions. Le produit supporte deux moteurs WhatsApp configurables, dont `whatsapp-web.js` et `baileys`.

Conséquence d’architecture : l’application AfroMuse ne lance pas OpenWA dans son propre conteneur. Elle dialogue avec une instance OpenWA séparée par `OPENWA_BASE_URL` et vérifie les appels entrants avec `OPENWA_WEBHOOK_SECRET`. Cette séparation conserve l’adaptateur remplaçable et évite de rendre le front public dépendant d’un navigateur WhatsApp éphémère.

## Chariow

Chariow expose une API REST à l’URL de base `https://api.chariow.com/v1`. Le parcours de checkout requiert un produit publié puis une création de session via `/checkout`. La réponse comporte un état à gérer : `payment`, `completed` ou `already_purchased`. La confirmation fiable doit venir d’un webhook Chariow (nommé Pulse), et non du retour navigateur.

Les webhooks Chariow doivent être validés en HMAC-SHA256 sur le corps brut ; leur en-tête `x-pulse-delivery-id` sert de clé de déduplication. AfroMuse conservera également l’identifiant de vente retourné par Chariow pour lier le paiement à la commande et créditer de manière idempotente le compte bénéficiaire demandé.

## Sources

1. [OpenWA — Open Source WhatsApp API Gateway](https://www.open-wa.org/)
2. [Chariow — Checkout guide](https://chariow.dev/en/guides/checkout)
3. [Chariow — Best practices](https://chariow.dev/en/guides/best-practices)
4. [Chariow — Developer documentation & API](https://help.chariow.com/en/articles/259-developer-documentation-and-api)
