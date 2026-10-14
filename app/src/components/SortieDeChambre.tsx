/**
 * LE DÉPART, VU DEPUIS LA CHAMBRE (accueil)
 * Juste après l'envoi en aventure, on voit le compagnon traverser sa chambre, sac sur le dos,
 * en marchant vers la sortie, puis disparaître. Joué une seule fois, à l'arrivée sur l'accueil.
 */
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { REGARDE_A_GAUCHE, type EspeceId } from '@/config/compagnons';

import { Compagnon } from './Compagnon';

const DUREE = 3200;

export function SortieDeChambre({
  espece,
  equipe,
  objet,
  largeur,
  taille,
  onFin,
}: {
  espece: EspeceId;
  equipe?: string[];
  objet: string;
  largeur: number;
  taille: number;
  /** Appelé quand il est sorti (pour ne pas rejouer le départ). */
  onFin?: () => void;
}) {
  const avance = useSharedValue(0);
  const pas = useSharedValue(0);
  // Toujours la dernière version de onFin, sans relancer l'animation à chaque rafraîchissement de l'accueil
  const fin = useRef(onFin);
  useEffect(() => {
    fin.current = onFin;
  }, [onFin]);

  useEffect(() => {
    avance.set(withTiming(1, { duration: DUREE, easing: Easing.in(Easing.quad) }));
    pas.set(withRepeat(withTiming(1, { duration: 300, easing: Easing.inOut(Easing.quad) }), -1, true));
    const minuterie = setTimeout(() => fin.current?.(), DUREE + 100);
    return () => clearTimeout(minuterie);
  }, [avance, pas]);

  // Il part du milieu de la chambre et sort par la droite, en regardant là où il va
  const retourner = REGARDE_A_GAUCHE.includes(espece);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - Math.max(0, avance.get() - 0.85) / 0.15,
    transform: [{ translateX: avance.get() * (largeur / 2 + taille) }, { translateY: -pas.get() * 6 }, { scaleX: retourner ? -1 : 1 }],
  }));

  return (
    <View style={styles.sol} pointerEvents="none">
      <Animated.View style={[{ alignItems: 'center' }, style]}>
        <Text style={styles.objet}>{objet}</Text>
        <Compagnon espece={espece} pose="aventure" taille={taille} equipe={equipe} vivant={false} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  sol: { position: 'absolute', left: 0, right: 0, bottom: 22, alignItems: 'center' },
  objet: { position: 'absolute', top: 0, right: -4, fontSize: 22, zIndex: 1 },
});
