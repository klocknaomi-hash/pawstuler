/**
 * LE MODÈLE DE DONNÉES
 * Tout ce que l'app garde en mémoire sur le téléphone.
 * Le jour où on ajoute un serveur (compte en ligne), c'est cette forme qu'on synchronisera.
 *
 * Le compte n'est jamais limité à une seule recherche :
 *   🔎 recherche → 🎉 J'ai décroché → 💼 vie professionnelle → 🔎 nouvelle recherche éventuelle.
 * Rien n'est supprimé automatiquement : les anciens postes et candidatures restent dans l'historique.
 */
import type { FormuleId } from '@/config/abonnement';
import type { Contexte } from '@/config/aventures';
import type { EspeceId, Pronoms } from '@/config/compagnons';
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
  /** Énergie réellement donnée au compagnon en cochant (reprise si on décoche). */
  energieDonnee?: number;
  /** Pièces réellement données en cochant (peuvent être réduites par le plafond du jour). */
  piecesDonnees?: number;
};

/** Où en est une candidature. On l'enregistre à l'étape où elle se trouve vraiment (aucun ordre imposé). */
export type StatutCandidature = 'envoyee' | 'relancee' | 'entretien' | 'decroche' | 'refus';

export type Candidature = {
  id: string;
  entreprise: string;
  poste: string;
  lien?: string;
  /** Adresse e-mail du recruteur ou de la personne avec qui on échange. */
  email?: string;
  /** Date d'envoi au format AAAA-MM-JJ. */
  dateEnvoi?: string;
  /** Date de l'entretien, si prévu. */
  dateEntretien?: string;
  statut: StatutCandidature;
  note?: string;
  creeLe: string;
  /** Historique des changements de statut. */
  historique: { statut: StatutCandidature; le: string }[];
  /** Rangée dans l'historique (jamais supprimée). */
  archivee: boolean;
  /** Recherche à laquelle appartient la candidature. */
  rechercheId: string;
};

export type ObjectifPro = {
  id: string;
  titre: string;
  atteint: boolean;
  creeLe: string;
  /** Jour où il a été atteint, et pièces réellement données (plafond du jour). */
  atteintLe?: string;
  piecesDonnees?: number;
};

/** Un poste décroché : le chapitre « Mon aventure professionnelle ». */
export type Emploi = {
  id: string;
  entreprise: string;
  poste: string;
  premierJour?: string; // AAAA-MM-JJ
  decrocheLe: string;
  objectifs: ObjectifPro[];
  /** Candidature d'origine, si le poste vient du suivi. */
  candidatureId?: string;
  /** Fin du chapitre (quand l'utilisateur recommence une recherche). */
  termineLe?: string;
};

/** Une période de recherche d'emploi. */
export type Recherche = { id: string; debut: string; fin?: string };

/** Une ligne du portefeuille de pièces. */
export type Mouvement = { id: string; le: string; libelle: string; montant: number };

export type Abonnement = {
  statut: 'gratuit' | 'essai' | 'actif';
  debutEssai?: string; // AAAA-MM-JJ
  formule?: FormuleId;
  /** L'essai gratuit a déjà été utilisé (il n'est proposé qu'une fois). */
  essaiUtilise?: boolean;
};

/**
 * La série de jours consécutifs 🐾 : un jour compte dès que l'app est ouverte.
 * Si elle s'arrête, elle recommence à 1 (rien n'est perdu, la meilleure série est gardée).
 */
export type Serie = {
  /** Objectif choisi (en jours consécutifs). */
  objectif: number;
  actuelle: number;
  meilleure: number;
  /** Dernier jour compté (AAAA-MM-JJ). */
  dernierJour?: string;
  /** Jour où l'objectif actuel a été atteint (pour le fêter une fois). */
  objectifAtteintLe?: string;
  /** Jour où une nouvelle série a commencé après une pause (message bienveillant). */
  repriseLe?: string;
};

export type Parametres = {
  notifications: boolean;
  rappelsRelance: boolean;
  rappelsTaches: boolean;
};

export type EtatApp = {
  version: 2;
  utilisateur?: Utilisateur;
  /** Session ouverte sur ce téléphone (les données restent même après déconnexion). */
  connecte: boolean;
  recherche: { objectif: 'emploi'; contrats: TypeContrat[] };
  compagnon?: {
    espece: EspeceId;
    nom: string;
    neLe: string;
    /** Pronoms choisis (facultatif). */
    pronoms?: Pronoms;
    /** Poste occupé par le compagnon dans sa ville (après « J'ai décroché ! »). */
    metier?: { lieuId: string; intitule: string; depuis: string };
  };
  villeId?: VilleId;
  /** Heures de réveil et de coucher du compagnon (0 à 23). */
  rythme: { reveil: number; coucher: number };
  onboardingTermine: boolean;
  serie: Serie;

  /** Où en est l'utilisateur : en recherche ou dans son nouveau poste. */
  contexte: Contexte;
  recherches: Recherche[];
  emplois: Emploi[];

  /* Tâches et récompenses */
  taches: Tache[];
  /** Jour (AAAA-MM-JJ) pour lequel les tâches ont été préparées. */
  jourTaches?: string;
  /** Modèles de tâches déjà réalisés au moins une fois. */
  modelesFaits: string[];
  pieces: number;
  /** Pièces gagnées aujourd'hui (plafonnées, voir PLAFOND_PIECES_JOUR). */
  piecesDuJour: number;
  mouvements: Mouvement[];

  /* Énergie et aventures */
  energie: number;
  aventuresDuJour: number;
  aventuresTotal: number;
  derniereAventure?: { le: string; texte: string; lieuId: string };
  /** Lieux découverts en aventure (section « Découverte » et souvenirs de la collection). */
  decouvertes: { villeId: VilleId; lieuId: string; le: string }[];

  candidatures: Candidature[];

  inventaire: string[]; // objets possédés
  equipe: string[]; // objets portés par le compagnon

  abonnement: Abonnement;
  parametres: Parametres;
};
