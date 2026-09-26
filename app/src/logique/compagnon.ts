/**
 * LA VIE DU COMPAGNON DANS SA VILLE
 * Combien d'aventures il peut encore vivre aujourd'hui (les lieux et ses candidatures sont
 * calculés dans logique/missions.ts, uniquement d'après ce que LUI a fait).
 */
import { AVENTURES_PAR_JOUR } from '@/config/energie';
import { aPremium } from '@/services/abonnement';
import type { EtatApp } from '@/store/types';

/** Nombre d'aventures encore possibles aujourd'hui. */
export function aventuresRestantes(etat: EtatApp): number {
  const max = aPremium(etat) ? AVENTURES_PAR_JOUR.premium : AVENTURES_PAR_JOUR.gratuit;
  return Math.max(0, max - etat.aventuresDuJour);
}
