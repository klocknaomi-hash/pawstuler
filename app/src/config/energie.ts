/**
 * ÉNERGIE ⚡ ET AVENTURE DU JOUR
 * L'énergie n'est pas une monnaie : c'est la capacité du compagnon à vivre des
 * aventures et des moments avec toi dans la journée. Elle se dépense et se régénère.
 * Tous les réglages sont ici.
 */

/** Énergie maximale du compagnon. */
export const ENERGIE_MAX = 30;

/** Chaque matin (au réveil du compagnon), l'énergie revient au maximum. */
export const RECHARGE_CHAQUE_MATIN = true;

/** Chaque tâche terminée redonne un peu d'énergie (reprise si la tâche est décochée). */
export const ENERGIE_PAR_TACHE = 3;

/** Ce que coûtent les moments avec le compagnon. */
export const COUT = {
  calin: 5,
  jeu: 10,
  aventure: 20,
} as const;

/** Nombre d'aventures possibles par jour. */
export const AVENTURES_PAR_JOUR = { gratuit: 1, ziggyPlus: 3 } as const;

/** Pièces gagnées au retour d'une aventure. */
export const PIECES_AVENTURE = 10;
