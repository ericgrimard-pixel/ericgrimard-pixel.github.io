# Universal Metaphor — HUB v21.06 (version sûre)

Prototype privé de démonstration. **Non affilié à la Ligue nationale de hockey.**

- Hub : `index.html` — ouvre `#/world` (World au centre, cinq macro-zones autour). Un double-clic sur une zone ouvre son étage cardinal ; un double-clic sur l'objet central d'un étage remonte à World. Les cinq cardinaux restent sur `#/floor/…`, en année et en T0→T1.
- Étage international · manifestation : `#/floor/WF` (World au centre, les cinq macro-zones en Classe 2, la même série que `#/world`). Depuis `#/world`, un double-clic sur World ouvre cet étage.
- Galaxie : `#/galaxy/planet`
- Sports silos : `#/galaxy/sports`
- LNH : `nhl.html` → `index.html?v=21.03#/sports/nhl`
- Music (Société · Musique) is an independent field (a row) in the World view, under society. It is separate from finance and from professional sport, and it has its own Class 2 objects. It is the starting point for the next layer of the build. It is never nested inside any panel. The Class 2 slot (`#um-musique-c2`) is empty: no local music data source.
- Marché Z0 : transition T0→T1 uniquement (pas de marche année complète)
- Microcosme (rév. 23.17 + relatif 23.20, sur 23.19 / 23.18) : la progression Z0 (T₀ → T₁) est transposée dans le microcosme. L'objet central y change de position relative en même temps que sa forme, sa couleur, son étirement et ses angles. L'ancre de la chambre reste en [0, 0, 0]. Le gain lisse garde le corps dans la paroi (0,74). Le fantôme de trajectoire suit cette position et reste caché sans dérive.
- Brigitte (Miriamphobots) : une seule entrée, le bouton en haut du HUB et du moteur. Elle salue dès l’ouverture. `#/world`, `?host=bridget`, `?from=world` et un lien `.world` ouvrent ce même panneau. Les questions lisent `bridget/index.json` (documentation du panneau de gauche) et proposent « Montre-moi ». La voix et la couche d’action de v21.05 restent. Devise : *One seed, infinite roots, perpetual harvest.* Lignée v20.99 → v21.00 → v21.01 → v21.02 → v21.03 → v21.04 → v21.05 → v21.06. Prochain numéro libre : v21.07. Graine minimale sur les deux téléphones (`eric.grimard@universalmetaphor.ca`, `grimeric13@gmail.com`), sans bac à sable de 4 Go et sans cristaux d’agent. Portail une touche : `bridget/`. Conversation et gestes : `engine/bridget-demo.js` (`window.BridgetDemo`). Actualisation ETag + SHA-256, sans réinstallation d’APK. Les documents (PDF, dossiers, archives) ne sont plus des accès du HUB.
- Santé, deux coupes Classe 2 : villes du monde (WUP 2025, T₀ 1990 → T₁ 2024, couverture 179/196) et provinces du Canada (StatCan 13-10-0114). `um/data/sante/xyz/` n’est pas modifié. `engine.js` non plus.
- Structures sportives statiques : aucun Z0

Sigles d'équipes uniquement (pas de logos officiels).
