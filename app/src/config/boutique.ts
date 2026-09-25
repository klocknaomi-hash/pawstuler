/**
 * CATALOGUE DE LA BOUTIQUE
 * Les pièces se gagnent uniquement en faisant ses tâches : elles ne s'achètent jamais.
 * Les images sont déclarées dans src/illustrations/registre.ts : le chat a déjà sa garde-robe
 * (assets/tenues/chat), les autres animaux l'auront au fur et à mesure des illustrations.
 */
import type { EspeceId } from '@/config/compagnons';

export type TypeObjet = 'chapeau' | 'haut' | 'bas' | 'chaussures' | 'tenue' | 'accessoire' | 'objet';

export type ObjetBoutique = {
  id: string;
  nom: string;
  type: TypeObjet;
  prix: number;
  emoji: string; // visuel de secours tant que l'illustration n'est pas fournie
  offert?: boolean; // cadeau de bienvenue
  premium?: boolean; // réservé à Pawstuler Premium
  /**
   * Vêtement porté sur le compagnon. Chaque illustration montre le compagnon habillé en entier :
   * il porte donc un seul vêtement à la fois (en mettre un autre remplace le précédent).
   */
  habit?: boolean;
  /** Proposé seulement à ces animaux (ceux dont l'illustration existe). Absent = tous. */
  especes?: EspeceId[];
};

export const LIBELLES_TYPES: Record<TypeObjet, string> = {
  tenue: 'Tenues',
  haut: 'Hauts',
  bas: 'Bas',
  chaussures: 'Chaussures',
  chapeau: 'Chapeaux',
  accessoire: 'Accessoires',
  objet: 'Objets',
};

/** Raccourci pour les vêtements illustrés du chat (images dans assets/tenues/chat). */
const chat = (id: string, nom: string, type: TypeObjet, prix: number, emoji: string, premium?: boolean): ObjetBoutique => ({
  id,
  nom,
  type,
  prix,
  emoji,
  habit: true,
  especes: ['chat'],
  ...(premium ? { premium } : {}),
});

export const CATALOGUE_BOUTIQUE: ObjetBoutique[] = [
  /* ---------- Pour tous les compagnons ---------- */
  { id: 'echarpe', nom: 'Écharpe de bienvenue', type: 'accessoire', prix: 0, emoji: '🧣', offert: true, habit: true },
  { id: 'beret', nom: 'Béret', type: 'chapeau', prix: 40, emoji: '🧢', habit: true },
  { id: 'lunettes', nom: 'Lunettes rondes', type: 'accessoire', prix: 30, emoji: '👓' },
  { id: 'cravate', nom: 'Cravate du lundi', type: 'accessoire', prix: 60, emoji: '👔', habit: true },
  { id: 'sac', nom: "Sac à dos d'alternant", type: 'accessoire', prix: 80, emoji: '🎒' },
  { id: 'badge', nom: "Badge d'entreprise", type: 'accessoire', prix: 50, emoji: '🪪' },
  { id: 'plante', nom: 'Petite plante', type: 'objet', prix: 25, emoji: '🪴' },
  { id: 'tasse', nom: 'Tasse de café', type: 'objet', prix: 20, emoji: '☕' },
  { id: 'couronne', nom: 'Couronne des victoires', type: 'chapeau', prix: 150, emoji: '👑', premium: true },

  /* ---------- Garde-robe du chat ---------- */
  // Hauts
  chat('tshirt-blanc', 'T-shirt blanc', 'haut', 25, '👕'),
  chat('pull-rouge', 'Pull rouge', 'haut', 40, '🧶'),
  chat('sweat-capuche', 'Sweat à capuche', 'haut', 45, '🧥'),
  chat('chemise-bleue', 'Chemise bleue', 'haut', 40, '👔'),
  chat('gilet-camel', 'Gilet camel', 'haut', 45, '🧥'),
  chat('veste-tailleur', 'Veste de tailleur', 'haut', 60, '🧥'),
  chat('manteau-fourre', 'Manteau fourré', 'haut', 70, '🧥'),
  chat('cire-jaune', 'Ciré jaune', 'haut', 50, '🧥'),
  // Bas
  chat('short-jean', 'Short en jean', 'bas', 25, '🩳'),
  chat('pantalon-chino', 'Pantalon chino', 'bas', 35, '👖'),
  chat('jean', 'Jean', 'bas', 35, '👖'),
  chat('jogging', 'Jogging', 'bas', 30, '👖'),
  chat('petite-jupe', 'Petite jupe', 'bas', 30, '👗'),
  chat('pantalon-hiver', "Pantalon d'hiver", 'bas', 40, '👖'),
  // Chaussures
  chat('baskets', 'Baskets', 'chaussures', 30, '👟'),
  chat('baskets-toile', 'Baskets en toile', 'chaussures', 30, '👟'),
  chat('bottes-cuir', 'Bottes en cuir', 'chaussures', 45, '🥾'),
  chat('bottes-pluie', 'Bottes de pluie', 'chaussures', 35, '🥾'),
  chat('bottines', 'Bottines', 'chaussures', 40, '🥾'),
  chat('chaussons', 'Chaussons', 'chaussures', 20, '🥿'),
  chat('sandales', 'Sandales', 'chaussures', 25, '🩴'),
  // Chapeaux
  chat('casquette', 'Casquette', 'chapeau', 30, '🧢'),
  chat('bonnet', 'Bonnet', 'chapeau', 30, '🧶'),
  chat('chapeau-paille', 'Chapeau de paille', 'chapeau', 35, '👒'),
  chat('bob-jaune', 'Bob jaune', 'chapeau', 30, '👒'),
  chat('chapeau-melon', 'Chapeau melon', 'chapeau', 45, '🎩'),
  chat('chapeau-sorcier', 'Chapeau de sorcier', 'chapeau', 50, '🧙', true),
  chat('bonnet-noel', 'Bonnet de Noël', 'chapeau', 40, '🎅', true),
  // Accessoires
  chat('bandana', 'Bandana', 'accessoire', 20, '🧣'),
  chat('noeud-papillon', 'Nœud papillon', 'accessoire', 25, '🎀'),
  // Tenues complètes
  chat('pyjama', 'Pyjama rayé', 'tenue', 50, '😴'),
  chat('survetement', 'Survêtement', 'tenue', 60, '🏃'),
  chat('tshirt-short', 'T-shirt et short', 'tenue', 50, '👕'),
  chat('robe-pois', 'Robe à pois', 'tenue', 60, '👗'),
  chat('veste-rouge', 'Veste rouge', 'tenue', 70, '🧥'),
  chat('duffle-coat', 'Duffle-coat', 'tenue', 80, '🧥'),
  chat('gilet-vert', 'Gilet vert', 'tenue', 60, '🧥'),
  chat('pull-jacquard', 'Pull jacquard', 'tenue', 70, '🧶'),
  chat('gilet-beige', 'Gilet beige', 'tenue', 60, '🧥'),
  chat('cire-capuche', 'Ciré à capuche', 'tenue', 60, '☔'),
  chat('chemise-cravate', 'Chemise et cravate', 'tenue', 80, '👔'),
  chat('costume', 'Costume', 'tenue', 120, '🤵'),
  chat('blouse-blanche', 'Blouse blanche', 'tenue', 90, '🩺'),
  chat('veste-chef', 'Veste de chef', 'tenue', 90, '🧑‍🍳'),
  chat('tenue-printemps', 'Tenue de printemps', 'tenue', 80, '🌷'),
  chat('tenue-ete', "Tenue d'été", 'tenue', 80, '🕶️'),
  chat('tenue-automne', "Tenue d'automne", 'tenue', 80, '🍂'),
  chat('tenue-hiver', "Tenue d'hiver", 'tenue', 90, '❄️'),
  chat('maillot-bain', 'Maillot de bain', 'tenue', 50, '👙'),
  // Événements (Premium)
  chat('costume-sorcier', 'Costume de sorcier', 'tenue', 100, '🎃', true),
  chat('tenue-noel', 'Tenue de Noël', 'tenue', 100, '🎄', true),
  chat('robe-saint-valentin', 'Robe de la Saint-Valentin', 'tenue', 100, '💝', true),
];

/** Objets visibles dans le Shop pour cet animal. */
export const catalogueDe = (espece: EspeceId) => CATALOGUE_BOUTIQUE.filter((o) => !o.especes || o.especes.includes(espece));

export const objetParId = (id: string) => CATALOGUE_BOUTIQUE.find((o) => o.id === id);
