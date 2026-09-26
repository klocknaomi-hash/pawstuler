/**
 * LES AVENTURES DU JOUR
 * De courts récits (2 ou 3 phrases) de la journée du compagnon dans sa ville.
 * Son histoire est le miroir de celle de l'utilisateur : pendant la recherche, il postule ;
 * après « J'ai décroché ! », il vit sa propre vie professionnelle.
 * {nom} = prénom du compagnon, {lieu} = lieu visité, {metier} = poste visé dans ce lieu.
 */

export type Contexte = 'recherche' | 'pro';

export const RECITS: Record<Contexte, string[]> = {
  recherche: [
    '{nom} a fait le tour du quartier, carnet à la main. Il a repéré {lieu}, qui cherche peut-être un profil comme le sien : il a tout noté.',
    '{nom} a épluché le tableau d’annonces de la place. Une offre de {metier} lui a fait briller les yeux : il garde l’idée au chaud.',
    '{nom} a poussé la porte de {lieu} juste pour découvrir l’endroit. On lui a présenté l’équipe, et il est reparti avec plein d’idées.',
    '{nom} a passé l’après-midi à repérer les commerces de la ville. Il a noté {lieu} dans son carnet : « Ça, c’est pour moi. »',
  ],
  pro: [
    'Premier café à {lieu} pour {nom}. Il a appris le prénom de tout le monde, ou presque. Demain, il retiendra les autres.',
    '{nom} a présenté une petite idée à son équipe de {lieu}. Personne ne s’y attendait, et tout le monde a trouvé ça bien.',
    'Journée chargée à {lieu}. {nom} a noté trois choses apprises aujourd’hui dans son carnet, et une à mieux faire demain.',
  ],
};
