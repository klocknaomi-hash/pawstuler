/**
 * ONBOARDING 7/8 — La ville où le compagnon va vivre.
 * Deux cartes : « Petite ville » (Clairebourg) et « Grande ville » (Sunnyville), avec les illustrations
 * officielles. Une ville devient choisissable dès que son illustration existe dans le registre.
 * Ensuite : l'objectif de série (dernière étape).
 */
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Bouton, CarteChoix, Ecran, Texte, Titre } from '@/components/base';
import { EnteteEtape } from '@/components/EnteteEtape';
import { arrondis, couleurs, espace, polices, tailles } from '@/config/theme';
import { VILLES, type Ambiance, type VilleId } from '@/config/villes';
import { imageVille } from '@/illustrations/registre';
import { useApp } from '@/store/etat';

/** Un intitulé simple par type de ville (pas de catégorie « campagne »). */
const TYPE_VILLE: Record<Ambiance, string> = { campagne: 'Petite ville', urbaine: 'Grande ville' };

export default function VilleDepart() {
  const { etat, dispatch } = useApp();
  const [choix, setChoix] = useState<VilleId>(etat.villeId ?? 'clairebourg');
  const nom = etat.compagnon?.nom ?? 'Ton compagnon';

  function continuer() {
    dispatch({ type: 'CHOISIR_VILLE', villeId: choix });
    router.push('/serie');
  }

  return (
    <Ecran defilant bas={<Bouton titre="Continuer" onPress={continuer} />}>
      <EnteteEtape etape={7} />
      <Titre>Où veux-tu commencer ton aventure ?</Titre>
      <Texte>{nom} y vivra, visitera ses lieux et y cherchera son propre job, en même temps que toi.</Texte>

      {VILLES.map((v) => {
        const image = imageVille(v.id, 'ville');
        const disponible = !!image;
        return (
          <CarteChoix
            key={v.id}
            choisi={choix === v.id}
            onPress={() => disponible && setChoix(v.id)}
            libelle={disponible ? `${TYPE_VILLE[v.ambiance]} : ${v.nom}. ${v.accroche}` : 'Ville bientôt disponible'}
            style={[styles.carte, !disponible && styles.indisponible]}>
            <View style={[styles.vignette, { backgroundColor: v.couleur }]}>
              {image ? <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
            </View>
            <View style={styles.textes}>
              <Text style={styles.type}>{TYPE_VILLE[v.ambiance]}</Text>
              <Text style={styles.nom}>{disponible ? v.nom : 'Bientôt'}</Text>
              <Text style={styles.accroche}>{disponible ? v.accroche : 'Une nouvelle ville arrive prochainement.'}</Text>
            </View>
          </CarteChoix>
        );
      })}
    </Ecran>
  );
}

const styles = StyleSheet.create({
  carte: { padding: espace.s, gap: espace.s },
  indisponible: { opacity: 0.55, shadowOpacity: 0 },
  vignette: { height: 130, borderRadius: arrondis.m, overflow: 'hidden' },
  textes: { paddingHorizontal: espace.xs, paddingBottom: espace.xs, gap: 2 },
  // Même hiérarchie que le reste de l'app : petit libellé, nom en taille de texte, description en petit
  type: { fontSize: tailles.petit, fontWeight: '600', color: couleurs.renardFonce },
  nom: { fontFamily: polices.titre, fontSize: tailles.texte, fontWeight: '600', color: couleurs.brun },
  accroche: { fontSize: tailles.petit, color: couleurs.brunDoux, lineHeight: 18 },
});
