/**
 * TEXTES LÉGAUX (brouillon à faire relire)
 * Politique de confidentialité et conditions d'utilisation, affichées dans l'app
 * (écran src/app/legal/[doc].tsx). Les mêmes textes sont dans docs/legal/ pour être
 * publiés sur une page web (l'App Store demande une adresse en ligne).
 * Les passages « [À COMPLÉTER] » attendent tes coordonnées.
 */

export type DocumentLegal = { titre: string; intro: string; sections: { titre: string; paragraphes: string[] }[] };

export type IdDocumentLegal = 'confidentialite' | 'conditions';

export const DOCUMENTS_LEGAUX: Record<IdDocumentLegal, DocumentLegal> = {
  confidentialite: {
    titre: "Politique de confidentialité",
    intro: "Dernière mise à jour : 25 septembre 2026. Chez Pawstuler, tes données t’appartiennent. Cette page explique simplement ce que l’app garde, pourquoi, où, et comment exercer tes droits.",
    sections: [
      {
        titre: "Qui est responsable de tes données",
        paragraphes: [
          "Le responsable du traitement est [À COMPLÉTER] (nom ou société, adresse). Pour toute question sur tes données : [À COMPLÉTER] (adresse e-mail de contact)."
        ]
      },
      {
        titre: "Les données que l’app utilise",
        paragraphes: [
          "Ton prénom, et ton adresse e-mail si tu te connectes par e-mail, Apple ou Google.",
          "Ton compagnon (animal, prénom, pronoms), sa ville, ta série de jours et tes réglages (rythme du compagnon, rappels).",
          "Tes tâches, tes pièces et leur historique, les objets et tenues que tu possèdes.",
          "Tes candidatures (entreprise, poste, lien, adresse e-mail, dates, statut, notes) et tes objectifs professionnels.",
          "Ton abonnement Pawstuler Premium (formule, dates). Tes informations de paiement ne passent jamais par nous : elles restent chez Apple."
        ]
      },
      {
        titre: "Pourquoi",
        paragraphes: [
          "Uniquement pour faire fonctionner l’app : te proposer des tâches adaptées, suivre tes candidatures, faire vivre ton compagnon, t’envoyer les rappels que tu as choisis et gérer ton abonnement.",
          "Pas de publicité, pas de revente, pas de profilage commercial. Tes données ne sont jamais vendues."
        ]
      },
      {
        titre: "Où elles sont gardées",
        paragraphes: [
          "Sur ton téléphone : toutes tes données y sont enregistrées, et l’app fonctionne même hors connexion.",
          "En ligne, si tu crées un compte : ton compte est géré par Supabase, avec des serveurs situés dans l’Union européenne. Quand la sauvegarde en ligne sera activée, tes données y seront copiées pour que tu les retrouves sur un autre téléphone.",
          "Les rappels sont programmés directement par ton téléphone : aucun serveur n’est nécessaire."
        ]
      },
      {
        titre: "Les services qui nous aident",
        paragraphes: [
          "Supabase (comptes et sauvegarde, Union européenne).",
          "Apple (connexion avec Apple, paiements de l’App Store) et Google (connexion avec Google), seulement si tu choisis ces méthodes.",
          "RevenueCat (gestion de l’abonnement Premium, sans accès à tes moyens de paiement).",
          "Chacun ne reçoit que ce qui lui est nécessaire."
        ]
      },
      {
        titre: "Combien de temps",
        paragraphes: [
          "Tant que ton compte existe. Si tu supprimes ton compte depuis l’app (Compte › Supprimer mon compte), tes données sont effacées du téléphone et de nos serveurs. Rien n’est gardé « au cas où »."
        ]
      },
      {
        titre: "Tes droits",
        paragraphes: [
          "Tu peux consulter, corriger, récupérer (export) et effacer tes données à tout moment, directement dans l’app : Compte › Mes données et RGPD.",
          "Tu peux aussi t’opposer à un traitement ou en demander la limitation en nous écrivant à l’adresse ci-dessus. Nous répondons sous un mois.",
          "Si tu estimes que tes droits ne sont pas respectés, tu peux saisir la CNIL (www.cnil.fr)."
        ]
      },
      {
        titre: "Âge",
        paragraphes: [
          "Pawstuler s’adresse aux personnes de 15 ans et plus. En dessous, l’accord d’un parent est nécessaire."
        ]
      },
      {
        titre: "Changements",
        paragraphes: [
          "Si cette politique change, nous te prévenons dans l’app avant que les changements s’appliquent."
        ]
      }
    ]
  },
  conditions: {
    titre: "Conditions d’utilisation",
    intro: "Dernière mise à jour : 25 septembre 2026. En utilisant Pawstuler, tu acceptes ces conditions. Nous les avons écrites le plus simplement possible.",
    sections: [
      {
        titre: "Le service",
        paragraphes: [
          "Pawstuler est une application qui t’aide à organiser ta recherche d’emploi (tâches du jour, suivi de candidatures), accompagné d’un compagnon virtuel. Elle est éditée par [À COMPLÉTER]."
        ]
      },
      {
        titre: "Pas de promesse d’embauche",
        paragraphes: [
          "Pawstuler t’accompagne et t’encourage, mais ne garantit pas de trouver un emploi. Les conseils et tâches proposés sont indicatifs."
        ]
      },
      {
        titre: "Ton compte",
        paragraphes: [
          "Tu es responsable de ce que tu enregistres dans l’app et de la confidentialité de tes identifiants. Tu peux supprimer ton compte à tout moment depuis l’app."
        ]
      },
      {
        titre: "Les pièces et les objets",
        paragraphes: [
          "Les pièces se gagnent uniquement en utilisant l’app. Elles ne s’achètent pas, n’ont aucune valeur en argent, ne peuvent être ni échangées ni remboursées. Il en va de même pour les objets et tenues obtenus avec les pièces."
        ]
      },
      {
        titre: "Pawstuler Premium",
        paragraphes: [
          "Abonnement annuel à 39,99 € par an, avec 7 jours d’essai gratuit (une seule fois), ou mensuel à 5,99 € par mois, sans essai.",
          "Le paiement est géré par Apple (App Store). L’abonnement se renouvelle automatiquement au même prix, sauf résiliation au moins 24 h avant la fin de la période en cours, dans Réglages › ton nom › Abonnements.",
          "La version gratuite reste pleinement utilisable pour ta recherche d’emploi : Premium ajoute du contenu et des fonctionnalités en plus.",
          "Les remboursements suivent les règles de l’App Store."
        ]
      },
      {
        titre: "Utilisation correcte",
        paragraphes: [
          "Tu t’engages à ne pas détourner l’app, ni tenter d’en perturber le fonctionnement, ni y enregistrer de contenu illégal."
        ]
      },
      {
        titre: "Propriété",
        paragraphes: [
          "Les illustrations, personnages, textes et le nom Pawstuler sont protégés. Tes données, elles, restent les tiennes."
        ]
      },
      {
        titre: "Responsabilité",
        paragraphes: [
          "Nous faisons notre maximum pour que l’app fonctionne bien, sans pouvoir garantir l’absence totale d’erreur ou d’interruption. Pense à exporter tes données si elles sont importantes pour toi."
        ]
      },
      {
        titre: "Changements et résiliation",
        paragraphes: [
          "Nous pouvons faire évoluer l’app et ces conditions ; tu en seras informé dans l’app. Tu peux arrêter d’utiliser Pawstuler et supprimer ton compte quand tu veux."
        ]
      },
      {
        titre: "Droit applicable et contact",
        paragraphes: [
          "Ces conditions sont soumises au droit français. En cas de litige, une solution amiable est recherchée en priorité. Contact : [À COMPLÉTER]."
        ]
      }
    ]
  }
};
