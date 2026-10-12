/**
 * ÉLÉMENTS DU FORMULAIRE D'INSCRIPTION
 * - champ de mot de passe avec un œil pour l'afficher ou le cacher ;
 * - barre de solidité du mot de passe (4 segments) ;
 * - case « J'accepte les conditions d'utilisation et la politique de confidentialité ».
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { arrondis, couleurs, espace, polices } from '@/config/theme';

/* ---------- Mot de passe avec l'œil ---------- */

export function ChampMotDePasse({ label, ...props }: TextInputProps & { label: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ gap: espace.s }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.cadre}>
        <TextInput
          placeholderTextColor={couleurs.brunDoux}
          style={styles.saisie}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={label}
          {...props}
        />
        <Pressable
          onPress={() => setVisible(!visible)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
          style={styles.oeil}>
          <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={21} color={couleurs.brunDoux} />
        </Pressable>
      </View>
    </View>
  );
}

/* ---------- Solidité du mot de passe ---------- */

/** Note de 0 à 4 : longueur, majuscules et minuscules, chiffres, caractères spéciaux. */
export function soliditeMotDePasse(mdp: string): number {
  if (mdp.length < 8) return mdp.length ? 1 : 0;
  let note = 1;
  if (mdp.length >= 12) note++;
  if (/[a-z]/.test(mdp) && /[A-Z]/.test(mdp)) note++;
  if (/\d/.test(mdp) && /[^A-Za-z0-9]/.test(mdp)) note++;
  else if (/\d/.test(mdp) || /[^A-Za-z0-9]/.test(mdp)) note += 0.5;
  return Math.min(4, Math.floor(note));
}

const NIVEAUX = [
  { texte: '', couleur: couleurs.ligne },
  { texte: 'Trop faible', couleur: '#E0685A' },
  { texte: 'Moyen', couleur: couleurs.or },
  { texte: 'Bon', couleur: '#8DB36B' },
  { texte: 'Solide', couleur: couleurs.saugeFonce },
];

export function BarreSolidite({ motDePasse }: { motDePasse: string }) {
  const note = soliditeMotDePasse(motDePasse);
  if (!motDePasse) return null;
  const niveau = NIVEAUX[note];
  const conseil = motDePasse.length < 8 ? `Encore ${8 - motDePasse.length} caractère${8 - motDePasse.length > 1 ? 's' : ''} minimum` : null;
  return (
    <View style={{ gap: 6 }} accessibilityLabel={`Mot de passe : ${niveau.texte}`}>
      <View style={styles.segments}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.segment, { backgroundColor: i <= note ? niveau.couleur : couleurs.ligne }]} />
        ))}
      </View>
      <Text style={[styles.niveau, { color: note <= 1 ? '#C0503F' : couleurs.brunDoux }]}>
        {niveau.texte}
        {conseil ? ` · ${conseil}` : ''}
      </Text>
    </View>
  );
}

/* ---------- Case des conditions ---------- */

export function CaseConditions({ coche, onChange }: { coche: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.case}>
      <Pressable
        onPress={() => onChange(!coche)}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: coche }}
        accessibilityLabel="J’accepte les conditions d’utilisation et la politique de confidentialité"
        style={[styles.boite, coche && styles.boiteCochee]}>
        {coche && <Ionicons name="checkmark" size={15} color={couleurs.blanc} />}
      </Pressable>
      <Text style={styles.caseTexte}>
        <Text onPress={() => onChange(!coche)}>J’accepte les </Text>
        <Text style={styles.lien} onPress={() => router.push('/legal/conditions')}>
          conditions d’utilisation
        </Text>
        <Text onPress={() => onChange(!coche)}> et la </Text>
        <Text style={styles.lien} onPress={() => router.push('/legal/confidentialite')}>
          politique de confidentialité
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase', color: couleurs.brunDoux },
  cadre: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: couleurs.carte,
    borderWidth: 2,
    borderColor: couleurs.ligne,
    borderRadius: arrondis.m,
    paddingLeft: espace.l,
  },
  saisie: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: polices.texte,
    fontSize: 16,
    color: couleurs.brun,
    fontWeight: '600',
  },
  oeil: { paddingHorizontal: espace.m, paddingVertical: espace.s },
  segments: { flexDirection: 'row', gap: 6 },
  segment: { flex: 1, height: 5, borderRadius: 3 },
  niveau: { fontSize: 12.5, fontWeight: '700' },
  case: { flexDirection: 'row', alignItems: 'flex-start', gap: espace.m },
  boite: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: couleurs.relief,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  boiteCochee: { backgroundColor: couleurs.renardFonce, borderColor: couleurs.renardFonce },
  caseTexte: { flex: 1, fontSize: 13.5, lineHeight: 19, color: couleurs.brunDoux, fontWeight: '600' },
  lien: { color: couleurs.renardFonce, fontWeight: '800', textDecorationLine: 'underline' },
});
