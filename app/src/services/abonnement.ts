/**
 * ABONNEMENT PAWSTULER PREMIUM
 * Ce qui décide si une fonctionnalité premium est accessible, les rappels de fin d'essai,
 * et l'achat lui-même.
 *
 * L'achat réel passera par l'App Store avec RevenueCat (react-native-purchases), qui gère
 * l'essai gratuit, le renouvellement et la restauration des achats. Seules les fonctions
 * `acheterFormule` et `restaurerAchats` changeront : les écrans resteront identiques.
 * Étapes détaillées : docs/connexion-et-abonnement.md.
 */
import { JOURS_ESSAI, NOM_OFFRE, formuleParId, type FormuleId } from '@/config/abonnement';
import { joursEntre } from '@/logique/dates';
import type { EtatApp } from '@/store/types';

/** Jours restants de l'essai gratuit (null si pas d'essai en cours). */
export function joursRestantsEssai(etat: EtatApp): number | null {
  if (etat.abonnement.statut !== 'essai' || !etat.abonnement.debutEssai) return null;
  return Math.max(0, JOURS_ESSAI - joursEntre(etat.abonnement.debutEssai));
}

/** Vrai si l'utilisateur a accès à Premium (essai en cours ou abonnement actif). */
export function aPremium(etat: EtatApp): boolean {
  if (etat.abonnement.statut === 'actif') return true;
  const restants = joursRestantsEssai(etat);
  return restants !== null && restants > 0;
}

/** L'essai gratuit n'est proposé qu'une fois (et seulement avec l'annuel). */
export const essaiDisponible = (etat: EtatApp) => !etat.abonnement.essaiUtilise && etat.abonnement.statut === 'gratuit';

/** Libellé du statut, pour la page Compte. */
export function libelleAbonnement(etat: EtatApp): string {
  if (etat.abonnement.statut === 'actif') return `${NOM_OFFRE} · ${formuleParId(etat.abonnement.formule ?? 'mensuel').libelle.toLowerCase()}`;
  const restants = joursRestantsEssai(etat);
  if (restants !== null && restants > 0) return `Essai gratuit : ${restants} jour${restants > 1 ? 's' : ''} restant${restants > 1 ? 's' : ''}`;
  return 'Version gratuite';
}

/** Message de rappel à afficher pendant l'essai (null s'il n'y a rien à dire). */
export function rappelEssai(etat: EtatApp): string | null {
  const restants = joursRestantsEssai(etat);
  if (restants === null) return null;
  if (restants === 3) return 'Ton essai Premium se termine dans 3 jours. Ensuite : 39,99 €/an, sauf résiliation.';
  if (restants === 1) return 'Ton essai Premium se termine demain. Ensuite : 39,99 €/an, sauf résiliation.';
  if (restants === 0) return 'Ton essai Premium est terminé. Tu gardes tout ce que tu as gagné.';
  return null;
}

export type ResultatAchat = { ok: true; formule: FormuleId } | { ok: false; annule: boolean; message?: string };

/**
 * Achète une formule.
 * TODO(abonnement) : avec RevenueCat —
 *   const offres = await Purchases.getOfferings();
 *   const paquet = offres.current?.availablePackages.find((p) => p.product.identifier === formule.produitAppStore);
 *   const { customerInfo } = await Purchases.purchasePackage(paquet);
 *   ok = customerInfo.entitlements.active['premium'] !== undefined;
 * En attendant (mode démo), l'achat est simulé et réussit toujours.
 */
export async function acheterFormule(formule: FormuleId): Promise<ResultatAchat> {
  await new Promise((r) => setTimeout(r, 300));
  return { ok: true, formule };
}

/**
 * Restaure un abonnement déjà payé (nouveau téléphone, réinstallation). Obligatoire pour l'App Store.
 * TODO(abonnement) : Purchases.restorePurchases() puis lire entitlements.active['premium'].
 */
export async function restaurerAchats(): Promise<FormuleId | null> {
  await new Promise((r) => setTimeout(r, 300));
  return null;
}
