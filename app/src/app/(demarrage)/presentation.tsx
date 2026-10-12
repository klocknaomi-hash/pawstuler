/**
 * PRÉSENTATION (avant l'onboarding)
 * En quelques secondes : ce qu'est l'app, et pourquoi elle va aider.
 * Décor de Clairebourg et mascotte en haut, feuille blanche en bas.
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Bouton, Texte, Titre } from '@/components/base';
import { EcranFeuille } from '@/components/EcranFeuille';
import { couleurs, espace, polices } from '@/config/theme';

const POINTS: { icone: keyof typeof Ionicons.glyphMap; texte: string }[] = [
  { icone: 'checkbox-outline', texte: 'Des petites tâches chaque jour, adaptées à ta recherche' },
  { icone: 'folder-open-outline', texte: 'Toutes tes candidatures au même endroit' },
  { icone: 'sparkles-outline', texte: 'Des pièces à chaque effort, pour personnaliser ton compagnon' },
  { icone: 'home-outline', texte: 'Il vit dans sa ville, part en aventure et progresse avec toi' },
];

export default function Presentation() {
  return (
    <EcranFeuille
      hauteurDecor={250}
      tailleMascotte={160}
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
      <View style={{ gap: espace.xs }}>
        <Text style={styles.marque}>Pawstuler</Text>
        <Titre style={{ textAlign: 'center' }}>Ta recherche d’emploi, à deux.</Titre>
        <Texte style={{ textAlign: 'center' }}>Ton compagnon avance avec toi, une petite étape à la fois.</Texte>
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
    </EcranFeuille>
  );
}

const styles = StyleSheet.create({
  marque: {
    textAlign: 'center',
    fontFamily: polices.titre,
    fontSize: 15,
    fontWeight: '800',
    color: couleurs.renardFonce,
    letterSpacing: 0.5,
  },
  points: { gap: espace.m, paddingTop: espace.xs },
  point: { flexDirection: 'row', alignItems: 'center', gap: espace.m },
  pastilleIcone: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: couleurs.pecheClair,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointTexte: { flex: 1, fontFamily: polices.texte, fontSize: 14.5, fontWeight: '600', color: couleurs.brun, lineHeight: 19 },
});
