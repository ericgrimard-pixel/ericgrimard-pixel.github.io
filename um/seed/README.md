# Graine — adaptateur d'hôte

Famille : Miriamphobots. La graine n'est branchée à aucun serveur, aucun moteur et aucun backend. L'hôte est branché au moment de l'activation :

```js
var seed = UM_SEED.createSeed();
seed.activate(adapter);
```

`describe()` annonce le nom de l'hôte, sa version et la liste des capacités. La graine n'active que ce qui est déclaré. Un crochet absent retombe sur une mise en œuvre locale.

| Crochet | Rôle | Repli |
| --- | --- | --- |
| `describe()` | nom, version, capacités | hôte `null`, aucune capacité |
| `storage` | lire, écrire, lister, effacer un document par clé | mémoire de la graine |
| `model` | `generate(prompt, opts)` renvoie un texte ou un flux. Crochet de Claude (`model-hook.mjs`) : `adapter.model = createModelHook({ provider })` | sans fournisseur : `[aucun modèle]` |
| `transport` | envoyer, recevoir, courte identité de l'expéditeur | boucle locale |
| `sync` | pousser et tirer par numéro de version | sync locale ; un conflit est rapporté et n'est jamais résolu tout seul |
| `keys` | signer et vérifier | signature absente, marquée `unsigned` |
| `lifecycle` | `onActivate`, `onPause`, `onDeactivate`, et un échange d'hôte sans perdre l'état | rien à appeler |

La clé privée, s'il y en a une, reste dans l'hôte. Elle n'est pas copiée sur la graine, ni renvoyée par `sign`.

`createNullHost()` ne déclare rien : tous les crochets sont en repli. `createDemoHost()` déclare le stockage, le transport, la sync et le cycle de vie. Le modèle et la clé ne sont pas branchés.

## Fantôme de Classe 4

`c4-ghost-motion.js` est l'option B. Le trait part de l'objet et va vers T₁. Il n'y a pas de ligne de côté. Chaque pas lit la position réelle. Si l'objet ne bouge pas, le trait ne bouge pas. Les marques T₀ et T₁ restent.

Le chemin Z0 est le même pli T₀ → T₁, recentré sur la singularité (point sombre, liseré clair, dessiné devant).

## Ce qui est réel, bouchon, ou manquant

| | |
| --- | --- |
| Réel | graine locale, replis, crochet modèle de Claude, fantôme option B, singularité |
| Bouchon | aucun fournisseur de modèle n'est branché (l'hôte en choisit un) : le texte est `[aucun modèle]` |
| Manquant | pas de nœud mère ; pas de clé de signature (la clé APK d'origine est perdue) |

Le crochet `model` est de Claude (27 nov 2026). Il ne contient ni adresse ni secret. L'hôte injecte le fournisseur à l'activation. Sans fournisseur, `describe()` ne déclare pas `model`.

Les tests : `node um/seed/seed.test.js`.
