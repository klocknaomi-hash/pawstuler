/**
 * LES COMPAGNONS
 * Pour ajouter ou retirer un animal, on modifie seulement cette liste.
 * Les images de chaque animal sont déclarées dans src/assets/registre.ts.
 */

export type EspeceId = 'renard' | 'chat' | 'chien' | 'loutre';

/** Les états visuels d'un compagnon. Chaque état = une image (ou plus tard une animation). */
export type Pose =
  | 'salut' // onboarding, naissance
  | 'neutre' // accueil
  | 'content' // tâche cochée
  | 'excite' // grosse journée
  | 'dort' // en dehors de ses heures d'éveil
  | 'reconfort' // après un refus
  | 'fier' // entretien obtenu
  | 'aventure' // part se promener en ville
  | 'celebration'; // poste décroché

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
    id: 'chien',
    espece: 'le chien',
    nomParDefaut: 'Waffle',
    personnalite: 'Enthousiaste et loyal',
    couleur: '#D9A66B',
    emoji: '🐶',
  },
  {
    id: 'loutre',
    espece: 'la loutre',
    nomParDefaut: 'Kiwi',
    personnalite: 'Sociable, connaît tout le monde',
    couleur: '#B08A6E',
    emoji: '🦦',
  },
];

export const compagnonParId = (id: EspeceId) => COMPAGNONS.find((c) => c.id === id) ?? COMPAGNONS[0];
