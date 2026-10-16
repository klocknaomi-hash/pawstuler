/**
 * LES VILLES
 * Une ville n'est pas un simple fond d'écran : c'est l'univers où le compagnon vit,
 * se déplace, visite des lieux et avance dans sa propre carrière.
 * Les images sont déclarées dans src/illustrations/registre.ts.
 * Chaque lieu visité en aventure offre un souvenir, rangé dans la collection du compagnon.
 */

import type { SecteurId } from '@/config/missions';

export type VilleId = 'clairebourg' | 'sunnyville';
export type Ambiance = 'campagne' | 'urbaine';

/** Un lieu de la ville : un endroit où le compagnon peut aller, et parfois postuler. */
export type Lieu = {
  id: string;
  nom: string;
  metier?: string; // le poste que le compagnon peut y viser
  /** Souvenir rapporté la première fois que le compagnon y vit une aventure. */
  souvenir: { nom: string; emoji: string };
  /** Type de lieu : son nom change d'un jour à l'autre (voir src/config/missions.ts). */
  secteur?: SecteurId;
  /**
   * L'illustration de la ville qui sert de décor à ce lieu (onglet ville, aventure sur place),
   * en attendant une illustration propre à chaque lieu : un paysage du chemin (« chemin-1 »…)
   * ou « ville » (la vue de la ville).
   */
  decor?: string;
};

export type Ville = {
  id: VilleId;
  nom: string;
  ambiance: Ambiance;
  accroche: string;
  couleur: string; // couleur de la carte tant que l'illustration manque
  lieux: Lieu[];
  /** Nom définitif choisi (sinon nom provisoire, à confirmer). */
  nomDefinitif?: boolean;
  /** Où le compagnon va se baigner (« au lac », « à la fontaine »). */
  baignade: { ou: string; icone: string };
};

export const VILLES: Ville[] = [
  {
    id: 'clairebourg',
    nom: 'Clairebourg',
    baignade: { ou: 'au lac', icone: '🏞️' },
    nomDefinitif: true,
    ambiance: 'campagne',
    accroche: 'Une petite ville française, ses chemins fleuris et ses commerces de quartier.',
    couleur: '#A9C68E',
    lieux: [
      { id: 'boulangerie', decor: 'chemin-1', secteur: 'boulangerie', nom: 'Boulangerie Mercier', metier: 'Apprenti boulanger', souvenir: { nom: 'Croissant doré', emoji: '🥐' } },
      { id: 'librairie', decor: 'chemin-2', secteur: 'librairie', nom: 'Librairie des Tilleuls', metier: 'Libraire junior', souvenir: { nom: 'Marque-page', emoji: '📖' } },
      { id: 'studio', decor: 'chemin-3', secteur: 'studio', nom: 'Studio Hibou', metier: 'Aide photographe', souvenir: { nom: 'Photo souvenir', emoji: '📷' } },
      { id: 'agence', decor: 'chemin-2', secteur: 'agence', nom: 'Agence Tamaris', metier: 'Assistant de voyage', souvenir: { nom: 'Carte postale', emoji: '💌' } },
      { id: 'cafe', decor: 'chemin-1', secteur: 'cafe', nom: 'Café du Lac', metier: 'Barista', souvenir: { nom: 'Tasse du Lac', emoji: '☕' } },
      { id: 'parc', decor: 'chemin-4', nom: 'Le parc et son ponton', souvenir: { nom: 'Plume de canard', emoji: '🪶' } },
    ],
  },
  {
    id: 'sunnyville',
    baignade: { ou: 'à la fontaine', icone: '⛲' },
    nom: 'Sunnyville',
    nomDefinitif: true,
    ambiance: 'urbaine',
    accroche: 'La grande ville : ses rues animées, ses bureaux et ses transports.',
    couleur: '#8EC5D6',
    // Lieux provisoires, à affiner avec les illustrations de la ville
    lieux: [
      { id: 'bureaux', decor: 'chemin-1', secteur: 'entreprise', nom: 'Les bureaux du centre', metier: 'Assistant de projet', souvenir: { nom: 'Badge visiteur', emoji: '🪪' } },
      { id: 'startup', decor: 'chemin-1', secteur: 'studio', nom: 'Start-up Pixel', metier: 'Designer junior', souvenir: { nom: 'Autocollant Pixel', emoji: '💡' } },
      { id: 'agence-com', decor: 'chemin-1', secteur: 'agence', nom: 'Agence de communication', metier: 'Chargé de communication', souvenir: { nom: 'Mini mégaphone', emoji: '📣' } },
      { id: 'cafe-metro', decor: 'chemin-1', secteur: 'cafe', nom: 'Le café du métro', metier: 'Barista', souvenir: { nom: 'Ticket de métro', emoji: '🎟️' } },
      { id: 'parc-urbain', decor: 'chemin-1', nom: 'Le parc urbain', souvenir: { nom: 'Tournesol', emoji: '🌻' } },
    ],
  },
];

export const villeParId = (id: VilleId) => VILLES.find((v) => v.id === id) ?? VILLES[0];
