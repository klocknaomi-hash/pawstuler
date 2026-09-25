/**
 * SÉRIE DE JOURS 🐾 (streak)
 * Un jour compte dès que l'utilisateur ouvre l'app. La série est bienveillante :
 * si elle s'arrête, elle recommence simplement à 1, sans rien faire perdre
 * (pièces, objets, compagnon et meilleure série sont conservés).
 */

export type ObjectifSerie = { jours: number; titre: string; texte: string };

/** Objectifs proposés à l'onboarding (et modifiables dans le profil du compagnon). */
export const OBJECTIFS_SERIE: ObjectifSerie[] = [
  { jours: 2, titre: 'En douceur', texte: 'Deux jours de suite, pour prendre le rythme.' },
  { jours: 5, titre: 'Une semaine de travail', texte: 'Cinq jours, comme une semaine de recherche.' },
  { jours: 7, titre: 'Une semaine entière', texte: 'Sept jours, pour installer une habitude.' },
  { jours: 14, titre: 'Deux semaines', texte: 'Quatorze jours, pour aller plus loin ensemble.' },
];

export const OBJECTIF_SERIE_PAR_DEFAUT = 5;
