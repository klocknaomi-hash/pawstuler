/**
 * LE CARNET DE VOYAGE (au retour d'une aventure)
 * Un vrai compte rendu, écrit pour CETTE aventure (lieu, type, tenue, ce que tu as noté) :
 *  1. où il est allé (avec l'image du lieu) ;
 *  2. ce qu'il a fait et vécu (le chemin, ce qui s'est passé, ce qu'il a remarqué) ;
 *  3. ce qu'il a découvert (nouveau lieu, rencontre) ;
 *  4. le lien avec ta recherche (ta nouvelle d'abord, puis la sienne, en décalé) ;
 *  5. ce qu'il rapporte (pièces, souvenir, nombre d'aventures) ;
 *  6. ce qui l'attend ensuite (son entretien, une réponse, le prochain lieu).
 * Calculé au moment où l'on découvre le récit (avant d'enregistrer la découverte du lieu).
 * Rappel : ses candidatures sont les siennes, dans sa ville ; seules tes nouvelles le font avancer.
 */
import { ISSUES } from '@/config/banqueAventures';
import {
  CHEMINS_CARNET,
  ENSUITE_CARNET,
  ENVIE_DECOUVERTE,
  MOTS_RETOUR,
  LIENS_CARNET,
  REMARQUES_LIEU,
  SECTEURS,
} from '@/config/missions';
import { villeParId } from '@/config/villes';
import { decorDeMission } from '@/logique/decors';
import { jourDe, joursEntre } from '@/logique/dates';
import {
  candidatureMiloDe,
  estUnMoment,
  heureLisible,
  iconeMission,
  jourLisible,
  lieuDeMission,
  parcoursDeLaVille,
  prochainEntretienDeMilo,
  remplir,
} from '@/logique/missions';
import { relanceDue } from '@/logique/tachesDuJour';
import type { Candidature, EtatApp, Mission } from '@/store/types';

export type LigneCarnet = { emoji: string; texte: string };

/** Un petit pas pour toi, relié à ta propre recherche (un outil, ou ajouter une candidature). */
export type ActionCarnet = { libelle: string; pathname: string; params?: Record<string, string> };

export type Carnet = {
  /** Son petit mot à son retour, à la première personne. */
  mot: string;
  /** Un bouton concret dans « Et toi, de ton côté ». */
  action?: ActionCarnet;
  /** 1. Où : l'image, une étiquette (« 📍 Boulangerie du Lac ») et le métier visé. */
  image: ReturnType<typeof decorDeMission>;
  ou: string;
  detail?: string;
  /** 2. Ce qu'il a vécu (3 à 4 phrases). */
  vecu: string;
  /** 3. Ce qu'il a découvert. */
  decouvertes: LigneCarnet[];
  /** 4. Le lien avec ta recherche (pas pour les moments pour souffler). */
  lien?: string;
  /** 5. Ce qu'il rapporte en plus des pièces. */
  gains: LigneCarnet[];
  /** 6. Ce qui l'attend ensuite. */
  ensuite: string[];
};

/* ---------- Petits outils ---------- */

/** Une variante stable pour une aventure donnée. */
function variante(liste: string[], graine: string): string {
  let h = 0;
  for (let i = 0; i < graine.length; i++) h = (h * 31 + graine.charCodeAt(i)) >>> 0;
  return liste[h % liste.length];
}

/** « aujourd'hui », « hier », « avant-hier », « lundi », « le 3 octobre ». */
export function jourPasse(jour: string, aujourdhui = jourDe()): string {
  const ecart = joursEntre(jour, aujourdhui);
  if (ecart <= 0) return 'aujourd’hui';
  if (ecart === 1) return 'hier';
  if (ecart === 2) return 'avant-hier';
  const date = new Date(`${jour}T00:00:00`);
  if (ecart < 7) return date.toLocaleDateString('fr-FR', { weekday: 'long' });
  return `le ${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`;
}

const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`;
const majuscule = (texte: string) => texte.charAt(0).toUpperCase() + texte.slice(1);

const derniereEtape = (c: Candidature, statut: Candidature['statut']) =>
  [...c.historique].reverse().find((h) => h.statut === statut)?.le;

/** Aventures où il se rend vraiment dans le lieu (pas un appel ni un message). */
const surPlace = (m: Mission) => m.type === 'recherche' || m.type === 'depot' || m.type === 'entretien' || m.type === 'travail';

/* ---------- Le carnet ---------- */

export function carnetDeRetour(etat: EtatApp, m: Mission): Carnet {
  const ville = villeParId(etat.villeId ?? 'clairebourg');
  const lieu = lieuDeMission(etat, m);
  const aujourdhui = jourDe(m.retour ? new Date(m.retour) : new Date());
  const texte = (t: string, extra?: Record<string, string>) => remplir(etat, t, m, extra);

  /* 1. Où */
  const ou =
    m.type === 'relance'
      ? `📞 Appel à ${m.lieu}`
      : m.type === 'refus'
        ? `📩 Message de ${m.lieu}`
        : m.type === 'repos'
          ? '🏡 À la maison'
          : `${iconeMission(m)} ${majuscule(m.lieu)}`;
  const detail = m.metier && !estUnMoment(m) ? `${ville.nom} · ${m.type === 'travail' ? 'son poste' : 'poste visé'} : ${m.metier.toLowerCase()}` : ville.nom;

  /* 2. Ce qu'il a vécu : le chemin, ce qui s'est passé, ce qu'il a remarqué sur place */
  const phrases = [texte(variante(CHEMINS_CARNET[m.type], m.id)), m.resultat ?? ''];
  if (surPlace(m) && m.type !== 'travail') phrases.push(texte(`Sur place, {il} a remarqué ${REMARQUES_LIEU[m.secteur]}.`));
  const vecu = phrases.filter(Boolean).join(' ');

  /* 3. Ce qu'il a découvert */
  const premierPassage =
    !!lieu && surPlace(m) && !etat.decouvertes.some((d) => d.villeId === ville.id && d.lieuId === lieu.id);
  const decouvertes: LigneCarnet[] = [];
  if (premierPassage && lieu) decouvertes.push({ emoji: '📍', texte: `Un nouveau lieu sur son parcours : ${m.lieu}` });
  const personne = SECTEURS[m.secteur].personne;
  if (m.type === 'travail') decouvertes.push({ emoji: '🤝', texte: texte('{Il} a passé la journée avec ses collègues') });
  else if (surPlace(m) && personne) decouvertes.push({ emoji: '🤝', texte: texte('{Il} a rencontré {personne}') });
  if (m.issue) decouvertes.push({ emoji: ISSUES[m.issue].emoji, texte: texte(ISSUES[m.issue].resume) });

  /* 4. Le lien avec ta recherche : ta nouvelle, puis la sienne (jamais l'inverse) */
  let lien: string | undefined;
  const ta = m.candidatureId ? etat.candidatures.find((c) => c.id === m.candidatureId) : undefined;
  if (ta && m.type === 'relance') {
    const faite = derniereEtape(ta, 'relancee');
    lien = faite
      ? texte(LIENS_CARNET.relanceFaite, { entreprise: ta.entreprise, jour: jourPasse(faite, aujourdhui) })
      : ta.relancePrevue
        ? texte(LIENS_CARNET.relancePrevue, { entreprise: ta.entreprise, jour: jourPasse(ta.relancePrevue, aujourdhui) })
        : undefined;
  } else if (ta && m.type === 'entretien') {
    const le = ta.dateEntretien ?? derniereEtape(ta, 'entretien');
    if (le) lien = texte(LIENS_CARNET.entretien, { entreprise: ta.entreprise, jour: jourPasse(le, aujourdhui) });
  } else if (ta && m.type === 'refus') {
    const le = derniereEtape(ta, 'refus');
    if (le) lien = texte(LIENS_CARNET.refus, { entreprise: ta.entreprise, jour: jourPasse(le, aujourdhui) });
  } else if (m.type === 'travail') {
    const emploi = etat.emplois.find((e) => !e.termineLe);
    if (emploi) lien = texte(LIENS_CARNET.travail, { entreprise: emploi.entreprise });
  } else if (m.type === 'recherche' || m.type === 'depot') {
    // Tes candidatures envoyées ces 7 derniers jours (jamais un reproche s'il n'y en a pas)
    const semaine = etat.candidatures.filter((c) => {
      const envoi = c.dateEnvoi ?? c.creeLe;
      return envoi && joursEntre(envoi, aujourdhui) >= 0 && joursEntre(envoi, aujourdhui) < 7;
    }).length;
    lien = semaine
      ? texte(LIENS_CARNET.avecCandidatures, { nombre: pluriel(semaine, 'candidature') })
      : texte(LIENS_CARNET.sansCandidature);
  }

  // Un petit pas pour toi aussi, selon ta situation (jamais une obligation)
  let action: ActionCarnet | undefined;
  if (ta && m.type === 'relance' && ta.statut !== 'refus' && ta.statut !== 'decroche') {
    action = { libelle: '📞 Revoir le script de relance', pathname: '/outils/appel', params: { script: 'relance', candidature: ta.id } };
  } else if (ta && m.type === 'entretien' && ta.statut === 'entretien') {
    action = { libelle: `🙏 Écrire un mot de remerciement à ${ta.entreprise}`, pathname: '/outils/mail', params: { modele: 'remerciement', candidature: ta.id } };
  } else if (ta && m.type === 'refus') {
    action = { libelle: '🌱 Demander un retour pour progresser', pathname: '/outils/mail', params: { modele: 'retour', candidature: ta.id } };
  } else if (m.type === 'recherche' || m.type === 'depot') {
    const aRelancer = etat.candidatures.find((c) => relanceDue(c, aujourdhui));
    action = aRelancer
      ? { libelle: `✉️ Relancer ${aRelancer.entreprise}`, pathname: '/outils/mail', params: { modele: 'relance', candidature: aRelancer.id } }
      : { libelle: '➕ Ajouter une candidature', pathname: '/nouvelle-candidature' };
  }

  /* 5. Ce qu'il rapporte (les pièces sont affichées à part, plafond du jour compris) */
  const gains: LigneCarnet[] = [];
  if (premierPassage && lieu) gains.push({ emoji: lieu.souvenir.emoji, texte: `Un souvenir pour sa collection : ${lieu.souvenir.nom}` });
  if (!estUnMoment(m)) {
    const n = etat.aventuresTotal;
    gains.push({ emoji: '🧭', texte: n <= 1 ? 'Sa toute première aventure !' : `Sa ${n}e aventure dans ${ville.nom}` });
  }

  /* 6. Ce qui l'attend ensuite */
  const ensuite: string[] = [];
  const entretien = prochainEntretienDeMilo(etat);
  if (entretien && aujourdhui >= entretien.annonceLe && entretien.heure > (m.retour ?? 0)) {
    const sienne = candidatureMiloDe(etat, entretien.candidature);
    if (sienne) {
      ensuite.push(
        remplir(etat, ENSUITE_CARNET.entretienPrevu, sienne, {
          jour: jourLisible(entretien.le, aujourdhui),
          heure: heureLisible(entretien.heure),
        }),
      );
    }
  }
  if (estUnMoment(m)) ensuite.push(texte(ENSUITE_CARNET.moment));
  else if (m.type === 'depot' || m.type === 'relance' || m.type === 'entretien') ensuite.push(texte(ENSUITE_CARNET[m.type]));
  else if (m.type === 'recherche') ensuite.push(texte(ENSUITE_CARNET.recherche));
  else if (m.type === 'travail') ensuite.push(texte(ENSUITE_CARNET.travail));
  else if (m.type === 'refus') {
    // Ses autres candidatures, sans réponse négative
    const autres = etat.candidaturesMilo.filter(
      (cm) => cm.id !== m.candidatureMiloId && !etat.missions.some((x) => x.candidatureMiloId === cm.id && x.type === 'refus' && x.depart),
    ).length;
    ensuite.push(
      autres ? texte(ENSUITE_CARNET.refusAvecAutres, { nombre: pluriel(autres, 'autre candidature') }) : texte(ENSUITE_CARNET.refusSeul),
    );
  }

  if (!estUnMoment(m) && m.type !== 'travail') {
    const aDecouvrir = parcoursDeLaVille(etat).find((p) => p.etape === 'a-visiter' && p.lieu.id !== lieu?.id);
    if (aDecouvrir) ensuite.push(texte(ENVIE_DECOUVERTE, { prochainLieu: aDecouvrir.lieu.nom }));
  }

  /* Son petit mot, à la première personne */
  const mot = texte(m.type === 'recherche' && m.issue ? MOTS_RETOUR[`issue-${m.issue}`] : MOTS_RETOUR[m.type]);

  return { mot, action, image: decorDeMission(etat, m), ou, detail, vecu, decouvertes, lien, gains, ensuite };
}
