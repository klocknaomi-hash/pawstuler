/**
 * PAWSTULER PREMIUM (offre payante)
 * Les prix, la durée d'essai et les textes de l'offre sont réglés ici.
 * Le paiement réel passera par l'App Store (via RevenueCat) : voir src/services/abonnement.ts.
 *
 * Positionnement : la version gratuite suffit pour chercher un emploi ;
 * Premium rend l'expérience plus personnelle et plus immersive.
 * Le nom de l'offre ne dépend pas du compagnon choisi.
 */

export const NOM_OFFRE = 'Pawstuler Premium';

/** Durée de l'essai gratuit, réservé à l'abonnement annuel. */
export const JOURS_ESSAI = 7;

export type FormuleId = 'mensuel' | 'annuel';

export type Formule = {
  id: FormuleId;
  libelle: string;
  /** Prix affiché sur la carte. */
  prix: string;
  /** Petite précision sous le prix. */
  detail: string;
  /** Essai gratuit inclus (annuel uniquement). */
  essai: boolean;
  /** Texte du bouton d'achat. */
  bouton: string;
  /** Phrase complète sous le bouton : ce qui sera payé, quand, et le renouvellement. */
  conditions: string;
  /** Identifiant du produit dans App Store Connect (à créer à l'identique). */
  produitAppStore: string;
};

export const FORMULES: Formule[] = [
  {
    id: 'annuel',
    libelle: 'Annuel',
    prix: '39,99 €/an',
    detail: 'Soit 3,33 €/mois',
    essai: true,
    bouton: `Commencer mes ${JOURS_ESSAI} jours gratuits`,
    conditions: `Gratuit pendant ${JOURS_ESSAI} jours, puis 39,99 € par an. L'abonnement se renouvelle automatiquement chaque année. Pour ne rien payer, résilie au moins 24 h avant la fin de l'essai.`,
    produitAppStore: 'pawstuler_premium_annuel',
  },
  {
    id: 'mensuel',
    libelle: 'Mensuel',
    prix: '5,99 €/mois',
    detail: 'Sans essai gratuit',
    essai: false,
    bouton: "M'abonner pour 5,99 €/mois",
    conditions:
      "5,99 € par mois, prélevés dès la confirmation de l'achat. L'abonnement se renouvelle automatiquement chaque mois. Résiliable à tout moment.",
    produitAppStore: 'pawstuler_premium_mensuel',
  },
];

export const formuleParId = (id: FormuleId) => FORMULES.find((f) => f.id === id) ?? FORMULES[0];

/** Prix en euros, pour calculer l'économie de l'annuel. */
export const PRIX_ANNUEL = 39.99;
export const PRIX_MENSUEL = 5.99;
/** Économie de l'annuel par rapport à 12 mois au mensuel, en % arrondi (aujourd'hui : 44 %). */
export const REMISE_ANNUEL = Math.round((1 - PRIX_ANNUEL / (PRIX_MENSUEL * 12)) * 100);

/** En une phrase, ce qui reste gratuit (le détail s'ouvre sur l'écran d'abonnement). */
export const RESUME_GRATUIT = 'Tes tâches, tes candidatures et ton compagnon restent gratuits.';

export const INCLUS_GRATUIT = [
  'Tâches du jour et tâches personnelles',
  'Suivi de toutes tes candidatures',
  'Ton compagnon, sa ville et ta progression',
  'Pièces, Shop et personnalisation de base',
  '1 aventure du jour',
  'Un avant-goût des outils : 5 questions d’entretien, le script et le mail de relance, l’essentiel du CV',
];

/** Ce que Premium ajoute : d'abord l'aide concrète à la recherche d'emploi, puis le compagnon. */
export const INCLUS_PREMIUM = [
  'Préparer un entretien : toutes les questions, ce que le recruteur cherche, des exemples et l’entraînement',
  'Tous les scripts d’appel et modèles de mails, préremplis avec tes candidatures',
  'La checklist CV complète et la méthode pour l’adapter à une offre',
  'Jusqu’à 3 aventures par jour, énergie 100 rechargée en 3 h',
  'Vêtements, accessoires et événements exclusifs',
];

/**
 * OFFRE DE BIENVENUE (non-abonnés uniquement) : l'annuel à −30 % la première année,
 * pendant les 7 jours qui suivent l'inscription. Un petit écran par jour compte les jours restants.
 * Paiement réel : offre promotionnelle App Store à créer sur le produit annuel (via RevenueCat).
 */
export const OFFRE_BIENVENUE = {
  remise: 30,
  jours: 7,
  prix: '27,99 €',
  prixAn: '27,99 €/an',
  /** Prix normal, barré à côté. */
  prixNormal: '39,99 €/an',
} as const;

/** Le petit mot du jour de l'écran d'offre (jour 1 à 7). */
export const MESSAGES_OFFRE: Record<number, { titre: string; texte: string }> = {
  1: { titre: 'Bienvenue 🎁', texte: 'Pour ton arrivée, Premium est à −30 % sur l’annuel pendant 7 jours. Rien ne presse : la version gratuite te suffit pour avancer.' },
  2: { titre: 'Deuxième jour ensemble ✨', texte: 'Tu es revenu ! Avec Premium, ton compagnon peut partir jusqu’à 3 fois par jour à l’aventure.' },
  3: { titre: 'Ça prend forme 🐾', texte: 'Petit à petit, ta recherche s’organise. Premium ajoute des tenues et des événements exclusifs.' },
  4: { titre: 'Mi-parcours 🌿', texte: 'Plus d’énergie, une recharge en 3 h : ton compagnon te suit encore plus souvent.' },
  5: { titre: 'Encore 3 jours ⏳', texte: 'L’offre de bienvenue se termine bientôt. Tes tâches et tes candidatures restent gratuites, quoi qu’il arrive.' },
  6: { titre: 'Avant-dernier jour 💛', texte: 'Merci d’être là chaque jour. Si Premium te tente, c’est le moment d’en profiter à −30 %.' },
  7: { titre: 'Dernier jour 🎁', texte: 'C’est le dernier jour de ton offre de bienvenue. Demain, l’annuel revient à 39,99 €.' },
};

/** Les 4 points forts affichés en haut de l'écran d'abonnement (le détail complet s'ouvre en dessous). */
export const POINTS_FORTS_PREMIUM: { icone: 'mic' | 'mail' | 'compass' | 'shirt'; texte: string }[] = [
  { icone: 'mic', texte: 'Toutes les questions d’entretien' },
  { icone: 'mail', texte: 'Scripts d’appel, mails et checklist CV' },
  { icone: 'compass', texte: 'Jusqu’à 3 aventures par jour' },
  { icone: 'shirt', texte: 'Tenues et événements exclusifs' },
];

/** Mention légale affichée en bas de l'écran d'abonnement (exigée par l'App Store). */
export const MENTION_RENOUVELLEMENT =
  "Le paiement est débité sur ton compte Apple à la confirmation de l'achat ou, pour l'annuel, à la fin de l'essai gratuit. L'abonnement se renouvelle automatiquement au même prix, sauf résiliation au moins 24 h avant la fin de la période en cours. Tu peux gérer ou résilier ton abonnement à tout moment dans Réglages › ton nom › Abonnements. L'essai gratuit n'est proposé qu'une seule fois.";
