# Décisions

Les choix importants du projet et leurs raisons. Le plus récent en haut de chaque section.
✅ = validé par la fondatrice · 🛠️ = choix technique de Claude · ❓ = encore ouvert

---

## Vision (✅ 20/10)

Aider les jeunes adultes à **recréer un cercle d'amis** quand l'ancien se disperse (fin des études, déménagement, premier job), avec des personnes qu'ils n'auraient jamais croisées. On se rencontre d'abord **en petit groupe, autour d'une activité**. Si le courant passe, le groupe reste et devient un **cercle**. L'amitié en tête-à-tête (« bestie ») vient ensuite, après plusieurs sorties communes.

L'app doit être **aussi rassurante qu'un vrai groupe d'amis**. Ton chaleureux, jamais « appli de rencontre ».

## Produit

| Sujet | Décision | Statut |
|---|---|---|
| Cible | **20 à 35 ans** (communauté plus homogène). Vérifié à l'inscription, côté app et côté serveur. | ✅ 20/10 |
| Ville | Paris et petite couronne uniquement ; les autres villes sur liste d'attente avec compteur public. | ✅ |
| Activités | Ciné et sorties ouverts ; resto, voyage et sport prévus mais masqués. | ✅ |
| Plafond | 300 personnes, par invitation et liste d'attente. | ✅ |
| Taille des groupes | 3 à 6, idéalement 4 à 5. Moins de 3 personnes compatibles : la demande attend (« X personnes intéressées »). | ✅ |
| Cercle | Un groupe qui s'est bien passé devient un cercle permanent. Il peut ressortir entre ses membres, ou ouvrir une sortie à de nouvelles personnes. | ✅ 20/10 |
| Sortie ouverte | La personne qui crée la sortie choisit combien de nouvelles personnes elle accueille, **au moins 2** (et au plus la taille max d'un groupe). | ✅ 20/10 |
| Nouveau membre dans un cercle | **Vote à l'unanimité** des membres actifs. Les votes sont secrets. | ✅ 20/10 |
| Désistement | **Pas de désistement dans l'app** une fois inscrit à une sortie (on peut prévenir le groupe dans le chat). Quitter un cercle reste possible à tout moment, sans justification. | ✅ 20/10 |
| Continuer ailleurs | Si un cercle passe sur WhatsApp ou Insta, c'est une réussite. L'app ne partage jamais un contact à la place de quelqu'un ; dans un cercle permanent uniquement, chacun peut partager **son propre** contact. | ✅ 20/10 |
| Contrat d'utilisation | Un texte de type contrat / conditions, **obligatoire à accepter** pour accéder à l'app. Versionné : une nouvelle version demande une nouvelle acceptation. Rédaction au jalon 1. | ✅ 20/10 |
| Non-mixte | L'option « femmes uniquement » est gardée (besoin fort exprimé dans le brief). « Ouverture à tous et toutes » : toutes les autres sorties sont mixtes. | ❓ à confirmer |
| Genre | Femme, homme, non-binaire. | 🛠️ à confirmer |
| Lien bestie | Proposé après 3 sorties communes et des notes privées positives des deux côtés. Un refus n'est jamais visible. | ✅ (seuil réglable) |

### Questions encore ouvertes (à trancher avant le jalon concerné)
- ❓ **Jalon 3** : quand former un groupe ? Proposition : dès 4 personnes compatibles, ou dès 3 si la sortie a lieu dans moins de 48 h.
- ❓ **Jalon 5** : seuil pour devenir un cercle ? Proposition : au moins 3 « oui » et une majorité des réponses. Et « pas sûr » : retiré comme un « non », ou gardé ?
- ❓ **Jalon 5** : la présence est-elle déclarée par chacun dans le feedback (proposé), ou confirmée par les autres ?
- ❓ **Jalon 6** : « 3 sorties communes » : dans le même groupe uniquement, ou toutes ? Une proposition refusée peut-elle revenir plus tard ?
- ❓ **Jalon 1** : vérification d'âge par date de naissance déclarée au MVP (selfie plus tard), ou vraie vérification d'identité (environ 1 € par personne) ?
- ❓ **Jalon 3** : faut-il limiter l'écart d'âge à l'intérieur d'un groupe ?
- ❓ **Jalon 4** : qui propose le lieu ? Proposition : n'importe quel membre, les autres valident.

## Technique

| Sujet | Décision | Pourquoi |
|---|---|---|
| Emplacement du code | Dossier `amitie/` sur une branche de travail du dépôt Pawstuler, **en attendant un dépôt dédié**. Rien n'est partagé avec Pawstuler. | ✅ 20/10. Le code doit être enregistré quelque part ; le dossier se déplace tel quel dans son propre dépôt plus tard. |
| Mobile | Expo SDK 57, Expo Router, TypeScript. | 🛠️ Même base que Pawstuler, testable dans Expo Go. |
| Backend | Supabase : Postgres, Auth par téléphone, Realtime, RLS, Edge Functions, pg_cron. | ✅ Un seul service pour tout. |
| Organisation | Monorepo npm : `apps/mobile`, `packages/core` (règles et logique pure, testée), `supabase/` (migrations, seed, tests). L'admin (`apps/admin`, Next.js) arrivera au jalon 3. | 🛠️ La logique sensible (matching, bestie, votes) se teste sans base de données et sert à l'app, à l'admin et au serveur. |
| Règles réglables | Valeurs par défaut dans `packages/core/src/regles.ts`, mêmes clés dans la table `app_config`. | 🛠️ Changer un seuil sans republier l'app. |
| Un cercle = un groupe | Pas de table `circles` séparée : un cercle est un groupe au statut `permanent`. | 🛠️ Le cercle garde naturellement son chat, son historique et ses membres. |
| Présence | Dans `event_participants.present` (pas de table à part). | 🛠️ Plus simple. |
| Sécurité des données | RLS sur toutes les tables. On ne lit que ses groupes, ses sorties et ses messages. Les feedbacks, notes privées et votes ne sont lisibles que par leur auteur (et l'admin). Le profil des autres passe par la vue `profils_publics` (prénom, âge, zone, bio). La réponse de l'autre à une proposition bestie n'est jamais lisible (vue `mes_propositions_bestie`). | 🛠️ Garantie au niveau de la base, même si l'app a un bug. |
| Colonnes protégées | L'utilisateur ne peut jamais modifier son rôle, son statut ni sa vérification ; une demande ne peut qu'être annulée. | 🛠️ Droits par colonne en plus des RLS. |
| Actions sensibles | Former un groupe, quitter un cercle, utiliser une invitation, répondre à une proposition bestie : par des fonctions serveur (jalons suivants), pas d'écriture directe. | 🛠️ Les règles restent appliquées côté serveur. |
| Admin | Lecture via son compte (rôle `admin`) ; corrections par des fonctions serveur. | 🛠️ |
| Géolocalisation | Aucune coordonnée GPS : 9 zones (6 dans Paris, 3 départements de la petite couronne). | ✅ |
| Vérification de la base | `npm run db:verifier` : Postgres local jetable + imitation de Supabase + 21 tests de sécurité. | 🛠️ Vérifiable sans compte Supabase. |
| Intégration continue | Pas encore : GitHub n'exécute que les automatismes placés à la racine d'un dépôt. À ajouter avec le dépôt dédié. | 🛠️ |
| Nom et couleurs | Nom provisoire « Amitié » ; palette crème, corail, sauge (`apps/mobile/src/config/theme.ts`). | 🛠️ à remplacer par l'identité définitive. |
