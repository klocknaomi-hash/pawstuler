/**
 * BANQUE D'AVENTURES (lieu × activité × issue)
 * Pour que les explorations de Milo changent chaque jour, sans IA en temps réel :
 * une aventure combine un LIEU de sa ville (avec son métier et son image), une ACTIVITÉ
 * (visiter, donner un coup de main, rencontrer quelqu'un…), une TÂCHE propre au type de lieu
 * (« mettre les croissants en vitrine ») et une ISSUE (une piste, un conseil, un contact…).
 * La combinaison est tirée au départ (toujours la même pour un jour donné) et ne change plus.
 *
 * Règles : jamais d'issue négative inventée (Milo ne reçoit un refus que si toi tu en as reçu un) ;
 * on récompense l'effort. Ajouter du contenu = ajouter des lignes ici, rien d'autre à toucher.
 * Variables : {nom}, {lieu}, {ville}, {metier}, {personne}/{Personne}, {tache}, {conseil}, accords {il}, {e}…
 */
import type { SecteurId } from './missions';

/* ---------- Les activités ---------- */

export type ActiviteId = 'visiter' | 'coup-de-main' | 'rencontre' | 'observer' | 'atelier';

export type Activite = {
  /** Titre de l'aventure (écran de départ, carte). */
  titre: string;
  /** L'objectif, présenté comme une petite offre de mission. */
  objectif: string;
  /** Ce qu'il va faire concrètement. */
  action: string;
  /** Première phrase du récit au retour. */
  recit: string[];
};

export const ACTIVITES: Record<ActiviteId, Activite> = {
  visiter: {
    titre: '{nom} part découvrir {lieu}',
    objectif: 'Découvrir un nouveau lieu de {ville}',
    action: 'Pousser la porte, regarder comment on y travaille et se présenter.',
    recit: ['{nom} a poussé la porte de {lieu} et a fait le tour des lieux.', '{nom} a pris le temps de découvrir {lieu}, du comptoir jusqu’à l’arrière-boutique.'],
  },
  'coup-de-main': {
    titre: 'Coup de main chez {lieu}',
    objectif: 'Aider l’équipe de {lieu} pendant un moment chargé',
    action: 'Donner un coup de main : {tache}.',
    recit: ['L’équipe de {lieu} était débordée : {nom} a proposé son aide et a passé un moment à {tache}.', 'Manches retroussées, {nom} a aidé {personne} à {tache}.'],
  },
  rencontre: {
    titre: 'Une rencontre chez {lieu}',
    objectif: 'Échanger avec quelqu’un qui fait le métier de {metier}',
    action: 'Poser ses questions sur le métier, autour d’un café.',
    recit: ['Chez {lieu}, {nom} a pris un café avec {personne}, qui lui a raconté son parcours.', 'Chez {lieu}, {personne} a accepté de répondre aux questions de {nom} sur le métier de {metier}.'],
  },
  observer: {
    titre: 'Une heure dans les coulisses de {lieu}',
    objectif: 'Voir à quoi ressemble une vraie journée de {metier}',
    action: 'Observer l’équipe au travail, sans gêner, carnet à la main.',
    recit: ['{nom} s’est fait tout{e} petit{e} dans un coin de {lieu} pour observer l’équipe : on y passe beaucoup de temps à {tache}.', 'Carnet à la main, {nom} a suivi {personne} pendant une heure, entre deux clients.'],
  },
  atelier: {
    titre: 'Petit atelier chez {lieu}',
    objectif: 'Apprendre un geste du métier de {metier}',
    action: 'Participer à un petit atelier : apprendre à {tache}.',
    recit: ['Chez {lieu}, {personne} a appris à {nom} à {tache}. Premier essai un peu maladroit, deuxième beaucoup mieux !', '{nom} a suivi un petit atelier chez {lieu} pour apprendre à {tache}.'],
  },
};

/* ---------- Ce qu'on fait concrètement, selon le type de lieu ---------- */

/** Des gestes du métier, pour chaque type de lieu (infinitif, après « à » ou « apprendre à »). */
export const TACHES_LIEU: Record<SecteurId, string[]> = {
  boulangerie: ['mettre les croissants en vitrine', 'façonner des baguettes', 'décorer des tartelettes aux fraises', 'servir les clients du matin', 'préparer la pâte à brioche'],
  cafe: ['préparer un cappuccino avec un joli cœur de mousse', 'dresser les tables de la terrasse', 'écrire le menu du jour sur l’ardoise', 'accueillir les habitués'],
  librairie: ['ranger les nouveautés sur les tables', 'conseiller un livre à une cliente', 'emballer des cadeaux', 'préparer la vitrine du mois'],
  restaurant: ['éplucher les légumes du jour', 'dresser une belle assiette', 'prendre les commandes en salle', 'préparer le service du midi'],
  hotel: ['accueillir des voyageurs', 'préparer les clés des chambres', 'renseigner des touristes sur la ville', 'organiser le petit-déjeuner'],
  ecole: ['préparer une activité de dessin', 'ranger la bibliothèque des enfants', 'aider pendant la récréation', 'accueillir les parents'],
  sport: ['installer le matériel du cours', 'accueillir les nouveaux inscrits', 'préparer un échauffement', 'ranger les ballons et les tapis'],
  boutique: ['arranger la vitrine', 'conseiller un client', 'étiqueter les nouveautés', 'faire de jolis paquets'],
  studio: ['installer les lumières d’une séance photo', 'trier des photos', 'préparer un petit montage vidéo', 'ranger le matériel'],
  agence: ['préparer une affiche', 'répondre au téléphone', 'organiser un planning', 'trouver des idées pour un client'],
  atelier: ['poncer une planche', 'trier les outils', 'réparer un petit objet', 'mesurer deux fois avant de couper'],
  entreprise: ['préparer une réunion', 'classer des dossiers', 'accueillir un visiteur', 'mettre à jour un tableau de suivi'],
};

/* ---------- Les issues (toujours positives : on récompense l'effort) ---------- */

export type IssueId = 'piste' | 'conseil' | 'contact' | 'competence' | 'confiance';

export type Issue = {
  /** Fin du récit au retour. */
  recit: string[];
  /** Petite ligne du carnet « Ce qu'il a découvert ». */
  emoji: string;
  resume: string;
};

export const ISSUES: Record<IssueId, Issue> = {
  piste: {
    recit: ['En partant, {personne} lui a glissé qu’un poste de {metier} pourrait bientôt se libérer. {nom} l’a noté dans son carnet.', '{Personne} lui a dit de repasser déposer son CV : ils cherchent parfois du renfort.'],
    emoji: '🔎',
    resume: 'Une piste pour un poste de {metier}',
  },
  conseil: {
    recit: ['Avant qu’{il} reparte, {personne} lui a donné un conseil : « {conseil} »', '{Personne} lui a confié son meilleur conseil : « {conseil} » {nom} compte bien s’en servir.'],
    emoji: '💡',
    resume: 'Un conseil : « {conseil} »',
  },
  contact: {
    recit: ['{Personne} lui a donné le nom d’une amie qui recrute ailleurs dans {ville}. Un contact de plus dans son carnet !', '{Personne} lui a laissé son numéro de téléphone, « au cas où ».'],
    emoji: '📇',
    resume: 'Un nouveau contact dans {ville}',
  },
  competence: {
    recit: ['{nom} a noté ce nouveau savoir-faire dans la case « compétences » de son CV.', 'Une ligne de plus pour son CV, et une vraie histoire à raconter en entretien !'],
    emoji: '🧰',
    resume: '{Il} sait maintenant {tache}',
  },
  confiance: {
    recit: ['{nom} est reparti{e} le cœur léger : parler de soi devient un peu plus facile à chaque fois.', '{Personne} a trouvé {nom} très motivé{e}. Ça fait du bien de l’entendre !'],
    emoji: '🌟',
    resume: 'Un peu plus confiance en {lui}',
  },
};

/**
 * Des conseils de recherche d'emploi, vrais et utiles (pour Milo… et pour toi).
 * Ils apparaissent dans les issues « conseil ».
 */
export const CONSEILS: string[] = [
  'Un CV d’une page, c’est souvent mieux qu’un CV de deux.',
  'Relancer au bout d’une semaine, ce n’est pas déranger : c’est montrer qu’on est motivé.',
  'Avant un entretien, prépare trois exemples concrets de ce que tu as déjà réussi.',
  'Adapte les premières lignes de ta lettre à chaque entreprise : c’est ce qu’on lit en premier.',
  'Prépare une ou deux questions à poser à la fin de l’entretien.',
  'Un petit mail de remerciement après un entretien, ça laisse un bon souvenir.',
  'Les compétences du quotidien comptent aussi : organisation, ponctualité, sourire.',
  'Parle de ce que tu as appris, pas seulement de ce que tu as fait.',
  'Une candidature spontanée peut ouvrir des portes qui n’ont pas encore d’annonce.',
  'Note tes candidatures au même endroit : on se sent tout de suite plus organisé.',
];

/* ---------- Le tirage ---------- */

/** Ordre des activités au fil des jours (la première aventure est toujours une visite). */
export const ROTATION_ACTIVITES: ActiviteId[] = ['visiter', 'coup-de-main', 'rencontre', 'atelier', 'observer'];
/** Une compétence ne s'apprend qu'en mettant la main à la pâte. */
export const ISSUES_POSSIBLES: Record<ActiviteId, IssueId[]> = {
  visiter: ['piste', 'conseil', 'contact', 'confiance'],
  'coup-de-main': ['competence', 'piste', 'confiance', 'conseil'],
  rencontre: ['conseil', 'contact', 'piste', 'confiance'],
  observer: ['competence', 'conseil', 'piste'],
  atelier: ['competence', 'confiance', 'conseil'],
};
