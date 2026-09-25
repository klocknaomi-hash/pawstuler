/** La jauge d'énergie ⚡ du compagnon (différente des pièces). */
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { ENERGIE_MAX } from '@/config/energie';
import { couleurs, polices } from '@/config/theme';

export function JaugeEnergie({ energie, compacte = false }: { energie: number; compacte?: boolean }) {
  const ratio = Math.max(0, Math.min(1, energie / ENERGIE_MAX));
  return (
    <View
      style={[styles.jauge, compacte && styles.compacte]}
      accessibilityRole="progressbar"
      accessibilityLabel={`Énergie ${energie} sur ${ENERGIE_MAX}`}
      accessibilityValue={{ min: 0, max: ENERGIE_MAX, now: energie }}>
      <Ionicons name="flash" size={compacte ? 14 : 16} color="#E0A100" />
      <View style={styles.piste}>
        <View style={[styles.remplissage, { width: `${ratio * 100}%` }]} />
      </View>
      <Text style={styles.valeur}>
        {energie}/{ENERGIE_MAX}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  jauge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: couleurs.carte,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  compacte: { paddingVertical: 5, paddingHorizontal: 10 },
  piste: { flex: 1, height: 10, borderRadius: 999, backgroundColor: '#FFF1CF', overflow: 'hidden' },
  remplissage: { height: '100%', borderRadius: 999, backgroundColor: '#F4C23F' },
  valeur: { fontFamily: polices.texte, fontWeight: '800', fontSize: 13, color: couleurs.brun, fontVariant: ['tabular-nums'] },
});
