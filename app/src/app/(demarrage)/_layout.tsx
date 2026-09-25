import { Stack } from 'expo-router';

import { couleurs } from '@/config/theme';

/** Parcours de démarrage : présentation → connexion → onboarding (6 étapes). */
export default function LayoutDemarrage() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: couleurs.creme },
      }}>
      <Stack.Screen name="presentation" />
      <Stack.Screen name="connexion" />
      <Stack.Screen name="prenom" options={{ gestureEnabled: false }} />
      <Stack.Screen name="objectif" />
      <Stack.Screen name="animal" />
      {/* L'éclosion ne se rejoue pas en revenant en arrière */}
      <Stack.Screen name="oeuf" options={{ gestureEnabled: false, animation: 'fade' }} />
      <Stack.Screen name="nom-compagnon" options={{ gestureEnabled: false }} />
      <Stack.Screen name="ville-depart" />
    </Stack>
  );
}
