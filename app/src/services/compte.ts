/**
 * COMPTE ET DONNÉES PERSONNELLES (RGPD)
 * Aujourd'hui, toutes les données restent sur le téléphone.
 * Quand un serveur sera ajouté, c'est ici qu'on appellera ses services :
 *  - export des données (droit d'accès et à la portabilité) ;
 *  - suppression du compte et des données (droit à l'effacement) ;
 *  - déconnexion (fin de session).
 */
import { Share } from 'react-native';

import { fermerSession, supprimerCompteEnLigne } from '@/services/auth';
import { effacerSauvegarde } from '@/store/etat';
import type { EtatApp } from '@/store/types';

/** Partage une copie lisible de toutes les données de l'utilisateur (format JSON). */
export async function exporterDonnees(etat: EtatApp): Promise<void> {
  const copie = { exporteLe: new Date().toISOString(), application: 'Pawstuler', donnees: etat };
  await Share.share({ title: 'Mes données Pawstuler', message: JSON.stringify(copie, null, 2) });
}

/** Supprime définitivement le compte : en ligne (si la connexion réelle est branchée), puis sur le téléphone. */
export async function supprimerCompte(): Promise<void> {
  await supprimerCompteEnLigne();
  await effacerSauvegarde();
}

/** Déconnexion : ferme la session en ligne. Les données restent sur le téléphone. */
export async function deconnecter(): Promise<void> {
  await fermerSession().catch(() => {});
}
