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
→ Œuf qui éclot → Prénom du compagnon → Choix de la ville → Rythme (réveil / coucher) → Accueil.

Onglets : **Accueil** (tâches du jour) · **Candidatures** · **Boutique** · **Ville** du compagnon. Ziggy+ s'ouvre depuis l'accueil.

## Où changer quoi

| Je veux changer… | Fichier |
|---|---|
| Couleurs, polices, espacements | `src/config/theme.ts` |
| Les tâches et les pièces qu'elles rapportent | `src/config/taches.ts` |
| Les animaux (noms proposés, personnalités) | `src/config/compagnons.ts` |
| Les villes et leurs lieux | `src/config/villes.ts` |
| Les objets de la boutique et leurs prix | `src/config/boutique.ts` |
| Prix et durée d'essai de Ziggy+, textes de l'offre | `src/config/abonnement.ts` |
| **Les illustrations** (animaux, œuf, villes, objets) | `src/illustrations/registre.ts` |

### Ajouter les illustrations Dimini

1. Dépose les fichiers dans `assets/` :
   - `assets/compagnons/<animal>/<pose>.png` (poses : salut, neutre, content, excite, dort, reconfort, fier, aventure, celebration)
   - `assets/oeufs/<animal>-eclosion.png` et `assets/oeufs/<animal>-ne.png`
   - `assets/villes/<ville>/portrait.jpg` (accueil) et `paysage.jpg` (cartes)
2. Déclare-les dans `src/illustrations/registre.ts`, dans le bloc correspondant.

Tant qu'une image manque, l'app affiche un visuel de secours (emoji et couleur) : rien ne casse.
Les animations définitives (Lottie ou Rive) se brancheront dans `src/components/Compagnon.tsx`, sans toucher aux écrans.

## Ce qui est provisoire

- **Connexion** : Apple, Google et e-mail créent pour l'instant un compte local sur le téléphone (`src/services/auth`). Les vrais services se brancheront à cet endroit.
- **Ziggy+** : l'essai démarre sans paiement. L'achat App Store se branchera dans `src/services/abonnement.ts`.
- **Simulateur d'entretien** : seulement la forme des données (`src/services/futur/simulateurEntretien.ts`).

## Commandes utiles

```bash
npx tsc --noEmit   # vérifie les types
npx eslint src     # vérifie le code
```
