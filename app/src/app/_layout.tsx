import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { couleurs } from '@/config/theme';
import { FournisseurApp, useApp } from '@/store/etat';

SplashScreen.preventAutoHideAsync();

function Navigation() {
  const { pret } = useApp();

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
      <Stack.Screen name="ziggy-plus" options={{ presentation: 'modal' }} />
      <Stack.Screen name="nouvelle-candidature" options={{ presentation: 'modal' }} />
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
