/**
 * ONBOARDING 7/7 — Le rythme du compagnon
 * L'utilisateur choisit quand son compagnon se réveille et s'endort.
 * Il vit sa vie à ce rythme, que l'utilisateur soit dans l'app ou non.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Bouton, Ecran, Pastille, SousTitre, Texte, Titre } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { EnteteEtape } from '@/components/EnteteEtape';
import { espace } from '@/config/theme';
import { HEURES_COUCHER, HEURES_REVEIL, heureLisible } from '@/logique/rythme';
import { useApp } from '@/store/etat';

export default function Rythme() {
  const { etat, dispatch } = useApp();
  const [reveil, setReveil] = useState(etat.rythme.reveil);
  const [coucher, setCoucher] = useState(etat.rythme.coucher);
  const nom = etat.compagnon?.nom ?? 'Ton compagnon';

  function terminer() {
    dispatch({ type: 'DEFINIR_RYTHME', reveil, coucher });
    dispatch({ type: 'TERMINER_ONBOARDING' });
    router.replace('/accueil');
  }

  return (
    <Ecran defilant bas={<Bouton titre="C’est parti !" onPress={terminer} />}>
      <EnteteEtape etape={7} />
      <View style={styles.haut}>
        <Compagnon espece={etat.compagnon?.espece ?? 'renard'} pose="dort" taille={150} />
      </View>
      <Titre>{nom} a aussi besoin de dormir</Titre>
      <Texte>
        Pendant son sommeil, tu peux toujours avancer : tes progrès l’attendront au réveil.
      </Texte>

      <View style={styles.bloc}>
        <SousTitre>Réveil</SousTitre>
        <View style={styles.pastilles}>
          {HEURES_REVEIL.map((h) => (
            <Pastille key={h} libelle={heureLisible(h)} choisi={reveil === h} onPress={() => setReveil(h)} />
          ))}
        </View>
      </View>
      <View style={styles.bloc}>
        <SousTitre>Coucher</SousTitre>
        <View style={styles.pastilles}>
          {HEURES_COUCHER.map((h) => (
            <Pastille key={h} libelle={heureLisible(h)} choisi={coucher === h} onPress={() => setCoucher(h)} />
          ))}
        </View>
      </View>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  haut: { alignItems: 'center' },
  bloc: { gap: espace.s },
  pastilles: { flexDirection: 'row', flexWrap: 'wrap', gap: espace.s },
});
