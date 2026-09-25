/**
 * CATALOGUE DE LA BOUTIQUE
 * Les pièces se gagnent uniquement en faisant ses tâches : elles ne s'achètent jamais.
 * Rayon « Tenues complètes » : chaque illustration montre le compagnon habillé en entier
 * (assets/tenues/<animal>). Le chat et le crocodile ont leur garde-robe ; les autres
 * animaux l'auront au fur et à mesure. Rayon « Objets » : les autres objets.
 * La liste réellement visible pour un animal est calculée par src/logique/garderobe.ts.
 */

export type TypeObjet = 'tenue' | 'saison' | 'haut' | 'bas' | 'chaussures' | 'chapeau' | 'cou' | 'accessoire' | 'objet';

export type ObjetBoutique = {
  id: string;
  nom: string;
  type: TypeObjet;
  prix: number;
  emoji: string; // visuel de secours tant que l'illustration n'est pas fournie
  offert?: boolean; // cadeau de bienvenue
  premium?: boolean; // réservé à Pawstuler Premium
  /**
   * Collection d'événement (Halloween, Noël…). Une collection est Premium **en entier** :
   * tenue, chapeau, chaussures, accessoires. Les utilisateurs gratuits la voient avec 🔒.
   */
  collection?: Collection;
  /**
   * « Tenue complète » : une illustration montre le compagnon habillé en entier.
   * Il en porte donc une seule à la fois (en mettre une autre remplace la précédente).
   */
  habit?: boolean;
  /**
   * Proposé seulement aux animaux qui ont l'illustration correspondante
   * (déclarée dans src/illustrations/registre.ts, dossier assets/tenues/<animal>).
   */
  illustre?: boolean;
};

export type Collection = 'halloween' | 'noel' | 'saint-valentin' | 'thanksgiving';

export const COLLECTIONS: Record<Collection, string> = {
  halloween: '🎃 Halloween',
  noel: '🎄 Noël',
  'saint-valentin': '💕 Saint-Valentin',
  thanksgiving: '🦃 Thanksgiving',
};

/** Réservé à Premium : objet marqué Premium ou faisant partie d'une collection d'événement. */
export const estPremium = (o: ObjetBoutique) => Boolean(o.premium || o.collection);

/** Les deux rayons du Shop. */
export const RAYONS = { tenues: 'Tenues complètes', objets: 'Objets' } as const;

/** Catégories à l'intérieur du rayon « Tenues complètes ». */
export const LIBELLES_TYPES: Record<TypeObjet, string> = {
  tenue: 'Tenues',
  saison: 'Saisons et fêtes',
  haut: 'Hauts',
  bas: 'Bas',
  chaussures: 'Chaussures',
  chapeau: 'Chapeaux',
  cou: 'Autour du cou',
  accessoire: 'Accessoires',
  objet: 'Objets',
};

/** Raccourci pour une tenue illustrée (images dans assets/tenues/<animal>/<id>.png). */
const illustre = (id: string, nom: string, type: TypeObjet, prix: number, emoji: string, collection?: Collection): ObjetBoutique => ({
  id,
  nom,
  type,
  prix,
  emoji,
  habit: true,
  illustre: true,
  ...(collection ? { collection } : {}),
});

export const CATALOGUE_BOUTIQUE: ObjetBoutique[] = [
  /* ---------- Pour tous les compagnons (illustrés pour le chat et le crocodile) ---------- */
  { id: 'echarpe', nom: 'Écharpe de bienvenue', type: 'cou', prix: 0, emoji: '🧣', offert: true, habit: true },
  { id: 'beret', nom: 'Béret', type: 'chapeau', prix: 40, emoji: '🧢', habit: true },
  { id: 'cravate', nom: 'Cravate du lundi', type: 'cou', prix: 60, emoji: '👔', habit: true },

  /* ---------- Objets ---------- */
  { id: 'lunettes', nom: 'Lunettes rondes', type: 'accessoire', prix: 30, emoji: '👓' },
  { id: 'sac', nom: "Sac à dos d'alternant", type: 'accessoire', prix: 80, emoji: '🎒' },
  { id: 'badge', nom: "Badge d'entreprise", type: 'accessoire', prix: 50, emoji: '🪪' },
  { id: 'plante', nom: 'Petite plante', type: 'objet', prix: 25, emoji: '🪴' },
  { id: 'tasse', nom: 'Tasse de café', type: 'objet', prix: 20, emoji: '☕' },
  { id: 'couronne', nom: 'Couronne des victoires', type: 'chapeau', prix: 150, emoji: '👑', premium: true },

  /* ---------- Tenues complètes illustrées (chat, crocodile ; les autres animaux arrivent) ---------- */
  // Hauts
  illustre('tshirt-blanc', 'T-shirt blanc', 'haut', 25, '👕'),
  illustre('pull-rouge', 'Pull rouge', 'haut', 40, '🧶'),
  illustre('sweat-capuche', 'Sweat à capuche', 'haut', 45, '🧥'),
  illustre('chemise-bleue', 'Chemise bleue', 'haut', 40, '👔'),
  illustre('gilet-camel', 'Gilet camel', 'haut', 45, '🧥'),
  illustre('veste-tailleur', 'Veste de tailleur', 'haut', 60, '🧥'),
  illustre('manteau-fourre', 'Manteau fourré', 'haut', 70, '🧥'),
  illustre('cire-jaune', 'Ciré jaune', 'haut', 50, '🧥'),
  // Bas
  illustre('short-jean', 'Short en jean', 'bas', 25, '🩳'),
  illustre('pantalon-chino', 'Pantalon chino', 'bas', 35, '👖'),
  illustre('jean', 'Jean', 'bas', 35, '👖'),
  illustre('jogging', 'Jogging', 'bas', 30, '👖'),
  illustre('petite-jupe', 'Petite jupe', 'bas', 30, '👗'),
  illustre('pantalon-hiver', 'Pantalon d\'hiver', 'bas', 40, '👖'),
  illustre('pantalon-cargo', 'Pantalon cargo', 'bas', 40, '👖'),
  illustre('short-bain', 'Short de bain', 'bas', 25, '🩳'),
  illustre('bermuda', 'Bermuda à motifs', 'bas', 30, '🩳'),
  // Chaussures
  illustre('baskets', 'Baskets', 'chaussures', 30, '👟'),
  illustre('baskets-toile', 'Baskets en toile', 'chaussures', 30, '👟'),
  illustre('bottes-cuir', 'Bottes en cuir', 'chaussures', 45, '🥾'),
  illustre('bottes-pluie', 'Bottes de pluie', 'chaussures', 35, '🥾'),
  illustre('bottines', 'Bottines', 'chaussures', 40, '🥾'),
  illustre('chaussons', 'Chaussons', 'chaussures', 20, '🥿'),
  illustre('sandales', 'Sandales', 'chaussures', 25, '🩴'),
  // Chapeaux
  illustre('casquette', 'Casquette', 'chapeau', 30, '🧢'),
  illustre('bonnet', 'Bonnet', 'chapeau', 30, '🧶'),
  illustre('chapeau-paille', 'Chapeau de paille', 'chapeau', 35, '👒'),
  illustre('bob-jaune', 'Bob jaune', 'chapeau', 30, '👒'),
  illustre('chapeau-melon', 'Chapeau melon', 'chapeau', 45, '🎩'),
  // Autour du cou
  illustre('bandana', 'Bandana', 'cou', 20, '🧣'),
  illustre('noeud-papillon', 'Nœud papillon', 'cou', 25, '🎀'),
  illustre('echarpe-marron', 'Écharpe marron', 'cou', 25, '🧣'),
  illustre('noeud-bordeaux', 'Nœud bordeaux', 'cou', 25, '🎀'),
  illustre('cravate-grise', 'Cravate grise', 'cou', 40, '👔'),
  // Tenues
  illustre('pyjama', 'Pyjama rayé', 'tenue', 50, '😴'),
  illustre('survetement', 'Survêtement', 'tenue', 60, '🏃'),
  illustre('tshirt-short', 'T-shirt et short', 'tenue', 50, '👕'),
  illustre('robe-pois', 'Robe à pois', 'tenue', 60, '👗'),
  illustre('robe-rose', 'Robe rose', 'tenue', 60, '👗'),
  illustre('veste-rouge', 'Veste rouge', 'tenue', 70, '🧥'),
  illustre('duffle-coat', 'Duffle-coat', 'tenue', 80, '🧥'),
  illustre('doudoune', 'Doudoune', 'tenue', 80, '🧥'),
  illustre('gilet-vert', 'Gilet vert', 'tenue', 60, '🧥'),
  illustre('pull-jacquard', 'Pull jacquard', 'tenue', 70, '🧶'),
  illustre('gilet-beige', 'Gilet beige', 'tenue', 60, '🧥'),
  illustre('cire-capuche', 'Ciré à capuche', 'tenue', 60, '☔'),
  illustre('chemise-fleurs', 'Chemise à fleurs', 'tenue', 60, '🌺'),
  illustre('chemise-motifs', 'Chemise à motifs', 'tenue', 60, '👕'),
  illustre('chemise-cravate', 'Chemise et cravate', 'tenue', 80, '👔'),
  illustre('costume', 'Costume', 'tenue', 120, '🤵'),
  illustre('blouse-blanche', 'Blouse blanche', 'tenue', 90, '🩺'),
  illustre('veste-chef', 'Veste de chef', 'tenue', 90, '🧑‍🍳'),
  // Collection saisonnière et événements (les événements sont Premium)
  illustre('tenue-printemps', 'Tenue de printemps', 'saison', 80, '🌷'),
  illustre('tenue-ete', 'Tenue d\'été', 'saison', 80, '🕶️'),
  illustre('tenue-automne', 'Tenue d\'automne', 'saison', 80, '🍂'),
  illustre('tenue-hiver', 'Tenue d\'hiver', 'saison', 90, '❄️'),
  illustre('maillot-bain', 'Maillot de bain', 'saison', 50, '👙'),
  illustre('chapeau-sorcier', 'Chapeau de sorcier', 'saison', 50, '🧙', 'halloween'),
  illustre('bonnet-noel', 'Bonnet de Noël', 'saison', 40, '🎅', 'noel'),
  illustre('costume-sorcier', 'Costume de sorcier', 'saison', 100, '🎃', 'halloween'),
  illustre('tenue-noel', 'Tenue de Noël', 'saison', 100, '🎄', 'noel'),
  illustre('robe-saint-valentin', 'Robe de la Saint-Valentin', 'saison', 100, '💝', 'saint-valentin'),
];

export const objetParId = (id: string) => CATALOGUE_BOUTIQUE.find((o) => o.id === id);
