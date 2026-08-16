# Validation du fournisseur — chansons longues

L’adaptateur actuel appelle la génération simple Eleven Music avec `music_length_ms` et active la voix en envoyant `force_instrumental: false`. Il n’envoie pas de paroles ni de plan de composition ; cela explique que le produit ne propose pas encore un parcours de chanson structuré.

Les documents Eleven Music consultés indiquent la prise en charge de chansons vocales, de paroles fournies ou générées, de plans de composition et de durées suffisantes pour les formats ciblés. La documentation seule ne valide toutefois ni la qualité, ni la disponibilité sur le compte, ni le coût réel. Un pilote de 120 et 180 secondes reste bloqué tant que `ELEVENLABS_API_KEY` n’est pas configurée.

Décision d’implémentation : préparer dès maintenant les contrats, validations et parcours pour 120/180 secondes, mais afficher les formats longs comme disponibles uniquement après validation du pilote réel et configuration de la clé.
