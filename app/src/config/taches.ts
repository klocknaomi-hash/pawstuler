/**
 * CATALOGUE DES TÂCHES ET RÉCOMPENSES (CLAUDE.md §6)
 * Un seul fichier pour régler toutes les valeurs : titre, pièces gagnées, catégorie.
 * Les tâches du jour sont choisies dans ce catalogue par src/logique/tachesDuJour.ts.
 */
import type { TypeContrat } from '@/store/types';

export type Categorie =
  | 'preparer'
  | 'chercher'
  | 'candidater'
  | 'relancer'
  | 'reseau'
  | 'entretien'
  | 'moral';

export type ModeleTache = {
  id: string;
  titre: string;
  categorie: Categorie;
  pieces: number;
  /** Tâche proposée seulement pour certains contrats (ex. alternance). */
  contrats?: TypeContrat[];
  /** Tâche « de démarrage » : proposée tant qu'elle n'a jamais été faite. */
  demarrage?: boolean;
};

export const LIBELLES_CATEGORIES: Record<Categorie, string> = {
  preparer: 'Se préparer',
  chercher: 'Chercher',
  candidater: 'Candidater',
  relancer: 'Relancer',
  reseau: 'Réseau',
  entretien: 'Entretien',
  moral: 'Moral',
};

export const CATALOGUE_TACHES: ModeleTache[] = [
  // Se préparer
  { id: 'cv', titre: 'Mettre à jour ton CV', categorie: 'preparer', pieces: 10, demarrage: true },
  { id: 'criteres', titre: 'Définir tes critères de recherche', categorie: 'preparer', pieces: 5, demarrage: true },
  { id: 'linkedin', titre: 'Mettre à jour ton profil LinkedIn', categorie: 'preparer', pieces: 10, demarrage: true },
  { id: 'lettre', titre: 'Adapter ta lettre de motivation', categorie: 'preparer', pieces: 10 },

  // Chercher
  { id: 'recherche', titre: "Faire 20 min de recherche d'offres", categorie: 'chercher', pieces: 5 },
  { id: 'offre', titre: 'Sauvegarder une offre intéressante', categorie: 'chercher', pieces: 2 },
  { id: 'cible', titre: 'Repérer une entreprise qui te plaît', categorie: 'chercher', pieces: 5 },

  // Candidater
  { id: 'envoi', titre: 'Envoyer une candidature', categorie: 'candidater', pieces: 10 },
  { id: 'envoi5', titre: 'Envoyer 5 candidatures', categorie: 'candidater', pieces: 40 },
  { id: 'spontanee', titre: 'Envoyer une candidature spontanée', categorie: 'candidater', pieces: 15 },

  // Relancer
  { id: 'relance', titre: 'Relancer une candidature', categorie: 'relancer', pieces: 10 },

  // Réseau
  { id: 'contact', titre: 'Ajouter un contact', categorie: 'reseau', pieces: 5 },
  { id: 'recruteur', titre: 'Appeler un recruteur', categorie: 'reseau', pieces: 15 },
  { id: 'ancien', titre: 'Écrire à un ancien élève', categorie: 'reseau', pieces: 10 },

  // Entretien
  { id: 'prepa', titre: 'Préparer ton entretien', categorie: 'entretien', pieces: 15 },
  { id: 'merci', titre: 'Envoyer un mail de remerciement', categorie: 'entretien', pieces: 5 },

  // Moral
  { id: 'pause', titre: 'Faire une vraie pause', categorie: 'moral', pieces: 3 },

  // Spécifiques à un contrat
  { id: 'ecole', titre: "Vérifier le rythme de ton école", categorie: 'preparer', pieces: 5, contrats: ['alternance'] },
  { id: 'sre', titre: "Contacter le service relations entreprises", categorie: 'reseau', pieces: 10, contrats: ['alternance', 'stage'] },
  { id: 'portfolio', titre: 'Mettre à jour ton portfolio', categorie: 'preparer', pieces: 10, contrats: ['freelance'] },
];

/** Pièces gagnées pour une tâche créée par l'utilisateur. */
export const PIECES_TACHE_PERSO = 5;

/** Nombre de tâches proposées chaque matin (hors tâches créées par l'utilisateur). */
export const NB_TACHES_DU_JOUR = 5;

/** Jours après l'envoi avant de proposer une relance. */
export const JOURS_AVANT_RELANCE = 7;

export const modeleParId = (id: string) => CATALOGUE_TACHES.find((m) => m.id === id);
