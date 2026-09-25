/**
 * LE MOTEUR DES MISSIONS (système miroir)
 * Transforme tes actions de recherche d'emploi en aventures pour ton compagnon :
 *   ta candidature → il dépose son CV ; ta relance → il retourne demander des nouvelles ;
 *   ton entretien → il passe le sien ; ton refus ou ton poste décroché → il le vit aussi.
 * Les missions sont étalées dans le temps (au plus 2 par jour) et se déroulent en temps réel.
 * Ici : que des calculs (aucun écran). Les réglages et les textes sont dans src/config/missions.ts.
 */
import { RECITS } from '@/config/aventures';
import { accorder } from '@/config/compagnons';
import {
  CANDIDATURES_GRANDE_TOURNEE,
  DUREES_MINUTES,
  JOURNAL_DEPART,
  MISSIONS_PAR_JOUR,
  OU_EST,
  PENDANT,
  PRESENTATION_GRANDE_TOURNEE,
  PRESENTATIONS,
  RESULTATS,
  SECTEURS,
  TITRE_GRANDE_TOURNEE,
  TITRES,
  type SecteurId,
  type TypeMission,
  type TypeMoment,
} from '@/config/missions';
import { villeParId, type Lieu } from '@/config/villes';
import { jourDe, joursEntre, nouvelId } from '@/logique/dates';
import type { Candidature, EtatApp, Mission } from '@/store/types';

import { candidaturesActives } from './tachesDuJour';

/* ---------- Petits outils ---------- */

/** Transforme un texte en nombre stable (pour des tirages « au hasard » mais reproductibles). */
function hacher(texte: string): number {
  let h = 0;
  for (let i = 0; i < texte.length; i++) h = (h * 31 + texte.charCodeAt(i)) >>> 0;
  return h;
}

const choisir = <T>(liste: T[], graine: string): T => liste[hacher(graine) % liste.length];

/** AAAA-MM-JJ + n jours. */
export function ajouterJours(jour: string, n: number): string {
  const d = new Date(`${jour}T00:00:00`);
  d.setDate(d.getDate() + n);
  return jourDe(d);
}

/** Remplit un texte de mission : {nom}, {lieu}, {metier}, {ville}, {personne}, puis les accords. */
export function remplir(etat: EtatApp, texte: string, m?: Pick<Mission, 'lieu' | 'metier' | 'secteur'>): string {
  const personne = m ? SECTEURS[m.secteur].personne : '';
  const rempli = texte
    .replaceAll('{nom}', etat.compagnon?.nom ?? 'Ton compagnon')
    .replaceAll('{ville}', etat.villeId ? villeParId(etat.villeId).nom : 'sa ville')
    .replaceAll('{lieu}', m?.lieu ?? '')
    .replaceAll('{metier}', (m?.metier ?? '').toLowerCase())
    .replaceAll('{Personne}', personne.charAt(0).toUpperCase() + personne.slice(1))
    .replaceAll('{personne}', personne);
  return accorder(rempli, etat.compagnon?.pronoms);
}

/* ---------- Secteurs et lieux ---------- */

/** Devine le type de lieu à partir de l'entreprise et du poste (« Boulangerie Mercier » → boulangerie). */
export function detecterSecteur(entreprise: string, poste = ''): SecteurId {
  const texte = ` ${entreprise} ${poste} `.toLowerCase();
  const trouve = (Object.keys(SECTEURS) as SecteurId[]).find((id) => SECTEURS[id].motsCles.some((mot) => texte.includes(mot)));
  return trouve ?? 'entreprise';
}

/** Nom du lieu aujourd'hui : les commerces de la ville changent de nom d'un jour à l'autre. */
export function nomDuJour(etat: EtatApp, lieu: Lieu, jour: string): string {
  if (!lieu.secteur) return lieu.nom;
  const ville = etat.villeId ? villeParId(etat.villeId).nom : '';
  const noms = [lieu.nom, ...SECTEURS[lieu.secteur].noms.map((n) => n.replaceAll('{ville}', ville))];
  return choisir([...new Set(noms)], `${jour}-${lieu.id}`);
}

/** Métier du jour dans un lieu (cohérent avec son secteur). */
export function metierDuJour(lieu: Lieu, jour: string): string {
  if (!lieu.secteur) return lieu.metier ?? 'Nouvelle opportunité';
  return choisir([lieu.metier ?? SECTEURS[lieu.secteur].metiers[0], ...SECTEURS[lieu.secteur].metiers], `${jour}-${lieu.id}-metier`);
}

/* ---------- Calendrier : étaler les missions dans le temps ---------- */

/** Premier jour (à partir de `depuis`) où le compagnon a encore de la place dans son planning. */
export function prochainJourLibre(missions: Mission[], depuis: string): string {
  const occupees = new Map<string, number>();
  for (const m of missions) {
    if (m.statut === 'annulee' || m.type === 'recherche' || m.type === 'travail') continue;
    occupees.set(m.disponibleLe, (occupees.get(m.disponibleLe) ?? 0) + 1);
  }
  let jour = depuis;
  while ((occupees.get(jour) ?? 0) >= MISSIONS_PAR_JOUR) jour = ajouterJours(jour, 1);
  return jour;
}

/* ---------- Création des missions ---------- */

/** Mission miroir d'une candidature (le compagnon reprend le vrai nom de l'entreprise). */
export function missionPourCandidature(
  etat: EtatApp,
  c: Pick<Candidature, 'id' | 'entreprise' | 'poste'>,
  type: 'depot' | 'relance' | 'entretien',
  disponibleLe?: string,
): Mission {
  const aujourdhui = jourDe();
  let jour = disponibleLe ?? prochainJourLibre(etat.missions, aujourdhui);
  // Une relance n'a lieu qu'après le dépôt du CV (jamais le même jour ni avant)
  if (type === 'relance') {
    const depot = etat.missions.find((m) => m.candidatureId === c.id && m.type === 'depot' && m.statut === 'a-venir');
    if (depot && depot.disponibleLe >= jour) jour = prochainJourLibre(etat.missions, ajouterJours(depot.disponibleLe, 1));
  }
  return {
    id: nouvelId(),
    type,
    candidatureId: c.id,
    lieu: c.entreprise,
    secteur: detecterSecteur(c.entreprise, c.poste),
    metier: c.poste,
    disponibleLe: jour,
    statut: 'a-venir',
    creeLe: aujourdhui,
  };
}

/** Exploration de la ville (ou journée de travail après « J'ai décroché ! »). */
export function missionDansLaVille(etat: EtatApp, special = false): Mission {
  const aujourdhui = jourDe();
  const ville = villeParId(etat.villeId ?? 'clairebourg');
  const pro = etat.contexte === 'pro';
  const avecSecteur = ville.lieux.filter((l) => l.secteur);
  const lieu =
    (pro && etat.compagnon?.metier && ville.lieux.find((l) => l.id === etat.compagnon?.metier?.lieuId)) ||
    avecSecteur[etat.aventuresTotal % avecSecteur.length];
  return {
    id: nouvelId(),
    type: pro ? 'travail' : 'recherche',
    lieu: nomDuJour(etat, lieu, aujourdhui),
    secteur: lieu.secteur ?? 'entreprise',
    metier: pro && etat.compagnon?.metier ? etat.compagnon.metier.intitule : metierDuJour(lieu, aujourdhui),
    lieuId: lieu.id,
    special,
    disponibleLe: aujourdhui,
    statut: 'a-venir',
    creeLe: aujourdhui,
  };
}

/** Un moment pour souffler : se reposer à la maison, ou se baigner (lac, fontaine…). */
export function momentDuCompagnon(etat: EtatApp, type: TypeMoment): Mission {
  const aujourdhui = jourDe();
  const ville = villeParId(etat.villeId ?? 'clairebourg');
  return {
    id: nouvelId(),
    type,
    lieu: type === 'repos' ? 'la maison' : ville.baignade.ou,
    secteur: 'entreprise',
    metier: '',
    disponibleLe: aujourdhui,
    statut: 'a-venir',
    creeLe: aujourdhui,
  };
}

/** Moment pour souffler (repos, baignade), et pas une mission de recherche. */
export const estUnMoment = (m: Pick<Mission, 'type'>) => m.type === 'repos' || m.type === 'baignade';

/** 5 candidatures en 7 jours : la « grande tournée » (une seule par semaine). */
export function grandeTourneeMeritee(etat: EtatApp): boolean {
  const aujourdhui = jourDe();
  const recentes = etat.candidatures.filter((c) => joursEntre(c.creeLe, aujourdhui) < 7).length;
  const dejaFaite = etat.missions.some((m) => m.special && joursEntre(m.creeLe, aujourdhui) < 7);
  return recentes >= CANDIDATURES_GRANDE_TOURNEE && !dejaFaite;
}

/** Résultat de la mission, tiré au départ (dévoilé au retour). */
export function tirerResultat(etat: EtatApp, m: Mission): string {
  if (m.type === 'recherche' || m.type === 'travail') {
    const recits = RECITS[m.type === 'travail' ? 'pro' : 'recherche'];
    return remplir(etat, choisir(recits, m.id), m);
  }
  return remplir(etat, choisir(RESULTATS[m.type], m.id), m);
}

/* ---------- Où en est le compagnon ---------- */

/** La mission en cours (le compagnon est parti), qu'il soit déjà revenu ou non. */
export const missionEnCours = (etat: EtatApp) => etat.missions.find((m) => m.statut === 'en-cours');

/** Le compagnon est absent en ce moment (parti et pas encore revenu). */
export function compagnonAbsent(etat: EtatApp, maintenant = Date.now()): Mission | undefined {
  const m = missionEnCours(etat);
  return m && m.retour && maintenant < m.retour ? m : undefined;
}

/** Mission terminée dont le résultat attend d'être découvert. */
export function resultatADecouvrir(etat: EtatApp, maintenant = Date.now()): Mission | undefined {
  const m = missionEnCours(etat);
  return m && m.retour && maintenant >= m.retour ? m : undefined;
}

const PRIORITE: Record<TypeMission, number> = {
  entretien: 0,
  relance: 1,
  depot: 2,
  recherche: 3,
  travail: 3,
  repos: 4,
  baignade: 4,
};

/** Missions proposées aujourd'hui (au plus 2, les plus importantes d'abord : entretien, relance, dépôt). */
export function missionsDisponibles(etat: EtatApp, jour = jourDe()): Mission[] {
  const enAttente = etat.missions
    .filter((m) => m.statut === 'a-venir' && m.disponibleLe <= jour)
    .sort((a, b) => PRIORITE[a.type] - PRIORITE[b.type] || a.disponibleLe.localeCompare(b.disponibleLe));
  // La grande tournée est un bonus : elle ne prend pas la place d'une mission miroir
  const speciales = enAttente.filter((m) => m.special);
  return [...enAttente.filter((m) => !m.special).slice(0, missionsMiroirRestantes(etat, jour)), ...speciales];
}

/** Missions miroir déjà lancées ce jour-là (dépôt, relance, entretien). */
export const missionsMiroirDuJour = (etat: EtatApp, jour = jourDe()) =>
  etat.missions.filter((m) => m.candidatureId && m.depart && m.statut !== 'annulee' && jourDe(new Date(m.depart)) === jour).length;

/** Combien de missions miroir le compagnon peut encore faire aujourd'hui (2 par jour). */
export const missionsMiroirRestantes = (etat: EtatApp, jour = jourDe()) => Math.max(0, MISSIONS_PAR_JOUR - missionsMiroirDuJour(etat, jour));

/** Entrées du journal d'une journée (les plus récentes d'abord). */
export const journalDuJour = (etat: EtatApp, jour = jourDe()) => etat.journal.filter((e) => jourDe(new Date(e.le)) === jour);

/** Prochaines missions prévues les jours suivants (le petit calendrier du compagnon). */
export const missionsAVenir = (etat: EtatApp, jour = jourDe()) =>
  etat.missions.filter((m) => m.statut === 'a-venir' && m.disponibleLe > jour).sort((a, b) => a.disponibleLe.localeCompare(b.disponibleLe));

/** Durée d'une mission en millisecondes. */
export const dureeMission = (m: Mission) => DUREES_MINUTES[m.type] * 60_000;

/* ---------- Textes ---------- */

export function iconeMission(m: Mission): string {
  if (m.special) return '🗺️';
  if (m.type === 'recherche') return '🔎';
  if (m.type === 'repos') return '🏡';
  if (m.type === 'baignade') return m.lieu === 'à la fontaine' ? '⛲' : '🏞️';
  return SECTEURS[m.secteur].icone;
}
/** « Milo est chez Boulangerie Dupain », « Milo est au lac », « Milo est à la maison ». */
export const ouEst = (etat: EtatApp, m: Mission) => remplir(etat, OU_EST[m.type], m);
export const titreMission = (etat: EtatApp, m: Mission) => remplir(etat, m.special ? TITRE_GRANDE_TOURNEE : TITRES[m.type], m);
export const presentationMission = (etat: EtatApp, m: Mission) => remplir(etat, m.special ? PRESENTATION_GRANDE_TOURNEE : PRESENTATIONS[m.type], m);
export const pendantMission = (etat: EtatApp, m: Mission) => remplir(etat, PENDANT[m.type], m);
export const journalDepart = (etat: EtatApp, m: Mission) => remplir(etat, JOURNAL_DEPART[m.type], m);

/** « 20 h 16 » */
export const heureLisible = (ms: number) => new Date(ms).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', ' h ');

/** « aujourd'hui », « demain », « jeudi 2 oct. » */
export function jourLisible(jour: string, aujourdhui = jourDe()): string {
  const ecart = joursEntre(aujourdhui, jour);
  if (ecart === 0) return 'aujourd’hui';
  if (ecart === 1) return 'demain';
  return new Date(`${jour}T00:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

/* ---------- Le parcours du compagnon, en miroir de tes candidatures ---------- */

export type EtapeCompagnon = {
  candidature: Candidature;
  icone: string;
  etape: string;
  accent?: boolean;
};

/** Pour chaque candidature en cours : où en est le compagnon (jamais un 2e tableau Excel, juste son histoire). */
export function parcoursDuCompagnon(etat: EtatApp, jour = jourDe()): EtapeCompagnon[] {
  return candidaturesActives(etat).map((c) => {
    const missions = etat.missions.filter((m) => m.candidatureId === c.id);
    const icone = SECTEURS[detecterSecteur(c.entreprise, c.poste)].icone;
    const faite = (type: TypeMission) => missions.some((m) => m.type === type && m.statut === 'vue');
    const prevue = missions.find((m) => m.statut === 'a-venir');
    const enCours = missions.find((m) => m.statut === 'en-cours');
    if (c.statut === 'decroche')
      return {
        candidature: c,
        icone,
        etape: 'A décroché son poste ! 🎉',
        accent: true,
      };
    if (c.statut === 'refus') return { candidature: c, icone, etape: 'Pas retenu cette fois' };
    if (enCours) return { candidature: c, icone, etape: 'En route…' };
    if (prevue)
      return {
        candidature: c,
        icone,
        etape: `Mission prévue ${jourLisible(prevue.disponibleLe, jour)}`,
      };
    if (faite('entretien')) return { candidature: c, icone, etape: 'Entretien passé', accent: true };
    if (faite('relance')) return { candidature: c, icone, etape: 'A demandé des nouvelles' };
    if (faite('depot')) return { candidature: c, icone, etape: 'CV déposé' };
    return { candidature: c, icone, etape: 'Suit ta candidature' };
  });
}
