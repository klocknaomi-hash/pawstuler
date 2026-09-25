/**
 * ACCUEIL
 * Le cœur de l'app : le compagnon dans sa ville, puis « Tes tâches du jour ».
 * Boucle : je coche une tâche → animation → je gagne des pièces → mon compagnon réagit.
 */
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeOutUp, SlideInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { imageVille } from '@/illustrations/registre';
import { Compagnon } from '@/components/Compagnon';
import { LigneTache } from '@/components/LigneTache';
import { CompteurPieces, IconePiece } from '@/components/Pieces';
import type { Pose } from '@/config/compagnons';
import { arrondis, couleurs, espace, ombre, polices } from '@/config/theme';
import { villeParId } from '@/config/villes';
import { estEndormi, heureLisible } from '@/logique/rythme';
import { rappelEssai } from '@/services/abonnement';
import { useApp } from '@/store/etat';
import type { Tache } from '@/store/types';

export default function Accueil() {
  const { etat, dispatch } = useApp();
  const [reaction, setReaction] = useState(0);
  const [poseMoment, setPoseMoment] = useState<Pose | null>(null);
  const [gains, setGains] = useState<{ cle: number; pieces: number }[]>([]);
  const [saisie, setSaisie] = useState<string | null>(null);
  const compteurGains = useRef(0);

  const compagnon = etat.compagnon;
  if (!compagnon || !etat.villeId) return null;
  const ville = villeParId(etat.villeId);
  const decor = imageVille(ville.id, 'portrait');

  const faites = etat.taches.filter((t) => t.faite).length;
  const toutFait = etat.taches.length > 0 && faites === etat.taches.length;
  const dort = estEndormi(etat.rythme);
  const pose: Pose = poseMoment ?? (dort ? 'dort' : toutFait ? 'excite' : 'neutre');
  const rappel = rappelEssai(etat);

  function basculer(t: Tache) {
    if (t.faite) {
      dispatch({ type: 'DECOCHER_TACHE', id: t.id });
      return;
    }
    dispatch({ type: 'COCHER_TACHE', id: t.id });
    // Récompense : pièces qui s'envolent + saut du compagnon + petite vibration
    compteurGains.current += 1;
    const cle = compteurGains.current;
    setGains((g) => [...g, { cle, pieces: t.pieces }]);
    setTimeout(() => setGains((g) => g.filter((x) => x.cle !== cle)), 1200);
    setReaction((r) => r + 1);
    setPoseMoment(t.modeleId === 'relance' || t.modeleId === 'recruteur' ? 'fier' : 'content');
    setTimeout(() => setPoseMoment(null), 2200);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }

  function supprimer(t: Tache) {
    const message = t.faite ? `Les ${t.pieces} pièces gagnées seront retirées.` : undefined;
    if (Platform.OS === 'web') {
      dispatch({ type: 'SUPPRIMER_TACHE', id: t.id });
      return;
    }
    Alert.alert(`Supprimer « ${t.titre} » ?`, message, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => dispatch({ type: 'SUPPRIMER_TACHE', id: t.id }) },
    ]);
  }

  function ajouter() {
    const titre = saisie?.trim();
    if (titre) dispatch({ type: 'AJOUTER_TACHE', titre });
    setSaisie(null);
  }

  const bulle = dort
    ? `${compagnon.nom} dort jusqu’à ${heureLisible(etat.rythme.reveil)}. Tes progrès l’attendront au réveil.`
    : poseMoment
      ? 'Bien joué ! Chaque petit pas compte.'
      : toutFait
        ? 'Bravo, tout est fait pour aujourd’hui !'
        : faites > 0
          ? `Déjà ${faites} de faite${faites > 1 ? 's' : ''}. On continue ?`
          : `Bonjour ${etat.utilisateur?.prenom ?? ''} ! On commence par quoi aujourd’hui ?`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: couleurs.creme }} edges={['top']}>
      <View style={styles.entete}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bonjour}>Bonjour {etat.utilisateur?.prenom}</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/ziggy-plus')}
          accessibilityRole="button"
          accessibilityLabel="Découvrir Ziggy+"
          style={styles.plus}>
          <Ionicons name="sparkles" size={16} color={couleurs.renardFonce} />
          <Text style={styles.plusTexte}>Ziggy+</Text>
        </Pressable>
        <CompteurPieces pieces={etat.pieces} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: espace.xxl }} keyboardShouldPersistTaps="handled">
        {/* Le compagnon dans sa ville */}
        <View style={styles.scene}>
          {decor ? (
            <Image source={decor} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: ville.couleur }]} />
          )}
          {dort && <View style={[StyleSheet.absoluteFill, styles.nuit]} />}
          <View style={styles.bulle}>
            <Text style={styles.bulleTexte}>{bulle}</Text>
          </View>
          <View style={styles.sol}>
            <Compagnon espece={compagnon.espece} pose={pose} taille={150} promenade={!dort} reaction={reaction} />
            {gains.map((g) => (
              <Animated.View key={g.cle} entering={SlideInDown.duration(250)} exiting={FadeOutUp.duration(700)} style={styles.gainVolant}>
                <Text style={styles.gainVolantTexte}>+{g.pieces}</Text>
                <IconePiece taille={18} />
              </Animated.View>
            ))}
          </View>
        </View>

        {rappel && (
          <Pressable style={styles.rappel} onPress={() => router.push('/ziggy-plus')}>
            <Ionicons name="time-outline" size={18} color={couleurs.brun} />
            <Text style={styles.rappelTexte}>{rappel}</Text>
          </Pressable>
        )}

        {/* Tes tâches du jour */}
        <View style={styles.taches}>
          <View style={styles.titreLigne}>
            <Text style={styles.titre}>Tes tâches du jour</Text>
            <Text style={styles.compte}>
              {faites}/{etat.taches.length}
            </Text>
          </View>

          {etat.taches.map((t) => (
            <LigneTache key={t.id} tache={t} onBasculer={() => basculer(t)} onSupprimer={() => supprimer(t)} />
          ))}

          {saisie === null ? (
            <Pressable style={styles.ajouter} onPress={() => setSaisie('')} accessibilityRole="button">
              <Ionicons name="add" size={22} color={couleurs.renardFonce} />
              <Text style={styles.ajouterTexte}>Ajouter une tâche</Text>
            </Pressable>
          ) : (
            <View style={styles.saisie}>
              <TextInput
                autoFocus
                value={saisie}
                onChangeText={setSaisie}
                placeholder="Ex. Préparer mon book"
                placeholderTextColor={couleurs.brunDoux}
                style={styles.champ}
                returnKeyType="done"
                onSubmitEditing={ajouter}
                maxLength={80}
                accessibilityLabel="Nouvelle tâche"
              />
              <Pressable onPress={ajouter} style={styles.valider} accessibilityRole="button" accessibilityLabel="Ajouter">
                <Ionicons name="checkmark" size={22} color={couleurs.blanc} />
              </Pressable>
            </View>
          )}
          <Text style={styles.astuce}>Appui long sur une tâche pour la supprimer.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  entete: { flexDirection: 'row', alignItems: 'center', gap: espace.s, paddingHorizontal: espace.l, paddingBottom: espace.s },
  bonjour: { fontFamily: polices.titre, fontSize: 22, fontWeight: '800', color: couleurs.brun },
  date: { fontSize: 13, color: couleurs.brunDoux, fontWeight: '600', textTransform: 'capitalize' },
  plus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: couleurs.pecheClair,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  plusTexte: { fontWeight: '800', color: couleurs.renardFonce, fontSize: 13 },
  scene: {
    height: 330,
    marginHorizontal: espace.l,
    borderRadius: arrondis.l,
    overflow: 'hidden',
    backgroundColor: couleurs.ciel,
  },
  nuit: { backgroundColor: 'rgba(40, 45, 90, 0.35)' },
  bulle: {
    position: 'absolute',
    top: espace.m,
    left: espace.m,
    right: espace.m,
    backgroundColor: couleurs.carte,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...ombre,
  },
  bulleTexte: { fontFamily: polices.texte, fontWeight: '700', fontSize: 14.5, color: couleurs.brun, lineHeight: 19 },
  sol: { position: 'absolute', bottom: 12, left: 0, right: 0, alignItems: 'center' },
  gainVolant: {
    position: 'absolute',
    top: -10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: couleurs.carte,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    ...ombre,
  },
  gainVolantTexte: { fontWeight: '800', color: '#9A6400', fontSize: 16 },
  rappel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.s,
    marginHorizontal: espace.l,
    marginTop: espace.m,
    backgroundColor: couleurs.orClair,
    borderRadius: arrondis.m,
    padding: espace.m,
  },
  rappelTexte: { flex: 1, fontWeight: '700', color: couleurs.brun },
  taches: { paddingHorizontal: espace.l, paddingTop: espace.xl, gap: espace.s },
  titreLigne: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 },
  titre: { fontFamily: polices.titre, fontSize: 21, fontWeight: '800', color: couleurs.brun },
  compte: { fontWeight: '800', color: couleurs.brunDoux, fontVariant: ['tabular-nums'] },
  ajouter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.s,
    borderRadius: arrondis.m,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: couleurs.ligne,
    paddingHorizontal: espace.l,
    paddingVertical: 14,
  },
  ajouterTexte: { fontWeight: '700', color: couleurs.renardFonce, fontSize: 15 },
  saisie: { flexDirection: 'row', gap: espace.s },
  champ: {
    flex: 1,
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.m,
    borderWidth: 1.5,
    borderColor: couleurs.renardFonce,
    paddingHorizontal: espace.l,
    paddingVertical: 12,
    fontSize: 15.5,
    fontWeight: '600',
    color: couleurs.brun,
  },
  valider: {
    width: 48,
    borderRadius: arrondis.m,
    backgroundColor: couleurs.renardFonce,
    alignItems: 'center',
    justifyContent: 'center',
  },
  astuce: { fontSize: 12, color: couleurs.brunDoux, textAlign: 'center', marginTop: 4 },
});
