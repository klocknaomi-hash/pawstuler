/**
 * ZIGGY+ — présentation de l'offre et démarrage de l'essai gratuit de 7 jours.
 * Formulation claire : durée de l'essai, prix après l'essai, renouvellement automatique.
 * L'achat App Store réel sera branché dans src/services/abonnement.ts.
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bouton, Ecran, Texte, Titre } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { FORMULES, INCLUS_GRATUIT, INCLUS_ZIGGY_PLUS, JOURS_ESSAI, MENTION_RENOUVELLEMENT, type FormuleId } from '@/config/abonnement';
import { arrondis, couleurs, espace, polices } from '@/config/theme';
import { joursRestantsEssai, lancerEssai } from '@/services/abonnement';
import { useApp } from '@/store/etat';

export default function ZiggyPlus() {
  const { etat, dispatch } = useApp();
  const [formule, setFormule] = useState<FormuleId>('annuel');
  const restants = joursRestantsEssai(etat);
  const choisie = FORMULES.find((f) => f.id === formule)!;

  async function essayer() {
    if (await lancerEssai()) dispatch({ type: 'DEMARRER_ESSAI', formule });
    router.back();
  }

  return (
    <Ecran
      defilant
      bas={
        restants === null ? (
          <>
            <Bouton titre={`Commencer mes ${JOURS_ESSAI} jours gratuits`} onPress={essayer} />
            <Text style={styles.prixBas}>{choisie.apresEssai}. Résiliable à tout moment.</Text>
          </>
        ) : (
          <Bouton titre="Fermer" variante="secondaire" onPress={() => router.back()} />
        )
      }>
      <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Fermer" style={styles.fermer} hitSlop={12}>
        <Ionicons name="close" size={26} color={couleurs.brun} />
      </Pressable>

      <View style={styles.haut}>
        <Compagnon espece={etat.compagnon?.espece ?? 'renard'} pose="celebration" taille={140} />
        <Titre style={{ textAlign: 'center' }}>Découvre Ziggy+ gratuitement pendant {JOURS_ESSAI} jours</Titre>
        {restants !== null && (
          <Texte style={{ textAlign: 'center', color: couleurs.renardFonce, fontWeight: '700' }}>
            Ton essai est en cours : {restants} jour{restants > 1 ? 's' : ''} restant{restants > 1 ? 's' : ''}.
          </Texte>
        )}
      </View>

      <View style={styles.liste}>
        <Text style={styles.listeTitre}>Toujours gratuit</Text>
        {INCLUS_GRATUIT.map((t) => (
          <Ligne key={t} texte={t} couleur={couleurs.saugeFonce} />
        ))}
      </View>
      <View style={[styles.liste, { backgroundColor: couleurs.pecheClair, borderColor: 'transparent' }]}>
        <Text style={styles.listeTitre}>En plus avec Ziggy+</Text>
        {INCLUS_ZIGGY_PLUS.map((t) => (
          <Ligne key={t} texte={t} couleur={couleurs.renardFonce} icone="sparkles" />
        ))}
      </View>

      {restants === null && (
        <View style={styles.formules}>
          {FORMULES.map((f) => (
            <Pressable
              key={f.id}
              onPress={() => setFormule(f.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: formule === f.id }}
              style={[styles.formule, formule === f.id && styles.formuleChoisie]}>
              <Text style={styles.formuleNom}>{f.libelle}</Text>
              <Text style={styles.formulePrix}>{f.prix}</Text>
              {f.detail && <Text style={styles.formuleDetail}>{f.detail}</Text>}
            </Pressable>
          ))}
        </View>
      )}

      <Text style={styles.mention}>{MENTION_RENOUVELLEMENT}</Text>
    </Ecran>
  );
}

function Ligne({ texte, couleur, icone = 'checkmark-circle' }: { texte: string; couleur: string; icone?: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.ligne}>
      <Ionicons name={icone} size={18} color={couleur} />
      <Text style={styles.ligneTexte}>{texte}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fermer: { alignSelf: 'flex-end' },
  haut: { alignItems: 'center', gap: espace.s },
  liste: {
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.l,
    borderWidth: 1,
    borderColor: couleurs.ligne,
    padding: espace.l,
    gap: espace.s,
  },
  listeTitre: { fontFamily: polices.titre, fontSize: 16, fontWeight: '800', color: couleurs.brun, marginBottom: 2 },
  ligne: { flexDirection: 'row', gap: espace.s, alignItems: 'flex-start' },
  ligneTexte: { flex: 1, fontSize: 14.5, color: couleurs.brun, fontWeight: '600', lineHeight: 19 },
  formules: { flexDirection: 'row', gap: espace.s },
  formule: {
    flex: 1,
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.m,
    borderWidth: 2,
    borderColor: couleurs.ligne,
    padding: espace.m,
    gap: 2,
  },
  formuleChoisie: { borderColor: couleurs.renardFonce, backgroundColor: couleurs.pecheClair },
  formuleNom: { fontWeight: '800', color: couleurs.brunDoux, fontSize: 13 },
  formulePrix: { fontFamily: polices.titre, fontWeight: '800', color: couleurs.brun, fontSize: 18 },
  formuleDetail: { fontSize: 12, color: couleurs.brunDoux, fontWeight: '600' },
  prixBas: { textAlign: 'center', fontSize: 13, color: couleurs.brunDoux, fontWeight: '600' },
  mention: { fontSize: 11.5, color: couleurs.brunDoux, lineHeight: 16 },
});
