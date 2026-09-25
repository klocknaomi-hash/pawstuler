/**
 * PETITS EFFETS AUTOUR DU COMPAGNON
 *  - Câlin : quelques cœurs s'envolent doucement.
 *  - Jeu : un ballon arrive, rebondit à côté de lui et repart en roulant.
 * Chaque effet se joue une fois puis disparaît ; il suffit de changer la `key` pour le rejouer.
 */
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';

import { couleurs } from '@/config/theme';

/* ---------- Cœurs du câlin ---------- */

const COEURS = [
  { x: -46, delai: 0, taille: 22 },
  { x: 38, delai: 140, taille: 18 },
  { x: -12, delai: 280, taille: 26 },
  { x: 58, delai: 420, taille: 16 },
  { x: -64, delai: 560, taille: 18 },
];

export function CoeursCalin() {
  return (
    <View pointerEvents="none" style={styles.zone}>
      {COEURS.map((c, i) => (
        <Coeur key={i} {...c} />
      ))}
    </View>
  );
}

function Coeur({ x, delai, taille }: { x: number; delai: number; taille: number }) {
  const monte = useSharedValue(0);
  const opacite = useSharedValue(0);
  useEffect(() => {
    monte.set(withDelay(delai, withTiming(-120, { duration: 1400, easing: Easing.out(Easing.quad) })));
    opacite.set(withDelay(delai, withSequence(withTiming(1, { duration: 200 }), withDelay(700, withTiming(0, { duration: 500 })))));
  }, [delai, monte, opacite]);
  const anime = useAnimatedStyle(() => ({
    opacity: opacite.value,
    transform: [{ translateX: x + Math.sin(monte.value / 25) * 6 }, { translateY: monte.value }, { scale: 0.7 + opacite.value * 0.3 }],
  }));
  return <Animated.Text style={[styles.coeur, { fontSize: taille }, anime]}>❤️</Animated.Text>;
}

/* ---------- Ballon du jeu ---------- */

export function BallonJeu() {
  const x = useSharedValue(-150);
  const y = useSharedValue(-60);
  const tour = useSharedValue(0);
  const opacite = useSharedValue(1);

  useEffect(() => {
    const rebond = (haut: number, duree: number) =>
      withSequence(withTiming(-haut, { duration: duree, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: duree, easing: Easing.in(Easing.quad) }));
    // Il arrive par la gauche, rebondit trois fois de plus en plus bas, puis roule hors de l'écran
    x.set(withSequence(withTiming(70, { duration: 1300, easing: Easing.out(Easing.cubic) }), withTiming(240, { duration: 800, easing: Easing.in(Easing.quad) })));
    y.set(withSequence(withTiming(0, { duration: 260, easing: Easing.in(Easing.quad) }), rebond(70, 260), rebond(40, 200), rebond(16, 150)));
    tour.set(withTiming(900, { duration: 2100, easing: Easing.linear }));
    opacite.set(withDelay(1800, withTiming(0, { duration: 300 })));
  }, [x, y, tour, opacite]);

  const anime = useAnimatedStyle(() => ({
    opacity: opacite.value,
    transform: [{ translateX: x.value }, { translateY: y.value }, { rotate: `${tour.value}deg` }],
  }));

  return (
    <View pointerEvents="none" style={styles.zone}>
      <Animated.View style={[styles.ballon, anime]}>
        <View style={[styles.quartier, { top: 0, left: 0, backgroundColor: couleurs.saumon }]} />
        <View style={[styles.quartier, { bottom: 0, right: 0, backgroundColor: couleurs.lac }]} />
        <View style={styles.reflet} />
      </Animated.View>
    </View>
  );
}

/** Petits « zzz » quand on essaie de réveiller un compagnon qui dort. */
export function Zzz() {
  return (
    <View pointerEvents="none" style={styles.zone}>
      <Text style={styles.zzz}>z z z</Text>
    </View>
  );
}

const TAILLE_BALLON = 30;

const styles = StyleSheet.create({
  zone: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 170, alignItems: 'center', justifyContent: 'flex-end' },
  coeur: { position: 'absolute', bottom: 110 },
  ballon: {
    position: 'absolute',
    bottom: 4,
    width: TAILLE_BALLON,
    height: TAILLE_BALLON,
    borderRadius: TAILLE_BALLON / 2,
    backgroundColor: couleurs.blanc,
    borderWidth: 2,
    borderColor: couleurs.brun,
    overflow: 'hidden',
  },
  quartier: { position: 'absolute', width: TAILLE_BALLON / 2, height: TAILLE_BALLON / 2 },
  reflet: { position: 'absolute', top: 4, left: 7, width: 7, height: 4, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.8)' },
  zzz: { position: 'absolute', bottom: 150, fontSize: 18, fontWeight: '800', color: couleurs.brunDoux },
});
