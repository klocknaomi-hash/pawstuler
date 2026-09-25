/** Les étapes d'une candidature, dans l'ordre, avec leur libellé et leurs couleurs. */
import type { StatutCandidature } from '@/store/types';

export const STATUTS: { id: StatutCandidature; libelle: string; fond: string; texte: string }[] = [
  { id: 'a-envoyer', libelle: 'À envoyer', fond: '#F3E8DD', texte: '#8A6B5E' },
  { id: 'envoyee', libelle: 'Envoyée', fond: '#E1F1F5', texte: '#2F6D80' },
  { id: 'relancee', libelle: 'Relancée', fond: '#FFF1CF', texte: '#8A5A00' },
  { id: 'entretien', libelle: 'Entretien', fond: '#FFE2E4', texte: '#C92F3D' },
  { id: 'offre', libelle: 'Offre reçue', fond: '#FF4F5E', texte: '#FFFFFF' },
  { id: 'refus', libelle: 'Refus', fond: '#EDE7F4', texte: '#6A5A86' },
];

export const statutParId = (id: StatutCandidature) => STATUTS.find((s) => s.id === id) ?? STATUTS[0];
