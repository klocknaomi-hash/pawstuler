/* ==========================================================================
   KiCroque — configuration du site (côté navigateur)
   --------------------------------------------------------------------------
   ⚠️ Seule la clé PUBLIQUE Stripe (pk_...) va ici. Les clés secrètes
   (sk_..., Resend, Upstash) se mettent dans les variables d'environnement
   de l'hébergeur (voir README.md et .env.example).
   ========================================================================== */
window.KC_CONFIG = {
  // Clé publique Stripe : Dashboard Stripe › Développeurs › Clés API
  // pk_test_... pour tester, pk_live_... en production.
  stripePublishableKey: 'pk_test_REMPLACER_PAR_VOTRE_CLE_PUBLIQUE',

  // Adresse des fonctions serveur (dossier /api déployé sur Vercel)
  apiBase: '/api',

  // Mode démo : 'auto' = activé tant que la clé Stripe n'est pas renseignée
  // (paiement simulé, jauge de stock stockée dans le navigateur).
  // true = toujours démo, false = jamais démo.
  demoMode: 'auto',

  // Thème : 'light' (clair par défaut) ou 'auto' (suit le réglage du téléphone)
  defaultTheme: 'light',

  contactEmail: 'contact@kicroque.fr',
  instagramUrl: 'https://www.instagram.com/kicroque',
  instagramHandle: '@kicroque',
};
