/**
 * ZIGGY+ (offre premium)
 * Les prix et la durée d'essai sont réglés ici. Le paiement réel (App Store) sera branché plus tard.
 * Positionnement : la version gratuite suffit pour chercher un emploi ;
 * Ziggy+ rend l'expérience plus personnelle et plus immersive.
 */

export const JOURS_ESSAI = 7;

export type FormuleId = 'mensuel' | 'annuel';

export const FORMULES: { id: FormuleId; libelle: string; prix: string; apresEssai: string; detail?: string }[] = [
  { id: 'annuel', libelle: 'Annuel', prix: '39,99 €/an', apresEssai: '39,99 €/an après l’essai', detail: 'Soit 3,33 €/mois' },
  { id: 'mensuel', libelle: 'Mensuel', prix: '5,99 €/mois', apresEssai: '5,99 €/mois après l’essai' },
];

export const INCLUS_GRATUIT = [
  'Tâches du jour et tâches personnelles',
  'Suivi de toutes tes candidatures',
  'Ton compagnon, ses pièces et sa ville',
  'Boutique et personnalisation de base',
];

export const INCLUS_ZIGGY_PLUS = [
  'Animations et interactions en plus avec ton compagnon',
  'Vêtements, accessoires et événements exclusifs',
  'Plus de lieux et d’histoires dans ta ville',
  'Recommandations personnalisées et analyses de ton parcours',
  'Aide avancée pour ton CV, tes offres et tes entretiens',
];

export const MENTION_RENOUVELLEMENT =
  "L'abonnement se renouvelle automatiquement à la fin de l'essai, selon les conditions de l'App Store, sauf si tu le résilies au moins 24 h avant. Tu peux le résilier à tout moment dans les réglages de ton compte Apple.";
