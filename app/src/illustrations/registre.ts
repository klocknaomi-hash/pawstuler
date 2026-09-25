/**
 * REGISTRE DES ILLUSTRATIONS
 * Le seul endroit qui relie les fichiers images à l'app.
 *
 * Pour remplacer une image : déposer le nouveau fichier dans /assets et changer la ligne ici.
 * Pour ajouter un animal ou une ville : ajouter ses images dans le bloc correspondant.
 * Tant qu'une image manque, l'app affiche un visuel de secours (emoji + couleur de la config).
 *
 * Animations : quand les animations définitives (Lottie ou Rive) seront prêtes, on les
 * déclarera dans ANIMATIONS avec les mêmes clés ; le composant <Compagnon> les utilisera
 * à la place des images fixes, sans rien changer dans les écrans.
 */
import type { ImageSourcePropType } from 'react-native';

import type { EspeceId, Pose } from '@/config/compagnons';
import type { VilleId } from '@/config/villes';

type Images<K extends string> = Partial<Record<K, ImageSourcePropType>>;

/** Illustrations des compagnons, par animal puis par pose. */
const COMPAGNONS: Record<EspeceId, Images<Pose>> = {
  renard: {
    salut: require('../../assets/compagnons/renard/salut.png'),
    neutre: require('../../assets/compagnons/renard/neutre.png'),
    content: require('../../assets/compagnons/renard/content.png'),
    excite: require('../../assets/compagnons/renard/excite.png'),
    dort: require('../../assets/compagnons/renard/dort.png'),
    reconfort: require('../../assets/compagnons/renard/reconfort.png'),
    fier: require('../../assets/compagnons/renard/fier.png'),
    aventure: require('../../assets/compagnons/renard/aventure.png'),
    celebration: require('../../assets/compagnons/renard/celebration.png'),
  },
  chat: {},
  crocodile: {},
  lapin: {},
};

/** Les états de l'œuf. Les 3 premiers sont communs à tous les animaux. */
const OEUF = {
  etats: [
    require('../../assets/oeufs/oeuf-1-intact.png'),
    require('../../assets/oeufs/oeuf-2-fissure.png'),
    require('../../assets/oeufs/oeuf-3-craquele.png'),
  ] as ImageSourcePropType[],
  /** L'animal qui sort de l'œuf (propre à chaque animal). */
  eclosion: {
    renard: require('../../assets/oeufs/renard-eclosion.png'),
  } as Images<EspeceId>,
  /** L'animal juste né, au milieu des coquilles. */
  ne: {
    renard: require('../../assets/oeufs/renard-ne.png'),
  } as Images<EspeceId>,
};

/** Illustrations des villes : « portrait » pour l'accueil, « paysage » pour les cartes. */
const VILLES: Record<VilleId, Images<'portrait' | 'paysage'>> = {
  clairebourg: {
    portrait: require('../../assets/villes/clairebourg/portrait.jpg'),
    paysage: require('../../assets/villes/clairebourg/paysage.jpg'),
  },
  sunnyville: {},
};

/** Objets de la boutique, par id (voir src/config/boutique.ts). */
const BOUTIQUE: Images<string> = {};

/* ---------- Fonctions utilisées par les écrans ---------- */

/** Image d'un compagnon dans une pose ; retombe sur « neutre », puis sur rien. */
export function imageCompagnon(espece: EspeceId, pose: Pose): ImageSourcePropType | undefined {
  const images = COMPAGNONS[espece];
  return images[pose] ?? images.neutre;
}

export const imagesOeuf = () => OEUF.etats;
export const imageEclosion = (espece: EspeceId) => OEUF.eclosion[espece];
export const imageNaissance = (espece: EspeceId) => OEUF.ne[espece] ?? imageCompagnon(espece, 'salut');
export const imageVille = (ville: VilleId, format: 'portrait' | 'paysage') =>
  VILLES[ville][format] ?? VILLES[ville].portrait ?? VILLES[ville].paysage;
export const imageObjet = (id: string) => BOUTIQUE[id];
