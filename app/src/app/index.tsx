/**
 * AIGUILLAGE AU LANCEMENT
 * Nouvel utilisateur → présentation. Onboarding commencé → on reprend où il s'était arrêté.
 * Onboarding terminé → accueil.
 */
import { Redirect } from 'expo-router';

import { useApp } from '@/store/etat';

export default function Aiguillage() {
  const { etat } = useApp();

  if (etat.onboardingTermine) return <Redirect href="/accueil" />;
  if (!etat.utilisateur) return <Redirect href="/presentation" />;
  if (!etat.utilisateur.prenom) return <Redirect href="/prenom" />;
  if (!etat.compagnon) return <Redirect href="/objectif" />;
  if (!etat.villeId) return <Redirect href="/ville-depart" />;
  return <Redirect href="/rythme" />;
}
