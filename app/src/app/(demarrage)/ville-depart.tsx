/**
 * ONBOARDING 6/7 — La ville où le compagnon va vivre.
 * Une ville devient choisissable dès que son illustration existe dans le registre.
 * Ensuite : l'objectif de série (dernière étape).
 */
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Bouton, CarteChoix, Ecran, SousTitre, Texte, Titre } from '@/components/base';
import { EnteteEtape } from '@/components/EnteteEtape';
import { arrondis, couleurs, espace, polices } from '@/config/theme';
import { VILLES, type Ambiance, type VilleId } from '@/config/villes';
import { imageVille } from '@/illustrations/registre';
import { useApp } from '@/store/etat';

const SECTIONS: { ambiance: Ambiance; titre: string }[] = [
  { ambiance: 'campagne', titre: 'Campagne et petite ville' },
  { ambiance: 'urbaine', titre: 'Grande ville' },
];

export default function VilleDepart() {
  const { etat, dispatch } = useApp();
  const [choix, setChoix] = useState<VilleId>(etat.villeId ?? 'clairebourg');
  const nom = etat.compagnon?.nom ?? 'Ton compagnon';

  function continuer() {
    dispatch({ type: 'CHOISIR_VILLE', villeId: choix });
    router.push('/serie');
  }

  return (
    <Ecran defilant bas={<Bouton titre="Continuer" onPress={continuer} />}>
      <EnteteEtape etape={6} />
      <Titre>Où veux-tu commencer ton aventure ?</Titre>
      <Texte>{nom} y vivra, visitera ses lieux et y cherchera son propre job, en même temps que toi.</Texte>

      {SECTIONS.map((s) => (
        <View key={s.ambiance} style={{ gap: espace.m }}>
          <SousTitre>{s.titre}</SousTitre>
          <View style={styles.rangee}>
            {VILLES.filter((v) => v.ambiance === s.ambiance).map((v) => {
              const image = imageVille(v.id, 'paysage');
              const disponible = !!image;
              return (
                <CarteChoix
                  key={v.id}
                  choisi={choix === v.id}
                  onPress={() => disponible && setChoix(v.id)}
                  libelle={disponible ? `${v.nom}. ${v.accroche}` : 'Ville bientôt disponible'}
                  style={[styles.carte, !disponible && styles.indisponible]}>
                  <View style={[styles.vignette, { backgroundColor: v.couleur }]}>
                    {image ? (
                      <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" />
                    ) : (
                      <View style={styles.bientot}>
                        <Text style={{ fontSize: 28 }}>{v.ambiance === 'campagne' ? '🏡' : '🏙️'}</Text>
                      </View>
                    )}
                  </View>
                  {disponible ? (
                    <>
                      <Text style={styles.nom}>{v.nom}</Text>
                      <Text style={styles.accroche}>{v.accroche}</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.nom}>Bientôt</Text>
                      <Text style={styles.accroche}>Une nouvelle ville arrive prochainement.</Text>
                    </>
                  )}
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
  indisponible: { opacity: 0.55, shadowOpacity: 0 },
  vignette: { height: 96, borderRadius: arrondis.m, overflow: 'hidden', marginBottom: 4 },
  bientot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  nom: { fontFamily: polices.titre, fontSize: 16, fontWeight: '700', color: couleurs.brun, paddingHorizontal: 4 },
  accroche: { fontSize: 12.5, color: couleurs.brunDoux, lineHeight: 17, paddingHorizontal: 4, paddingBottom: 4 },
});
