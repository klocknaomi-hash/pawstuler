/**
 * LA CHAMBRE DU COMPAGNON (une par ville)
 * Une chambre vide (porte / fenêtre seulement) que l'on remplit avec les objets du rayon
 * « Chambre » du Shop. Chaque objet se pose sur un emplacement fixe : simple et toujours joli.
 * Positions en % de l'illustration (x : centre de l'objet ; y : bas de l'objet, là où il est posé).
 * Pour ajuster une place, il suffit de changer ses chiffres ici.
 */
import type { VilleId } from './villes';

/** Ce qu'on peut poser à un endroit : au mur, un petit objet (rebord, devant la baie), au sol, ou un tapis. */
export type TypeEmplacement = 'mur' | 'petit' | 'sol' | 'tapis';

export type Emplacement = {
  id: string;
  type: TypeEmplacement;
  libelle: string;
  x: number;
  y: number;
};

/** Les mêmes emplacements (mêmes noms) dans chaque ville, placés selon son illustration. */
export const CHAMBRES: Record<VilleId, { ratio: number; emplacements: Emplacement[]; compagnon: { x: number; y: number } }> = {
  // Image carrée : mur du fond jusqu'à 63 %, fenêtre au centre (rebord vers 44 %)
  clairebourg: {
    ratio: 1,
    compagnon: { x: 50, y: 96 },
    emplacements: [
      { id: 'mur-g', type: 'mur', libelle: 'Mur, à gauche', x: 20, y: 40 },
      { id: 'mur-d', type: 'mur', libelle: 'Mur, à droite', x: 80, y: 40 },
      { id: 'petit', type: 'petit', libelle: 'Rebord de la fenêtre', x: 50, y: 43 },
      { id: 'sol-g', type: 'sol', libelle: 'Sol, à gauche', x: 19, y: 76 },
      { id: 'sol-d', type: 'sol', libelle: 'Sol, à droite', x: 81, y: 76 },
      { id: 'tapis', type: 'tapis', libelle: 'Tapis', x: 50, y: 92 },
    ],
  },
  // Image en largeur : murs sur les côtés, grande baie vitrée au fond, parquet à partir de 72 %
  sunnyville: {
    ratio: 1200 / 896,
    compagnon: { x: 50, y: 97 },
    emplacements: [
      { id: 'mur-g', type: 'mur', libelle: 'Mur, à gauche', x: 10, y: 50 },
      { id: 'mur-d', type: 'mur', libelle: 'Mur, à droite', x: 90, y: 50 },
      { id: 'petit', type: 'petit', libelle: 'Devant la baie vitrée', x: 32, y: 73 },
      { id: 'sol-g', type: 'sol', libelle: 'Sol, à gauche', x: 14, y: 86 },
      { id: 'sol-d', type: 'sol', libelle: 'Sol, à droite', x: 86, y: 86 },
      { id: 'tapis', type: 'tapis', libelle: 'Tapis', x: 50, y: 94 },
    ],
  },
};

/** Taille de l'objet affiché, en % de la largeur de la chambre, selon l'emplacement. */
export const TAILLE_OBJET: Record<TypeEmplacement, number> = { mur: 13, petit: 9, sol: 17, tapis: 46 };

export const LIBELLES_EMPLACEMENTS: Record<TypeEmplacement, string> = {
  mur: 'Au mur',
  petit: 'Petits objets',
  sol: 'Au sol',
  tapis: 'Tapis',
};
