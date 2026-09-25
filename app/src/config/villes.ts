/**
 * LES VILLES
 * Une ville n'est pas un simple fond d'écran : c'est l'univers où le compagnon vit,
 * se déplace, visite des lieux et avance dans sa propre carrière.
 * Les images sont déclarées dans src/illustrations/registre.ts.
 * Chaque lieu visité en aventure offre un souvenir, rangé dans la collection du compagnon.
 */

export type VilleId = 'clairebourg' | 'sunnyville';
export type Ambiance = 'campagne' | 'urbaine';

/** Un lieu de la ville : un endroit où le compagnon peut aller, et parfois postuler. */
export type Lieu = {
  id: string;
  nom: string;
  metier?: string; // le poste que le compagnon peut y viser
  /** Souvenir rapporté la première fois que le compagnon y vit une aventure. */
  souvenir: { nom: string; emoji: string };
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
};

export const VILLES: Ville[] = [
  {
    id: 'clairebourg',
    nom: 'Clairebourg',
    nomDefinitif: true,
    ambiance: 'campagne',
    accroche: 'Une petite ville française, son lac, ses chemins fleuris et ses commerces.',
    couleur: '#A9C68E',
    lieux: [
      { id: 'boulangerie', nom: 'Boulangerie Mercier', metier: 'Apprenti boulanger', souvenir: { nom: 'Croissant doré', emoji: '🥐' } },
      { id: 'librairie', nom: 'Librairie des Tilleuls', metier: 'Libraire junior', souvenir: { nom: 'Marque-page', emoji: '📖' } },
      { id: 'studio', nom: 'Studio Hibou', metier: 'Aide photographe', souvenir: { nom: 'Photo souvenir', emoji: '📷' } },
      { id: 'agence', nom: 'Agence Tamaris', metier: 'Assistant de voyage', souvenir: { nom: 'Carte postale', emoji: '🗺️' } },
      { id: 'cafe', nom: 'Café du Lac', metier: 'Barista', souvenir: { nom: 'Tasse du Lac', emoji: '☕' } },
      { id: 'parc', nom: 'Le parc et son ponton', souvenir: { nom: 'Plume de canard', emoji: '🪶' } },
    ],
  },
  {
    id: 'sunnyville',
    nom: 'Sunnyville',
    nomDefinitif: true,
    ambiance: 'urbaine',
    accroche: 'La grande ville : ses rues animées, ses bureaux et ses transports.',
    couleur: '#8EC5D6',
    // Lieux provisoires, à affiner avec les illustrations de la ville
    lieux: [
      { id: 'bureaux', nom: 'Les bureaux du centre', metier: 'Assistant de projet', souvenir: { nom: 'Badge visiteur', emoji: '🪪' } },
      { id: 'startup', nom: 'Start-up Pixel', metier: 'Designer junior', souvenir: { nom: 'Autocollant Pixel', emoji: '💡' } },
      { id: 'agence-com', nom: 'Agence de communication', metier: 'Chargé de communication', souvenir: { nom: 'Mini mégaphone', emoji: '📣' } },
      { id: 'cafe-metro', nom: 'Le café du métro', metier: 'Barista', souvenir: { nom: 'Ticket de métro', emoji: '🎟️' } },
      { id: 'parc-urbain', nom: 'Le parc urbain', souvenir: { nom: 'Tournesol', emoji: '🌻' } },
    ],
  },
];

export const villeParId = (id: VilleId) => VILLES.find((v) => v.id === id) ?? VILLES[0];
