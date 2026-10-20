import { REGLES } from '@amitie/core';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { couleurs, espaces, rayons, textes } from '@/config/theme';

/** Les 3 étapes de l'app, racontées simplement. */
const ETAPES = [
  { emoji: '🎬', titre: 'Dis ce que tu veux faire', texte: 'Un ciné samedi soir, une expo, une balade… en moins de 30 secondes.' },
  { emoji: '👋', titre: 'On forme un petit groupe', texte: 'De 3 à 6 personnes qui ont la même envie, dans un lieu public.' },
  { emoji: '🫶', titre: 'Si le courant passe, le groupe reste', texte: 'Il devient ton cercle : vous vous revoyez, et vous accueillez d’autres personnes si vous le voulez.' },
];

/**
 * Écran d'accueil provisoire (jalon 0) : il sert à vérifier que l'app
 * s'ouvre bien dans Expo Go. Il sera remplacé par l'inscription au jalon 1.
 */
export default function Accueil() {
  return (
    <SafeAreaView style={styles.ecran}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <Text style={styles.pastille}>Paris · {REGLES.ageMin} – {REGLES.ageMax} ans</Text>
        <Text style={textes.titre}>On se fait un ciné ?</Text>
        <Text style={[textes.sousTitre, styles.intro]}>
          Rencontre des gens que tu n’aurais jamais croisés, en petit groupe, autour d’une activité.
        </Text>

        {ETAPES.map((etape, i) => (
          <View key={etape.titre} style={styles.carte}>
            <Text style={styles.emoji}>{etape.emoji}</Text>
            <View style={styles.carteTexte}>
              <Text style={styles.carteTitre}>{i + 1}. {etape.titre}</Text>
              <Text style={textes.petit}>{etape.texte}</Text>
            </View>
          </View>
        ))}

        <View style={styles.confiance}>
          <Text style={styles.confianceTexte}>
            🛡️ Lieux publics uniquement, ton numéro n’est jamais partagé, et tu peux signaler ou bloquer en un geste.
          </Text>
        </View>

        <Pressable style={({ pressed }) => [styles.bouton, pressed && styles.boutonAppuye]} disabled>
          <Text style={styles.boutonTexte}>Bientôt disponible</Text>
        </Pressable>
        <Text style={[textes.petit, styles.version]}>Version de travail · jalon 0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { padding: espaces.l, gap: espaces.m },
  pastille: {
    alignSelf: 'flex-start',
    backgroundColor: couleurs.saugeClair,
    color: couleurs.sauge,
    fontWeight: '700',
    paddingHorizontal: espaces.m,
    paddingVertical: espaces.xs,
    borderRadius: rayons.pastille,
    overflow: 'hidden',
  },
  intro: { marginBottom: espaces.s },
  carte: {
    flexDirection: 'row',
    gap: espaces.m,
    backgroundColor: couleurs.carte,
    borderRadius: rayons.carte,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: espaces.m,
  },
  emoji: { fontSize: 28 },
  carteTexte: { flex: 1, gap: espaces.xs },
  carteTitre: { ...textes.corps, fontWeight: '700' },
  confiance: { backgroundColor: couleurs.saugeClair, borderRadius: rayons.carte, padding: espaces.m },
  confianceTexte: { ...textes.corps, color: couleurs.texte },
  bouton: {
    backgroundColor: couleurs.accent,
    borderRadius: rayons.bouton,
    paddingVertical: espaces.m,
    alignItems: 'center',
    marginTop: espaces.s,
    opacity: 0.6,
  },
  boutonAppuye: { opacity: 0.5 },
  boutonTexte: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  version: { textAlign: 'center' },
});
