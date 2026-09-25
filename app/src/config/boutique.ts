/**
 * CATALOGUE DE LA BOUTIQUE
 * Les pièces se gagnent uniquement en faisant ses tâches : elles ne s'achètent jamais.
 * Les images des objets seront déclarées dans src/assets/registre.ts (fournies avec Dimini).
 */

export type TypeObjet = 'chapeau' | 'vetement' | 'accessoire' | 'objet';

export type ObjetBoutique = {
  id: string;
  nom: string;
  type: TypeObjet;
  prix: number;
  emoji: string; // visuel de secours tant que l'illustration n'est pas fournie
  offert?: boolean; // cadeau de bienvenue
  premium?: boolean; // réservé à Ziggy+
};

export const LIBELLES_TYPES: Record<TypeObjet, string> = {
  chapeau: 'Chapeaux',
  vetement: 'Vêtements',
  accessoire: 'Accessoires',
  objet: 'Objets',
};

export const CATALOGUE_BOUTIQUE: ObjetBoutique[] = [
  { id: 'echarpe', nom: 'Écharpe de bienvenue', type: 'vetement', prix: 0, emoji: '🧣', offert: true },
  { id: 'beret', nom: 'Béret', type: 'chapeau', prix: 40, emoji: '🧢' },
  { id: 'lunettes', nom: 'Lunettes rondes', type: 'accessoire', prix: 30, emoji: '👓' },
  { id: 'cravate', nom: 'Cravate du lundi', type: 'vetement', prix: 60, emoji: '👔' },
  { id: 'sac', nom: "Sac à dos d'alternant", type: 'accessoire', prix: 80, emoji: '🎒' },
  { id: 'badge', nom: "Badge d'entreprise", type: 'accessoire', prix: 50, emoji: '🪪' },
  { id: 'plante', nom: 'Petite plante', type: 'objet', prix: 25, emoji: '🪴' },
  { id: 'tasse', nom: 'Tasse de café', type: 'objet', prix: 20, emoji: '☕' },
  { id: 'couronne', nom: 'Couronne des victoires', type: 'chapeau', prix: 150, emoji: '👑', premium: true },
];
