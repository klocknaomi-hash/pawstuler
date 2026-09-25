/** NOUVELLE CANDIDATURE — formulaire court : l'essentiel d'abord, le reste facultatif. */
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Bouton, Champ, Ecran, Pastille, SousTitre, Titre } from '@/components/base';
import { espace } from '@/config/theme';
import { jourDe } from '@/logique/dates';
import { useApp } from '@/store/etat';

export default function NouvelleCandidature() {
  const { dispatch } = useApp();
  const [entreprise, setEntreprise] = useState('');
  const [poste, setPoste] = useState('');
  const [lien, setLien] = useState('');
  const [contact, setContact] = useState('');
  const [note, setNote] = useState('');
  const [envoyee, setEnvoyee] = useState(true);

  const pret = entreprise.trim().length > 0 && poste.trim().length > 0;

  function enregistrer() {
    dispatch({
      type: 'AJOUTER_CANDIDATURE',
      candidature: {
        entreprise: entreprise.trim(),
        poste: poste.trim(),
        lien: lien.trim() || undefined,
        contact: contact.trim() || undefined,
        note: note.trim() || undefined,
        statut: envoyee ? 'envoyee' : 'a-envoyer',
        dateEnvoi: envoyee ? jourDe() : undefined,
      },
    });
    router.back();
  }

  return (
    <Ecran
      defilant
      bas={
        <View style={styles.boutons}>
          <Bouton titre="Annuler" variante="secondaire" onPress={() => router.back()} style={{ flex: 1 }} />
          <Bouton titre="Ajouter" desactive={!pret} onPress={enregistrer} style={{ flex: 1 }} />
        </View>
      }>
      <Titre>Nouvelle candidature</Titre>
      <Champ label="Entreprise" value={entreprise} onChangeText={setEntreprise} placeholder="Ex. Studio Ardoise" autoFocus />
      <Champ label="Poste" value={poste} onChangeText={setPoste} placeholder="Ex. Chargé·e de communication" />

      <View style={{ gap: espace.s }}>
        <SousTitre>Où en es-tu ?</SousTitre>
        <View style={styles.pastilles}>
          <Pastille libelle="Déjà envoyée" choisi={envoyee} onPress={() => setEnvoyee(true)} />
          <Pastille libelle="À envoyer" choisi={!envoyee} onPress={() => setEnvoyee(false)} />
        </View>
      </View>

      <Champ
        label="Lien de l’annonce (facultatif)"
        value={lien}
        onChangeText={setLien}
        placeholder="https://…"
        autoCapitalize="none"
        keyboardType="url"
      />
      <Champ label="Contact (facultatif)" value={contact} onChangeText={setContact} placeholder="Ex. Léa, RH" />
      <Champ
        label="Note (facultatif)"
        value={note}
        onChangeText={setNote}
        placeholder="Ce qui t’a plu, ce qu’on t’a dit…"
        multiline
        style={{ minHeight: 90, textAlignVertical: 'top' }}
      />
    </Ecran>
  );
}

const styles = StyleSheet.create({
  boutons: { flexDirection: 'row', gap: espace.s },
  pastilles: { flexDirection: 'row', gap: espace.s },
});
