/**
 * Couleurs, tailles et espacements de l'app, en un seul endroit.
 * Palette provisoire : chaleureuse et calme, jamais « appli de rencontre »
 * (pas de rouge passion, pas de cœurs). À ajuster avec l'identité visuelle.
 */
export const couleurs = {
  fond: '#FFF8F1', // crème
  carte: '#FFFFFF',
  texte: '#2B2420', // brun très foncé, plus doux que le noir
  texteDoux: '#7A6E66',
  accent: '#F2784B', // corail chaleureux : boutons principaux
  accentClair: '#FDE3D6',
  sauge: '#7C9A86', // confiance, sécurité
  saugeClair: '#E3ECE5',
  bordure: '#EFE4DA',
};

export const espaces = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

export const rayons = {
  carte: 20,
  bouton: 16,
  pastille: 999,
};

export const textes = {
  titre: { fontSize: 30, fontWeight: '800' as const, color: couleurs.texte },
  sousTitre: { fontSize: 17, lineHeight: 24, color: couleurs.texteDoux },
  corps: { fontSize: 16, lineHeight: 22, color: couleurs.texte },
  petit: { fontSize: 13, color: couleurs.texteDoux },
};
