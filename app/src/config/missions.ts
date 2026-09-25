/**
 * LES MISSIONS DU COMPAGNON (système miroir)
 * Tes actions (candidature, relance, entretien…) créent des missions pour ton compagnon :
 * il part déposer son CV, demander des nouvelles, passer un entretien… en temps réel.
 * Les durées sont celles du compagnon : c'est lui qui est occupé, pas toi.
 *
 * Tout se règle ici : durées, coûts, pièces, secteurs (reconnaissance, lieux, métiers),
 * et les textes. Dans les textes : {nom} = compagnon, {lieu} = lieu, {metier} = poste,
 * {personne}/{Personne} = la personne du lieu, {Il}/{il}/{lui}/{e} = accords selon les pronoms.
 */

export type TypeMission = 'depot' | 'relance' | 'entretien' | 'recherche' | 'travail' | 'repos' | 'baignade';

/** Les petits moments pour souffler (pas des missions de recherche : ni pièces, ni limite par jour). */
export type TypeMoment = 'repos' | 'baignade';
export const MOMENTS: TypeMoment[] = ['repos', 'baignade'];

/** Durée de chaque mission, en minutes (le temps pendant lequel le compagnon est absent). */
export const DUREES_MINUTES: Record<TypeMission, number> = {
  depot: 5,
  relance: 5,
  entretien: 15,
  recherche: 10,
  travail: 30,
  repos: 10,
  baignade: 2,
};

/** Énergie dépensée au départ de la mission. */
export const COUTS_MISSION: Record<TypeMission, number> = {
  depot: 10,
  relance: 10,
  entretien: 15,
  recherche: 10,
  travail: 20,
  repos: 0,
  baignade: 5,
};

/** Pièces rapportées (dans le plafond du jour). La recherche garde les 10 pièces de l'ancienne « Aventure du jour ». */
export const PIECES_MISSION: Record<TypeMission, number> = {
  depot: 5,
  relance: 5,
  entretien: 5,
  recherche: 10,
  travail: 10,
  repos: 0,
  baignade: 0,
};

/** Au plus 2 missions « miroir » prévues par jour : les autres sont étalées sur les jours suivants. */
export const MISSIONS_PAR_JOUR = 2;

/** Une candidature enregistrée plus de 7 jours après son envoi ne crée pas de mission de dépôt (reprise d'un tableau). */
export const JOURS_MAX_DEPOT = 7;

/** Nombre de candidatures en 7 jours qui déclenche la « grande tournée » du compagnon. */
export const CANDIDATURES_GRANDE_TOURNEE = 5;

/* ---------- Secteurs : reconnaître le type de lieu à partir de l'entreprise et du poste ---------- */

export type SecteurId =
  | 'boulangerie'
  | 'cafe'
  | 'librairie'
  | 'restaurant'
  | 'hotel'
  | 'ecole'
  | 'sport'
  | 'boutique'
  | 'studio'
  | 'agence'
  | 'atelier'
  | 'entreprise';

export type Secteur = {
  icone: string;
  /** La personne que le compagnon rencontre sur place. */
  personne: string;
  /** Mots qui permettent de reconnaître le secteur (entreprise + poste, en minuscules). */
  motsCles: string[];
  /** Noms qui changent d'un jour à l'autre pour les lieux de la ville ({ville} = nom de la ville). */
  noms: string[];
  /** Métiers cohérents avec ce lieu. */
  metiers: string[];
};

export const SECTEURS: Record<SecteurId, Secteur> = {
  boulangerie: {
    icone: '🥐',
    personne: 'la boulangère',
    motsCles: ['boulang', 'pâtiss', 'patiss', 'fournil', 'viennois', 'pain'],
    noms: ['Boulangerie Mercier', 'Boulangerie du Lac', 'Le Fournil de {ville}', 'Boulangerie des Lilas', 'Au Pain Doré'],
    metiers: ['Vendeur en boulangerie', 'Apprenti boulanger', 'Pâtissier', 'Assistant de gestion'],
  },
  cafe: {
    icone: '☕',
    personne: 'le barista',
    motsCles: ['café', 'cafe', 'coffee', 'barista', 'salon de thé', 'bar '],
    noms: ['Café du Lac', 'Café des Lilas', 'Le Petit Café', 'Café Central', 'Le Comptoir'],
    metiers: ['Barista', 'Serveur', 'Responsable de salle', 'Chargé de communication'],
  },
  librairie: {
    icone: '📚',
    personne: 'la libraire',
    motsCles: ['librair', 'livre', 'édition', 'edition', 'bibliothè'],
    noms: ['Librairie des Tilleuls', 'La Page Blanche', 'Librairie du Marché', 'Mots & Merveilles'],
    metiers: ['Libraire', 'Vendeur', 'Assistant événementiel', 'Chargé de communication'],
  },
  restaurant: {
    icone: '🍽️',
    personne: 'le chef',
    motsCles: ['restaurant', 'brasserie', 'cuisin', 'chef', 'serveu', 'traiteur', 'bistro'],
    noms: ['Le Bistrot du Coin', 'La Table de {ville}', 'Chez Margot', 'Le Petit Jardin'],
    metiers: ['Commis de cuisine', 'Serveur', 'Chef de rang', 'Responsable de salle'],
  },
  hotel: {
    icone: '🏨',
    personne: 'la réceptionniste',
    motsCles: ['hôtel', 'hotel', 'réception', 'reception', 'hébergement', 'tourisme'],
    noms: ['Hôtel du Parc', 'Hôtel des Voyageurs', 'La Maison d’Hôtes', 'Hôtel Belle Vue'],
    metiers: ['Réceptionniste', 'Agent d’accueil', 'Gouvernant', 'Assistant de direction'],
  },
  ecole: {
    icone: '🏫',
    personne: 'la directrice',
    motsCles: ['école', 'ecole', 'lycée', 'lycee', 'collège', 'college', 'universit', 'enseign', 'professeur', 'crèche', 'creche', 'formation', 'animat'],
    noms: ['École des Tilleuls', 'Collège du Lac', 'Centre de formation', 'La Petite Crèche'],
    metiers: ['Assistant pédagogique', 'Animateur', 'Surveillant', 'Chargé d’accueil'],
  },
  sport: {
    icone: '🏋️',
    personne: 'le coach',
    motsCles: ['sport', 'fitness', 'gym', 'coach', 'piscine', 'club'],
    noms: ['Salle Tonus', 'Club des Sports', 'Fit & Zen', 'La Piscine municipale'],
    metiers: ['Coach sportif', 'Agent d’accueil', 'Animateur sportif', 'Chargé de communication'],
  },
  boutique: {
    icone: '🛍️',
    personne: 'la gérante',
    motsCles: ['boutique', 'magasin', 'vente', 'vendeu', 'retail', 'commerce', 'mode', 'prêt-à-porter', 'fleur'],
    noms: ['Boutique Lila', 'Le Petit Marché', 'Maison Capucine', 'L’Atelier des Fleurs'],
    metiers: ['Vendeur', 'Conseiller de vente', 'Responsable de rayon', 'Assistant de gestion'],
  },
  studio: {
    icone: '📷',
    personne: 'le photographe',
    motsCles: ['studio', 'photo', 'vidéo', 'video', 'design', 'graphi', 'créati', 'creati', 'audiovisuel'],
    noms: ['Studio Hibou', 'Studio Lumière', 'Atelier Pixel', 'Studio Ardoise'],
    metiers: ['Aide photographe', 'Graphiste junior', 'Monteur vidéo', 'Chargé de projet'],
  },
  agence: {
    icone: '💼',
    personne: 'la responsable',
    motsCles: ['agence', 'communication', 'marketing', 'publicité', 'publicite', 'voyage', 'événement', 'evenement', 'immobili', 'recrutement', 'intérim', 'interim'],
    noms: ['Agence Tamaris', 'Agence du Centre', 'Agence Horizon', 'Agence Pétale'],
    metiers: ['Chargé de communication', 'Assistant commercial', 'Chef de projet junior', 'Conseiller'],
  },
  atelier: {
    icone: '🔧',
    personne: 'l’artisan',
    motsCles: ['atelier', 'artisan', 'menuis', 'couture', 'garage', 'mécan', 'mecan', 'électric', 'electric', 'plomb', 'bâtiment', 'batiment', 'chantier'],
    noms: ['L’Atelier du Bois', 'Garage des Tilleuls', 'Atelier Couture', 'Les Artisans Réunis'],
    metiers: ['Apprenti artisan', 'Assistant d’atelier', 'Technicien', 'Chargé d’accueil'],
  },
  entreprise: {
    icone: '🏢',
    personne: 'la recruteuse',
    motsCles: [],
    noms: ['Les bureaux du centre', 'La Tour Lumière', 'Espace Horizon', 'Le Campus'],
    metiers: ['Assistant de projet', 'Chargé de clientèle', 'Assistant administratif', 'Chargé de communication'],
  },
};

/* ---------- Textes ---------- */

/** Titre de la mission, tel qu'on le voit dans l'« Aventure du jour ». */
export const TITRES: Record<TypeMission, string> = {
  depot: '{nom} doit déposer son CV chez {lieu}',
  relance: '{nom} retourne chez {lieu} demander des nouvelles',
  entretien: '{nom} a {lui} aussi décroché un entretien chez {lieu} !',
  recherche: '{nom} part explorer {ville}',
  travail: '{nom} part travailler chez {lieu}',
  repos: '{nom} rentre se reposer à la maison',
  baignade: '{nom} va se baigner {lieu}',
};

/** Où est le compagnon pendant la mission (accueil, écran de mission). */
export const OU_EST: Record<TypeMission, string> = {
  depot: '{nom} est chez {lieu}',
  relance: '{nom} est chez {lieu}',
  entretien: '{nom} est chez {lieu}',
  recherche: '{nom} est chez {lieu}',
  travail: '{nom} est chez {lieu}',
  repos: '{nom} est à la maison',
  baignade: '{nom} est {lieu}',
};

/** Bouton de départ. */
export const BOUTON_DEPART: Record<TypeMission, string> = {
  depot: 'Envoyer {nom}',
  relance: 'Envoyer {nom}',
  entretien: 'Envoyer {nom}',
  recherche: 'Envoyer {nom}',
  travail: 'Envoyer {nom}',
  repos: 'Bonne sieste, {nom} !',
  baignade: 'Allez, plouf !',
};

/** Ce que le compagnon emporte avec lui (visible pendant le départ et le trajet). */
export const OBJET_EMPORTE: Record<TypeMission, string> = {
  depot: '📄',
  relance: '✉️',
  entretien: '👔',
  recherche: '🗺️',
  travail: '💼',
  repos: '🧸',
  baignade: '🛟',
};

/** Petite animation sur place, pendant qu'il est à l'intérieur (une par type). */
export const ANIMATION_SUR_PLACE: Record<TypeMission, string[]> = {
  depot: ['📄', '🤝'],
  relance: ['✉️', '☎️'],
  entretien: ['💬', '✨'],
  recherche: ['🔎', '👀'],
  travail: ['💼', '⭐'],
  repos: ['💤', '☕'],
  baignade: ['💦', '🫧'],
};

/** Présentation de la mission, avant le départ. */
export const PRESENTATIONS: Record<TypeMission, string> = {
  depot: '{nom} a repéré une opportunité chez {lieu}. Mission : aller déposer son CV pour le poste de {metier}.',
  relance: 'Tu as relancé ta candidature : {nom} retourne chez {lieu} pour demander des nouvelles de son CV.',
  entretien: 'Tu as un entretien ? {nom} aussi ! {Il} se prépare pour son entretien de {metier} chez {lieu}.',
  recherche: '{nom} a envie de découvrir de nouvelles opportunités dans sa ville.',
  travail: 'Une nouvelle journée commence pour {nom} dans son nouveau poste.',
  repos: 'Chercher un emploi, ça fatigue aussi les compagnons. {nom} rentre souffler un peu dans sa petite maison.',
  baignade: 'Il fait bon aujourd’hui : {nom} file se rafraîchir {lieu}.',
};

/** Ce que fait le compagnon pendant son absence. */
export const PENDANT: Record<TypeMission, string> = {
  depot: '{nom} est chez {lieu} : {il} dépose son CV.',
  relance: '{nom} est chez {lieu} : {il} demande des nouvelles.',
  entretien: '{nom} est en entretien chez {lieu}.',
  recherche: '{nom} explore {ville}.',
  travail: '{nom} est au travail chez {lieu}.',
  repos: '{nom} se repose tranquillement à la maison.',
  baignade: '{nom} barbote {lieu}.',
};

/** Journal : départ de la mission. */
export const JOURNAL_DEPART: Record<TypeMission, string> = {
  depot: '{nom} est allé{e} déposer son CV chez {lieu}.',
  relance: '{nom} est retourné{e} demander des nouvelles chez {lieu}.',
  entretien: '{nom} a passé un entretien chez {lieu}.',
  recherche: '{nom} est parti{e} explorer {ville}.',
  travail: '{nom} est allé{e} travailler chez {lieu}.',
  repos: '{nom} est rentré{e} se reposer à la maison.',
  baignade: '{nom} est allé{e} se baigner {lieu}.',
};

/**
 * Résultats possibles (un est tiré au départ, dévoilé au retour). Jamais de refus décidé tout seul :
 * le compagnon ne connaît un refus que si toi tu en reçois un (il suit ton vrai parcours).
 */
export const RESULTATS: Record<Exclude<TypeMission, 'recherche' | 'travail'>, string[]> = {
  repos: [
    '{nom} a fait une petite sieste au soleil. {Il} se sent tout{e} reposé{e} !',
    '{nom} a bu un chocolat chaud sous un plaid en repensant à sa semaine. Ça fait du bien de souffler.',
    '{nom} a arrosé ses plantes et rangé sa petite maison. {Il} est prêt{e} pour la suite.',
  ],
  baignade: [
    '{nom} a fait la planche {lieu} en regardant les nuages. Plouf !',
    '{nom} s’est bien rafraîchi{e} {lieu}, et a éclaboussé un canard (sans le faire exprès).',
    '{nom} a nagé quelques longueurs {lieu}. {Il} revient tout{e} ébouriffé{e} et de bonne humeur.',
  ],
  depot: [
    '{nom} a donné son CV à {personne} et a pris le temps de présenter son parcours. {Personne} a trouvé son profil intéressant et pourrait recontacter {nom} prochainement.',
    '{nom} a déposé son CV chez {lieu}. {Personne} lui a conseillé de repasser dans quelques jours pour prendre des nouvelles.',
    '{nom} a pu échanger quelques minutes avec {personne}, qui lui a parlé du poste de {metier}. Rien n’est joué, mais {il} est ressorti{e} avec le sourire.',
  ],
  relance: [
    '{nom} est retourné{e} chez {lieu}. {Personne} se souvenait de son CV : la candidature est toujours à l’étude.',
    'Chez {lieu}, on a dit à {nom} qu’une réponse arriverait bientôt. {Il} a bien fait de repasser !',
    '{nom} a pris des nouvelles chez {lieu}. {Personne} a noté son nom en haut de la pile.',
  ],
  entretien: [
    '{nom} a passé son entretien pour le poste de {metier}. Un peu de trac au début, puis {il} a raconté son parcours avec le sourire. L’équipe doit encore réfléchir.',
    'L’entretien de {nom} chez {lieu} s’est très bien passé : {personne} a apprécié sa motivation et souhaite poursuivre les échanges.',
    '{nom} est ressorti{e} de son entretien chez {lieu} plein{e} d’énergie. {Personne} lui a posé plein de questions sur ses projets : bon signe !',
  ],
};

/** Journal : événements miroir déclenchés par tes réponses. */
export const JOURNAL_REFUS = '{nom} n’a pas été retenu{e} chez {lieu} cette fois. {Il} garde le sourire : on continue ensemble.';
export const JOURNAL_DECROCHE = '🎉 Tu as décroché chez {lieu} : {nom} a décroché un poste {lui} aussi !';
export const TITRE_GRANDE_TOURNEE = 'Grande tournée : {nom} explore toute la ville';
export const PRESENTATION_GRANDE_TOURNEE = '5 candidatures cette semaine, bravo ! Pour fêter ça, {nom} part faire le tour de {ville} à la recherche de nouvelles opportunités.';
