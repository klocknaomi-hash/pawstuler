/**
 * ABONNEMENT ZIGGY+
 * Ce qui décide si une fonctionnalité premium est accessible, et les rappels de fin d'essai.
 * L'achat réel passera par l'App Store (par exemple avec RevenueCat ou StoreKit) :
 * seules les fonctions de ce fichier changeront.
 */
import { JOURS_ESSAI } from '@/config/abonnement';
import { joursEntre } from '@/logique/dates';
import type { EtatApp } from '@/store/types';

/** Jours restants de l'essai Ziggy+ (null si pas d'essai en cours). */
export function joursRestantsEssai(etat: EtatApp): number | null {
  if (etat.abonnement.statut !== 'essai' || !etat.abonnement.debutEssai) return null;
  return Math.max(0, JOURS_ESSAI - joursEntre(etat.abonnement.debutEssai));
}

/** Vrai si l'utilisateur a accès à Ziggy+ (essai en cours ou abonnement actif). */
export function aZiggyPlus(etat: EtatApp): boolean {
  if (etat.abonnement.statut === 'actif') return true;
  const restants = joursRestantsEssai(etat);
  return restants !== null && restants > 0;
}

/** Libellé du statut, pour la page Compte. */
export function libelleAbonnement(etat: EtatApp): string {
  if (etat.abonnement.statut === 'actif') return 'Ziggy+ actif';
  const restants = joursRestantsEssai(etat);
  if (restants !== null && restants > 0) return `Essai Ziggy+ : ${restants} jour${restants > 1 ? 's' : ''} restant${restants > 1 ? 's' : ''}`;
  return 'Version gratuite';
}

/** Message de rappel à afficher pendant l'essai (null s'il n'y a rien à dire). */
export function rappelEssai(etat: EtatApp): string | null {
  const restants = joursRestantsEssai(etat);
  if (restants === null) return null;
  if (restants === 3) return 'Ton essai Ziggy+ se termine dans 3 jours.';
  if (restants === 1) return 'Ton essai Ziggy+ se termine demain.';
  if (restants === 0) return 'Ton essai Ziggy+ est terminé. Tu gardes tout ce que tu as gagné.';
  return null;
}

/**
 * Démarrer l'essai. TODO(abonnement) : lancer l'achat App Store avec essai gratuit,
 * puis mettre à jour l'état seulement si l'achat est confirmé.
 */
export async function lancerEssai(): Promise<boolean> {
  return true;
}
