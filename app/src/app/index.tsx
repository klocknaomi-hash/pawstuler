/**
 * AIGUILLAGE AU LANCEMENT
 * Pas connecté → présentation. Onboarding commencé → on reprend où il s'était arrêté.
 * Onboarding terminé → accueil.
 */
import { Redirect } from 'expo-router';

import { useApp } from '@/store/etat';

export default function Aiguillage() {
  const { etat } = useApp();

  if (!etat.connecte || !etat.utilisateur) return <Redirect href="/presentation" />;
  if (etat.onboardingTermine) return <Redirect href="/accueil" />;
  if (!etat.utilisateur.prenom) return <Redirect href="/prenom" />;
  if (!etat.compagnon) return <Redirect href="/objectif" />;
  return <Redirect href="/ville-depart" />;
}
