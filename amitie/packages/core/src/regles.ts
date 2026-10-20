/**
 * Les règles du produit, en un seul endroit.
 *
 * Ce sont les valeurs PAR DÉFAUT. En production, la table `app_config`
 * (voir supabase/seed.sql) contient les mêmes clés et peut les changer
 * sans publier une nouvelle version de l'app.
 * Toute modification doit être reportée dans DECISIONS.md.
 */
export const REGLES = {
  /** Tranche d'âge de la communauté (validé : 20 à 35 ans). */
  ageMin: 20,
  ageMax: 35,

  /** Taille d'un groupe formé par le matching. */
  tailleGroupeMin: 3,
  tailleGroupeMax: 6,
  /** Taille idéale recherchée en priorité. */
  tailleGroupeCibleMin: 4,
  tailleGroupeCibleMax: 5,

  /** Sortie « ouverte » d'un cercle : nombre minimum de nouvelles personnes (validé : 2, au choix de la personne qui crée la sortie). */
  nouveauxParSortieMin: 2,

  /** Accueillir un nouveau membre dans un cercle : tous les membres doivent dire oui (validé). */
  voteNouveauMembre: 'unanimite' as const,

  /** Lien bestie : nombre de sorties partagées avant de le proposer. */
  sortiesPourBestie: 3,

  /** Plafond d'inscriptions au lancement. */
  placesMax: 300,

  /** Seule ville ouverte au lancement. */
  villeOuverte: 'paris' as const,
} as const;

export type Regles = typeof REGLES;
