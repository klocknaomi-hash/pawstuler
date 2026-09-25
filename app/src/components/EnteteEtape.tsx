/** En-tête commun aux étapes de l'onboarding : retour + points de progression. */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { couleurs } from '@/config/theme';

import { Progression } from './base';

export const TOTAL_ETAPES = 6;

export function EnteteEtape({ etape, retour = true }: { etape: number; retour?: boolean }) {
  return (
    <View style={styles.entete}>
      {retour && router.canGoBack() ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Retour" hitSlop={12} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={couleurs.brun} />
        </Pressable>
      ) : (
        <View style={{ width: 26 }} />
      )}
      <Progression etape={etape} total={TOTAL_ETAPES} />
      <View style={{ width: 26 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  entete: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 32 },
});
