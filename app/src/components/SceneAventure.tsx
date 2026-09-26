/**
 * LA SCÈNE DE L'AVENTURE, EN TEMPS RÉEL
 * De petites animations simples qui racontent ce que fait Milo, sans texte permanent :
 *  - recherche / dépôt de CV : il marche dans la rue avec son sac (et son CV à la main), entre dans le lieu, puis repart ;
 *  - relance : il sort son téléphone, appelle (l'appel sonne, on attend), puis range son téléphone ;
 *  - refus : il lit un message, est déçu quelques secondes, puis reprend son chemin vers la maison ;
 *  - entretien : il marche jusqu'à l'entreprise (dans sa tenue d'entretien s'il en a une), entre,
 *    on le voit à l'intérieur face au recruteur, puis il ressort ;
 *  - repos / baignade : il rentre à la maison ou va au lac.
 * Le temps est réel : aller (20 %), sur place (60 %), retour (20 %). App fermée puis rouverte :
 * il reprend exactement où il en est. Les animations définitives (Dimini) remplaceront ce composant.
 */
import { Image, type ImageProps } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { Compagnon } from '@/components/Compagnon';
import type { EspeceId, Pose } from '@/config/compagnons';
import { ANIMATION_SUR_PLACE, OBJET_EMPORTE } from '@/config/missions';
import { arrondis, couleurs, ombre } from '@/config/theme';
import { iconeMission } from '@/logique/missions';
import type { Mission } from '@/store/types';

export type PhaseTrajet = 'aller' | 'sur-place' | 'retour' | 'rentre';

/** Part de l'aventure passée sur le chemin, à l'aller comme au retour. */
const PART_ROUTE = 0.2;

/** Où en est le compagnon, et quand commence l'étape suivante. */
export function phaseTrajet(m: Mission, maintenant: number): { phase: PhaseTrajet; debut: number; fin: number } {
  const depart = m.depart ?? maintenant;
  const retour = m.retour ?? maintenant;
  const route = (retour - depart) * PART_ROUTE;
  if (maintenant >= retour) return { phase: 'rentre', debut: retour, fin: retour };
  if (maintenant < depart + route) return { phase: 'aller', debut: depart, fin: depart + route };
  if (maintenant < retour - route) return { phase: 'sur-place', debut: depart + route, fin: retour - route };
  return { phase: 'retour', debut: retour - route, fin: retour };
}

/** Aventures « au téléphone » : il ne se déplace pas, il appelle ou lit un message. */
const auTelephone = (m: Mission) => m.type === 'relance' || m.type === 'refus';

export function SceneAventure({
  mission,
  espece,
  equipe,
  decor,
  hauteur = 220,
  taille = 80,
}: {
  mission: Mission;
  espece: EspeceId;
  equipe?: string[];
  /** Décor illustré (rue, lac…) ; sans décor, la scène se pose sur l'image déjà affichée derrière. */
  decor?: ImageProps['source'];
  hauteur?: number;
  taille?: number;
}) {
  // L'heure est relue à chaque changement d'étape (le mouvement entre les deux est animé en continu)
  const [maintenant, setMaintenant] = useState(() => Date.now());
  const [largeur, setLargeur] = useState(0);
  const { phase, debut, fin } = phaseTrajet(mission, maintenant);
  // Deux temps pendant qu'il est sur place (refus : il lit, puis il est déçu)
  const milieu = debut + (fin - debut) / 2;
  const secondTemps = phase === 'sur-place' && maintenant >= milieu;

  useEffect(() => {
    if (phase === 'rentre') return;
    const prochain = phase === 'sur-place' && !secondTemps ? milieu : fin;
    const minuterie = setTimeout(() => setMaintenant(Date.now()), Math.max(50, prochain - Date.now() + 50));
    return () => clearTimeout(minuterie);
  }, [phase, fin, milieu, secondTemps]);

  // Tenue : pour son entretien, il porte sa tenue d'entretien s'il en a une
  const tenue = mission.type === 'entretien' && mission.tenue ? [mission.tenue] : equipe;

  return (
    <View style={[styles.scene, { height: hauteur }]} onLayout={(e: LayoutChangeEvent) => setLargeur(e.nativeEvent.layout.width)}>
      {decor ? <Image source={decor} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
      {auTelephone(mission) ? (
        <Telephone mission={mission} espece={espece} equipe={tenue} phase={phase} secondTemps={secondTemps} taille={taille} largeur={largeur} />
      ) : (
        <Marche
          mission={mission}
          espece={espece}
          equipe={tenue}
          phase={phase}
          debut={debut}
          fin={fin}
          taille={taille}
          largeur={largeur}
        />
      )}
    </View>
  );
}

/* ---------- Il marche jusqu'au lieu, entre, puis revient ---------- */

function Marche({
  mission,
  espece,
  equipe,
  phase,
  debut,
  fin,
  taille,
  largeur,
}: {
  mission: Mission;
  espece: EspeceId;
  equipe?: string[];
  phase: PhaseTrajet;
  debut: number;
  fin: number;
  taille: number;
  largeur: number;
}) {
  // Position sur le chemin : 0 = maison, 1 = lieu de l'aventure
  const position = useSharedValue(phase === 'aller' || phase === 'rentre' ? 0 : 1);
  const visible = useSharedValue(phase === 'sur-place' ? 0 : 1);
  const pas = useSharedValue(0);

  useEffect(() => {
    const t = Date.now();
    const avance = fin > debut ? Math.min(1, Math.max(0, (t - debut) / (fin - debut))) : 1;
    const reste = Math.max(0, fin - t);
    const lineaire = { easing: Easing.linear };
    if (phase === 'aller') {
      position.set(avance);
      position.set(withTiming(1, { duration: reste, ...lineaire }));
      visible.set(withTiming(1, { duration: 300 }));
    } else if (phase === 'sur-place') {
      // Il arrive, entre… et disparaît à l'intérieur
      position.set(1);
      visible.set(withTiming(0, { duration: 700 }));
    } else if (phase === 'retour') {
      position.set(1 - avance);
      position.set(withTiming(0, { duration: reste, ...lineaire }));
      visible.set(withTiming(1, { duration: 500 }));
    } else {
      position.set(withTiming(0, { duration: 400 }));
      visible.set(withTiming(1, { duration: 400 }));
    }
  }, [phase, debut, fin, position, visible]);

  // Petits pas : il sautille en marchant
  useEffect(() => {
    pas.set(withRepeat(withTiming(1, { duration: 320, easing: Easing.inOut(Easing.quad) }), -1, true));
  }, [pas]);

  const enChemin = phase === 'aller' || phase === 'retour';
  const course = Math.max(0, largeur - taille - 24);
  const styleCompagnon = useAnimatedStyle(() => ({
    opacity: visible.get(),
    transform: [
      { translateX: 12 + position.get() * course },
      { translateY: enChemin ? -pas.get() * 5 : 0 },
      // Au retour, il regarde vers la maison
      { scaleX: phase === 'retour' ? -1 : 1 },
    ],
  }));

  const depuis = mission.type === 'repos' ? '🌳' : '🏠';
  const arrivee = mission.type === 'entretien' || mission.type === 'travail' ? '🏢' : iconeMission(mission);
  const interieur = phase === 'sur-place' && (mission.type === 'entretien' || mission.type === 'travail');

  return (
    <>
      <View style={styles.chemin} />
      <Text style={[styles.borne, styles.gauche]}>{depuis}</Text>
      <View style={[styles.droite, styles.destination]}>
        {phase === 'sur-place' && !interieur && ANIMATION_SUR_PLACE[mission.type].map((e, i) => <EffetSurPlace key={e} emoji={e} delai={i * 900} />)}
        <Text style={styles.borneGrande}>{arrivee}</Text>
      </View>
      <Animated.View style={[styles.compagnon, { width: taille }, styleCompagnon]}>
        {enChemin && <Text style={styles.objet}>{OBJET_EMPORTE[mission.type]}</Text>}
        <Compagnon espece={espece} pose="aventure" taille={taille} equipe={equipe} />
      </Animated.View>
      {interieur && <Interieur espece={espece} equipe={equipe} taille={taille} travail={mission.type === 'travail'} />}
    </>
  );
}

/** À l'intérieur de l'entreprise : Milo face au recruteur, la conversation avance. */
function Interieur({ espece, equipe, taille, travail }: { espece: EspeceId; equipe?: string[]; taille: number; travail: boolean }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withRepeat(withTiming(1, { duration: 1400 }), -1, true));
  }, [t]);
  const bulle = useAnimatedStyle(() => ({ opacity: 0.4 + t.get() * 0.6, transform: [{ scale: 0.9 + t.get() * 0.15 }] }));
  return (
    <View style={styles.interieur}>
      <Text style={[styles.decorInterieur, styles.decorGauche]}>🪴</Text>
      <Text style={[styles.decorInterieur, styles.decorDroite]}>🖼️</Text>
      <View style={styles.bureau}>
        <Compagnon espece={espece} pose="neutre" taille={taille * 0.85} equipe={equipe} vivant />
        <Animated.Text style={[styles.bulleInterieur, bulle]}>💬</Animated.Text>
        <Text style={styles.recruteur}>{travail ? '👩‍💻' : '🧑‍💼'}</Text>
      </View>
      <View style={styles.table} />
    </View>
  );
}

/* ---------- Au téléphone : relance, ou réponse à une candidature ---------- */

function Telephone({
  mission,
  espece,
  equipe,
  phase,
  secondTemps,
  taille,
  largeur,
}: {
  mission: Mission;
  espece: EspeceId;
  equipe?: string[];
  phase: PhaseTrajet;
  secondTemps: boolean;
  taille: number;
  largeur: number;
}) {
  const refus = mission.type === 'refus';
  const telephone = useSharedValue(phase === 'aller' ? 0 : 1);
  const onde = useSharedValue(0);
  const x = useSharedValue(0);

  useEffect(() => {
    // Il sort son téléphone, puis le range et repart (vers la maison) au retour
    telephone.set(withTiming(phase === 'retour' || phase === 'rentre' ? 0 : 1, { duration: 600 }));
    x.set(phase === 'retour' ? withTiming(-1, { duration: 2500, easing: Easing.inOut(Easing.quad) }) : withTiming(0, { duration: 400 }));
  }, [phase, telephone, x]);

  useEffect(() => {
    onde.set(withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(0, { duration: 0 })), -1, false));
  }, [onde]);

  const styleTelephone = useAnimatedStyle(() => ({ opacity: telephone.get(), transform: [{ scale: 0.5 + telephone.get() * 0.5 }, { rotate: `${-15 + telephone.get() * 15}deg` }] }));
  const styleOnde = useAnimatedStyle(() => ({ opacity: 1 - onde.get(), transform: [{ scale: 0.8 + onde.get() * 0.8 }] }));
  const styleCompagnon = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() * (largeur / 2) }, { scaleX: x.get() < -0.05 ? -1 : 1 }] }));

  // Pose : il lit (neutre), il est déçu (réconfort), il se reprend (content)
  let pose: Pose = 'neutre';
  if (refus && phase === 'sur-place' && secondTemps) pose = 'reconfort';
  if (!refus && phase === 'sur-place' && secondTemps) pose = 'content';
  if (phase === 'retour' || phase === 'rentre') pose = refus ? 'neutre' : 'content';

  const sonne = !refus && phase === 'sur-place' && !secondTemps;
  const bulle = refus ? (phase === 'sur-place' ? (secondTemps ? '💧' : '📩') : phase === 'retour' ? '🌱' : '') : phase === 'sur-place' ? (secondTemps ? '💬' : '…') : '';

  return (
    <View style={styles.centreTelephone}>
      <Animated.View style={[{ alignItems: 'center' }, styleCompagnon]}>
        {bulle ? (
          <View style={styles.bulleTelephone}>
            <Text style={styles.bulleTexte}>{bulle}</Text>
          </View>
        ) : null}
        <Compagnon espece={espece} pose={pose} taille={taille * 1.2} equipe={equipe} />
        <Animated.View style={[styles.telephone, styleTelephone]}>
          {sonne && <Animated.Text style={[styles.onde, styleOnde]}>📞</Animated.Text>}
          <Text style={styles.telephoneEmoji}>📱</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

/** Un petit emoji qui s'envole au-dessus du lieu, en boucle (une animation par type d'aventure). */
function EffetSurPlace({ emoji, delai }: { emoji: string; delai: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(delai, withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }), -1, false)));
  }, [t, delai]);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - t.get(),
    transform: [{ translateY: -t.get() * 30 }, { translateX: (delai ? 10 : -10) * t.get() }, { scale: 0.8 + t.get() * 0.4 }],
  }));
  return <Animated.Text style={[styles.effet, style]}>{emoji}</Animated.Text>;
}

const styles = StyleSheet.create({
  scene: { width: '100%', overflow: 'hidden', borderRadius: arrondis.l },
  chemin: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 16,
    height: 8,
    borderRadius: arrondis.s,
    backgroundColor: 'rgba(255, 247, 235, 0.85)',
  },
  borne: { fontSize: 32 },
  borneGrande: { fontSize: 44 },
  gauche: { position: 'absolute', left: 6, bottom: 8 },
  droite: { position: 'absolute', right: 6, bottom: 8 },
  destination: { alignItems: 'center' },
  effet: { position: 'absolute', top: -28, fontSize: 22 },
  compagnon: { position: 'absolute', left: 0, bottom: 12, alignItems: 'center' },
  objet: { position: 'absolute', top: 0, right: -6, fontSize: 20, zIndex: 1 },
  interieur: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 14,
    bottom: 14,
    borderRadius: arrondis.l,
    backgroundColor: '#FBEFE0',
    borderWidth: 3,
    borderColor: couleurs.carte,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    ...ombre,
  },
  decorInterieur: { position: 'absolute', top: 10, fontSize: 26 },
  decorGauche: { left: 12 },
  decorDroite: { right: 14 },
  bureau: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 6, paddingBottom: 14 },
  bulleInterieur: { fontSize: 24, marginBottom: 40 },
  recruteur: { fontSize: 46 },
  table: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 16, backgroundColor: '#D9B48C' },
  centreTelephone: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 10 },
  telephone: { position: 'absolute', right: -14, bottom: 26, alignItems: 'center' },
  telephoneEmoji: { fontSize: 30 },
  onde: { position: 'absolute', top: -26, fontSize: 20 },
  bulleTelephone: { backgroundColor: couleurs.carte, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 4, ...ombre },
  bulleTexte: { fontSize: 20 },
});
