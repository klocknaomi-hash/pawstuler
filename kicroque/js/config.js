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

  // Vos photos de cookies : déposez-les dans assets/photos/ avec les noms listés
  // dans assets/photos/LISEZMOI.md (ex. double-chocolat-plat.jpg, double-chocolat-epais.jpg).
  // Une photo présente remplace l'illustration ; absente, l'illustration reste.
  photos: {
    enabled: true,
    folder: 'assets/photos',
    extension: 'jpg',
  },

  // Avis clients et vidéos UGC (section « Ils ont croqué »), dans l'ordre d'affichage.
  // Déposez les vidéos dans assets/videos/ (MP4 vertical, 9:16, moins de 8 Mo) et
  // une image d'aperçu (poster) dans assets/photos/. Tant que la liste est vide,
  // la section invite les clients à partager leur vidéo.
  // N'ajoutez que de vrais avis, avec l'accord de la personne.
  reviews: [
    // { type: 'video', src: 'assets/videos/avis-1.mp4', poster: 'assets/photos/avis-1.jpg', handle: '@prenom' },
    // { type: 'quote', text: 'Le Pistache Gianduja épais, c’est une dinguerie.', author: 'Prénom N.' },
  ],

  contactEmail: 'contact@kicroque.fr',
  instagramUrl: 'https://www.instagram.com/kicroque',
  instagramHandle: '@kicroque',
};
