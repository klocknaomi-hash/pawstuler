/** Listes de réglages : un groupe titré, et des lignes (avec flèche, interrupteur ou valeur). */
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { arrondis, couleurs, espace } from '@/config/theme';

export function Groupe({ titre, children }: { titre?: string; children: ReactNode }) {
  return (
    <View style={{ gap: espace.s }}>
      {titre ? <Text style={styles.titre}>{titre}</Text> : null}
      <View style={styles.groupe}>{children}</View>
    </View>
  );
}

export function Ligne({
  icone,
  libelle,
  valeur,
  onPress,
  danger,
  premiere,
}: {
  icone?: keyof typeof Ionicons.glyphMap;
  libelle: string;
  valeur?: string;
  onPress?: () => void;
  danger?: boolean;
  premiere?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.ligne, !premiere && styles.separateur, pressed && { backgroundColor: couleurs.creme }]}>
      {icone && <Ionicons name={icone} size={20} color={danger ? couleurs.danger : couleurs.renardFonce} />}
      <Text style={[styles.libelle, danger && { color: couleurs.danger }]}>{libelle}</Text>
      {valeur ? (
        <Text style={styles.valeur} numberOfLines={1}>
          {valeur}
        </Text>
      ) : null}
      {onPress && !danger && <Ionicons name="chevron-forward" size={18} color={couleurs.brunDoux} />}
    </Pressable>
  );
}

export function LigneInterrupteur({
  libelle,
  detail,
  valeur,
  onChange,
  premiere,
}: {
  libelle: string;
  detail?: string;
  valeur: boolean;
  onChange: (v: boolean) => void;
  premiere?: boolean;
}) {
  return (
    <View style={[styles.ligne, !premiere && styles.separateur]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.libelle}>{libelle}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
      <Switch
        value={valeur}
        onValueChange={onChange}
        trackColor={{ true: couleurs.saugeFonce, false: '#E6D8CB' }}
        accessibilityLabel={libelle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  titre: {
    fontSize: 12.5,
    fontWeight: '800',
    color: couleurs.brunDoux,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: 4,
  },
  groupe: {
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.m,
    borderWidth: 1,
    borderColor: couleurs.ligne,
    overflow: 'hidden',
  },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: espace.m, paddingHorizontal: espace.l, paddingVertical: 14 },
  separateur: { borderTopWidth: 1, borderTopColor: couleurs.ligne },
  libelle: { flex: 1, fontSize: 15.5, fontWeight: '700', color: couleurs.brun },
  valeur: { fontSize: 14, fontWeight: '600', color: couleurs.brunDoux, maxWidth: '45%' },
  detail: { fontSize: 12.5, fontWeight: '600', color: couleurs.brunDoux, marginTop: 2 },
});
