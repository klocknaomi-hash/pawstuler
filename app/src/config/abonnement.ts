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

export const INCLUS_GRATUIT = [
  'Tâches du jour et tâches personnelles',
  'Suivi de toutes tes candidatures',
  'Ton compagnon, sa ville et ta progression',
  'Pièces, Shop et personnalisation de base',
  '1 aventure du jour',
];

export const INCLUS_PREMIUM = [
  'Jusqu’à 3 aventures par jour et plus d’interactions avec ton compagnon',
  'Animations supplémentaires et personnalisation avancée',
  'Vêtements, accessoires et événements exclusifs',
  'Plus de lieux et d’histoires dans ta ville',
  'Recommandations personnalisées et analyses de ton parcours',
  'Aide avancée pour ton CV, tes offres et tes entretiens',
];

/** Mention légale affichée en bas de l'écran d'abonnement (exigée par l'App Store). */
export const MENTION_RENOUVELLEMENT =
  "Le paiement est débité sur ton compte Apple à la confirmation de l'achat ou, pour l'annuel, à la fin de l'essai gratuit. L'abonnement se renouvelle automatiquement au même prix, sauf résiliation au moins 24 h avant la fin de la période en cours. Tu peux gérer ou résilier ton abonnement à tout moment dans Réglages › ton nom › Abonnements. L'essai gratuit n'est proposé qu'une seule fois.";
