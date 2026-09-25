/**
 * NOUVELLE CANDIDATURE
 * Comme une ligne de tableau de suivi, en plus simple : entreprise et poste (obligatoires),
 * lien de l'offre, statut actuel (on peut reprendre une candidature déjà avancée),
 * adresse e-mail, date d'envoi et note libre.
 * L'historique est créé automatiquement. Si la candidature est déjà « Décroché »,
 * la page de félicitations s'ouvre juste après.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Bouton, Champ, Ecran, SousTitre, Titre } from '@/components/base';
import { ChoixStatut } from '@/components/ChoixStatut';
import { emailValide } from '@/config/candidatures';
import { couleurs, espace } from '@/config/theme';
import { dateEnSaisie, jourDe, lireDateFr } from '@/logique/dates';
import { useApp } from '@/store/etat';
import type { StatutCandidature } from '@/store/types';

export default function NouvelleCandidature() {
  const { etat, dispatch } = useApp();
  const [entreprise, setEntreprise] = useState('');
  const [poste, setPoste] = useState('');
  const [lien, setLien] = useState('');
  const [statut, setStatut] = useState<StatutCandidature>('envoyee');
  const [email, setEmail] = useState('');
  const [dateEnvoi, setDateEnvoi] = useState(dateEnSaisie(jourDe()));
  const [note, setNote] = useState('');
  const [erreur, setErreur] = useState('');

  const pret = entreprise.trim().length > 0 && poste.trim().length > 0;

  function enregistrer() {
    const date = dateEnvoi.trim() ? lireDateFr(dateEnvoi) : jourDe();
    if (!date) return setErreur('Date d’envoi non reconnue. Exemple : 25/09 ou 25/09/2026.');
    if (date > jourDe()) return setErreur('La date d’envoi ne peut pas être dans le futur.');
    if (email.trim() && !emailValide(email)) return setErreur('Cette adresse e-mail ne semble pas complète.');
    dispatch({
      type: 'AJOUTER_CANDIDATURE',
      candidature: {
        entreprise: entreprise.trim(),
        poste: poste.trim(),
        lien: lien.trim() || undefined,
        email: email.trim() || undefined,
        note: note.trim() || undefined,
        statut,
        dateEnvoi: date,
      },
    });
    router.back();
    // Décroché dès la création : on fête ça tout de suite
    if (statut === 'decroche') {
      setTimeout(() => router.push({ pathname: '/felicitations', params: { entreprise: entreprise.trim(), poste: poste.trim() } }), 350);
    }
  }

  return (
    <Ecran
      defilant
      bas={
        <View style={styles.boutons}>
          <Bouton titre="Annuler" variante="secondaire" onPress={() => router.back()} style={{ flex: 0.7 }} />
          <Bouton titre="Ajouter la candidature" desactive={!pret} onPress={enregistrer} style={{ flex: 2 }} />
        </View>
      }>
      <Titre>Nouvelle candidature</Titre>
      <Champ label="Entreprise" value={entreprise} onChangeText={setEntreprise} placeholder="Ex. EDF" autoFocus />
      <Champ label="Poste" value={poste} onChangeText={setPoste} placeholder="Ex. Chargé·e de clientèle" />
      <Champ
        label="Lien de l’offre (facultatif)"
        value={lien}
        onChangeText={setLien}
        placeholder="Colle ici le lien de l’annonce"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />

      <View style={{ gap: espace.s }}>
        <SousTitre>Où en est-elle ?</SousTitre>
        <Text style={styles.aide}>Choisis l’étape où elle se trouve vraiment, même si tu l’as commencée ailleurs.</Text>
        <ChoixStatut valeur={statut} onChange={setStatut} />
      </View>

      <Champ
        label="Adresse e-mail (facultatif)"
        value={email}
        onChangeText={setEmail}
        placeholder="Ex. recrutement@entreprise.com"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <Champ
        label="Date d’envoi"
        value={dateEnvoi}
        onChangeText={setDateEnvoi}
        placeholder="Ex. 25/09"
        keyboardType="numbers-and-punctuation"
      />
      <Champ
        label="Note (facultatif)"
        value={note}
        onChangeText={setNote}
        placeholder="Ex. Vu sur LinkedIn, recommandée par Sarah…"
        multiline
        style={{ minHeight: 90, textAlignVertical: 'top' }}
      />
      {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}
      {etat.compagnon && <Text style={styles.aide}>{etat.compagnon.nom} suivra cette candidature avec toi 🐾</Text>}
    </Ecran>
  );
}

const styles = StyleSheet.create({
  boutons: { flexDirection: 'row', gap: espace.s },
  aide: { fontSize: 13, color: couleurs.brunDoux, fontWeight: '600', lineHeight: 18 },
  erreur: { color: couleurs.danger, fontWeight: '700', fontSize: 13.5 },
});
