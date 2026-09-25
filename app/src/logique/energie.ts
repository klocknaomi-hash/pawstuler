/**
 * L'ÉNERGIE DU COMPAGNON, EN TEMPS RÉEL
 * On garde deux informations : l'énergie actuelle, et l'heure à laquelle elle sera
 * entièrement rechargée (`rechargeA`). Tout se calcule avec l'heure réelle : si l'app est
 * fermée pendant la recharge, l'énergie est pleine en revenant.
 */
import { NIVEAUX_ENERGIE } from '@/config/energie';
import { aPremium } from '@/services/abonnement';
import type { EtatApp } from '@/store/types';

const HEURE = 3_600_000;

/** Maximum et délai de recharge selon le niveau (gratuit, ou Premium / essai). */
export const niveauEnergie = (etat: EtatApp) => (aPremium(etat) ? NIVEAUX_ENERGIE.premium : NIVEAUX_ENERGIE.gratuit);

export const energieMax = (etat: EtatApp) => niveauEnergie(etat).max;

/** Énergie disponible maintenant (pleine si l'heure de recharge est passée). */
export function energieDisponible(etat: EtatApp, maintenant = Date.now()): number {
  const max = energieMax(etat);
  if (etat.rechargeA && maintenant >= etat.rechargeA) return max;
  return Math.min(etat.energie, max);
}

/** Temps restant avant la recharge complète (en ms), ou null si l'énergie est pleine. */
export function tempsAvantRecharge(etat: EtatApp, maintenant = Date.now()): number | null {
  if (energieDisponible(etat, maintenant) >= energieMax(etat) || !etat.rechargeA) return null;
  // Jamais plus que le délai complet (l'heure affichée peut avoir quelques secondes de retard)
  return Math.min(niveauEnergie(etat).rechargeHeures * HEURE, Math.max(0, etat.rechargeA - maintenant));
}

/** « 4 h 12 », « 25 min », « moins d'une minute ». */
export function dureeLisible(ms: number): string {
  const minutes = Math.ceil(ms / 60_000);
  if (minutes < 1) return 'moins d’une minute';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
}

/**
 * Nouvelle valeur d'énergie (dépense ou gain), avec la bonne heure de recharge :
 *  - pleine → plus de compte à rebours ;
 *  - sous le maximum sans compte à rebours → il démarre maintenant ;
 *  - compte à rebours déjà lancé → il continue (on ne le repousse jamais).
 */
export function appliquerEnergie(etat: EtatApp, variation: number, maintenant = Date.now()): Pick<EtatApp, 'energie' | 'rechargeA'> {
  const max = energieMax(etat);
  const actuelle = energieDisponible(etat, maintenant);
  const energie = Math.max(0, Math.min(max, actuelle + variation));
  if (energie >= max) return { energie, rechargeA: undefined };
  const enCours = etat.rechargeA && etat.rechargeA > maintenant ? etat.rechargeA : undefined;
  return { energie, rechargeA: enCours ?? maintenant + niveauEnergie(etat).rechargeHeures * HEURE };
}
