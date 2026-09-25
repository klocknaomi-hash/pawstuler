/** Choix du statut d'une candidature : les 5 étapes, en pastilles colorées. */
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { STATUTS } from '@/config/candidatures';
import { couleurs, espace } from '@/config/theme';
import type { StatutCandidature } from '@/store/types';

export function ChoixStatut({ valeur, onChange }: { valeur: StatutCandidature; onChange: (s: StatutCandidature) => void }) {
  return (
    <View style={styles.statuts} accessibilityRole="radiogroup">
      {STATUTS.map((s) => {
        const actif = valeur === s.id;
        return (
          <Pressable
            key={s.id}
            onPress={() => onChange(s.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: actif }}
            accessibilityLabel={s.libelle}
            style={[styles.statut, { backgroundColor: actif ? s.fond : couleurs.carte, borderColor: actif ? s.texte : couleurs.ligne }]}>
            <Text style={[styles.texte, { color: actif ? s.texte : couleurs.brun }]}>{s.libelle}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  statuts: { flexDirection: 'row', flexWrap: 'wrap', gap: espace.s },
  statut: { borderRadius: 999, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 9 },
  texte: { fontWeight: '800', fontSize: 14 },
});
