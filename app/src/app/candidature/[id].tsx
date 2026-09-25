/**
 * FICHE CANDIDATURE
 * Tout sur une candidature : statut, entretien, note, historique, archivage.
 * Un refus fait réagir le compagnon ; une offre ou un entretien ouvre « J'ai décroché ! ».
 */
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Bouton, Champ, Ecran, SousTitre, Titre } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { STATUTS, statutParId } from '@/config/candidatures';
import { arrondis, couleurs, espace } from '@/config/theme';
import { dateEnSaisie, dateLisible, jourDe, joursEntre, lireDateFr } from '@/logique/dates';
import { relanceDue } from '@/logique/tachesDuJour';
import { useApp } from '@/store/etat';

export default function FicheCandidature() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { etat, dispatch } = useApp();
  const c = etat.candidatures.find((x) => x.id === id);
  const [note, setNote] = useState(c?.note ?? '');
  const [entretien, setEntretien] = useState(dateEnSaisie(c?.dateEntretien));
  const [erreurDate, setErreurDate] = useState('');

  if (!c) {
    return (
      <Ecran avecEntete>
        <Titre>Candidature introuvable</Titre>
        <Bouton titre="Retour" onPress={() => router.back()} />
      </Ecran>
    );
  }

  const nomCompagnon = etat.compagnon?.nom ?? 'Ton compagnon';
  const peutDecrocher = etat.contexte === 'recherche' && (c.statut === 'entretien' || c.statut === 'offre');

  function enregistrerEntretien() {
    if (!entretien.trim()) return dispatch({ type: 'MODIFIER_CANDIDATURE', id: c!.id, modifs: { dateEntretien: undefined } });
    const iso = lireDateFr(entretien);
    if (!iso) return setErreurDate('Date non reconnue. Exemple : 30/09 ou 30/09/2026.');
    setErreurDate('');
    dispatch({ type: 'MODIFIER_CANDIDATURE', id: c!.id, modifs: { dateEntretien: iso } });
  }

  return (
    <Ecran
      defilant
      avecEntete
      bas={
        peutDecrocher ? (
          <Bouton
            titre="🎉 J’ai décroché !"
            variante="victoire"
            onPress={() => router.push({ pathname: '/decroche', params: { candidatureId: c.id } })}
          />
        ) : undefined
      }>
      <View style={{ gap: 4 }}>
        <Titre>{c.entreprise}</Titre>
        <Text style={styles.poste}>{c.poste}</Text>
        {c.contact ? <Text style={styles.meta}>Contact : {c.contact}</Text> : null}
        {c.lien ? (
          <Pressable onPress={() => Linking.openURL(c.lien!.startsWith('http') ? c.lien! : `https://${c.lien}`)} accessibilityRole="link">
            <Text style={styles.lien} numberOfLines={1}>
              Voir l’annonce
            </Text>
          </Pressable>
        ) : null}
      </View>

      {relanceDue(c, jourDe()) && (
        <View style={styles.alerte}>
          <Ionicons name="notifications-outline" size={18} color={couleurs.renardFonce} />
          <Text style={styles.alerteTexte}>
            Cette candidature date de {joursEntre(c.dateEnvoi!)} jours. Pense à la relancer, puis passe-la en « Relancée ».
          </Text>
        </View>
      )}

      <View style={{ gap: espace.s }}>
        <SousTitre>Où en est-elle ?</SousTitre>
        <View style={styles.statuts}>
          {STATUTS.map((s) => {
            const actif = c.statut === s.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => dispatch({ type: 'CHANGER_STATUT', id: c.id, statut: s.id })}
                accessibilityRole="radio"
                accessibilityState={{ selected: actif }}
                style={[styles.statut, { backgroundColor: actif ? s.fond : couleurs.carte, borderColor: actif ? s.fond : couleurs.ligne }]}>
                <Text style={[styles.statutTexte, { color: actif ? s.texte : couleurs.brun }]}>{s.libelle}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {c.statut === 'refus' && (
        <View style={styles.reconfort}>
          <Compagnon espece={etat.compagnon?.espece ?? 'renard'} pose="reconfort" taille={90} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.reconfortTexte}>« Leur perte. On en envoie une autre ensemble ? 🐾 »</Text>
            <Text style={styles.meta}>{nomCompagnon}. Tu as osé, et ça compte.</Text>
          </View>
        </View>
      )}

      {(c.statut === 'entretien' || c.dateEntretien) && (
        <View style={{ gap: 4 }}>
          <Champ
            label="Date de l’entretien"
            value={entretien}
            onChangeText={setEntretien}
            onBlur={enregistrerEntretien}
            placeholder="Ex. 30/09"
            keyboardType="numbers-and-punctuation"
          />
          {erreurDate ? <Text style={styles.erreur}>{erreurDate}</Text> : null}
        </View>
      )}

      <Champ
        label="Note"
        value={note}
        onChangeText={setNote}
        onBlur={() => dispatch({ type: 'MODIFIER_CANDIDATURE', id: c.id, modifs: { note: note.trim() || undefined } })}
        placeholder="Ce qui s’est dit, le nom du recruteur, ton ressenti…"
        multiline
        style={{ minHeight: 90, textAlignVertical: 'top' }}
      />

      <View style={{ gap: espace.s }}>
        <SousTitre>Historique</SousTitre>
        <View style={styles.historique}>
          {[...c.historique].reverse().map((h, i) => (
            <View key={`${h.statut}-${i}`} style={styles.etape}>
              <View style={[styles.puce, { backgroundColor: statutParId(h.statut).fond }]} />
              <Text style={styles.etapeTexte}>{statutParId(h.statut).libelle}</Text>
              <Text style={styles.meta}>{dateLisible(h.le)}</Text>
            </View>
          ))}
        </View>
      </View>

      <Bouton
        titre={c.archivee ? 'Remettre dans la recherche' : 'Archiver'}
        variante="secondaire"
        onPress={() => dispatch({ type: 'ARCHIVER_CANDIDATURE', id: c.id, archivee: !c.archivee })}
      />
      <Text style={styles.note}>Archiver range la candidature dans ton historique. Elle n’est jamais supprimée.</Text>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  poste: { fontSize: 16, fontWeight: '700', color: couleurs.brunDoux },
  meta: { fontSize: 13, fontWeight: '600', color: couleurs.brunDoux },
  lien: { fontSize: 14, fontWeight: '800', color: couleurs.renardFonce, marginTop: 4 },
  alerte: {
    flexDirection: 'row',
    gap: espace.s,
    alignItems: 'center',
    backgroundColor: couleurs.pecheClair,
    borderRadius: arrondis.m,
    padding: espace.m,
  },
  alerteTexte: { flex: 1, fontWeight: '700', color: couleurs.brun, lineHeight: 19 },
  statuts: { flexDirection: 'row', flexWrap: 'wrap', gap: espace.s },
  statut: { borderRadius: 999, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 9 },
  statutTexte: { fontWeight: '800', fontSize: 14 },
  reconfort: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.m,
    backgroundColor: '#F4EEF8',
    borderRadius: arrondis.l,
    padding: espace.m,
  },
  reconfortTexte: { fontWeight: '800', color: couleurs.brun, fontSize: 15, lineHeight: 20 },
  erreur: { color: couleurs.danger, fontWeight: '600', fontSize: 13 },
  historique: {
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.m,
    borderWidth: 1,
    borderColor: couleurs.ligne,
    padding: espace.m,
    gap: espace.s,
  },
  etape: { flexDirection: 'row', alignItems: 'center', gap: espace.s },
  puce: { width: 12, height: 12, borderRadius: 6 },
  etapeTexte: { flex: 1, fontWeight: '700', color: couleurs.brun },
  note: { fontSize: 12.5, color: couleurs.brunDoux, textAlign: 'center' },
});
