/**
 * DIALOGUES DU COMPAGNON (onboarding)
 * D'après le script de Ziggy (CLAUDE.md §9), adapté à la personnalité de chaque animal.
 * Joués juste après que l'utilisateur a donné un prénom à son compagnon.
 *
 * Remplacements automatiques : {nom} = prénom du compagnon, {prenom} = prénom de l'utilisateur,
 * {e} = accord selon les pronoms du compagnon (« perdu{e} »), voir `accorder` dans compagnons.ts.
 * La dernière réplique se termine par le bouton « Promis ! 🐾 ».
 */
import type { EspeceId, Pose } from '@/config/compagnons';

export type Replique = { texte: string; pose: Pose };

export const DIALOGUES: Record<EspeceId, Replique[]> = {
  renard: [
    { pose: 'salut', texte: 'Oh ! Bonjour ! Pardon, je suis encore un peu perdu{e}… Moi, c’est {nom}. Enfin, depuis que tu m’as donné ce joli prénom !' },
    { pose: 'content', texte: 'Enchanté{e}, {prenom} ! Je suis venu{e} ici pour trouver ma place. Et toi aussi, tu cherches la tienne, c’est ça ?' },
    { pose: 'reconfort', texte: 'Je vais te dire un secret… chercher tout seul, ça me fait un peu peur. Mais à deux, c’est différent.' },
    { pose: 'aventure', texte: 'Chaque fois que tu avances, une candidature, une relance, un entretien, je le sens. Et moi aussi, je pars postuler de mon côté !' },
    { pose: 'content', texte: 'Et les refus ? Pas de panique. Chaque « non » compte aussi. Ça veut dire qu’on a osé.' },
    { pose: 'fier', texte: 'Le jour où tu décroches ton poste… moi aussi, je décroche le mien. Promis ?' },
  ],
  chat: [
    { pose: 'salut', texte: 'Bonjour. Je t’observais depuis ma coquille… Moi, c’est {nom}. Ce prénom me plaît beaucoup.' },
    { pose: 'content', texte: 'Enchanté{e}, {prenom}. Je suis ici pour trouver un travail qui me ressemble. Toi aussi, j’ai l’impression.' },
    { pose: 'reconfort', texte: 'Entre nous, j’aime quand tout est bien fait. Mais chercher seul, c’est long. À deux, on sera plus efficaces.' },
    { pose: 'aventure', texte: 'Chaque fois que tu avances, je le note dans mon carnet. Et moi aussi, je vais postuler de mon côté.' },
    { pose: 'content', texte: 'Les refus ? Ils ne disent rien de ta valeur. On ajuste, et on continue.' },
    { pose: 'fier', texte: 'Le jour où tu décroches ton poste, moi aussi je décroche le mien. Promis ?' },
  ],
  crocodile: [
    { pose: 'salut', texte: 'Hum. Bonjour. Je sais, j’ai l’air grave… mais je suis ravi{e} de te rencontrer. Moi, c’est {nom}.' },
    { pose: 'content', texte: 'Ravi{e}, {prenom} ! Je suis là pour trouver ma place, et pour t’aider à trouver la tienne.' },
    { pose: 'reconfort', texte: 'Chercher un travail tout seul, c’est dur. Alors on ne le fera pas tout seul : on est une équipe maintenant.' },
    { pose: 'aventure', texte: 'Chaque candidature, chaque relance, chaque entretien : je le sens. Et moi aussi, je pars postuler de mon côté !' },
    { pose: 'content', texte: 'Les refus ? Je suis un crocodile : ça glisse sur mes écailles. Chaque « non » veut dire qu’on a osé.' },
    { pose: 'fier', texte: 'Le jour où tu décroches ton poste… moi aussi, je décroche le mien. Promis ?' },
  ],
  lapin: [
    { pose: 'salut', texte: 'Oh ! B-bonjour ! Pardon, je suis un peu impressionné{e}… Moi, c’est {nom}. Merci pour ce prénom !' },
    { pose: 'content', texte: 'Enchanté{e}, {prenom} ! Je suis venu{e} ici pour trouver ma place. Tu cherches aussi ton job ?' },
    { pose: 'reconfort', texte: 'Je vais te dire un secret : j’ai un peu peur de chercher tout seul. Mais avec toi, j’ai déjà plus de courage.' },
    { pose: 'aventure', texte: 'Chaque fois que tu avances, je le sens, et ça me donne des ailes. Enfin… des oreilles. Moi aussi, je vais postuler !' },
    { pose: 'content', texte: 'Les refus… j’avoue, ça me stresse. Mais on a décidé : chaque « non » compte aussi. Ça veut dire qu’on a osé.' },
    { pose: 'fier', texte: 'Le jour où tu décroches ton poste… moi aussi, je décroche le mien. Promis ?' },
  ],
};

/** Premier message du compagnon sur l'accueil, tant qu'aucune candidature n'est enregistrée. */
export const PREMIER_PAS = 'On commence doucement : ajoute ta première candidature… ou juste une offre qui te plaît 🐾';
