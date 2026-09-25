import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { couleurs, polices } from '@/config/theme';
import { synchroniserRappels } from '@/services/rappels';
import { FournisseurApp, useApp } from '@/store/etat';

SplashScreen.preventAutoHideAsync();

/** En-tête commun des pages secondaires (Compte, fiche candidature…). */
const avecEntete = (title: string) => ({
  headerShown: true,
  title,
  headerBackTitle: 'Retour',
  headerTintColor: couleurs.renardFonce,
  headerStyle: { backgroundColor: couleurs.creme },
  headerTitleStyle: { fontFamily: polices.titre, fontWeight: '800' as const, color: couleurs.brun },
  headerShadowVisible: false,
});

function Navigation() {
  const { etat, pret } = useApp();

  // Rappels sur le téléphone : remis à jour peu après chaque changement (candidature, paramètres…)
  useEffect(() => {
    if (!pret) return;
    const minuterie = setTimeout(() => synchroniserRappels(etat).catch(() => {}), 1500);
    return () => clearTimeout(minuterie);
  }, [etat, pret]);

  // On garde l'écran de lancement tant que les données du téléphone ne sont pas relues
  useEffect(() => {
    if (pret) SplashScreen.hideAsync();
  }, [pret]);
  if (!pret) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: couleurs.creme } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(demarrage)" />
      <Stack.Screen name="(onglets)" options={{ animation: 'fade' }} />
      {/* Moments du compagnon */}
      <Stack.Screen name="aventure" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
      <Stack.Screen name="decroche" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
      <Stack.Screen name="aventure-pro" options={{ presentation: 'modal' }} />
      {/* Candidatures */}
      <Stack.Screen name="nouvelle-candidature" options={{ presentation: 'modal' }} />
      <Stack.Screen name="candidature/[id]" options={avecEntete('Candidature')} />
      <Stack.Screen name="felicitations" options={{ ...avecEntete(''), headerStyle: { backgroundColor: couleurs.corailClair } }} />
      {/* Compte */}
      <Stack.Screen name="compte/profil" options={avecEntete('Profil')} />
      <Stack.Screen name="compte/parametres" options={avecEntete('Paramètres')} />
      <Stack.Screen name="compte/confidentialite" options={avecEntete('Mes données')} />
      <Stack.Screen name="compte/portefeuille" options={avecEntete('Portefeuille')} />
      <Stack.Screen name="compagnon" options={avecEntete('Mon compagnon')} />
      <Stack.Screen name="premium" options={{ presentation: 'modal' }} />
      {/* Textes légaux : en fenêtre, pour s'ouvrir aussi par-dessus l'écran d'abonnement */}
      <Stack.Screen name="legal/[doc]" options={{ ...avecEntete('Informations'), presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <FournisseurApp>
      <StatusBar style="dark" />
      <Navigation />
    </FournisseurApp>
  );
}
