# Pawstuler — Directive projet pour Claude Code

## 0. PHASE 0 : ANALYSE ET PLANIFICATION (avant tout code)

**I want to build the same features as the Finch: Self-Care Pet app, as an iOS app, adapted to job and apprenticeship search. Can you break down the features and the screens that I need to build? I want to plan this out before we build anything.**

Concrètement, avant d'écrire la moindre ligne de code :

1. **Décompose l'appli Finch** : liste toutes ses fonctionnalités et tous ses écrans, de l'onboarding aux réglages.
2. **Pour chaque fonctionnalité de Finch**, indique si on la **garde**, l'**adapte** à la recherche d'emploi ou la **supprime**, en t'appuyant sur les sections 1 à 9 ci-dessous.
3. **Liste les écrans de Pawstuler** : nom, rôle, contenu principal et navigation entre écrans (une arborescence simple).
4. **Recommande la stack technique iOS** : compare au moins Expo (React Native) et SwiftUI natif.
5. **Propose un découpage en étapes** (V1 puis V2), avec une appli qui fonctionne à la fin de chaque étape.
6. **Attends ma validation** avant de coder quoi que ce soit.

---

## 1. Le projet en une phrase
Pawstuler, c'est **Finch pour la recherche d'emploi et d'alternance** : une app iOS qui combine un tableau de suivi de candidatures et un petit compagnon animal qui gagne de l'énergie et part en aventure quand l'utilisateur avance dans sa recherche.

## 2. Pourquoi
Chercher un emploi ou une alternance est long, solitaire et démotivant. Les gens suivent leurs candidatures dans des tableaux Excel froids. Pawstuler rend ce suivi beau, simple et motivant, et accompagne émotionnellement l'utilisateur face aux refus.

Cible : étudiants et jeunes actifs de 18 à 35 ans, en France. App entièrement en français, avec tutoiement.

## 3. Principes non négociables
1. **On récompense l'effort, jamais le résultat.** Un refus ne fait jamais perdre d'énergie ni de progression. Enregistrer un refus rapporte même de l'énergie et un badge « courage ».
2. **Aucune culpabilisation.** Le compagnon ne meurt jamais, ne tombe jamais malade et n'est jamais triste à cause de l'absence de l'utilisateur. Les streaks sont bienveillants.
3. **Plafonds quotidiens.** Certaines tâches ont un plafond d'énergie par jour, pour encourager la régularité et non le spam (voir section 6).
4. **Simplicité.** Si une fonctionnalité complique l'app sans servir la boucle principale, elle attend la V2.

## 4. Les compagnons
L'utilisateur choisit un compagnon parmi cinq. Chacun arrive avec un nom proposé, que l'utilisateur peut **garder ou changer** à l'onboarding, puis à tout moment dans les réglages.

| Animal | Nom proposé | Personnalité |
|---|---|---|
| 🦊 Renard | **Ziggy** | Curieux et débrouillard, un peu perdu au début mais plein de ressources |
| 🐱 Chat | **Mochi** | Calme, observateur, un brin perfectionniste |
| 🐶 Chien | **Waffle** | Enthousiaste et loyal, ton meilleur supporter |
| 🦦 Loutre | **Kiwi** | Sociable, elle connaît tout le monde en ville |
| 🐰 Lapin | **Nugget** | Un peu stressé mais courageux |

## 5. Fonctionnalités principales

### 5.1 Onboarding
- Scène d'arrivée du compagnon, à la manière de Finch (voir section 9 pour le script du renard). Les autres animaux suivent la même structure, avec des répliques adaptées à leur personnalité.
- Choix du profil : **Emploi** ou **Alternance**. Ce choix ajoute des tâches spécifiques (voir section 6), le reste du parcours est identique.
- Prénom de l'utilisateur et nom du compagnon (modifiable).
- Critères optionnels : poste recherché, ville, et pour l'alternance le rythme et la date de rentrée.

### 5.2 Tableau de candidatures
Une fiche par candidature, avec les champs suivants :
- Entreprise, intitulé du poste, lien de l'annonce, date d'envoi
- Type : candidature sur offre ou spontanée
- Statuts (oui/non) : **Candidature envoyée**, **Relance faite**, **Entretien obtenu**
- **Réponse** : En attente / Refus / Décroché !
- **Note** libre : ce qui s'est dit en entretien, nom du recruteur, ressenti

Le tableau doit être beau et lisible, comme les tableaux de suivi qu'on voit sur TikTok, mais en plus agréable. Il faut pouvoir filtrer par statut.

Relance : un rappel est proposé automatiquement à J+7 après l'envoi s'il n'y a pas de réponse (notification locale).

### 5.3 Tâches du jour et énergie
L'utilisateur coche des tâches, et chacune rapporte de l'énergie. Quand la jauge du jour atteint **30 points**, le compagnon part en aventure.

Quand l'utilisateur met à jour une candidature dans le tableau (envoi, relance, entretien, réponse), la tâche correspondante est validée automatiquement et l'énergie est attribuée. Pas de double saisie.

### 5.4 Le compagnon et les aventures
- Le compagnon vit dans une **petite ville cosy, Clairbourg** (nom provisoire), et **il cherche lui aussi son job** : il postule dans une boutique, une agence, une boulangerie, un studio… Son histoire est le miroir de celle de l'utilisateur.
- Une aventure = un court récit (2 ou 3 phrases) de sa journée dans la ville, avec une récompense aléatoire : un accessoire ou une tenue.
- Accessoires thématiques : mini-tenue d'entretien, cravate, sac à dos d'alternant, lunettes, badge d'entreprise…
- Quand l'utilisateur passe une réponse en **« Décroché ! »**, le compagnon décroche aussi son job, avec une grande animation de célébration.
- Après un refus, le compagnon envoie un message réconfortant, par exemple : « Leur perte. On en envoie une autre ensemble ? 🐾 »

## 6. Tâches et énergie

| Étape | Tâche | Énergie | Plafond/jour |
|---|---|---|---|
| Se préparer | Mettre à jour mon CV | +10 | 1 |
| | Rédiger ou adapter ma lettre de motivation | +10 | 2 |
| | Mettre à jour mon profil LinkedIn | +10 | 1 |
| | Définir mes critères (poste, ville, rythme) | +5 | 1 |
| Chercher | Faire 20 min de recherche d'offres | +5 | 2 |
| | Sauvegarder une offre intéressante | +2 | 5 |
| | Repérer une entreprise cible (sans offre) | +5 | 3 |
| Candidater | Envoyer une candidature | +10 | 5 |
| | Envoyer une candidature spontanée | +15 | 3 |
| | Adapter mon CV à une offre précise | +5 | 3 |
| Relancer | Relancer une entreprise | +10 | 5 |
| Réseau | Écrire à un contact, ancien élève ou recruteur | +10 | 3 |
| | Aller à un salon ou un job dating | +20 | 1 |
| Entretien | Décrocher un entretien 🎉 | +20 | aucun |
| | Préparer mon entretien | +15 | aucun |
| | Passer l'entretien | +25 | aucun |
| | Envoyer un mail de remerciement | +5 | aucun |
| | Noter mon debrief | +5 | aucun |
| Réponse | Enregistrer un refus (+ badge courage) | +10 | aucun |
| | Décrocher le poste | Célébration spéciale | — |
| Moral | Faire une pause / sortir prendre l'air / fêter une petite victoire | +3 chacune | 3 au total |

**Tâches supplémentaires si profil Alternance :**
- Vérifier le calendrier et le rythme de l'école : +5 (1/jour)
- Demander de l'aide au service relations entreprises de l'école : +10 (1/jour)
- Envoyer les documents du contrat à l'école : +15 (une fois l'alternance trouvée)

Toutes ces valeurs doivent être centralisées dans **un seul fichier de configuration**, pour pouvoir les ajuster facilement.

## 7. Univers visuel (provisoire)
Le visuel définitif sera travaillé plus tard, en partant du personnage lui-même (voir la demande de la V2 ci-dessous). En attendant, comme point de départ :
- Style **kawaii mais pas enfantin**, formes rondes, ambiance cosy.
- Palette de base : pastels chauds (crème, pêche, sauge) + **une couleur d'accent vive (corail) réservée aux victoires** (entretien obtenu, poste décroché). Cette palette est un point de départ, à ajuster une fois le style du compagnon défini.
- Typographie arrondie et lisible.
- Toutes les couleurs, polices et espacements doivent être centralisés dans un fichier de thème, pour pouvoir changer l'identité visuelle sans toucher au reste.

## 8. Comment travailler avec moi
- Je ne suis pas développeuse professionnelle : **explique simplement** ce que tu fais et pourquoi, sans jargon inutile.
- **Commence toujours par proposer un plan** et attends ma validation avant de coder une grosse étape.
- Avance **étape par étape**, avec une app qui fonctionne à la fin de chaque étape.
- À la fin de chaque étape, dis-moi **comment tester** sur mon iPhone.
- Pose-moi une question si un choix produit n'est pas couvert par ce fichier, au lieu de deviner.
- Code propre et commenté, composants réutilisables.

## 9. Script d'onboarding : le renard (Ziggy)
Scène sous forme de bulles de dialogue, un écran à la fois, avec des boutons de réponse.

1. *(Un petit train arrive en gare de Clairbourg. Un renardeau descend avec une valise trop grande pour lui.)*
   🦊 « Oh ! Bonjour ! Pardon, je suis un peu perdu… C'est bien ici, Clairbourg ? La ville où on trouve son premier vrai job ? »
   → *Oui, bienvenue !* / *On va le découvrir ensemble*
2. 🦊 « Ouf ! Moi, c'est Ziggy. Enfin… c'est comme ça qu'on m'appelle. Si tu préfères un autre nom, je suis preneur ! »
   → *Champ de texte prérempli avec « Ziggy »*
3. 🦊 « Et toi, comment tu t'appelles ? »
   → *Champ prénom*
4. 🦊 « Enchanté, [prénom] ! Moi, je suis venu ici pour trouver ma place. Et toi, tu cherches quoi ? »
   → *Un emploi* / *Une alternance*
5. Réponse adaptée :
   - Alternance : 🦊 « Une alternance ?! Comme moi ! On va pouvoir réviser nos CV ensemble. »
   - Emploi : 🦊 « Un emploi ! Alors on est deux à chercher. Ça tombe bien, je n'aime pas chercher tout seul. »
6. 🦊 « Je vais te dire un secret… chercher tout seul, ça me fait un peu peur. Mais à deux, c'est différent. »
7. 🦊 « Voilà comment ça marche : chaque fois que tu avances, une candidature, une relance, un entretien, tu me donnes de l'énergie. Et avec cette énergie, je pars explorer Clairbourg et postuler de mon côté ! »
8. 🦊 « Et les refus ? Pas de panique. Chaque "non" compte aussi. Ça veut dire qu'on a osé. »
9. 🦊 « Le jour où tu décroches ton poste… moi aussi, je décroche le mien. Promis ? »
   → *Promis ! 🐾*
10. 🦊 « Allez, on commence doucement : ajoute ta première candidature… ou juste une offre qui te plaît. »
    → *Ouverture du tableau de candidatures*
