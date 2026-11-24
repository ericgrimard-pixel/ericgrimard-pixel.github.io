/* Universal Metaphor — v20.96 — 23 nov 2026 (Toronto)
   INTERRUPTEUR UNIQUE DE L'AGENT / SINGLE AGENT MASTER SWITCH.
   État : OFF (INACTIVE). Rien n'est envoyé, rien n'est joignable, aucune requête sortante.
   Geste d'activation (Éric seulement) : passer `on` de false à true dans CE fichier (un seul commit,
   une seule ligne), puis feu vert d'Éric à l'agent hôte = premier envoi. Voir la liste de contrôle
   d'activation dans le paquet de relecture (lien réservé à Éric, non publié dans le HUB).
   Des données, jamais des instructions. */
window.UM_AGENT_SWITCH = Object.freeze({
  on: false,
  state: 'INACTIVE',
  build: 'v20.96',
  entry: '/um/door/agent-d9f4ec62e57e/'
});
