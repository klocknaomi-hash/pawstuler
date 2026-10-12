/**
 * Les 5 onglets : Accueil · Candidatures · Shop · la ville du compagnon · Compte.
 * Barre flottante : une capsule arrondie posée au-dessus du bas de l'écran, l'onglet actif dans une pastille.
 */
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import { Text, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { barreOnglets, couleurs, ombre, polices, relief } from '@/config/theme';
import { villeParId } from '@/config/villes';
import { useApp } from '@/store/etat';

type NomIcone = keyof typeof Ionicons.glyphMap;

function icone(nom: NomIcone, actif: NomIcone) {
  return function IconeOnglet({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? actif : nom} size={22} color={color as string} />;
  };
}

/** Nom de l'onglet, toujours en entier (« Candidatures », « Clairebourg ») : la police rétrécit un peu si besoin. */
function Etiquette({ color, children }: { color: ColorValue; children: string }) {
  return (
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.8}
      style={{ color, fontFamily: polices.texte, fontWeight: '700', fontSize: 10, lineHeight: 14, minHeight: 15, flexShrink: 0, letterSpacing: -0.3, marginTop: 1 }}>
      {children}
    </Text>
  );
}

export default function LayoutOnglets() {
  const { etat } = useApp();
  const nomVille = etat.villeId ? villeParId(etat.villeId).nom : 'Ma ville';
  const { bottom } = useSafeAreaInsets();

  return (
    <Tabs
      // La barre gère elle-même la zone de sécurité (elle flotte au-dessus)
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: couleurs.renardFonce,
        tabBarInactiveTintColor: couleurs.brunDoux,
        tabBarStyle: {
          position: 'absolute',
          left: barreOnglets.marge,
          right: barreOnglets.marge,
          bottom: Math.max(bottom, barreOnglets.marge),
          height: barreOnglets.hauteur,
          borderRadius: barreOnglets.hauteur / 2,
          backgroundColor: couleurs.carte,
          paddingTop: 6,
          paddingBottom: 8,
          paddingHorizontal: 4,
          ...relief,
          borderTopWidth: 1.5,
          borderTopColor: couleurs.ligne,
          ...ombre,
        },
        tabBarItemStyle: { borderRadius: 22, overflow: 'hidden', marginHorizontal: 0, paddingHorizontal: 0 },
        tabBarActiveBackgroundColor: couleurs.pecheClair,
        tabBarLabel: Etiquette,
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
