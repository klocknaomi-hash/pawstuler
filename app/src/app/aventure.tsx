/**
 * L'AVENTURE DU JOUR DE MILO
 * Un seul écran pour toute la vie d'une aventure, en temps réel :
 *  1. Présentation : ce que Milo va faire (choisi d'après ton parcours à cet instant), durée, énergie.
 *     Si ce n'est pas possible maintenant, on dit simplement pourquoi (il dort, nouvelle aventure demain,
 *     prochaine aventure à 14 h 43 en Premium, son entretien est à 11 h 30, pas assez d'énergie).
 *  2. Départ : il s'en va avec ce qu'il emporte.
 *  3. Pendant : la scène animée raconte ce qu'il fait (rue, téléphone, entretien…), « Retour à 11 h 05 ».
 *  4. Retour : d'abord son récit et sa récompense, puis, plus discret, quand il pourra repartir.
 * Une aventure lancée ne change plus, même si tu mets une candidature à jour pendant ce temps.
 * Ouverture : `/aventure` (l'aventure du jour) ou `/aventure?moment=repos|baignade` (moment pour souffler).
 */
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, SlideInLeft, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

import { Bouton, Ecran, Texte, Titre } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { IconePiece } from '@/components/Pieces';
import { SceneAventure } from '@/components/SceneAventure';
import { objetParId } from '@/config/boutique';
import { accorder, type EspeceId } from '@/config/compagnons';
import { AVENTURES_PAR_JOUR } from '@/config/energie';
import { BOUTON_DEPART, COUTS_MISSION, DUREES_MINUTES, HEURES_ENTRE_AVENTURES_PREMIUM, MOMENTS, OBJET_EMPORTE, PIECES_MISSION, type TypeMoment } from '@/config/missions';
import { arrondis, couleurs, espace, ombre } from '@/config/theme';
import { useMaintenant } from '@/hooks/useMaintenant';
import { imageVille } from '@/illustrations/registre';
import { dureeLisible, energieDisponible, tempsAvantRecharge } from '@/logique/energie';
import {
  aventureDuJour,
  compagnonAbsent,
  dureeMission,
  estUnMoment,
  heureLisible,
  iconeMission,
  missionEnCours,
  momentDuCompagnon,
  ouEst,
  presentationMission,
  prochainDepart,
  remplir,
  titreMission,
} from '@/logique/missions';
import { estEndormi } from '@/logique/rythme';
import { aPremium } from '@/services/abonnement';
import { gainPlafonne, useApp } from '@/store/etat';
import type { EtatApp, Mission } from '@/store/types';

/** Le décor de la scène : la rue pour les aventures en ville, le lac pour souffler, un coin calme pour téléphoner. */
function decorDe(etat: EtatApp, m: Mission) {
  const ville = etat.villeId ?? 'clairebourg';
  if (m.type === 'repos' || m.type === 'baignade') return imageVille(ville, 'portrait');
  if (m.type === 'relance' || m.type === 'refus') return imageVille(ville, 'paysage');
  return imageVille(ville, 'centre');
}

export default function Aventure() {
  const { moment } = useLocalSearchParams<{ moment?: string }>();
  const { etat, dispatch } = useApp();
  const maintenant = useMaintenant();
  // Le récit découvert sur cet écran (et les pièces réellement gagnées, plafond compris)
  const [decouvert, setDecouvert] = useState<{ id: string; pieces: number } | null>(null);
  // Moment pour souffler demandé depuis l'accueil (figé à l'ouverture)
  const [momentChoisi] = useState<Mission | null>(() =>
    MOMENTS.includes(moment as TypeMoment) ? momentDuCompagnon(etat, moment as TypeMoment) : null,
  );
  // Animation de départ en cours (il s'en va avec ce qu'il emporte)
  const [partant, setPartant] = useState<Mission | null>(null);
  useEffect(() => {
    if (!partant) return;
    const minuterie = setTimeout(() => setPartant(null), 2600);
    return () => clearTimeout(minuterie);
  }, [partant]);

  if (!etat.compagnon || !etat.villeId) return null;
  const compagnon = etat.compagnon;
  const nom = compagnon.nom;
  const fermer = () => router.back();
  const accord = (texte: string) => accorder(texte, compagnon.pronoms);

  const enCours = missionEnCours(etat);
  const vue = decouvert ? etat.missions.find((m) => m.id === decouvert.id) : undefined;

  /* 4. Retour : d'abord le récit et la récompense, puis (discret) quand il pourra repartir */
  if (vue && decouvert) {
    const depart = prochainDepart(etat, maintenant);
    const suite = estUnMoment(vue)
      ? null
      : depart === 'demain'
        ? 'Une nouvelle aventure sera possible demain.'
        : typeof depart === 'number'
          ? `Prochaine aventure possible à ${heureLisible(depart)}.`
          : 'Une autre aventure est possible aujourd’hui.';
    return (
      <Ecran defilant bas={<Bouton titre="Retour à l’accueil" onPress={fermer} />}>
        <Fermer onPress={fermer} />
        <View style={styles.centre}>
          <Compagnon
            espece={compagnon.espece}
            pose={vue.type === 'refus' ? 'reconfort' : vue.type === 'entretien' ? 'fier' : 'content'}
            taille={170}
            reaction={1}
            equipe={vue.type === 'entretien' && vue.tenue ? [vue.tenue] : etat.equipe}
          />
          <Titre style={styles.texteCentre}>{accord(`${nom} est rentré{e} !`)}</Titre>
        </View>
        <Animated.View entering={FadeIn.duration(500)} style={styles.carte}>
          <Text style={styles.lieu}>
            {iconeMission(vue)} {vue.lieu}
          </Text>
          <Text style={styles.recit}>{vue.resultat}</Text>
          <View style={styles.recompense}>
            {estUnMoment(vue) ? (
              <Text style={styles.recompenseTexte}>{accord('💛 Un moment rien que pour {lui}.')}</Text>
            ) : (
              <>
                <IconePiece taille={20} />
                <Text style={styles.recompenseTexte}>
                  {decouvert.pieces > 0 ? `+${decouvert.pieces} pièces rapportées` : 'Plafond de pièces atteint aujourd’hui, mais quelle aventure !'}
                </Text>
              </>
            )}
          </View>
        </Animated.View>
        {suite && <Text style={styles.suite}>{suite}</Text>}
        {depart === 'demain' && !estUnMoment(vue) && !aPremium(etat) && (
          <Pressable onPress={() => router.replace('/premium')} accessibilityRole="button">
            <Text style={styles.lien}>Avec Premium : jusqu’à {AVENTURES_PAR_JOUR.premium} aventures par jour</Text>
          </Pressable>
        )}
      </Ecran>
    );
  }

  /* 2. Départ : il s'en va, avec ce qu'il emporte */
  if (partant) {
    return (
      <Ecran fond={couleurs.ciel} style={styles.centre}>
        <Depart
          espece={compagnon.espece}
          equipe={partant.type === 'entretien' && partant.tenue ? [partant.tenue] : etat.equipe}
          objet={OBJET_EMPORTE[partant.type]}
        />
        <Titre style={styles.texteCentre}>{partant.type === 'repos' ? 'Bonne sieste !' : partant.type === 'entretien' ? 'Bonne chance !' : 'Bonne route !'}</Titre>
        <Texte style={styles.texteCentre}>{titreMission(etat, partant)}</Texte>
      </Ecran>
    );
  }

  /* 3. Pendant l'aventure, ou revenu avec un récit à découvrir */
  if (enCours?.retour) {
    const absent = compagnonAbsent(etat, maintenant);
    const decouvrir = () => {
      setDecouvert({ id: enCours.id, pieces: gainPlafonne(etat, PIECES_MISSION[enCours.type]) });
      dispatch({ type: 'DECOUVRIR_RESULTAT', id: enCours.id });
    };
    return (
      <Ecran
        fond={couleurs.ciel}
        style={styles.centre}
        bas={absent ? <Bouton titre="D’accord, à tout à l’heure !" onPress={fermer} /> : <Bouton titre="Découvrir son aventure" onPress={decouvrir} />}>
        <Fermer onPress={fermer} flottant />
        {absent ? (
          <>
            <SceneAventure mission={enCours} espece={compagnon.espece} equipe={etat.equipe} decor={decorDe(etat, enCours)} hauteur={300} taille={96} />
            <Titre style={styles.texteCentre}>{ouEst(etat, enCours)}</Titre>
            <View style={styles.pastille}>
              <Ionicons name="time-outline" size={18} color={couleurs.brun} />
              <Text style={styles.pastilleTexte}>
                Retour à {heureLisible(enCours.retour)} · dans {dureeLisible(Math.min(enCours.retour - maintenant, dureeMission(enCours)))}
              </Text>
            </View>
            <Texte style={styles.texteCentre}>Tu peux fermer l’app : tu seras prévenu à son retour.</Texte>
          </>
        ) : (
          <>
            {/* Retour : il arrive en courant */}
            <Animated.View entering={SlideInLeft.duration(1200)}>
              <Compagnon espece={compagnon.espece} pose="excite" taille={170} reaction={1} equipe={etat.equipe} />
            </Animated.View>
            <Titre style={styles.texteCentre}>{nom} est de retour !</Titre>
          </>
        )}
      </Ecran>
    );
  }

  /* 1. Présentation, avant le départ */
  const { mission, pasAvant } = momentChoisi ? { mission: momentChoisi, pasAvant: undefined } : aventureDuJour(etat, maintenant);
  const cout = COUTS_MISSION[mission.type];
  const energie = energieDisponible(etat, maintenant);
  const recharge = tempsAvantRecharge(etat, maintenant);
  const depart = momentChoisi ? null : prochainDepart(etat, maintenant);
  const empechement = estEndormi(etat.rythme)
    ? `${nom} dort. On verra ça à son réveil.`
    : depart === 'demain'
      ? 'Nouvelle aventure demain.'
      : typeof depart === 'number'
        ? `Prochaine aventure possible à ${heureLisible(depart)} (${HEURES_ENTRE_AVENTURES_PREMIUM} h entre deux départs).`
        : pasAvant
          ? `Son entretien est à ${heureLisible(pasAvant)} : reviens à ce moment-là pour l’encourager !`
          : energie < cout
            ? accord(
                `${nom} a besoin de ${cout} ⚡ pour partir ({il} en a ${energie}).${recharge != null ? ` Recharge complète dans ${dureeLisible(recharge)}.` : ''} Chaque tâche terminée lui en redonne.`,
              )
            : null;
  const tenue = mission.type === 'entretien' && mission.tenue ? objetParId(mission.tenue) : undefined;

  const envoyer = () => {
    if (momentChoisi) dispatch({ type: 'PRENDRE_UN_MOMENT', moment: momentChoisi.type as TypeMoment });
    else dispatch({ type: 'LANCER_AVENTURE' });
    setPartant(mission);
  };

  return (
    <Ecran defilant bas={<Bouton titre={remplir(etat, BOUTON_DEPART[mission.type])} onPress={envoyer} desactive={!!empechement} />}>
      <Fermer onPress={fermer} />
      <View style={styles.centre}>
        <Compagnon espece={compagnon.espece} pose="aventure" taille={160} promenade equipe={tenue ? [tenue.id] : etat.equipe} />
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
          {PIECES_MISSION[mission.type] > 0 && <Info icone="ellipse-outline" texte={`+${PIECES_MISSION[mission.type]} pièces`} />}
        </View>
      </View>
      {/* Entretien : sa tenue (achetée au Shop), jamais obligatoire */}
      {mission.type === 'entretien' &&
        (tenue ? (
          <Text style={styles.tenue}>👔 {accord(`{Il} portera sa tenue : ${tenue.nom}.`)}</Text>
        ) : (
          <Pressable onPress={() => router.push('/boutique')} accessibilityRole="button" style={styles.tenueManquante}>
            <Text style={styles.tenue}>{accord(`👔 ${nom} n’a pas encore de tenue d’entretien. {Il} ira dans sa tenue de tous les jours…`)}</Text>
            <Text style={styles.lien}>Voir les tenues au Shop ›</Text>
          </Pressable>
        ))}
      {empechement && <Texte style={styles.texteCentre}>{empechement}</Texte>}
    </Ecran>
  );
}

/** Le départ : il fait un petit bond, puis s'en va vers la droite avec ce qu'il emporte. */
function Depart({ espece, equipe, objet }: { espece: EspeceId; equipe?: string[]; objet: string }) {
  const x = useSharedValue(0);
  const pas = useSharedValue(0);
  useEffect(() => {
    x.set(withDelay(700, withTiming(1, { duration: 1700, easing: Easing.in(Easing.quad) })));
    pas.set(withRepeat(withTiming(1, { duration: 260 }), -1, true));
  }, [x, pas]);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - Math.max(0, x.get() - 0.7) / 0.3,
    transform: [{ translateX: x.get() * 360 }, { translateY: -pas.get() * 8 }],
  }));
  return (
    <Animated.View style={[styles.depart, style]}>
      <Text style={styles.objetDepart}>{objet}</Text>
      <Compagnon espece={espece} pose="aventure" taille={170} equipe={equipe} />
    </Animated.View>
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
  fermerFlottant: { position: 'absolute', top: espace.s, right: espace.l, zIndex: 2 },
  depart: { alignItems: 'center' },
  objetDepart: { position: 'absolute', top: 0, right: 8, fontSize: 34, zIndex: 1 },
  carte: { backgroundColor: couleurs.carte, borderRadius: arrondis.l, padding: espace.l, gap: espace.s, ...ombre },
  lieu: { fontWeight: '800', color: couleurs.renardFonce, fontSize: 14 },
  recit: { fontSize: 16, lineHeight: 23, color: couleurs.brun, fontWeight: '600' },
  infos: { flexDirection: 'row', flexWrap: 'wrap', gap: espace.s, marginTop: espace.s },
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
  suite: { textAlign: 'center', fontSize: 13.5, fontWeight: '600', color: couleurs.brunDoux },
  lien: { textAlign: 'center', fontSize: 13, fontWeight: '800', color: couleurs.renardFonce },
  tenue: { fontSize: 14, fontWeight: '700', color: couleurs.brun, lineHeight: 20 },
  tenueManquante: { backgroundColor: couleurs.pecheClair, borderRadius: arrondis.m, padding: espace.m, gap: 4 },
});
