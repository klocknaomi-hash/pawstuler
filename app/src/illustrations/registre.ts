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
  chat: {
    salut: require('../../assets/compagnons/chat/salut.png'),
    neutre: require('../../assets/compagnons/chat/neutre.png'),
    content: require('../../assets/compagnons/chat/content.png'),
    excite: require('../../assets/compagnons/chat/excite.png'),
    dort: require('../../assets/compagnons/chat/dort.png'),
    reconfort: require('../../assets/compagnons/chat/reconfort.png'),
    fier: require('../../assets/compagnons/chat/fier.png'),
    aventure: require('../../assets/compagnons/chat/aventure.png'),
    celebration: require('../../assets/compagnons/chat/celebration.png'),
  },
  crocodile: {
    salut: require('../../assets/compagnons/crocodile/salut.png'),
    neutre: require('../../assets/compagnons/crocodile/neutre.png'),
    content: require('../../assets/compagnons/crocodile/content.png'),
    excite: require('../../assets/compagnons/crocodile/excite.png'),
    dort: require('../../assets/compagnons/crocodile/dort.png'),
    reconfort: require('../../assets/compagnons/crocodile/reconfort.png'),
    fier: require('../../assets/compagnons/crocodile/fier.png'),
    aventure: require('../../assets/compagnons/crocodile/aventure.png'),
    celebration: require('../../assets/compagnons/crocodile/celebration.png'),
  },
  lapin: {
    salut: require('../../assets/compagnons/lapin/salut.png'),
    neutre: require('../../assets/compagnons/lapin/neutre.png'),
    content: require('../../assets/compagnons/lapin/content.png'),
    excite: require('../../assets/compagnons/lapin/excite.png'),
    dort: require('../../assets/compagnons/lapin/dort.png'),
    reconfort: require('../../assets/compagnons/lapin/reconfort.png'),
    fier: require('../../assets/compagnons/lapin/fier.png'),
    aventure: require('../../assets/compagnons/lapin/aventure.png'),
    celebration: require('../../assets/compagnons/lapin/celebration.png'),
  },
};

/**
 * L'œuf de chaque animal : 3 états à toucher (intact → fissuré → craquelé),
 * puis l'éclosion (l'animal sort la tête) et la naissance (au milieu des coquilles).
 */
type Oeuf = { etats: ImageSourcePropType[]; eclosion?: ImageSourcePropType; ne?: ImageSourcePropType };
const OEUFS: Record<EspeceId, Oeuf> = {
  renard: {
    etats: [
      require('../../assets/oeufs/renard-1-intact.png'),
      require('../../assets/oeufs/renard-2-fissure.png'),
      require('../../assets/oeufs/renard-3-craquele.png'),
    ],
    eclosion: require('../../assets/oeufs/renard-eclosion.png'),
    ne: require('../../assets/oeufs/renard-ne.png'),
  },
  chat: {
    etats: [
      require('../../assets/oeufs/chat-1-intact.png'),
      require('../../assets/oeufs/chat-2-fissure.png'),
      require('../../assets/oeufs/chat-3-craquele.png'),
    ],
    eclosion: require('../../assets/oeufs/chat-eclosion.png'),
    ne: require('../../assets/oeufs/chat-ne.png'),
  },
  crocodile: {
    etats: [
      require('../../assets/oeufs/crocodile-1-intact.png'),
      require('../../assets/oeufs/crocodile-2-fissure.png'),
      require('../../assets/oeufs/crocodile-3-craquele.png'),
    ],
    eclosion: require('../../assets/oeufs/crocodile-eclosion.png'),
    ne: require('../../assets/oeufs/crocodile-ne.png'),
  },
  lapin: {
    etats: [
      require('../../assets/oeufs/lapin-1-intact.png'),
      require('../../assets/oeufs/lapin-2-fissure.png'),
      require('../../assets/oeufs/lapin-3-craquele.png'),
    ],
    eclosion: require('../../assets/oeufs/lapin-eclosion.png'),
    ne: require('../../assets/oeufs/lapin-ne.png'),
  },
};

/**
 * Illustrations des villes :
 * « portrait » pour l'accueil, « paysage » pour les cartes, « centre » pour l'onglet de la ville.
 */
type FormatVille = 'portrait' | 'paysage' | 'centre';
const VILLES: Record<VilleId, Images<FormatVille>> = {
  clairebourg: {
    portrait: require('../../assets/villes/clairebourg/portrait.jpg'),
    paysage: require('../../assets/villes/clairebourg/paysage.jpg'),
    centre: require('../../assets/villes/clairebourg/centre.jpg'),
  },
  sunnyville: {
    portrait: require('../../assets/villes/sunnyville/portrait.jpg'),
    paysage: require('../../assets/villes/sunnyville/paysage.jpg'),
  },
};

/** Objets de la boutique, par id (voir src/config/boutique.ts). */
const BOUTIQUE: Images<string> = {};

/* ---------- Fonctions utilisées par les écrans ---------- */

/** Image d'un compagnon dans une pose ; retombe sur « neutre », puis sur rien. */
export function imageCompagnon(espece: EspeceId, pose: Pose): ImageSourcePropType | undefined {
  const images = COMPAGNONS[espece];
  return images[pose] ?? images.neutre;
}

/** Les états de l'œuf à toucher ; un animal sans œuf dessiné emprunte celui du renard. */
export const imagesOeuf = (espece: EspeceId) => (OEUFS[espece].etats.length ? OEUFS[espece] : OEUFS.renard).etats;
export const imageEclosion = (espece: EspeceId) => OEUFS[espece].eclosion;
export const imageNaissance = (espece: EspeceId) => OEUFS[espece].ne ?? imageCompagnon(espece, 'salut');
/** Image d'une ville ; si le format demandé manque, on prend le plus proche. */
export const imageVille = (ville: VilleId, format: FormatVille) =>
  VILLES[ville][format] ?? VILLES[ville].portrait ?? VILLES[ville].paysage;
export const imageObjet = (id: string) => BOUTIQUE[id];
