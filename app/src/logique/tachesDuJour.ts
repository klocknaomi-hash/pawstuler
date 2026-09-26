/**
 * PRÉPARATION DES TÂCHES DU JOUR
 * Chaque matin, l'app compose une petite liste adaptée au moment de vie de l'utilisateur.
 *
 * Pendant la recherche :
 *   1. les relances à faire (candidatures envoyées il y a 7 jours ou plus, sans réponse) ;
 *   2. les tâches de démarrage jamais faites (CV, critères…) ;
 *   3. une tâche liée au type de contrat recherché ;
 *   1 bis. ta situation réelle : préparer un entretien qui approche, remercier après un entretien ;
 *   4. un objectif de candidatures (1, 3 ou 5 selon ton rythme de la veille), puis des tâches variées.
 * Les tâches mesurables (candidatures, relances) avancent toutes seules avec tes vraies données
 * (3/5, puis ✓) : on ne peut pas les cocher à la main. Les autres se cochent quand tu les as faites.
 * Après « J'ai décroché ! » : même moteur, tâches de la nouvelle vie professionnelle.
 * Les tâches personnelles non terminées sont gardées d'un jour à l'autre.
 *
 * Plus tard, cette fonction pourra être remplacée par des suggestions de l'IA :
 * elle reçoit l'état et renvoie une liste de tâches, rien d'autre ne change.
 */
import { CATALOGUE_TACHES, JOURS_AVANT_RELANCE, NB_TACHES_DU_JOUR, modeleParId } from '@/config/taches';
import type { Candidature, EtatApp, Tache } from '@/store/types';

import { jourDe, joursEntre, nouvelId } from './dates';

/** Ordre de rotation des tâches « du quotidien », selon le contexte. */
const ROTATION = {
  recherche: ['recherche', 'contact', 'cible', 'lettre', 'recruteur', 'offre', 'spontanee', 'ancien', 'pause'],
  pro: ['environnement', 'collegue', 'competence', 'presentation', 'point', 'pause-pro'],
};

export function relanceDue(c: Candidature, jour: string): boolean {
  if (c.archivee || c.statut === 'refus' || c.statut === 'decroche') return false;
  // Relance choisie à l'ajout (+1, +3 ou +5 jours) : à faire ce jour-là, tant qu'elle n'est pas notée
  if (c.relancePrevue) {
    const faite = c.historique.some((h) => h.statut === 'relancee' && h.le >= c.relancePrevue!);
    return jour >= c.relancePrevue && !faite;
  }
  return c.statut === 'envoyee' && !!c.dateEnvoi && joursEntre(c.dateEnvoi, jour) >= JOURS_AVANT_RELANCE;
}

/** Jour où relancer une candidature (celui choisi à l'ajout, sinon 7 jours après l'envoi). */
export function jourDeRelance(c: Candidature): string | undefined {
  if (c.relancePrevue) return c.relancePrevue;
  if (!c.dateEnvoi) return undefined;
  const d = new Date(`${c.dateEnvoi}T00:00:00`);
  d.setDate(d.getDate() + JOURS_AVANT_RELANCE);
  return jourDe(d);
}

/** Candidatures de la recherche en cours (hors archives). */
export function candidaturesActives(etat: EtatApp): Candidature[] {
  const rechercheId = etat.recherches[etat.recherches.length - 1]?.id;
  return etat.candidatures.filter((c) => !c.archivee && c.rechercheId === rechercheId);
}

/** Poste occupé actuellement (chapitre « Mon aventure professionnelle »). */
export const emploiActuel = (etat: EtatApp) => etat.emplois.find((e) => !e.termineLe);

function depuisModele(id: string, extra: Partial<Tache> = {}): Tache | undefined {
  const m = modeleParId(id);
  if (!m) return undefined;
  return { id: nouvelId(), titre: m.titre, pieces: m.pieces, faite: false, perso: false, modeleId: m.id, ...(m.mesure ? { mesure: m.mesure, progres: 0 } : {}), ...extra };
}

/* ---------- Tâches mesurables : elles avancent avec tes vraies données ---------- */

/** Candidatures enregistrées ce jour-là (pour la recherche en cours). */
const candidaturesDuJour = (etat: EtatApp, jour: string) => candidaturesActives(etat).filter((c) => c.creeLe === jour).length;

/** Relances notées ce jour-là (une candidature passée en « Relancé »). */
const relancesDuJour = (etat: EtatApp, jour: string, candidatureId?: string) =>
  etat.candidatures
    .filter((c) => !candidatureId || c.id === candidatureId)
    .reduce((n, c) => n + c.historique.filter((h) => h.statut === 'relancee' && h.le === jour).length, 0);

/** Où en est une tâche mesurable aujourd'hui (0 à son objectif). */
export function progresDuJour(etat: EtatApp, t: Tache, jour: string): number {
  if (!t.mesure) return 0;
  const compte = t.mesure.quoi === 'candidatures' ? candidaturesDuJour(etat, jour) : relancesDuJour(etat, jour, t.candidatureId);
  return Math.min(compte, t.mesure.objectif);
}

/** Objectif de candidatures du jour, selon ton rythme récent (1, 3 ou 5). */
function objectifCandidatures(etat: EtatApp, jour: string): string {
  const hier = new Date(`${jour}T00:00:00`);
  hier.setDate(hier.getDate() - 1);
  const veille = candidaturesDuJour(etat, jourDe(hier));
  if (veille >= 5) return 'envoi5';
  if (veille >= 1) return 'envoi3';
  return 'envoi';
}

export function preparerTaches(etat: EtatApp, jour: string): Tache[] {
  const contexte = etat.contexte;
  const persoGardees = etat.taches.filter((t) => t.perso && !t.faite);
  const proposees: Tache[] = [];
  const ajouter = (t?: Tache) => {
    if (t && proposees.length < NB_TACHES_DU_JOUR && !proposees.some((p) => p.modeleId === t.modeleId && !t.candidatureId))
      proposees.push(t);
  };

  if (contexte === 'recherche') {
    // 1. Relances (2 au maximum par jour)
    candidaturesActives(etat)
      .filter((c) => relanceDue(c, jour))
      .slice(0, 2)
      .forEach((c) => ajouter(depuisModele('relance', { titre: `Relancer ${c.entreprise}`, candidatureId: c.id })));
    // 1 bis. Ta situation réelle : un entretien qui approche, un entretien tout juste passé
    for (const c of candidaturesActives(etat)) {
      if (!c.dateEntretien || c.statut !== 'entretien') continue;
      const ecart = joursEntre(jour, c.dateEntretien);
      if (ecart >= 0 && ecart <= 3) ajouter(depuisModele('prepa', { titre: `Préparer ton entretien chez ${c.entreprise}`, candidatureId: c.id }));
      if (ecart === -1) ajouter(depuisModele('merci', { titre: `Envoyer un mail de remerciement à ${c.entreprise}`, candidatureId: c.id }));
    }
  } else {
    // Bilan de la première semaine, une fois la semaine passée
    const emploi = emploiActuel(etat);
    if (emploi?.premierJour && joursEntre(emploi.premierJour, jour) >= 7 && !etat.modelesFaits.includes('bilan-semaine'))
      ajouter(depuisModele('bilan-semaine'));
  }

  // 2. Tâches de démarrage jamais faites (2 au maximum)
  CATALOGUE_TACHES.filter((m) => m.contexte === contexte && m.demarrage && !etat.modelesFaits.includes(m.id))
    .slice(0, 2)
    .forEach((m) => ajouter(depuisModele(m.id)));

  if (contexte === 'recherche') {
    // 3. Une tâche propre au contrat recherché
    const specifique = CATALOGUE_TACHES.find((m) => m.contrats?.some((c) => etat.recherche.contrats.includes(c)));
    if (specifique) ajouter(depuisModele(specifique.id));
    // 4. Toujours un objectif de candidatures, plus grand si tu as beaucoup postulé la veille
    ajouter(depuisModele(objectifCandidatures(etat, jour)));
  }

  // 5. De la variété, qui change d'un jour à l'autre
  const rotation = ROTATION[contexte];
  const decalage = joursEntre('2026-01-01', jour);
  for (let i = 0; proposees.length < NB_TACHES_DU_JOUR && i < rotation.length; i++) {
    ajouter(depuisModele(rotation[(decalage + i) % rotation.length]));
  }

  return [...proposees, ...persoGardees];
}
