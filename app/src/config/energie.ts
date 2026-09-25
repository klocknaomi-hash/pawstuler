/**
 * ÉNERGIE ⚡ ET AVENTURE DU JOUR
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

/** Ce que coûtent les moments avec le compagnon. */
export const COUT = {
  calin: 5,
  jeu: 10,
  aventure: 20,
} as const;

/** Nombre d'aventures possibles par jour. */
export const AVENTURES_PAR_JOUR = { gratuit: 1, premium: 3 } as const;

/** Pièces gagnées au retour d'une aventure. */
export const PIECES_AVENTURE = 10;
