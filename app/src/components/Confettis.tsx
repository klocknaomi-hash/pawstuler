/** Pluie de confettis pour les grandes victoires. */
import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

const COULEURS = ['#FF4F5E', '#F2906B', '#A9C68E', '#8EC5D6', '#F4C23F', '#B9AEDC'];

function Confetti({ i, largeur, hauteur }: { i: number; largeur: number; hauteur: number }) {
  const chute = useSharedValue(0);
  useEffect(() => {
    chute.set(withDelay((i % 7) * 180, withRepeat(withTiming(1, { duration: 2600 + (i % 5) * 400, easing: Easing.linear }), -1)));
  }, [chute, i]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -30 + chute.value * (hauteur + 60) }, { rotate: `${chute.value * 540}deg` }],
  }));
  return (
    <Animated.View
      style={[
        styles.confetti,
        { left: ((i * 37) % 100) * (largeur / 100), backgroundColor: COULEURS[i % COULEURS.length] },
        style,
      ]}
    />
  );
}

export function Confettis({ nombre = 32 }: { nombre?: number }) {
  const { width, height } = useWindowDimensions();
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: nombre }, (_, i) => (
        <Confetti key={i} i={i} largeur={width} hauteur={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  confetti: { position: 'absolute', top: 0, width: 9, height: 14, borderRadius: 3 },
});
