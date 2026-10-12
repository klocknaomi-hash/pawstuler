/**
 * JOURNÉE TERMINÉE 🎉
 * S'ouvre une fois par jour au plus, dès que toutes les tâches du jour sont faites.
 * Le compagnon fait la fête dans sa ville, sous les confettis, avec un petit mot et le bilan du jour
 * (pièces gagnées aujourd'hui, série 🐾). Pas de niveau : on fête l'effort, simplement.
 */
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Bouton } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { Confettis } from '@/components/Confettis';
import { IconePiece } from '@/components/Pieces';
import { accorder } from '@/config/compagnons';
import { MESSAGES_JOURNEE_TERMINEE } from '@/config/dialogues';
import { arrondis, couleurs, espace, ombre, polices } from '@/config/theme';
import { imageVille } from '@/illustrations/registre';
import { jourDe } from '@/logique/dates';
import { useApp } from '@/store/etat';

export default function JourneeTerminee() {
  const { etat, dispatch } = useApp();
  const aujourdhui = jourDe();

  // Marquée comme fêtée dès l'ouverture : l'écran ne reviendra pas avant demain
  useEffect(() => {
    dispatch({ type: 'FETER_JOURNEE', jour: aujourdhui });
  }, [dispatch, aujourdhui]);

  const prenom = etat.utilisateur?.prenom ?? '';
  const compagnon = etat.compagnon;
  // Un message différent selon le jour (toujours le même pour une journée donnée)
  const numeroJour = Number(aujourdhui.replace(/-/g, '')) || 0;
  const message = accorder(MESSAGES_JOURNEE_TERMINEE[numeroJour % MESSAGES_JOURNEE_TERMINEE.length].replace('{nom}', prenom), compagnon?.pronoms);
  const jours = etat.serie.actuelle;

  return (
    <View style={styles.ecran}>
      <Image source={imageVille(etat.villeId ?? 'clairebourg', 'portrait')} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={styles.voile} />
      <Confettis />
      <SafeAreaView style={styles.contenu} edges={['top', 'bottom']}>
        <View style={styles.haut}>
          <Text style={styles.surtitre}>Journée terminée 🎉</Text>
          <Text style={styles.titre}>Bravo {prenom} !</Text>
          <Text style={styles.texte}>Tu as terminé toutes tes tâches du jour.</Text>
        </View>

        {compagnon && <Compagnon espece={compagnon.espece} pose="celebration" taille={200} reaction={1} />}

        <View style={styles.carte}>
          <Text style={styles.nom}>{compagnon?.nom ?? 'Ton compagnon'}</Text>
          <Text style={styles.message}>« {message} »</Text>
          <View style={styles.bilan}>
            <View style={styles.pastille}>
              <Text style={styles.pastilleTexte}>+{etat.piecesDuJour}</Text>
              <IconePiece taille={18} />
              <Text style={styles.pastilleTexte}>aujourd’hui</Text>
            </View>
            <View style={styles.pastille}>
              <Text style={styles.pastilleTexte}>
                🐾 {jours} jour{jours > 1 ? 's' : ''} de série
              </Text>
            </View>
          </View>
          <Bouton titre="Continuer" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.creme },
  // Voile crème en haut pour que le texte se lise sur le décor
  voile: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,246,236,0.35)' },
  contenu: { flex: 1, justifyContent: 'space-between', paddingHorizontal: espace.xl, paddingVertical: espace.l },
  haut: { alignItems: 'center', gap: 4, paddingTop: espace.l },
  surtitre: {
    fontSize: 13,
    fontWeight: '800',
    color: couleurs.renardFonce,
    textTransform: 'uppercase',
    letterSpacing: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  titre: { fontFamily: polices.titre, fontSize: 30, fontWeight: '800', color: couleurs.brun, marginTop: espace.s },
  texte: { fontSize: 16, fontWeight: '700', color: couleurs.brun, textAlign: 'center' },
  carte: {
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.l,
    padding: espace.l,
    gap: espace.m,
    ...ombre,
  },
  nom: { fontSize: 12.5, fontWeight: '800', color: couleurs.renardFonce, textTransform: 'uppercase', letterSpacing: 0.6 },
  message: { fontSize: 15.5, fontWeight: '600', color: couleurs.brun, lineHeight: 21 },
  bilan: { flexDirection: 'row', flexWrap: 'wrap', gap: espace.s },
  pastille: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: couleurs.orClair,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pastilleTexte: { fontWeight: '800', color: '#8A5A10', fontSize: 13.5 },
});
