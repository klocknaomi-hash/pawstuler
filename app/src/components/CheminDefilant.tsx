/**
 * LE CHEMIN QUI DÉFILE (pendant le trajet d'une aventure)
 * Le compagnon marche au centre ; le décor défile derrière lui, en continu et en temps réel :
 * il sort de sa chambre, traverse la ville, puis le chemin de campagne (ou la ville) tourne en boucle.
 * Au retour, le décor défile dans l'autre sens et il retrouve sa chambre à l'arrivée.
 * La position du décor dépend de l'heure réelle : app fermée puis rouverte, il est au même endroit.
 */
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import type { VilleId } from '@/config/villes';
import { trajetVille } from '@/illustrations/registre';

/** Vitesse de marche : nombre de secondes pour traverser un panneau (une image) du décor. */
const SECONDES_PAR_PANNEAU = 6;

export function CheminDefilant({
  ville,
  sens,
  debut,
  fin,
  largeur,
  hauteur,
}: {
  ville: VilleId;
  /** Aller : on s'éloigne de la chambre. Retour : on y revient. */
  sens: 'aller' | 'retour';
  /** Début et fin du trajet (heure réelle, en millisecondes). */
  debut: number;
  fin: number;
  largeur: number;
  hauteur: number;
}) {
  const { panneaux, boucle } = trajetVille(ville);
  const intro = panneaux.slice(0, boucle);
  const enBoucle = panneaux.slice(boucle);
  // Une seule image en boucle : une sur deux est retournée, pour que les raccords ne se voient pas
  const miroir = enBoucle.length === 1;
  const motif = miroir ? [enBoucle[0], enBoucle[0]] : enBoucle;
  // Deux tours du motif suffisent pour remplir l'écran pendant le passage d'un tour à l'autre
  const bande = [...intro, ...motif, ...motif];

  // L'heure, qui avance en continu jusqu'à la fin du trajet
  const temps = useSharedValue(debut);
  useEffect(() => {
    const maintenant = Date.now();
    temps.set(maintenant);
    temps.set(withTiming(fin, { duration: Math.max(0, fin - maintenant), easing: Easing.linear }));
  }, [fin, temps]);

  const style = useAnimatedStyle(() => {
    const vitesse = largeur / (SECONDES_PAR_PANNEAU * 1000);
    // Distance depuis la chambre : elle grandit à l'aller, elle diminue au retour
    const distance = Math.max(0, sens === 'aller' ? (temps.get() - debut) * vitesse : (fin - temps.get()) * vitesse);
    const longueurIntro = intro.length * largeur;
    const longueurMotif = motif.length * largeur;
    const x = distance < longueurIntro ? distance : longueurIntro + ((distance - longueurIntro) % longueurMotif);
    return { transform: [{ translateX: -x }] };
  });

  if (largeur <= 0) return null;
  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
      <Animated.View style={[styles.bande, { width: bande.length * largeur, height: hauteur }, style]}>
        {bande.map((source, i) => {
          const retourne = miroir && i >= intro.length && (i - intro.length) % 2 === 1;
          return (
            <Image
              key={i}
              source={source}
              contentFit="cover"
              style={{ width: largeur, height: hauteur, transform: retourne ? [{ scaleX: -1 }] : undefined }}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  bande: { flexDirection: 'row' },
});
