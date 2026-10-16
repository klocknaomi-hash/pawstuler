/**
 * OUTIL — M'ENTRAÎNER À L'ENTRETIEN
 * Une question à la fois, tirée au hasard parmi celles accessibles (5 en gratuit, toutes en Premium).
 * On répond à voix haute avec un minuteur (1 min 30), puis on regarde le conseil, et question suivante.
 */
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Bouton, Ecran, Texte } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { Bloc, Verrou, stylesOutils } from '@/components/Outils';
import { QUESTIONS_ENTRETIEN } from '@/config/outils';
import { couleurs, espace } from '@/config/theme';
import { aPremium } from '@/services/abonnement';
import { useApp } from '@/store/etat';

const DUREE_REPONSE = 90; // secondes

export default function Entrainement() {
  const { etat } = useApp();
  const premium = aPremium(etat);
  // Les questions accessibles, mélangées une fois à l'ouverture
  const [ordre] = useState(() =>
    QUESTIONS_ENTRETIEN.flatMap((c) => c.questions)
      .filter((q) => premium || q.gratuit)
      .map((q) => ({ q, tri: Math.random() }))
      .sort((a, b) => a.tri - b.tri)
      .map((x) => x.q),
  );
  const [index, setIndex] = useState(0);
  const [voirConseil, setVoirConseil] = useState(false);
  const [reste, setReste] = useState(DUREE_REPONSE);
  const [enCours, setEnCours] = useState(false);

  // Le minuteur avance d'une seconde à la fois tant qu'il tourne
  useEffect(() => {
    if (!enCours) return;
    const minuterie = setInterval(() => setReste((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => clearInterval(minuterie);
  }, [enCours]);
  const fini = enCours && reste === 0;

  const q = ordre[index % ordre.length];
  const suivante = () => {
    setIndex((i) => i + 1);
    setVoirConseil(false);
    setReste(DUREE_REPONSE);
    setEnCours(false);
  };
  const minutes = `${Math.floor(reste / 60)}:${String(reste % 60).padStart(2, '0')}`;

  return (
    <Ecran defilant avecEntete>
      <View style={styles.haut}>
        {etat.compagnon && <Compagnon espece={etat.compagnon.espece} pose={voirConseil ? 'content' : 'neutre'} taille={90} equipe={etat.equipe} />}
        <Text style={stylesOutils.petit}>
          Question {(index % ordre.length) + 1} sur {ordre.length}
        </Text>
      </View>
      <Bloc>
        <Text style={styles.question}>{q.question}</Text>
        <Text style={stylesOutils.petit}>Réponds à voix haute, comme si tu y étais. Pas de pression : c’est un entraînement.</Text>
      </Bloc>

      <View style={styles.minuteur}>
        <Text style={[styles.temps, fini && { color: couleurs.renardFonce }]} accessibilityLabel={`Temps restant ${minutes}`}>
          {fini ? 'Temps écoulé !' : minutes}
        </Text>
        <Bouton
          titre={enCours && !fini ? 'Pause' : reste < DUREE_REPONSE && !fini ? 'Reprendre' : 'Lancer le minuteur'}
          variante="secondaire"
          onPress={() => (fini ? (setReste(DUREE_REPONSE), setEnCours(true)) : setEnCours((v) => !v))}
        />
      </View>

      {voirConseil ? (
        <Bloc titre="💡 Ce que le recruteur cherche">
          <Text style={stylesOutils.texte}>{q.cherche}</Text>
          <Text style={[stylesOutils.texte, { marginTop: espace.s }]}>{q.conseil}</Text>
          <Text style={[stylesOutils.petit, { marginTop: espace.s }]}>Exemple : {q.exemple}</Text>
        </Bloc>
      ) : (
        <Bouton titre="Voir le conseil" variante="secondaire" onPress={() => setVoirConseil(true)} />
      )}
      <Bouton titre="Question suivante" onPress={suivante} />
      {!premium && (
        <>
          <Texte style={{ textAlign: 'center' }}>Tu t’entraînes sur 5 questions. Il y en a beaucoup d’autres avec Premium.</Texte>
          <View style={{ alignItems: 'center' }}>
            <Verrou texte="Toutes les questions avec Premium" />
          </View>
        </>
      )}
    </Ecran>
  );
}

const styles = StyleSheet.create({
  haut: { alignItems: 'center', gap: espace.s },
  question: { fontSize: 18, fontWeight: '700', color: couleurs.brun, lineHeight: 25 },
  minuteur: { alignItems: 'center', gap: espace.s },
  temps: { fontSize: 26, fontWeight: '700', color: couleurs.brun },
});
