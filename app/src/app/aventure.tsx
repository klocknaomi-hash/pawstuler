/**
 * MISSION DU COMPAGNON (« Aventure du jour »)
 * Un seul écran pour toute la vie d'une mission, en temps réel :
 *  1. Présentation : où il va, pourquoi (en miroir de ta candidature), durée, énergie → « Envoyer {nom} ».
 *  2. En route : « {nom} est chez X · Retour à 20 h 16 », avec le compte à rebours (l'app peut être fermée).
 *  3. Retour : on découvre ce qu'il a vécu, et les pièces qu'il rapporte.
 * Ouverture : `/aventure?id=<mission>` (mission miroir), `/aventure?explorer=1` (explorer la ville),
 * ou `/aventure` tout court (la mission en cours ou le dernier résultat).
 */
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Bouton, Ecran, Texte, Titre } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { IconePiece } from '@/components/Pieces';
import { accorder } from '@/config/compagnons';
import { AVENTURES_PAR_JOUR } from '@/config/energie';
import { COUTS_MISSION, DUREES_MINUTES, PIECES_MISSION } from '@/config/missions';
import { arrondis, couleurs, espace, ombre } from '@/config/theme';
import { villeParId } from '@/config/villes';
import { useMaintenant } from '@/hooks/useMaintenant';
import { imageVille } from '@/illustrations/registre';
import { aventuresRestantes } from '@/logique/compagnon';
import { dureeLisible, energieDisponible, tempsAvantRecharge } from '@/logique/energie';
import {
  compagnonAbsent,
  dureeMission,
  heureLisible,
  iconeMission,
  missionDansLaVille,
  missionEnCours,
  missionsDisponibles,
  pendantMission,
  presentationMission,
  titreMission,
} from '@/logique/missions';
import { estEndormi } from '@/logique/rythme';
import { aPremium } from '@/services/abonnement';
import { gainPlafonne, useApp } from '@/store/etat';
import type { Mission } from '@/store/types';

export default function Aventure() {
  const { id, explorer } = useLocalSearchParams<{
    id?: string;
    explorer?: string;
  }>();
  const { etat, dispatch } = useApp();
  const maintenant = useMaintenant();
  // Le résultat découvert sur cet écran (et les pièces réellement gagnées, plafond compris)
  const [decouvert, setDecouvert] = useState<{
    id: string;
    pieces: number;
  } | null>(null);
  // Aperçu de l'exploration, figé à l'ouverture de l'écran
  const [exploration] = useState<Mission | null>(() => (explorer === '1' ? missionDansLaVille(etat) : null));

  if (!etat.compagnon || !etat.villeId) return null;
  const ville = villeParId(etat.villeId);
  const nom = etat.compagnon.nom;
  const decor = imageVille(ville.id, 'paysage');
  const fermer = () => router.back();
  const accord = (texte: string) => accorder(texte, etat.compagnon?.pronoms);

  const enCours = missionEnCours(etat);
  const vue = decouvert ? etat.missions.find((m) => m.id === decouvert.id) : undefined;

  /* 3. Résultat découvert */
  if (vue && decouvert) {
    return (
      <Ecran
        defilant
        bas={
          <>
            <Bouton titre="Retour à l’accueil" onPress={fermer} />
            {!vue.candidatureId && aventuresRestantes(etat) === 0 && !aPremium(etat) && (
              <Bouton
                titre={`Avec Premium : jusqu’à ${AVENTURES_PAR_JOUR.premium} explorations par jour`}
                variante="texte"
                onPress={() => router.replace('/premium')}
              />
            )}
          </>
        }>
        <Fermer onPress={fermer} />
        <View style={styles.centre}>
          <Compagnon
            espece={etat.compagnon.espece}
            pose={vue.type === 'entretien' ? 'fier' : 'content'}
            taille={170}
            reaction={1}
            equipe={etat.equipe}
          />
          <Titre style={styles.texteCentre}>{accord(`${nom} est rentré{e} !`)}</Titre>
        </View>
        <Animated.View entering={FadeIn.duration(500)} style={styles.carte}>
          <Text style={styles.lieu}>
            {iconeMission(vue)} {vue.lieu}
          </Text>
          <Text style={styles.recit}>{vue.resultat}</Text>
          <View style={styles.recompense}>
            <IconePiece taille={20} />
            <Text style={styles.recompenseTexte}>
              {decouvert.pieces > 0 ? `+${decouvert.pieces} pièces rapportées` : 'Plafond de pièces atteint aujourd’hui, mais quelle aventure !'}
            </Text>
          </View>
        </Animated.View>
      </Ecran>
    );
  }

  /* 2. Mission en cours : en route, ou déjà revenu avec un résultat à découvrir */
  if (enCours?.retour) {
    const absent = compagnonAbsent(etat, maintenant);
    const decouvrir = () => {
      setDecouvert({
        id: enCours.id,
        pieces: gainPlafonne(etat, PIECES_MISSION[enCours.type]),
      });
      dispatch({ type: 'DECOUVRIR_RESULTAT', id: enCours.id });
    };
    return (
      <Ecran
        fond={couleurs.ciel}
        style={styles.centre}
        bas={
          absent ? <Bouton titre="D’accord, à tout à l’heure !" onPress={fermer} /> : <Bouton titre="Découvrir son aventure" onPress={decouvrir} />
        }>
        {decor && <Image source={decor} style={[StyleSheet.absoluteFill, { opacity: 0.35 }]} contentFit="cover" />}
        <Fermer onPress={fermer} flottant />
        {absent ? (
          <>
            <Text style={styles.icone}>{iconeMission(enCours)}</Text>
            <Titre style={styles.texteCentre}>
              {nom} est chez {enCours.lieu}
            </Titre>
            <View style={styles.pastille}>
              <Ionicons name="time-outline" size={18} color={couleurs.brun} />
              <Text style={styles.pastilleTexte}>
                Retour à {heureLisible(enCours.retour)} · dans {dureeLisible(Math.min(enCours.retour - maintenant, dureeMission(enCours)))}
              </Text>
            </View>
            <Texte style={styles.texteCentre}>{pendantMission(etat, enCours)}</Texte>
            <Texte style={styles.texteCentre}>Tu peux fermer l’app : tu seras prévenu à son retour.</Texte>
          </>
        ) : (
          <>
            <Compagnon espece={etat.compagnon.espece} pose="excite" taille={170} reaction={1} equipe={etat.equipe} />
            <Titre style={styles.texteCentre}>{nom} est de retour !</Titre>
            <Texte style={styles.texteCentre}>
              {iconeMission(enCours)} {titreMission(etat, enCours)}
            </Texte>
          </>
        )}
      </Ecran>
    );
  }

  /* 1. Présentation d'une mission avant le départ */
  const mission = exploration ?? missionsDisponibles(etat).find((m) => m.id === id);
  if (!mission) {
    return (
      <Ecran style={styles.centre} bas={<Bouton titre="Retour à l’accueil" onPress={fermer} />}>
        <Fermer onPress={fermer} flottant />
        <Compagnon espece={etat.compagnon.espece} pose="neutre" taille={150} equipe={etat.equipe} />
        <Titre style={styles.texteCentre}>Pas de mission pour l’instant</Titre>
        <Texte style={styles.texteCentre}>Chaque candidature, relance ou entretien que tu notes donne une mission à {nom}.</Texte>
      </Ecran>
    );
  }

  const cout = COUTS_MISSION[mission.type];
  const energie = energieDisponible(etat, maintenant);
  const recharge = tempsAvantRecharge(etat, maintenant);
  const dort = estEndormi(etat.rythme);
  const plusDExploration = !!exploration && aventuresRestantes(etat) === 0;
  const empechement = dort
    ? `${nom} dort. La mission l’attendra à son réveil.`
    : plusDExploration
      ? 'Nouvelle exploration demain.'
      : energie < cout
        ? accord(
            `${nom} a besoin de ${cout} ⚡ pour partir ({il} en a ${energie}).${recharge != null ? ` Recharge complète dans ${dureeLisible(recharge)}.` : ''} Chaque tâche terminée lui en redonne.`,
          )
        : null;

  const envoyer = () => {
    dispatch(exploration ? { type: 'EXPLORER_LA_VILLE' } : { type: 'LANCER_MISSION', id: mission.id });
  };

  return (
    <Ecran defilant bas={<Bouton titre={`Envoyer ${nom}`} onPress={envoyer} desactive={!!empechement} />}>
      <Fermer onPress={fermer} />
      <View style={styles.centre}>
        <Compagnon espece={etat.compagnon.espece} pose="aventure" taille={160} promenade equipe={etat.equipe} />
        <Titre style={styles.texteCentre}>{titreMission(etat, mission)}</Titre>
      </View>
      <View style={styles.carte}>
        <Text style={styles.lieu}>
          {iconeMission(mission)} {mission.lieu}
        </Text>
        <Text style={styles.recit}>{presentationMission(etat, mission)}</Text>
        <View style={styles.infos}>
          <Info icone="time-outline" texte={`${DUREES_MINUTES[mission.type]} min`} />
          <Info icone="flash-outline" texte={`${cout} énergie`} />
          <Info icone="ellipse-outline" texte={`+${PIECES_MISSION[mission.type]} pièces`} />
        </View>
      </View>
      {empechement && <Texte style={styles.texteCentre}>{empechement}</Texte>}
    </Ecran>
  );
}

function Info({ icone, texte }: { icone: keyof typeof Ionicons.glyphMap; texte: string }) {
  return (
    <View style={styles.info}>
      <Ionicons name={icone} size={15} color={couleurs.saugeFonce} />
      <Text style={styles.infoTexte}>{texte}</Text>
    </View>
  );
}

function Fermer({ onPress, flottant }: { onPress: () => void; flottant?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Fermer" style={flottant ? styles.fermerFlottant : styles.fermer} hitSlop={12}>
      <Ionicons name="close" size={26} color={couleurs.brun} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centre: { alignItems: 'center', justifyContent: 'center', gap: espace.m },
  texteCentre: { textAlign: 'center' },
  fermer: { alignSelf: 'flex-end' },
  fermerFlottant: { position: 'absolute', top: espace.s, right: espace.l },
  icone: { fontSize: 64 },
  carte: {
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.l,
    padding: espace.l,
    gap: espace.s,
    ...ombre,
  },
  lieu: { fontWeight: '800', color: couleurs.renardFonce, fontSize: 14 },
  recit: {
    fontSize: 16,
    lineHeight: 23,
    color: couleurs.brun,
    fontWeight: '600',
  },
  infos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espace.s,
    marginTop: espace.s,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: couleurs.saugeClair,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  infoTexte: { fontWeight: '800', color: couleurs.saugeFonce, fontSize: 12.5 },
  pastille: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: couleurs.carte,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...ombre,
  },
  pastilleTexte: { fontWeight: '800', color: couleurs.brun },
  recompense: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.s,
    borderTopWidth: 1,
    borderTopColor: couleurs.ligne,
    borderStyle: 'dashed',
    paddingTop: espace.m,
    marginTop: espace.s,
  },
  recompenseTexte: { flex: 1, fontWeight: '800', color: '#9A6400' },
});
