/**
 * 🎉 FÉLICITATIONS — une candidature vient de passer à « Décroché ».
 * On comprend tout de suite ce qui s'est passé : message clair, entreprise et poste
 * s'ils sont connus, et la flèche de retour habituelle en haut.
 * Le « nouveau chapitre » (Mon aventure professionnelle, +50 pièces, le compagnon
 * décroche aussi un poste) est proposé, jamais imposé.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Bouton, Ecran, Texte, Titre } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { Confettis } from '@/components/Confettis';
import { arrondis, couleurs, espace } from '@/config/theme';
import { useApp } from '@/store/etat';

export default function Felicitations() {
  const params = useLocalSearchParams<{ candidatureId?: string; entreprise?: string; poste?: string }>();
  const { etat } = useApp();
  // La candidature concernée : par son identifiant, sinon la dernière décrochée chez cette entreprise
  const candidature =
    etat.candidatures.find((c) => c.id === params.candidatureId) ??
    etat.candidatures.find((c) => c.statut === 'decroche' && c.entreprise === params.entreprise);
  const entreprise = candidature?.entreprise ?? params.entreprise;
  const poste = candidature?.poste ?? params.poste;
  const nom = etat.compagnon?.nom ?? 'Ton compagnon';

  return (
    <Ecran
      avecEntete
      fond={couleurs.corailClair}
      style={styles.contenu}
      bas={
        <View style={{ gap: espace.s }}>
          {etat.contexte === 'recherche' && (
            <Bouton
              titre="Commencer mon nouveau chapitre"
              variante="victoire"
              onPress={() => router.replace({ pathname: '/decroche', params: { candidatureId: candidature?.id ?? '', directement: '1' } })}
            />
          )}
          <Bouton titre="Revenir à ma candidature" variante="secondaire" onPress={() => router.back()} />
        </View>
      }>
      <Confettis />
      <Compagnon espece={etat.compagnon?.espece ?? 'renard'} pose="celebration" taille={190} reaction={1} />
      <Titre style={{ textAlign: 'center' }}>🎉 Félicitations !</Titre>
      <Text style={styles.message}>Tu as décroché ce poste !</Text>
      {(entreprise || poste) && (
        <View style={styles.carte}>
          {entreprise ? <Text style={styles.entreprise}>{entreprise}</Text> : null}
          {poste ? <Text style={styles.poste}>{poste}</Text> : null}
        </View>
      )}
      <Texte style={{ textAlign: 'center' }}>
        {nom} est fier de toi. {etat.contexte === 'recherche' ? 'Quand tu es prêt, un nouveau chapitre peut commencer.' : ''}
      </Texte>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  contenu: { alignItems: 'center', justifyContent: 'center', gap: espace.m },
  message: { fontSize: 20, fontWeight: '800', color: '#C92F3D', textAlign: 'center' },
  carte: { backgroundColor: couleurs.carte, borderRadius: arrondis.l, paddingVertical: espace.m, paddingHorizontal: espace.xl, alignItems: 'center', gap: 2 },
  entreprise: { fontSize: 18, fontWeight: '800', color: couleurs.brun },
  poste: { fontSize: 15, fontWeight: '700', color: couleurs.brunDoux },
});
