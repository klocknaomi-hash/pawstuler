/**
 * NOUVELLE CANDIDATURE
 * Comme une ligne de tableau de suivi, en plus simple : entreprise et poste (obligatoires :
 * le bouton reste gris tant qu'ils sont vides, puis devient orange), lien de l'offre, statut actuel
 * (on peut reprendre une candidature déjà avancée ; un entretien demande sa date), adresse e-mail,
 * date d'envoi, relance prévue (+1, +3 ou +5 jours après l'envoi) et note libre.
 * L'historique est créé automatiquement. Si la candidature est déjà « Décroché »,
 * la page de félicitations s'ouvre juste après.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Bouton, Champ, Ecran, Pastille, SousTitre, Titre } from '@/components/base';
import { ChoixStatut } from '@/components/ChoixStatut';
import { emailValide } from '@/config/candidatures';
import { DELAIS_RELANCE } from '@/config/missions';
import { couleurs, espace } from '@/config/theme';
import { ajouterJours } from '@/logique/missions';
import { dateEnSaisie, dateLisible, jourDe, lireDateFr } from '@/logique/dates';
import { useApp } from '@/store/etat';
import type { StatutCandidature } from '@/store/types';

export default function NouvelleCandidature() {
  const { dispatch } = useApp();
  const [entreprise, setEntreprise] = useState('');
  const [poste, setPoste] = useState('');
  const [lien, setLien] = useState('');
  const [statut, setStatut] = useState<StatutCandidature>('envoyee');
  const [email, setEmail] = useState('');
  const [dateEnvoi, setDateEnvoi] = useState(dateEnSaisie(jourDe()));
  const [note, setNote] = useState('');
  const [relance, setRelance] = useState<number | null>(null);
  const [entretien, setEntretien] = useState('');
  const [erreur, setErreur] = useState('');

  // Obligatoire : entreprise et poste (et la date si c'est déjà un entretien)
  const pret = entreprise.trim().length > 0 && poste.trim().length > 0 && (statut !== 'entretien' || entretien.trim().length > 0);
  const envoiLu = (dateEnvoi.trim() ? lireDateFr(dateEnvoi) : jourDe()) ?? jourDe();

  function enregistrer() {
    const date = dateEnvoi.trim() ? lireDateFr(dateEnvoi) : jourDe();
    if (!date) return setErreur('Date d’envoi non reconnue. Exemple : 25/09 ou 25/09/2026.');
    if (date > jourDe()) return setErreur('La date d’envoi ne peut pas être dans le futur.');
    if (email.trim() && !emailValide(email)) return setErreur('Cette adresse e-mail ne semble pas complète.');
    const dateEntretien = statut === 'entretien' ? lireDateFr(entretien) : undefined;
    if (statut === 'entretien' && !dateEntretien) return setErreur('Date d’entretien non reconnue. Exemple : 28/09.');
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
        dateEntretien,
        relancePrevue: relance !== null && (statut === 'envoyee' || statut === 'relancee') ? ajouterJours(date, relance) : undefined,
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
      <Champ label="Entreprise *" value={entreprise} onChangeText={setEntreprise} placeholder="Ex. EDF" autoFocus />
      <Champ label="Poste *" value={poste} onChangeText={setPoste} placeholder="Ex. Chargé·e de clientèle" />
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
      {statut === 'entretien' && (
        <Champ
          label="Date de l’entretien *"
          value={entretien}
          onChangeText={setEntretien}
          placeholder="Ex. 28/09"
          keyboardType="numbers-and-punctuation"
        />
      )}

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
      {(statut === 'envoyee' || statut === 'relancee') && (
        <View style={{ gap: espace.s }}>
          <Text style={styles.label}>Relancer (facultatif)</Text>
          <View style={styles.pastilles}>
            {DELAIS_RELANCE.map((j) => (
              <Pastille key={j} libelle={`+${j} jour${j > 1 ? 's' : ''}`} choisi={relance === j} onPress={() => setRelance(relance === j ? null : j)} />
            ))}
          </View>
          {relance !== null && <Text style={styles.aide}>Relance prévue le {dateLisible(ajouterJours(envoiLu, relance))} : on te le rappellera ce jour-là.</Text>}
        </View>
      )}
      <Champ
        label="Note (facultatif)"
        value={note}
        onChangeText={setNote}
        placeholder="Ex. Vu sur LinkedIn, recommandée par Sarah…"
        multiline
        style={{ minHeight: 90, textAlignVertical: 'top' }}
      />
      {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}
      <Text style={styles.aide}>* Champs obligatoires</Text>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  boutons: { flexDirection: 'row', gap: espace.s },
  label: { fontSize: 12.5, fontWeight: '800', color: couleurs.brunDoux, textTransform: 'uppercase', letterSpacing: 0.6 },
  pastilles: { flexDirection: 'row', flexWrap: 'wrap', gap: espace.s },
  aide: { fontSize: 13, color: couleurs.brunDoux, fontWeight: '600', lineHeight: 18 },
  erreur: { color: couleurs.danger, fontWeight: '700', fontSize: 13.5 },
});
