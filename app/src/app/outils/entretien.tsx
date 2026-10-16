/**
 * OUTIL — PRÉPARER UN ENTRETIEN
 * Les questions fréquentes, rangées par thème. Chacune s'ouvre : ce que le recruteur cherche,
 * un conseil, un exemple, et tes propres notes (gardées sur le téléphone).
 * En gratuit : 5 questions et les questions à poser ; Premium : tout. Puis « M'entraîner ».
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Bouton, Ecran, Texte } from '@/components/base';
import { Bloc, Verrou, stylesOutils } from '@/components/Outils';
import { QUESTIONS_A_POSER, QUESTIONS_ENTRETIEN, type QuestionEntretien } from '@/config/outils';
import { arrondis, couleurs, espace, relief } from '@/config/theme';
import { aPremium } from '@/services/abonnement';
import { useApp } from '@/store/etat';

export default function PreparerEntretien() {
  const { etat } = useApp();
  const premium = aPremium(etat);
  const [ouverte, setOuverte] = useState<string | null>(null);

  return (
    <Ecran defilant avecEntete>
      <Texte>Lis la question, essaie d’y répondre à voix haute, puis ouvre-la pour voir ce que le recruteur cherche.</Texte>
      <Bouton titre="M’entraîner (questions au hasard)" variante="secondaire" onPress={() => router.push('/outils/entrainement')} />

      {QUESTIONS_ENTRETIEN.map((cat) => (
        <View key={cat.id} style={{ gap: espace.s }}>
          <Text style={stylesOutils.titreSection}>
            {cat.emoji} {cat.titre}
          </Text>
          {cat.questions.map((q) => (
            <Question key={q.id} q={q} ouverte={ouverte === q.id} accessible={premium || !!q.gratuit} onPress={() => setOuverte(ouverte === q.id ? null : q.id)} />
          ))}
        </View>
      ))}

      <Bloc titre="🙋 Les questions à poser à la fin">
        <Text style={stylesOutils.petit}>Poser une ou deux questions montre ta motivation. Choisis celles qui t’intéressent vraiment :</Text>
        {QUESTIONS_A_POSER.map((q) => (
          <Text key={q} style={stylesOutils.texte}>
            • {q}
          </Text>
        ))}
      </Bloc>
    </Ecran>
  );
}

function Question({ q, ouverte, accessible, onPress }: { q: QuestionEntretien; ouverte: boolean; accessible: boolean; onPress: () => void }) {
  const { etat, dispatch } = useApp();
  const note = etat.outils?.notes[q.id] ?? '';
  return (
    <View style={styles.carte}>
      <Pressable
        onPress={accessible ? onPress : () => router.push('/premium')}
        accessibilityRole="button"
        accessibilityState={{ expanded: ouverte }}
        style={styles.entete}>
        <Text style={[styles.question, !accessible && { color: couleurs.brunDoux }]}>{q.question}</Text>
        <Ionicons name={accessible ? (ouverte ? 'chevron-up' : 'chevron-down') : 'lock-closed'} size={18} color={accessible ? couleurs.brunDoux : couleurs.renardFonce} />
      </Pressable>
      {ouverte && accessible && (
        <View style={{ gap: espace.m }}>
          <Partie titre="🎯 Ce que le recruteur cherche" texte={q.cherche} />
          <Partie titre="💡 Conseil" texte={q.conseil} />
          <Partie titre="💬 Exemple" texte={q.exemple} />
          <View style={{ gap: 4 }}>
            <Text style={styles.partieTitre}>📝 Ma réponse</Text>
            <TextInput
              value={note}
              onChangeText={(texte) => dispatch({ type: 'NOTER_QUESTION', id: q.id, texte })}
              placeholder="Note ici les idées de ta réponse…"
              placeholderTextColor={couleurs.brunDoux}
              multiline
              style={styles.note}
            />
          </View>
        </View>
      )}
      {!accessible && <Verrou />}
    </View>
  );
}

function Partie({ titre, texte }: { titre: string; texte: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={styles.partieTitre}>{titre}</Text>
      <Text style={stylesOutils.texte}>{texte}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  carte: { backgroundColor: couleurs.carte, borderRadius: arrondis.l, padding: espace.l, gap: espace.m, ...relief },
  entete: { flexDirection: 'row', alignItems: 'center', gap: espace.s },
  question: { flex: 1, fontSize: 15, fontWeight: '600', color: couleurs.brun, lineHeight: 21 },
  partieTitre: { fontSize: 13, fontWeight: '700', color: couleurs.renardFonce },
  note: {
    minHeight: 80,
    borderWidth: 1.5,
    borderColor: couleurs.ligne,
    borderRadius: arrondis.m,
    padding: espace.m,
    fontSize: 15,
    color: couleurs.brun,
    textAlignVertical: 'top',
  },
});
