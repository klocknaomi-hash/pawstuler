/**
 * CANDIDATURES
 * Le suivi, sans tableau Excel : une carte par candidature, un statut clair,
 * une recherche rapide, des filtres, et les relances à faire mises en avant.
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { STATUTS, statutParId } from '@/config/candidatures';
import { arrondis, couleurs, espace, polices } from '@/config/theme';
import { dateLisible, jourDe, joursEntre } from '@/logique/dates';
import { relanceDue } from '@/logique/tachesDuJour';
import { useApp } from '@/store/etat';
import type { Candidature, StatutCandidature } from '@/store/types';

export default function Candidatures() {
  const { etat, dispatch } = useApp();
  const [filtre, setFiltre] = useState<StatutCandidature | 'toutes'>('toutes');
  const [recherche, setRecherche] = useState('');
  const aujourdhui = jourDe();

  const liste = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return etat.candidatures.filter(
      (c) =>
        (filtre === 'toutes' || c.statut === filtre) &&
        (!q || c.entreprise.toLowerCase().includes(q) || c.poste.toLowerCase().includes(q)),
    );
  }, [etat.candidatures, filtre, recherche]);

  const envoyees = etat.candidatures.filter((c) => c.statut !== 'a-envoyer').length;
  const entretiens = etat.candidatures.filter((c) => c.statut === 'entretien' || c.statut === 'offre').length;
  const aRelancer = etat.candidatures.filter((c) => relanceDue(c, aujourdhui)).length;

  function changerStatut(c: Candidature) {
    const choisir = (statut: StatutCandidature) => dispatch({ type: 'CHANGER_STATUT', id: c.id, statut });
    if (Platform.OS === 'web') {
      const i = STATUTS.findIndex((s) => s.id === c.statut);
      choisir(STATUTS[(i + 1) % STATUTS.length].id);
      return;
    }
    Alert.alert(c.entreprise, 'Où en est cette candidature ?', [
      ...STATUTS.filter((s) => s.id !== c.statut).map((s) => ({ text: s.libelle, onPress: () => choisir(s.id) })),
      { text: 'Annuler', style: 'cancel' as const },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: couleurs.creme }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
        <Text style={styles.titre}>Candidatures</Text>

        <View style={styles.stats}>
          <Stat valeur={envoyees} libelle="envoyées" />
          <Stat valeur={entretiens} libelle="entretiens" />
          <Stat valeur={aRelancer} libelle="à relancer" accent={aRelancer > 0} />
        </View>

        <View style={styles.recherche}>
          <Ionicons name="search" size={18} color={couleurs.brunDoux} />
          <TextInput
            value={recherche}
            onChangeText={setRecherche}
            placeholder="Chercher une entreprise ou un poste"
            placeholderTextColor={couleurs.brunDoux}
            style={styles.rechercheChamp}
            accessibilityLabel="Chercher une candidature"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtres}>
          {[{ id: 'toutes' as const, libelle: 'Toutes' }, ...STATUTS].map((s) => (
            <Pressable
              key={s.id}
              onPress={() => setFiltre(s.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: filtre === s.id }}
              style={[styles.filtre, filtre === s.id && styles.filtreActif]}>
              <Text style={[styles.filtreTexte, filtre === s.id && { color: couleurs.blanc }]}>{s.libelle}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {liste.length === 0 ? (
          <View style={styles.vide}>
            <Text style={styles.videTitre}>
              {etat.candidatures.length === 0 ? 'Aucune candidature pour l’instant' : 'Rien ici avec ce filtre'}
            </Text>
            <Text style={styles.videTexte}>
              {etat.candidatures.length === 0
                ? `Ajoute ta première candidature, ou juste une offre qui te plaît. ${etat.compagnon?.nom ?? ''} s’en souviendra pour toi.`
                : 'Essaie un autre filtre.'}
            </Text>
          </View>
        ) : (
          liste.map((c) => {
            const s = statutParId(c.statut);
            const relance = relanceDue(c, aujourdhui);
            return (
              <View key={c.id} style={styles.carte}>
                <View style={styles.carteHaut}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.entreprise}>{c.entreprise}</Text>
                    <Text style={styles.poste}>{c.poste}</Text>
                  </View>
                  <Pressable
                    onPress={() => changerStatut(c)}
                    accessibilityRole="button"
                    accessibilityLabel={`Statut : ${s.libelle}. Toucher pour changer`}
                    style={[styles.statut, { backgroundColor: s.fond }]}>
                    <Text style={[styles.statutTexte, { color: s.texte }]}>{s.libelle}</Text>
                    <Ionicons name="chevron-down" size={14} color={s.texte} />
                  </Pressable>
                </View>
                <View style={styles.carteBas}>
                  <Text style={styles.meta}>
                    {c.dateEnvoi ? `Envoyée le ${dateLisible(c.dateEnvoi)}` : 'Pas encore envoyée'}
                    {c.contact ? ` · ${c.contact}` : ''}
                  </Text>
                  {relance && (
                    <Text style={styles.relance}>
                      {joursEntre(c.dateEnvoi!, aujourdhui)} j sans réponse : pense à relancer
                    </Text>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => router.push('/nouvelle-candidature')}
        accessibilityRole="button"
        accessibilityLabel="Ajouter une candidature">
        <Ionicons name="add" size={30} color={couleurs.blanc} />
      </Pressable>
    </SafeAreaView>
  );
}

function Stat({ valeur, libelle, accent }: { valeur: number; libelle: string; accent?: boolean }) {
  return (
    <View style={[styles.stat, accent && { backgroundColor: couleurs.orClair, borderColor: 'transparent' }]}>
      <Text style={styles.statValeur}>{valeur}</Text>
      <Text style={styles.statLibelle}>{libelle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenu: { padding: espace.l, gap: espace.m, paddingBottom: 100 },
  titre: { fontFamily: polices.titre, fontSize: 28, fontWeight: '800', color: couleurs.brun },
  stats: { flexDirection: 'row', gap: espace.s },
  stat: {
    flex: 1,
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.m,
    borderWidth: 1,
    borderColor: couleurs.ligne,
    paddingVertical: espace.m,
    alignItems: 'center',
  },
  statValeur: { fontFamily: polices.titre, fontSize: 24, fontWeight: '800', color: couleurs.brun, fontVariant: ['tabular-nums'] },
  statLibelle: { fontSize: 12, fontWeight: '700', color: couleurs.brunDoux },
  recherche: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.s,
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.m,
    borderWidth: 1,
    borderColor: couleurs.ligne,
    paddingHorizontal: espace.m,
  },
  rechercheChamp: { flex: 1, paddingVertical: 12, fontSize: 15, color: couleurs.brun, fontWeight: '600' },
  filtres: { gap: 6 },
  filtre: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: couleurs.ligne,
    backgroundColor: couleurs.carte,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filtreActif: { backgroundColor: couleurs.brun, borderColor: couleurs.brun },
  filtreTexte: { fontSize: 13, fontWeight: '800', color: couleurs.brun },
  vide: { alignItems: 'center', paddingVertical: espace.xxl, gap: espace.s },
  videTitre: { fontFamily: polices.titre, fontSize: 18, fontWeight: '700', color: couleurs.brun, textAlign: 'center' },
  videTexte: { fontSize: 14.5, color: couleurs.brunDoux, textAlign: 'center', lineHeight: 20, maxWidth: 300 },
  carte: {
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.m,
    borderWidth: 1,
    borderColor: couleurs.ligne,
    padding: espace.l,
    gap: espace.s,
  },
  carteHaut: { flexDirection: 'row', gap: espace.s, alignItems: 'flex-start' },
  entreprise: { fontSize: 16.5, fontWeight: '800', color: couleurs.brun },
  poste: { fontSize: 14, fontWeight: '600', color: couleurs.brunDoux, marginTop: 2 },
  statut: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  statutTexte: { fontSize: 12.5, fontWeight: '800' },
  carteBas: { gap: 4 },
  meta: { fontSize: 13, fontWeight: '600', color: couleurs.brunDoux },
  relance: { fontSize: 13, fontWeight: '800', color: couleurs.renardFonce },
  fab: {
    position: 'absolute',
    right: espace.l,
    bottom: espace.l,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: couleurs.renardFonce,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: couleurs.renardFonce,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
});
