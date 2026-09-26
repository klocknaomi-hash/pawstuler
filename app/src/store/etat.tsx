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
import { CATALOGUE_BOUTIQUE, estPremium, objetParId } from '@/config/boutique';
import { emailValide } from '@/config/candidatures';
import { especeValide, type EspeceId, type Pronoms } from '@/config/compagnons';
import { COUT, ENERGIE_PAR_TACHE, NIVEAUX_ENERGIE } from '@/config/energie';
import { COUTS_MISSION, PIECES_MISSION, type TypeMoment } from '@/config/missions';
import { OBJECTIF_SERIE_PAR_DEFAUT } from '@/config/serie';
import { PIECES_OBJECTIF, PIECES_TACHE_PERSO, PLAFOND_PIECES_JOUR } from '@/config/taches';
import { VILLES, type VilleId } from '@/config/villes';
import { lieuEmbauche } from '@/logique/compagnon';
import { jourDe, joursEntre, nouvelId } from '@/logique/dates';
import { appliquerEnergie, energieDisponible, energieMax } from '@/logique/energie';
import {
  aventureDuJour,
  compagnonAbsent,
  dureeMission,
  estUnMoment,
  momentDuCompagnon,
  prochainDepart,
  resultatADecouvrir,
  tirerResultat,
  titreMission,
} from '@/logique/missions';
import { estEndormi } from '@/logique/rythme';
import { abonnementDuJour, aPremium } from '@/services/abonnement';
import { candidaturesActives, emploiActuel, preparerTaches, progresDuJour } from '@/logique/tachesDuJour';

import type { Candidature, EtatApp, Mission, Parametres, StatutCandidature, Tache, TypeContrat, Utilisateur } from './types';

const CLE_STOCKAGE = 'pawstuler/etat/v1';

/** Bonus de pièces pour fêter un poste décroché. */
const PIECES_DECROCHE = 50;

export const ETAT_INITIAL: EtatApp = {
  version: 2,
  connecte: false,
  recherche: { objectif: 'emploi', contrats: [] },
  rythme: { reveil: 8, coucher: 22 },
  onboardingTermine: false,
  serie: { objectif: OBJECTIF_SERIE_PAR_DEFAUT, actuelle: 0, meilleure: 0 },
  contexte: 'recherche',
  recherches: [],
  emplois: [],
  taches: [],
  modelesFaits: [],
  pieces: 0,
  piecesDuJour: 0,
  mouvements: [],
  energie: NIVEAUX_ENERGIE.gratuit.max,
  aventuresDuJour: 0,
  aventuresTotal: 0,
  decouvertes: [],
  missions: [],
  candidatures: [],
  inventaire: [],
  equipe: [],
  abonnement: { statut: 'gratuit' },
  parametres: {
    notifications: true,
    rappelsRelance: true,
    rappelsTaches: true,
  },
};

export type NouvelleCandidature = Pick<Candidature, 'entreprise' | 'poste' | 'lien' | 'email' | 'note' | 'statut' | 'dateEnvoi' | 'relancePrevue' | 'dateEntretien'>;

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
  | { type: 'DEFINIR_PRONOMS'; pronoms?: Pronoms }
  | { type: 'CHOISIR_VILLE'; villeId: VilleId }
  | { type: 'DEFINIR_RYTHME'; reveil: number; coucher: number }
  | { type: 'DEFINIR_OBJECTIF_SERIE'; jours: number }
  | { type: 'TERMINER_ONBOARDING' }
  /* Tâches, pièces, énergie */
  | { type: 'PREPARER_JOUR'; jour: string }
  | { type: 'COCHER_TACHE'; id: string }
  | { type: 'DECOCHER_TACHE'; id: string }
  | { type: 'SUPPRIMER_TACHE'; id: string }
  | { type: 'AJOUTER_TACHE'; titre: string }
  | { type: 'INTERAGIR'; moment: 'calin' | 'jeu' }
  /* Missions du compagnon (système miroir) */
  | { type: 'LANCER_AVENTURE' }
  | { type: 'DECOUVRIR_RESULTAT'; id: string }
  | { type: 'PRENDRE_UN_MOMENT'; moment: TypeMoment }
  /* Candidatures */
  | { type: 'AJOUTER_CANDIDATURE'; candidature: NouvelleCandidature }
  | {
      type: 'MODIFIER_CANDIDATURE';
      id: string;
      modifs: Partial<NouvelleCandidature & { dateEntretien: string }>;
    }
  | {
      type: 'CHANGER_STATUT';
      id: string;
      statut: StatutCandidature;
      /** Entretien : sa date. Refus : ce qui a pu jouer (facultatif). */
      dateEntretien?: string;
      raisonRefus?: string;
    }
  | { type: 'ARCHIVER_CANDIDATURE'; id: string; archivee: boolean }
  /* Shop */
  | { type: 'ACHETER'; objetId: string }
  | { type: 'EQUIPER'; objetId: string }
  /* Parcours professionnel */
  | {
      type: 'DECROCHER';
      emploi: {
        entreprise: string;
        poste: string;
        premierJour?: string;
        candidatureId?: string;
      };
      archiverCandidatures: boolean;
    }
  | {
      type: 'MODIFIER_EMPLOI';
      modifs: { entreprise?: string; poste?: string; premierJour?: string };
    }
  | { type: 'AJOUTER_OBJECTIF'; titre: string }
  | { type: 'BASCULER_OBJECTIF'; id: string }
  | { type: 'SUPPRIMER_OBJECTIF'; id: string }
  | { type: 'NOUVELLE_RECHERCHE' }
  /* Pawstuler Premium */
  | { type: 'SOUSCRIRE'; formule: FormuleId; essai: boolean }
  | { type: 'RESTAURER_ABONNEMENT'; formule: FormuleId }
  /** Version de test : simule une résiliation (ou son annulation) faite dans les réglages Apple. */
  | { type: 'BASCULER_RESILIATION' }
  | { type: 'VOIR_JOUR_ESSAI'; jour: number }
  | { type: 'VOIR_FIN_ESSAI' }
  | { type: 'VOIR_RAPPEL_ESSAI'; jour: string };

/* ---------- Petits outils ---------- */

/** Ajoute (ou retire, si montant négatif) des pièces et garde une ligne dans le portefeuille. */
function crediter(etat: EtatApp, montant: number, libelle: string): EtatApp {
  if (montant === 0) return etat;
  const reel = montant < 0 ? -Math.min(etat.pieces, -montant) : montant;
  const mouvement = { id: nouvelId(), le: jourDe(), libelle, montant: reel };
  return {
    ...etat,
    pieces: etat.pieces + reel,
    mouvements: [mouvement, ...etat.mouvements].slice(0, 200),
  };
}

/** Pièces encore gagnables aujourd'hui, dans la limite du plafond. */
export const gainPlafonne = (etat: EtatApp, montant: number) => Math.max(0, Math.min(montant, PLAFOND_PIECES_JOUR - etat.piecesDuJour));

/** Gain soumis au plafond du jour (ou reprise d'un tel gain si montant négatif). */
function crediterDuJour(etat: EtatApp, montant: number, libelle: string): EtatApp {
  const credite = crediter(etat, montant, libelle);
  return {
    ...credite,
    piecesDuJour: Math.max(0, etat.piecesDuJour + (credite.pieces - etat.pieces)),
  };
}

/** Coche automatiquement la première tâche du jour non faite qui correspond. */
/** Coche une tâche : pièces (dans le plafond du jour) et un peu d'énergie pour le compagnon. */
function cocher(etat: EtatApp, t: Tache): EtatApp {
  const energie = appliquerEnergie(etat, ENERGIE_PAR_TACHE);
  const energieDonnee = energie.energie - energieDisponible(etat);
  const gain = gainPlafonne(etat, t.pieces);
  const coche: EtatApp = {
    ...etat,
    ...energie,
    taches: etat.taches.map((x) => (x.id === t.id ? { ...x, faite: true, energieDonnee, piecesDonnees: gain } : x)),
    modelesFaits: t.modeleId && !etat.modelesFaits.includes(t.modeleId) ? [...etat.modelesFaits, t.modeleId] : etat.modelesFaits,
  };
  return crediterDuJour(coche, gain, gain < t.pieces ? `${t.titre} (plafond du jour)` : t.titre);
}

/** Décoche une tâche : la récompense réellement donnée est reprise. */
function decocher(etat: EtatApp, t: Tache): EtatApp {
  const decoche: EtatApp = {
    ...etat,
    ...appliquerEnergie(etat, -(t.energieDonnee ?? 0)),
    taches: etat.taches.map((x) => (x.id === t.id ? { ...x, faite: false, energieDonnee: 0, piecesDonnees: 0 } : x)),
  };
  return crediterDuJour(decoche, -(t.piecesDonnees ?? t.pieces), `Tâche décochée : ${t.titre}`);
}

/**
 * Tâches mesurables : leur progression suit tes vraies données du jour (candidatures enregistrées,
 * relances notées). L'objectif atteint coche la tâche toute seule.
 */
function synchroniserTaches(etat: EtatApp): EtatApp {
  const jour = jourDe();
  let suite = etat;
  for (const t of etat.taches) {
    if (!t.mesure) continue;
    const progres = progresDuJour(suite, t, jour);
    const actuelle = suite.taches.find((x) => x.id === t.id)!;
    if (progres !== actuelle.progres) suite = { ...suite, taches: suite.taches.map((x) => (x.id === t.id ? { ...x, progres } : x)) };
    const aJour = suite.taches.find((x) => x.id === t.id)!;
    if (progres >= t.mesure.objectif && !aJour.faite) suite = cocher(suite, aJour);
    else if (progres < t.mesure.objectif && aJour.faite) suite = decocher(suite, aJour);
  }
  return suite;
}

/**
 * Compte le jour dans la série 🐾 (appelé à chaque ouverture de l'app).
 * Même jour : rien ne change. Lendemain : +1. Après une pause : nouvelle série à 1, sans rien perdre.
 */
function compterJourSerie(etat: EtatApp, jour: string): EtatApp {
  const s = etat.serie;
  if (s.dernierJour === jour) return etat;
  const suite = s.dernierJour !== undefined && joursEntre(s.dernierJour, jour) === 1;
  const actuelle = suite ? s.actuelle + 1 : 1;
  return {
    ...etat,
    serie: {
      ...s,
      actuelle,
      meilleure: Math.max(s.meilleure, actuelle),
      dernierJour: jour,
      objectifAtteintLe: actuelle === s.objectif ? jour : s.objectifAtteintLe,
      repriseLe: s.dernierJour !== undefined && !suite ? jour : s.repriseLe,
    },
  };
}

/**
 * Met (ou enlève) un objet. Un vêtement (« habit ») remplace le vêtement déjà porté,
 * car chaque illustration montre le compagnon habillé en entier.
 */
function porter(equipe: string[], objetId: string): string[] {
  if (equipe.includes(objetId)) return equipe.filter((id) => id !== objetId);
  const habit = objetParId(objetId)?.habit;
  return [...(habit ? equipe.filter((id) => !objetParId(id)?.habit) : equipe), objetId];
}

/** Statuts des anciennes versions de l'app → statuts actuels. */
function convertirStatut(statut: string): StatutCandidature {
  if (statut === 'a-envoyer') return 'envoyee';
  if (statut === 'offre') return 'decroche';
  return statut as StatutCandidature;
}

/**
 * Fait partir le compagnon (énergie dépensée, résultat tiré, retour calculé en heure réelle).
 * L'aventure est figée à cet instant : la mettre à jour plus tard ne la change pas.
 */
function partirEnMission(etat: EtatApp, mission: Mission): EtatApp {
  const cout = COUTS_MISSION[mission.type];
  if (energieDisponible(etat) < cout || compagnonAbsent(etat) || resultatADecouvrir(etat) || estEndormi(etat.rythme)) return etat;
  const depart = Date.now();
  const partie: Mission = {
    ...mission,
    statut: 'en-cours',
    depart,
    retour: depart + dureeMission(mission),
    resultat: tirerResultat(etat, mission),
  };
  return {
    ...etat,
    ...appliquerEnergie(etat, -cout),
    missions: [partie, ...etat.missions],
    // Les aventures comptent dans le quota du jour (pas les moments pour souffler)
    ...(!estUnMoment(mission) ? { aventuresDuJour: etat.aventuresDuJour + 1, aventuresTotal: etat.aventuresTotal + 1 } : {}),
  };
}

/** Ce que l'historique garde en plus : date de l'entretien, raison du refus. */
function detailHistorique(action: { statut: StatutCandidature; dateEntretien?: string; raisonRefus?: string }): { detail?: string } {
  if (action.statut === 'entretien' && action.dateEntretien) {
    return { detail: `prévu le ${new Date(`${action.dateEntretien}T00:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}` };
  }
  if (action.statut === 'refus' && action.raisonRefus) return { detail: `« ${action.raisonRefus} »` };
  return {};
}

const nouvelleRecherche = () => ({ id: nouvelId(), debut: jourDe() });

/** Met à jour les anciennes sauvegardes (version 1) vers le modèle actuel. */
function migrer(brut: Partial<EtatApp> & { version?: number }): EtatApp {
  const etat = { ...ETAT_INITIAL, ...brut, version: 2 } as EtatApp;
  // Anciennes missions en file d'attente (avant le calendrier de Milo) : on ne garde que les vraies aventures
  etat.missions = etat.missions.filter((m) => m.statut === 'en-cours' || m.statut === 'vue');
  delete (etat as { journal?: unknown }).journal;
  if (etat.compagnon && !especeValide(etat.compagnon.espece)) etat.compagnon = { ...etat.compagnon, espece: 'renard' };
  if (etat.villeId && !VILLES.some((v) => v.id === etat.villeId)) etat.villeId = 'clairebourg';
  if (etat.onboardingTermine && etat.recherches.length === 0) etat.recherches = [nouvelleRecherche()];
  const rechercheId = etat.recherches[0]?.id ?? '';
  etat.candidatures = etat.candidatures.map((brute) => {
    // Anciens statuts : « À envoyer » devient « Envoyé », « Offre reçue » devient « Décroché »
    const ancien = brute as Candidature & { contact?: string; statut: string };
    const statut = convertirStatut(ancien.statut);
    // L'ancien champ « Contact » devient l'adresse e-mail s'il en est une, sinon il rejoint la note
    const { contact, ...c } = ancien;
    const email = c.email ?? (contact && emailValide(contact) ? contact.trim() : undefined);
    const note = contact && !emailValide(contact) ? [c.note, `Contact : ${contact}`].filter(Boolean).join('\n') : c.note;
    return {
      ...c,
      statut,
      email,
      note,
      dateEnvoi: c.dateEnvoi ?? c.creeLe,
      historique: (c.historique ?? [{ statut, le: c.dateEnvoi ?? c.creeLe }]).map((h) => ({ ...h, statut: convertirStatut(h.statut) })),
      archivee: c.archivee ?? false,
      rechercheId: c.rechercheId ?? rechercheId,
    };
  });
  if (brut.version !== 2 && brut.utilisateur) etat.connecte = true;
  // Anciennes sauvegardes : la dernière aventure devient la première découverte
  if (etat.decouvertes.length === 0 && etat.derniereAventure && etat.villeId)
    etat.decouvertes = [
      {
        villeId: etat.villeId,
        lieuId: etat.derniereAventure.lieuId,
        le: etat.derniereAventure.le,
      },
    ];
  return etat;
}

/* ---------- Le réducteur : toutes les modifications possibles ---------- */

function reducer(etat: EtatApp, action: Action): EtatApp {
  switch (action.type) {
    case 'CHARGER':
      return migrer(action.etat);

    /* ----- Compte ----- */
    case 'CONNECTER':
      return {
        ...etat,
        connecte: true,
        utilisateur: {
          prenom: etat.utilisateur?.prenom ?? '',
          ...action.utilisateur,
        },
      };
    case 'DECONNECTER':
      // Les données restent sur le téléphone : on les retrouve en se reconnectant.
      return { ...etat, connecte: false };
    case 'SUPPRIMER_COMPTE':
      return ETAT_INITIAL;
    case 'MODIFIER_PARAMETRES':
      return {
        ...etat,
        parametres: { ...etat.parametres, ...action.parametres },
      };

    /* ----- Onboarding et profil ----- */
    case 'DEFINIR_PRENOM':
      return etat.utilisateur
        ? {
            ...etat,
            utilisateur: { ...etat.utilisateur, prenom: action.prenom },
          }
        : etat;
    case 'DEFINIR_CONTRATS':
      return {
        ...etat,
        recherche: { objectif: 'emploi', contrats: action.contrats },
      };
    case 'CHOISIR_ESPECE':
      return {
        ...etat,
        compagnon: {
          espece: action.espece,
          nom: action.nomParDefaut,
          neLe: jourDe(),
        },
      };
    case 'NOMMER_COMPAGNON':
      return etat.compagnon ? { ...etat, compagnon: { ...etat.compagnon, nom: action.nom } } : etat;
    case 'DEFINIR_PRONOMS':
      return etat.compagnon ? { ...etat, compagnon: { ...etat.compagnon, pronoms: action.pronoms } } : etat;
    case 'CHOISIR_VILLE':
      return { ...etat, villeId: action.villeId };
    case 'DEFINIR_RYTHME':
      return {
        ...etat,
        rythme: { reveil: action.reveil, coucher: action.coucher },
      };
    case 'DEFINIR_OBJECTIF_SERIE': {
      // Nouvel objectif : s'il est déjà atteint par la série en cours, on le fête aujourd'hui
      const atteint = etat.serie.actuelle >= action.jours && etat.serie.dernierJour ? etat.serie.dernierJour : undefined;
      return {
        ...etat,
        serie: {
          ...etat.serie,
          objectif: action.jours,
          objectifAtteintLe: atteint,
        },
      };
    }
    case 'TERMINER_ONBOARDING': {
      // Cadeau de bienvenue : les objets « offerts » du Shop
      const cadeaux = CATALOGUE_BOUTIQUE.filter((o) => o.offert).map((o) => o.id);
      const fini: EtatApp = {
        ...etat,
        onboardingTermine: true,
        contexte: 'recherche',
        recherches: etat.recherches.length ? etat.recherches : [nouvelleRecherche()],
        energie: energieMax(etat),
        rechargeA: undefined,
        // Le premier rappel doux de l'essai n'arrive que quelques jours après l'inscription
        abonnement: {
          ...etat.abonnement,
          rappelEssaiLe: etat.abonnement.rappelEssaiLe ?? jourDe(),
        },
        inventaire: [...new Set([...etat.inventaire, ...cadeaux])],
      };
      return compterJourSerie(
        {
          ...fini,
          taches: preparerTaches(fini, jourDe()),
          jourTaches: jourDe(),
        },
        jourDe(),
      );
    }

    /* ----- Tâches, pièces et énergie ----- */
    case 'PREPARER_JOUR': {
      if (!etat.onboardingTermine) return etat;
      // Chaque ouverture de l'app compte pour la série (une fois par jour),
      // et la fin éventuelle de l'essai Premium est appliquée
      const compte = compterJourSerie({ ...etat, abonnement: abonnementDuJour(etat) }, action.jour);
      if (compte.jourTaches === action.jour) return compte;
      // Nouveau jour : tâches renouvelées, nouvelle aventure possible.
      // L'énergie, elle, suit sa propre recharge en temps réel (5 h en gratuit, 3 h en Premium).
      return synchroniserTaches({
        ...compte,
        taches: preparerTaches(compte, action.jour),
        jourTaches: action.jour,
        aventuresDuJour: 0,
        piecesDuJour: 0,
      });
    }
    case 'COCHER_TACHE': {
      // Les tâches mesurables se cochent toutes seules (on ne fabrique pas une progression)
      const t = etat.taches.find((x) => x.id === action.id);
      if (!t || t.faite || t.mesure) return etat;
      return cocher(etat, t);
    }
    case 'DECOCHER_TACHE': {
      // On fait confiance à l'utilisateur : décocher reprend simplement la récompense.
      const t = etat.taches.find((x) => x.id === action.id);
      if (!t || !t.faite || t.mesure) return etat;
      return decocher(etat, t);
    }
    case 'SUPPRIMER_TACHE': {
      const t = etat.taches.find((x) => x.id === action.id);
      if (!t) return etat;
      const sans = t.faite ? decocher(etat, t) : etat;
      return { ...sans, taches: sans.taches.filter((x) => x.id !== t.id) };
    }
    case 'AJOUTER_TACHE':
      return {
        ...etat,
        taches: [
          ...etat.taches,
          {
            id: nouvelId(),
            titre: action.titre,
            pieces: PIECES_TACHE_PERSO,
            faite: false,
            perso: true,
          },
        ],
      };
    case 'INTERAGIR': {
      const cout = COUT[action.moment];
      if (energieDisponible(etat) < cout || compagnonAbsent(etat)) return etat;
      return { ...etat, ...appliquerEnergie(etat, -cout) };
    }
    /* ----- Missions du compagnon ----- */
    case 'LANCER_AVENTURE': {
      // Quota (1 par jour, ou 3 avec 3 h d'écart en Premium) et heure de son entretien
      const maintenant = Date.now();
      if (prochainDepart(etat, maintenant) !== null) return etat;
      const { mission, pasAvant } = aventureDuJour(etat, maintenant);
      return pasAvant ? etat : partirEnMission(etat, mission);
    }
    case 'PRENDRE_UN_MOMENT':
      return partirEnMission(etat, momentDuCompagnon(etat, action.moment));
    case 'DECOUVRIR_RESULTAT': {
      const m = etat.missions.find((x) => x.id === action.id && x.statut === 'en-cours');
      if (!m || !m.retour || Date.now() < m.retour) return etat;
      const aujourdhui = jourDe();
      const vue: EtatApp = {
        ...etat,
        missions: etat.missions.map((x) => (x.id === m.id ? { ...x, statut: 'vue' } : x)),
        // Exploration : premier passage dans un lieu → « Découverte » et souvenir
        ...(m.type === 'recherche' && m.lieuId && etat.villeId
          ? {
              derniereAventure: {
                le: aujourdhui,
                texte: m.resultat ?? '',
                lieuId: m.lieuId,
              },
              decouvertes: etat.decouvertes.some((d) => d.villeId === etat.villeId && d.lieuId === m.lieuId)
                ? etat.decouvertes
                : [...etat.decouvertes, { villeId: etat.villeId, lieuId: m.lieuId, le: aujourdhui }],
            }
          : {}),
      };
      // Les moments pour souffler (repos, baignade) ne rapportent pas de pièces
      if (PIECES_MISSION[m.type] === 0) return vue;
      return crediterDuJour(vue, gainPlafonne(etat, PIECES_MISSION[m.type]), `Aventure : ${titreMission(etat, m)}`);
    }

    /* ----- Candidatures ----- */
    case 'AJOUTER_CANDIDATURE': {
      const rechercheId = etat.recherches[etat.recherches.length - 1]?.id ?? '';
      const aujourdhui = jourDe();
      const dateEnvoi = action.candidature.dateEnvoi ?? aujourdhui;
      // L'historique commence toujours par l'envoi ; si la candidature est déjà plus loin
      // (reprise d'un tableau Excel par exemple), on ajoute l'étape actuelle.
      const historique: Candidature['historique'] = [{ statut: 'envoyee', le: dateEnvoi }];
      if (action.candidature.statut !== 'envoyee') historique.push({ statut: action.candidature.statut, le: aujourdhui });
      const c: Candidature = {
        ...action.candidature,
        dateEnvoi,
        id: nouvelId(),
        creeLe: aujourdhui,
        historique,
        archivee: false,
        rechercheId,
      };
      // Milo ne part pas tout de suite : ta candidature rejoint le calendrier de ses aventures
      const avec: EtatApp = { ...etat, candidatures: [c, ...etat.candidatures] };
      // Pas de double saisie : une candidature envoyée aujourd'hui valide la tâche « Envoyer une candidature »
      // Pas de double saisie : les tâches « Envoyer X candidatures » avancent toutes seules
      return synchroniserTaches(avec);
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
                ...(action.dateEntretien ? { dateEntretien: action.dateEntretien } : {}),
                ...(action.raisonRefus ? { raisonRefus: action.raisonRefus } : {}),
                historique: [...c.historique, { statut: action.statut, le: jourDe(), ...detailHistorique(action) }],
              }
            : c,
        ),
      };
      // Miroir : Milo vivra cette étape plus tard, avec son décalage (calendrier des aventures)
      const miroir = apres;
      // Les tâches de relance avancent toutes seules
      return synchroniserTaches(miroir);
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
      // Collections d'événement et objets Premium : achat réservé à Premium (ce qui est déjà acquis reste acquis)
      if (estPremium(objet) && !aPremium(etat)) return etat;
      const achete = {
        ...etat,
        inventaire: [...etat.inventaire, objet.id],
        equipe: porter(etat.equipe, objet.id),
      };
      return crediter(achete, -objet.prix, `Achat : ${objet.nom}`);
    }
    case 'EQUIPER':
      if (!etat.inventaire.includes(action.objetId)) return etat;
      return { ...etat, equipe: porter(etat.equipe, action.objetId) };

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
          {
            id: nouvelId(),
            ...action.emploi,
            decrocheLe: aujourdhui,
            objectifs: [],
          },
        ],
        recherches: etat.recherches.map((r, i) => (i === etat.recherches.length - 1 ? { ...r, fin: aujourdhui } : r)),
        // Rien n'est supprimé : les candidatures restent, archivées seulement si l'utilisateur l'a choisi
        candidatures: etat.candidatures.map((c) => {
          const statut: StatutCandidature = c.id === action.emploi.candidatureId && c.statut !== 'decroche' ? 'decroche' : c.statut;
          return {
            ...c,
            statut,
            historique: statut !== c.statut ? [...c.historique, { statut, le: aujourdhui }] : c.historique,
            archivee: action.archiverCandidatures && idsActifs.has(c.id) ? true : c.archivee,
          };
        }),
        // Le compagnon décroche lui aussi un poste dans sa ville
        compagnon:
          etat.compagnon && lieu
            ? {
                ...etat.compagnon,
                metier: {
                  lieuId: lieu.id,
                  intitule: lieu.metier ?? 'Nouveau poste',
                  depuis: aujourdhui,
                },
              }
            : etat.compagnon,
      };
      const avecTaches = {
        ...nouveau,
        taches: preparerTaches(nouveau, aujourdhui),
        jourTaches: aujourdhui,
      };
      return crediter(avecTaches, PIECES_DECROCHE, `J'ai décroché ! ${action.emploi.poste}`);
    }
    case 'MODIFIER_EMPLOI': {
      const e = emploiActuel(etat);
      if (!e) return etat;
      return {
        ...etat,
        emplois: etat.emplois.map((x) => (x.id === e.id ? { ...x, ...action.modifs } : x)),
      };
    }
    case 'AJOUTER_OBJECTIF': {
      const e = emploiActuel(etat);
      if (!e) return etat;
      const objectif = {
        id: nouvelId(),
        titre: action.titre,
        atteint: false,
        creeLe: jourDe(),
      };
      return {
        ...etat,
        emplois: etat.emplois.map((x) => (x.id === e.id ? { ...x, objectifs: [...x.objectifs, objectif] } : x)),
      };
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
                  y.id === o.id
                    ? {
                        ...y,
                        atteint: !y.atteint,
                        atteintLe: o.atteint ? undefined : aujourdhui,
                        piecesDonnees: gain,
                      }
                    : y,
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
      return {
        ...relance,
        taches: preparerTaches(relance, aujourdhui),
        jourTaches: aujourdhui,
      };
    }

    /* ----- Pawstuler Premium ----- */
    case 'SOUSCRIRE': {
      // L'essai gratuit n'existe qu'avec l'annuel ; le mensuel est actif tout de suite.
      const abonnement: EtatApp['abonnement'] = action.essai
        ? {
            statut: 'essai',
            debutEssai: jourDe(),
            formule: action.formule,
            essaiUtilise: true,
            jourEssaiVu: 0,
          }
        : {
            statut: 'actif',
            formule: action.formule,
            essaiUtilise: etat.abonnement.essaiUtilise,
          };
      // Bienvenue dans Premium : l'énergie passe tout de suite au nouveau maximum
      return {
        ...etat,
        abonnement,
        energie: NIVEAUX_ENERGIE.premium.max,
        rechargeA: undefined,
      };
    }
    case 'BASCULER_RESILIATION':
      return etat.abonnement.statut === 'essai'
        ? {
            ...etat,
            abonnement: {
              ...etat.abonnement,
              resiliationPrevue: !etat.abonnement.resiliationPrevue,
            },
          }
        : etat;
    case 'VOIR_JOUR_ESSAI':
      return {
        ...etat,
        abonnement: { ...etat.abonnement, jourEssaiVu: action.jour },
      };
    case 'VOIR_FIN_ESSAI':
      return {
        ...etat,
        abonnement: { ...etat.abonnement, finEssaiAVoir: false },
      };
    case 'VOIR_RAPPEL_ESSAI':
      return {
        ...etat,
        abonnement: { ...etat.abonnement, rappelEssaiLe: action.jour },
      };
    case 'RESTAURER_ABONNEMENT':
      return {
        ...etat,
        abonnement: {
          ...etat.abonnement,
          statut: 'actif',
          formule: action.formule,
        },
      };
  }
}

/* ---------- Fournisseur : chargement, sauvegarde, nouveau jour ---------- */

type ContexteApp = {
  etat: EtatApp;
  dispatch: (a: Action) => void;
  pret: boolean;
};
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
