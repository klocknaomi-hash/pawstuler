# Pawstuler — Directive projet pour Claude Code

## 0. OÙ EN EST LE PROJET

- **Phase 0 (analyse et plan) : terminée et validée.** Stack choisie : **Expo (React Native)**, pour tester sur iPhone avec Expo Go, sans Mac.
- **Maquette HTML** (`maquette/`) : première exploration visuelle, ne plus la faire évoluer. La référence est désormais l'app.
- **App Expo** (`app/`) : application complète et fonctionnelle (données sur le téléphone) : démarrage, tâches, pièces, énergie, aventures, candidatures, Shop, ville, « J'ai décroché ! », aventure professionnelle, Compte, Pawstuler Premium (voir section 10).
- **Illustrations du Drive branchées** : les 4 compagnons (9 poses chacun), l'œuf propre à chaque animal (5 étapes), Clairebourg (lac pour l'accueil, centre-ville pour l'onglet ville) et Sunnyville (place à la fontaine).
- **Ajouts récents** : **système miroir corrigé** (Milo a son propre calendrier, décalé du tien : demande d'entretien, entretien 2 jours après le tien, tenue d'entretien, refus expliqué ; voir 5.5 ter), **scènes animées** des aventures (rue, téléphone, entretien, refus), **tâches mesurables** (3/5, se cochent toutes seules), rythme de Milo choisi à l'onboarding, moments « Se reposer » / « Se baigner », statut Premium / gratuit / essai avec énergie en temps réel, refonte des candidatures, connexion réelle prête à brancher (Supabase, voir `docs/connexion-et-abonnement.md`), écran d'abonnement **Pawstuler Premium**, objectif de série 🐾 à l'onboarding avec badge sur l'accueil, page de profil du compagnon, **garde-robe « Tenues complètes »** du chat (55 tenues) et du crocodile (43 tenues).
- **Finitions faites** : petits mouvements du compagnon (câlin, jeu, gestes spontanés), rappels sur le téléphone, rencontre avec le compagnon (dialogues d'onboarding), icône de l'app, brouillons de textes légaux.
- Prochaines étapes : tes tests sur iPhone et l'ajustement des valeurs (section 11), puis les services en ligne avec **Supabase seul** (choix validé : pas de Neon ni de Drizzle) : connexion, sauvegarde en ligne, paiement RevenueCat, publication (EAS).

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
3. **Confiance, pas surveillance.** L'utilisateur déclare lui-même ses tâches terminées (CV, critères, préparer un entretien…). Il peut cocher, décocher (la récompense est alors reprise) et supprimer une tâche. Exception : les **tâches mesurables** (« Envoyer 3 candidatures », « Relancer une candidature ») suivent ses vraies données (3/5) et se cochent toutes seules : on ne fabrique pas une progression qui n'existe pas.
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

**Il est toujours vivant** : il respire, se promène dans sa ville, fait de petits gestes tout seul (petit bond, balancement, étirement) et réagit dès qu'une tâche est cochée. **Câlin** : il se blottit et des cœurs s'envolent. **Jouer** : il sautille et un ballon rebondit. Endormi, le toucher fait apparaître des « z z z ». Le tout dans `Compagnon.tsx` et `Effets.tsx`, en attendant les animations Dimini. **Il vit à son rythme** : heure de réveil et de coucher réglables dans Compte › Paramètres (8 h – 22 h par défaut) ; en dehors, il dort (on peut quand même avancer, il découvre les progrès au réveil).

## 5. Le parcours et les fonctionnalités

### 5.1 Parcours complet
Présentation → Connexion → Onboarding (prénom → objectif → choix de l'animal → œuf → naissance → prénom du compagnon → rencontre → rythme du compagnon → ville → objectif de série) → Accueil → Tâches → Récompenses → Pièces → Shop → Personnalisation → Candidatures → Progression → Aventures en ville → 🎉 J'ai décroché → 💼 Mon aventure professionnelle → Objectifs / progression → 🔎 Nouvelle recherche éventuelle.

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
5 bis. **La rencontre** : le compagnon se présente en 6 bulles (d'après le script de la section 9, adapté à chaque animal), puis « Promis ! 🐾 ». Bouton « Passer ». Répliques dans `app/src/config/dialogues.ts`. Sur l'accueil, tant qu'aucune candidature n'existe, il propose le premier pas (réplique 9).
5 ter. **Le rythme du compagnon** 🌞 🌙 : « Bon… maintenant que tu me connais un peu, il faut qu'on règle mon petit rythme de vie ! », puis « Et Milo, il se réveille à quelle heure ? 🌞 » (6 h à 10 h) et « Et à quelle heure est-ce qu'il va dormir ? 🌙 » (21 h à minuit) ; Milo réagit (« Parfait ! Je vais essayer de tenir ce rythme… »). Ces horaires sont vraiment utilisés : avant son réveil et après son coucher, il dort dans sa maison et ne part pas à l'aventure (`(demarrage)/rythme.tsx`, modifiable dans Compte › Paramètres).
6. **Ville** : « Où veux-tu commencer ton aventure ? », une carte par ville (voir 5.8).
7. **Objectif de série** 🐾 : « Ton petit objectif de série », au choix 2, 5 (par défaut), 7 ou 14 jours d'affilée. Ton bienveillant : « Chaque petite série compte », « Pas de pression : si tu fais une pause, ta série recommence simplement. Tu ne perds rien. » Puis l'accueil.

### 5.4 bis Série de jours 🐾 (streak)
- Un jour compte dès que l'utilisateur **ouvre l'app** (une fois par jour). Lendemain : +1 ; même jour : rien ne change ; après une pause : la série recommence à 1.
- **Jamais de culpabilisation** : une pause ne fait rien perdre (pièces, objets, compagnon, meilleure série gardés). Au retour, le compagnon dit « Content de te revoir ! On repart ensemble, à ton rythme 🐾 ». Objectif atteint : « X jours d'affilée, objectif atteint ! Merci d'être là 🐾 ».
- **Badge permanent** en haut de l'accueil, à gauche du compteur de pièces (🐾 + nombre de jours). Le toucher ouvre le profil du compagnon, où l'on peut changer d'objectif.
- Réglages : `app/src/config/serie.ts`.

### 5.5 Accueil et tâches du jour
L'accueil est simple : en haut, le badge de série 🐾 et le compteur de pièces ; puis le compagnon dans sa ville (avec sa barre d'énergie), puis **une seule carte verte « Aventure du jour »**, puis Câlin / Jouer, puis Se reposer / Se baigner, puis **« Tes tâches du jour »**, sans accumulation de widgets ni journal.
- Chaque matin, l'app propose ~5 tâches **selon ta situation réelle** : relances prévues (le jour choisi, ou 7 jours après l'envoi), « Préparer ton entretien chez X » dans les 3 jours avant un entretien, « Envoyer un mail de remerciement à X » le lendemain, tâches de démarrage jamais faites (CV, critères, LinkedIn), une tâche liée au contrat, un **objectif de candidatures** (1, puis 3 si tu as postulé la veille, 5 si tu en as envoyé 5 ou plus), puis des tâches variées. Plus tard, elles pourront être générées par l'IA (à brancher avec Supabase, pour protéger la clé).
- **Tâches mesurables** (candidatures, relances) : barre de progression « 3/5 », elles se cochent toutes seules quand tu enregistres tes candidatures ou tes relances ; pas de case à cocher à la main. Les autres restent à cocher.
- L'utilisateur peut créer ses propres tâches (elles restent d'un jour à l'autre tant qu'elles ne sont pas faites).
- Boucle : **tâche → validation → animation → pièces**.

### 5.5 bis Énergie ⚡ et Aventure du jour
- **L'énergie n'est pas une monnaie** : c'est la capacité du compagnon à vivre des moments. Elle ne baisse **que** quand on lui demande une action (câlin, jeu, aventure, moment pour souffler) ; consulter une page ou recevoir une notification ne coûte rien.
- **Gratuit : 30 maximum, recharge complète 5 h** après la première dépense. **Premium et essai : 100 maximum, recharge complète 3 h.** Le compte à rebours démarre quand l'énergie passe sous le maximum ; au bout du délai, elle revient entièrement, même si l'app est fermée (heure réelle). Plus de recharge chaque matin.
- Affichage sous la jauge : « 15/30 · Recharge dans 4 h 12 ». Action impossible faute d'énergie : explication simple (« Milo n'a plus assez d'énergie pour faire ça. Recharge complète dans 2 h 10. »).
- Coûts actuels : câlin 5, jeu 10, aventures (voir 5.5 ter). Chaque tâche terminée redonne 3 (reprises si on décoche). En passant Premium, l'énergie monte tout de suite à 100. Réglages : `app/src/config/energie.ts`, calculs : `app/src/logique/energie.ts`.
- **Aventure du jour** : une seule carte verte sous la scène. Elle dit ce que Milo va faire (« Milo part déposer son CV chez Boulangerie Mercier · 10 ⚡ »), puis « Milo est chez … · Retour à 11 h 05 », « Milo est rentré ! Découvre son aventure », « Son entretien est à 11 h 30 », « Nouvelle aventure demain » ou en Premium « Prochaine aventure à 14 h 43 ». Au retour : **d'abord le récit** (2-3 phrases et la récompense), puis, plus discret, « Une nouvelle aventure sera possible demain ».
- **Quota** (indépendant de l'énergie) : **gratuit 1 aventure par jour** ; **Premium 3 par jour au plus, avec 3 h entre deux départs** (départ 8 h 43 → suivante à 11 h 43 → puis 14 h 43). Les aventures non utilisées ne se cumulent pas. Heure réelle du téléphone.

### 5.5 ter Système miroir : Milo vit sa propre recherche, en décalé
- **40 candidatures = 40 candidatures enregistrées, pas 40 aventures.** Milo suit ta recherche dans son ensemble, avec **un peu de décalage** : il ne fait jamais exactement la même chose que toi au même moment. Son aventure du jour est choisie au moment où tu l'envoies, d'après ton parcours à cet instant, puis **ne change plus** (même si tu mets une candidature à jour pendant qu'il est parti : ça comptera pour les prochaines).
- **Son calendrier**, par ordre d'importance :
  - **Entretien** : tu enregistres ton entretien (sa date est obligatoire). Le lendemain, « 📩 Milo a reçu une demande d'entretien chez … ! Rendez-vous jeudi 1 oct. à 11 h 30 ». La veille : « 👔 Demain, Milo a un entretien ! Il aurait bien besoin d'une tenue pour l'occasion… » avec un lien vers le Shop. **Son entretien a lieu 2 jours après le tien**, à une heure précise (tirée entre 2 h et 6 h après son réveil) ; il ne peut pas partir avant cette heure. Notifications : la demande, la veille, le jour J.
  - **Refus** : Milo reçoit sa réponse le lendemain du tien (après son propre entretien s'il en avait un). La raison : s'il est allé à son entretien **sans tenue**, c'est sa tenue ; sinon, ce que **tu as noté** en validant ton refus (« Pourquoi, selon toi ? », pour t'améliorer) ; sinon un message simple. Il est déçu quelques secondes, puis repart.
  - **Relance** : le lendemain de ta relance (prévue ou faite), il **appelle** l'entreprise.
  - **Dépôt de CV** : une de tes candidatures récentes (moins de 7 jours, au plus tôt le lendemain), jamais deux jours de suite.
  - Sinon : il **cherche une nouvelle opportunité** ou **découvre une entreprise** de sa ville (Découverte et souvenirs).
- **Ses entreprises** : Milo postule dans les entreprises de **sa** ville (jamais le vrai nom de la tienne), du même secteur que ta candidature (🥐 boulangerie, ☕ café, 📚 librairie, 🏨 hôtel…). C'est **toujours la même** pour une même candidature : il relance et passe son entretien là où il a déposé son CV. L'onglet ville montre « Les candidatures de Milo » (CV déposé, entretien jeudi à 11 h 30, entretien passé, pas retenu…), « en miroir de ta candidature chez X ».
- **La tenue d'entretien** n'est jamais automatique : c'est un achat du Shop (costume, chemise et cravate, veste de tailleur, chemise bleue, cravates). S'il en a une, il la porte à son entretien (et elle compte dans le récit) ; sinon il y va dans sa tenue de tous les jours.
- **Temps réel** : durées recherche 10 min, dépôt 5, relance 5, entretien 15, refus 3, travail 30 ; énergie 10, 10, 10, 15, 5, 20 ; pièces +10, +5, +5, +5, +5, +10 (dans le plafond de 50 ; un refus rapporte aussi, on récompense l'effort). Notification au retour ; l'app peut être fermée.
- **Scènes animées** (`components/SceneAventure.tsx`, en attendant les animations Dimini), sur un décor de la ville, en temps réel (aller 20 %, sur place 60 %, retour 20 %), sans texte permanent :
  - **recherche / dépôt** : il marche dans la rue avec son sac (et son CV 📄 à la main), entre dans le lieu, puis repart ;
  - **relance** : il sort son téléphone, l'appel sonne 📞, on attend, puis il range son téléphone ;
  - **refus** : il lit un message 📩, est déçu (pose réconfort, 💧), puis reprend son chemin vers la maison 🌱 ;
  - **entretien** : il marche jusqu'à l'entreprise 🏢 (dans sa tenue s'il en a une), entre ; on le voit **à l'intérieur**, face au recruteur, la conversation avance 💬 ; puis il ressort. (Décor intérieur provisoire en attendant une illustration de bureau.)
  - **repos / baignade** : il rentre à la maison, ou va au lac (à la fontaine à Sunnyville).
  - Au départ il s'en va avec ce qu'il emporte (« Bonne route ! », « Bonne chance ! ») ; au retour il revient en courant dans la scène de l'accueil.
- **Moments pour souffler** (sous Câlin / Jouer) : **Se reposer** à la maison (10 min, 0 ⚡) et **Se baigner** (2 min, 5 ⚡) : vrais départs en temps réel, récit au retour, sans pièces, hors quota d'aventures.
- Fichiers : réglages et textes `app/src/config/missions.ts` (décalages, délai Premium, durées, textes, annonces), logique `app/src/logique/missions.ts` (calendrier, entreprises de Milo, quota), écran `app/src/app/aventure.tsx`, scènes `app/src/components/SceneAventure.tsx`, carte `app/src/components/AventureDuJour.tsx`, tenues d'entretien `boutique.ts`.

### 5.5 quater Pièces 🪙 (portefeuille)
- Gagnées gratuitement avec les tâches (et les aventures, les objectifs pro, « J'ai décroché ! »). **Jamais remises à zéro** : elles s'accumulent.
- **Plafond : 50 pièces gagnées par jour** (tâches, aventures, objectifs). Au-delà, les tâches se cochent toujours, sans pièce en plus, avec un message bienveillant. Le compteur « x/50 aujourd'hui » est affiché sur l'accueil. Le bonus « J'ai décroché ! » n'est pas plafonné.
- Dépensées dans le Shop : le solde est **réellement débité** (confirmation avec solde avant / après).
- **Un seul solde**, identique partout (accueil, Shop, Compte › Portefeuille avec l'historique des gains et dépenses).

### 5.6 Candidatures
Un vrai suivi de candidatures, assez complet pour **remplacer un tableau Excel**, sans formulaire lourd. Utilisable en gratuit comme en Premium.
- **Statuts** : Envoyé · Relancé · Entretien · Décroché · Refus. **Aucun ordre imposé** (Envoyé → Entretien ou Envoyé → Refus sont possibles). « À envoyer » n'existe plus ; « Offre reçue » s'appelle **Décroché**. Les anciennes sauvegardes sont converties automatiquement.
- **Nouvelle candidature (+)** : Entreprise* et Poste* (obligatoires : le bouton « Ajouter la candidature » reste **gris** tant qu'ils sont vides, puis devient orange), lien de l'offre, **statut actuel** au choix parmi les 5 (un entretien demande sa date*), **adresse e-mail**, date d'envoi (préremplie avec aujourd'hui), **Relancer : +1, +3 ou +5 jours** après l'envoi (facultatif, rappelé ce jour-là), note libre.
- **Fiche** : entreprise, poste et statut actuel bien visibles ; « Voir l'offre » ; e-mail **cliquable** (ouvre la messagerie) et **copiable** ; « Modifier les informations ». Changer de statut = choisir l'étape puis **« Valider »**. **Entretien** : la date est obligatoire. **Refus** : « Pourquoi, selon toi ? » (facultatif, pour s'améliorer ; Milo s'en sert aussi). « Prévoir une relance » : +1, +3, +5 jours.
- **Historique** automatique, dans l'ordre chronologique, qui garde tout : « ✓ Candidature envoyée », « ✓ Candidature relancée », « ✓ Entretien obtenu », « ✓ Poste décroché », « ✓ Réponse négative », avec la date et le détail (« prévu le 28 septembre », la raison du refus). Une candidature créée directement à une étape avancée commence par « Candidature envoyée » puis l'étape actuelle.
- **Décroché + Valider** (ou création directement en Décroché) : page 🎉 « Félicitations ! Tu as décroché ce poste ! » avec entreprise et poste, flèche de retour, « Revenir à ma candidature », et « Commencer mon nouveau chapitre » proposé sans être imposé (voir 5.10).
- **Recherche** : entreprise, poste, note et e-mail. Filtres par statut, compteurs (envoyées, entretiens, à relancer).
- **Liées aux tâches** : relance proposée le jour prévu (ou 7 jours après l'envoi sans réponse) ; les candidatures et relances du jour font avancer les tâches mesurables toutes seules.
- Archivage (jamais de suppression automatique). Après un refus, le compagnon envoie : « Leur perte. On en envoie une autre ensemble ? 🐾 »

### 5.7 Shop
Dans la navigation entre Candidatures et Clairebourg. Achats avec les pièces (confirmation avec le solde avant / après). Un premier objet est offert (l'écharpe). Certains objets sont réservés à Pawstuler Premium. Deux rayons :
- **Tenues complètes** : chaque illustration montre le compagnon **habillé en entier** (images de corps entier générées avec Gemini, une par vêtement ou par tenue). Le compagnon porte **une seule tenue à la fois** : en mettre une autre remplace la précédente. Catégories : Tenues, Saisons et fêtes, Hauts, Bas, Chaussures, Chapeaux, Autour du cou. Chaque animal ne voit que les tenues illustrées pour lui : aujourd'hui **le chat (55)** et **le crocodile (43)** ; le renard et le lapin gardent pour l'instant l'écharpe, le béret et la cravate. **Essayage** : toucher une tenue non achetée montre le compagnon habillé avant l'achat. La tenue portée s'affiche partout où vit le compagnon (accueil, ville, profil, Compte, aventures) ; quand il dort ou dans les grands moments émotionnels (« J'ai décroché ! », réconfort après un refus), on garde sa pose expressive.
- **Objets** : lunettes, sac, badge, plante, tasse, couronne (Premium).
- Événements Premium : costume de sorcier (Halloween), tenue de Noël, robe de la Saint-Valentin, chapeau de sorcier, bonnet de Noël.
- **Ajouter une tenue** : déposer `app/assets/tenues/<animal>/<id>.png` (fond transparent, sans contour blanc), la déclarer dans le registre ; si l'id existe déjà dans `boutique.ts`, elle apparaît automatiquement pour cet animal, sinon ajouter une ligne au catalogue.
- **Vêtements en calques** (haut + bas + chaussures combinés) : possible plus tard avec un gabarit par animal (voir la discussion du 25/09) ; pas encore construit.

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
  - **Annuel : 39,99 €/an, avec 7 jours d'essai gratuit**. L'essai passe **obligatoirement par l'App Store avec une carte bancaire** (renouvellement automatique ensuite), il est **réservé à l'annuel** et **proposé une seule fois**.
  - **Mensuel : 5,99 €/mois, sans essai gratuit** (payé dès la confirmation).
  - **Sans abonnement** : la personne utilise la **version gratuite**, sans essai. Elle peut prendre l'annuel ou le mensuel plus tard ; tant qu'elle n'a pas utilisé son essai, il reste disponible et l'app le lui **rappelle de temps en temps** (« Tes 7 jours d'essai Premium t'attendent toujours »), sans insister.
  - **Pendant l'essai** : expérience Premium complète (énergie 100, recharge 3 h, collections événementielles…). **Après l'essai** sans abonnement : retour en gratuit, rien n'est perdu (animal, pièces, tenues, candidatures, historique, aventures).
- **Statut global unique** (`app/src/services/abonnement.ts`) : gratuit, essai ou Premium. Une seule règle (`aPremium`) décide partout : énergie, Shop, fonctions Premium. À la fin de l'essai : sans résiliation, l'annuel démarre ; après une résiliation, retour en gratuit.
- **Écran « Jour X / 7 »** (`app/src/app/essai-jour.tsx`) : une fois par jour d'essai (calculé sur la date de début, pas sur les ouvertures), gros chiffre, 7 ronds de progression, petit message (« Jour 2 ✨ Tu es déjà revenu pour ton deuxième jour ! »). Jour 7 : « Continuer avec Premium », la suite écrite clairement (l'annuel démarre demain, sauf résiliation) et « Gérer mon abonnement ». Jour 8 après résiliation : « Ton essai Premium est terminé 💛 », « Découvrir Premium » ou « Continuer gratuitement », une seule fois. Toujours refermable.
- **Rappel doux de l'essai disponible** : bandeau refermable sur l'accueil et notification, au plus tous les 4 jours (le premier 4 jours après l'inscription).
- **Shop** : les **collections d'événement** (Halloween, Noël, Saint-Valentin, Thanksgiving…) sont Premium **en entier** (tenue, chapeau, chaussures, accessoires), visibles par tous avec « 🔒 Premium ». Ce qui est déjà acquis reste acquis en gratuit.
- Version de test : sur l'écran d'abonnement pendant l'essai, « Simuler une résiliation (test) » remplace les réglages Apple (à retirer quand RevenueCat sera branché).
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

### 5.10 bis Rappels sur le téléphone
Notifications **locales** (programmées par le téléphone, sans serveur, `app/src/services/rappels.ts`), réglables dans Compte › Paramètres :
- **Tâches du jour** : chaque matin, une heure après le réveil du compagnon.
- **Retour de mission** : à l'heure exacte où le compagnon rentre.
- **Relances** : le jour prévu (+1, +3, +5 jours), sinon 7 jours après l'envoi d'une candidature restée « envoyée ».
- **Entretien de Milo** : sa demande d'entretien (le lendemain de ta saisie), la veille (penser à sa tenue), puis le jour J.
- **Essai Premium** : 3 jours puis 1 jour avant la fin, avec le prix.
- Jamais pendant que le compagnon dort, toujours bienveillants. Si l'iPhone les a coupées, Paramètres explique comment les réactiver.

### 5.11 Compte
Une vraie section : Mon profil (prénom, compagnon, ville, contrat), Mon portefeuille, Mon parcours pro, Paramètres (rappels, rythme du compagnon), Confidentialité (données, RGPD, export, politique de confidentialité et conditions d'utilisation), Abonnement Pawstuler Premium, **Profil du compagnon**, déconnexion (les données restent sur le téléphone) et suppression du compte.

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
| Candidater | Envoyer une candidature *(mesurable)* | 10 |
| | Envoyer 3 candidatures *(mesurable)* | 25 |
| | Envoyer 5 candidatures *(mesurable)* | 40 |
| | Envoyer une candidature spontanée | 15 |
| Relancer | Relancer une candidature (jour prévu, ou 7 jours après l'envoi) *(mesurable)* | 10 |
| Réseau | Ajouter un contact | 5 |
| | Appeler un recruteur | 15 |
| | Écrire à un ancien élève | 10 |
| Entretien | Préparer ton entretien | 15 |
| | Envoyer un mail de remerciement | 5 |
| Moral | Faire une vraie pause | 3 |
| Tâche perso | Créée par l'utilisateur | 5 |

**Plafond : 50 pièces gagnées par jour** (voir 5.5 quater).

**Après « J'ai décroché ! » (contexte pro) :** préparer ton premier jour (10), définir tes objectifs du premier mois (10), découvrir ton nouvel environnement (5), prendre un café avec un collègue (5), préparer une présentation (15), bilan de ta première semaine (10), choisir une compétence à développer (10), faire le point sur ta progression (10). Objectif pro atteint : 15.

**Selon le contrat recherché :** Alternance → vérifier le rythme de l'école (5) ; Alternance ou Stage → contacter le service relations entreprises (10) ; Freelance → mettre à jour son portfolio (10).

## 7. Univers visuel
- Style **kawaii mais pas enfantin**, formes rondes, ambiance cosy, typographie arrondie (SF Pro Rounded).
- **Palette tirée de Ziggy et de Clairebourg** : crème (fond), saumon du pelage (couleur de marque), brun du contour (texte), sauge, bleu du lac, or pour les pièces. **Corail vif réservé aux grandes victoires** (entretien, poste décroché).
- Toutes les couleurs, polices et espacements sont dans `app/src/config/theme.ts`.
- **Icône de l'app** : Ziggy qui fait coucou, sur fond crème (`app/assets/images/`, écran de lancement compris).
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
- **Expo SDK 57, Expo Router, TypeScript.** Routes dans `app/src/app/` : `(demarrage)/` (présentation, connexion, onboarding dont `rythme`), `(onglets)/` (accueil, candidatures, boutique = Shop, ville, compte), `candidature/[id]`, `compte/*` (profil, parametres, confidentialite, portefeuille), `compagnon` (profil du compagnon), `legal/[doc]` (confidentialité, conditions), et les fenêtres `aventure`, `decroche`, `aventure-pro`, `nouvelle-candidature`, `premium` (abonnement). L'onboarding se termine par `(demarrage)/serie`.
- **Réglages** dans `app/src/config/` : `theme`, `taches`, `energie`, `aventures`, `compagnons`, `villes`, `boutique`, `abonnement`, `candidatures`, `serie`, `dialogues`, `legal`.
- **Illustrations** : un seul registre, `app/src/illustrations/registre.ts`. Fichiers dans `app/assets/` : `compagnons/<animal>/<pose>.png` ; `oeufs/<animal>-1-intact.png`, `-2-fissure`, `-3-craquele`, `-eclosion`, `-ne` ; `villes/<ville>/portrait.jpg` (accueil), `paysage.jpg` (cartes) et `centre.jpg` (onglet ville, facultatif) ; `tenues/<animal>/<id>.png` (compagnon habillé, id = celui du catalogue `boutique.ts`). Ce que le Shop propose à chaque animal est calculé dans `app/src/logique/garderobe.ts`. Une image manquante affiche un visuel de secours. Les animations définitives (Lottie ou Rive) se brancheront dans `app/src/components/Compagnon.tsx`.
- **Données** : un seul état (`app/src/store/`), sauvegardé sur le téléphone ; les anciennes sauvegardes sont migrées automatiquement. Logique métier dans `app/src/logique/` (tâches du jour, vie du compagnon, rythme, dates).
- **Services** (`app/src/services/`) : connexion (`auth/` : Supabase en mode réel, compte local en mode démo ; clés dans `app/.env`, modèle `app/.env.exemple`), abonnement (achat App Store via RevenueCat à brancher), compte et RGPD (export, suppression), futur simulateur d'entretien.
- Avant de dire qu'une étape est terminée : `npx tsc --noEmit` et `npx eslint src` sans erreur, et parcours testé.

## 11. Décisions prises par Claude, à valider
Ces valeurs ne viennent pas de mes consignes : Claude les a choisies pour que l'app fonctionne. Elles sont toutes réglables dans `app/src/config/`.
- **Énergie** (`energie.ts`) : gratuit 30 / 5 h et Premium 100 / 3 h (validé) ; câlin 5, jeu 10, +3 par tâche terminée (proposés par Claude).
- **Aventures** (`missions.ts`) : durées et coûts validés ; proposés par Claude : refus 3 min / 5 ⚡ / +5 pièces, +10 pièces par recherche, heure de l'entretien de Milo tirée entre 2 h et 6 h après son réveil, Milo relance et reçoit ses refus 1 jour après toi, dépôt de CV au plus tôt le lendemain et jamais deux jours de suite, liste des tenues d'entretien (`boutique.ts`), secteurs reconnus par mots-clés, textes des aventures, des résultats et des annonces, décor intérieur provisoire (emojis) de l'entretien.
- **Tâches** : « Envoyer 3 candidatures » (25 pièces) ajoutée ; objectif du jour 1 / 3 / 5 selon la veille ; « Préparer ton entretien » dans les 3 jours avant, remerciement le lendemain.
- **Moments avec le compagnon** : « Câlin » et « Jouer » sont des propositions de Claude pour donner une utilité à l'énergie. « Se reposer » et « Se baigner » (durées et coûts validés) : sans pièces ni bonus d'énergie (choix de Claude, à confirmer).
- **Animations des missions** : répartition du trajet (20 % aller, 60 % sur place, 20 % retour), objets emportés et petites animations sur place, textes « Bonne route ! », « Allez, plouf ! », « Bonne sieste ! ».
- **Récompenses** : recherche +10 pièces, objectif pro atteint +15, « J'ai décroché ! » +50.
- **Premium** : 3 aventures par jour avec 3 h d'écart (validé), contre 1 en gratuit.
- **Shop** (`boutique.ts`) : la liste des objets et leurs prix (de 20 à 150 pièces ; tenues de 20 à 120), l'écharpe offerte, la couronne et les tenues d'événements réservées à Premium, les noms des tenues.
- **Récits d'aventure** (`aventures.ts`) et **lieux de Sunnyville** : textes provisoires.
- **Personnalité du crocodile** : « Grand cœur sous ses airs sérieux ».
- **Série** (`serie.ts`) : un jour compte à l'ouverture de l'app ; objectifs proposés 2, 5, 7, 14 jours (5 par défaut) et leurs textes.
- **Profil du compagnon** : les descriptions, traits et « ce qu'il aime » de chaque animal (`compagnons.ts`), les souvenirs de chaque lieu (`villes.ts`), les pronoms proposés (Il / lui, Elle, Iel).
- **Connexion** : choix de Supabase (comptes + future sauvegarde en ligne, région Europe) et de RevenueCat pour l'abonnement.
- **Dialogues** de la rencontre pour Mochi, Milo et Nala (`dialogues.ts`), adaptés du script de Ziggy.
- **Rappels** : heures (réveil + 1 h, 10 h) et textes (`rappels.ts`).
- **Textes légaux** (`legal.ts` et `docs/legal/`) : brouillons à faire relire ; les « [À COMPLÉTER] » attendent tes coordonnées. Âge minimum proposé : 15 ans.

## 12. Questions ouvertes
Aucune question bloquante. À ajuster après tes premiers tests sur iPhone : les valeurs de la section 11.
- **Corrections du 26/09 (faites)** : accueil restauré (une carte verte « Aventure du jour » sous la scène), récit avant « nouvelle aventure demain », système miroir décalé (calendrier de Milo, entreprises de sa ville, tenue d'entretien, raison des refus, 3 h entre deux aventures Premium), scènes animées par type, tâches mesurables et adaptées à la situation, formulaire (relance +1/+3/+5, bouton gris), rythme du compagnon à l'onboarding. À venir : illustration d'un **intérieur de bureau** pour l'entretien (à déposer dans `app/assets/villes/<ville>/`), tâches générées par l'IA avec Supabase.
- **Plan validé le 25/09** (étapes faites) :
  - **B — Premium / gratuit / essai (fait le 25/09)** : statut global unique (gratuit, essai, Premium) ; énergie gratuit 30 avec recharge complète 5 h après la première dépense, Premium et essai 100 avec recharge 3 h, affichage « Énergie : 15/30 · Recharge dans 4 h 12 », plus de recharge chaque matin, +3 par tâche gardé ; toute collection d'événement Premium (tenue, chapeau, chaussures, accessoires), visible avec 🔒 ; écran « Jour X / 7 » une fois par jour d'essai (jour 7 spécial, jour 8 « Ton essai Premium est terminé 💛 ») ; rappel doux de l'essai disponible.
  - **C — Système miroir (fait le 25/09, voir 5.5 ter)** : les actions de l'utilisateur (candidature, relance, entretien, refus, décroché, objectifs, beaucoup de candidatures) créent des **missions pour le compagnon** ; lieu et métier cohérents avec le secteur ; le compagnon reprend le vrai nom de l'entreprise ; au plus 2 missions disponibles par jour, les autres étalées dans le temps (entretiens et relances prioritaires) ; **temps réel** avec heure de départ et de retour (ce sont les durées de mission **du compagnon** : c'est lui qui est occupé) ; notification au retour ; résultats variés et suites logiques, le compagnon suit le vrai parcours de l'utilisateur (jamais de refus décidé tout seul) ; lieux aux noms changeants ; « Aventure du jour » dynamique ; +5 pièces par mission (dans le plafond).
  - **D — Animations des missions (fait le 25/09, voir 5.5 ter)** : départ visible, trajet, arrivée, disparition, statut « Milo est à la boulangerie · Retour à 20 h 16 », retour ; une animation par type ; moments « Se reposer » (maison) et « Se baigner » (lac, fontaine à Sunnyville).
  - Durées proposées : dépôt de CV 5 min, relance 5 min, recherche 10 min, entretien 15 min, travail 30 min, repos 10 min, baignade 2 min. Coûts : dépôt 10, relance 10, recherche 10, entretien 15, travail 20, baignade 5, repos 0.
- **Plan « animal vivant »** (première version) : annulé. À la place, Claude ajoute de petits mouvements au compagnon (câlin, jeu, petits gestes) sur la base existante.
- **Planche « Design sans titre-2 »** (dossier Tenues complètes du Drive) : vêtements seuls, sans animal. Pas utilisée pour l'instant ; pourra servir d'icônes du Shop ou de base pour les vêtements en calques.
