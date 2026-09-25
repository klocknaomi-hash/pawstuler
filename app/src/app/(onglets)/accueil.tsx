/**
 * ACCUEIL
 * Le cœur de l'app : le compagnon dans sa ville, son énergie, l'aventure du jour,
 * puis « Tes tâches du jour ».
 * Boucle : je coche une tâche → animation → pièces 🪙 (+ un peu d'énergie ⚡ pour mon compagnon).
 */
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeOutUp, SlideInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Compagnon } from '@/components/Compagnon';
import { JaugeEnergie } from '@/components/Energie';
import { LigneTache } from '@/components/LigneTache';
import { CompteurPieces, IconePiece } from '@/components/Pieces';
import { BadgeSerie } from '@/components/Serie';
import type { Pose } from '@/config/compagnons';
import { COUT, ENERGIE_PAR_TACHE } from '@/config/energie';
import { PLAFOND_PIECES_JOUR } from '@/config/taches';
import { arrondis, couleurs, espace, ombre, polices } from '@/config/theme';
import { villeParId } from '@/config/villes';
import { imageVille } from '@/illustrations/registre';
import { aventuresRestantes } from '@/logique/compagnon';
import { jourDe } from '@/logique/dates';
import { estEndormi, heureLisible } from '@/logique/rythme';
import { emploiActuel } from '@/logique/tachesDuJour';
import { rappelEssai } from '@/services/abonnement';
import { gainPlafonne, useApp } from '@/store/etat';
import type { Tache } from '@/store/types';

const vibrer = () => {
  if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
};

export default function Accueil() {
  const { etat, dispatch } = useApp();
  const [reaction, setReaction] = useState(0);
  const [moment, setMoment] = useState<{ pose: Pose; texte: string } | null>(null);
  const [gains, setGains] = useState<{ cle: number; pieces: number }[]>([]);
  const [saisie, setSaisie] = useState<string | null>(null);
  const compteurGains = useRef(0);
  const minuterieMoment = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const compagnon = etat.compagnon;
  if (!compagnon || !etat.villeId) return null;
  const ville = villeParId(etat.villeId);
  const decor = imageVille(ville.id, 'portrait');
  const emploi = emploiActuel(etat);

  const faites = etat.taches.filter((t) => t.faite).length;
  const toutFait = etat.taches.length > 0 && faites === etat.taches.length;
  const dort = estEndormi(etat.rythme);
  const pose: Pose = moment?.pose ?? (dort ? 'dort' : toutFait ? 'excite' : 'neutre');
  const rappel = rappelEssai(etat);
  const aujourdhui = jourDe();
  const serieFetee = etat.serie.objectifAtteintLe === aujourdhui;
  const serieReprise = etat.serie.repriseLe === aujourdhui;
  const restantes = aventuresRestantes(etat);

  /** Fait réagir le compagnon quelques secondes (pose + bulle). */
  function reagir(p: Pose, texte: string) {
    setReaction((r) => r + 1);
    setMoment({ pose: p, texte });
    clearTimeout(minuterieMoment.current);
    minuterieMoment.current = setTimeout(() => setMoment(null), 2600);
  }

  function basculer(t: Tache) {
    if (t.faite) {
      dispatch({ type: 'DECOCHER_TACHE', id: t.id });
      return;
    }
    const gain = gainPlafonne(etat, t.pieces);
    dispatch({ type: 'COCHER_TACHE', id: t.id });
    compteurGains.current += 1;
    const cle = compteurGains.current;
    setGains((g) => [...g, { cle, pieces: gain }]);
    setTimeout(() => setGains((g) => g.filter((x) => x.cle !== cle)), 1200);
    reagir(
      t.modeleId === 'relance' || t.modeleId === 'recruteur' ? 'fier' : 'content',
      gain < t.pieces
        ? `Plafond de ${PLAFOND_PIECES_JOUR} pièces atteint pour aujourd’hui. Ta tâche compte quand même, bravo !`
        : 'Bien joué ! Chaque petit pas compte.',
    );
    vibrer();
  }

  function supprimer(t: Tache) {
    if (Platform.OS === 'web') return dispatch({ type: 'SUPPRIMER_TACHE', id: t.id });
    Alert.alert(`Supprimer « ${t.titre} » ?`, t.faite ? `Les ${t.pieces} pièces gagnées seront retirées.` : undefined, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => dispatch({ type: 'SUPPRIMER_TACHE', id: t.id }) },
    ]);
  }

  function ajouter() {
    const titre = saisie?.trim();
    if (titre) dispatch({ type: 'AJOUTER_TACHE', titre });
    setSaisie(null);
  }

  function interagir(type: 'calin' | 'jeu') {
    if (etat.energie < COUT[type])
      return reagir('reconfort', `Je n’ai plus assez d’énergie… Chaque tâche terminée m’en redonne ${ENERGIE_PAR_TACHE} ⚡.`);
    dispatch({ type: 'INTERAGIR', moment: type });
    reagir(type === 'calin' ? 'content' : 'excite', type === 'calin' ? 'Merci, ça fait du bien !' : 'Encore une partie ? 😄');
  }

  /** Ce que dit le compagnon : réaction du moment, sommeil, série, puis avancée des tâches. */
  function messageDuJour(): string {
    const prenom = etat.utilisateur?.prenom ?? '';
    if (dort) return `${compagnon?.nom} dort jusqu’à ${heureLisible(etat.rythme.reveil)}. Tes progrès l’attendront au réveil.`;
    if (serieFetee && faites === 0) return `${etat.serie.actuelle} jours d’affilée, objectif atteint ! Merci d’être là 🐾`;
    if (serieReprise && faites === 0) return `Content de te revoir ${prenom} ! On repart ensemble, à ton rythme 🐾`;
    if (toutFait) return 'Bravo, tout est fait pour aujourd’hui !';
    if (faites > 0) return `Déjà ${faites} de faite${faites > 1 ? 's' : ''}. On continue ?`;
    return `Bonjour ${prenom} ! On commence par quoi aujourd’hui ?`;
  }
  const bulle = moment?.texte ?? messageDuJour();

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
          onPress={() => router.push('/compagnon')}
          accessibilityRole="button"
          accessibilityLabel={`Série de ${etat.serie.actuelle} jour${etat.serie.actuelle > 1 ? 's' : ''}. Voir le profil de ${compagnon.nom}`}>
          <BadgeSerie serie={etat.serie} />
        </Pressable>
        <Pressable onPress={() => router.push('/compte/portefeuille')} accessibilityRole="button" accessibilityLabel="Mon portefeuille">
          <CompteurPieces pieces={etat.pieces} />
        </Pressable>
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
            <Pressable onPress={() => !dort && interagir('calin')} accessibilityRole="button" accessibilityLabel={`Câliner ${compagnon.nom}`}>
              <Compagnon espece={compagnon.espece} pose={pose} taille={150} promenade={!dort && !moment} reaction={reaction} equipe={etat.equipe} />
            </Pressable>
            {gains.filter((g) => g.pieces > 0).map((g) => (
              <Animated.View key={g.cle} entering={SlideInDown.duration(250)} exiting={FadeOutUp.duration(700)} style={styles.gainVolant}>
                <Text style={styles.gainVolantTexte}>+{g.pieces}</Text>
                <IconePiece taille={18} />
                <Text style={styles.gainEnergie}>+{ENERGIE_PAR_TACHE} ⚡</Text>
              </Animated.View>
            ))}
          </View>
          <View style={styles.energie}>
            <JaugeEnergie energie={etat.energie} compacte />
          </View>
        </View>

        {/* Moments avec le compagnon */}
        <View style={styles.moments}>
          {restantes > 0 ? (
            <Pressable
              style={[styles.aventure, (dort || etat.energie < COUT.aventure) && { opacity: 0.5 }]}
              disabled={dort || etat.energie < COUT.aventure}
              onPress={() => router.push('/aventure')}
              accessibilityRole="button">
              <Ionicons name="map" size={20} color={couleurs.blanc} />
              <View style={{ flex: 1 }}>
                <Text style={styles.aventureTitre}>Aventure du jour</Text>
                <Text style={styles.aventureSous}>
                  {dort ? `${compagnon.nom} dort encore` : `${COUT.aventure} ⚡ · ${compagnon.nom} explore ${ville.nom}`}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={couleurs.blanc} />
            </Pressable>
          ) : (
            <Pressable style={styles.aventureFaite} onPress={() => router.push('/aventure')} accessibilityRole="button">
              <Ionicons name="moon" size={18} color={couleurs.brunDoux} />
              <View style={{ flex: 1 }}>
                <Text style={styles.aventureFaiteTitre}>Nouvelle aventure demain</Text>
                <Text style={styles.aventureSous2} numberOfLines={1}>
                  Relire l’aventure d’aujourd’hui
                </Text>
              </View>
            </Pressable>
          )}
          <View style={styles.petitsMoments}>
            <Moment icone="heart" libelle="Câlin" cout={COUT.calin} onPress={() => interagir('calin')} desactive={dort} />
            <Moment icone="football" libelle="Jouer" cout={COUT.jeu} onPress={() => interagir('jeu')} desactive={dort} />
          </View>
        </View>

        {rappel && (
          <Pressable style={styles.rappel} onPress={() => router.push('/premium')}>
            <Ionicons name="time-outline" size={18} color={couleurs.brun} />
            <Text style={styles.rappelTexte}>{rappel}</Text>
          </Pressable>
        )}

        {/* Nouveau chapitre professionnel */}
        {etat.contexte === 'pro' && emploi && (
          <Pressable style={styles.pro} onPress={() => router.push('/aventure-pro')} accessibilityRole="button">
            <Text style={{ fontSize: 26 }}>💼</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.proTitre}>Mon aventure professionnelle</Text>
              <Text style={styles.proSous}>
                {emploi.poste} chez {emploi.entreprise}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={couleurs.brun} />
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
          <View style={styles.plafond} accessibilityLabel={`${etat.piecesDuJour} pièces gagnées aujourd’hui sur ${PLAFOND_PIECES_JOUR}`}>
            <IconePiece taille={14} />
            <Text style={styles.plafondTexte}>
              {etat.piecesDuJour}/{PLAFOND_PIECES_JOUR} pièces gagnées aujourd’hui
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

function Moment({
  icone,
  libelle,
  cout,
  onPress,
  desactive,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  libelle: string;
  cout: number;
  onPress: () => void;
  desactive: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={desactive}
      accessibilityRole="button"
      accessibilityLabel={`${libelle}, ${cout} énergie`}
      style={[styles.moment, desactive && { opacity: 0.45 }]}>
      <Ionicons name={icone} size={18} color={couleurs.renardFonce} />
      <Text style={styles.momentTexte}>{libelle}</Text>
      <Text style={styles.momentCout}>{cout} ⚡</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  entete: { flexDirection: 'row', alignItems: 'center', gap: espace.s, paddingHorizontal: espace.l, paddingBottom: espace.s },
  bonjour: { fontFamily: polices.titre, fontSize: 22, fontWeight: '800', color: couleurs.brun },
  date: { fontSize: 13, color: couleurs.brunDoux, fontWeight: '600', textTransform: 'capitalize' },
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
  sol: { position: 'absolute', bottom: 44, left: 0, right: 0, alignItems: 'center' },
  energie: { position: 'absolute', left: espace.m, right: espace.m, bottom: espace.m },
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
  gainEnergie: { fontWeight: '800', color: couleurs.brunDoux, fontSize: 13, marginLeft: 4 },
  moments: { marginHorizontal: espace.l, marginTop: espace.m, gap: espace.s },
  aventure: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.m,
    backgroundColor: couleurs.saugeFonce,
    borderRadius: arrondis.m,
    padding: espace.l,
  },
  aventureTitre: { color: couleurs.blanc, fontWeight: '800', fontSize: 16 },
  aventureSous: { color: couleurs.blanc, opacity: 0.9, fontWeight: '600', fontSize: 13, marginTop: 2 },
  aventureFaite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.m,
    backgroundColor: couleurs.saugeClair,
    borderRadius: arrondis.m,
    padding: espace.l,
  },
  aventureFaiteTitre: { color: couleurs.saugeFonce, fontWeight: '800', fontSize: 15 },
  aventureSous2: { color: couleurs.brunDoux, fontWeight: '600', fontSize: 13, marginTop: 2 },
  petitsMoments: { flexDirection: 'row', gap: espace.s },
  moment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.m,
    borderWidth: 1,
    borderColor: couleurs.ligne,
    paddingHorizontal: espace.m,
    paddingVertical: 10,
  },
  momentTexte: { flex: 1, fontWeight: '800', color: couleurs.brun },
  momentCout: { fontWeight: '800', color: couleurs.brunDoux, fontSize: 12.5 },
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
  pro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.m,
    marginHorizontal: espace.l,
    marginTop: espace.m,
    backgroundColor: couleurs.pecheClair,
    borderRadius: arrondis.m,
    padding: espace.l,
  },
  proTitre: { fontWeight: '800', color: couleurs.brun, fontSize: 15.5 },
  proSous: { fontWeight: '600', color: couleurs.brunDoux, fontSize: 13.5, marginTop: 2 },
  taches: { paddingHorizontal: espace.l, paddingTop: espace.xl, gap: espace.s },
  titreLigne: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 },
  titre: { fontFamily: polices.titre, fontSize: 21, fontWeight: '800', color: couleurs.brun },
  compte: { fontWeight: '800', color: couleurs.brunDoux, fontVariant: ['tabular-nums'] },
  plafond: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -2, marginBottom: 4 },
  plafondTexte: { fontSize: 12.5, fontWeight: '700', color: couleurs.brunDoux, fontVariant: ['tabular-nums'] },
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
