# Référence Eleven Music — capacités vérifiées

Consulté le 16 août 2026 avant toute évolution du contrat fournisseur.

| Capacité | Constat vérifié | Incidence AfroMuse |
|---|---|---|
| Durée demandée | Le champ `music_length_ms` accepte une durée de 3 000 à 600 000 ms lorsqu’un prompt est utilisé. | Les formats 120 et 180 secondes sont dans la plage documentée ; une validation par clé réelle reste indispensable. |
| Composition plan | Un plan peut organiser des chunks, leurs textes, paroles, durées, styles positifs/négatifs et niveau d’adhérence. | Les structures éditées dans le studio peuvent évoluer vers un plan fournisseur, sans changer le contrat produit. |
| Réponse détaillée | `compose_detailed` retourne le plan de composition, des métadonnées, le nom de fichier, l’audio et un `song_id` lorsqu’il est conservé. Les paroles sont incluses dans le plan si elles s’appliquent. | L’adaptateur doit préférer cette réponse lorsque disponible pour persister les paroles produites, la durée et l’identifiant de composition. |
| Variantes / stems | La documentation décrit la séparation en stems dans l’interface de téléchargement, mais ne confirme pas un endpoint API stable de téléchargement de stems dans la référence consultée. | Le modèle AfroMuse doit accepter plusieurs assets, mais ne doit créer aucune variante fictive : seules les sorties réellement renvoyées seront affichées. |

## Sources officielles

- [Eleven Music — capacités](https://elevenlabs.io/docs/overview/capabilities/music)
- [Music quickstart](https://elevenlabs.io/docs/eleven-api/guides/cookbooks/music)
- [API reference — compose et plans](https://elevenlabs.io/docs/api-reference/music/compose)
- [Référence ElevenLabs Music maintenue](https://github.com/elevenlabs/skills/blob/main/music/references/api_reference.md)
