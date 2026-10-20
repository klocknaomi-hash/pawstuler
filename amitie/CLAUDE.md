# App d'amitié — directive pour Claude Code

Ce dossier est un **projet indépendant de Pawstuler**, rangé ici en attendant son propre dépôt. Les consignes Pawstuler du dossier parent ne s'appliquent pas ici, sauf la façon de travailler ci-dessous.

- **Le produit** : se faire des amis à l'âge adulte (20 à 35 ans, Paris), en petit groupe autour d'une activité ; si le courant passe, le groupe devient un cercle ; le lien « bestie » en tête-à-tête vient après plusieurs sorties. Tous les choix sont dans `DECISIONS.md` : le lire avant de travailler, et le tenir à jour.
- **Méthode** : avancer jalon par jalon (voir `README.md`), proposer un plan avant chaque jalon et attendre la validation. Poser la question pour toute décision produit (seuils, règles, textes) ; trancher seul les détails techniques et les noter dans `DECISIONS.md`.
- **Expliquer simplement**, en français, sans jargon : la fondatrice n'est pas développeuse.
- **Ton de l'app** : chaleureux, simple, rassurant, jamais « appli de rencontre ». Vocabulaire du quotidien, tutoiement.
- **Sécurité non négociable** : lieux publics, jamais de numéro ou d'adresse partagés par l'app, pas de géolocalisation précise (zones), signaler / bloquer partout, RGPD. Toute nouvelle table a ses règles RLS et un test dans `supabase/tests/securite.sql`.
- **Logique sensible** (matching, cercles, votes, bestie) : en fonctions pures dans `packages/core`, avec des tests.
- **Avant de dire qu'un jalon est fini** : `npm run verifier` sans erreur (types, lint, tests, base).
