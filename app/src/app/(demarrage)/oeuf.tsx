/**
 * ONBOARDING 4/6 — La naissance du compagnon
 * 1. L'œuf apparaît. 2. L'utilisateur le touche. 3. Il se fissure (une étape par toucher).
 * 4. Il se casse. 5. L'animal apparaît. 6. Il fait coucou. 7. On passe à son prénom.
 *
 * Chaque étape affiche une image du registre (src/assets/registre.ts). Pour passer aux
 * animations définitives, on remplacera ces images par les animations, étape par étape.
 */
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { imageEclosion, imageNaissance, imagesOeuf } from '@/illustrations/registre';
import { Bouton, Ecran, Texte, Titre } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { EnteteEtape } from '@/components/EnteteEtape';
import { compagnonParId } from '@/config/compagnons';
import { couleurs, espace } from '@/config/theme';
import { useApp } from '@/store/etat';

/** Nombre de touchers avant l'éclosion (= nombre d'images d'œuf). */
const TOUCHERS = imagesOeuf().length;

type Phase = 'oeuf' | 'eclosion' | 'ne';

const vibrer = (style: Haptics.ImpactFeedbackStyle) => {
  if (Platform.OS !== 'web') Haptics.impactAsync(style).catch(() => {});
};

export default function Oeuf() {
  const { etat } = useApp();
  const espece = etat.compagnon?.espece ?? 'renard';
  const infos = compagnonParId(espece);

  const [touchers, setTouchers] = useState(0);
  const [phase, setPhase] = useState<Phase>('oeuf');

  const rotation = useSharedValue(0);
  const echelle = useSharedValue(0.6);
  const flottement = useSharedValue(0);

  // L'œuf apparaît puis flotte doucement pour inviter à le toucher
  useEffect(() => {
    echelle.set(withSpring(1, { damping: 9 }));
    flottement.set(withRepeat(withTiming(-8, { duration: 1400, easing: Easing.inOut(Easing.quad) }), -1, true));
  }, [echelle, flottement]);

  // L'œuf tremble légèrement de temps en temps, de plus en plus fort à chaque fissure
  useEffect(() => {
    if (phase !== 'oeuf') return;
    const force = 3 + touchers * 2;
    const minuterie = setInterval(() => {
      rotation.set(
        withSequence(
          withTiming(-force, { duration: 80 }),
          withTiming(force, { duration: 110 }),
          withTiming(-force / 2, { duration: 90 }),
          withTiming(0, { duration: 80 }),
        ),
      );
    }, 2200);
    return () => clearInterval(minuterie);
  }, [phase, touchers, rotation]);

  function toucher() {
    if (phase !== 'oeuf') return;
    const suivant = touchers + 1;
    rotation.set(withSequence(
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 90 }),
      withTiming(-5, { duration: 80 }),
      withTiming(0, { duration: 70 }),
    ));
    vibrer(suivant >= TOUCHERS ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light);

    if (suivant < TOUCHERS) {
      setTouchers(suivant);
      return;
    }
    // Dernier toucher : l'œuf se casse, puis l'animal apparaît
    setPhase('eclosion');
    echelle.set(withSequence(withTiming(1.12, { duration: 160 }), withSpring(1, { damping: 7 })));
    setTimeout(() => {
      setPhase('ne');
      echelle.set(0.5);
      echelle.set(withSpring(1, { damping: 6, stiffness: 140 }));
      vibrer(Haptics.ImpactFeedbackStyle.Medium);
    }, 1100);
  }

  const anime = useAnimatedStyle(() => ({
    transform: [{ translateY: flottement.value }, { rotate: `${rotation.value}deg` }, { scale: echelle.value }],
  }));

  const imageOeuf = imagesOeuf()[Math.min(touchers, TOUCHERS - 1)];
  const eclosion = imageEclosion(espece);
  const naissance = imageNaissance(espece);

  const messages: Record<Phase, string> = {
    oeuf: touchers === 0 ? 'Touche l’œuf pour l’aider à éclore' : touchers === 1 ? 'Il bouge… encore !' : 'Presque…',
    eclosion: 'Il arrive !',
    ne: `Coucou ! Voici ${infos.espece}.`,
  };

  return (
    <Ecran
      fond={phase === 'ne' ? couleurs.pecheClair : couleurs.creme}
      bas={
        phase === 'ne' ? (
          <Bouton titre="Lui donner un prénom" onPress={() => router.replace('/nom-compagnon')} />
        ) : (
          <View style={{ height: 54 }} />
        )
      }>
      <EnteteEtape etape={4} retour={phase === 'oeuf' && touchers === 0} />
      <View style={{ gap: espace.s }}>
        <Titre style={{ textAlign: 'center' }}>{phase === 'ne' ? 'Bienvenue !' : 'Ton œuf'}</Titre>
        <Texte style={{ textAlign: 'center' }}>{messages[phase]}</Texte>
      </View>

      <Pressable
        onPress={toucher}
        disabled={phase !== 'oeuf'}
        accessibilityRole="button"
        accessibilityLabel="Toucher l’œuf"
        style={styles.zone}>
        {phase === 'ne' && <Etincelles />}
        <Animated.View style={[styles.visuel, anime]}>
          {phase === 'oeuf' && <Image source={imageOeuf} style={styles.image} contentFit="contain" />}
          {phase === 'eclosion' &&
            (eclosion ? (
              <Image source={eclosion} style={styles.image} contentFit="contain" />
            ) : (
              <Image source={imagesOeuf()[TOUCHERS - 1]} style={styles.image} contentFit="contain" />
            ))}
          {phase === 'ne' &&
            (naissance ? (
              <Image source={naissance} style={styles.image} contentFit="contain" />
            ) : (
              <Compagnon espece={espece} pose="salut" taille={220} />
            ))}
        </Animated.View>
      </Pressable>

      {phase === 'oeuf' && (
        <View style={styles.compteur}>
          {Array.from({ length: TOUCHERS }, (_, i) => (
            <View key={i} style={[styles.coche, i < touchers && { backgroundColor: couleurs.saumon }]} />
          ))}
        </View>
      )}
    </Ecran>
  );
}

/** Petites étincelles autour de l'animal à sa naissance. */
function Etincelles() {
  const o = useSharedValue(0);
  useEffect(() => {
    o.set(withRepeat(withTiming(1, { duration: 900 }), -1, true));
  }, [o]);
  const style = useAnimatedStyle(() => ({ opacity: 0.4 + o.value * 0.6, transform: [{ scale: 0.9 + o.value * 0.2 }] }));
  const positions = [
    { top: '12%', left: '14%' },
    { top: '8%', right: '18%' },
    { top: '40%', left: '6%' },
    { top: '36%', right: '8%' },
    { bottom: '18%', left: '18%' },
    { bottom: '22%', right: '14%' },
  ] as const;
  return (
    <>
      {positions.map((p, i) => (
        <Animated.Text key={i} style={[styles.etincelle, p, style]}>
          ✦
        </Animated.Text>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  zone: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  visuel: { width: 240, height: 300, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  compteur: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  coche: { width: 10, height: 10, borderRadius: 5, backgroundColor: couleurs.ligne },
  etincelle: { position: 'absolute', fontSize: 22, color: couleurs.or },
});
