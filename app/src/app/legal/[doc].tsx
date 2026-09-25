/**
 * TEXTES LÉGAUX — politique de confidentialité ou conditions d'utilisation.
 * Ouvert depuis Compte › Mes données et RGPD et depuis l'écran d'abonnement.
 */
import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Ecran, SousTitre } from '@/components/base';
import { DOCUMENTS_LEGAUX, type IdDocumentLegal } from '@/config/legal';
import { couleurs, espace } from '@/config/theme';

export default function DocumentLegal() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const document = DOCUMENTS_LEGAUX[(doc as IdDocumentLegal) in DOCUMENTS_LEGAUX ? (doc as IdDocumentLegal) : 'confidentialite'];

  return (
    <Ecran defilant avecEntete>
      <Stack.Screen options={{ title: document.titre }} />
      <Text style={styles.intro}>{document.intro}</Text>
      {document.sections.map((s) => (
        <View key={s.titre} style={styles.section}>
          <SousTitre>{s.titre}</SousTitre>
          {s.paragraphes.map((p) => (
            <Text key={p} style={styles.texte}>
              {p}
            </Text>
          ))}
        </View>
      ))}
    </Ecran>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, color: couleurs.brunDoux, fontWeight: '600', lineHeight: 20 },
  section: { gap: espace.s },
  texte: { fontSize: 14.5, color: couleurs.brun, fontWeight: '500', lineHeight: 21 },
});
