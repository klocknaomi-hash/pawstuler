/** Une tâche du jour : cocher / décocher d'un toucher, supprimer d'un appui long. */
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { arrondis, couleurs, espace, polices } from '@/config/theme';
import type { Tache } from '@/store/types';

import { IconePiece } from './Pieces';

export function LigneTache({
  tache,
  onBasculer,
  onSupprimer,
}: {
  tache: Tache;
  onBasculer: () => void;
  onSupprimer: () => void;
}) {
  return (
    <Pressable
      onPress={onBasculer}
      onLongPress={onSupprimer}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: tache.faite }}
      accessibilityLabel={`${tache.titre}, ${tache.pieces} pièces`}
      accessibilityHint="Appui long pour supprimer"
      style={({ pressed }) => [styles.ligne, tache.faite && styles.faite, pressed && { opacity: 0.85 }]}>
      <View style={[styles.coche, tache.faite && styles.cocheFaite]}>
        {tache.faite && <Ionicons name="checkmark" size={18} color={couleurs.blanc} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.titre, tache.faite && styles.titreFait]}>{tache.titre}</Text>
        {tache.perso && <Text style={styles.sous}>Ta tâche</Text>}
        {tache.candidatureId && <Text style={styles.sous}>Envoyée il y a plus de 7 jours</Text>}
      </View>
      <View style={[styles.gain, tache.faite && { opacity: 0.6 }]}>
        <Text style={styles.gainTexte}>+{tache.pieces}</Text>
        <IconePiece taille={14} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.m,
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.m,
    paddingHorizontal: espace.l,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: couleurs.ligne,
  },
  faite: { backgroundColor: couleurs.saugeClair, borderColor: 'transparent' },
  coche: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: couleurs.ligne,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cocheFaite: { backgroundColor: couleurs.saugeFonce, borderColor: couleurs.saugeFonce },
  titre: { fontFamily: polices.texte, fontSize: 15.5, fontWeight: '700', color: couleurs.brun, lineHeight: 20 },
  titreFait: { color: couleurs.saugeFonce, textDecorationLine: 'line-through' },
  sous: { fontSize: 12, fontWeight: '600', color: couleurs.brunDoux, marginTop: 2 },
  gain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: couleurs.orClair,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  gainTexte: { fontWeight: '800', fontSize: 13, color: '#9A6400', fontVariant: ['tabular-nums'] },
});
