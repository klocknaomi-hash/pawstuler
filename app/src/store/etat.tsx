/**
 * L'ÉTAT DE L'APP
 * Un seul endroit qui garde les données, les modifie (actions) et les sauvegarde sur le téléphone.
 * Les écrans lisent l'état avec useApp() et le modifient avec dispatch({ type: ... }).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { JOURS_ESSAI, type FormuleId } from '@/config/abonnement';
import { CATALOGUE_BOUTIQUE } from '@/config/boutique';
import type { EspeceId } from '@/config/compagnons';
import { PIECES_TACHE_PERSO } from '@/config/taches';
import type { VilleId } from '@/config/villes';
import { jourDe, nouvelId } from '@/logique/dates';
import { preparerTaches } from '@/logique/tachesDuJour';

import type { Candidature, EtatApp, StatutCandidature, TypeContrat, Utilisateur } from './types';

const CLE_STOCKAGE = 'pawstuler/etat/v1';

export const ETAT_INITIAL: EtatApp = {
  version: 1,
  recherche: { objectif: 'emploi', contrats: [] },
  rythme: { reveil: 8, coucher: 22 },
  onboardingTermine: false,
  pieces: 0,
  taches: [],
  modelesFaits: [],
  candidatures: [],
  inventaire: [],
  equipe: [],
  abonnement: { statut: 'gratuit' },
};

export type Action =
  | { type: 'CHARGER'; etat: EtatApp }
  | { type: 'CONNECTER'; utilisateur: Omit<Utilisateur, 'prenom'> }
  | { type: 'DEFINIR_PRENOM'; prenom: string }
  | { type: 'DEFINIR_CONTRATS'; contrats: TypeContrat[] }
  | { type: 'CHOISIR_ESPECE'; espece: EspeceId; nomParDefaut: string }
  | { type: 'NOMMER_COMPAGNON'; nom: string }
  | { type: 'CHOISIR_VILLE'; villeId: VilleId }
  | { type: 'DEFINIR_RYTHME'; reveil: number; coucher: number }
  | { type: 'TERMINER_ONBOARDING' }
  | { type: 'PREPARER_JOUR'; jour: string }
  | { type: 'COCHER_TACHE'; id: string }
  | { type: 'DECOCHER_TACHE'; id: string }
  | { type: 'SUPPRIMER_TACHE'; id: string }
  | { type: 'AJOUTER_TACHE'; titre: string }
  | { type: 'AJOUTER_CANDIDATURE'; candidature: Omit<Candidature, 'id' | 'creeLe'> }
  | { type: 'CHANGER_STATUT'; id: string; statut: StatutCandidature }
  | { type: 'ACHETER'; objetId: string }
  | { type: 'EQUIPER'; objetId: string }
  | { type: 'DEMARRER_ESSAI'; formule: FormuleId }
  | { type: 'REINITIALISER' };

/** Coche automatiquement la première tâche du jour non faite qui correspond, et donne ses pièces. */
function validerTacheLiee(etat: EtatApp, correspond: (t: EtatApp['taches'][number]) => boolean): EtatApp {
  const t = etat.taches.find((x) => !x.faite && correspond(x));
  return t ? reducer(etat, { type: 'COCHER_TACHE', id: t.id }) : etat;
}

function reducer(etat: EtatApp, action: Action): EtatApp {
  switch (action.type) {
    case 'CHARGER':
      return { ...ETAT_INITIAL, ...action.etat };

    /* ----- Démarrage ----- */
    case 'CONNECTER':
      return { ...etat, utilisateur: { prenom: etat.utilisateur?.prenom ?? '', ...action.utilisateur } };
    case 'DEFINIR_PRENOM':
      return etat.utilisateur ? { ...etat, utilisateur: { ...etat.utilisateur, prenom: action.prenom } } : etat;
    case 'DEFINIR_CONTRATS':
      return { ...etat, recherche: { objectif: 'emploi', contrats: action.contrats } };
    case 'CHOISIR_ESPECE':
      return { ...etat, compagnon: { espece: action.espece, nom: action.nomParDefaut, neLe: jourDe() } };
    case 'NOMMER_COMPAGNON':
      return etat.compagnon ? { ...etat, compagnon: { ...etat.compagnon, nom: action.nom } } : etat;
    case 'CHOISIR_VILLE':
      return { ...etat, villeId: action.villeId };
    case 'DEFINIR_RYTHME':
      return { ...etat, rythme: { reveil: action.reveil, coucher: action.coucher } };
    case 'TERMINER_ONBOARDING': {
      // Cadeau de bienvenue : les objets « offerts » de la boutique
      const cadeaux = CATALOGUE_BOUTIQUE.filter((o) => o.offert).map((o) => o.id);
      const fini = { ...etat, onboardingTermine: true, inventaire: [...new Set([...etat.inventaire, ...cadeaux])] };
      return { ...fini, taches: preparerTaches(fini, jourDe()), jourTaches: jourDe() };
    }

    /* ----- Tâches et pièces ----- */
    case 'PREPARER_JOUR':
      if (!etat.onboardingTermine || etat.jourTaches === action.jour) return etat;
      return { ...etat, taches: preparerTaches(etat, action.jour), jourTaches: action.jour };
    case 'COCHER_TACHE': {
      const t = etat.taches.find((x) => x.id === action.id);
      if (!t || t.faite) return etat;
      return {
        ...etat,
        pieces: etat.pieces + t.pieces,
        taches: etat.taches.map((x) => (x.id === t.id ? { ...x, faite: true } : x)),
        modelesFaits: t.modeleId && !etat.modelesFaits.includes(t.modeleId) ? [...etat.modelesFaits, t.modeleId] : etat.modelesFaits,
      };
    }
    case 'DECOCHER_TACHE': {
      // On fait confiance à l'utilisateur : décocher reprend simplement les pièces gagnées.
      const t = etat.taches.find((x) => x.id === action.id);
      if (!t || !t.faite) return etat;
      return {
        ...etat,
        pieces: Math.max(0, etat.pieces - t.pieces),
        taches: etat.taches.map((x) => (x.id === t.id ? { ...x, faite: false } : x)),
      };
    }
    case 'SUPPRIMER_TACHE': {
      const t = etat.taches.find((x) => x.id === action.id);
      if (!t) return etat;
      return {
        ...etat,
        pieces: t.faite ? Math.max(0, etat.pieces - t.pieces) : etat.pieces,
        taches: etat.taches.filter((x) => x.id !== t.id),
      };
    }
    case 'AJOUTER_TACHE':
      return {
        ...etat,
        taches: [...etat.taches, { id: nouvelId(), titre: action.titre, pieces: PIECES_TACHE_PERSO, faite: false, perso: true }],
      };

    /* ----- Candidatures ----- */
    case 'AJOUTER_CANDIDATURE': {
      const avec = {
        ...etat,
        candidatures: [{ ...action.candidature, id: nouvelId(), creeLe: jourDe() }, ...etat.candidatures],
      };
      // Pas de double saisie : ajouter une candidature envoyée valide la tâche « Envoyer une candidature »
      return action.candidature.statut === 'envoyee' ? validerTacheLiee(avec, (t) => t.modeleId === 'envoi' || t.modeleId === 'spontanee') : avec;
    }
    case 'CHANGER_STATUT': {
      const avant = etat.candidatures.find((c) => c.id === action.id);
      if (!avant || avant.statut === action.statut) return etat;
      const apres = {
        ...etat,
        candidatures: etat.candidatures.map((c) =>
          c.id === action.id
            ? { ...c, statut: action.statut, dateEnvoi: action.statut === 'envoyee' && !c.dateEnvoi ? jourDe() : c.dateEnvoi }
            : c,
        ),
      };
      if (action.statut === 'envoyee') return validerTacheLiee(apres, (t) => t.modeleId === 'envoi' || t.modeleId === 'spontanee');
      if (action.statut === 'relancee')
        return validerTacheLiee(apres, (t) => t.candidatureId === action.id || (t.modeleId === 'relance' && !t.candidatureId));
      return apres;
    }

    /* ----- Boutique ----- */
    case 'ACHETER': {
      const objet = CATALOGUE_BOUTIQUE.find((o) => o.id === action.objetId);
      if (!objet || etat.inventaire.includes(objet.id) || etat.pieces < objet.prix) return etat;
      return { ...etat, pieces: etat.pieces - objet.prix, inventaire: [...etat.inventaire, objet.id] };
    }
    case 'EQUIPER':
      if (!etat.inventaire.includes(action.objetId)) return etat;
      return {
        ...etat,
        equipe: etat.equipe.includes(action.objetId)
          ? etat.equipe.filter((id) => id !== action.objetId)
          : [...etat.equipe, action.objetId],
      };

    /* ----- Ziggy+ ----- */
    case 'DEMARRER_ESSAI':
      // Le vrai achat App Store sera branché dans src/services/abonnement.ts
      return { ...etat, abonnement: { statut: 'essai', debutEssai: jourDe(), formule: action.formule } };

    case 'REINITIALISER':
      return ETAT_INITIAL;
  }
}

type ContexteApp = { etat: EtatApp; dispatch: (a: Action) => void; pret: boolean };
const Contexte = createContext<ContexteApp | null>(null);

export function FournisseurApp({ children }: { children: ReactNode }) {
  const [etat, dispatch] = useReducer(reducer, ETAT_INITIAL);
  const [pret, setPret] = useState(false);
  const premierChargement = useRef(true);

  // 1. Au lancement : relire les données sauvegardées
  useEffect(() => {
    AsyncStorage.getItem(CLE_STOCKAGE)
      .then((brut) => {
        if (brut) dispatch({ type: 'CHARGER', etat: JSON.parse(brut) as EtatApp });
      })
      .catch(() => {})
      .finally(() => {
        dispatch({ type: 'PREPARER_JOUR', jour: jourDe() });
        setPret(true);
      });
  }, []);

  // 2. À chaque changement : sauvegarder
  useEffect(() => {
    if (premierChargement.current) {
      premierChargement.current = false;
      return;
    }
    if (pret) AsyncStorage.setItem(CLE_STOCKAGE, JSON.stringify(etat)).catch(() => {});
  }, [etat, pret]);

  // 3. Quand on revient dans l'app un autre jour : nouvelles tâches du jour
  useEffect(() => {
    const abonnement = AppState.addEventListener('change', (statut) => {
      if (statut === 'active') dispatch({ type: 'PREPARER_JOUR', jour: jourDe() });
    });
    return () => abonnement.remove();
  }, []);

  return <Contexte.Provider value={{ etat, dispatch, pret }}>{children}</Contexte.Provider>;
}

export function useApp() {
  const ctx = useContext(Contexte);
  if (!ctx) throw new Error('useApp doit être utilisé dans <FournisseurApp>');
  return ctx;
}

/** Jours restants de l'essai Ziggy+ (null si pas d'essai en cours). */
export function joursRestantsEssai(etat: EtatApp): number | null {
  if (etat.abonnement.statut !== 'essai' || !etat.abonnement.debutEssai) return null;
  const debut = new Date(`${etat.abonnement.debutEssai}T00:00:00`);
  const passe = Math.round((new Date(`${jourDe()}T00:00:00`).getTime() - debut.getTime()) / 86_400_000);
  return Math.max(0, JOURS_ESSAI - passe);
}
