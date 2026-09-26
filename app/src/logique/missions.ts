/**
 * LE MOTEUR DES AVENTURES DE MILO (système miroir)
 * Milo vit sa propre recherche d'emploi en parallèle de la tienne, avec un peu de décalage.
 * Ton parcours (candidatures, relances, entretiens, refus et leurs dates) forme son calendrier :
 *   - ton entretien du 28, saisi le 26 → le 27 il reçoit une demande d'entretien, le 29 on te
 *     rappelle qu'il lui faudrait une tenue, le 30 il passe son entretien à une heure précise ;
 *   - ta relance (faite ou prévue) → il relance par téléphone le lendemain ;
 *   - ton refus → il reçoit sa réponse le lendemain (après son propre entretien s'il en avait un) ;
 *   - tes candidatures récentes → il dépose son CV ; sinon il cherche des opportunités.
 * Il postule dans les entreprises de SA ville : toujours la même pour une même candidature.
 * L'aventure du jour est choisie au moment où tu l'envoies, puis elle ne change plus.
 * Ici : que des calculs (aucun écran). Les réglages et les textes sont dans src/config/missions.ts.
 */
import { RECITS } from '@/config/aventures';
import { tenuesEntretien } from '@/config/boutique';
import { accorder } from '@/config/compagnons';
import {
  ANNONCES_ENTRETIEN,
  DECALAGE_JOURS,
  DUREES_MINUTES,
  FENETRE_ENTRETIEN,
  HEURES_ENTRE_AVENTURES_PREMIUM,
  JOURS_MAX_DEPOT,
  OU_EST,
  PRESENTATIONS,
  RESULTATS,
  RESULTATS_ENTRETIEN,
  RESULTATS_REFUS,
  SECTEURS,
  TITRE_DECOUVERTE,
  TITRES,
  type SecteurId,
  type TypeMission,
  type TypeMoment,
} from '@/config/missions';
import { villeParId, type Lieu } from '@/config/villes';
import { aventuresRestantes } from '@/logique/compagnon';
import { jourDe, joursEntre, nouvelId } from '@/logique/dates';
import { aPremium } from '@/services/abonnement';
import type { Candidature, EtatApp, Mission } from '@/store/types';

import { candidaturesActives } from './tachesDuJour';

const HEURE = 3_600_000;

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

const plusTard = (a: string, b: string) => (a > b ? a : b);

/** Jour (AAAA-MM-JJ) d'un départ. */
const jourDuDepart = (m: Mission) => (m.depart ? jourDe(new Date(m.depart)) : '');

/** Remplit un texte : {nom}, {lieu}, {metier}, {ville}, {personne}, {raison}, {jour}, {heure}, puis les accords. */
export function remplir(
  etat: EtatApp,
  texte: string,
  m?: Pick<Mission, 'lieu' | 'metier' | 'secteur'>,
  extra: Record<string, string> = {},
): string {
  const personne = m ? SECTEURS[m.secteur].personne : '';
  let rempli = texte
    .replaceAll('{nom}', etat.compagnon?.nom ?? 'Ton compagnon')
    .replaceAll('{ville}', etat.villeId ? villeParId(etat.villeId).nom : 'sa ville')
    .replaceAll('{lieu}', m?.lieu ?? '')
    .replaceAll('{metier}', (m?.metier ?? '').toLowerCase())
    .replaceAll('{Personne}', personne.charAt(0).toUpperCase() + personne.slice(1))
    .replaceAll('{personne}', personne);
  for (const [cle, valeur] of Object.entries(extra)) rempli = rempli.replaceAll(`{${cle}}`, valeur);
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

/**
 * L'entreprise de Milo qui correspond à une de tes candidatures : une entreprise de SA ville,
 * du même secteur que la tienne si possible. Toujours la même pour une même candidature
 * (il relance et passe son entretien là où il a déposé son CV).
 */
export function entrepriseDeMilo(etat: EtatApp, c: Pick<Candidature, 'id' | 'entreprise' | 'poste'>): Pick<Mission, 'lieu' | 'secteur' | 'metier'> {
  const ville = villeParId(etat.villeId ?? 'clairebourg');
  let secteur = detecterSecteur(c.entreprise, c.poste);
  if (secteur === 'entreprise') {
    // Secteur non reconnu : un des commerces de sa ville
    const lieux = ville.lieux.filter((l) => l.secteur);
    secteur = choisir(lieux, c.id).secteur ?? 'entreprise';
  }
  const noms = SECTEURS[secteur].noms.map((n) => n.replaceAll('{ville}', ville.nom));
  return { lieu: choisir(noms, c.id), secteur, metier: choisir(SECTEURS[secteur].metiers, `${c.id}-metier`) };
}

/* ---------- Le calendrier de Milo, décalé du tien ---------- */

/** Dernière date à laquelle ta candidature est passée par une étape. */
const derniereEtape = (c: Candidature, statut: Candidature['statut']) =>
  [...c.historique].reverse().find((h) => h.statut === statut)?.le;

const aventuresPour = (etat: EtatApp, c: Candidature, type: TypeMission) =>
  etat.missions.filter((m) => m.candidatureId === c.id && m.type === type && m.depart);

/** L'entretien de Milo pour une candidature : annoncé le lendemain de ta saisie, 2 jours après le tien. */
export type EntretienMilo = { candidature: Candidature; annonceLe: string; le: string; heure: number; fait: boolean };

export function entretienDeMilo(etat: EtatApp, c: Candidature): EntretienMilo | undefined {
  const saisi = derniereEtape(c, 'entretien');
  if (!saisi) return undefined;
  const tonEntretien = c.dateEntretien ?? saisi;
  const le = plusTard(ajouterJours(tonEntretien, DECALAGE_JOURS.entretien), ajouterJours(saisi, DECALAGE_JOURS.entretien));
  // Une heure précise, après son réveil (tirée une fois pour toutes pour cette candidature)
  const quarts = FENETRE_ENTRETIEN.duree * 4;
  const debut = (etat.rythme.reveil + FENETRE_ENTRETIEN.apresReveil) * 60 + (hacher(`${c.id}-${le}`) % quarts) * 15;
  // Coucher à minuit (0 h) : on compte 24 h
  const coucher = etat.rythme.coucher <= etat.rythme.reveil ? etat.rythme.coucher + 24 : etat.rythme.coucher;
  const minutes = Math.min(debut, (coucher - 1) * 60);
  const heure = new Date(`${le}T00:00:00`).getTime() + minutes * 60_000;
  const fait = aventuresPour(etat, c, 'entretien').some((m) => jourDuDepart(m) >= saisi);
  return { candidature: c, annonceLe: ajouterJours(saisi, DECALAGE_JOURS.annonceEntretien), le, heure, fait };
}

type Etape = { type: 'entretien' | 'refus' | 'relance' | 'depot'; candidature: Candidature; le: string; pasAvant?: number };

/** Ce que Milo a à vivre, dans l'ordre d'importance (entretien, réponse, relance, dépôt de CV). */
function etapesDeMilo(etat: EtatApp, jour: string): Etape[] {
  const etapes: Etape[] = [];
  const actives = candidaturesActives(etat);
  for (const c of actives) {
    if (c.statut === 'decroche') continue;
    const entretien = entretienDeMilo(etat, c);
    if (entretien && !entretien.fait && entretien.le <= jour) {
      etapes.push({ type: 'entretien', candidature: c, le: entretien.le, pasAvant: entretien.le === jour ? entretien.heure : undefined });
    }
    const refus = derniereEtape(c, 'refus');
    if (c.statut === 'refus' && refus && !aventuresPour(etat, c, 'refus').length && (!entretien || entretien.fait)) {
      const le = ajouterJours(refus, DECALAGE_JOURS.refus);
      if (le <= jour) etapes.push({ type: 'refus', candidature: c, le });
    }
    if (c.statut !== 'refus') {
      const relances = [c.relancePrevue, derniereEtape(c, 'relancee')].filter((x): x is string => !!x).sort();
      const derniere = relances[relances.length - 1];
      if (derniere) {
        const le = ajouterJours(derniere, DECALAGE_JOURS.relance);
        const faite = aventuresPour(etat, c, 'relance').some((m) => jourDuDepart(m) > derniere);
        if (le <= jour && !faite) etapes.push({ type: 'relance', candidature: c, le });
      }
    }
  }
  // Dépôt de CV : une de tes candidatures récentes (40 candidatures ne font pas 40 aventures)
  const derniere = derniereAventure(etat);
  if (derniere?.type !== 'depot') {
    const recente = actives
      .filter((c) => c.statut !== 'refus' && joursEntre(c.creeLe, jour) <= JOURS_MAX_DEPOT)
      .filter((c) => ajouterJours(c.creeLe, DECALAGE_JOURS.depot) <= jour && !aventuresPour(etat, c, 'depot').length)
      .sort((a, b) => b.creeLe.localeCompare(a.creeLe))[0];
    if (recente) etapes.push({ type: 'depot', candidature: recente, le: jour });
  }
  const ordre = { entretien: 0, refus: 1, relance: 2, depot: 3 };
  return etapes.sort((a, b) => ordre[a.type] - ordre[b.type] || a.le.localeCompare(b.le));
}

/** Une aventure « libre » : chercher une opportunité ou découvrir une entreprise (ou travailler, après « J'ai décroché ! »). */
export function missionDansLaVille(etat: EtatApp): Mission {
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
    decouverte: !pro && etat.aventuresTotal % 2 === 1,
    statut: 'en-cours',
    creeLe: aujourdhui,
  };
}

/**
 * L'aventure du jour, telle qu'elle partirait maintenant (selon ton parcours à cet instant).
 * `pasAvant` : son entretien a une heure précise, il ne peut pas partir avant.
 */
export function aventureDuJour(etat: EtatApp, maintenant = Date.now()): { mission: Mission; pasAvant?: number } {
  const jour = jourDe(new Date(maintenant));
  if (etat.contexte === 'pro') return { mission: missionDansLaVille(etat) };
  const etape = etapesDeMilo(etat, jour)[0];
  if (!etape) return { mission: missionDansLaVille(etat) };
  const tenue = etape.type === 'entretien' ? tenueEntretienPossedee(etat) : undefined;
  return {
    mission: {
      id: nouvelId(),
      type: etape.type,
      candidatureId: etape.candidature.id,
      ...entrepriseDeMilo(etat, etape.candidature),
      ...(etape.type === 'entretien' ? { avecTenue: !!tenue, tenue } : {}),
      statut: 'en-cours',
      creeLe: jour,
    },
    pasAvant: etape.pasAvant && etape.pasAvant > maintenant ? etape.pasAvant : undefined,
  };
}

/* ---------- La tenue d'entretien (achetée au Shop, jamais obligatoire) ---------- */

/** Une tenue d'entretien que Milo possède (la mieux adaptée d'abord), ou rien. */
export function tenueEntretienPossedee(etat: EtatApp): string | undefined {
  return tenuesEntretien().find((id) => etat.inventaire.includes(id));
}

/* ---------- Les annonces de son entretien (accueil, notifications) ---------- */

/** Le prochain entretien de Milo, s'il en a un (pas encore passé). */
export function prochainEntretienDeMilo(etat: EtatApp): EntretienMilo | undefined {
  return candidaturesActives(etat)
    .filter((c) => c.statut !== 'decroche')
    .map((c) => entretienDeMilo(etat, c))
    .filter((e): e is EntretienMilo => !!e && !e.fait)
    .sort((a, b) => a.heure - b.heure)[0];
}

/** Le petit message du jour sur son entretien : demande reçue, veille (penser à sa tenue), jour J. */
export function annonceEntretien(etat: EtatApp, jour = jourDe()): { texte: string; versLeShop: boolean } | undefined {
  const e = prochainEntretienDeMilo(etat);
  if (!e || jour < e.annonceLe) return undefined;
  const lieu = entrepriseDeMilo(etat, e.candidature);
  const extra = { jour: jourLisible(e.le, jour), heure: heureLisible(e.heure) };
  const tenue = !!tenueEntretienPossedee(etat);
  if (jour >= e.le) return { texte: remplir(etat, ANNONCES_ENTRETIEN.jour, lieu, extra), versLeShop: !tenue };
  if (jour === ajouterJours(e.le, -1)) {
    return { texte: remplir(etat, tenue ? ANNONCES_ENTRETIEN.veillePret : ANNONCES_ENTRETIEN.veille, lieu, extra), versLeShop: !tenue };
  }
  return { texte: remplir(etat, ANNONCES_ENTRETIEN.annonce, lieu, extra), versLeShop: false };
}

/* ---------- Quota : 1 aventure par jour (gratuit), 3 avec 3 h d'écart (Premium) ---------- */

const estAventure = (m: Mission) => !estUnMoment(m) && !!m.depart;

/** La dernière aventure lancée (hors moments pour souffler). */
export const derniereAventure = (etat: EtatApp) =>
  etat.missions.filter(estAventure).sort((a, b) => (b.depart ?? 0) - (a.depart ?? 0))[0];

/**
 * Quand Milo pourra repartir à l'aventure : maintenant (null), à une heure précise (Premium,
 * 3 h après le dernier départ), ou demain (quota du jour atteint). Indépendant de l'énergie.
 */
export function prochainDepart(etat: EtatApp, maintenant = Date.now()): null | number | 'demain' {
  if (aventuresRestantes(etat) === 0) return 'demain';
  const derniere = derniereAventure(etat);
  if (aPremium(etat) && derniere?.depart && jourDuDepart(derniere) === jourDe(new Date(maintenant))) {
    const possible = derniere.depart + HEURES_ENTRE_AVENTURES_PREMIUM * HEURE;
    if (maintenant < possible) return possible;
  }
  return null;
}

/* ---------- Résultats (tirés au départ, dévoilés au retour) ---------- */

export function tirerResultat(etat: EtatApp, m: Mission): string {
  if (m.type === 'recherche' || m.type === 'travail') {
    return remplir(etat, choisir(RECITS[m.type === 'travail' ? 'pro' : 'recherche'], m.id), m);
  }
  if (m.type === 'entretien') return remplir(etat, choisir(RESULTATS_ENTRETIEN[m.avecTenue ? 'avecTenue' : 'sansTenue'], m.id), m);
  if (m.type === 'refus') {
    const c = etat.candidatures.find((x) => x.id === m.candidatureId);
    const entretien = etat.missions.find((x) => x.candidatureId === m.candidatureId && x.type === 'entretien' && x.depart);
    // Sans tenue à son entretien → c'est la raison ; sinon, ce que tu as noté après ton refus
    if (entretien && !entretien.avecTenue) return remplir(etat, RESULTATS_REFUS.sansTenue, m);
    if (c?.raisonRefus) return remplir(etat, RESULTATS_REFUS.avecRaison, m, { raison: c.raisonRefus });
    return remplir(etat, choisir(RESULTATS_REFUS.simple, m.id), m);
  }
  return remplir(etat, choisir(RESULTATS[m.type], m.id), m);
}

/* ---------- Où en est le compagnon ---------- */

/** La mission en cours (le compagnon est parti), qu'il soit déjà revenu ou non. */
export const missionEnCours = (etat: EtatApp) => etat.missions.find((m) => m.statut === 'en-cours' && !!m.depart);

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

/** Durée d'une mission en millisecondes. */
export const dureeMission = (m: Mission) => DUREES_MINUTES[m.type] * 60_000;

/* ---------- Les moments pour souffler ---------- */

/** Se reposer à la maison, ou se baigner (lac, fontaine…). */
export function momentDuCompagnon(etat: EtatApp, type: TypeMoment): Mission {
  const aujourdhui = jourDe();
  const ville = villeParId(etat.villeId ?? 'clairebourg');
  return {
    id: nouvelId(),
    type,
    lieu: type === 'repos' ? 'la maison' : ville.baignade.ou,
    secteur: 'entreprise',
    metier: '',
    statut: 'en-cours',
    creeLe: aujourdhui,
  };
}

/** Moment pour souffler (repos, baignade), et pas une aventure. */
export const estUnMoment = (m: Pick<Mission, 'type'>) => m.type === 'repos' || m.type === 'baignade';

/* ---------- Textes ---------- */

export function iconeMission(m: Mission): string {
  if (m.type === 'recherche') return m.decouverte ? SECTEURS[m.secteur].icone : '🔎';
  if (m.type === 'relance' || m.type === 'refus') return '📱';
  if (m.type === 'repos') return '🏡';
  if (m.type === 'baignade') return m.lieu === 'à la fontaine' ? '⛲' : '🏞️';
  return SECTEURS[m.secteur].icone;
}
export const titreMission = (etat: EtatApp, m: Mission) => remplir(etat, m.decouverte ? TITRE_DECOUVERTE : TITRES[m.type], m);
export const presentationMission = (etat: EtatApp, m: Mission) => remplir(etat, PRESENTATIONS[m.type], m);
/** « Milo est chez Boulangerie du Lac », « Milo est au téléphone », « Milo est à la maison ». */
export const ouEst = (etat: EtatApp, m: Mission) => remplir(etat, OU_EST[m.type], m);

/** « 20 h 16 » */
export const heureLisible = (ms: number) =>
  new Date(ms).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', ' h ');

/** « aujourd'hui », « demain », « jeudi 2 oct. » */
export function jourLisible(jour: string, aujourdhui = jourDe()): string {
  const ecart = joursEntre(aujourdhui, jour);
  if (ecart === 0) return 'aujourd’hui';
  if (ecart === 1) return 'demain';
  return new Date(`${jour}T00:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });
}

/* ---------- Les candidatures de Milo (onglet ville) ---------- */

export type EtapeCompagnon = { candidature: Candidature; lieu: string; metier: string; icone: string; etape: string; accent?: boolean };

/** Pour chacune de tes candidatures en cours : l'entreprise de Milo, et où il en est (avec son décalage). */
export function parcoursDuCompagnon(etat: EtatApp, jour = jourDe()): EtapeCompagnon[] {
  return candidaturesActives(etat).map((c) => {
    const e = entrepriseDeMilo(etat, c);
    const base = { candidature: c, lieu: e.lieu, metier: e.metier, icone: SECTEURS[e.secteur].icone };
    const fait = (type: TypeMission) => aventuresPour(etat, c, type).length > 0;
    const entretien = entretienDeMilo(etat, c);
    if (c.statut === 'decroche') return { ...base, etape: 'A décroché son poste ! 🎉', accent: true };
    if (fait('refus')) return { ...base, etape: 'Pas retenu cette fois' };
    if (entretien && !entretien.fait && jour >= entretien.annonceLe) {
      return { ...base, etape: `Entretien ${jourLisible(entretien.le, jour)} à ${heureLisible(entretien.heure)}`, accent: true };
    }
    if (entretien?.fait) return { ...base, etape: 'Entretien passé', accent: true };
    if (fait('relance')) return { ...base, etape: 'A relancé par téléphone' };
    if (fait('depot')) return { ...base, etape: 'CV déposé' };
    return { ...base, etape: 'A repéré l’annonce' };
  });
}
