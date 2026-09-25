/** ONBOARDING 5/7 — Le prénom du compagnon (prérempli avec son nom proposé), puis la rencontre. */
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Bouton, Champ, Ecran, Texte, Titre } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { EnteteEtape } from '@/components/EnteteEtape';
import { compagnonParId } from '@/config/compagnons';
import { couleurs, espace, polices } from '@/config/theme';
import { useApp } from '@/store/etat';

const capitaliser = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

export default function NomCompagnon() {
  const { etat, dispatch } = useApp();
  const espece = etat.compagnon?.espece ?? 'renard';
  const infos = compagnonParId(espece);
  const [nom, setNom] = useState(etat.compagnon?.nom ?? infos.nomParDefaut);
  const nomPropre = nom.trim();

  function continuer() {
    dispatch({ type: 'NOMMER_COMPAGNON', nom: nomPropre });
    router.push('/rencontre');
  }

  return (
    <Ecran defilant bas={<Bouton titre="Continuer" desactive={!nomPropre} onPress={continuer} />}>
      <EnteteEtape etape={5} retour={false} />
      <View style={styles.haut}>
        <Compagnon espece={espece} pose="salut" taille={170} />
        <Text style={styles.nom} accessibilityLiveRegion="polite">
          {nomPropre || '…'}
        </Text>
        <Text style={styles.espece}>
          {capitaliser(infos.espece.replace(/^(le|la) /, ''))} · {infos.personnalite.toLowerCase()}
        </Text>
      </View>
      <Titre>Comment veux-tu l’appeler ?</Titre>
      <Champ
        value={nom}
        onChangeText={setNom}
        placeholder="Saisis son prénom"
        autoCapitalize="words"
        maxLength={16}
        returnKeyType="next"
        onSubmitEditing={() => nomPropre && continuer()}
        accessibilityLabel="Prénom de ton compagnon"
      />
      <Texte>Tu pourras le changer plus tard dans les réglages.</Texte>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  haut: { alignItems: 'center', gap: 2 },
  nom: {
    fontFamily: polices.titre,
    fontSize: 34,
    fontWeight: '800',
    color: couleurs.renardFonce,
    marginTop: espace.s,
  },
  espece: { color: couleurs.brunDoux, fontWeight: '700' },
});
