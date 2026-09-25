/** Les 5 onglets : Accueil · Candidatures · Shop · la ville du compagnon · Compte. */
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import type { ColorValue } from 'react-native';

import { couleurs, polices } from '@/config/theme';
import { villeParId } from '@/config/villes';
import { useApp } from '@/store/etat';

type NomIcone = keyof typeof Ionicons.glyphMap;

function icone(nom: NomIcone, actif: NomIcone) {
  return function IconeOnglet({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? actif : nom} size={24} color={color as string} />;
  };
}

export default function LayoutOnglets() {
  const { etat } = useApp();
  const nomVille = etat.villeId ? villeParId(etat.villeId).nom : 'Ma ville';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: couleurs.renardFonce,
        tabBarInactiveTintColor: couleurs.brunDoux,
        tabBarStyle: { backgroundColor: couleurs.carte, borderTopColor: couleurs.ligne },
        tabBarLabelStyle: { fontFamily: polices.texte, fontWeight: '700', fontSize: 10.5 },
        sceneStyle: { backgroundColor: couleurs.creme },
      }}>
      <Tabs.Screen name="accueil" options={{ title: 'Accueil', tabBarIcon: icone('home-outline', 'home') }} />
      <Tabs.Screen
        name="candidatures"
        options={{
          title: etat.contexte === 'pro' ? 'Parcours' : 'Candidatures',
          tabBarIcon: icone('folder-open-outline', 'folder-open'),
        }}
      />
      <Tabs.Screen name="boutique" options={{ title: 'Shop', tabBarIcon: icone('storefront-outline', 'storefront') }} />
      <Tabs.Screen name="ville" options={{ title: nomVille, tabBarIcon: icone('map-outline', 'map') }} />
      <Tabs.Screen name="compte" options={{ title: 'Compte', tabBarIcon: icone('person-circle-outline', 'person-circle') }} />
    </Tabs>
  );
}
