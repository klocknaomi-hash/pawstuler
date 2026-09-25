/**
 * LA VIE DU COMPAGNON DANS SA VILLE
 * Sa recherche d'emploi est le miroir de celle de l'utilisateur, et ses aventures
 * racontent sa journée. Tout est calculé à partir de l'état : rien à saisir en double.
 */
import { RECITS } from '@/config/aventures';
import { AVENTURES_PAR_JOUR } from '@/config/energie';
import { villeParId, type Lieu } from '@/config/villes';
import { aPremium } from '@/services/abonnement';
import type { EtatApp } from '@/store/types';

import { candidaturesActives } from './tachesDuJour';

export type EtapeLieu = 'a-visiter' | 'visite' | 'candidature' | 'entretien' | 'embauche';

export const LIBELLES_ETAPES: Record<EtapeLieu, string> = {
  'a-visiter': 'Pas encore visité',
  visite: 'Déjà visité',
  candidature: 'Candidature déposée',
  entretien: 'Entretien prévu !',
  embauche: 'Il y travaille',
};

/** Où en est le compagnon dans chaque lieu de sa ville. */
export function rechercheDuCompagnon(etat: EtatApp): { lieu: Lieu; etape: EtapeLieu }[] {
  if (!etat.villeId) return [];
  const lieux = villeParId(etat.villeId).lieux.filter((l) => l.metier);
  const actives = candidaturesActives(etat);
  const envoyees = actives.filter((c) => c.statut !== 'a-envoyer').length;
  const entretien = actives.some((c) => c.statut === 'entretien' || c.statut === 'offre');
  const visites = Math.min(etat.aventuresTotal, lieux.length);

  return lieux.map((lieu, i) => {
    if (etat.compagnon?.metier?.lieuId === lieu.id) return { lieu, etape: 'embauche' };
    if (etat.contexte === 'pro') return { lieu, etape: i < visites ? 'visite' : 'a-visiter' };
    if (entretien && i === 0) return { lieu, etape: 'entretien' };
    if (i < envoyees) return { lieu, etape: 'candidature' };
    return { lieu, etape: i < visites ? 'visite' : 'a-visiter' };
  });
}

/** Le lieu où le compagnon décroche son job, le même jour que l'utilisateur. */
export function lieuEmbauche(etat: EtatApp): Lieu | undefined {
  const suivi = rechercheDuCompagnon(etat);
  return (suivi.find((s) => s.etape === 'entretien') ?? suivi.find((s) => s.etape === 'candidature') ?? suivi[0])?.lieu;
}

/** Nombre d'aventures encore possibles aujourd'hui. */
export function aventuresRestantes(etat: EtatApp): number {
  const max = aPremium(etat) ? AVENTURES_PAR_JOUR.premium : AVENTURES_PAR_JOUR.gratuit;
  return Math.max(0, max - etat.aventuresDuJour);
}

/** Compose l'aventure du jour : un lieu de la ville et un court récit. */
export function composerAventure(etat: EtatApp): { lieuId: string; texte: string } {
  const ville = villeParId(etat.villeId ?? 'clairebourg');
  const avecMetier = ville.lieux.filter((l) => l.metier);
  const lieu =
    etat.contexte === 'pro' && etat.compagnon?.metier
      ? (ville.lieux.find((l) => l.id === etat.compagnon?.metier?.lieuId) ?? avecMetier[0])
      : avecMetier[etat.aventuresTotal % avecMetier.length];
  const recits = RECITS[etat.contexte];
  const texte = recits[etat.aventuresTotal % recits.length]
    .replaceAll('{nom}', etat.compagnon?.nom ?? 'Ton compagnon')
    .replaceAll('{lieu}', lieu.nom)
    .replaceAll('{metier}', (lieu.metier ?? '').toLowerCase());
  return { lieuId: lieu.id, texte };
}
