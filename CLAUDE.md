# Pawstuler — Directive projet pour Claude Code

## 0. OÙ EN EST LE PROJET

- **Phase 0 (analyse et plan) : terminée et validée.** Stack choisie : **Expo (React Native)**, pour tester sur iPhone avec Expo Go, sans Mac.
- **Maquette HTML** (`maquette/`) : première exploration visuelle, ne plus la faire évoluer. La référence est désormais l'app.
- **App Expo** (`app/`) : parcours de démarrage complet et architecture en place (voir section 10).
- Prochaines étapes : brancher les illustrations Dimini, trancher les questions ouvertes (section 11), puis enrichir candidatures, boutique et vie du compagnon en ville.

Avant tout gros changement : proposer un plan et attendre ma validation (section 8).

---

## 1. Le projet en une phrase
Pawstuler, c'est **Finch pour la recherche d'emploi** : une app iOS où l'on suit ses candidatures et accomplit des tâches du jour, accompagné d'un petit compagnon animal qui vit dans sa propre ville et cherche, lui aussi, son job.

Ce n'est pas une app de candidatures avec un animal ajouté par-dessus : compagnon, tâches, candidatures, récompenses, ville et progression forment **un seul écosystème**.
Message clé : **« Tu n'as pas à gérer ta recherche d'emploi seul. Ton compagnon avance avec toi. »**

## 2. Pourquoi
Chercher un emploi est long, solitaire et démotivant. Les gens suivent leurs candidatures dans des tableaux Excel froids. Pawstuler rend ce suivi beau, simple et motivant, et accompagne émotionnellement l'utilisateur face aux refus.

Cible : étudiants et jeunes actifs de 18 à 35 ans, en France. App entièrement en français, avec tutoiement. Ton positif, rassurant, motivant et moderne, jamais « outil RH froid ».

## 3. Principes non négociables
1. **On récompense l'effort, jamais le résultat.** Un refus ne fait jamais rien perdre.
2. **Aucune culpabilisation.** Le compagnon ne meurt jamais, ne tombe jamais malade et n'est jamais triste à cause de l'absence de l'utilisateur. Les séries (streaks) sont bienveillantes.
3. **Confiance, pas surveillance.** L'utilisateur déclare lui-même ses tâches terminées. Il peut cocher, décocher (la récompense est alors reprise) et supprimer une tâche.
4. **Les pièces se gagnent, elles ne s'achètent jamais** avec de l'argent.
5. **La version gratuite est vraiment utile** : Ziggy+ enrichit l'expérience, il ne débloque pas l'essentiel.
6. **Simplicité.** Si une fonctionnalité complique l'app sans servir la boucle principale, elle attend.

## 4. Les compagnons
L'utilisateur choisit **un compagnon parmi 4**. Chacun a ses illustrations, ses animations, ses réactions, un nom proposé (modifiable à l'onboarding puis dans les réglages) et pourra être personnalisé.

| Animal | Nom proposé | Personnalité |
|---|---|---|
| 🦊 Renard | **Ziggy** | Curieux et débrouillard, un peu perdu au début mais plein de ressources |
| 🐱 Chat | **Mochi** | Calme, observateur, un brin perfectionniste |
| 🐶 Chien | **Waffle** | Enthousiaste et loyal, ton meilleur supporter |
| 🦦 Loutre | **Kiwi** | Sociable, elle connaît tout le monde en ville |

*(Le lapin Nugget est mis de côté : à confirmer, voir section 11.)*

**Poses de chaque compagnon** (une image chacune, remplacées plus tard par des animations) : salut, neutre, content, excité, dort, réconfort, fier, aventure, célébration.

**Il est toujours vivant** : il respire, se promène dans sa ville et réagit dès qu'une tâche est cochée. **Il vit à son rythme** : l'utilisateur choisit son heure de réveil et de coucher ; en dehors, il dort (on peut quand même avancer, il découvre les progrès au réveil).

## 5. Le parcours et les fonctionnalités

### 5.1 Parcours complet
Présentation → Connexion → Onboarding (prénom → objectif → choix de l'animal → œuf → naissance → prénom de l'animal → ville → rythme) → Accueil → Tâches du jour → Pièces → Boutique → Personnalisation → Progression professionnelle → Vie du compagnon dans sa ville.

### 5.2 Présentation
Un seul écran court avant tout : l'animal, une phrase d'accroche, 4 points (tâches du jour, candidatures, pièces et personnalisation, compagnon qui vit et cherche avec toi).

### 5.3 Connexion
Apple, Google, e-mail/mot de passe. Pour l'instant, chaque méthode crée un compte local sur le téléphone ; les vrais services se branchent dans `app/src/services/auth` sans toucher aux écrans.

### 5.4 Onboarding
1. **Prénom** : « Comment tu t'appelles ? »
2. **Objectif** : Emploi, puis type de contrat facultatif et multiple (CDI, CDD, Stage, Alternance, Freelance). Sert à personnaliser les tâches.
3. **Choix de l'animal** parmi les 4, très visuel.
4. **Œuf** : il apparaît, l'utilisateur le touche, il se fissure (une étape par toucher), se casse, l'animal apparaît et fait coucou. L'œuf est un élément magique assumé, pour tous les animaux.
5. **Prénom de l'animal** : son nom s'affiche en grand, « Comment veux-tu l'appeler ? », prérempli avec le nom proposé.
6. **Ville** : « Où veux-tu commencer ton aventure ? », 4 cartes (voir 5.8).
7. **Rythme** : heure de réveil et de coucher du compagnon.

### 5.5 Accueil et tâches du jour
L'accueil est simple : le compagnon dans sa ville, puis **« Tes tâches du jour »**, sans accumulation de widgets.
- Chaque matin, l'app propose ~5 tâches : relances à faire, tâches de démarrage jamais faites (CV, critères, LinkedIn), une tâche liée au contrat, puis des tâches variées. Plus tard, elles pourront être générées par l'IA.
- L'utilisateur peut créer ses propres tâches (elles restent d'un jour à l'autre tant qu'elles ne sont pas faites).
- Boucle : **tâche → validation → animation → pièces**.

### 5.6 Candidatures
Un vrai suivi de candidatures, mais simple et dans notre univers, jamais un gros tableau Excel.
- Fiche : entreprise, poste, lien, contact, date d'envoi, statut, note.
- Statuts : À envoyer → Envoyée → Relancée → Entretien → Offre reçue, ou Refus.
- Recherche rapide, filtres par statut, compteurs (envoyées, entretiens, à relancer).
- **Liées aux tâches** : relance proposée 7 jours après l'envoi sans réponse ; enregistrer une candidature envoyée ou une relance coche automatiquement la tâche correspondante (pas de double saisie).
- Après un refus, le compagnon envoie un message réconfortant, par exemple : « Leur perte. On en envoie une autre ensemble ? 🐾 » *(à intégrer)*.

### 5.7 Boutique
Dans la navigation entre Candidatures et Ville. Chapeaux, vêtements, accessoires, objets, achetés avec les pièces. Un premier objet est offert. Certains objets sont réservés à Ziggy+.

### 5.8 Les villes
4 villes : **2 campagne/périphérie** (herbe, arbres, petites maisons, chemins, commerces de proximité, calme) et **2 urbaines** (immeubles, rues, transports, bureaux, grande ville).
- **Clairebourg** (campagne, illustrée) : boulangerie, librairie, studio, agence, ponton du lac.
- Noms provisoires des autres : Les Tilleuls (campagne), Grand-Havre et Neuvelle (urbaines).

**Une ville n'est pas un fond d'écran.** Le compagnon doit pouvoir s'y déplacer, visiter des lieux, vivre des événements, rencontrer des personnages et progresser professionnellement, **en miroir de l'utilisateur** : l'utilisateur a un entretien → le compagnon aussi, dans un lieu de sa ville ; l'utilisateur décroche un poste → le compagnon aussi, avec une grande célébration.

### 5.9 Ziggy+ (freemium)
- **Gratuit** : onboarding, animal, ville, tâches du jour et tâches perso, candidatures, pièces, progression, boutique et personnalisation de base, premières recommandations.
- **Ziggy+** : animations et interactions en plus, vêtements et événements exclusifs, plus de contenu en ville, personnalisation avancée, recommandations et analyses poussées, aide avancée CV/offres/entretiens.
- **Essai gratuit de 7 jours**, puis **5,99 €/mois** ou **39,99 €/an**. Renouvellement automatique selon les conditions de l'App Store, sauf résiliation. Aucune formulation ambiguë.
- Rappels dans l'app : « Ton essai Ziggy+ se termine dans 3 jours. », puis « … demain. »
- Ne jamais présenter Ziggy+ comme « payer pour avoir le suivi de candidatures ».

### 5.10 Simulateur d'entretien (version future, ne pas développer maintenant)
À partir d'une offre (entreprise, lien, description), l'IA mène un entretien vocal de 15 à 30 min, rebondit et donne un retour. Deux modes : **Ziggy** (rassurant, ludique) et **Recruteur** (réaliste, exigeant). Fonctionnalité premium, pensée à terme pour iPad et ordinateur. La forme des données est déjà prévue dans `app/src/services/futur/`.

## 6. Tâches et pièces
Chaque tâche rapporte des **pièces** (valeurs ci-dessous, réglables dans `app/src/config/taches.ts`, un seul fichier).

| Catégorie | Tâche | Pièces |
|---|---|---|
| Se préparer | Mettre à jour ton CV | 10 |
| | Définir tes critères de recherche | 5 |
| | Mettre à jour ton profil LinkedIn | 10 |
| | Adapter ta lettre de motivation | 10 |
| Chercher | Faire 20 min de recherche d'offres | 5 |
| | Sauvegarder une offre intéressante | 2 |
| | Repérer une entreprise qui te plaît | 5 |
| Candidater | Envoyer une candidature | 10 |
| | Envoyer 5 candidatures | 40 |
| | Envoyer une candidature spontanée | 15 |
| Relancer | Relancer une candidature (7 jours après l'envoi) | 10 |
| Réseau | Ajouter un contact | 5 |
| | Appeler un recruteur | 15 |
| | Écrire à un ancien élève | 10 |
| Entretien | Préparer ton entretien | 15 |
| | Envoyer un mail de remerciement | 5 |
| Moral | Faire une vraie pause | 3 |
| Tâche perso | Créée par l'utilisateur | 5 |

**Selon le contrat recherché :** Alternance → vérifier le rythme de l'école (5) ; Alternance ou Stage → contacter le service relations entreprises (10) ; Freelance → mettre à jour son portfolio (10).

## 7. Univers visuel
- Style **kawaii mais pas enfantin**, formes rondes, ambiance cosy, typographie arrondie (SF Pro Rounded).
- **Palette tirée de Ziggy et de Clairebourg** : crème (fond), saumon du pelage (couleur de marque), brun du contour (texte), sauge, bleu du lac, or pour les pièces. **Corail vif réservé aux grandes victoires** (entretien, poste décroché).
- Toutes les couleurs, polices et espacements sont dans `app/src/config/theme.ts`.
- **Illustrations** : créées avec Dimini (et ChatGPT/Gemini pour les premières). Ce sont la source principale : ne jamais les remplacer par des illustrations génériques quand les fichiers existent. Fond transparent, sans contour blanc.

## 8. Comment travailler avec moi
- Je ne suis pas développeuse professionnelle : **explique simplement** ce que tu fais et pourquoi, sans jargon inutile.
- **Commence toujours par proposer un plan** et attends ma validation avant de coder une grosse étape.
- Avance **étape par étape**, avec une app qui fonctionne à la fin de chaque étape.
- À la fin de chaque étape, dis-moi **comment tester** sur mon iPhone.
- Pose-moi une question si un choix produit n'est pas couvert par ce fichier, au lieu de deviner.
- Code propre et commenté (en français), composants réutilisables.
- Ma maquette et mes références donnent une direction, pas une version définitive : garde ce qui marche, adapte pour que le parcours soit cohérent et fonctionnel.

## 9. Script d'onboarding de Ziggy (répliques)
À utiliser comme bulles de dialogue pendant l'onboarding (pas encore intégré). Les autres animaux suivent la même structure, avec des répliques adaptées à leur personnalité.

1. *(Un petit train arrive en gare de Clairebourg. Un renardeau descend avec une valise trop grande pour lui.)* 🦊 « Oh ! Bonjour ! Pardon, je suis un peu perdu… C'est bien ici, Clairebourg ? La ville où on trouve son premier vrai job ? »
2. 🦊 « Ouf ! Moi, c'est Ziggy. Enfin… c'est comme ça qu'on m'appelle. Si tu préfères un autre nom, je suis preneur ! »
3. 🦊 « Et toi, comment tu t'appelles ? »
4. 🦊 « Enchanté, [prénom] ! Moi, je suis venu ici pour trouver ma place. Et toi, tu cherches quoi ? »
5. 🦊 « Je vais te dire un secret… chercher tout seul, ça me fait un peu peur. Mais à deux, c'est différent. »
6. 🦊 « Chaque fois que tu avances, une candidature, une relance, un entretien, je le sens. Et moi aussi, je pars postuler de mon côté ! »
7. 🦊 « Et les refus ? Pas de panique. Chaque "non" compte aussi. Ça veut dire qu'on a osé. »
8. 🦊 « Le jour où tu décroches ton poste… moi aussi, je décroche le mien. Promis ? » → *Promis ! 🐾*
9. 🦊 « Allez, on commence doucement : ajoute ta première candidature… ou juste une offre qui te plaît. »

## 10. Architecture technique (app/)
- **Expo SDK 57, Expo Router, TypeScript.** Routes dans `app/src/app/` : `(demarrage)/` pour le parcours de démarrage, `(onglets)/` pour Accueil · Candidatures · Boutique · Ville, plus les fenêtres `ziggy-plus` et `nouvelle-candidature`.
- **Réglages** dans `app/src/config/` : `theme`, `taches`, `compagnons`, `villes`, `boutique`, `abonnement`, `candidatures`.
- **Illustrations** : un seul registre, `app/src/illustrations/registre.ts`. Fichiers dans `app/assets/` (`compagnons/<animal>/<pose>.png`, `oeufs/`, `villes/<ville>/portrait.jpg` et `paysage.jpg`). Une image manquante affiche un visuel de secours. Les animations définitives (Lottie ou Rive) se brancheront dans `app/src/components/Compagnon.tsx`.
- **Données** : un seul état (`app/src/store/`), sauvegardé sur le téléphone. Logique métier dans `app/src/logique/` (tâches du jour, rythme, dates).
- **Services** (`app/src/services/`) : connexion (bouchons à remplacer), abonnement (achat App Store à brancher), futur simulateur d'entretien.
- Avant de dire qu'une étape est terminée : `npx tsc --noEmit` et `npx eslint src` sans erreur, et parcours testé.

## 11. Questions ouvertes (à trancher avec moi)
1. **Les 4 animaux** : renard, chat, chien, loutre ? Ou garder le lapin Nugget à la place d'un autre ?
2. **Orthographe** : « Clairebourg » (retenu pour l'instant) ou « Clairbourg » ?
3. **Noms des 3 autres villes** : Les Tilleuls, Grand-Havre, Neuvelle sont provisoires.
4. **Énergie et aventure du jour** (jauge de 30 points, une aventure par jour, remise à zéro chaque matin) : on la garde en plus des pièces, ou les pièces suffisent ?
5. **Plafonds quotidiens** par tâche (anti-spam) : à réappliquer aux pièces ?
6. **Après « Décroché ! »** : le compagnon va travailler, l'aventure se termine ; la suite est à définir.
