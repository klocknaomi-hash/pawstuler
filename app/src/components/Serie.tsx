/** Le badge de série 🐾 : nombre de jours consécutifs, affiché à côté du compteur de pièces. */
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { couleurs, polices } from '@/config/theme';
import type { Serie } from '@/store/types';

export function BadgeSerie({ serie, grand = false }: { serie: Serie; grand?: boolean }) {
  const atteint = serie.actuelle >= serie.objectif;
  const jours = `${serie.actuelle} jour${serie.actuelle > 1 ? 's' : ''}`;
  return (
    <View
      style={[styles.badge, atteint && styles.atteint, grand && styles.grand]}
      accessibilityLabel={`Série de ${jours} consécutifs, objectif ${serie.objectif} jours`}>
      <Ionicons name="paw" size={grand ? 20 : 15} color={couleurs.renardFonce} />
      <Text style={[styles.nombre, grand && { fontSize: 18 }]}>{grand ? jours : serie.actuelle}</Text>
      {!grand && <Text style={styles.unite}>j</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: couleurs.carte,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: couleurs.ligne,
  },
  atteint: { backgroundColor: couleurs.pecheClair, borderColor: couleurs.saumon },
  grand: { paddingHorizontal: 14, paddingVertical: 8, gap: 6 },
  nombre: { fontFamily: polices.texte, fontWeight: '800', fontSize: 15, color: couleurs.brun, fontVariant: ['tabular-nums'] },
  unite: { fontWeight: '700', fontSize: 12.5, color: couleurs.brunDoux },
});
