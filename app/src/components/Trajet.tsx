/**
 * LE TRAJET DU COMPAGNON, EN TEMPS RÉEL
 * Une petite route entre la maison et le lieu de la mission. Le compagnon y suit l'heure réelle :
 *  1. aller (les premiers 20 % de la mission) : il marche vers le lieu, avec ce qu'il emporte (📄, ✉️, 👔…) ;
 *  2. sur place (60 %) : il entre et disparaît ; au-dessus du lieu, une petite animation propre
 *     à la mission (feuilles de CV, bulles d'entretien, z z z de la sieste, éclaboussures…) ;
 *  3. retour (les derniers 20 %) : il ressort et rentre à la maison.
 * Si l'app est fermée puis rouverte, il reprend exactement où il en est.
 */
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

import { Compagnon } from '@/components/Compagnon';
import type { EspeceId } from '@/config/compagnons';
import { ANIMATION_SUR_PLACE, OBJET_EMPORTE } from '@/config/missions';
import { arrondis, couleurs } from '@/config/theme';
import { iconeMission } from '@/logique/missions';
import type { Mission } from '@/store/types';

export type PhaseTrajet = 'aller' | 'sur-place' | 'retour' | 'rentre';

/** Part de la mission passée sur la route, à l'aller comme au retour. */
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

export function Trajet({ mission, espece, equipe, taille = 64 }: { mission: Mission; espece: EspeceId; equipe?: string[]; taille?: number }) {
  // L'heure est relue à chaque changement d'étape (le mouvement entre les deux est animé en continu)
  const [maintenant, setMaintenant] = useState(() => Date.now());
  const [largeur, setLargeur] = useState(0);
  const { phase, debut, fin } = phaseTrajet(mission, maintenant);

  useEffect(() => {
    if (phase === 'rentre') return;
    const minuterie = setTimeout(() => setMaintenant(Date.now()), Math.max(50, fin - Date.now() + 50));
    return () => clearTimeout(minuterie);
  }, [phase, fin]);

  // Position sur la route : 0 = maison, 1 = lieu de la mission
  const position = useSharedValue(phase === 'aller' ? 0 : phase === 'rentre' ? 0 : 1);
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

  const surLaRoute = phase === 'aller' || phase === 'retour';
  const course = Math.max(0, largeur - taille);
  const styleCompagnon = useAnimatedStyle(() => ({
    opacity: visible.get(),
    transform: [
      { translateX: position.get() * course },
      { translateY: surLaRoute ? -pas.get() * 5 : 0 },
      // Au retour, il regarde vers la maison
      { scaleX: phase === 'retour' ? -1 : 1 },
    ],
  }));

  const depuis = mission.type === 'repos' ? '🌳' : '🏠';
  const effets = ANIMATION_SUR_PLACE[mission.type];

  return (
    <View style={[styles.cadre, { height: taille + 34 }]} onLayout={(e: LayoutChangeEvent) => setLargeur(e.nativeEvent.layout.width)}>
      <View style={styles.route} />
      <Text style={[styles.borne, styles.gauche]}>{depuis}</Text>
      <View style={[styles.droite, styles.destination]}>
        {phase === 'sur-place' && effets.map((e, i) => <EffetSurPlace key={e} emoji={e} delai={i * 900} />)}
        <Text style={styles.borne}>{iconeMission(mission)}</Text>
      </View>
      <Animated.View style={[styles.compagnon, { width: taille }, styleCompagnon]}>
        {surLaRoute && <Text style={styles.objet}>{OBJET_EMPORTE[mission.type]}</Text>}
        <Compagnon espece={espece} pose="aventure" taille={taille} equipe={equipe} />
      </Animated.View>
    </View>
  );
}

/** Un petit emoji qui s'envole au-dessus du lieu, en boucle (une animation par type de mission). */
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
  cadre: { width: '100%', justifyContent: 'flex-end' },
  route: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 12,
    height: 6,
    borderRadius: arrondis.s,
    backgroundColor: couleurs.ligne,
  },
  borne: { fontSize: 30 },
  gauche: { position: 'absolute', left: 0, bottom: 0 },
  droite: { position: 'absolute', right: 0, bottom: 0 },
  destination: { alignItems: 'center' },
  effet: { position: 'absolute', top: -26, fontSize: 20 },
  compagnon: { position: 'absolute', left: 0, bottom: 4, alignItems: 'center' },
  objet: { position: 'absolute', top: -6, right: -4, fontSize: 18, zIndex: 1 },
});
