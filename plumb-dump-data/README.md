# plumb-dump-data — surface d’observation (door v2)

Chemin isolé, publié à côté du Hub et **non lié** depuis `um/index.html` ni depuis aucun autre fichier déjà présent dans le dépôt. Le protocole Manifestation (rév. 23.16) n’est pas modifié. L’historique git n’est pas réécrit.

Cette page et ce fichier décrivent le flux de la porte. Ils ne publient ni jetons, ni adresses de dépôt, ni registre d’invités.

## Flux

1. **Dépôt.** Un fichier (CSV ou xlsx) arrive à un point d’entrée réservé à un invité. Cette surface n’envoie aucune invitation.
2. **Contrôles.** Le dépôt n’est accepté que s’il appartient à un invité encore actif et que l’expéditeur est celui qui a été invité. Plafonds de taille et de dimensions, vérification des octets magiques, aucune exécution de macros ni de formules.
3. **Fragmentation en cellules.** Les dépôts Santé sont découpés selon le **cell-schema v1**, partagé avec le treillis Santé. Rien n’est inventé : une colonne ou une ligne non cartographiable reste `OPEN / unmapped`. Les quintiles restent **Q1–Q5** (ou ALL). Ils ne sont jamais projetés sur les zones de protocole Ω φ⁻ Σ φ⁺ α. Le pays n’est assigné à une zone géographique que via `schema/country-zone.csv`.
4. **Bac à sable par invité.** Chaque dépôt accepté devient un répertoire `systems/<préfixe-sha>/`, avec la lib lue par le moteur, le fichier source, et les cellules le cas échéant.
5. **Visionneuse Manifestation.** Un chrome v2 (ligne d’en-tête compacte, sélecteur de Classe 2 en haut du panneau droit, boutons de scène) enveloppe une copie en lecture seule de `manifestation-engine.html`. Le moteur n’est pas modifié. `zoneOf` et les seuils 20 / 40 / 60 / 80 restent identiques, octet pour octet.

La porte v1 (cartographie directe vers le contrat LIB existant, sans fragmentation Santé) reste intacte en local. Les dépôts v1 publiés ici sont simplement relus dans la visionneuse v2.

## Schéma, indicateurs, zones

- [`schema/cell-schema-v1.json`](schema/cell-schema-v1.json) et [`schema/cell-schema-v1.md`](schema/cell-schema-v1.md)
- [`schema/country-zone.csv`](schema/country-zone.csv) — 217 pays, six zones géographiques (Africa, Europe, East, Middle East, South Pacific, America). Dérogations déjà présentes dans le treillis : MLT → Europe, AFG / PAK → East, GRL → America.
- [`schema/indicators.json`](schema/indicators.json) — 16 indicateurs.
- [`lattice/zone_headlines.csv`](lattice/zone_headlines.csv) et [`lattice/coverage_summary.md`](lattice/coverage_summary.md).

`lattice.json` (~19,7 Mo) n’est pas publié.

Ces six zones sont celles du treillis, **pas** les zones de protocole Ω φ⁻ Σ φ⁺ α. La [carte](index.html#carte) le rappelle.

## Bacs à sable

Tous rendus dans la visionneuse v2. Le bouton HUB de l’en-tête est neutralisé.

| Préfixe SHA-256 | Fichier | kind | Notes |
| --- | --- | --- | --- |
| `e07d07936ce5` | synthetic-health-le0.csv | cols | Santé SYNTHETIC, 6 FILLED, 2 unmapped |
| `b88b16afff76` | synthetic-health-le0.xlsx | cols | Même dépôt, classeur xlsx |
| `0cf92c4aa33c` | lattice-excerpt-le0-pop-hale0.csv | cols | 30 cellules FILLED du treillis |
| `a912f92cb325` | SAMPLE-finance-synthetique.csv | finance | Classe 2 : secteur / industrie / pays |
| `539ba3182f2b` | SAMPLE-hockey-synthetique.csv | cols | Pas les tables du contrat hockey — [INCOMPLET] |
| `ce036324d814` | SAMPLE-cas-limites.csv | cols | Cas limites ; colonnes texte non promues en Classe 2 |
| `9c0adea2fd42` | NHL_players_long_2024-25_2025-26.csv | cols | 1187 objets ; pas les tables hockey |
| `907b94d35964` | SAMPLE-deux-onglets.xlsx | finance + cols | Deux feuilles |

Les sommes complètes sont dans chaque `systems/…/meta.json` et dans [`SHA256SUMS-PUBLIC`](SHA256SUMS-PUBLIC). Le moteur gelé est vérifié contre [`snapshot/SHA256SUMS`](snapshot/SHA256SUMS).

## Ce qui n’est pas publié

Le registre d’invités, les jetons, les scripts d’intake, les reçus, le grand livre, les adresses d’expéditeur, et tout sondage de messagerie restent **locaux**. Cette surface est seulement observationnelle.

## Moteur gelé

Copie en lecture seule de l’engine du Hub, prise le 20 novembre 2026 à 22:16 (America/Toronto), alignée sur le Hub v20.85, protocole rév. 23.16. Les bibliothèques de marché vivantes (`lib-*.js` du Hub) ne sont pas incluses. Chaque bac à sable fournit sa propre `lib-intake.js`.
