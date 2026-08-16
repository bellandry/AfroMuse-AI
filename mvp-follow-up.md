# Suivi MVP — éléments restants

La bibliothèque renvoie déjà les générations de l’utilisateur avec une URL audio associée et l’écran propose un lecteur ainsi qu’un téléchargement. Les travaux non bloqués à privilégier sont donc la clarté des statuts, la notification de rafraîchissement et les contrôles de reprise de génération. Les intégrations Better Auth, email OTP, génération réelle et paiement restent dépendantes de secrets de production.

Le traitement existant est protégé côté serveur et limite déjà l’accès à une génération à son propriétaire. Une reprise manuelle ne doit jamais réactiver un job dont la réservation de crédits a été libérée ; l’interface privilégiera donc l’observation et le rafraîchissement, tandis que les reprises persistantes restent pilotées par le job planifié idempotent.

Les validations de montant de crédits et de numéro WhatsApp ont été isolées en règles pures afin d’être testables sans accès base de données ni fournisseur d’email. Les scénarios nécessitant une base réelle — idempotence de ledger, association unique de numéro et consommation OTP — devront être rejoués en intégration lors de l’activation des environnements externes.
