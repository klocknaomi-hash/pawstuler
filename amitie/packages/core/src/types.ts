/**
 * Les types partagés entre l'app, l'admin et les fonctions serveur.
 * Ils reprennent exactement les types énumérés de la base
 * (supabase/migrations/20261020000100_schema.sql) : garder les deux alignés.
 */

export type Genre = 'femme' | 'homme' | 'non_binaire';
export type PreferenceBestie = 'femme' | 'homme' | 'peu_importe';
export type Role = 'user' | 'admin';
export type StatutCompte = 'actif' | 'suspendu' | 'exclu';

export type CodeActivite = 'cinema' | 'sortie' | 'resto' | 'voyage' | 'sport';
export type Moment = 'midi' | 'apres_midi' | 'soir';

export type StatutDemande = 'ouverte' | 'groupee' | 'annulee' | 'expiree';
/** Un groupe « permanent » est un cercle. */
export type StatutGroupe = 'en_formation' | 'confirme' | 'termine' | 'permanent' | 'dissous';
export type OrigineGroupe = 'matching' | 'admin';
export type StatutMembre = 'actif' | 'parti' | 'retire';

export type StatutSortie = 'proposee' | 'confirmee' | 'terminee' | 'annulee';
/** Sortie d'un cercle : réservée aux membres, ou ouverte à de nouvelles personnes. */
export type OuvertureSortie = 'cercle' | 'ouverte';
export type TypeParticipant = 'membre' | 'nouveau';

export type RevoirGroupe = 'oui' | 'non' | 'pas_sur';
export type StatutVote = 'en_cours' | 'accepte' | 'refuse';
export type StatutPropositionBestie = 'en_attente' | 'acceptee' | 'refusee' | 'expiree';

export type MotifSignalement =
  | 'harcelement'
  | 'comportement_deplace'
  | 'propos_haineux'
  | 'absence'
  | 'faux_profil'
  | 'autre';
export type TypeSanction = 'avertissement' | 'suspension' | 'exclusion';
