/**
 * CATALOGUE DES TÂCHES ET RÉCOMPENSES
 * Un seul fichier pour régler toutes les valeurs : titre, pièces gagnées, catégorie, contexte.
 * Le même moteur sert pendant la recherche d'emploi et après « J'ai décroché ! » :
 * seul le contexte change. Les tâches du jour sont composées par src/logique/tachesDuJour.ts.
 */
import type { Contexte } from '@/config/aventures';
import type { TypeContrat } from '@/store/types';

export type Categorie =
  | 'preparer'
  | 'chercher'
  | 'candidater'
  | 'relancer'
  | 'reseau'
  | 'entretien'
  | 'moral'
  | 'integration'
  | 'progression';

export type ModeleTache = {
  id: string;
  titre: string;
  categorie: Categorie;
  pieces: number;
  contexte: Contexte;
  /** Tâche proposée seulement pour certains contrats (ex. alternance). */
  contrats?: TypeContrat[];
  /** Tâche « de démarrage » : proposée en priorité tant qu'elle n'a jamais été faite. */
  demarrage?: boolean;
};

export const CATALOGUE_TACHES: ModeleTache[] = [
  /* ---------- Recherche d'emploi ---------- */
  { id: 'cv', titre: 'Mettre à jour ton CV', categorie: 'preparer', pieces: 10, contexte: 'recherche', demarrage: true },
  { id: 'criteres', titre: 'Définir tes critères de recherche', categorie: 'preparer', pieces: 5, contexte: 'recherche', demarrage: true },
  { id: 'linkedin', titre: 'Mettre à jour ton profil LinkedIn', categorie: 'preparer', pieces: 10, contexte: 'recherche', demarrage: true },
  { id: 'lettre', titre: 'Adapter ta lettre de motivation', categorie: 'preparer', pieces: 10, contexte: 'recherche' },
  { id: 'recherche', titre: "Faire 20 min de recherche d'offres", categorie: 'chercher', pieces: 5, contexte: 'recherche' },
  { id: 'offre', titre: 'Sauvegarder une offre intéressante', categorie: 'chercher', pieces: 2, contexte: 'recherche' },
  { id: 'cible', titre: 'Repérer une entreprise qui te plaît', categorie: 'chercher', pieces: 5, contexte: 'recherche' },
  { id: 'envoi', titre: 'Envoyer une candidature', categorie: 'candidater', pieces: 10, contexte: 'recherche' },
  { id: 'envoi5', titre: 'Envoyer 5 candidatures', categorie: 'candidater', pieces: 40, contexte: 'recherche' },
  { id: 'spontanee', titre: 'Envoyer une candidature spontanée', categorie: 'candidater', pieces: 15, contexte: 'recherche' },
  { id: 'relance', titre: 'Relancer une candidature', categorie: 'relancer', pieces: 10, contexte: 'recherche' },
  { id: 'contact', titre: 'Ajouter un contact', categorie: 'reseau', pieces: 5, contexte: 'recherche' },
  { id: 'recruteur', titre: 'Appeler un recruteur', categorie: 'reseau', pieces: 15, contexte: 'recherche' },
  { id: 'ancien', titre: 'Écrire à un ancien élève', categorie: 'reseau', pieces: 10, contexte: 'recherche' },
  { id: 'prepa', titre: 'Préparer ton entretien', categorie: 'entretien', pieces: 15, contexte: 'recherche' },
  { id: 'merci', titre: 'Envoyer un mail de remerciement', categorie: 'entretien', pieces: 5, contexte: 'recherche' },
  { id: 'pause', titre: 'Faire une vraie pause', categorie: 'moral', pieces: 3, contexte: 'recherche' },
  // Selon le contrat recherché
  { id: 'ecole', titre: 'Vérifier le rythme de ton école', categorie: 'preparer', pieces: 5, contexte: 'recherche', contrats: ['alternance'] },
  { id: 'sre', titre: 'Contacter le service relations entreprises', categorie: 'reseau', pieces: 10, contexte: 'recherche', contrats: ['alternance', 'stage'] },
  { id: 'portfolio', titre: 'Mettre à jour ton portfolio', categorie: 'preparer', pieces: 10, contexte: 'recherche', contrats: ['freelance'] },

  /* ---------- Nouvelle vie professionnelle ---------- */
  { id: 'premier-jour', titre: 'Préparer ton premier jour', categorie: 'integration', pieces: 10, contexte: 'pro', demarrage: true },
  { id: 'objectifs-mois', titre: 'Définir tes objectifs du premier mois', categorie: 'progression', pieces: 10, contexte: 'pro', demarrage: true },
  { id: 'environnement', titre: 'Découvrir ton nouvel environnement', categorie: 'integration', pieces: 5, contexte: 'pro' },
  { id: 'collegue', titre: 'Prendre un café avec un collègue', categorie: 'integration', pieces: 5, contexte: 'pro' },
  { id: 'presentation', titre: 'Préparer une présentation', categorie: 'progression', pieces: 15, contexte: 'pro' },
  { id: 'bilan-semaine', titre: 'Faire le bilan de ta première semaine', categorie: 'progression', pieces: 10, contexte: 'pro' },
  { id: 'competence', titre: 'Choisir une compétence à développer', categorie: 'progression', pieces: 10, contexte: 'pro' },
  { id: 'point', titre: 'Faire le point sur ta progression', categorie: 'progression', pieces: 10, contexte: 'pro' },
  { id: 'pause-pro', titre: 'Faire une vraie pause', categorie: 'moral', pieces: 3, contexte: 'pro' },
];

/**
 * Plafond de pièces gagnées par jour (tâches, aventures, objectifs), pour encourager
 * la régularité plutôt que le spam. Le bonus « J'ai décroché ! » n'est pas plafonné.
 */
export const PLAFOND_PIECES_JOUR = 50;

/** Pièces gagnées pour une tâche créée par l'utilisateur. */
export const PIECES_TACHE_PERSO = 5;

/** Pièces gagnées quand un objectif professionnel est atteint. */
export const PIECES_OBJECTIF = 15;

/** Nombre de tâches proposées chaque matin (hors tâches créées par l'utilisateur). */
export const NB_TACHES_DU_JOUR = 5;

/** Jours après l'envoi avant de proposer une relance. */
export const JOURS_AVANT_RELANCE = 7;

export const modeleParId = (id: string) => CATALOGUE_TACHES.find((m) => m.id === id);
