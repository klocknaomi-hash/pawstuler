/** En-tête commun aux étapes de l'onboarding : retour + barre de progression « 1/8 ». */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { couleurs, espace } from '@/config/theme';

import { Progression } from './base';

export const TOTAL_ETAPES = 8;

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
    </View>
  );
}

const styles = StyleSheet.create({
  entete: { flexDirection: 'row', alignItems: 'center', gap: espace.m, minHeight: 32 },
});
