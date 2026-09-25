/**
 * SIMULATEUR D'ENTRETIEN (version future, non développé)
 * Ce fichier fixe seulement la forme des données, pour que l'app puisse évoluer dans cette direction.
 *
 * Principe : l'utilisateur fournit une offre (entreprise, lien, description) ; l'IA l'analyse,
 * puis mène un entretien vocal de 15 à 30 minutes, rebondit sur les réponses et donne un retour.
 * Deux modes : « Ziggy » (rassurant, ludique) et « Recruteur » (réaliste, exigeant).
 * Fonctionnalité pensée pour Pawstuler Premium, et pour l'iPad ou l'ordinateur à terme.
 */

export type ModeEntretien = 'ziggy' | 'recruteur';

export type OffreAnalysee = {
  entreprise: string;
  poste: string;
  lien?: string;
  description: string;
  competencesCles: string[];
};

export type SessionEntretien = {
  id: string;
  candidatureId?: string; // lié à une candidature du tableau
  mode: ModeEntretien;
  dureeMinutes: 15 | 20 | 30;
  offre: OffreAnalysee;
  echanges: { auteur: 'ia' | 'utilisateur'; texte: string; horodatage: number }[];
  retour?: { pointsForts: string[]; aTravailler: string[]; note?: number };
};
