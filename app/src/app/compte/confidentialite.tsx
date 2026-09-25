/**
 * COMPTE › CONFIDENTIALITÉ ET RGPD
 * Ce que l'app garde, où, et les droits de l'utilisateur, avec les actions correspondantes.
 * Texte à faire relire avant publication (mentions légales, contact du responsable).
 */
import { StyleSheet, Text, View } from 'react-native';

import { Bouton, Ecran, SousTitre } from '@/components/base';
import { arrondis, couleurs, espace } from '@/config/theme';
import { exporterDonnees } from '@/services/compte';
import { useApp } from '@/store/etat';

const SECTIONS = [
  {
    titre: 'Les données que tu nous confies',
    texte:
      'Ton prénom, ton adresse e-mail si tu t’inscris par e-mail, ton compagnon et sa ville, tes tâches, tes pièces, tes candidatures (entreprise, poste, lien, contact, dates, notes) et tes objectifs professionnels.',
  },
  {
    titre: 'Où elles sont gardées',
    texte:
      'Pour l’instant, toutes tes données restent sur ce téléphone. Elles ne sont ni vendues ni partagées. Elles servent uniquement à faire fonctionner l’app et à te proposer des tâches adaptées.',
  },
  {
    titre: 'Tes droits',
    texte:
      'Tu peux à tout moment consulter tes données, les corriger (depuis ton profil ou tes candidatures), les récupérer (export ci-dessous) et les effacer (suppression du compte). Ce sont tes droits d’accès, de rectification, de portabilité et d’effacement prévus par le RGPD.',
  },
];

export default function Confidentialite() {
  const { etat } = useApp();
  return (
    <Ecran defilant avecEntete>
      {SECTIONS.map((s) => (
        <View key={s.titre} style={styles.bloc}>
          <SousTitre>{s.titre}</SousTitre>
          <Text style={styles.texte}>{s.texte}</Text>
        </View>
      ))}
      <Bouton titre="Exporter mes données" variante="secondaire" onPress={() => exporterDonnees(etat)} />
      <Text style={styles.note}>La suppression du compte se fait depuis la page Compte, en bas de la liste.</Text>
      <Text style={styles.note}>Les coordonnées du responsable des données seront indiquées ici avant la publication de l’app.</Text>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  bloc: { backgroundColor: couleurs.carte, borderRadius: arrondis.m, borderWidth: 1, borderColor: couleurs.ligne, padding: espace.l, gap: espace.s },
  texte: { fontSize: 14.5, lineHeight: 21, color: couleurs.brun, fontWeight: '500' },
  note: { fontSize: 12.5, color: couleurs.brunDoux, textAlign: 'center', lineHeight: 18 },
});
