# Modèle de données — chansons vocales longues

Les générations conserveront le prompt d’intention existant et ajouteront, de façon additive, une stratégie de paroles (`none`, `generate`, `custom`), le texte de paroles le cas échéant, une langue vocale, une structure de sections, une durée réelle et un identifiant de plan fournisseur. Le contrat `MusicProvider` devra recevoir ces éléments sous forme optionnelle, afin que les fournisseurs qui ne disposent pas d’un plan de composition continuent à fonctionner.

L’actif audio principal reste un mix par génération pendant le lancement. Les stems et variantes vocales ne seront ajoutés qu’après confirmation explicite du support et des conditions de l’API choisie, ce qui évite une migration prématurée et un affichage trompeur dans la bibliothèque.
