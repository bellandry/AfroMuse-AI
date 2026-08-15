# Notes d’implémentation

## Reprise des générations

La reprise ne doit utiliser ni `setInterval` ni `node-cron`. Elle sera déclenchée par un endpoint Heartbeat sous `/api/scheduled/`, appelé par la plateforme après déploiement. Le traitement devra sélectionner uniquement les générations `queued` ou `failed` éligibles, conserver la réservation de crédits pendant les retries et relâcher cette réservation uniquement après épuisement des tentatives ou annulation.

## Webhooks et tâches externes

Les webhooks de paiement sont déjà idempotents. Une configuration de production reste nécessaire pour lancer un Heartbeat durable et activer les fournisseurs externes (email, musique, Chariow et OpenWA).
