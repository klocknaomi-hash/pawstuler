/**
 * PRÉSENTATION (avant l'onboarding)
 * En quelques secondes : ce qu'est l'app, et pourquoi elle va aider.
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Bouton, Ecran, Texte, Titre } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { arrondis, couleurs, espace, polices } from '@/config/theme';

const POINTS: { icone: keyof typeof Ionicons.glyphMap; texte: string }[] = [
  { icone: 'checkbox-outline', texte: 'Des petites tâches chaque jour, adaptées à ta recherche' },
  { icone: 'folder-open-outline', texte: 'Toutes tes candidatures au même endroit' },
  { icone: 'sparkles-outline', texte: 'Des pièces à chaque effort, pour personnaliser ton compagnon' },
  { icone: 'home-outline', texte: 'Il vit dans sa ville, part en aventure et progresse avec toi' },
];

export default function Presentation() {
  return (
    <Ecran
      defilant
      bas={
        <>
          <Bouton titre="Commencer" onPress={() => router.push('/connexion')} />
          <Bouton
            titre="J'ai déjà un compte"
            variante="texte"
            onPress={() => router.push({ pathname: '/connexion', params: { mode: 'retour' } })}
          />
        </>
      }>
      <View style={styles.haut}>
        <Text style={styles.marque}>Pawstuler</Text>
        <Compagnon espece="renard" pose="salut" taille={190} />
      </View>

      <View style={{ gap: espace.s }}>
        <Titre style={{ textAlign: 'center' }}>Ta recherche d’emploi, à deux.</Titre>
        <Texte style={{ textAlign: 'center' }}>Tu n’es pas seul dans ta recherche d’emploi. Ton compagnon avance avec toi.</Texte>
      </View>

      <View style={styles.points}>
        {POINTS.map((p) => (
          <View key={p.icone} style={styles.point}>
            <View style={styles.pastilleIcone}>
              <Ionicons name={p.icone} size={20} color={couleurs.renardFonce} />
            </View>
            <Text style={styles.pointTexte}>{p.texte}</Text>
          </View>
        ))}
      </View>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  haut: { alignItems: 'center', gap: espace.s, paddingTop: espace.s },
  marque: {
    fontFamily: polices.titre,
    fontSize: 20,
    fontWeight: '800',
    color: couleurs.renardFonce,
    letterSpacing: 0.5,
  },
  points: {
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.l,
    padding: espace.l,
    gap: espace.m,
    borderWidth: 1,
    borderColor: couleurs.ligne,
  },
  point: { flexDirection: 'row', alignItems: 'center', gap: espace.m },
  pastilleIcone: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: couleurs.pecheClair,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointTexte: { flex: 1, fontFamily: polices.texte, fontSize: 15, fontWeight: '600', color: couleurs.brun, lineHeight: 20 },
});
