/**
 * PRÉPARATION DES TÂCHES DU JOUR
 * Chaque matin, l'app compose une petite liste adaptée au moment de vie de l'utilisateur.
 *
 * Pendant la recherche :
 *   1. les relances à faire (candidatures envoyées il y a 7 jours ou plus, sans réponse) ;
 *   2. les tâches de démarrage jamais faites (CV, critères…) ;
 *   3. une tâche liée au type de contrat recherché ;
 *   4. au moins une candidature, puis des tâches variées qui changent chaque jour.
 * Après « J'ai décroché ! » : même moteur, tâches de la nouvelle vie professionnelle.
 * Les tâches personnelles non terminées sont gardées d'un jour à l'autre.
 *
 * Plus tard, cette fonction pourra être remplacée par des suggestions de l'IA :
 * elle reçoit l'état et renvoie une liste de tâches, rien d'autre ne change.
 */
import { CATALOGUE_TACHES, JOURS_AVANT_RELANCE, NB_TACHES_DU_JOUR, modeleParId } from '@/config/taches';
import type { Candidature, EtatApp, Tache } from '@/store/types';

import { joursEntre, nouvelId } from './dates';

/** Ordre de rotation des tâches « du quotidien », selon le contexte. */
const ROTATION = {
  recherche: ['recherche', 'contact', 'cible', 'lettre', 'recruteur', 'offre', 'spontanee', 'ancien', 'envoi5', 'pause'],
  pro: ['environnement', 'collegue', 'competence', 'presentation', 'point', 'pause-pro'],
};

export function relanceDue(c: Candidature, jour: string): boolean {
  return !c.archivee && c.statut === 'envoyee' && !!c.dateEnvoi && joursEntre(c.dateEnvoi, jour) >= JOURS_AVANT_RELANCE;
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
  return { id: nouvelId(), titre: m.titre, pieces: m.pieces, faite: false, perso: false, modeleId: m.id, ...extra };
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
    // 4. Toujours au moins une candidature
    ajouter(depuisModele('envoi'));
  }

  // 5. De la variété, qui change d'un jour à l'autre
  const rotation = ROTATION[contexte];
  const decalage = joursEntre('2026-01-01', jour);
  for (let i = 0; proposees.length < NB_TACHES_DU_JOUR && i < rotation.length; i++) {
    ajouter(depuisModele(rotation[(decalage + i) % rotation.length]));
  }

  return [...proposees, ...persoGardees];
}
