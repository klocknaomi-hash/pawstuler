/**
 * RAPPELS SUR LE TÉLÉPHONE (notifications locales)
 * Programmés par le téléphone lui-même : aucun serveur n'est nécessaire, et ils marchent
 * même hors connexion. À chaque changement utile (paramètres, candidatures, essai Premium,
 * rythme du compagnon), on efface tout et on reprogramme la liste à jour.
 *
 * Ton toujours bienveillant : jamais de culpabilisation, jamais de rappel pendant que le
 * compagnon dort.
 *  - Tâches du jour : chaque matin, une heure après le réveil du compagnon.
 *  - Relances : 7 jours après l'envoi d'une candidature restée sans réponse, à 10 h.
 *  - Essai Premium : 3 jours puis 1 jour avant la fin, à 10 h (transparence sur le prix).
 *  - Essai encore disponible : un rappel doux au plus tous les 4 jours, à 18 h, sans insister.
 *  - Retour de mission : à l'heure exacte où le compagnon rentre (il a une histoire à raconter).
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { JOURS_ESSAI } from '@/config/abonnement';
import { JOURS_AVANT_RELANCE } from '@/config/taches';
import { jourDe } from '@/logique/dates';
import { compagnonAbsent, estUnMoment } from '@/logique/missions';
import { candidaturesActives } from '@/logique/tachesDuJour';
import { essaiDisponible } from '@/services/abonnement';
import type { EtatApp } from '@/store/types';

/** iOS garde au maximum 64 rappels programmés : on reste largement en dessous. */
const MAX_RELANCES = 30;

export type Autorisation = 'accordee' | 'refusee' | 'a-demander' | 'indisponible';

const disponible = () => Platform.OS === 'ios' || Platform.OS === 'android';

// Si l'app est ouverte quand un rappel arrive, on l'affiche quand même (bannière discrète).
if (disponible()) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/** Où en est l'autorisation du téléphone. */
export async function autorisation(): Promise<Autorisation> {
  if (!disponible()) return 'indisponible';
  const { status, canAskAgain } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return 'accordee';
  return canAskAgain ? 'a-demander' : 'refusee';
}

/** Demande l'autorisation (la fenêtre d'iOS n'apparaît qu'une fois). */
async function demanderAutorisation(): Promise<boolean> {
  const actuelle = await autorisation();
  if (actuelle === 'accordee') return true;
  if (actuelle !== 'a-demander') return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/** Date locale (AAAA-MM-JJ + n jours) à une heure donnée. */
function dateA(jour: string, plusJours: number, heure: number): Date {
  const d = new Date(`${jour}T00:00:00`);
  d.setDate(d.getDate() + plusJours);
  d.setHours(heure, 0, 0, 0);
  return d;
}

/** Heure à laquelle le compagnon est réveillé (on ne dérange jamais pendant son sommeil). */
function heureEveillee(etat: EtatApp, voulue: number): number {
  const { reveil, coucher } = etat.rythme;
  return Math.min(Math.max(voulue, reveil), coucher - 1);
}

async function programmerLe(date: Date, titre: string, corps: string) {
  if (date.getTime() <= Date.now()) return;
  await Notifications.scheduleNotificationAsync({
    content: { title: titre, body: corps },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  });
}

/**
 * Remet à jour tous les rappels selon l'état de l'app.
 * Renvoie l'autorisation actuelle (pour l'afficher dans les paramètres).
 */
export async function synchroniserRappels(etat: EtatApp): Promise<Autorisation> {
  if (!disponible()) return 'indisponible';
  await Notifications.cancelAllScheduledNotificationsAsync();
  const p = etat.parametres;
  if (!etat.connecte || !etat.onboardingTermine || !p.notifications) return autorisation();
  if (!(await demanderAutorisation())) return autorisation();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('rappels', { name: 'Rappels', importance: Notifications.AndroidImportance.DEFAULT });
  }

  const nom = etat.compagnon?.nom ?? 'Ton compagnon';

  // 1. Tâches du jour : chaque matin, une heure après le réveil du compagnon
  if (p.rappelsTaches) {
    const heure = heureEveillee(etat, etat.rythme.reveil + 1);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${nom} est réveillé ☀️`,
        body: etat.contexte === 'pro' ? 'Tes petites missions du jour t’attendent. À ton rythme !' : 'Tes tâches du jour sont prêtes. Un petit pas suffit 🐾',
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: heure, minute: 0 },
    });
  }

  // 2. Relances : 7 jours après l'envoi, si la candidature est toujours « envoyée »
  if (p.rappelsRelance) {
    const aRelancer = candidaturesActives(etat)
      .filter((c) => c.statut === 'envoyee' && c.dateEnvoi)
      .slice(0, MAX_RELANCES);
    for (const c of aRelancer) {
      await programmerLe(
        dateA(c.dateEnvoi as string, JOURS_AVANT_RELANCE, heureEveillee(etat, 10)),
        `Une relance pour ${c.entreprise} ?`,
        `Ça fait ${JOURS_AVANT_RELANCE} jours que tu as postulé. Un petit message suffit, ${nom} croise les doigts avec toi.`,
      );
    }
  }

  // 3. Fin de l'essai Premium : transparence sur la date et le prix
  if (etat.abonnement.statut === 'essai' && etat.abonnement.debutEssai) {
    const debut = etat.abonnement.debutEssai;
    const heure = heureEveillee(etat, 10);
    await programmerLe(dateA(debut, JOURS_ESSAI - 3, heure), 'Ton essai Premium', 'Il se termine dans 3 jours. Ensuite : 39,99 €/an, sauf résiliation.');
    await programmerLe(dateA(debut, JOURS_ESSAI - 1, heure), 'Ton essai Premium', 'Il se termine demain. Ensuite : 39,99 €/an, sauf résiliation.');
  }

  // 4. Essai jamais utilisé : un petit rappel doux, 4 jours après le dernier
  if (essaiDisponible(etat)) {
    await programmerLe(
      dateA(etat.abonnement.rappelEssaiLe ?? jourDe(), 4, heureEveillee(etat, 18)),
      'Tes 7 jours d’essai Premium t’attendent ✨',
      `Quand tu veux, sans pression. ${nom} est prêt à te montrer tout ce qu’il sait faire.`,
    );
  }

  // 5. Retour de mission : le compagnon rentre, son récit l'attend (même si l'app est fermée)
  const mission = compagnonAbsent(etat);
  if (mission?.retour) {
    await programmerLe(new Date(mission.retour), `${nom} est de retour 🎒`, estUnMoment(mission) ? 'Viens voir comment s’est passé son petit moment 💛' : `Sa mission chez ${mission.lieu} est terminée. Viens découvrir ce qui s’est passé !`);
  }

  return 'accordee';
}
