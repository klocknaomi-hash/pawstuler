/**
 * LES OUTILS D'AIDE À L'EMPLOI (Pawstuler Premium V1, sans IA en temps réel)
 * Quatre outils, tout le contenu est écrit à l'avance et se modifie ici :
 *  1. Préparer un entretien : questions fréquentes, ce que le recruteur cherche, un conseil, un exemple ;
 *  2. Scripts d'appel : quoi dire au téléphone, étape par étape ;
 *  3. Modèles de mails : relance, remerciement, demande de retour, candidature spontanée ;
 *  4. Checklist CV : les points à vérifier, et comment l'adapter à une offre.
 * La version gratuite en a un avant-goût (ce qui est marqué `gratuit`) ; Premium débloque tout.
 * Variables remplies avec la candidature choisie : {entreprise}, {poste}, {prenom}, {destinataire}.
 */

/* ---------- 1. Préparer un entretien ---------- */

export type QuestionEntretien = {
  id: string;
  question: string;
  /** Ce que le recruteur veut vraiment savoir. */
  cherche: string;
  /** Comment y répondre. */
  conseil: string;
  /** Un exemple de début de réponse. */
  exemple: string;
  gratuit?: boolean;
};

export type CategorieQuestions = { id: string; titre: string; emoji: string; questions: QuestionEntretien[] };

export const QUESTIONS_ENTRETIEN: CategorieQuestions[] = [
  {
    id: 'presentation',
    titre: 'Te présenter',
    emoji: '👋',
    questions: [
      {
        id: 'presente-toi',
        gratuit: true,
        question: 'Présente-toi.',
        cherche: 'Ta capacité à résumer ton parcours clairement, et le lien avec le poste.',
        conseil: 'En 1 à 2 minutes : qui tu es aujourd’hui, ce que tu as fait de plus utile pour ce poste, et pourquoi tu es là. Pas toute ta vie, seulement le fil qui mène à eux.',
        exemple: '« Je termine un master en communication. Pendant mon alternance chez…, j’ai géré les réseaux sociaux d’une marque locale et fait passer l’audience de 2 000 à 8 000 abonnés. C’est ce type de projet que j’ai envie de mener chez vous. »',
      },
      {
        id: 'parcours',
        question: 'Parle-moi de ton parcours.',
        cherche: 'La logique de tes choix, même si ton parcours n’est pas linéaire.',
        conseil: 'Raconte-le comme une histoire avec un fil conducteur. Chaque étape t’a appris quelque chose qui sert pour ce poste.',
        exemple: '« J’ai commencé par une licence d’histoire, ce qui m’a appris à rédiger et à chercher l’information. C’est en écrivant pour l’association étudiante que j’ai découvert la communication… »',
      },
      {
        id: 'trois-mots',
        question: 'Comment te décrirais-tu en trois mots ?',
        cherche: 'Ta connaissance de toi-même, et des qualités utiles pour le poste.',
        conseil: 'Choisis trois mots liés au poste, et garde un petit exemple pour chacun.',
        exemple: '« Curieuse, organisée et fiable. Organisée, par exemple : pendant mon stage, je tenais le planning de toute l’équipe. »',
      },
      {
        id: 'hors-travail',
        question: 'Que fais-tu en dehors des études ou du travail ?',
        cherche: 'Ta personnalité, et des qualités qui se voient ailleurs qu’au travail.',
        conseil: 'Sois sincère et relie, si possible, à une qualité : un sport d’équipe, une association, un projet perso.',
        exemple: '« Je fais partie d’un club de course : j’y ai appris la régularité, et j’organise les sorties du dimanche. »',
      },
    ],
  },
  {
    id: 'motivation',
    titre: 'Ta motivation',
    emoji: '💡',
    questions: [
      {
        id: 'pourquoi-nous',
        gratuit: true,
        question: 'Pourquoi notre entreprise ?',
        cherche: 'Que tu t’es renseigné, et que tu ne postules pas « au hasard ».',
        conseil: 'Cite deux éléments précis (un projet, une valeur, un produit) et dis ce qui te parle personnellement.',
        exemple: '« J’ai vu votre projet de… et la façon dont vous parlez de… sur votre site. C’est exactement le type d’environnement où j’ai envie d’apprendre. »',
      },
      {
        id: 'pourquoi-poste',
        question: 'Pourquoi ce poste ?',
        cherche: 'Que tu as compris les missions, et qu’elles te plaisent vraiment.',
        conseil: 'Reprends 2 missions de l’offre et relie chacune à ce que tu sais déjà faire ou à ce que tu veux apprendre.',
        exemple: '« L’offre parle de relation client et de suivi de dossiers : c’est ce que j’ai le plus aimé pendant mon stage, et je veux aller plus loin. »',
      },
      {
        id: 'que-sais-tu',
        question: 'Que sais-tu de nous ?',
        cherche: 'Ta préparation.',
        conseil: 'Trois choses suffisent : ce qu’ils font, une actualité récente, et ce qui les distingue. Va voir le site, LinkedIn et les dernières nouvelles.',
        exemple: '« Vous êtes une PME de 40 personnes spécialisée dans… Vous venez d’ouvrir une boutique à… et vous mettez en avant… »',
      },
      {
        id: 'pourquoi-toi',
        question: 'Pourquoi devrions-nous te choisir ?',
        cherche: 'Que tu sais ce que tu apportes.',
        conseil: 'Résume en 3 points : une compétence clé pour le poste, une preuve, et ton envie. Pas besoin de te comparer aux autres.',
        exemple: '« Je sais déjà…, je l’ai prouvé quand…, et j’ai vraiment envie de m’investir dans votre projet. »',
      },
    ],
  },
  {
    id: 'qualites',
    titre: 'Qualités et défauts',
    emoji: '⚖️',
    questions: [
      {
        id: 'qualites',
        gratuit: true,
        question: 'Quelles sont tes qualités ?',
        cherche: 'Des qualités utiles pour le poste, avec des preuves.',
        conseil: 'Deux qualités, un exemple concret pour chacune. Un exemple vaut mieux que trois adjectifs.',
        exemple: '« Je suis rigoureux : en stage, je vérifiais les commandes avant l’envoi et on a eu zéro erreur pendant trois mois. »',
      },
      {
        id: 'defaut',
        question: 'Quel est ton principal défaut ?',
        cherche: 'Ta lucidité, et ce que tu fais pour t’améliorer.',
        conseil: 'Un vrai défaut, pas rédhibitoire pour le poste, suivi de ce que tu mets en place. Évite « je suis trop perfectionniste ».',
        exemple: '« J’ai du mal à dire non quand on me demande de l’aide. J’ai appris à prioriser avec une liste du jour et à proposer un autre moment. »',
      },
      {
        id: 'collegues',
        question: 'Comment tes anciens collègues te décriraient-ils ?',
        cherche: 'Ta façon de travailler en équipe.',
        conseil: 'Choisis ce qu’on t’a vraiment dit (un retour de stage, une appréciation) : c’est plus crédible.',
        exemple: '« Ma tutrice disait que j’étais la personne vers qui on se tournait quand un dossier était urgent, parce que je restais calme. »',
      },
      {
        id: 'reussite',
        question: 'Quelle est ta plus grande réussite ?',
        cherche: 'Ce qui te rend fier, et comment tu t’y prends.',
        conseil: 'Une réussite qui te ressemble, racontée avec la méthode STAR : la Situation, la Tâche, tes Actions, le Résultat.',
        exemple: '« En dernière année, on devait organiser un salon (situation)… j’étais chargée des partenaires (tâche)… j’ai appelé 30 entreprises (actions)… 12 ont dit oui (résultat). »',
      },
    ],
  },
  {
    id: 'situations',
    titre: 'Mises en situation',
    emoji: '🧩',
    questions: [
      {
        id: 'difficulte',
        gratuit: true,
        question: 'Raconte une difficulté et comment tu l’as surmontée.',
        cherche: 'Ta façon de réagir face à un problème.',
        conseil: 'Méthode STAR, et insiste sur tes actions et ce que tu en as appris. Le problème peut être petit, c’est ta réaction qui compte.',
        exemple: '« Un client mécontent a appelé pendant que ma responsable était absente. Je l’ai écouté, j’ai noté le problème, je lui ai promis un rappel le jour même… et je l’ai fait. »',
      },
      {
        id: 'conflit',
        question: 'As-tu déjà eu un désaccord avec un collègue ?',
        cherche: 'Ta capacité à communiquer et à trouver un terrain d’entente.',
        conseil: 'Montre que tu as cherché à comprendre l’autre et à trouver une solution, sans critiquer personne.',
        exemple: '« Sur un projet de groupe, on n’était pas d’accord sur le planning. J’ai proposé qu’on liste les contraintes de chacun, et on a trouvé un compromis. »',
      },
      {
        id: 'stress',
        question: 'Comment gères-tu le stress ?',
        cherche: 'Que tu restes efficace sous pression.',
        conseil: 'Donne ta méthode concrète (liste, priorités, pause) et un exemple où elle a marché.',
        exemple: '« Je découpe le travail en petites étapes et je commence par le plus urgent. Pendant mes examens et mon job étudiant, ça m’a beaucoup aidée. »',
      },
      {
        id: 'erreur',
        question: 'Parle-moi d’une erreur que tu as faite.',
        cherche: 'Ton honnêteté, et ce que tu en tires.',
        conseil: 'Une vraie erreur, sans gravité, ce que tu as fait pour la réparer et ce que tu fais différemment depuis.',
        exemple: '« J’ai envoyé un devis avec un mauvais prix. Je l’ai signalé tout de suite, on a corrigé, et depuis je relis toujours les chiffres avant l’envoi. »',
      },
    ],
  },
  {
    id: 'projet',
    titre: 'Ton projet',
    emoji: '🧭',
    questions: [
      {
        id: 'cinq-ans',
        gratuit: true,
        question: 'Où te vois-tu dans 5 ans ?',
        cherche: 'Si ton projet est cohérent avec le poste, et si tu comptes rester un peu.',
        conseil: 'Parle de compétences et de responsabilités plutôt que d’un titre précis, en lien avec l’entreprise.',
        exemple: '« J’aimerais être devenue une référence sur…, et pourquoi pas encadrer un petit projet. »',
      },
      {
        id: 'salaire',
        question: 'Quelles sont tes prétentions salariales ?',
        cherche: 'Si tu connais le marché, et si vous êtes alignés.',
        conseil: 'Renseigne-toi avant (offres similaires, grilles d’alternance ou de stage) et donne une fourchette réaliste, en brut annuel.',
        exemple: '« D’après mes recherches, pour ce type de poste en début de carrière, je vise entre 26 000 et 28 000 € brut par an. »',
      },
      {
        id: 'disponibilite',
        question: 'Quand peux-tu commencer ?',
        cherche: 'Ta disponibilité réelle.',
        conseil: 'Sois précis et honnête (préavis, fin des cours, dates d’école pour une alternance).',
        exemple: '« Je suis disponible à partir du 2 septembre, après mes derniers examens. »',
      },
      {
        id: 'autres-pistes',
        question: 'As-tu d’autres candidatures en cours ?',
        cherche: 'Ton intérêt pour eux, et le temps dont ils disposent.',
        conseil: 'Tu peux dire oui sans détailler, et rappeler que ce poste t’intéresse particulièrement.',
        exemple: '« Oui, quelques-unes, mais votre poste est celui qui correspond le plus à ce que je cherche. »',
      },
    ],
  },
  {
    id: 'delicates',
    titre: 'Questions délicates',
    emoji: '🌱',
    questions: [
      {
        id: 'trou-cv',
        question: 'Pourquoi y a-t-il une pause dans ton CV ?',
        cherche: 'Comprendre, pas juger.',
        conseil: 'Une explication courte et honnête, puis ce que tu as fait ou appris pendant cette période, et pourquoi tu es prêt maintenant.',
        exemple: '« J’ai pris quelques mois pour m’occuper d’un proche. J’en ai profité pour suivre une formation en ligne sur…, et je suis prête à m’investir pleinement. »',
      },
      {
        id: 'pas-experience',
        question: 'Tu n’as pas beaucoup d’expérience, non ?',
        cherche: 'Ce que tu peux apporter malgré tout.',
        conseil: 'Mets en avant stages, projets d’école, jobs étudiants et associations : tout compte. Montre ton envie d’apprendre vite.',
        exemple: '« C’est vrai, mais j’ai déjà fait… pendant mon stage et mon projet de fin d’études, et j’apprends vite : en deux semaines, j’ai pris en main… »',
      },
      {
        id: 'quitter',
        question: 'Pourquoi veux-tu quitter ton poste actuel ?',
        cherche: 'Tes vraies motivations, sans critique de ton employeur.',
        conseil: 'Parle de ce que tu cherches (évolution, nouveau domaine) plutôt que de ce que tu fuis.',
        exemple: '« J’ai beaucoup appris, et j’ai maintenant envie de… ce que votre poste permet. »',
      },
    ],
  },
];

/** Questions à poser au recruteur à la fin de l'entretien (gratuites : c'est un bon réflexe pour tout le monde). */
export const QUESTIONS_A_POSER: string[] = [
  'À quoi ressemble une journée type dans ce poste ?',
  'Comment se passent les premières semaines ?',
  'Avec qui vais-je travailler au quotidien ?',
  'Quels sont les objectifs les plus importants pour les premiers mois ?',
  'Qu’est-ce qui fait qu’une personne réussit bien dans votre équipe ?',
  'Quelles sont les prochaines étapes du recrutement ?',
];

/* ---------- 2. Scripts d'appel ---------- */

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

/* ---------- 3. Modèles de mails ---------- */

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

/* ---------- 4. Checklist CV ---------- */

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

/** Les quatre outils, pour l'onglet « Outils ». */
export const OUTILS = [
  { id: 'entretien', titre: 'Préparer un entretien', emoji: '🎤', texte: 'Les questions fréquentes, ce que le recruteur cherche, un conseil et un exemple.', route: '/outils/entretien' },
  { id: 'appel', titre: 'Scripts d’appel', emoji: '📞', texte: 'Quoi dire au téléphone, étape par étape.', route: '/outils/appel' },
  { id: 'mail', titre: 'Modèles de mails', emoji: '✉️', texte: 'Relance, remerciement, demande de retour : prêts à envoyer.', route: '/outils/mail' },
  { id: 'cv', titre: 'Checklist CV', emoji: '📄', texte: 'Les points à vérifier, et comment l’adapter à une offre.', route: '/outils/cv' },
] as const;
