/**
 * COMPOSANTS DE BASE
 * Écran, textes, bouton, champ de saisie, carte à choisir, barre de progression.
 * Tous prennent leurs couleurs et tailles dans src/config/theme.ts.
 */
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { arrondis, couleurs, espace, polices, relief, tailles } from '@/config/theme';

/* ---------- Écran ---------- */

export function Ecran({
  children,
  defilant = false,
  style,
  fond = couleurs.creme,
  bas,
  avecEntete = false,
}: {
  children: ReactNode;
  /** Page avec en-tête natif (titre + retour) : pas de marge de sécurité en haut. */
  avecEntete?: boolean;
  defilant?: boolean;
  style?: StyleProp<ViewStyle>;
  fond?: string;
  /** Zone fixée en bas (ex. bouton « Continuer »). */
  bas?: ReactNode;
}) {
  const contenu = defilant ? (
    <ScrollView contentContainerStyle={[styles.contenu, style]} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.contenu, { flex: 1 }, style]}>{children}</View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: fond }} edges={avecEntete ? ['bottom'] : ['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {contenu}
        {bas ? <View style={styles.bas}>{bas}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------- Textes ---------- */

export const Titre = ({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) => (
  <Text style={[styles.titre, style]}>{children}</Text>
);
export const SousTitre = ({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) => (
  <Text style={[styles.sousTitre, style]}>{children}</Text>
);
export const Texte = ({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) => (
  <Text style={[styles.texte, style]}>{children}</Text>
);

/* ---------- Bouton ---------- */

type VarianteBouton = 'principal' | 'secondaire' | 'texte' | 'noir' | 'blanc' | 'victoire';

export function Bouton({
  titre,
  onPress,
  variante = 'principal',
  desactive = false,
  chargement = false,
  icone,
  style,
}: {
  titre: string;
  onPress: () => void;
  variante?: VarianteBouton;
  desactive?: boolean;
  chargement?: boolean;
  icone?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  // Bouton désactivé : gris (il redevient orange dès qu'on peut l'utiliser)
  const plein = variante === 'principal' || variante === 'victoire' || variante === 'noir';
  const v = desactive && plein ? { fond: couleurs.desactive, texte: couleurs.texteDesactive, bord: couleurs.desactive } : VARIANTES[variante];
  // Bord du bas plus foncé : le bouton a un petit relief, qui s'enfonce quand on appuie
  const basRelief = desactive || variante === 'texte' ? undefined : v.relief;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: desactive }}
      disabled={desactive || chargement}
      onPress={onPress}
      style={({ pressed }) => [
        styles.bouton,
        { backgroundColor: v.fond, borderColor: v.bord ?? v.fond },
        basRelief && { borderBottomWidth: 4, borderBottomColor: basRelief },
        variante === 'texte' && { paddingVertical: espace.s },
        (desactive || chargement) && !(desactive && plein) && { opacity: 0.45 },
        pressed && { transform: [{ translateY: 2 }], borderBottomWidth: basRelief ? 2 : undefined, opacity: 0.95 },
        style,
      ]}>
      {chargement ? (
        <ActivityIndicator color={v.texte} />
      ) : (
        <View style={styles.boutonLigne}>
          {icone}
          <Text style={[styles.boutonTexte, { color: v.texte }]}>{titre}</Text>
        </View>
      )}
    </Pressable>
  );
}

const VARIANTES: Record<VarianteBouton, { fond: string; texte: string; bord?: string; relief?: string }> = {
  principal: { fond: couleurs.renardFonce, texte: couleurs.blanc, relief: couleurs.renardRelief },
  secondaire: { fond: couleurs.pecheClair, texte: couleurs.renardFonce, bord: '#F6CDB8', relief: '#F0B89C' },
  texte: { fond: 'transparent', texte: couleurs.renardFonce },
  noir: { fond: couleurs.noir, texte: couleurs.blanc, relief: '#000000' },
  blanc: { fond: couleurs.carte, texte: couleurs.brun, bord: couleurs.ligne, relief: couleurs.relief },
  victoire: { fond: couleurs.corail, texte: couleurs.blanc, relief: '#C93542' },
};

/* ---------- Champ de saisie ---------- */

export function Champ(props: TextInputProps & { label?: string }) {
  const { label, style, ...reste } = props;
  return (
    <View style={{ gap: espace.s }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput placeholderTextColor={couleurs.brunDoux} style={[styles.champ, style]} {...reste} />
    </View>
  );
}

/* ---------- Carte à choisir ---------- */

export function CarteChoix({
  choisi,
  onPress,
  children,
  style,
  libelle,
}: {
  choisi: boolean;
  onPress: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  libelle: string;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: choisi }}
      accessibilityLabel={libelle}
      onPress={onPress}
      style={({ pressed }) => [
        styles.carteChoix,
        choisi && styles.carteChoisie,
        pressed && { transform: [{ scale: 0.98 }] },
        style,
      ]}>
      {children}
    </Pressable>
  );
}

/* ---------- Pastille (choix multiple) ---------- */

export function Pastille({ libelle, choisi, onPress }: { libelle: string; choisi: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: choisi }}
      onPress={onPress}
      style={[styles.pastille, choisi && styles.pastilleChoisie]}>
      <Text style={[styles.pastilleTexte, choisi && { color: couleurs.blanc }]}>{libelle}</Text>
    </Pressable>
  );
}

/* ---------- Progression de l'onboarding ---------- */

/** Barre de progression de l'onboarding, avec « 1/8 » à droite. */
export function Progression({ etape, total }: { etape: number; total: number }) {
  return (
    <View style={styles.progression} accessibilityLabel={`Étape ${etape} sur ${total}`}>
      <View style={styles.piste}>
        <View style={[styles.rempli, { width: `${(etape / total) * 100}%` }]} />
      </View>
      <Text style={styles.compteEtapes}>
        {etape}/{total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenu: { paddingHorizontal: espace.xl, paddingTop: espace.l, paddingBottom: espace.xl, gap: espace.l },
  bas: { paddingHorizontal: espace.xl, paddingBottom: espace.l, paddingTop: espace.s, gap: espace.s },
  titre: {
    fontFamily: polices.titre,
    fontSize: tailles.titre,
    fontWeight: '800',
    color: couleurs.brun,
    lineHeight: 32,
  },
  sousTitre: { fontFamily: polices.titre, fontSize: tailles.moyen, fontWeight: '700', color: couleurs.brun },
  texte: { fontFamily: polices.texte, fontSize: tailles.texte, color: couleurs.brunDoux, lineHeight: 22 },
  bouton: {
    borderRadius: arrondis.rond,
    paddingVertical: 13,
    paddingHorizontal: espace.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  boutonLigne: { flexDirection: 'row', alignItems: 'center', gap: espace.s },
  boutonTexte: { fontFamily: polices.titre, fontSize: tailles.texte, fontWeight: '700' },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: couleurs.brunDoux,
  },
  champ: {
    backgroundColor: couleurs.carte,
    borderWidth: 2,
    borderColor: couleurs.ligne,
    borderRadius: arrondis.m,
    paddingHorizontal: espace.l,
    paddingVertical: 14,
    fontFamily: polices.texte,
    fontSize: tailles.texte,
    fontWeight: '600',
    color: couleurs.brun,
  },
  carteChoix: {
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.l,
    padding: espace.m,
    ...relief,
    borderWidth: 2,
  },
  carteChoisie: { borderColor: couleurs.renardFonce, borderBottomColor: couleurs.renardRelief, backgroundColor: couleurs.pecheClair },
  pastille: {
    borderRadius: arrondis.rond,
    ...relief,
    borderBottomWidth: 3,
    backgroundColor: couleurs.carte,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pastilleChoisie: { backgroundColor: couleurs.brun, borderColor: couleurs.brun, borderBottomColor: '#3E2419' },
  pastilleTexte: { fontFamily: polices.texte, fontSize: 14, fontWeight: '700', color: couleurs.brun },
  progression: { flex: 1, flexDirection: 'row', gap: espace.m, alignItems: 'center' },
  piste: { flex: 1, height: 8, borderRadius: 4, backgroundColor: couleurs.ligne, overflow: 'hidden' },
  rempli: { height: 8, borderRadius: 4, backgroundColor: couleurs.renardFonce },
  compteEtapes: { fontFamily: polices.texte, fontSize: 13, fontWeight: '800', color: couleurs.brunDoux, fontVariant: ['tabular-nums'] },
});
