# Pawstuler — l'app iPhone

App Expo (React Native), SDK 57. Tout le texte est en français, avec tutoiement.

## Tester sur ton iPhone

1. Installe l'app gratuite **Expo Go** sur ton iPhone (App Store).
2. Sur un ordinateur avec Node.js installé, dans le dossier `app` :
   ```bash
   npm install
   npx expo start
   ```
3. Scanne le QR code affiché avec l'appareil photo de l'iPhone : l'app s'ouvre dans Expo Go.

Pour recommencer le parcours de démarrage depuis zéro : supprime puis réinstalle Expo Go (les données restent sur le téléphone).

## Le parcours

Présentation → Connexion (Apple / Google / e-mail) → Prénom → Objectif (emploi + contrat) → Choix de l'animal
(renard, chat, crocodile, lapin) → Œuf qui éclot → Prénom du compagnon → Choix de la ville → Objectif de série 🐾 → Accueil.

Onglets : **Accueil** · **Candidatures** · **Shop** · **Clairebourg** (la ville du compagnon) · **Compte**.

- **Accueil** : le badge de série 🐾 et les pièces en haut, le compagnon dans sa ville, son énergie ⚡, l'Aventure du jour, et « Tes tâches du jour ».
- **Pièces 🪙** : gagnées avec les tâches, jamais remises à zéro, dépensées dans le Shop (portefeuille dans Compte).
- **Énergie ⚡** : 30 par jour, dépensée pour les câlins, les jeux et l'aventure ; chaque tâche en redonne un peu.
- **🎉 J'ai décroché !** (depuis une candidature) → **Mon aventure professionnelle** : poste, premier jour,
  objectifs, progression. Les candidatures sont conservées. On peut recommencer une recherche plus tard.
- **Compte** : profil, portefeuille, paramètres (notifications, rythme du compagnon), données et RGPD,
  Pawstuler Premium, profil du compagnon, déconnexion, suppression du compte.
- **Profil du compagnon** (badge de série ou Compte) : photo, nom, pronoms, série, onglets À propos / Détails / Traits,
  collection (objets et souvenirs d'aventure), découverte des lieux de la ville.
- **Pawstuler Premium** : annuel 39,99 €/an avec 7 jours d'essai gratuit, mensuel 5,99 €/mois sans essai.

## Où changer quoi

| Je veux changer… | Fichier |
|---|---|
| Couleurs, polices, espacements | `src/config/theme.ts` |
| Les tâches et les pièces qu'elles rapportent | `src/config/taches.ts` |
| L'énergie, le coût des moments, les aventures par jour | `src/config/energie.ts` |
| Les récits des aventures | `src/config/aventures.ts` |
| Les animaux (noms proposés, personnalités) | `src/config/compagnons.ts` |
| Les villes et leurs lieux | `src/config/villes.ts` |
| Les objets de la boutique et leurs prix | `src/config/boutique.ts` |
| Prix et durée d'essai de Pawstuler Premium, textes de l'offre | `src/config/abonnement.ts` |
| Les objectifs de série proposés | `src/config/serie.ts` |
| Les clés de connexion (Supabase, RevenueCat) | `.env` (modèle : `.env.exemple`) |
| **Les illustrations** (animaux, œuf, villes, objets) | `src/illustrations/registre.ts` |

### Ajouter les illustrations Dimini

1. Dépose les fichiers dans `assets/` :
   - `assets/compagnons/<animal>/<pose>.png` (poses : salut, neutre, content, excite, dort, reconfort, fier, aventure, celebration)
   - `assets/oeufs/<animal>-1-intact.png`, `-2-fissure.png`, `-3-craquele.png` (les 3 touchers), `-eclosion.png` et `-ne.png`
   - `assets/villes/<ville>/portrait.jpg` (accueil), `paysage.jpg` (cartes) et, si besoin, `centre.jpg` (onglet de la ville)
2. Déclare-les dans `src/illustrations/registre.ts`, dans le bloc correspondant.

Tant qu'une image manque, l'app affiche un visuel de secours (emoji et couleur) : rien ne casse.
Les animations définitives (Lottie ou Rive) se brancheront dans `src/components/Compagnon.tsx`, sans toucher aux écrans.

## Ce qui est provisoire

- **Connexion** : prête pour Supabase (`src/services/auth`). Sans clés dans `.env`, Apple, Google et e-mail créent un compte local sur le téléphone (mode démo). Ce qu'il faut configurer : `../docs/connexion-et-abonnement.md`.
- **Pawstuler Premium** : l'achat est simulé. L'achat App Store (RevenueCat) se branchera dans `src/services/abonnement.ts`.
- **Notifications** : les préférences sont enregistrées, l'envoi réel sera branché plus tard.
- **Compte en ligne** : export et suppression des données préparés dans `src/services/compte.ts`.
- **Simulateur d'entretien** : seulement la forme des données (`src/services/futur/simulateurEntretien.ts`).

## Commandes utiles

```bash
npx tsc --noEmit   # vérifie les types
npx eslint src     # vérifie le code
```
