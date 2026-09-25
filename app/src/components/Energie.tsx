/**
 * La jauge d'énergie ⚡ du compagnon (différente des pièces) : « 15/30 » et, si elle
 * n'est pas pleine, le temps restant avant la recharge complète.
 */
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { couleurs, polices } from '@/config/theme';
import { dureeLisible } from '@/logique/energie';

export function JaugeEnergie({
  energie,
  max,
  recharge,
  compacte = false,
}: {
  energie: number;
  max: number;
  /** Temps restant avant la recharge complète (ms), ou null si pleine. */
  recharge?: number | null;
  compacte?: boolean;
}) {
  const ratio = Math.max(0, Math.min(1, energie / max));
  const texteRecharge = recharge != null ? `Recharge dans ${dureeLisible(recharge)}` : null;
  return (
    <View
      style={[styles.jauge, compacte && styles.compacte]}
      accessibilityRole="progressbar"
      accessibilityLabel={`Énergie ${energie} sur ${max}${texteRecharge ? `. ${texteRecharge}` : ''}`}
      accessibilityValue={{ min: 0, max, now: energie }}>
      <View style={styles.ligne}>
        <Ionicons name="flash" size={compacte ? 14 : 16} color="#E0A100" />
        <View style={styles.piste}>
          <View style={[styles.remplissage, { width: `${ratio * 100}%` }]} />
        </View>
        <Text style={styles.valeur}>
          {energie}/{max}
        </Text>
      </View>
      {texteRecharge ? <Text style={styles.recharge}>{texteRecharge}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  jauge: { backgroundColor: couleurs.carte, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8, gap: 2 },
  compacte: { paddingVertical: 5, paddingHorizontal: 10 },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  piste: { flex: 1, height: 10, borderRadius: 999, backgroundColor: '#FFF1CF', overflow: 'hidden' },
  remplissage: { height: '100%', borderRadius: 999, backgroundColor: '#F4C23F' },
  valeur: { fontFamily: polices.texte, fontWeight: '800', fontSize: 13, color: couleurs.brun, fontVariant: ['tabular-nums'] },
  recharge: { fontSize: 11.5, fontWeight: '700', color: couleurs.brunDoux, textAlign: 'right' },
});
