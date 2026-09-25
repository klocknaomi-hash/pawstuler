/**
 * ABONNEMENT ZIGGY+
 * Ce qui décide si une fonctionnalité premium est accessible, et les rappels de fin d'essai.
 * L'achat réel passera par l'App Store (par exemple avec RevenueCat ou StoreKit) :
 * seules les fonctions de ce fichier changeront.
 */
import { joursRestantsEssai } from '@/store/etat';
import type { EtatApp } from '@/store/types';

/** Vrai si l'utilisateur a accès à Ziggy+ (essai en cours ou abonnement actif). */
export function aZiggyPlus(etat: EtatApp): boolean {
  if (etat.abonnement.statut === 'actif') return true;
  const restants = joursRestantsEssai(etat);
  return restants !== null && restants > 0;
}

/** Message de rappel à afficher pendant l'essai (null s'il n'y a rien à dire). */
export function rappelEssai(etat: EtatApp): string | null {
  const restants = joursRestantsEssai(etat);
  if (restants === null) return null;
  if (restants === 3) return 'Ton essai Ziggy+ se termine dans 3 jours.';
  if (restants === 1) return 'Ton essai Ziggy+ se termine demain.';
  if (restants === 0) return "Ton essai Ziggy+ se termine aujourd'hui.";
  return null;
}
