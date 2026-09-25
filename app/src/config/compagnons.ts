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

/** Pronoms du compagnon (facultatifs, choisis par l'utilisateur). */
export type Pronoms = 'il' | 'elle' | 'iel';

export const LIBELLES_PRONOMS: Record<Pronoms, string> = { il: 'Il / lui', elle: 'Elle', iel: 'Iel' };

export type Compagnon = {
  id: EspeceId;
  espece: string; // « le renard »
  nomParDefaut: string;
  personnalite: string;
  /**
   * Petite présentation, pour la page de profil. Accordée selon les pronoms choisis :
   * {Il}/{il} devient Elle/elle ou Iel/iel, {e} ajoute l'accord (« perdu{e} »).
   */
  description: string;
  /** Traits de caractère affichés dans l'onglet « Traits ». */
  traits: string[];
  aime: string;
  couleur: string; // couleur principale, sert aux cartes quand l'illustration manque
  emoji: string; // visuel de secours tant que l'illustration n'est pas fournie
};

export const COMPAGNONS: Compagnon[] = [
  {
    id: 'renard',
    espece: 'le renard',
    nomParDefaut: 'Ziggy',
    personnalite: 'Curieux et débrouillard',
    description: '{Il} est un peu perdu{e} au début, mais plein{e} de ressources. {Il} pose mille questions et trouve toujours un chemin.',
    traits: ['Curiosité', 'Débrouillardise', 'Ingéniosité', 'Tête en l’air'],
    aime: 'Explorer les petites rues et les croissants tout chauds',
    couleur: '#F2906B',
    emoji: '🦊',
  },
  {
    id: 'chat',
    espece: 'le chat',
    nomParDefaut: 'Mochi',
    personnalite: 'Calme et observateur',
    description: '{Il} observe tout avant d’agir. Un brin perfectionniste, {il} aime quand les choses sont bien faites.',
    traits: ['Calme', 'Sens de l’observation', 'Perfectionnisme', 'Fidélité'],
    aime: 'Les siestes au soleil et les listes bien rangées',
    couleur: '#E9C9A8',
    emoji: '🐱',
  },
  {
    id: 'crocodile',
    espece: 'le crocodile',
    nomParDefaut: 'Milo',
    personnalite: 'Grand cœur sous ses airs sérieux',
    description: '{Il} a l’air grave, mais c’est une vraie guimauve. Toujours là pour encourager les autres.',
    traits: ['Grand cœur', 'Sérieux', 'Bienveillance', 'Patience'],
    aime: 'Nager dans le lac et encourager ses amis',
    couleur: '#9CC48A',
    emoji: '🐊',
  },
  {
    id: 'lapin',
    espece: 'le lapin',
    nomParDefaut: 'Nala',
    personnalite: 'Un peu stressé mais courageux',
    description: '{Il} stresse un peu avant chaque grand moment, mais {il} y va quand même. Et à chaque fois, c’est une petite victoire.',
    traits: ['Courage', 'Sensibilité', 'Attention aux autres', 'Un brin de stress'],
    aime: 'Les carottes croquantes et les petites victoires',
    couleur: '#E8D5C4',
    emoji: '🐰',
  },
];

/** Accorde un texte selon les pronoms du compagnon (voir `description`). */
export function accorder(texte: string, pronoms?: Pronoms): string {
  const sujet = pronoms === 'elle' ? 'Elle' : pronoms === 'iel' ? 'Iel' : 'Il';
  const accord = pronoms === 'elle' ? 'e' : pronoms === 'iel' ? '·e' : '';
  return texte.replaceAll('{Il}', sujet).replaceAll('{il}', sujet.toLowerCase()).replaceAll('{e}', accord);
}

export const compagnonParId = (id: EspeceId) => COMPAGNONS.find((c) => c.id === id) ?? COMPAGNONS[0];
export const especeValide = (id: string): id is EspeceId => COMPAGNONS.some((c) => c.id === id);
