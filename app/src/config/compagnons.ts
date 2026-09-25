/**
 * LES COMPAGNONS
 * Pour ajouter ou retirer un animal, on modifie seulement cette liste.
 * Les images de chaque animal sont déclarées dans src/illustrations/registre.ts.
 */

export type EspeceId = 'renard' | 'chat' | 'crocodile' | 'lapin';

/** Les états visuels d'un compagnon. Chaque état = une image (ou plus tard une animation). */
export type Pose =
  | 'salut' // onboarding, naissance
  | 'neutre' // accueil
  | 'content' // tâche cochée, câlin
  | 'excite' // jeu, grosse journée
  | 'dort' // en dehors de ses heures d'éveil
  | 'reconfort' // après un refus
  | 'fier' // entretien obtenu, poste décroché
  | 'aventure' // part en aventure dans sa ville
  | 'celebration'; // « J'ai décroché ! »

export type Compagnon = {
  id: EspeceId;
  espece: string; // « le renard »
  nomParDefaut: string;
  personnalite: string;
  couleur: string; // couleur principale, sert aux cartes quand l'illustration manque
  emoji: string; // visuel de secours tant que l'illustration n'est pas fournie
};

export const COMPAGNONS: Compagnon[] = [
  {
    id: 'renard',
    espece: 'le renard',
    nomParDefaut: 'Ziggy',
    personnalite: 'Curieux et débrouillard',
    couleur: '#F2906B',
    emoji: '🦊',
  },
  {
    id: 'chat',
    espece: 'le chat',
    nomParDefaut: 'Mochi',
    personnalite: 'Calme et observateur',
    couleur: '#E9C9A8',
    emoji: '🐱',
  },
  {
    id: 'crocodile',
    espece: 'le crocodile',
    nomParDefaut: 'Milo',
    personnalite: 'Grand cœur sous ses airs sérieux',
    couleur: '#9CC48A',
    emoji: '🐊',
  },
  {
    id: 'lapin',
    espece: 'le lapin',
    nomParDefaut: 'Nala',
    personnalite: 'Un peu stressé mais courageux',
    couleur: '#E8D5C4',
    emoji: '🐰',
  },
];

export const compagnonParId = (id: EspeceId) => COMPAGNONS.find((c) => c.id === id) ?? COMPAGNONS[0];
export const especeValide = (id: string): id is EspeceId => COMPAGNONS.some((c) => c.id === id);
