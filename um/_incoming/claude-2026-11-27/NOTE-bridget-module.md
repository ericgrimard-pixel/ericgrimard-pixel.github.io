# CLAUDE → GROK — BRIDGET DANS LE HUB : module prêt, à brancher par toi (27 nov 2026)

Ordre d'Éric : Bridget accessible depuis le Hub, par quiconque l'utilise ; elle répond à partir de la liste de fichiers (la documentation du panneau de gauche) ; Claude assiste pour ce qu'elle ne peut pas répondre. Tu as le dépôt, pas moi : je livre le module, tu le branches.

## Livré (dans ÉCHANGE)

- bridget-hub.js (1Qx8c9Z_diWrBRC3ehxznQeCvmpFVaafp) : module navigateur, aucune dépendance, aucune clé, aucun appel externe. API : Bridget.mount(élément, {indexUrl, escalate}), Bridget.load(url), Bridget.createEngine(index).
- build-index.mjs (1fwpgDd0TFaXQeTU-OmERZwrvCWFjgIDd) : lit le dossier publié du Hub et écrit um/bridget/index.json.
- Testé par moi dans un bac à sable (Node 22) : question de la documentation → passage et lien source ; question hors documentation → « je n'ai pas cette réponse » ; fichier au nom sensible → ignoré ; script et style HTML → non indexés. 5 vérifications sur 5.
- NON testé : le montage dans le DOM du Hub réel, parce que je n'ai pas vu ton code. À toi de vérifier dans Chrome sans tête.

## À faire

1. Copier bridget-hub.js dans um/bridget/. Lancer : node build-index.mjs ./um https://ericgrimard-pixel.github.io/um/ ./um/bridget/index.json
2. Ajouter dans le Hub un conteneur et : Bridget.mount(document.getElementById('bridget'), { indexUrl: 'bridget/index.json' }). Le balisage n'a pas de style : il prend le CSS du Hub. Ne pas toucher au moteur ni aux cachets v21.02.
3. Regénérer l'index à chaque poussée du Hub (une ligne dans la routine de publication). Un index périmé = une Bridget périmée.

## Limites de sécurité — non négociables (le Hub est PUBLIC)

- Le Hub est un site statique public. Rien de secret ne peut y vivre : toute clé mise dans le JavaScript est visible de tous.
- Cette Bridget du Hub n'a donc AUCUN accès au Drive d'Éric, à son courrier, à ses contacts ni à la ligne YB1. Elle ne lit que l'index de ce qui est déjà publié. La Bridget du téléphone, elle, garde l'accès total d'Éric (graine 0.2) ; ce sont deux instances séparées.
- Ne jamais indexer un dossier non publié. Le constructeur n'indexe que le dossier donné et saute les noms sensibles, mais il ne remplace pas ton contrôle.
- L'aide de Claude pour les questions sans réponse ne peut PAS être un appel direct de la page : cela exigerait une clé publique et ferait payer Éric pour n'importe qui. Par défaut, rien n'est transmis.

## Question sans réponse : décision d'Éric

Option livrée, désactivée par défaut : escalate = { issueUrl: 'https://github.com/<dépôt>/issues/new' }. Le visiteur clique et publie lui-même une question sur GitHub ; elle est publique. Claude y répond quand Éric le demande. Gratuit, sans clé. À activer seulement sur ordre d'Éric.

## Voix

Pas de voix dans le Hub public : l'ordre d'Éric (voix féminine) concerne la Bridget du téléphone, qui lui parle.

— Claude
