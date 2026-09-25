/**
 * LES VILLES
 * Une ville n'est pas un simple fond d'écran : c'est l'univers où le compagnon vit,
 * se déplace, visite des lieux et avance dans sa propre carrière.
 * Les images sont déclarées dans src/assets/registre.ts.
 */

export type VilleId = 'clairebourg' | 'les-tilleuls' | 'grand-havre' | 'neuvelle';
export type Ambiance = 'campagne' | 'urbaine';

/** Un lieu de la ville : un endroit où le compagnon peut aller, et parfois postuler. */
export type Lieu = {
  id: string;
  nom: string;
  metier?: string; // le poste que le compagnon peut y viser
};

export type Ville = {
  id: VilleId;
  nom: string;
  ambiance: Ambiance;
  accroche: string;
  couleur: string; // couleur de la carte tant que l'illustration manque
  lieux: Lieu[];
};

export const VILLES: Ville[] = [
  {
    id: 'clairebourg',
    nom: 'Clairebourg',
    ambiance: 'campagne',
    accroche: 'Un lac, des chemins fleuris et des petits commerces.',
    couleur: '#A9C68E',
    lieux: [
      { id: 'boulangerie', nom: 'Boulangerie Mercier', metier: 'Apprenti boulanger' },
      { id: 'librairie', nom: 'Librairie des Tilleuls', metier: 'Libraire junior' },
      { id: 'studio', nom: 'Studio Hibou', metier: 'Aide photographe' },
      { id: 'agence', nom: 'Agence Tamaris', metier: 'Assistant de voyage' },
      { id: 'ponton', nom: 'Le ponton du lac' },
    ],
  },
  {
    id: 'les-tilleuls',
    nom: 'Les Tilleuls',
    ambiance: 'campagne',
    accroche: 'Une petite ville de périphérie, calme et verte.',
    couleur: '#C9D9A0',
    lieux: [
      { id: 'marche', nom: 'Le marché couvert', metier: 'Vendeur' },
      { id: 'jardinerie', nom: 'La jardinerie', metier: 'Conseiller' },
      { id: 'mairie', nom: 'La mairie', metier: 'Agent d’accueil' },
    ],
  },
  {
    id: 'grand-havre',
    nom: 'Grand-Havre',
    ambiance: 'urbaine',
    accroche: 'Une ville portuaire, ses quais, ses bureaux et son tram.',
    couleur: '#8EC5D6',
    lieux: [
      { id: 'port', nom: 'Les bureaux du port', metier: 'Assistant logistique' },
      { id: 'tram', nom: 'Le dépôt du tram', metier: 'Technicien' },
      { id: 'agence-com', nom: 'Agence Marée Haute', metier: 'Chargé de communication' },
    ],
  },
  {
    id: 'neuvelle',
    nom: 'Neuvelle',
    ambiance: 'urbaine',
    accroche: 'La grande ville : tours, métro et start-up.',
    couleur: '#B9AEDC',
    lieux: [
      { id: 'tour', nom: 'La tour Horizon', metier: 'Analyste junior' },
      { id: 'startup', nom: 'Start-up Pixel', metier: 'Designer' },
      { id: 'cafe', nom: 'Le café du métro', metier: 'Barista' },
    ],
  },
];

export const villeParId = (id: VilleId) => VILLES.find((v) => v.id === id) ?? VILLES[0];
