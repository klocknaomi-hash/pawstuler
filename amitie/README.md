# App d'amitié (nom provisoire)

Se faire des amis à l'âge adulte, en petit groupe, autour d'une activité. Si le courant passe, le groupe reste.
Paris, 20 à 35 ans. Voir `DECISIONS.md` pour tous les choix.

## Ce qu'il y a dans ce dossier

| Dossier | Contenu |
|---|---|
| `apps/mobile` | L'app iPhone / Android (Expo) |
| `packages/core` | Les règles du produit et la logique sensible (âge, puis matching, cercles, bestie), avec leurs tests |
| `supabase/migrations` | Le schéma de la base de données et les règles d'accès |
| `supabase/seed.sql` | Les données de départ (réglages, zones de Paris, activités, centres d'intérêt) |
| `supabase/tests` | Les tests de sécurité de la base |

## Ouvrir l'app sur ton iPhone

Sur ton ordinateur (Node.js installé) :

```bash
cd amitie
npm install
npm run mobile
```

Un QR code s'affiche : scanne-le avec l'appareil photo de l'iPhone, l'app s'ouvre dans **Expo Go**.

## Vérifier que tout est en ordre

```bash
npm run verifier   # types, lint, tests de la logique, tests de sécurité de la base
```

La vérification de la base demande Postgres installé sur l'ordinateur.

## Jalons

0. ✅ Socle : projet, base de données, règles d'accès, premier écran
1. Accès : invitation / liste d'attente, téléphone, âge, profil, contrat
2. Demandes « Je cherche quelqu'un pour… »
3. Matching, formation des groupes, animation manuelle (admin)
4. Groupe, sortie, chat, signaler / bloquer
5. Feedback et cercles
6. Bestie
7. Admin complet, RGPD, publication TestFlight
