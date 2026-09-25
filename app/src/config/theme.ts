/**
 * THÈME PAWSTULER
 * Toutes les couleurs, polices, tailles et espacements de l'app sont ici (CLAUDE.md §7).
 * Pour changer l'identité visuelle, on ne modifie que ce fichier.
 * Palette mesurée sur les illustrations de Ziggy et de Clairebourg.
 */
import { Platform } from 'react-native';

export const couleurs = {
  // Fonds
  creme: '#FFF6EC', // ventre de Ziggy : fond principal
  carte: '#FFFFFF',
  pecheClair: '#FDE4D7',

  // Ziggy
  saumon: '#F2906B', // pelage : couleur de la marque
  renardFonce: '#C4583A', // boutons et liens (lisible sur fond clair)

  // Textes
  brun: '#5E3A2C', // contour de Ziggy : texte principal
  brunDoux: '#8A6B5E',

  // Nature (décor)
  sauge: '#A9C68E',
  saugeClair: '#EAF1DF',
  saugeFonce: '#557A45',
  lac: '#8EC5D6',
  lacClair: '#E1F1F5',
  ciel: '#CFE8EA',

  // Récompenses
  or: '#F4B63F', // pièces
  orClair: '#FFF1CF',
  corail: '#FF4F5E', // réservé aux grandes victoires (entretien, poste décroché)
  corailClair: '#FFE2E4',

  // Divers
  ligne: '#EEDCCB',
  danger: '#B3261E',
  blanc: '#FFFFFF',
  noir: '#1C1410',
} as const;

export const polices = {
  // Police arrondie du système (SF Pro Rounded sur iPhone)
  titre: Platform.select({ ios: 'ui-rounded', default: undefined }),
  texte: Platform.select({ ios: 'ui-rounded', default: undefined }),
} as const;

export const tailles = {
  petit: 13,
  texte: 16,
  moyen: 18,
  titre: 26,
  grandTitre: 32,
} as const;

export const espace = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
} as const;

export const arrondis = {
  s: 10,
  m: 16,
  l: 24,
  rond: 999,
} as const;

export const ombre = {
  shadowColor: '#5E3A2C',
  shadowOpacity: 0.1,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
} as const;
