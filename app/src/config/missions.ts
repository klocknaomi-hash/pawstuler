/**
 * LES AVENTURES DE MILO (système miroir)
 * Milo vit SA propre recherche d'emploi dans SA ville : il explore, découvre des lieux et y dépose
 * son CV (ses candidatures à lui, sans lien avec tes entreprises). Le seul lien avec toi, c'est
 * le rythme des nouvelles, avec un peu de décalage : il ne fait jamais la même chose que toi au même moment.
 *   - 40 candidatures = 40 candidatures enregistrées, pas 40 aventures : Milo part au plus
 *     1 fois par jour (gratuit), ou 3 fois par jour avec 3 h entre deux départs (Premium).
 *   - Ton entretien du 28 → Milo reçoit une demande d'entretien le lendemain de ta saisie,
 *     et passe le sien 2 jours après le tien (le 30), à une heure précise.
 *   - Ta relance, ton refus → Milo relance, ou reçoit sa réponse, le lendemain.
 *   - Tes nouvelles font avancer UNE de ses candidatures à lui : s'il a déposé son CV à la Boulangerie
 *     du Lac, c'est là qu'il relance et passe son entretien.
 *   - Une aventure lancée ne change jamais, même si tu mets ensuite une candidature à jour.
 *
 * Tout se règle ici : durées, coûts, pièces, décalages, et les textes. Dans les textes :
 * {nom} = compagnon, {lieu} = lieu, {metier} = poste, {personne}/{Personne} = la personne du lieu,
 * {raison} = ce que tu as noté après un refus, {Il}/{il}/{lui}/{e} = accords selon les pronoms.
 */

export type TypeMission = 'recherche' | 'depot' | 'relance' | 'entretien' | 'refus' | 'travail' | 'repos' | 'baignade';

/** Les petits moments pour souffler (pas des aventures : ni pièces, ni quota du jour). */
export type TypeMoment = 'repos' | 'baignade';
export const MOMENTS: TypeMoment[] = ['repos', 'baignade'];

/** Durée de chaque aventure, en minutes (le temps pendant lequel le compagnon est occupé). */
export const DUREES_MINUTES: Record<TypeMission, number> = {
  recherche: 10,
  depot: 5,
  relance: 5,
  entretien: 15,
  refus: 3,
  travail: 30,
  repos: 10,
  baignade: 2,
};

/** Énergie dépensée au départ. */
export const COUTS_MISSION: Record<TypeMission, number> = {
  recherche: 10,
  depot: 10,
  relance: 10,
  entretien: 15,
  refus: 5,
  travail: 20,
  repos: 0,
  baignade: 5,
};

/** Pièces rapportées (dans le plafond du jour). Un refus rapporte aussi : on récompense l'effort. */
export const PIECES_MISSION: Record<TypeMission, number> = {
  recherche: 10,
  depot: 5,
  relance: 5,
  entretien: 5,
  refus: 5,
  travail: 10,
  repos: 0,
  baignade: 0,
};

/** Premium : 3 aventures par jour au plus, avec ce délai minimum entre deux départs (indépendant de l'énergie). */
export const HEURES_ENTRE_AVENTURES_PREMIUM = 3;

/** Le décalage entre ta recherche et celle de Milo, en jours. */
export const DECALAGE_JOURS = {
  /** Milo apprend qu'il a un entretien le lendemain du jour où tu enregistres le tien. */
  annonceEntretien: 1,
  /** Milo passe son entretien 2 jours après la date du tien. */
  entretien: 2,
  /** Milo relance le lendemain de ta relance (faite ou prévue). */
  relance: 1,
  /** Milo reçoit sa réponse le lendemain de ton refus (après son propre entretien, s'il en avait un). */
  refus: 1,
};

/** Relances proposées dans le formulaire : dans 1, 3 ou 5 jours après l'envoi. */
export const DELAIS_RELANCE = [1, 3, 5];

/** L'heure de l'entretien de Milo est tirée dans cette fenêtre, après son réveil (en heures). */
export const FENETRE_ENTRETIEN = { apresReveil: 2, duree: 4 };

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

/** Titre de l'aventure (carte « Aventure du jour », écran de l'aventure). */
export const TITRES: Record<TypeMission, string> = {
  recherche: '{nom} part chercher une nouvelle opportunité',
  depot: '{nom} part déposer son CV chez {lieu}',
  relance: '{nom} appelle {lieu} pour avoir des nouvelles',
  entretien: '{nom} part à son entretien chez {lieu}',
  refus: '{nom} a reçu une réponse de {lieu}',
  travail: '{nom} part travailler chez {lieu}',
  repos: '{nom} rentre se reposer à la maison',
  baignade: '{nom} va se baigner {lieu}',
};

/** Variante « découvrir une entreprise » de la recherche, un jour sur deux. */
export const TITRE_DECOUVERTE = '{nom} part découvrir {lieu}';

/** Où est le compagnon pendant l'aventure. */
export const OU_EST: Record<TypeMission, string> = {
  recherche: '{nom} est chez {lieu}',
  depot: '{nom} est chez {lieu}',
  relance: '{nom} est au téléphone',
  entretien: '{nom} est en entretien chez {lieu}',
  refus: '{nom} lit un message',
  travail: '{nom} est chez {lieu}',
  repos: '{nom} est à la maison',
  baignade: '{nom} est {lieu}',
};

/** Carte verte « Aventure du jour » : ce qu'il va faire (avant de partir). {cout} = énergie. */
export const CARTE_DISPONIBLE: Record<TypeMission, string> = {
  recherche: '{cout} ⚡ · {nom} explore {ville}',
  depot: '{cout} ⚡ · {nom} explore {ville}',
  relance: '{cout} ⚡ · {nom} a un appel à passer',
  entretien: '{cout} ⚡ · {nom} part à son entretien',
  refus: '{cout} ⚡ · {nom} a reçu une réponse',
  travail: '{cout} ⚡ · {nom} part travailler',
  repos: '{nom} peut se reposer',
  baignade: '{nom} peut aller se baigner',
};

/** Carte verte « Aventure du jour » : ce qu'il fait pendant qu'il est parti (sans heure : elle est déjà dans la scène). */
export const CARTE_PARTI: Record<TypeMission, string> = {
  recherche: '{nom} est allé{e} découvrir {lieu}',
  depot: '{nom} est allé{e} déposer son CV chez {lieu}',
  relance: '{nom} est au téléphone avec {lieu}',
  entretien: '{nom} est en entretien chez {lieu}',
  refus: '{nom} lit un message de {lieu}',
  travail: '{nom} est au travail chez {lieu}',
  repos: '{nom} se repose à la maison',
  baignade: '{nom} est allé{e} se baigner {lieu}',
};

/** Présentation, avant le départ. */
export const PRESENTATIONS: Record<TypeMission, string> = {
  recherche: '{nom} a envie de découvrir de nouvelles opportunités dans sa ville.',
  depot: '{nom} a repéré une annonce chez {lieu} pour un poste de {metier}. Il est temps d’aller déposer son CV !',
  relance: 'Ça fait quelques jours que {nom} a postulé chez {lieu}. {Il} prend son téléphone pour demander des nouvelles.',
  entretien: 'C’est le grand jour : {nom} a rendez-vous chez {lieu} pour le poste de {metier}.',
  refus: '{nom} a reçu un message de {lieu} au sujet de sa candidature.',
  travail: 'Une nouvelle journée commence pour {nom} dans son nouveau poste.',
  repos: 'Chercher un emploi, ça fatigue aussi les compagnons. {nom} rentre souffler un peu dans sa petite maison.',
  baignade: 'Il fait bon aujourd’hui : {nom} file se rafraîchir {lieu}.',
};

/** Bouton de départ. */
export const BOUTON_DEPART: Record<TypeMission, string> = {
  recherche: 'Envoyer {nom}',
  depot: 'Envoyer {nom}',
  relance: 'Appeler',
  entretien: 'Bonne chance, {nom} !',
  refus: 'Lire le message',
  travail: 'Envoyer {nom}',
  repos: 'Bonne sieste, {nom} !',
  baignade: 'Allez, plouf !',
};

/**
 * Résultats (un est tiré au départ, dévoilé au retour). Jamais de refus décidé tout seul :
 * Milo ne reçoit un refus que si toi tu en as reçu un (il suit ton vrai parcours, avec un jour de décalage).
 */
export const RESULTATS: Record<Exclude<TypeMission, 'recherche' | 'travail' | 'refus' | 'entretien'>, string[]> = {
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
    '{nom} a donné son CV à {personne} et a pris le temps de présenter son parcours. {Personne} a trouvé son profil intéressant.',
    '{nom} a déposé son CV chez {lieu}. {Personne} lui a conseillé de rappeler dans quelques jours.',
    '{nom} a pu échanger quelques minutes avec {personne}, qui lui a parlé du poste de {metier}. Rien n’est joué, mais {il} est ressorti{e} avec le sourire.',
  ],
  relance: [
    '{nom} a appelé {lieu}. {Personne} se souvenait de son CV : la candidature est toujours à l’étude.',
    'Au téléphone, {personne} a dit à {nom} qu’une réponse arriverait bientôt. {Il} a bien fait d’appeler !',
    '{nom} a pris des nouvelles de sa candidature chez {lieu}. {Personne} a noté son nom en haut de la pile.',
  ],
};

/** Entretien : le récit dépend de sa tenue. */
export const RESULTATS_ENTRETIEN = {
  avecTenue: [
    '{nom} est arrivé{e} chez {lieu} dans sa belle tenue. Un peu de trac au début, puis {il} a raconté son parcours avec le sourire. {Personne} doit encore réfléchir.',
    'Bien habillé{e} et bien préparé{e}, {nom} a passé son entretien pour le poste de {metier}. {Personne} a apprécié sa motivation.',
  ],
  sansTenue: [
    '{nom} a passé son entretien chez {lieu} dans sa tenue de tous les jours. {Il} a donné le meilleur de {lui}-même… {Personne} doit encore réfléchir.',
    '{nom} a raconté son parcours chez {lieu}. En voyant les autres candidats bien habillés, {il} s’est dit qu’une tenue l’aurait aidé{e} à se sentir plus sûr{e} de {lui}.',
  ],
};

/**
 * Refus : Milo regarde son téléphone, est déçu quelques secondes, puis repart.
 * La raison vient de sa tenue (s'il est allé en entretien sans), sinon de ce que tu as noté
 * après ton propre refus (pour penser à t'améliorer), sinon un message simple.
 */
export const RESULTATS_REFUS = {
  sansTenue: '{Personne} de {lieu} a répondu : ce ne sera pas pour cette fois. {Personne} a glissé que sa tenue n’était pas vraiment adaptée à un entretien. {nom} est un peu déçu{e}… puis se promet d’avoir une belle tenue la prochaine fois !',
  avecRaison: '{Personne} de {lieu} a répondu : ce ne sera pas pour cette fois. {Personne} lui a expliqué pourquoi : « {raison} ». {nom} est un peu déçu{e}, puis le note pour s’améliorer. On repart !',
  simple: [
    '{Personne} de {lieu} a répondu : ce ne sera pas pour cette fois. {nom} est un peu déçu{e} quelques secondes… puis reprend son chemin. Leur perte !',
    'Pas retenu{e} chez {lieu} cette fois. {nom} range son téléphone, prend une grande inspiration et repart. Chaque « non » veut dire qu’on a osé.',
  ],
};

/** Petits messages de l'entretien de Milo (accueil et notifications). {jour} et {heure} sont remplis. */
export const ANNONCES_ENTRETIEN = {
  annonce: '📩 {nom} a reçu une demande d’entretien chez {lieu} ! Rendez-vous {jour} à {heure}.',
  veille: '👔 Demain, {nom} a un entretien ! {Il} aurait bien besoin d’une tenue pour l’occasion…',
  veillePret: '📅 Demain, {nom} a un entretien chez {lieu}. {Il} a déjà sa tenue, {il} est prêt{e} !',
  jour: '👔 {nom} a un entretien aujourd’hui à {heure} ! Tu crois qu’{il} est prêt{e} ?',
};

/** Ce que le compagnon emporte avec lui (visible pendant le départ et le trajet). */
export const OBJET_EMPORTE: Record<TypeMission, string> = {
  recherche: '🗺️',
  depot: '📄',
  relance: '📱',
  entretien: '📁',
  refus: '📱',
  travail: '💼',
  repos: '🧸',
  baignade: '🛟',
};

/** Petite animation sur place, pendant qu'il est à l'intérieur (une par type). */
export const ANIMATION_SUR_PLACE: Record<TypeMission, string[]> = {
  recherche: ['🔎', '👀'],
  depot: ['📄', '🤝'],
  relance: ['📞', '💬'],
  entretien: ['💬', '✨'],
  refus: ['💧', '🌱'],
  travail: ['💼', '⭐'],
  repos: ['💤', '☕'],
  baignade: ['💦', '🫧'],
};
