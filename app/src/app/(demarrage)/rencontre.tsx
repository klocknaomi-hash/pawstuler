/**
 * ONBOARDING 5 bis — La rencontre
 * Juste après avoir reçu son prénom, le compagnon se présente en quelques bulles
 * (répliques dans src/config/dialogues.ts). On touche pour passer à la suite ;
 * la dernière bulle se termine par « Promis ! 🐾 », puis on choisit la ville.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Bouton, Ecran } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { EnteteEtape } from '@/components/EnteteEtape';
import { accorder } from '@/config/compagnons';
import { DIALOGUES } from '@/config/dialogues';
import { arrondis, couleurs, espace, ombre } from '@/config/theme';
import { useApp } from '@/store/etat';

export default function Rencontre() {
  const { etat } = useApp();
  const [index, setIndex] = useState(0);
  const compagnon = etat.compagnon;
  const espece = compagnon?.espece ?? 'renard';
  const repliques = DIALOGUES[espece];
  const replique = repliques[index];
  const derniere = index === repliques.length - 1;

  const texte = accorder(
    replique.texte.replaceAll('{nom}', compagnon?.nom ?? '').replaceAll('{prenom}', etat.utilisateur?.prenom ?? ''),
    compagnon?.pronoms,
  );

  const suivante = () => (derniere ? undefined : setIndex((i) => i + 1));
  const continuer = () => router.push('/ville-depart');

  return (
    <Ecran
      bas={
        derniere ? (
          <Bouton titre="Promis ! 🐾" onPress={continuer} />
        ) : (
          <Bouton titre="Suivant" variante="secondaire" onPress={suivante} />
        )
      }>
      <View style={styles.entete}>
        <View style={{ flex: 1 }}>
          <EnteteEtape etape={5} retour={false} />
        </View>
      </View>
      <Pressable onPress={continuer} accessibilityRole="button" style={styles.passer} hitSlop={10}>
        <Text style={styles.passerTexte}>Passer</Text>
      </Pressable>

      <Pressable style={styles.scene} onPress={suivante} accessibilityRole="button" accessibilityLabel={texte} accessibilityHint="Touche pour la suite">
        {/* La bulle change à chaque réplique (petit fondu) */}
        <Animated.View key={index} entering={FadeIn.duration(300)} style={styles.bulle}>
          <Text style={styles.nom}>{compagnon?.nom}</Text>
          <Text style={styles.texte}>{texte}</Text>
        </Animated.View>
        <View style={styles.pointe} />
        <Compagnon espece={espece} pose={replique.pose} taille={200} reaction={index} />
        <View style={styles.points}>
          {repliques.map((_, i) => (
            <View key={i} style={[styles.point, i === index && styles.pointActif]} />
          ))}
        </View>
      </Pressable>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  entete: { flexDirection: 'row', alignItems: 'center' },
  passer: { alignSelf: 'flex-end', marginTop: -espace.s },
  passerTexte: { color: couleurs.brunDoux, fontWeight: '700', fontSize: 14 },
  scene: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 0 },
  bulle: {
    alignSelf: 'stretch',
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.l,
    padding: espace.l,
    gap: 4,
    ...ombre,
  },
  pointe: {
    width: 18,
    height: 18,
    backgroundColor: couleurs.carte,
    transform: [{ rotate: '45deg' }],
    marginTop: -10,
    marginBottom: espace.m,
  },
  nom: { fontSize: 12.5, fontWeight: '800', color: couleurs.renardFonce, textTransform: 'uppercase', letterSpacing: 0.6 },
  texte: { fontSize: 17, fontWeight: '700', color: couleurs.brun, lineHeight: 24 },
  points: { flexDirection: 'row', gap: 6, marginTop: espace.xl },
  point: { width: 7, height: 7, borderRadius: 4, backgroundColor: couleurs.ligne },
  pointActif: { backgroundColor: couleurs.renardFonce, width: 18 },
});
