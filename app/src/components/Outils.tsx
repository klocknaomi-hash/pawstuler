/**
 * PETITS COMPOSANTS DES OUTILS D'AIDE À L'EMPLOI
 * Le verrou Premium, le choix de la candidature (pour remplir les modèles), un bloc titré,
 * et le remplissage des modèles ({entreprise}, {poste}, {prenom}, {destinataire}).
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Pastille } from '@/components/base';
import { arrondis, couleurs, espace, relief } from '@/config/theme';
import { candidaturesActives } from '@/logique/tachesDuJour';
import type { Candidature, EtatApp } from '@/store/types';

/** Remplit un modèle avec la candidature choisie (sinon des repères à compléter). */
export function remplirModele(texte: string, etat: EtatApp, c?: Candidature): string {
  return texte
    .replaceAll('{entreprise}', c?.entreprise ?? '[entreprise]')
    .replaceAll('{poste}', c?.poste ?? '[poste]')
    .replaceAll('{prenom}', etat.utilisateur?.prenom ?? '[ton prénom]')
    .replaceAll('{destinataire}', '');
}

/** Ce qu'il reste à débloquer avec Premium : une ligne qui ouvre l'écran d'abonnement. */
export function Verrou({ texte = 'Disponible avec Pawstuler Premium' }: { texte?: string }) {
  return (
    <Pressable onPress={() => router.push('/premium')} accessibilityRole="button" style={styles.verrou}>
      <Ionicons name="lock-closed" size={14} color={couleurs.renardFonce} />
      <Text style={styles.verrouTexte}>{texte}</Text>
      <Ionicons name="chevron-forward" size={14} color={couleurs.renardFonce} />
    </Pressable>
  );
}

/** Choisir la candidature qui remplit le modèle (entreprise, poste, e-mail). */
export function ChoixCandidature({
  etat,
  choisie,
  onChoisir,
}: {
  etat: EtatApp;
  choisie?: string;
  onChoisir: (id?: string) => void;
}) {
  const candidatures = candidaturesActives(etat).slice(0, 8);
  if (!candidatures.length) {
    return <Text style={styles.aide}>Ajoute une candidature : l’entreprise et le poste se rempliront tout seuls.</Text>;
  }
  return (
    <View style={{ gap: espace.s }}>
      <Text style={styles.aide}>Pour quelle candidature ?</Text>
      <View style={styles.pastilles}>
        {candidatures.map((c) => (
          <Pastille key={c.id} libelle={c.entreprise} choisi={choisie === c.id} onPress={() => onChoisir(choisie === c.id ? undefined : c.id)} />
        ))}
      </View>
    </View>
  );
}

/** Une carte avec un petit titre (ex. « 🎯 Ce que le recruteur cherche »). */
export function Bloc({ titre, children, fond }: { titre?: string; children: ReactNode; fond?: string }) {
  return (
    <View style={[styles.bloc, fond ? { backgroundColor: fond } : null]}>
      {titre ? <Text style={styles.blocTitre}>{titre}</Text> : null}
      {children}
    </View>
  );
}

export const stylesOutils = StyleSheet.create({
  texte: { fontSize: 15, lineHeight: 21, color: couleurs.brun },
  petit: { fontSize: 13, lineHeight: 18, color: couleurs.brunDoux },
  titreSection: { fontSize: 16, fontWeight: '700', color: couleurs.brun },
});

const styles = StyleSheet.create({
  verrou: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: couleurs.pecheClair,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  verrouTexte: { fontSize: 13, fontWeight: '700', color: couleurs.renardFonce },
  aide: { fontSize: 13, color: couleurs.brunDoux },
  pastilles: { flexDirection: 'row', flexWrap: 'wrap', gap: espace.s },
  bloc: { backgroundColor: couleurs.carte, borderRadius: arrondis.l, padding: espace.l, gap: espace.s, ...relief },
  blocTitre: { fontSize: 13, fontWeight: '700', color: couleurs.renardFonce },
});
