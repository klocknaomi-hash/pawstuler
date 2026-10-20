import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { couleurs } from '@/config/theme';

export default function Racine() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: couleurs.fond } }} />
    </>
  );
}
