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

/** Jour de l'essai (1 à 7), ou null si pas d'essai en cours. Calculé sur la date, pas sur les ouvertures. */
export function jourEssai(etat: EtatApp): number | null {
  const restants = joursRestantsEssai(etat);
  if (restants === null || restants <= 0) return null;
  return JOURS_ESSAI - restants + 1;
}

/**
 * Vrai si l'utilisateur a accès à Premium : abonnement actif, essai en cours,
 * ou essai terminé sans résiliation (l'App Store démarre alors l'abonnement annuel).
 * C'est l'unique règle utilisée partout (énergie, Shop, fonctions Premium).
 */
export function aPremium(etat: EtatApp): boolean {
  if (etat.abonnement.statut === 'actif') return true;
  const restants = joursRestantsEssai(etat);
  if (restants === null) return false;
  return restants > 0 || !etat.abonnement.resiliationPrevue;
}

/** Niveau affiché et utilisé pour les règles : gratuit, essai ou Premium. */
export function niveau(etat: EtatApp): 'gratuit' | 'essai' | 'premium' {
  if (jourEssai(etat) !== null) return 'essai';
  return aPremium(etat) ? 'premium' : 'gratuit';
}

/**
 * Fin de l'essai (appelée chaque jour) : sans résiliation, l'annuel démarre ;
 * après une résiliation, retour en gratuit (tout est conservé) avec un petit message.
 */
export function abonnementDuJour(etat: EtatApp): EtatApp['abonnement'] {
  const a = etat.abonnement;
  const restants = joursRestantsEssai(etat);
  if (restants === null || restants > 0) return a;
  return a.resiliationPrevue
    ? { ...a, statut: 'gratuit', resiliationPrevue: false, finEssaiAVoir: true }
    : { ...a, statut: 'actif', formule: 'annuel' };
}

/** Rappel doux « tes 7 jours d'essai t'attendent toujours » : au plus tous les 4 jours. */
export function rappelEssaiDisponible(etat: EtatApp, aujourdhui: string): boolean {
  if (!essaiDisponible(etat) || !etat.onboardingTermine) return false;
  const dernier = etat.abonnement.rappelEssaiLe;
  return !dernier || joursEntre(dernier, aujourdhui) >= 4;
}

/** L'essai gratuit n'est proposé qu'une fois (et seulement avec l'annuel). */
export const essaiDisponible = (etat: EtatApp) => !etat.abonnement.essaiUtilise && etat.abonnement.statut === 'gratuit';

/** Libellé du statut, pour la page Compte. */
export function libelleAbonnement(etat: EtatApp): string {
  if (etat.abonnement.statut === 'actif') return `${NOM_OFFRE} · ${formuleParId(etat.abonnement.formule ?? 'mensuel').libelle.toLowerCase()}`;
  const jour = jourEssai(etat);
  if (jour !== null) return `Essai Premium : jour ${jour} sur ${JOURS_ESSAI}`;
  if (aPremium(etat)) return `${NOM_OFFRE} · annuel`;
  return 'Version gratuite';
}

/** Message de rappel à afficher pendant l'essai (null s'il n'y a rien à dire). */
export function rappelEssai(etat: EtatApp): string | null {
  const restants = joursRestantsEssai(etat);
  if (restants === null || restants <= 0) return null;
  const suite = etat.abonnement.resiliationPrevue
    ? 'Ensuite, tu repasses en version gratuite (tu gardes tout).'
    : 'Ensuite : 39,99 €/an, sauf résiliation.';
  if (restants === 3) return `Ton essai Premium se termine dans 3 jours. ${suite}`;
  if (restants === 1) return `Ton essai Premium se termine demain. ${suite}`;
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
