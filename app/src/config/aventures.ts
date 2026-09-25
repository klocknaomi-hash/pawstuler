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
    '{nom} a poussé la porte de {lieu} avec son CV encore tiède. On lui a souri et promis de le rappeler. En sortant, il avait des étoiles plein les yeux.',
    '{nom} s’est entraîné à se présenter devant le lac : « Bonjour, je vise le poste de {metier}. » Les canards ont applaudi. Puis il a déposé sa candidature à {lieu}.',
    'À {lieu}, {nom} a relancé une candidature envoyée la semaine dernière. Un peu intimidé, mais fier d’avoir osé. On lui a dit : « Revenez jeudi ! »',
    '{nom} a passé l’après-midi à repérer les commerces de la ville. Il a noté {lieu} dans son carnet : « Ça, c’est pour moi. »',
  ],
  pro: [
    'Premier café à {lieu} pour {nom}. Il a appris le prénom de tout le monde, ou presque. Demain, il retiendra les autres.',
    '{nom} a présenté une petite idée à son équipe de {lieu}. Personne ne s’y attendait, et tout le monde a trouvé ça bien.',
    'Journée chargée à {lieu}. {nom} a noté trois choses apprises aujourd’hui dans son carnet, et une à mieux faire demain.',
  ],
};
