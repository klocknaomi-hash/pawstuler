/**
 * ÉNERGIE ⚡
 * L'énergie n'est pas une monnaie : c'est la capacité du compagnon à vivre des moments
 * (câlin, jeu, aventures, missions). Elle ne baisse que quand on lui demande une action ;
 * consulter une page ou recevoir une notification ne coûte jamais rien.
 *
 * Recharge : dès que l'énergie passe sous le maximum, un compte à rebours démarre ;
 * au bout du délai, elle revient entièrement au maximum.
 * Tous les réglages sont ici.
 */

/** Énergie selon le niveau d'abonnement (l'essai Premium compte comme Premium). */
export const NIVEAUX_ENERGIE = {
  gratuit: { max: 30, rechargeHeures: 5 },
  premium: { max: 100, rechargeHeures: 3 },
} as const;

/** Chaque tâche terminée redonne un peu d'énergie (reprise si la tâche est décochée). */
export const ENERGIE_PAR_TACHE = 3;

/** Ce que coûtent les petits moments avec le compagnon (les missions ont leurs coûts dans `missions.ts`). */
export const COUT = {
  calin: 5,
  jeu: 10,
} as const;

/** Nombre d'explorations de la ville possibles par jour (les missions miroir ont leur propre limite). */
export const AVENTURES_PAR_JOUR = { gratuit: 1, premium: 3 } as const;
