/**
 * LE MODÈLE DE DONNÉES
 * Tout ce que l'app garde en mémoire sur le téléphone.
 * Le jour où on ajoute un serveur (compte en ligne), c'est cette forme qu'on synchronisera.
 */
import type { FormuleId } from '@/config/abonnement';
import type { EspeceId } from '@/config/compagnons';
import type { VilleId } from '@/config/villes';

export type TypeContrat = 'cdi' | 'cdd' | 'stage' | 'alternance' | 'freelance';

export type FournisseurAuth = 'apple' | 'google' | 'email';

export type Utilisateur = {
  id: string;
  fournisseur: FournisseurAuth;
  email?: string;
  prenom: string;
};

export type Tache = {
  id: string;
  titre: string;
  pieces: number;
  faite: boolean;
  /** Créée par l'utilisateur (sinon proposée par l'app). */
  perso: boolean;
  /** Modèle du catalogue d'où vient la tâche (src/config/taches.ts). */
  modeleId?: string;
  /** Candidature liée (ex. « Relancer Atelier Nuage »). */
  candidatureId?: string;
};

export type StatutCandidature = 'a-envoyer' | 'envoyee' | 'relancee' | 'entretien' | 'offre' | 'refus';

export type Candidature = {
  id: string;
  entreprise: string;
  poste: string;
  lien?: string;
  contact?: string;
  /** Date d'envoi au format AAAA-MM-JJ. */
  dateEnvoi?: string;
  statut: StatutCandidature;
  note?: string;
  creeLe: string;
};

export type Abonnement = {
  statut: 'gratuit' | 'essai' | 'actif';
  debutEssai?: string; // AAAA-MM-JJ
  formule?: FormuleId;
};

export type EtatApp = {
  version: 1;
  utilisateur?: Utilisateur;
  recherche: { objectif: 'emploi'; contrats: TypeContrat[] };
  compagnon?: { espece: EspeceId; nom: string; neLe: string };
  villeId?: VilleId;
  /** Heures de réveil et de coucher du compagnon (0 à 23). */
  rythme: { reveil: number; coucher: number };
  onboardingTermine: boolean;

  pieces: number;
  taches: Tache[];
  /** Jour (AAAA-MM-JJ) pour lequel les tâches ont été préparées. */
  jourTaches?: string;
  /** Modèles de tâches déjà réalisés au moins une fois. */
  modelesFaits: string[];

  candidatures: Candidature[];

  inventaire: string[]; // objets possédés
  equipe: string[]; // objets portés par le compagnon

  abonnement: Abonnement;
};
