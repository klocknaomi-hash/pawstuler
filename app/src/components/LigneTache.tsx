/**
 * Une tâche du jour : cocher / décocher d'un toucher, supprimer d'un appui long.
 * Tâche mesurable (candidatures, relances) : pas de case à cocher à la main, sa progression
 * (3/5) suit tes vraies données et elle se coche toute seule.
 */
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
  const mesure = tache.mesure;
  const progres = Math.min(tache.progres ?? 0, mesure?.objectif ?? 0);
  return (
    <Pressable
      onPress={onBasculer}
      onLongPress={onSupprimer}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: tache.faite }}
      accessibilityLabel={`${tache.titre}, ${tache.pieces} pièces${mesure ? `, ${progres} sur ${mesure.objectif}` : ''}`}
      accessibilityHint="Appui long pour supprimer"
      style={({ pressed }) => [styles.ligne, tache.faite && styles.faite, pressed && { opacity: 0.85 }]}>
      <View style={[styles.coche, tache.faite && styles.cocheFaite]}>
        {tache.faite && <Ionicons name="checkmark" size={18} color={couleurs.blanc} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.titre, tache.faite && styles.titreFait]}>{tache.titre}</Text>
        {tache.perso && <Text style={styles.sous}>Ta tâche</Text>}
        {mesure && (
          <View style={styles.mesure}>
            <View style={styles.barre}>
              <View style={[styles.rempli, { width: `${(progres / mesure.objectif) * 100}%` }]} />
            </View>
            <Text style={styles.progres}>
              {progres}/{mesure.objectif}
            </Text>
          </View>
        )}
        {mesure && !tache.faite && <Text style={styles.sous}>Avance toute seule quand tu enregistres tes {mesure.quoi === 'candidatures' ? 'candidatures' : 'relances'}</Text>}
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
  mesure: { flexDirection: 'row', alignItems: 'center', gap: espace.s, marginTop: 6 },
  barre: { flex: 1, height: 6, borderRadius: 3, backgroundColor: couleurs.ligne, overflow: 'hidden' },
  rempli: { height: 6, borderRadius: 3, backgroundColor: couleurs.saugeFonce },
  progres: { fontSize: 12.5, fontWeight: '800', color: couleurs.saugeFonce, fontVariant: ['tabular-nums'] },
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
