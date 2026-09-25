/**
 * PRÉPARATION DES TÂCHES DU JOUR
 * Chaque matin, l'app compose une petite liste de tâches adaptée à la recherche :
 *   1. les relances à faire (candidatures envoyées il y a 7 jours ou plus, sans réponse) ;
 *   2. les tâches de démarrage jamais faites (CV, critères…) ;
 *   3. une tâche liée au type de contrat recherché ;
 *   4. des tâches variées du catalogue, qui changent d'un jour à l'autre.
 * Les tâches personnelles non terminées sont gardées d'un jour à l'autre.
 *
 * Plus tard, cette fonction pourra être remplacée par des suggestions générées par l'IA :
 * elle reçoit l'état et renvoie une liste de tâches, rien d'autre ne change.
 */
import { CATALOGUE_TACHES, JOURS_AVANT_RELANCE, NB_TACHES_DU_JOUR, modeleParId } from '@/config/taches';
import type { Candidature, EtatApp, Tache } from '@/store/types';

import { joursEntre, nouvelId } from './dates';

/** Ordre de rotation des tâches « du quotidien ». */
const ROTATION = ['recherche', 'contact', 'cible', 'lettre', 'recruteur', 'offre', 'spontanee', 'ancien', 'envoi5', 'pause'];

export function relanceDue(c: Candidature, jour: string): boolean {
  return c.statut === 'envoyee' && !!c.dateEnvoi && joursEntre(c.dateEnvoi, jour) >= JOURS_AVANT_RELANCE;
}

function depuisModele(id: string, extra: Partial<Tache> = {}): Tache | undefined {
  const m = modeleParId(id);
  if (!m) return undefined;
  return { id: nouvelId(), titre: m.titre, pieces: m.pieces, faite: false, perso: false, modeleId: m.id, ...extra };
}

export function preparerTaches(etat: EtatApp, jour: string): Tache[] {
  const persoGardees = etat.taches.filter((t) => t.perso && !t.faite);
  const proposees: Tache[] = [];
  const ajouter = (t?: Tache) => {
    if (t && proposees.length < NB_TACHES_DU_JOUR) proposees.push(t);
  };

  // 1. Relances (2 au maximum par jour)
  etat.candidatures
    .filter((c) => relanceDue(c, jour))
    .slice(0, 2)
    .forEach((c) =>
      ajouter(
        depuisModele('relance', {
          titre: `Relancer ${c.entreprise}`,
          candidatureId: c.id,
        }),
      ),
    );

  // 2. Tâches de démarrage jamais faites (2 au maximum)
  CATALOGUE_TACHES.filter((m) => m.demarrage && !etat.modelesFaits.includes(m.id))
    .slice(0, 2)
    .forEach((m) => ajouter(depuisModele(m.id)));

  // 3. Une tâche propre au contrat recherché
  const specifique = CATALOGUE_TACHES.find((m) => m.contrats?.some((c) => etat.recherche.contrats.includes(c)));
  if (specifique) ajouter(depuisModele(specifique.id));

  // 4. Toujours au moins une candidature, puis de la variété
  ajouter(depuisModele('envoi'));
  const decalage = joursEntre('2026-01-01', jour);
  for (let i = 0; proposees.length < NB_TACHES_DU_JOUR && i < ROTATION.length; i++) {
    const id = ROTATION[(decalage + i) % ROTATION.length];
    if (!proposees.some((t) => t.modeleId === id)) ajouter(depuisModele(id));
  }

  return [...proposees, ...persoGardees];
}
