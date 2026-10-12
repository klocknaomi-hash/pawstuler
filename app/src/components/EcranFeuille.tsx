/**
 * ÉCRAN « FEUILLE » (présentation, connexion, inscription)
 * En haut : le décor de Clairebourg avec la mascotte ; en bas : une feuille blanche arrondie
 * qui contient le texte et les boutons. Le contenu de la feuille défile si besoin (clavier ouvert).
 */
import type { ReactNode } from 'react';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { EspeceId, Pose } from '@/config/compagnons';
import { couleurs, espace } from '@/config/theme';
import type { VilleId } from '@/config/villes';
import { imageVille } from '@/illustrations/registre';

import { Compagnon } from './Compagnon';

export function EcranFeuille({
  children,
  bas,
  entete,
  espece = 'renard',
  ville = 'clairebourg',
  pose = 'salut',
  hauteurDecor = 260,
  tailleMascotte = 150,
  onFermer,
}: {
  children: ReactNode;
  /** Zone fixée en bas de la feuille (boutons). */
  bas?: ReactNode;
  /** En haut de la feuille, hors défilement (ex. barre de progression de l'onboarding). */
  entete?: ReactNode;
  /** Mascotte : Ziggy par défaut (avant le choix de l'animal), sinon le compagnon choisi. */
  espece?: EspeceId;
  ville?: VilleId;
  pose?: Pose;
  hauteurDecor?: number;
  tailleMascotte?: number;
  /** Fenêtre qu'on peut refermer (ex. abonnement) : une croix en haut à droite du décor. */
  onFermer?: () => void;
}) {
  const { top, bottom } = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={styles.ecran} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Décor : la ville en fond, la mascotte posée en bas, juste au-dessus de la feuille */}
      <View style={[styles.decor, { height: hauteurDecor + top }]}>
        <Image source={imageVille(ville, 'paysage')} style={StyleSheet.absoluteFill} contentFit="cover" />
        <View style={styles.voile} />
        <Compagnon espece={espece} pose={pose} taille={tailleMascotte} style={styles.mascotte} />
        {onFermer ? (
          <Pressable
            onPress={onFermer}
            accessibilityRole="button"
            accessibilityLabel="Fermer"
            hitSlop={10}
            style={[styles.fermer, { top: top + espace.m }]}>
            <Ionicons name="close" size={22} color={couleurs.brun} />
          </Pressable>
        ) : null}
      </View>

      {/* Feuille blanche */}
      <View style={styles.feuille}>
        {entete ? <View style={styles.entete}>{entete}</View> : null}
        <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
        {bas ? <View style={[styles.bas, { paddingBottom: Math.max(bottom, espace.l) }]}>{bas}</View> : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const ARRONDI_FEUILLE = 32;

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.creme },
  decor: { overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  // Léger voile crème pour que la mascotte se détache du décor
  voile: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: couleurs.creme, opacity: 0.15 },
  mascotte: { marginBottom: ARRONDI_FEUILLE - 14 },
  fermer: {
    position: 'absolute',
    right: espace.l,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feuille: {
    flex: 1,
    backgroundColor: couleurs.carte,
    borderTopLeftRadius: ARRONDI_FEUILLE,
    borderTopRightRadius: ARRONDI_FEUILLE,
    marginTop: -ARRONDI_FEUILLE,
    // Petite ombre vers le haut pour détacher la feuille du décor
    shadowColor: '#5E3A2C',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6,
  },
  entete: { paddingHorizontal: espace.xl, paddingTop: espace.l },
  contenu: { paddingHorizontal: espace.xl, paddingTop: espace.xl, paddingBottom: espace.l, gap: espace.m },
  bas: { paddingHorizontal: espace.xl, paddingTop: espace.s, gap: espace.s },
});
