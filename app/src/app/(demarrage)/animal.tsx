/** ONBOARDING 3/7 — Le choix du compagnon parmi les animaux de src/config/compagnons.ts. */
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Bouton, CarteChoix, Ecran, Texte, Titre } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { EnteteEtape } from '@/components/EnteteEtape';
import { COMPAGNONS, type EspeceId } from '@/config/compagnons';
import { couleurs, espace, polices } from '@/config/theme';
import { useApp } from '@/store/etat';

export default function ChoixAnimal() {
  const { etat, dispatch } = useApp();
  const [choix, setChoix] = useState<EspeceId | null>(etat.compagnon?.espece ?? null);

  function continuer() {
    const c = COMPAGNONS.find((x) => x.id === choix);
    if (!c) return;
    dispatch({ type: 'CHOISIR_ESPECE', espece: c.id, nomParDefaut: c.nomParDefaut });
    router.push('/oeuf');
  }

  return (
    <Ecran defilant bas={<Bouton titre="Découvrir mon œuf" desactive={!choix} onPress={continuer} />}>
      <EnteteEtape etape={3} />
      <Titre>Choisis ton compagnon</Titre>
      <Texte>Il grandira avec toi et cherchera, lui aussi, sa place dans sa ville.</Texte>

      <View style={styles.grille}>
        {COMPAGNONS.map((c) => {
          const choisi = choix === c.id;
          return (
            <CarteChoix
              key={c.id}
              choisi={choisi}
              onPress={() => setChoix(c.id)}
              libelle={`${c.espece}, ${c.personnalite}`}
              style={styles.carte}>
              <View style={styles.illustration}>
                <Compagnon espece={c.id} pose={choisi ? 'content' : 'neutre'} taille={110} vivant={choisi} reaction={choisi ? 1 : 0} />
              </View>
              <Text style={styles.espece}>{c.espece.replace(/^(le|la) /, '')}</Text>
              <Text style={styles.trait}>{c.personnalite}</Text>
            </CarteChoix>
          );
        })}
      </View>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: espace.m, justifyContent: 'space-between' },
  carte: { width: '47.5%', alignItems: 'center', gap: 4, paddingVertical: espace.l },
  illustration: { height: 120, justifyContent: 'flex-end', alignItems: 'center' },
  espece: {
    fontFamily: polices.titre,
    fontSize: 18,
    fontWeight: '700',
    color: couleurs.brun,
    textTransform: 'capitalize',
  },
  trait: { fontSize: 13, color: couleurs.brunDoux, textAlign: 'center', fontWeight: '600' },
});
