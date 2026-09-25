/**
 * COMPTE ET DONNÉES PERSONNELLES (RGPD)
 * Aujourd'hui, toutes les données restent sur le téléphone.
 * Quand un serveur sera ajouté, c'est ici qu'on appellera ses services :
 *  - export des données (droit d'accès et à la portabilité) ;
 *  - suppression du compte et des données (droit à l'effacement) ;
 *  - déconnexion (fin de session).
 */
import { Share } from 'react-native';

import { effacerSauvegarde } from '@/store/etat';
import type { EtatApp } from '@/store/types';

/** Partage une copie lisible de toutes les données de l'utilisateur (format JSON). */
export async function exporterDonnees(etat: EtatApp): Promise<void> {
  const copie = { exporteLe: new Date().toISOString(), application: 'Pawstuler', donnees: etat };
  await Share.share({ title: 'Mes données Pawstuler', message: JSON.stringify(copie, null, 2) });
}

/** Supprime définitivement le compte. TODO(serveur) : supprimer aussi les données en ligne. */
export async function supprimerCompte(): Promise<void> {
  await effacerSauvegarde();
}

/** Déconnexion. TODO(auth) : révoquer la session auprès du fournisseur. */
export async function deconnecter(): Promise<void> {
  return;
}
