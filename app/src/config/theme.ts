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
  ligne: '#EBD3BE', // contours des cartes et des champs (assez marqués pour bien dessiner les formes)
  relief: '#E2C3A6', // bord du bas des cartes « autocollant »
  renardRelief: '#9C4128', // bord du bas des boutons orange (effet bouton qu'on enfonce)
  // Bouton qu'on ne peut pas encore utiliser (champs obligatoires vides…)
  desactive: '#DAD5D0',
  texteDesactive: '#8E8781',
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

/**
 * Fonds pastel par catégorie de tâche (avec un emoji) : chaque carte a sa couleur, pour une
 * liste plus vivante sans changer la palette de la marque.
 */
export const pastels = {
  preparer: { fond: '#FFE9DA', emoji: '📝' },
  chercher: { fond: '#E1F1F5', emoji: '🔎' },
  candidater: { fond: '#DCEBFF', emoji: '📮' },
  relancer: { fond: '#FFF1CF', emoji: '📞' },
  reseau: { fond: '#EEE7FB', emoji: '🤝' },
  entretien: { fond: '#FFE2E4', emoji: '👔' },
  moral: { fond: '#E3F5EC', emoji: '🌿' },
  integration: { fond: '#E1F1F5', emoji: '🏢' },
  progression: { fond: '#EEE7FB', emoji: '📈' },
  perso: { fond: '#FDE4D7', emoji: '⭐' },
} as const;

/** Barre d'onglets flottante : elle laisse cette place en bas des écrans à onglets. */
export const barreOnglets = { hauteur: 68, marge: 10 } as const;

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
  shadowOpacity: 0.12,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
} as const;

/**
 * Effet « autocollant » des cartes : un contour net et un bord du bas un peu plus épais,
 * comme une carte posée sur la page. À mettre sur les cartes qu'on peut toucher.
 */
export const relief = {
  borderWidth: 1.5,
  borderColor: '#EBD3BE',
  borderBottomWidth: 4,
  borderBottomColor: '#E2C3A6',
} as const;
