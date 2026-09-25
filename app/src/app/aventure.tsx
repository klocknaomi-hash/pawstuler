/**
 * AVENTURE DU JOUR
 * Le compagnon part explorer un lieu de sa ville (coûte de l'énergie), puis revient
 * avec un court récit et des pièces. Une fois l'aventure faite : « Nouvelle aventure demain ».
 */
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Bouton, Ecran, Texte, Titre } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { IconePiece } from '@/components/Pieces';
import { AVENTURES_PAR_JOUR, COUT, PIECES_AVENTURE } from '@/config/energie';
import { arrondis, couleurs, espace, ombre } from '@/config/theme';
import { villeParId } from '@/config/villes';
import { imageVille } from '@/illustrations/registre';
import { aventuresRestantes } from '@/logique/compagnon';
import { jourDe } from '@/logique/dates';
import { aPremium } from '@/services/abonnement';
import { useApp } from '@/store/etat';

export default function Aventure() {
  const { etat, dispatch } = useApp();
  const peutPartir = aventuresRestantes(etat) > 0 && etat.energie >= COUT.aventure;
  const [phase, setPhase] = useState<'depart' | 'recit'>(peutPartir ? 'depart' : 'recit');
  const lance = useRef(false);

  // Départ : petite balade, puis retour avec le récit
  useEffect(() => {
    if (phase !== 'depart' || lance.current) return;
    lance.current = true;
    const minuterie = setTimeout(() => {
      dispatch({ type: 'PARTIR_EN_AVENTURE' });
      setPhase('recit');
    }, 2400);
    return () => clearTimeout(minuterie);
  }, [phase, dispatch]);

  if (!etat.compagnon || !etat.villeId) return null;
  const ville = villeParId(etat.villeId);
  const nom = etat.compagnon.nom;
  const aventure = etat.derniereAventure?.le === jourDe() ? etat.derniereAventure : undefined;
  const lieu = ville.lieux.find((l) => l.id === aventure?.lieuId);
  const encore = aventuresRestantes(etat);
  const decor = imageVille(ville.id, 'paysage');

  if (phase === 'depart') {
    return (
      <Ecran fond={couleurs.ciel} style={styles.centre}>
        {decor && <Image source={decor} style={[StyleSheet.absoluteFill, { opacity: 0.35 }]} contentFit="cover" />}
        <Compagnon espece={etat.compagnon.espece} pose="aventure" taille={190} promenade />
        <Titre style={{ textAlign: 'center' }}>{nom} part explorer {ville.nom}…</Titre>
        <Texte style={{ textAlign: 'center' }}>−{COUT.aventure} ⚡</Texte>
      </Ecran>
    );
  }

  return (
    <Ecran
      defilant
      bas={
        <>
          <Bouton titre="Retour à l’accueil" onPress={() => router.back()} />
          {encore === 0 && !aPremium(etat) && (
            <Bouton
              titre={`Avec Premium : jusqu’à ${AVENTURES_PAR_JOUR.premium} aventures par jour`}
              variante="texte"
              onPress={() => router.replace('/premium')}
            />
          )}
        </>
      }>
      <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Fermer" style={styles.fermer} hitSlop={12}>
        <Ionicons name="close" size={26} color={couleurs.brun} />
      </Pressable>

      <View style={styles.centre}>
        <Compagnon espece={etat.compagnon.espece} pose="content" taille={170} reaction={1} />
        <Titre style={{ textAlign: 'center' }}>{aventure ? `${nom} est rentré !` : 'Pas encore d’aventure aujourd’hui'}</Titre>
      </View>

      {aventure ? (
        <Animated.View entering={FadeIn.duration(500)} style={styles.recit}>
          {lieu && <Text style={styles.lieu}>📍 {lieu.nom}</Text>}
          <Text style={styles.texte}>{aventure.texte}</Text>
          <View style={styles.recompense}>
            <IconePiece taille={20} />
            <Text style={styles.recompenseTexte}>+{PIECES_AVENTURE} pièces rapportées</Text>
          </View>
        </Animated.View>
      ) : (
        <Texte style={{ textAlign: 'center' }}>
          {nom} a besoin de {COUT.aventure} ⚡ pour partir. Chaque tâche terminée lui redonne de l’énergie.
        </Texte>
      )}

      <View style={styles.demain}>
        <Ionicons name={encore > 0 ? 'sparkles' : 'moon'} size={18} color={couleurs.saugeFonce} />
        <Text style={styles.demainTexte}>
          {encore > 0 ? `Encore ${encore} aventure${encore > 1 ? 's' : ''} possible${encore > 1 ? 's' : ''} aujourd’hui.` : 'Nouvelle aventure demain.'}
        </Text>
      </View>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  centre: { alignItems: 'center', justifyContent: 'center', gap: espace.m },
  fermer: { alignSelf: 'flex-end' },
  recit: { backgroundColor: couleurs.carte, borderRadius: arrondis.l, padding: espace.l, gap: espace.s, ...ombre },
  lieu: { fontWeight: '800', color: couleurs.renardFonce, fontSize: 13.5 },
  texte: { fontSize: 16, lineHeight: 23, color: couleurs.brun, fontWeight: '600' },
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
  recompenseTexte: { fontWeight: '800', color: '#9A6400' },
  demain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espace.s,
    backgroundColor: couleurs.saugeClair,
    borderRadius: arrondis.m,
    padding: espace.m,
  },
  demainTexte: { fontWeight: '800', color: couleurs.saugeFonce },
});
