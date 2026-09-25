# Pawstuler — Directive projet pour Claude Code

## 0. OÙ EN EST LE PROJET

- **Phase 0 (analyse et plan) : terminée et validée.** Stack choisie : **Expo (React Native)**, pour tester sur iPhone avec Expo Go, sans Mac.
- **Maquette HTML** (`maquette/`) : première exploration visuelle, ne plus la faire évoluer. La référence est désormais l'app.
- **App Expo** (`app/`) : application complète et fonctionnelle (données sur le téléphone) : démarrage, tâches, pièces, énergie, aventures, candidatures, Shop, ville, « J'ai décroché ! », aventure professionnelle, Compte, Pawstuler Premium (voir section 10).
- **Illustrations du Drive branchées** : les 4 compagnons (9 poses chacun), l'œuf propre à chaque animal (5 étapes), Clairebourg (lac pour l'accueil, centre-ville pour l'onglet ville) et Sunnyville (place à la fontaine).
- **Ajouts récents** : connexion réelle prête à brancher (Supabase, voir `docs/connexion-et-abonnement.md`), écran d'abonnement **Pawstuler Premium**, objectif de série 🐾 à l'onboarding avec badge sur l'accueil, page de profil du compagnon.
- Prochaines étapes : brancher les clés (connexion, RevenueCat), les animations Dimini, puis les vrais services (connexion, paiement App Store, notifications, compte en ligne).

Avant tout gros changement : proposer un plan et attendre ma validation (section 8).

**Où se trouve le travail :** la branche `main` est la référence. Chaque nouvelle étape est préparée sur la branche `claude/youthful-hopper-ls2cpi`, puis fusionnée dans `main`.

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
5. **La version gratuite est vraiment utile** : Pawstuler Premium enrichit l'expérience, il ne débloque pas l'essentiel.
6. **Simplicité.** Si une fonctionnalité complique l'app sans servir la boucle principale, elle attend.

## 4. Les compagnons
L'utilisateur choisit **un compagnon parmi 4**. Chacun a ses illustrations, ses animations, ses réactions, un nom proposé (modifiable à l'onboarding puis dans les réglages) et pourra être personnalisé.

| Animal | Nom proposé | Personnalité |
|---|---|---|
| 🦊 Renard | **Ziggy** | Curieux et débrouillard, un peu perdu au début mais plein de ressources |
| 🐱 Chat | **Mochi** | Calme, observateur, un brin perfectionniste |
| 🐊 Crocodile | **Milo** | Grand cœur sous ses airs sérieux *(personnalité proposée par Claude)* |
| 🐰 Lapin | **Nala** | Un peu stressé mais courageux |

Le crocodile remplace le chien pour avoir des silhouettes bien différentes. Le renard Ziggy reste le personnage de référence ; l'utilisateur choisit l'un des quatre et lui donne le prénom qu'il veut.

**Poses de chaque compagnon** (une image chacune, remplacées plus tard par des animations) : salut, neutre, content, excité, dort, réconfort, fier, aventure, célébration.

**Il est toujours vivant** : il respire, se promène dans sa ville et réagit dès qu'une tâche est cochée. **Il vit à son rythme** : heure de réveil et de coucher réglables dans Compte › Paramètres (8 h – 22 h par défaut) ; en dehors, il dort (on peut quand même avancer, il découvre les progrès au réveil).

## 5. Le parcours et les fonctionnalités

### 5.1 Parcours complet
Présentation → Connexion → Onboarding (prénom → objectif → choix de l'animal → œuf → naissance → prénom du compagnon → ville → objectif de série) → Accueil → Tâches → Récompenses → Pièces → Shop → Personnalisation → Candidatures → Progression → Aventures en ville → 🎉 J'ai décroché → 💼 Mon aventure professionnelle → Objectifs / progression → 🔎 Nouvelle recherche éventuelle.

**Navigation : 5 onglets** — Accueil · Candidatures · Shop · Clairebourg (la ville du compagnon) · Compte.

### 5.2 Présentation
Un seul écran court avant tout : l'animal, une phrase d'accroche, 4 points (tâches du jour, candidatures, pièces et personnalisation, compagnon qui vit et cherche avec toi).

### 5.3 Connexion
Apple, Google, e-mail/mot de passe (création de compte, connexion, mot de passe oublié). Les comptes sont gérés par **Supabase** (`app/src/services/auth`) :
- **Mode réel** dès que les clés sont dans `app/.env` : Apple via la fenêtre native d'Apple, Google via la page de connexion Google sécurisée, e-mail via Supabase. Messages d'erreur simples en français.
- **Mode démo** tant que les clés sont absentes : chaque méthode crée un compte local sur le téléphone (comme avant), avec la mention « Version de test ».
- Déconnexion : ferme la session en ligne, les données restent sur le téléphone. Suppression du compte : en ligne (fonction serveur `supprimer-compte`) puis sur le téléphone.
- **Ce qu'il reste à configurer de mon côté** (comptes Apple Developer, Supabase, Google Cloud, Expo, RevenueCat) : `docs/connexion-et-abonnement.md`. Apple et les achats ne se testent que dans une version construite avec EAS, pas dans Expo Go.

### 5.4 Onboarding
1. **Prénom** : « Comment tu t'appelles ? »
2. **Objectif** : Emploi, puis type de contrat facultatif et multiple (CDI, CDD, Stage, Alternance, Freelance). Sert à personnaliser les tâches.
3. **Choix de l'animal** parmi les 4, très visuel.
4. **Œuf** : œuf intact → il tremble légèrement → première fissure → plusieurs fissures → il s'ouvre → l'animal apparaît → petite animation de bienvenue. L'utilisateur touche l'œuf pour avancer. Élément magique assumé, pour tous les animaux.
5. **Prénom du compagnon** : son nom s'affiche en grand, « Comment veux-tu l'appeler ? », « Saisis son prénom », prérempli avec le nom proposé.
6. **Ville** : « Où veux-tu commencer ton aventure ? », une carte par ville (voir 5.8).
7. **Objectif de série** 🐾 : « Ton petit objectif de série », au choix 2, 5 (par défaut), 7 ou 14 jours d'affilée. Ton bienveillant : « Chaque petite série compte », « Pas de pression : si tu fais une pause, ta série recommence simplement. Tu ne perds rien. » Puis l'accueil.

### 5.4 bis Série de jours 🐾 (streak)
- Un jour compte dès que l'utilisateur **ouvre l'app** (une fois par jour). Lendemain : +1 ; même jour : rien ne change ; après une pause : la série recommence à 1.
- **Jamais de culpabilisation** : une pause ne fait rien perdre (pièces, objets, compagnon, meilleure série gardés). Au retour, le compagnon dit « Content de te revoir ! On repart ensemble, à ton rythme 🐾 ». Objectif atteint : « X jours d'affilée, objectif atteint ! Merci d'être là 🐾 ».
- **Badge permanent** en haut de l'accueil, à gauche du compteur de pièces (🐾 + nombre de jours). Le toucher ouvre le profil du compagnon, où l'on peut changer d'objectif.
- Réglages : `app/src/config/serie.ts`.

### 5.5 Accueil et tâches du jour
L'accueil est simple : en haut, le badge de série 🐾 et le compteur de pièces ; puis le compagnon dans sa ville, puis **« Tes tâches du jour »**, sans accumulation de widgets.
- Chaque matin, l'app propose ~5 tâches : relances à faire, tâches de démarrage jamais faites (CV, critères, LinkedIn), une tâche liée au contrat, puis des tâches variées. Plus tard, elles pourront être générées par l'IA.
- L'utilisateur peut créer ses propres tâches (elles restent d'un jour à l'autre tant qu'elles ne sont pas faites).
- Boucle : **tâche → validation → animation → pièces**.

### 5.5 bis Énergie ⚡ et Aventure du jour
- **L'énergie n'est pas une monnaie** : c'est la capacité du compagnon à vivre des moments dans la journée (ex. ⚡ 30/30).
- Elle se dépense : câlin (5), jeu (10), **Aventure du jour** (20). Elle revient au maximum chaque matin, et chaque tâche terminée en redonne 3 (reprises si on décoche). Réglages dans `app/src/config/energie.ts`.
- **Aventure du jour** : un court récit dans un lieu de la ville, en miroir du parcours de l'utilisateur, + 10 pièces. Gratuit : 1 par jour, puis « Nouvelle aventure demain ». Premium : jusqu'à 3 par jour. Chaque premier passage dans un lieu l'ajoute à la « Découverte » du compagnon et lui offre un souvenir pour sa collection.

### 5.5 ter Pièces 🪙 (portefeuille)
- Gagnées gratuitement avec les tâches (et les aventures, les objectifs pro, « J'ai décroché ! »). **Jamais remises à zéro** : elles s'accumulent.
- **Plafond : 50 pièces gagnées par jour** (tâches, aventures, objectifs). Au-delà, les tâches se cochent toujours, sans pièce en plus, avec un message bienveillant. Le compteur « x/50 aujourd'hui » est affiché sur l'accueil. Le bonus « J'ai décroché ! » n'est pas plafonné.
- Dépensées dans le Shop : le solde est **réellement débité** (confirmation avec solde avant / après).
- **Un seul solde**, identique partout (accueil, Shop, Compte › Portefeuille avec l'historique des gains et dépenses).

### 5.6 Candidatures
Un vrai suivi de candidatures, mais simple et dans notre univers, jamais un gros tableau Excel.
- Fiche : entreprise, poste, lien, contact, date d'envoi, statut, note.
- Statuts : À envoyer → Envoyée → Relancée → Entretien → Offre reçue, ou Refus.
- Recherche rapide, filtres par statut, compteurs (envoyées, entretiens, à relancer).
- **Liées aux tâches** : relance proposée 7 jours après l'envoi sans réponse ; enregistrer une candidature envoyée ou une relance coche automatiquement la tâche correspondante (pas de double saisie).
- Fiche détaillée : statut, date d'entretien, note, **historique** des statuts, archivage (jamais de suppression automatique).
- Après un refus, le compagnon envoie un message réconfortant : « Leur perte. On en envoie une autre ensemble ? 🐾 »

### 5.7 Shop
Dans la navigation entre Candidatures et Clairebourg. Chapeaux, vêtements, accessoires, objets, achetés avec les pièces. Un premier objet est offert. Certains objets sont réservés à Pawstuler Premium.

### 5.8 Les villes
2 villes :
- **Clairebourg** (campagne, nom écrit exactement ainsi) : petite ville française fictive, illustrée — boulangerie, librairie, studio, agence, café, parc.
- **Sunnyville** (grande ville) : immeubles, bureaux, commerces, transports. Illustrée (place à la fontaine, cafés, commerces) et disponible au choix ; ses lieux actuels (bureaux, start-up, agence de com, café du métro, parc) sont provisoires. Les panneaux de son illustration sont en anglais (« To the Market », « City Library ») : à franciser dans une prochaine version de l'image.
L'architecture permet d'ajouter d'autres villes plus tard dans `app/src/config/villes.ts`.

**Une ville n'est pas un fond d'écran.** Le compagnon doit pouvoir s'y déplacer, visiter des lieux, vivre des événements, rencontrer des personnages et progresser professionnellement, **en miroir de l'utilisateur** : l'utilisateur a un entretien → le compagnon aussi, dans un lieu de sa ville ; l'utilisateur décroche un poste → le compagnon aussi, avec une grande célébration.

### 5.9 Pawstuler Premium (freemium)
- **Nom affiché : « Pawstuler Premium »**, jamais lié au nom du compagnon (l'ancien nom « Ziggy+ » n'est plus utilisé).
- **Gratuit** : onboarding, animal, ville, tâches du jour et tâches perso, candidatures, pièces, progression, boutique et personnalisation de base, premières recommandations.
- **Premium** : animations et interactions en plus, vêtements et événements exclusifs, plus de contenu en ville, personnalisation avancée, recommandations et analyses poussées, aide avancée CV/offres/entretiens.
- **Offre** :
  - **Annuel : 39,99 €/an, avec 7 jours d'essai gratuit** (l'essai est réservé à l'annuel et proposé une seule fois).
  - **Mensuel : 5,99 €/mois, sans essai gratuit** (payé dès la confirmation).
- **Écran d'abonnement** (`app/src/app/premium.tsx`, s'ouvre depuis Compte, le Shop, les aventures et les rappels) : ce qui reste gratuit, ce que Premium ajoute, choix de la formule, frise de l'essai (aujourd'hui 0 € → rappel → date et montant du premier paiement), phrase complète sous le bouton (prix après l'essai, renouvellement automatique, résiliation au moins 24 h avant), mention légale App Store, liens « Restaurer mes achats », « Conditions d'utilisation », « Confidentialité ». Aucune formulation ambiguë.
- Rappels dans l'app : « Ton essai Premium se termine dans 3 jours. Ensuite : 39,99 €/an, sauf résiliation. », puis « … demain. »
- Paiement réel : App Store via **RevenueCat**, à brancher dans `app/src/services/abonnement.ts` (produits `pawstuler_premium_annuel` et `pawstuler_premium_mensuel`, entitlement `premium`). En attendant, l'achat est simulé.
- Ne jamais présenter Premium comme « payer pour avoir le suivi de candidatures ».

### 5.10 🎉 « J'ai décroché ! » et 💼 Mon aventure professionnelle
- Depuis une candidature (entretien ou offre) ou depuis l'onglet Candidatures : grande célébration, le compagnon décroche lui aussi un poste dans sa ville (+50 pièces).
- **L'app n'est pas terminée : un nouveau chapitre commence.** Aucune candidature n'est supprimée ; l'utilisateur choisit de les garder telles quelles ou de les archiver.
- **Mon aventure professionnelle** : 🏢 entreprise, 💼 poste, 📅 premier jour, 🎯 objectifs personnels (ajout libre, +15 pièces quand atteints), 📈 progression.
- **Les tâches changent de contexte** (même moteur) : préparer son premier jour, objectifs du premier mois, découvrir son environnement, bilan de la première semaine, compétence à développer, point sur sa progression…
- **Retour à la recherche plus tard** : « Recommencer une recherche » ouvre un nouveau parcours ; l'historique (postes, candidatures), le compagnon et les pièces sont conservés.

### 5.11 Compte
Une vraie section : Mon profil (prénom, compagnon, ville, contrat), Mon portefeuille, Mon parcours pro, Paramètres (notifications, rythme du compagnon), Confidentialité (données, RGPD, export), Abonnement Pawstuler Premium, **Profil du compagnon**, déconnexion (les données restent sur le téléphone) et suppression du compte.

### 5.11 bis Profil du compagnon
Une vraie page (`app/src/app/compagnon.tsx`), ouverte depuis le badge de série de l'accueil ou Compte › « Profil de [nom] » :
- **Photo** du compagnon (pose « fier ») dans le décor de sa ville, **nom** en grand, espèce, **pronoms** s'ils sont choisis (Il / lui, Elle, Iel ; facultatifs, modifiables dans Compte › Profil ; les textes s'accordent), ville.
- **Badge de série** + meilleure série + nombre d'aventures ; objectif de série modifiable.
- Onglets **À propos** (présentation, depuis quand il vit en ville, recherche ou poste) / **Détails** (espèce, pronoms, date de naissance, ville, situation, collection) / **Traits** (traits de caractère, ce qu'il aime).
- **Collection** en grille : objets du Shop possédés et **souvenirs d'aventure** (un par lieu de la ville, offert au premier passage) ; ce qui n'est pas encore obtenu apparaît en silhouette « ??? ».
- **Découverte** : les lieux de la ville explorés en aventure (avec la date), les autres « Lieu à découvrir ».
- Réglages : textes et traits dans `compagnons.ts`, souvenirs dans `villes.ts`.

### 5.12 Simulateur d'entretien (version future, ne pas développer maintenant)
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

**Plafond : 50 pièces gagnées par jour** (voir 5.5 ter).

**Après « J'ai décroché ! » (contexte pro) :** préparer ton premier jour (10), définir tes objectifs du premier mois (10), découvrir ton nouvel environnement (5), prendre un café avec un collègue (5), préparer une présentation (15), bilan de ta première semaine (10), choisir une compétence à développer (10), faire le point sur ta progression (10). Objectif pro atteint : 15.

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
- **Expo SDK 57, Expo Router, TypeScript.** Routes dans `app/src/app/` : `(demarrage)/` (présentation, connexion, onboarding), `(onglets)/` (accueil, candidatures, boutique = Shop, ville, compte), `candidature/[id]`, `compte/*` (profil, parametres, confidentialite, portefeuille), `compagnon` (profil du compagnon), et les fenêtres `aventure`, `decroche`, `aventure-pro`, `nouvelle-candidature`, `premium` (abonnement). L'onboarding se termine par `(demarrage)/serie`.
- **Réglages** dans `app/src/config/` : `theme`, `taches`, `energie`, `aventures`, `compagnons`, `villes`, `boutique`, `abonnement`, `candidatures`, `serie`.
- **Illustrations** : un seul registre, `app/src/illustrations/registre.ts`. Fichiers dans `app/assets/` : `compagnons/<animal>/<pose>.png` ; `oeufs/<animal>-1-intact.png`, `-2-fissure`, `-3-craquele`, `-eclosion`, `-ne` ; `villes/<ville>/portrait.jpg` (accueil), `paysage.jpg` (cartes) et `centre.jpg` (onglet ville, facultatif). Une image manquante affiche un visuel de secours. Les animations définitives (Lottie ou Rive) se brancheront dans `app/src/components/Compagnon.tsx`.
- **Données** : un seul état (`app/src/store/`), sauvegardé sur le téléphone ; les anciennes sauvegardes sont migrées automatiquement. Logique métier dans `app/src/logique/` (tâches du jour, vie du compagnon, rythme, dates).
- **Services** (`app/src/services/`) : connexion (`auth/` : Supabase en mode réel, compte local en mode démo ; clés dans `app/.env`, modèle `app/.env.exemple`), abonnement (achat App Store via RevenueCat à brancher), compte et RGPD (export, suppression), futur simulateur d'entretien.
- Avant de dire qu'une étape est terminée : `npx tsc --noEmit` et `npx eslint src` sans erreur, et parcours testé.

## 11. Décisions prises par Claude, à valider
Ces valeurs ne viennent pas de mes consignes : Claude les a choisies pour que l'app fonctionne. Elles sont toutes réglables dans `app/src/config/`.
- **Énergie** (`energie.ts`) : 30 max, câlin 5, jeu 10, Aventure du jour 20, +3 par tâche terminée, recharge complète chaque matin. Aucun document ne précise d'autres valeurs.
- **Moments avec le compagnon** : « Câlin » et « Jouer » sont des propositions de Claude pour donner une utilité à l'énergie.
- **Récompenses** : aventure +10 pièces, objectif pro atteint +15, « J'ai décroché ! » +50.
- **Premium** : 3 aventures par jour (contre 1 en gratuit).
- **Shop** (`boutique.ts`) : la liste des objets et leurs prix (de 20 à 150 pièces), l'écharpe offerte, la couronne réservée à Premium.
- **Récits d'aventure** (`aventures.ts`) et **lieux de Sunnyville** : textes provisoires.
- **Personnalité du crocodile** : « Grand cœur sous ses airs sérieux ».
- **Série** (`serie.ts`) : un jour compte à l'ouverture de l'app ; objectifs proposés 2, 5, 7, 14 jours (5 par défaut) et leurs textes.
- **Profil du compagnon** : les descriptions, traits et « ce qu'il aime » de chaque animal (`compagnons.ts`), les souvenirs de chaque lieu (`villes.ts`), les pronoms proposés (Il / lui, Elle, Iel).
- **Connexion** : choix de Supabase (comptes + future sauvegarde en ligne, région Europe) et de RevenueCat pour l'abonnement.

## 12. Questions ouvertes
Aucune question bloquante. À ajuster après tes premiers tests sur iPhone : les valeurs de la section 11.
- **Plan « animal vivant »** (énergie 30/100 avec recharge toutes les 5 h / 3 h, animations câlin, jeu, baignade, repos, recherche de Milo, opportunités du jour, journal) : proposé, en attente de ta validation et des fichiers du Drive.
