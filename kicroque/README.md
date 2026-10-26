# KiCroque — site e-commerce

Site de vente de cookies artisanaux : HTML / CSS / JavaScript pur, sans framework ni Shopify.
Paiement **Stripe**, e-mails **Resend**, compteur des commandes **Upstash Redis**, hébergement **Vercel**.

## Tester tout de suite (mode démo)

```bash
cd kicroque
python3 -m http.server 8000      # puis ouvrir http://localhost:8000
```

Tant que la clé Stripe n'est pas renseignée, le site est en **mode démo** : le paiement est simulé, la jauge
de stock est enregistrée dans le navigateur, et la confirmation affiche un vrai numéro `KC-XXXXX`.

Astuce : `?date=2026-12-10` à la fin de l'adresse affiche le site comme à cette date (recettes de Noël,
d'hiver, etc.). Ça ne marche qu'en démo.

## Structure

| Fichier | Rôle |
|---|---|
| `index.html` | La page (bannière, nav, hero, infos, jauge, cookies, coffrets, saisons, étapes, livraison, footer, panier, modales) |
| `css/styles.css` | Le style (mobile d'abord, thème clair par défaut, thème sombre) |
| `js/shared.js` | **Le catalogue et les règles** : prix, saveurs, coffrets, recettes de saison, livraison, quota. Utilisé par le site ET par le serveur |
| `js/config.js` | Clé **publique** Stripe, mode démo, thème, contact |
| `js/cookies-svg.js` | Illustrations des cookies (en attendant vos photos) |
| `js/app.js` | Panier, jauge, commande, toasts, confirmation |
| `api/*.js` | Fonctions serveur : `create-checkout-session`, `stripe-webhook`, `stock`, `order-status` |
| `mentions-legales.html` | Mentions légales, CGV, allergènes, données (les « [À COMPLÉTER] » sont à remplir) |

### Modifier les produits
Tout est dans `js/shared.js` : `TEXTURES` (3,50 € / 4,50 €), `FLAVORS`, `BOXES` (coffrets), `SEASONAL` et
`SEASONAL_PRICES` (recettes de saison 4 € / 5 €), `SHIPPING`, `RULES` (8 commandes/jour, ven + sam,
commande le jour même avant midi, gratuit dès 30 €). Les recettes de saison et d'événement s'affichent
et disparaissent toutes seules selon leurs dates (Pâques est calculée chaque année).

## Mise en production

1. **Vercel** : importer le dépôt, *Root Directory* = `kicroque`. Rien à compiler.
2. **Upstash Redis** (gratuit) : créer une base et copier `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
   (ou ajouter « Upstash for Redis » depuis le Marketplace Vercel).
3. **Stripe** :
   - Clé publique `pk_...` → `js/config.js` (`stripePublishableKey`).
   - Clé secrète `sk_...` → variable `STRIPE_SECRET_KEY` sur Vercel.
   - Développeurs › Webhooks › Ajouter : `https://votre-site/api/stripe-webhook`, événements
     `checkout.session.completed` et `checkout.session.async_payment_succeeded` → copier le secret `whsec_...`
     dans `STRIPE_WEBHOOK_SECRET`.
4. **Resend** : vérifier le domaine `kicroque.fr`, puis `RESEND_API_KEY`, `OWNER_EMAIL` (reçoit chaque commande),
   `FROM_EMAIL`.
5. `SITE_URL` = l'adresse publique du site.

Toutes les variables sont listées dans `.env.example`. Commencez avec les clés **test** de Stripe
(carte `4242 4242 4242 4242`), puis passez aux clés live.

## Comment se passe une commande

1. Le client remplit le panier et le formulaire, choisit le vendredi ou le samedi et Stuart ou Colissimo.
2. `/api/create-checkout-session` **recalcule les prix** (on ne fait jamais confiance au navigateur), vérifie le quota
   du jour, le code postal pour Stuart, et si l'e-mail a déjà commandé (livraison offerte seulement à la 1ʳᵉ commande),
   puis crée le paiement Stripe, qui s'affiche dans la fenêtre du site.
3. Une fois payé, Stripe appelle `/api/stripe-webhook` : la commande compte dans la jauge, et deux e-mails partent
   (vous + le client).
4. Le client revient sur le site et voit la fenêtre de confirmation avec son numéro `KC-XXXXX`.

Cas rare : si deux personnes paient en même temps le dernier créneau, les deux paiements passent ; l'e-mail que
vous recevez le signale (« ⚠️ Quota dépassé ») pour que vous puissiez contacter le client.
