/**
 * LES STATUTS D'UNE CANDIDATURE
 * Envoyé → Relancé → Entretien → Décroché, ou Refus, sans ordre imposé.
 * `evenement` est la phrase écrite dans l'historique quand la candidature passe à ce statut.
 */
import type { StatutCandidature } from '@/store/types';

export type Statut = { id: StatutCandidature; libelle: string; evenement: string; fond: string; texte: string };

export const STATUTS: Statut[] = [
  { id: 'envoyee', libelle: 'Envoyé', evenement: 'Candidature envoyée', fond: '#E1F1F5', texte: '#2F6D80' },
  { id: 'relancee', libelle: 'Relancé', evenement: 'Candidature relancée', fond: '#FFF1CF', texte: '#8A5A00' },
  { id: 'entretien', libelle: 'Entretien', evenement: 'Entretien obtenu', fond: '#FFE2E4', texte: '#C92F3D' },
  { id: 'decroche', libelle: 'Décroché', evenement: 'Poste décroché', fond: '#FF4F5E', texte: '#FFFFFF' },
  { id: 'refus', libelle: 'Refus', evenement: 'Réponse négative', fond: '#EDE7F4', texte: '#6A5A86' },
];

export const statutParId = (id: StatutCandidature) => STATUTS.find((s) => s.id === id) ?? STATUTS[0];

/** Vérification simple d'une adresse e-mail. */
export const emailValide = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
