/**
 * LES OUTILS D'AIDE À L'EMPLOI (Pawstuler Premium V1, sans IA en temps réel)
 * Trois outils, tout le contenu est écrit à l'avance et se modifie ici :
 *  1. Scripts d'appel : quoi dire au téléphone, étape par étape ;
 *  2. Modèles de mails : relance, remerciement, demande de retour, candidature spontanée ;
 *  3. Checklist CV : les points à vérifier, et comment l'adapter à une offre.
 * La préparation d'entretien n'est pas ici : elle viendra en V2 avec une IA (elle doit s'adapter
 * à chaque offre et à chaque personne, pas être écrite en amont).
 * La version gratuite en a un avant-goût (ce qui est marqué `gratuit`) ; Premium débloque tout.
 * Variables remplies avec la candidature choisie : {entreprise}, {poste}, {prenom}, {destinataire}.
 */

/* ---------- 1. Scripts d'appel ---------- */

export type ScriptAppel = {
  id: string;
  titre: string;
  emoji: string;
  quand: string;
  etapes: { titre: string; texte: string }[];
  gratuit?: boolean;
};

export const SCRIPTS_APPEL: ScriptAppel[] = [
  {
    id: 'relance',
    gratuit: true,
    titre: 'Relancer une candidature',
    emoji: '📞',
    quand: 'Une semaine environ après l’envoi, sans réponse.',
    etapes: [
      { titre: 'Te présenter', texte: '« Bonjour, je m’appelle {prenom}. Je vous appelle au sujet de ma candidature pour le poste de {poste}, envoyée il y a quelques jours. »' },
      { titre: 'Demander la bonne personne', texte: '« Est-ce que je peux parler à la personne qui s’occupe de ce recrutement ? »' },
      { titre: 'Montrer ta motivation', texte: '« Je voulais m’assurer que vous l’aviez bien reçue, et vous redire que ce poste chez {entreprise} m’intéresse beaucoup. »' },
      { titre: 'Demander la suite', texte: '« Savez-vous quand vous prévoyez de revenir vers les candidats ? »' },
      { titre: 'Remercier', texte: '« Merci beaucoup pour votre temps. Bonne journée ! » Note ensuite la date et ce qu’on t’a dit dans ta candidature.' },
    ],
  },
  {
    id: 'spontanee',
    titre: 'Candidature spontanée par téléphone',
    emoji: '🙋',
    quand: 'Quand une entreprise te plaît, même sans annonce.',
    etapes: [
      { titre: 'Te présenter', texte: '« Bonjour, je m’appelle {prenom}. Je cherche un poste de {poste}, et j’aimerais beaucoup rejoindre {entreprise}. »' },
      { titre: 'Expliquer pourquoi eux', texte: '« J’apprécie particulièrement… (un produit, un projet, leurs valeurs). »' },
      { titre: 'Demander à qui t’adresser', texte: '« À qui puis-je envoyer ma candidature ? Avez-vous une adresse e-mail à me donner ? »' },
      { titre: 'Conclure', texte: '« Merci ! Je vous l’envoie aujourd’hui. » Puis envoie-la vraiment dans la journée, en rappelant cet appel.' },
    ],
  },
  {
    id: 'recruteur',
    titre: 'Quand un recruteur t’appelle',
    emoji: '📲',
    quand: 'Un appel inattendu au sujet d’une candidature.',
    etapes: [
      { titre: 'Prendre ton temps', texte: 'Si ce n’est pas le bon moment : « Merci pour votre appel ! Je ne suis pas disponible tout de suite, puis-je vous rappeler dans 30 minutes ? »' },
      { titre: 'Avoir ta candidature sous les yeux', texte: 'Ouvre la fiche de {entreprise} dans Pawstuler : le poste, la date d’envoi, tes notes.' },
      { titre: 'Te présenter en 30 secondes', texte: '« Je suis {prenom}, je… (ta formation ou ton expérience), et ce poste de {poste} m’intéresse parce que… »' },
      { titre: 'Poser une question', texte: '« Quelles seraient les prochaines étapes ? »' },
      { titre: 'Noter', texte: 'Note le nom de la personne, la date d’un éventuel entretien et ce qu’on t’a dit. Mets ta candidature à jour.' },
    ],
  },
];

/* ---------- 2. Modèles de mails ---------- */

export type ModeleMail = {
  id: string;
  titre: string;
  emoji: string;
  quand: string;
  objet: string;
  corps: string;
  gratuit?: boolean;
};

export const MODELES_MAILS: ModeleMail[] = [
  {
    id: 'relance',
    gratuit: true,
    titre: 'Relance après une candidature',
    emoji: '🔁',
    quand: 'Environ 7 jours après l’envoi, sans réponse.',
    objet: 'Ma candidature au poste de {poste}',
    corps:
      'Bonjour{destinataire},\n\nJe me permets de revenir vers vous au sujet de ma candidature au poste de {poste}, envoyée il y a quelques jours.\n\nCe poste chez {entreprise} m’intéresse toujours beaucoup, et je reste disponible pour échanger avec vous à votre convenance.\n\nJe vous remercie pour votre attention et vous souhaite une très bonne journée.\n\nBien cordialement,\n{prenom}',
  },
  {
    id: 'remerciement',
    titre: 'Remerciement après un entretien',
    emoji: '🙏',
    quand: 'Le jour même ou le lendemain de l’entretien.',
    objet: 'Merci pour notre échange – poste de {poste}',
    corps:
      'Bonjour{destinataire},\n\nMerci pour le temps que vous m’avez accordé lors de notre entretien pour le poste de {poste}.\n\nNotre échange m’a confirmé mon envie de rejoindre {entreprise}, en particulier… (un point de l’entretien qui t’a plu).\n\nJe reste à votre disposition pour toute information complémentaire.\n\nBien cordialement,\n{prenom}',
  },
  {
    id: 'retour',
    titre: 'Demander un retour après un refus',
    emoji: '🌱',
    quand: 'Après une réponse négative, pour progresser.',
    objet: 'Votre retour sur ma candidature – {poste}',
    corps:
      'Bonjour{destinataire},\n\nMerci pour votre réponse concernant le poste de {poste}. Même si je suis déçu(e), j’ai apprécié le processus avec {entreprise}.\n\nSi vous en avez le temps, je serais reconnaissant(e) d’avoir votre retour sur ma candidature : cela m’aiderait beaucoup à progresser.\n\nJe vous souhaite une très bonne continuation.\n\nBien cordialement,\n{prenom}',
  },
  {
    id: 'spontanee',
    titre: 'Candidature spontanée',
    emoji: '✨',
    quand: 'Quand une entreprise te plaît, sans offre publiée.',
    objet: 'Candidature spontanée – {poste}',
    corps:
      'Bonjour{destinataire},\n\nJe suis {prenom}, et je souhaite rejoindre {entreprise} en tant que {poste}.\n\nCe qui m’attire chez vous : … (un projet, un produit, vos valeurs). De mon côté, j’ai déjà… (une expérience ou une compétence utile), ce qui me permettrait de…\n\nVous trouverez mon CV en pièce jointe. Je serais ravi(e) d’en discuter avec vous.\n\nBien cordialement,\n{prenom}',
  },
];

/* ---------- 3. Checklist CV ---------- */

export type GroupeCV = { id: string; titre: string; points: { id: string; texte: string }[]; gratuit?: boolean };

export const CHECKLIST_CV: GroupeCV[] = [
  {
    id: 'essentiel',
    titre: 'L’essentiel',
    gratuit: true,
    points: [
      { id: 'une-page', texte: 'Il tient sur une page (deux au maximum avec beaucoup d’expérience).' },
      { id: 'titre', texte: 'Il a un titre clair, qui dit le poste que tu vises.' },
      { id: 'contact', texte: 'Ton téléphone et ton e-mail sont à jour (et l’e-mail fait sérieux).' },
      { id: 'orthographe', texte: 'Zéro faute : quelqu’un l’a relu.' },
      { id: 'pdf', texte: 'Tu l’envoies en PDF, avec un nom clair (CV-Prénom-Nom.pdf).' },
    ],
  },
  {
    id: 'experiences',
    titre: 'Tes expériences',
    points: [
      { id: 'recentes', texte: 'Les plus récentes sont en premier.' },
      { id: 'verbes', texte: 'Chaque ligne commence par un verbe d’action (géré, créé, organisé…).' },
      { id: 'chiffres', texte: 'Au moins un résultat chiffré par expérience quand c’est possible.' },
      { id: 'tout-compte', texte: 'Stages, jobs étudiants, associations et projets d’école y figurent : tout compte.' },
      { id: 'dates', texte: 'Les dates sont lisibles (mois et année).' },
    ],
  },
  {
    id: 'competences',
    titre: 'Compétences et formation',
    points: [
      { id: 'outils', texte: 'Les outils et logiciels que tu maîtrises sont listés.' },
      { id: 'langues', texte: 'Tes langues, avec un niveau honnête (B2, courant…).' },
      { id: 'qualites', texte: 'Deux ou trois qualités, prouvées dans tes expériences.' },
      { id: 'formation', texte: 'Ta formation, avec le diplôme, l’école et l’année.' },
    ],
  },
  {
    id: 'presentation',
    titre: 'La mise en page',
    points: [
      { id: 'lisible', texte: 'Une police lisible et des marges aérées.' },
      { id: 'sobre', texte: 'Deux couleurs au maximum.' },
      { id: 'photo', texte: 'Si tu mets une photo : souriante, nette et professionnelle.' },
      { id: 'linkedin', texte: 'Le lien vers ton profil LinkedIn (à jour lui aussi).' },
    ],
  },
];

/** Adapter son CV à une offre précise (Premium). */
export const ADAPTER_A_UNE_OFFRE: string[] = [
  'Relis l’offre et surligne les 5 mots-clés qui reviennent (compétences, outils, qualités).',
  'Reprends ces mots-clés tels quels dans ton CV, là où ils sont vrais pour toi.',
  'Adapte le titre de ton CV au nom exact du poste.',
  'Place en premier l’expérience la plus proche de l’offre.',
  'Retire ce qui n’a aucun lien avec le poste, pour garder une seule page.',
];

/** Les trois outils, pour l'onglet « Outils ». */
export const OUTILS = [
  { id: 'appel', titre: 'Scripts d’appel', emoji: '📞', texte: 'Quoi dire au téléphone, étape par étape.', route: '/outils/appel' },
  { id: 'mail', titre: 'Modèles de mails', emoji: '✉️', texte: 'Relance, remerciement, demande de retour : prêts à envoyer.', route: '/outils/mail' },
  { id: 'cv', titre: 'Checklist CV', emoji: '📄', texte: 'Les points à vérifier, et comment l’adapter à une offre.', route: '/outils/cv' },
] as const;
