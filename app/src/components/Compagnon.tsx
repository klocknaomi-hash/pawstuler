/**
 * LE COMPAGNON À L'ÉCRAN
 * Affiche l'animal dans une pose, et le garde « vivant » :
 *  - il respire en permanence ;
 *  - s'il peut se promener, il se déplace un peu de temps en temps ;
 *  - quand `reaction` change (tâche cochée…), il fait un petit saut.
 *
 * S'il porte une tenue complète illustrée pour son espèce (`equipe`), c'est elle qui s'affiche
 * (sauf quand il dort : on range la tenue pour la nuit).
 *
 * Aujourd'hui il utilise les images fixes du registre. Quand les animations définitives
 * (Lottie ou Rive) seront fournies, c'est ici seulement qu'on les branchera.
 */
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { imageCompagnon, imageTenue, tenuePortee } from '@/illustrations/registre';
import { compagnonParId, type EspeceId, type Pose } from '@/config/compagnons';

export function Compagnon({
  espece,
  pose = 'neutre',
  taille = 160,
  vivant = true,
  promenade = false,
  reaction = 0,
  equipe,
  style,
}: {
  espece: EspeceId;
  pose?: Pose;
  taille?: number;
  /** Respiration permanente. */
  vivant?: boolean;
  /** Se déplace doucement de gauche à droite. */
  promenade?: boolean;
  /** Changer ce nombre déclenche un saut de joie. */
  reaction?: number;
  /** Objets portés (état de l'app) : affiche la tenue complète s'il en porte une. */
  equipe?: string[];
  style?: StyleProp<ViewStyle>;
}) {
  const souffle = useSharedValue(1);
  const saut = useSharedValue(0);
  const position = useSharedValue(0);
  const regard = useSharedValue(1); // 1 = regarde à droite, -1 = à gauche

  // Respiration
  useEffect(() => {
    if (!vivant) return;
    souffle.set(withRepeat(
      withTiming(pose === 'dort' ? 1.035 : 1.02, { duration: pose === 'dort' ? 2200 : 1600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    ));
  }, [vivant, pose, souffle]);

  // Promenade : un petit pas toutes les 4 à 7 secondes
  useEffect(() => {
    if (!promenade || pose === 'dort') {
      position.set(withTiming(0, { duration: 600 }));
      return;
    }
    let minuterie: ReturnType<typeof setTimeout>;
    const pas = () => {
      const cible = (Math.random() - 0.5) * taille * 0.9;
      regard.set(cible >= position.get() ? 1 : -1);
      position.set(withTiming(cible, { duration: 1400, easing: Easing.inOut(Easing.cubic) }));
      minuterie = setTimeout(pas, 4000 + Math.random() * 3000);
    };
    minuterie = setTimeout(pas, 2500);
    return () => clearTimeout(minuterie);
  }, [promenade, pose, taille, position, regard]);

  // Saut de joie
  useEffect(() => {
    if (reaction === 0) return;
    saut.set(withSequence(withTiming(-taille * 0.18, { duration: 180 }), withSpring(0, { damping: 6, stiffness: 180 })));
  }, [reaction, taille, saut]);

  const anime = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }, { translateY: saut.value }, { scaleX: regard.value }, { scaleY: souffle.value }],
  }));

  const tenue = equipe && pose !== 'dort' ? tenuePortee(espece, equipe) : undefined;
  const source = (tenue && imageTenue(espece, tenue)) || imageCompagnon(espece, pose);
  const infos = compagnonParId(espece);

  return (
    <Animated.View style={[{ width: taille, height: taille, transformOrigin: 'bottom' }, anime, style]}>
      {source ? (
        <Image source={source} style={StyleSheet.absoluteFill} contentFit="contain" accessibilityIgnoresInvertColors />
      ) : (
        // Visuel de secours tant que l'illustration de cet animal n'est pas fournie
        <View style={[styles.secours, { backgroundColor: infos.couleur, borderRadius: taille / 2 }]}>
          <Text style={{ fontSize: taille * 0.5 }}>{pose === 'dort' ? '😴' : infos.emoji}</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  secours: { flex: 1, alignItems: 'center', justifyContent: 'center', opacity: 0.9 },
});
