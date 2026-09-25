/** ONBOARDING 6/7 — La ville où le compagnon va vivre (2 à la campagne, 2 en ville). */
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { imageVille } from '@/illustrations/registre';
import { Bouton, CarteChoix, Ecran, SousTitre, Texte, Titre } from '@/components/base';
import { EnteteEtape } from '@/components/EnteteEtape';
import { arrondis, couleurs, espace, polices } from '@/config/theme';
import { VILLES, type Ambiance, type VilleId } from '@/config/villes';
import { useApp } from '@/store/etat';

const SECTIONS: { ambiance: Ambiance; titre: string }[] = [
  { ambiance: 'campagne', titre: 'À la campagne' },
  { ambiance: 'urbaine', titre: 'En ville' },
];

export default function VilleDepart() {
  const { etat, dispatch } = useApp();
  const [choix, setChoix] = useState<VilleId | null>(etat.villeId ?? null);
  const nom = etat.compagnon?.nom ?? 'Ton compagnon';

  function continuer() {
    if (!choix) return;
    dispatch({ type: 'CHOISIR_VILLE', villeId: choix });
    router.push('/rythme');
  }

  return (
    <Ecran defilant bas={<Bouton titre="Continuer" desactive={!choix} onPress={continuer} />}>
      <EnteteEtape etape={6} />
      <Titre>Où veux-tu commencer ton aventure ?</Titre>
      <Texte>{nom} y vivra, visitera ses lieux et y cherchera son propre job.</Texte>

      {SECTIONS.map((s) => (
        <View key={s.ambiance} style={{ gap: espace.m }}>
          <SousTitre>{s.titre}</SousTitre>
          <View style={styles.rangee}>
            {VILLES.filter((v) => v.ambiance === s.ambiance).map((v) => {
              const image = imageVille(v.id, 'paysage');
              return (
                <CarteChoix
                  key={v.id}
                  choisi={choix === v.id}
                  onPress={() => setChoix(v.id)}
                  libelle={`${v.nom}. ${v.accroche}`}
                  style={styles.carte}>
                  <View style={[styles.vignette, { backgroundColor: v.couleur }]}>
                    {image ? (
                      <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" />
                    ) : (
                      <View style={styles.bientot}>
                        <Text style={{ fontSize: 30 }}>{v.ambiance === 'campagne' ? '🏡' : '🏙️'}</Text>
                        <Text style={styles.bientotTexte}>Illustration à venir</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.nom}>{v.nom}</Text>
                  <Text style={styles.accroche}>{v.accroche}</Text>
                </CarteChoix>
              );
            })}
          </View>
        </View>
      ))}
    </Ecran>
  );
}

const styles = StyleSheet.create({
  rangee: { flexDirection: 'row', gap: espace.m },
  carte: { flex: 1, padding: espace.s, gap: 4 },
  vignette: { height: 96, borderRadius: arrondis.m, overflow: 'hidden', marginBottom: 4 },
  bientot: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  bientotTexte: { fontSize: 11, fontWeight: '700', color: couleurs.brun, opacity: 0.7 },
  nom: { fontFamily: polices.titre, fontSize: 16, fontWeight: '700', color: couleurs.brun, paddingHorizontal: 4 },
  accroche: { fontSize: 12.5, color: couleurs.brunDoux, lineHeight: 17, paddingHorizontal: 4, paddingBottom: 4 },
});
