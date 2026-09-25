/**
 * L'ÉTAT DE L'APP
 * Un seul endroit qui garde les données, les modifie (actions) et les sauvegarde sur le téléphone.
 * Les écrans lisent l'état avec useApp() et le modifient avec dispatch({ type: ... }).
 * Comme il n'y a qu'un seul état, le solde de pièces est le même partout (accueil, Shop, Compte…).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import type { FormuleId } from '@/config/abonnement';
import { CATALOGUE_BOUTIQUE } from '@/config/boutique';
import { especeValide, type EspeceId } from '@/config/compagnons';
import { COUT, ENERGIE_MAX, ENERGIE_PAR_TACHE, PIECES_AVENTURE } from '@/config/energie';
import { PIECES_OBJECTIF, PIECES_TACHE_PERSO, PLAFOND_PIECES_JOUR } from '@/config/taches';
import { VILLES, type VilleId } from '@/config/villes';
import { aventuresRestantes, composerAventure, lieuEmbauche } from '@/logique/compagnon';
import { jourDe, nouvelId } from '@/logique/dates';
import { candidaturesActives, emploiActuel, preparerTaches } from '@/logique/tachesDuJour';

import type { Candidature, EtatApp, Parametres, StatutCandidature, TypeContrat, Utilisateur } from './types';

const CLE_STOCKAGE = 'pawstuler/etat/v1';

/** Bonus de pièces pour fêter un poste décroché. */
const PIECES_DECROCHE = 50;

export const ETAT_INITIAL: EtatApp = {
  version: 2,
  connecte: false,
  recherche: { objectif: 'emploi', contrats: [] },
  rythme: { reveil: 8, coucher: 22 },
  onboardingTermine: false,
  contexte: 'recherche',
  recherches: [],
  emplois: [],
  taches: [],
  modelesFaits: [],
  pieces: 0,
  piecesDuJour: 0,
  mouvements: [],
  energie: ENERGIE_MAX,
  aventuresDuJour: 0,
  aventuresTotal: 0,
  candidatures: [],
  inventaire: [],
  equipe: [],
  abonnement: { statut: 'gratuit' },
  parametres: { notifications: true, rappelsRelance: true, rappelsTaches: true },
};

export type NouvelleCandidature = Pick<Candidature, 'entreprise' | 'poste' | 'lien' | 'contact' | 'note' | 'statut' | 'dateEnvoi'>;

export type Action =
  | { type: 'CHARGER'; etat: Partial<EtatApp> & { version?: number } }
  /* Compte */
  | { type: 'CONNECTER'; utilisateur: Omit<Utilisateur, 'prenom'> }
  | { type: 'DECONNECTER' }
  | { type: 'SUPPRIMER_COMPTE' }
  | { type: 'MODIFIER_PARAMETRES'; parametres: Partial<Parametres> }
  /* Onboarding et profil */
  | { type: 'DEFINIR_PRENOM'; prenom: string }
  | { type: 'DEFINIR_CONTRATS'; contrats: TypeContrat[] }
  | { type: 'CHOISIR_ESPECE'; espece: EspeceId; nomParDefaut: string }
  | { type: 'NOMMER_COMPAGNON'; nom: string }
  | { type: 'CHOISIR_VILLE'; villeId: VilleId }
  | { type: 'DEFINIR_RYTHME'; reveil: number; coucher: number }
  | { type: 'TERMINER_ONBOARDING' }
  /* Tâches, pièces, énergie */
  | { type: 'PREPARER_JOUR'; jour: string }
  | { type: 'COCHER_TACHE'; id: string }
  | { type: 'DECOCHER_TACHE'; id: string }
  | { type: 'SUPPRIMER_TACHE'; id: string }
  | { type: 'AJOUTER_TACHE'; titre: string }
  | { type: 'INTERAGIR'; moment: 'calin' | 'jeu' }
  | { type: 'PARTIR_EN_AVENTURE' }
  /* Candidatures */
  | { type: 'AJOUTER_CANDIDATURE'; candidature: NouvelleCandidature }
  | { type: 'MODIFIER_CANDIDATURE'; id: string; modifs: Partial<NouvelleCandidature & { dateEntretien: string }> }
  | { type: 'CHANGER_STATUT'; id: string; statut: StatutCandidature }
  | { type: 'ARCHIVER_CANDIDATURE'; id: string; archivee: boolean }
  /* Shop */
  | { type: 'ACHETER'; objetId: string }
  | { type: 'EQUIPER'; objetId: string }
  /* Parcours professionnel */
  | {
      type: 'DECROCHER';
      emploi: { entreprise: string; poste: string; premierJour?: string; candidatureId?: string };
      archiverCandidatures: boolean;
    }
  | { type: 'MODIFIER_EMPLOI'; modifs: { entreprise?: string; poste?: string; premierJour?: string } }
  | { type: 'AJOUTER_OBJECTIF'; titre: string }
  | { type: 'BASCULER_OBJECTIF'; id: string }
  | { type: 'SUPPRIMER_OBJECTIF'; id: string }
  | { type: 'NOUVELLE_RECHERCHE' }
  /* Ziggy+ */
  | { type: 'DEMARRER_ESSAI'; formule: FormuleId };

/* ---------- Petits outils ---------- */

/** Ajoute (ou retire, si montant négatif) des pièces et garde une ligne dans le portefeuille. */
function crediter(etat: EtatApp, montant: number, libelle: string): EtatApp {
  if (montant === 0) return etat;
  const reel = montant < 0 ? -Math.min(etat.pieces, -montant) : montant;
  const mouvement = { id: nouvelId(), le: jourDe(), libelle, montant: reel };
  return { ...etat, pieces: etat.pieces + reel, mouvements: [mouvement, ...etat.mouvements].slice(0, 200) };
}

/** Pièces encore gagnables aujourd'hui, dans la limite du plafond. */
export const gainPlafonne = (etat: EtatApp, montant: number) =>
  Math.max(0, Math.min(montant, PLAFOND_PIECES_JOUR - etat.piecesDuJour));

/** Gain soumis au plafond du jour (ou reprise d'un tel gain si montant négatif). */
function crediterDuJour(etat: EtatApp, montant: number, libelle: string): EtatApp {
  const credite = crediter(etat, montant, libelle);
  return { ...credite, piecesDuJour: Math.max(0, etat.piecesDuJour + (credite.pieces - etat.pieces)) };
}

const bornerEnergie = (n: number) => Math.max(0, Math.min(ENERGIE_MAX, n));

/** Coche automatiquement la première tâche du jour non faite qui correspond. */
function validerTacheLiee(etat: EtatApp, correspond: (t: EtatApp['taches'][number]) => boolean): EtatApp {
  const t = etat.taches.find((x) => !x.faite && correspond(x));
  return t ? reducer(etat, { type: 'COCHER_TACHE', id: t.id }) : etat;
}

const nouvelleRecherche = () => ({ id: nouvelId(), debut: jourDe() });

/** Met à jour les anciennes sauvegardes (version 1) vers le modèle actuel. */
function migrer(brut: Partial<EtatApp> & { version?: number }): EtatApp {
  const etat = { ...ETAT_INITIAL, ...brut, version: 2 } as EtatApp;
  if (etat.compagnon && !especeValide(etat.compagnon.espece)) etat.compagnon = { ...etat.compagnon, espece: 'renard' };
  if (etat.villeId && !VILLES.some((v) => v.id === etat.villeId)) etat.villeId = 'clairebourg';
  if (etat.onboardingTermine && etat.recherches.length === 0) etat.recherches = [nouvelleRecherche()];
  const rechercheId = etat.recherches[0]?.id ?? '';
  etat.candidatures = etat.candidatures.map((c) => ({
    ...c,
    historique: c.historique ?? [{ statut: c.statut, le: c.dateEnvoi ?? c.creeLe }],
    archivee: c.archivee ?? false,
    rechercheId: c.rechercheId ?? rechercheId,
  }));
  if (brut.version !== 2 && brut.utilisateur) etat.connecte = true;
  return etat;
}

/* ---------- Le réducteur : toutes les modifications possibles ---------- */

function reducer(etat: EtatApp, action: Action): EtatApp {
  switch (action.type) {
    case 'CHARGER':
      return migrer(action.etat);

    /* ----- Compte ----- */
    case 'CONNECTER':
      return { ...etat, connecte: true, utilisateur: { prenom: etat.utilisateur?.prenom ?? '', ...action.utilisateur } };
    case 'DECONNECTER':
      // Les données restent sur le téléphone : on les retrouve en se reconnectant.
      return { ...etat, connecte: false };
    case 'SUPPRIMER_COMPTE':
      return ETAT_INITIAL;
    case 'MODIFIER_PARAMETRES':
      return { ...etat, parametres: { ...etat.parametres, ...action.parametres } };

    /* ----- Onboarding et profil ----- */
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
      // Cadeau de bienvenue : les objets « offerts » du Shop
      const cadeaux = CATALOGUE_BOUTIQUE.filter((o) => o.offert).map((o) => o.id);
      const fini: EtatApp = {
        ...etat,
        onboardingTermine: true,
        contexte: 'recherche',
        recherches: etat.recherches.length ? etat.recherches : [nouvelleRecherche()],
        energie: ENERGIE_MAX,
        inventaire: [...new Set([...etat.inventaire, ...cadeaux])],
      };
      return { ...fini, taches: preparerTaches(fini, jourDe()), jourTaches: jourDe() };
    }

    /* ----- Tâches, pièces et énergie ----- */
    case 'PREPARER_JOUR': {
      if (!etat.onboardingTermine || etat.jourTaches === action.jour) return etat;
      // Nouveau jour : tâches renouvelées, énergie rechargée, nouvelle aventure possible
      return {
        ...etat,
        taches: preparerTaches(etat, action.jour),
        jourTaches: action.jour,
        energie: ENERGIE_MAX,
        aventuresDuJour: 0,
        piecesDuJour: 0,
      };
    }
    case 'COCHER_TACHE': {
      const t = etat.taches.find((x) => x.id === action.id);
      if (!t || t.faite) return etat;
      const energieDonnee = Math.min(ENERGIE_PAR_TACHE, ENERGIE_MAX - etat.energie);
      const gain = gainPlafonne(etat, t.pieces);
      const coche: EtatApp = {
        ...etat,
        energie: etat.energie + energieDonnee,
        taches: etat.taches.map((x) => (x.id === t.id ? { ...x, faite: true, energieDonnee, piecesDonnees: gain } : x)),
        modelesFaits: t.modeleId && !etat.modelesFaits.includes(t.modeleId) ? [...etat.modelesFaits, t.modeleId] : etat.modelesFaits,
      };
      return crediterDuJour(coche, gain, gain < t.pieces ? `${t.titre} (plafond du jour)` : t.titre);
    }
    case 'DECOCHER_TACHE': {
      // On fait confiance à l'utilisateur : décocher reprend simplement la récompense.
      const t = etat.taches.find((x) => x.id === action.id);
      if (!t || !t.faite) return etat;
      const decoche: EtatApp = {
        ...etat,
        energie: bornerEnergie(etat.energie - (t.energieDonnee ?? 0)),
        taches: etat.taches.map((x) => (x.id === t.id ? { ...x, faite: false, energieDonnee: 0, piecesDonnees: 0 } : x)),
      };
      return crediterDuJour(decoche, -(t.piecesDonnees ?? t.pieces), `Tâche décochée : ${t.titre}`);
    }
    case 'SUPPRIMER_TACHE': {
      const t = etat.taches.find((x) => x.id === action.id);
      if (!t) return etat;
      const sans = reducer(etat, { type: 'DECOCHER_TACHE', id: t.id });
      return { ...sans, taches: sans.taches.filter((x) => x.id !== t.id) };
    }
    case 'AJOUTER_TACHE':
      return {
        ...etat,
        taches: [...etat.taches, { id: nouvelId(), titre: action.titre, pieces: PIECES_TACHE_PERSO, faite: false, perso: true }],
      };
    case 'INTERAGIR': {
      const cout = COUT[action.moment];
      if (etat.energie < cout) return etat;
      return { ...etat, energie: etat.energie - cout };
    }
    case 'PARTIR_EN_AVENTURE': {
      if (etat.energie < COUT.aventure || aventuresRestantes(etat) === 0) return etat;
      const { lieuId, texte } = composerAventure(etat);
      const parti: EtatApp = {
        ...etat,
        energie: etat.energie - COUT.aventure,
        aventuresDuJour: etat.aventuresDuJour + 1,
        aventuresTotal: etat.aventuresTotal + 1,
        derniereAventure: { le: jourDe(), texte, lieuId },
      };
      return crediterDuJour(parti, gainPlafonne(etat, PIECES_AVENTURE), 'Aventure du jour');
    }

    /* ----- Candidatures ----- */
    case 'AJOUTER_CANDIDATURE': {
      const rechercheId = etat.recherches[etat.recherches.length - 1]?.id ?? '';
      const c: Candidature = {
        ...action.candidature,
        id: nouvelId(),
        creeLe: jourDe(),
        historique: [{ statut: action.candidature.statut, le: jourDe() }],
        archivee: false,
        rechercheId,
      };
      const avec = { ...etat, candidatures: [c, ...etat.candidatures] };
      // Pas de double saisie : une candidature envoyée valide la tâche « Envoyer une candidature »
      return c.statut === 'envoyee' ? validerTacheLiee(avec, (t) => t.modeleId === 'envoi' || t.modeleId === 'spontanee') : avec;
    }
    case 'MODIFIER_CANDIDATURE':
      return {
        ...etat,
        candidatures: etat.candidatures.map((c) => (c.id === action.id ? { ...c, ...action.modifs } : c)),
      };
    case 'CHANGER_STATUT': {
      const avant = etat.candidatures.find((c) => c.id === action.id);
      if (!avant || avant.statut === action.statut) return etat;
      const apres: EtatApp = {
        ...etat,
        candidatures: etat.candidatures.map((c) =>
          c.id === action.id
            ? {
                ...c,
                statut: action.statut,
                dateEnvoi: action.statut === 'envoyee' && !c.dateEnvoi ? jourDe() : c.dateEnvoi,
                historique: [...c.historique, { statut: action.statut, le: jourDe() }],
              }
            : c,
        ),
      };
      if (action.statut === 'envoyee') return validerTacheLiee(apres, (t) => t.modeleId === 'envoi' || t.modeleId === 'spontanee');
      if (action.statut === 'relancee')
        return validerTacheLiee(apres, (t) => t.candidatureId === action.id || (t.modeleId === 'relance' && !t.candidatureId));
      return apres;
    }
    case 'ARCHIVER_CANDIDATURE':
      return {
        ...etat,
        candidatures: etat.candidatures.map((c) => (c.id === action.id ? { ...c, archivee: action.archivee } : c)),
      };

    /* ----- Shop : le portefeuille est réellement débité ----- */
    case 'ACHETER': {
      const objet = CATALOGUE_BOUTIQUE.find((o) => o.id === action.objetId);
      if (!objet || etat.inventaire.includes(objet.id) || etat.pieces < objet.prix) return etat;
      const achete = { ...etat, inventaire: [...etat.inventaire, objet.id], equipe: [...etat.equipe, objet.id] };
      return crediter(achete, -objet.prix, `Achat : ${objet.nom}`);
    }
    case 'EQUIPER':
      if (!etat.inventaire.includes(action.objetId)) return etat;
      return {
        ...etat,
        equipe: etat.equipe.includes(action.objetId)
          ? etat.equipe.filter((id) => id !== action.objetId)
          : [...etat.equipe, action.objetId],
      };

    /* ----- Parcours professionnel ----- */
    case 'DECROCHER': {
      const aujourdhui = jourDe();
      const lieu = lieuEmbauche(etat);
      const idsActifs = new Set(candidaturesActives(etat).map((c) => c.id));
      const nouveau: EtatApp = {
        ...etat,
        contexte: 'pro',
        emplois: [
          ...etat.emplois,
          { id: nouvelId(), ...action.emploi, decrocheLe: aujourdhui, objectifs: [] },
        ],
        recherches: etat.recherches.map((r, i) => (i === etat.recherches.length - 1 ? { ...r, fin: aujourdhui } : r)),
        // Rien n'est supprimé : les candidatures restent, archivées seulement si l'utilisateur l'a choisi
        candidatures: etat.candidatures.map((c) => {
          const statut: StatutCandidature = c.id === action.emploi.candidatureId && c.statut !== 'offre' ? 'offre' : c.statut;
          return {
            ...c,
            statut,
            historique: statut !== c.statut ? [...c.historique, { statut, le: aujourdhui }] : c.historique,
            archivee: action.archiverCandidatures && idsActifs.has(c.id) ? true : c.archivee,
          };
        }),
        // Le compagnon décroche lui aussi un poste dans sa ville
        compagnon: etat.compagnon && lieu
          ? { ...etat.compagnon, metier: { lieuId: lieu.id, intitule: lieu.metier ?? 'Nouveau poste', depuis: aujourdhui } }
          : etat.compagnon,
      };
      const avecTaches = { ...nouveau, taches: preparerTaches(nouveau, aujourdhui), jourTaches: aujourdhui };
      return crediter(avecTaches, PIECES_DECROCHE, `J'ai décroché ! ${action.emploi.poste}`);
    }
    case 'MODIFIER_EMPLOI': {
      const e = emploiActuel(etat);
      if (!e) return etat;
      return { ...etat, emplois: etat.emplois.map((x) => (x.id === e.id ? { ...x, ...action.modifs } : x)) };
    }
    case 'AJOUTER_OBJECTIF': {
      const e = emploiActuel(etat);
      if (!e) return etat;
      const objectif = { id: nouvelId(), titre: action.titre, atteint: false, creeLe: jourDe() };
      return { ...etat, emplois: etat.emplois.map((x) => (x.id === e.id ? { ...x, objectifs: [...x.objectifs, objectif] } : x)) };
    }
    case 'BASCULER_OBJECTIF': {
      const e = emploiActuel(etat);
      const o = e?.objectifs.find((x) => x.id === action.id);
      if (!e || !o) return etat;
      const aujourdhui = jourDe();
      const gain = o.atteint ? 0 : gainPlafonne(etat, PIECES_OBJECTIF);
      const modifie = {
        ...etat,
        emplois: etat.emplois.map((x) =>
          x.id === e.id
            ? {
                ...x,
                objectifs: x.objectifs.map((y) =>
                  y.id === o.id ? { ...y, atteint: !y.atteint, atteintLe: o.atteint ? undefined : aujourdhui, piecesDonnees: gain } : y,
                ),
              }
            : x,
        ),
      };
      if (!o.atteint) return crediterDuJour(modifie, gain, `Objectif : ${o.titre}`);
      // Reprise : ne compte dans le plafond du jour que si l'objectif avait été atteint aujourd'hui
      const reprise = o.piecesDonnees ?? PIECES_OBJECTIF;
      return o.atteintLe === aujourdhui
        ? crediterDuJour(modifie, -reprise, `Objectif décoché : ${o.titre}`)
        : crediter(modifie, -reprise, `Objectif décoché : ${o.titre}`);
    }
    case 'SUPPRIMER_OBJECTIF': {
      const e = emploiActuel(etat);
      const o = e?.objectifs.find((x) => x.id === action.id);
      if (!e || !o) return etat;
      const sans = o.atteint ? reducer(etat, { type: 'BASCULER_OBJECTIF', id: o.id }) : etat;
      return {
        ...sans,
        emplois: sans.emplois.map((x) => (x.id === e.id ? { ...x, objectifs: x.objectifs.filter((y) => y.id !== o.id) } : x)),
      };
    }
    case 'NOUVELLE_RECHERCHE': {
      // Nouveau parcours : l'historique, le compagnon et la progression sont conservés
      const aujourdhui = jourDe();
      const relance: EtatApp = {
        ...etat,
        contexte: 'recherche',
        emplois: etat.emplois.map((e) => (e.termineLe ? e : { ...e, termineLe: aujourdhui })),
        recherches: [...etat.recherches, nouvelleRecherche()],
      };
      return { ...relance, taches: preparerTaches(relance, aujourdhui), jourTaches: aujourdhui };
    }

    /* ----- Ziggy+ ----- */
    case 'DEMARRER_ESSAI':
      return { ...etat, abonnement: { statut: 'essai', debutEssai: jourDe(), formule: action.formule } };
  }
}

/* ---------- Fournisseur : chargement, sauvegarde, nouveau jour ---------- */

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
        if (brut) dispatch({ type: 'CHARGER', etat: JSON.parse(brut) });
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

  // 3. Quand on revient dans l'app un autre jour : nouvelles tâches, énergie rechargée
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

/** Pour les tests et la page Compte : efface complètement la sauvegarde. */
export const effacerSauvegarde = () => AsyncStorage.removeItem(CLE_STOCKAGE);
