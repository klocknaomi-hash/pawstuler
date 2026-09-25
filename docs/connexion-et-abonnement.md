# Brancher la vraie connexion et l'abonnement

Ce guide liste **tout ce que tu dois créer ou configurer de ton côté** pour que la connexion (Apple, Google, e-mail) et l'abonnement Pawstuler Premium fonctionnent pour de vrai.

Tant que rien n'est configuré, l'app reste en **mode démo** : chaque connexion crée un compte local sur le téléphone et l'achat Premium est simulé. Rien ne casse.

---

## Vue d'ensemble

| Service | À quoi il sert | Coût |
|---|---|---|
| **Apple Developer Program** | Publier l'app, « Se connecter avec Apple », achats intégrés | 99 $/an |
| **Supabase** | Comptes utilisateurs (Apple, Google, e-mail), plus tard la sauvegarde en ligne | Gratuit pour démarrer |
| **Google Cloud** | « Continuer avec Google » | Gratuit |
| **Expo / EAS** | Construire l'app installable sur ton iPhone et l'envoyer à l'App Store | Gratuit pour démarrer |
| **RevenueCat** | Gérer l'abonnement App Store (essai, renouvellement, restauration) | Gratuit jusqu'à 2 500 $ de revenus/mois |

> **Important : Expo Go ne suffit plus pour tout tester.**
> - La connexion **par e-mail** marche dans Expo Go.
> - **Apple** et les **achats App Store** ne marchent que dans une version de l'app construite avec EAS (« development build » ou TestFlight), car ils ont besoin de l'identifiant de *ton* app (`com.pawstuler.app`).
> - **Google** marche dans Expo Go à condition d'autoriser l'adresse de retour d'Expo Go dans Supabase (étape 2.4).

---

## 1. Apple Developer (obligatoire pour Apple et l'abonnement)

1. Inscris-toi au **Apple Developer Program** : https://developer.apple.com/programs/ (99 $/an, validation en 24–48 h).
2. Dans **Certificates, Identifiers & Profiles › Identifiers**, crée un **App ID** :
   - Bundle ID : `com.pawstuler.app` (c'est celui déclaré dans `app/app.json`).
   - Coche la capacité **Sign in with Apple**.
3. Dans **App Store Connect** (https://appstoreconnect.apple.com), crée l'app **Pawstuler** avec ce Bundle ID.
4. Signe les **accords « Apps payantes »** (Accords, taxes et banque) : sans ça, aucun achat ne fonctionne.

### Pour « Se connecter avec Apple » via Supabase
5. Toujours dans **Identifiers**, crée un **Services ID** (ex. `com.pawstuler.app.connexion`), active *Sign in with Apple*.
6. Dans **Keys**, crée une clé avec *Sign in with Apple* et télécharge le fichier `.p8` (garde-le précieusement, il ne se télécharge qu'une fois). Note le **Key ID** et ton **Team ID** (en haut à droite du portail).

---

## 2. Supabase (les comptes)

1. Crée un compte sur https://supabase.com puis un **nouveau projet**. Choisis la région **Europe (Paris ou Francfort)** pour le RGPD.
2. Dans **Project Settings › API**, copie :
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon / publishable key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   (Ne copie jamais la clé `service_role` dans l'app.)
3. **Authentication › Providers** :
   - **Email** : activé. Choisis si tu veux la confirmation par e-mail (recommandé ; l'app affiche alors « Clique sur le lien reçu par e-mail »).
   - **Apple** : activé. Renseigne le **Services ID**, le **Team ID**, le **Key ID** et le contenu du fichier `.p8` (étape 1.6). Dans *Client IDs*, ajoute aussi `com.pawstuler.app`.
   - **Google** : activé. Renseigne le **Client ID** et le **Client Secret** de l'étape 3.
4. **Authentication › URL Configuration › Redirect URLs**, ajoute :
   - `pawstuler://connexion` (l'app installée)
   - `exp://**` (pour tester Google dans Expo Go)
5. **Authentication › Email Templates** : traduis les e-mails (confirmation, mot de passe oublié) en français, avec le tutoiement.
6. **Suppression de compte** (obligatoire pour l'App Store) : crée une *Edge Function* nommée `supprimer-compte` (menu **Edge Functions › Create a function**) avec ce code :

```ts
// supabase/functions/supprimer-compte/index.ts
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  // Identifie l'utilisateur grâce à son jeton de connexion
  const jeton = req.headers.get('Authorization')?.replace('Bearer ', '') ?? '';
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data, error } = await admin.auth.getUser(jeton);
  if (error || !data.user) return new Response('Non autorisé', { status: 401 });
  // Supprime définitivement le compte (et, plus tard, ses données en ligne)
  const suppression = await admin.auth.admin.deleteUser(data.user.id);
  if (suppression.error) return new Response('Erreur', { status: 500 });
  return new Response('ok');
});
```

---

## 3. Google Cloud (« Continuer avec Google »)

1. Va sur https://console.cloud.google.com et crée un projet **Pawstuler**.
2. **API et services › Écran de consentement OAuth** : type *Externe*, nom « Pawstuler », ton e-mail, logo, liens vers ta politique de confidentialité.
3. **API et services › Identifiants › Créer des identifiants › ID client OAuth** :
   - Type : **Application Web**.
   - *URI de redirection autorisés* : `https://<ton-projet>.supabase.co/auth/v1/callback` (l'adresse exacte est affichée dans Supabase, fiche du fournisseur Google).
4. Copie le **Client ID** et le **Client Secret** dans Supabase (étape 2.3).

---

## 4. Mettre les clés dans l'app

1. Dans le dossier `app/`, copie `.env.exemple` en `.env`.
2. Remplis :
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
3. Relance `npx expo start`. La phrase « Version de test : ton compte reste sur ce téléphone » disparaît de l'écran de connexion : la vraie connexion est active.

Le fichier `.env` n'est jamais envoyé sur GitHub. Pour les versions construites avec EAS, ajoute les mêmes valeurs dans **expo.dev › ton projet › Environment variables**.

---

## 5. Construire l'app pour ton iPhone (Apple + achats)

1. Crée un compte sur https://expo.dev.
2. Dans `app/` : `npm install -g eas-cli`, puis `eas login`, puis `eas build:configure`.
3. Version de test sur ton iPhone : `eas build --profile development --platform ios` (EAS te guide pour enregistrer ton iPhone et ton compte Apple).
4. Version TestFlight / App Store : `eas build --platform ios` puis `eas submit --platform ios`.

---

## 6. L'abonnement Pawstuler Premium (App Store + RevenueCat)

### Dans App Store Connect
1. Ton app › **Abonnements** › crée un **groupe d'abonnements** « Pawstuler Premium ».
2. Ajoute deux abonnements, avec exactement ces identifiants (ils sont dans `app/src/config/abonnement.ts`) :
   | Identifiant produit | Durée | Prix | Offre de lancement |
   |---|---|---|---|
   | `pawstuler_premium_annuel` | 1 an | 39,99 € | **Essai gratuit de 1 semaine** (offre d'introduction) |
   | `pawstuler_premium_mensuel` | 1 mois | 5,99 € | **Aucune** |
3. Remplis pour chacun le nom affiché (« Pawstuler Premium annuel / mensuel »), la description et une capture de l'écran d'abonnement (exigée pour la validation).
4. Dans **Utilisateurs et accès › Sandbox**, crée un **compte de test** pour acheter sans payer.
5. Ajoute l'URL de ta **politique de confidentialité** dans la fiche de l'app (obligatoire).

### Dans RevenueCat
1. Crée un compte sur https://www.revenuecat.com et un projet **Pawstuler**, avec une app iOS `com.pawstuler.app`.
2. Relie App Store Connect (clé **In-App Purchase** à générer dans App Store Connect › Utilisateurs et accès › Intégrations).
3. Crée un **entitlement** nommé `premium` et rattache-lui les deux produits.
4. Crée une **offering** « default » avec les deux produits.
5. Copie la **clé publique iOS** (commence par `appl_`) dans `app/.env` : `EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_...`.
6. Dis-le-moi : j'installerai `react-native-purchases` et je remplacerai la simulation dans `app/src/services/abonnement.ts` (fonctions `acheterFormule` et `restaurerAchats`). L'écran ne changera pas.

---

## Récapitulatif : ce que tu me renvoies

- [ ] Compte Apple Developer actif (et Team ID)
- [ ] Projet Supabase créé (URL + clé anon dans `app/.env`)
- [ ] Apple, Google et e-mail activés dans Supabase
- [ ] Fonction `supprimer-compte` déployée
- [ ] Client OAuth Google créé
- [ ] Compte Expo créé
- [ ] Les deux abonnements créés dans App Store Connect (essai sur l'annuel uniquement)
- [ ] Projet RevenueCat + clé `appl_…`
- [ ] URL de ta politique de confidentialité (et, si tu en as, de tes conditions d'utilisation)

Tu ne dois **jamais** m'envoyer : la clé `service_role` de Supabase, le fichier `.p8`, le Client Secret Google ni tes mots de passe. Ils vont uniquement dans les tableaux de bord Supabase / Apple.
