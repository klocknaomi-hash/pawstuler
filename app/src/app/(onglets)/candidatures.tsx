/**
 * CANDIDATURES
 * Le suivi, sans tableau Excel : une carte par candidature, un statut clair, une recherche
 * rapide, des filtres, et les relances à faire mises en avant.
 * Après « J'ai décroché ! », « Mon aventure professionnelle » s'affiche en haut ;
 * les candidatures restent consultables (rien n'est supprimé automatiquement).
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { STATUTS, statutParId } from '@/config/candidatures';
import { arrondis, couleurs, espace, polices } from '@/config/theme';
import { dateLisible, jourDe, joursEntre } from '@/logique/dates';
import { candidaturesActives, emploiActuel, relanceDue } from '@/logique/tachesDuJour';
import { useApp } from '@/store/etat';
import type { StatutCandidature } from '@/store/types';

type Vue = 'en-cours' | 'historique';

export default function Candidatures() {
  const { etat } = useApp();
  const [vue, setVue] = useState<Vue>(etat.contexte === 'pro' ? 'historique' : 'en-cours');
  const [filtre, setFiltre] = useState<StatutCandidature | 'toutes'>('toutes');
  const [recherche, setRecherche] = useState('');
  const aujourdhui = jourDe();
  const emploi = emploiActuel(etat);

  const actives = useMemo(() => candidaturesActives(etat), [etat]);
  const idsActifs = useMemo(() => new Set(actives.map((c) => c.id)), [actives]);
  const base = vue === 'en-cours' ? actives : etat.candidatures.filter((c) => !idsActifs.has(c.id));

  const liste = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return base.filter(
      (c) =>
        (filtre === 'toutes' || c.statut === filtre) &&
        (!q || [c.entreprise, c.poste, c.email, c.note].some((texte) => texte?.toLowerCase().includes(q))),
    );
  }, [base, filtre, recherche]);

  const envoyees = actives.length;
  const entretiens = actives.filter((c) => c.statut === 'entretien' || c.statut === 'decroche').length;
  const aRelancer = actives.filter((c) => relanceDue(c, aujourdhui)).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: couleurs.creme }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
        <Text style={styles.titre}>{etat.contexte === 'pro' ? 'Mon parcours' : 'Candidatures'}</Text>

        {etat.contexte === 'pro' && emploi && (
          <Pressable style={styles.pro} onPress={() => router.push('/aventure-pro')} accessibilityRole="button">
            <Text style={{ fontSize: 28 }}>💼</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.proTitre}>Mon aventure professionnelle</Text>
              <Text style={styles.proSous}>
                {emploi.poste} chez {emploi.entreprise}
              </Text>
              <Text style={styles.proSous}>
                {emploi.objectifs.filter((o) => o.atteint).length}/{emploi.objectifs.length} objectif
                {emploi.objectifs.length > 1 ? 's' : ''} atteint{emploi.objectifs.filter((o) => o.atteint).length > 1 ? 's' : ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={couleurs.brun} />
          </Pressable>
        )}

        {etat.contexte === 'recherche' && (
          <View style={styles.stats}>
            <Stat valeur={envoyees} libelle="envoyées" />
            <Stat valeur={entretiens} libelle="entretiens" />
            <Stat valeur={aRelancer} libelle="à relancer" accent={aRelancer > 0} />
          </View>
        )}

        <View style={styles.onglets}>
          {(['en-cours', 'historique'] as Vue[]).map((v) => (
            <Pressable
              key={v}
              onPress={() => setVue(v)}
              accessibilityRole="tab"
              accessibilityState={{ selected: vue === v }}
              style={[styles.onglet, vue === v && styles.ongletActif]}>
              <Text style={[styles.ongletTexte, vue === v && { color: couleurs.brun }]}>
                {v === 'en-cours' ? 'Recherche en cours' : 'Historique'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.recherche}>
          <Ionicons name="search" size={18} color={couleurs.brunDoux} />
          <TextInput
            value={recherche}
            onChangeText={setRecherche}
            placeholder="Chercher une entreprise, un poste, une note…"
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
              {base.length > 0
                ? 'Rien ici avec ce filtre'
                : vue === 'historique'
                  ? 'Ton historique est vide'
                  : etat.contexte === 'pro'
                    ? 'Pas de recherche en cours'
                    : 'Aucune candidature pour l’instant'}
            </Text>
            <Text style={styles.videTexte}>
              {base.length > 0
                ? 'Essaie un autre filtre.'
                : vue === 'historique'
                  ? 'Tes anciennes candidatures et celles que tu archives apparaîtront ici.'
                  : etat.contexte === 'pro'
                    ? 'Tu pourras en recommencer une depuis « Mon aventure professionnelle ».'
                    : `Ajoute ta première candidature, ou juste une offre qui te plaît. ${etat.compagnon?.nom ?? ''} s’en souviendra pour toi.`}
            </Text>
          </View>
        ) : (
          liste.map((c) => {
            const s = statutParId(c.statut);
            const relance = relanceDue(c, aujourdhui);
            return (
              <Pressable
                key={c.id}
                style={styles.carte}
                onPress={() => router.push({ pathname: '/candidature/[id]', params: { id: c.id } })}
                accessibilityRole="button"
                accessibilityLabel={`${c.entreprise}, ${c.poste}, ${s.libelle}`}>
                <View style={styles.carteHaut}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.entreprise}>{c.entreprise}</Text>
                    <Text style={styles.poste}>{c.poste}</Text>
                  </View>
                  <View style={[styles.statut, { backgroundColor: s.fond }]}>
                    <Text style={[styles.statutTexte, { color: s.texte }]}>{s.libelle}</Text>
                  </View>
                </View>
                <Text style={styles.meta}>
                  {c.dateEnvoi ? `Envoyée le ${dateLisible(c.dateEnvoi)}` : 'Pas encore envoyée'}
                  {c.dateEntretien ? ` · Entretien le ${dateLisible(c.dateEntretien)}` : ''}
                  {c.archivee ? ' · Archivée' : ''}
                </Text>
                {relance && (
                  <Text style={styles.relance}>
                    Cette candidature date de {joursEntre(c.dateEnvoi!, aujourdhui)} jours. Pense à la relancer.
                  </Text>
                )}
              </Pressable>
            );
          })
        )}

        {etat.contexte === 'recherche' && vue === 'en-cours' && (
          <Pressable onPress={() => router.push('/decroche')} accessibilityRole="button" style={styles.decroche}>
            <Text style={styles.decrocheTexte}>🎉 J’ai décroché un poste</Text>
          </Pressable>
        )}
      </ScrollView>

      {etat.contexte === 'recherche' && (
        <Pressable
          style={styles.fab}
          onPress={() => router.push('/nouvelle-candidature')}
          accessibilityRole="button"
          accessibilityLabel="Ajouter une candidature">
          <Ionicons name="add" size={30} color={couleurs.blanc} />
        </Pressable>
      )}
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
  pro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.m,
    backgroundColor: couleurs.pecheClair,
    borderRadius: arrondis.m,
    padding: espace.l,
  },
  proTitre: { fontWeight: '800', color: couleurs.brun, fontSize: 16 },
  proSous: { fontWeight: '600', color: couleurs.brunDoux, fontSize: 13.5, marginTop: 2 },
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
  onglets: { flexDirection: 'row', backgroundColor: '#F3E8DD', borderRadius: 14, padding: 4 },
  onglet: { flex: 1, borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  ongletActif: { backgroundColor: couleurs.carte },
  ongletTexte: { fontWeight: '800', fontSize: 13.5, color: couleurs.brunDoux },
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
  statut: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  statutTexte: { fontSize: 12.5, fontWeight: '800' },
  meta: { fontSize: 13, fontWeight: '600', color: couleurs.brunDoux },
  relance: { fontSize: 13, fontWeight: '800', color: couleurs.renardFonce },
  decroche: { alignSelf: 'center', paddingVertical: espace.m, paddingHorizontal: espace.l },
  decrocheTexte: { fontWeight: '800', color: couleurs.corail, fontSize: 15 },
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
