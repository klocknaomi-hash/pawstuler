/**
 * ONBOARDING 6/8 — Le rythme du compagnon 🌞 🌙
 * Juste après la rencontre, le compagnon demande à quelle heure il se réveille et à quelle heure
 * il va dormir. Ces horaires sont vraiment utilisés : avant son réveil et après son coucher,
 * il dort dans sa maison et ne part pas à l'aventure. Modifiables ensuite dans Compte › Paramètres.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Bouton, Ecran, Pastille, Titre } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { EnteteEtape } from '@/components/EnteteEtape';
import { accorder } from '@/config/compagnons';
import { arrondis, couleurs, espace, ombre } from '@/config/theme';
import { HEURES_COUCHER, HEURES_REVEIL, heureLisible } from '@/logique/rythme';
import { useApp } from '@/store/etat';

export default function Rythme() {
  const { etat, dispatch } = useApp();
  const [reveil, setReveil] = useState<number | null>(null);
  const [coucher, setCoucher] = useState<number | null>(null);
  const nom = etat.compagnon?.nom ?? 'Ton compagnon';
  const accord = (texte: string) => accorder(texte, etat.compagnon?.pronoms);
  const pret = reveil !== null && coucher !== null;

  // Ce que dit le compagnon, selon où on en est
  const bulle = pret
    ? 'Parfait ! Je vais essayer de tenir ce rythme. Promis, je ne ferai pas de bruit quand tu dormiras. 😴'
    : reveil !== null
      ? 'Et à quelle heure je vais faire dodo ? 🌙'
      : 'Bon… maintenant que tu me connais un peu, il faut qu’on règle mon petit rythme de vie ! À quelle heure je me réveille ? 🌞';

  function continuer() {
    if (reveil === null || coucher === null) return;
    dispatch({ type: 'DEFINIR_RYTHME', reveil, coucher });
    router.push('/ville-depart');
  }

  return (
    <Ecran defilant bas={<Bouton titre="Continuer" onPress={continuer} desactive={!pret} />}>
      <EnteteEtape etape={6} />
      <View style={styles.haut}>
        <View style={styles.bulle}>
          <Text style={styles.bulleTexte}>{bulle}</Text>
        </View>
        {etat.compagnon && <Compagnon espece={etat.compagnon.espece} pose={pret ? 'content' : 'neutre'} taille={120} reaction={pret ? 1 : 0} />}
      </View>

      <View style={{ gap: espace.s }}>
        <Titre>Et {nom}, {accord('{il}')} se réveille à quelle heure ? 🌞</Titre>
        <View style={styles.pastilles}>
          {HEURES_REVEIL.map((h) => (
            <Pastille key={h} libelle={heureLisible(h)} choisi={reveil === h} onPress={() => setReveil(h)} />
          ))}
        </View>
      </View>

      <View style={{ gap: espace.s, opacity: reveil === null ? 0.45 : 1 }}>
        <Titre>Et à quelle heure est-ce qu’{accord('{il}')} va dormir ? 🌙</Titre>
        <View style={styles.pastilles}>
          {HEURES_COUCHER.map((h) => (
            <Pastille key={h} libelle={heureLisible(h)} choisi={coucher === h} onPress={() => reveil !== null && setCoucher(h)} />
          ))}
        </View>
      </View>

      <Text style={styles.aide}>
        Avant son réveil et après son coucher, {nom} dort dans sa maison : pas d’aventure la nuit. Tu pourras changer ces horaires dans Compte › Paramètres.
      </Text>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  haut: { alignItems: 'center', gap: espace.s },
  bulle: { backgroundColor: couleurs.carte, borderRadius: arrondis.l, paddingHorizontal: espace.l, paddingVertical: espace.m, ...ombre },
  bulleTexte: { fontSize: 15.5, fontWeight: '700', color: couleurs.brun, lineHeight: 21, textAlign: 'center' },
  pastilles: { flexDirection: 'row', flexWrap: 'wrap', gap: espace.s },
  aide: { fontSize: 13, color: couleurs.brunDoux, fontWeight: '600', lineHeight: 18 },
});
