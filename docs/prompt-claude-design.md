# Prompt pour Claude Design : recréer Pawstuler avec une autre palette

Copier tout le texte ci-dessous (à partir de « Tu es designer… ») dans Claude Design.
Il décrit tous les écrans de l'app telle qu'elle est aujourd'hui, avec une **nouvelle palette « Lavande & menthe »** (sans orange), pour comparer le rendu.

---

Tu es designer produit mobile. Crée la maquette complète d'une app iPhone appelée **Pawstuler**, écran par écran, en cadres iPhone (390 × 844), avec de vrais textes en français (tutoiement). Rassemble tous les écrans sur une seule page, rangés par parcours, avec le nom de chaque écran au-dessus.

## L'app en une phrase

Pawstuler, c'est « Finch pour la recherche d'emploi ». On suit ses candidatures et on fait de petites tâches chaque jour, accompagné d'un petit compagnon animal. Il vit dans sa propre ville et cherche, lui aussi, son travail. Message clé : « Tu n'as pas à gérer ta recherche d'emploi seul. Ton compagnon avance avec toi. »

Cible : 18-35 ans, en France. Ton positif, rassurant et moderne, jamais « outil RH froid ». On ne culpabilise jamais : un refus ne fait rien perdre, une pause non plus. On récompense l'effort, pas le résultat.

## Personnages et données d'exemple

- **L'utilisatrice** : Naomi.
- **Son compagnon** : Milo, un bébé crocodile vert sauge, rond et kawaii, avec un grand cœur sous ses airs sérieux. Les autres compagnons au choix sont Ziggy le renard, Mochi le chat et Nala la lapine.
- **Sa ville** : Clairebourg, une petite ville de campagne illustrée (maisons à toits rouges, lac, ponton, chemin, fleurs). L'autre ville au choix est Sunnyville, une grande ville avec une place à fontaine.
- Utilise des **emplacements d'illustration** stylisés pour le compagnon et les décors (formes rondes et douces, style illustration jeunesse moderne, pas de photos).

## Nouvelle palette : « Lavande & menthe » (aucun orange)

| Rôle | Couleur |
|---|---|
| Fond des écrans | blanc lavande `#F7F4FF` |
| Cartes et feuilles | blanc `#FFFFFF` |
| Couleur de marque (boutons principaux, onglet actif, liens) | lavande `#7C6CF2` |
| Bord du bas des boutons principaux (relief) | lavande foncée `#5A49D6` |
| Fond doux de la marque (onglet actif, cartes choisies) | lavande pâle `#ECE8FF` |
| Couleur secondaire (carte « Aventure du jour », réussites, tâches faites) | menthe foncée `#3FA889` |
| Fond des tâches faites | menthe pâle `#E3F6EF` |
| Texte principal | prune foncé `#2E2645` |
| Texte secondaire | `#6E6688` |
| Contours des cartes | `#E4DEF7`, bord du bas `#D2CAEE` |
| Grandes victoires (entretien, poste décroché, confettis) | rose bonbon `#FF7FA6` |
| Pièces | **or** `#F4C542`, tranche `#C9921C` (la pièce doit rester une vraie pièce d'or) |
| Énergie ⚡ | jaune `#FFD25A` |

Pastels par catégorie de tâche (fond de toute la carte, avec un emoji dans une pastille blanche) :
- Se préparer 📝 : `#FDE8F1`
- Chercher 🔎 : `#E3F2FF`
- Candidater 📮 : `#E9E6FF`
- Relancer 📞 : `#FFF4CC`
- Réseau 🤝 : `#F1E6FF`
- Entretien 👔 : `#FFE3EC`
- Moral 🌿 : `#E3F6EF`
- Tâche perso ⭐ : `#FFF0E0`

## Style général

- **Kawaii mais pas enfantin** : formes rondes, ambiance cosy, typographie arrondie (SF Pro Rounded). Coins très arrondis (cartes 24 px, boutons en pilule).
- **Effet « relief »** sur les cartes et les boutons : un contour fin et un bord du bas plus épais et plus foncé (4 px). Ils ressemblent à des autocollants posés sur la page ; un bouton appuyé s'enfonce.
- **Tailles de texte mesurées** : titres de page 26 px en gras (800), texte 15-16 px, petits textes 12-13 px. Pas de titres énormes, pas de boutons trop gros. Les mots doivent se lire en entier.
- **Barre d'onglets flottante** : une pilule blanche arrondie, détachée du bas de l'écran, avec 5 onglets (icône + nom en entier) : Accueil · Candidatures · Shop · Clairebourg · Compte. L'onglet actif est dans une pastille lavande pâle.
- **La pièce d'or** : dessinée comme une vraie pièce (tranche plus foncée, bord doré, anneau gravé, petit reflet blanc). Elle est affichée assez grande dans le compteur de pièces.
- Un seul compteur de pièces, le même partout.

## Les écrans à créer (41)

### A. Démarrage (connexion et onboarding)
Tous ces écrans suivent la même mise en page : le **décor de Clairebourg avec la mascotte en haut**, puis une **feuille blanche arrondie** qui remonte par-dessus et contient le texte et les boutons.

1. **Présentation** : petit « Pawstuler » au-dessus du titre « Ta recherche d'emploi, à deux. », puis « Ton compagnon avance avec toi, une petite étape à la fois. ». 4 points avec icônes : petites tâches chaque jour ; toutes tes candidatures au même endroit ; des pièces à chaque effort pour personnaliser ton compagnon ; il vit dans sa ville et part en aventure. Bouton « Commencer », lien « J'ai déjà un compte ».
2. **Connexion, choix de la méthode** : « Crée ton compte », « Pour garder ton compagnon et ta progression, même sur un autre téléphone. » Boutons « Continuer avec Apple » (noir), « Continuer avec Google », « Continuer avec un e-mail ». Petite mention « En continuant, tu acceptes nos conditions d'utilisation et notre politique de confidentialité » avec liens, puis « Déjà un compte ? Me connecter ».
3. **Inscription par e-mail** : champs E-mail et Mot de passe (avec un œil pour l'afficher), barre de solidité en 4 segments (« Solide »), case « J'accepte les conditions d'utilisation et la politique de confidentialité », bouton « Créer mon compte » (gris tant que la case n'est pas cochée), lien « Autres façons de continuer ».
4. **Prénom (1/8)** : barre de progression avec « 1/8 », « Comment tu t'appelles ? », champ « Saisis ton prénom ».
5. **Objectif (2/8)** : « Qu'est-ce que tu recherches ? », carte choisie « Un emploi », puis « Quel type de contrat ? » avec des pastilles CDI, CDD, Stage, Alternance, Freelance (plusieurs choix possibles).
6. **Choix de l'animal (3/8)** : grille de 4 cartes (renard, chat, crocodile, lapine) avec leur nom et leur personnalité, bouton « Découvrir mon œuf ».
7. **L'œuf (4/8)** : un grand œuf qui se fissure quand on le touche (montrer l'état fissuré), « Touche l'œuf ».
8. **Naissance et prénom du compagnon (5/8)** : Milo qui vient d'éclore, son nom en grand, « Comment veux-tu l'appeler ? », champ prérempli « Milo ».
9. **La rencontre** : Milo avec une bulle de dialogue (« Oh ! Bonjour ! C'est bien ici, Clairebourg ? »), boutons « Suivant » et « Passer ». Dernière bulle : « Le jour où tu décroches ton poste… moi aussi, je décroche le mien. Promis ? », bouton « Promis ! 🐾 ».
10. **Le rythme du compagnon (6/8)** : bulle « Bon… il faut qu'on règle mon petit rythme de vie ! », « Et Milo, il se réveille à quelle heure ? 🌞 » (pastilles 6 h à 10 h), « Et à quelle heure va-t-il dormir ? 🌙 » (21 h à minuit).
11. **La ville (7/8)** : « Où veux-tu commencer ton aventure ? », 2 grandes cartes illustrées : Clairebourg (campagne) et Sunnyville (grande ville).
12. **Objectif de série (8/8)** : « Ton petit objectif de série », 4 cartes (2, 5, 7, 14 jours) avec un gros chiffre et un petit texte, la carte « 5 jours » choisie. Mot rassurant : « Pas de pression : si tu fais une pause, ta série recommence simplement. Tu ne perds rien. » Bouton « C'est parti ! ».

### B. Accueil (onglet 1)
13. **Accueil**, de haut en bas :
   - une pastille blanche « Bonjour Naomi 👋 / Lundi 12 octobre », le compteur de pièces (pièce d'or + 25) et une cloche ronde ;
   - **la semaine 🐾** : L M M J V S D avec une patte sur les jours de la série, aujourd'hui entouré, et « 2/5 j » à droite ;
   - une **grande scène** : Milo dans Clairebourg, avec sa bulle « Bonjour Naomi ! On commence par quoi aujourd'hui ? » ;
   - la **carte « Aventure du jour »** (menthe foncée, texte blanc) : « 10 ⚡ · Milo explore Clairebourg », un compteur « 🧭 1/1 » et l'énergie en **10 segments ⚡** avec « 25/30 · Recharge dans 4 h » ;
   - 4 petits boutons : Câlin 5 ⚡, Jouer 10 ⚡, Se reposer 0 ⚡, Se baigner 5 ⚡ ;
   - **« Tes tâches du jour »** avec « Encore 3 tâches aujourd'hui », « 2/5 », une barre d'avancement et « 15/50 pièces gagnées aujourd'hui » ;
   - les **cartes de tâches** colorées selon leur catégorie : emoji, titre, « +10 » avec la pièce, coche ronde à droite. Une tâche faite est barrée, sur fond menthe, avec une coche pleine. Une tâche mesurable (« Envoyer une candidature ») a une barre « 0/1 » et la mention « Se coche toute seule avec tes candidatures ». Lien « + Ajouter une tâche » en pointillés.
14. **Accueil, Milo parti en aventure** : la scène montre Milo qui marche dans la rue avec son sac et son CV 📄. Sa bulle dit « Milo est à la Boulangerie du Lac. Retour à 10 h 33 ». La carte verte affiche « Milo est allé déposer son CV chez Boulangerie du Lac ».
15. **Accueil, la nuit** : scène assombrie, Milo endormi, « z z z », bulle « Milo dort jusqu'à 8 h ».

### C. Aventures
16. **Présentation de l'aventure** : décor, Milo prêt avec son sac, « Milo part découvrir Clairebourg », durée (10 min), coût (10 ⚡), récompense (+10 pièces), bouton « Envoyer Milo ».
17. **En route** : scène animée (Milo marche, entre dans un lieu), « Retour à 10 h 33 · dans 10 min », bouton « D'accord, à tout à l'heure ! ».
18. **Récit au retour** : 2-3 phrases de récit, « +10 pièces rapportées », puis plus discret « Une nouvelle aventure sera possible demain », bouton « Retour à l'accueil ».
19. **Entretien de Milo** : Milo à l'intérieur d'un bureau, face au recruteur, bulles 💬, dans sa tenue d'entretien (veste).

### D. Candidatures (onglet 2)
20. **Liste** : titre « Candidatures », 3 compteurs (envoyées, entretiens, à relancer), onglets « Recherche en cours / Historique », champ de recherche, filtres en pastilles (Toutes, Envoyé, Relancé, Entretien, Décroché, Refus), cartes de candidatures (entreprise, poste, date, pastille de statut colorée). Lien « 🎉 J'ai décroché un poste » et gros bouton rond « + » flottant au-dessus de la barre d'onglets.
21. **Nouvelle candidature** : Entreprise*, Poste*, lien de l'offre, « Où en est-elle ? » (5 pastilles de statut), adresse e-mail, date d'envoi, « Relancer » (+1, +3, +5 jours), note. Boutons « Annuler » et « Ajouter la candidature » (gris tant que les champs obligatoires sont vides).
22. **Fiche candidature** : entreprise, poste et statut bien visibles, « Voir l'offre », e-mail cliquable et copiable, choix d'une nouvelle étape puis « Valider », « Prévoir une relance », historique chronologique (« ✓ Candidature envoyée · 25 sept. », « ✓ Entretien obtenu · prévu le 30 septembre »).
23. **Félicitations** : « 🎉 Félicitations ! Tu as décroché ce poste ! », entreprise et poste, confettis roses, « Commencer mon nouveau chapitre », « Revenir à ma candidature ».
24. **J'ai décroché !** : grande célébration, Milo décroche lui aussi un poste dans sa ville, « +50 pièces ».
25. **Mon aventure professionnelle** : 🏢 entreprise, 💼 poste, 📅 premier jour, 🎯 objectifs personnels (+15 pièces chacun), 📈 progression.

### E. Shop (onglet 3)
26. **Shop, rayon Tenues** : titre « Shop » et compteur de pièces, vitrine avec Milo habillé, 3 rayons en onglets (Tenues · Objets · Chambre), filtres (Tout, Tenues, Saisons et fêtes, Hauts, Bas, Chaussures, Chapeaux, Autour du cou), grille de 3 colonnes avec vignette, nom et prix (pièce + 40). Certains articles sont marqués « Porté » ou « 🔒 Premium » (collection Halloween).
27. **Confirmation d'achat et essayage** : feuille en bas avec Milo habillé de la tenue, « Ton solde 120 / Prix −40 / Après achat 80 », bouton « Acheter pour 40 pièces ».
28. **Shop, rayon Chambre** : un aperçu de la chambre en haut, puis la grille d'objets de chambre (lit, fauteuil, tableau, tapis, cactus…) avec « Dans sa chambre » ou « À placer ».

### F. La ville et la chambre
29. **Onglet Clairebourg** : titre, grande illustration du centre-ville avec Milo, carte « La chambre de Milo » (aperçu), « Dernière aventure », « Les candidatures de Milo » (Boulangerie du Lac · Vendeur · CV déposé ; Librairie des Tilleuls · entretien jeudi à 11 h 30) et « Les lieux de Clairebourg » (pastille de couleur par étape : à visiter, visité, candidature, embauché).
30. **La chambre de Milo** : la chambre illustrée (mur crème, une fenêtre sur la campagne, parquet), Milo au milieu, des places marquées « + » en pointillés (mur à gauche, mur à droite, rebord de la fenêtre, sol à gauche, sol à droite, tapis), quelques objets déjà posés. Dessous : « 3 objets dans la chambre · 1 de côté » et le bouton « Objets pour la chambre ».
31. **Choisir un objet pour une place** : feuille en bas, « Rebord de la fenêtre · Petits objets », objets possédés en ligne (cactus, fleurs…), « Retirer l'objet », « Voir le Shop ».

### G. Compte (onglet 5) et profil du compagnon
32. **Compte** : carte profil (Naomi, Milo, Clairebourg), lignes : Mon profil, Profil de Milo, Mon portefeuille, Mon parcours pro, Paramètres, Mes données et RGPD, Pawstuler Premium (« Version gratuite »), Se déconnecter, Supprimer mon compte.
33. **Profil de Milo** : photo de Milo (pose fière) dans sa ville, nom en grand, « Crocodile · Il / lui · Clairebourg », série 🐾 + meilleure série + nombre d'aventures, onglets À propos / Détails / Traits, collection en grille (objets et souvenirs d'aventure, silhouettes « ??? » pour ceux pas encore obtenus), lieux découverts.
34. **Portefeuille** : grosse pièce d'or et solde, historique des gains et dépenses (« Tâche : Mettre à jour ton CV +10 », « Achat : Béret −40 »).
35. **Paramètres** : rappels (tâches du jour, relances, retour de mission) avec interrupteurs, rythme de Milo (réveil, coucher).

### H. Premium, offres et fêtes
36. **Pawstuler Premium** (en fenêtre) :
   - en haut, Milo qui fait la fête dans sa ville, avec une croix pour fermer ; en bas, la feuille blanche ;
   - « PAWSTULER PREMIUM » puis « 7 jours offerts pour tout essayer » ;
   - 4 points forts en grille : jusqu'à 3 aventures par jour ; énergie 100, recharge en 3 h ; tenues et événements exclusifs ; aide avancée CV et entretiens ;
   - la phrase « Tes tâches, tes candidatures et ton compagnon restent gratuits. » ;
   - la carte Annuel mise en avant, avec le badge « −44 % par rapport au mensuel », « 7 jours gratuits » et 39,99 €/an (soit 3,33 €/mois) ;
   - le lien « Voir les autres formules » (mensuel 5,99 €/mois, sans essai) ;
   - une frise de l'essai (Aujourd'hui : rien à payer ; Le 15 oct. : rappel ; Le 19 oct. : premier paiement de 39,99 €) ;
   - le gros bouton « Commencer mes 7 jours gratuits », avec dessous la phrase complète sur le prix et le renouvellement, la mention App Store et les liens Restaurer mes achats · Conditions · Confidentialité.
37. **Essai : jour 2 / 7** : gros chiffre, 7 ronds de progression, « Jour 2 ✨ Tu es déjà revenue pour ton deuxième jour ! », bouton « C'est parti ! ».
38. **Offre de bienvenue (non-abonnés)** :
   - surtitre « OFFRE DE BIENVENUE », gros chiffre « 5 » et « jours restants », 7 ronds ;
   - Milo tout content ;
   - une carte « Ça prend forme 🐾 » avec un petit texte, le badge « −30 % », « 27,99 €/an » et le prix barré « 39,99 €/an » ;
   - les boutons « Profiter de −30 % » et « Plus tard ».
39. **Journée terminée 🎉** : décor de la ville en plein écran avec confettis, pastille « JOURNÉE TERMINÉE 🎉 », « Bravo Naomi ! », « Tu as terminé toutes tes tâches du jour. », Milo en pose de fête. Carte en bas : « MILO » et son petit mot (« Tu as tout fait aujourd'hui, Naomi ! Je suis tellement content pour nous. 🐾 »), pastilles « +50 🪙 aujourd'hui » et « 🐾 3 jours de série », bouton « Continuer ». Pas de niveau.
40. **Rappel doux de l'essai** (bandeau sur l'accueil) : « Tes 7 jours d'essai Premium t'attendent toujours ✨ », avec une croix pour le fermer.
41. **Après un refus** : sur la fiche candidature passée en « Refus », le champ « Pourquoi, selon toi ? » et le message de Milo : « Leur perte. On en envoie une autre ensemble ? 🐾 ».

## À livrer
- Les 41 écrans ci-dessus, cohérents entre eux, avec la palette « Lavande & menthe » et le style décrit.
- Une petite planche de composants : boutons (principal, secondaire, blanc, texte, désactivé), carte avec relief, pastille, champ de saisie, carte de tâche (à faire, faite, mesurable), pièce d'or, barre d'onglets flottante, segments d'énergie, semaine 🐾.
