/**
 * LA VILLE DU COMPAGNON
 * Son univers : ses lieux, et sa propre recherche d'emploi, en miroir de celle de l'utilisateur.
 * Base prévue pour la suite : déplacements, événements, rencontres, progression professionnelle.
 */
import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { imageVille } from '@/illustrations/registre';
import { Compagnon } from '@/components/Compagnon';
import { arrondis, couleurs, espace, polices } from '@/config/theme';
import { villeParId } from '@/config/villes';
import { estEndormi } from '@/logique/rythme';
import { useApp } from '@/store/etat';

export default function Ville() {
  const { etat } = useApp();
  if (!etat.villeId || !etat.compagnon) return null;
  const ville = villeParId(etat.villeId);
  const image = imageVille(ville.id, 'paysage');
  const nom = etat.compagnon.nom;
  const dort = estEndormi(etat.rythme);

  // Miroir : la recherche du compagnon avance au rythme de celle de l'utilisateur
  const envoyees = etat.candidatures.filter((c) => c.statut !== 'a-envoyer').length;
  const entretien = etat.candidatures.some((c) => c.statut === 'entretien' || c.statut === 'offre');
  const lieuxMetier = ville.lieux.filter((l) => l.metier);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: couleurs.creme }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <Text style={styles.titre}>{ville.nom}</Text>

        <View style={[styles.carte, { backgroundColor: ville.couleur }]}>
          {image && <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" />}
          <View style={styles.compagnon}>
            <Compagnon espece={etat.compagnon.espece} pose={dort ? 'dort' : 'aventure'} taille={110} promenade={!dort} />
          </View>
        </View>

        <Text style={styles.sousTitre}>La recherche de {nom}</Text>
        <View style={styles.bloc}>
          {lieuxMetier.map((l, i) => {
            // Le compagnon postule dans autant de lieux que l'utilisateur a envoyé de candidatures
            const postule = i < envoyees;
            const convoque = postule && entretien && i === 0;
            return (
              <View key={l.id} style={[styles.lieu, i > 0 && styles.separateur]}>
                <View style={[styles.puce, postule && { backgroundColor: couleurs.saugeFonce }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.lieuNom}>{l.nom}</Text>
                  <Text style={[styles.lieuEtat, convoque && { color: couleurs.corail }]}>
                    {l.metier} · {convoque ? 'Entretien prévu !' : postule ? 'Candidature déposée' : 'Pas encore visité'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
        <Text style={styles.note}>
          Chaque candidature que tu envoies, {nom} en dépose une aussi. Le jour où tu décroches ton poste, {nom} décroche le sien.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenu: { padding: espace.l, gap: espace.m, paddingBottom: espace.xxl },
  titre: { fontFamily: polices.titre, fontSize: 28, fontWeight: '800', color: couleurs.brun },
  carte: { height: 210, borderRadius: arrondis.l, overflow: 'hidden', justifyContent: 'flex-end' },
  compagnon: { alignItems: 'center', paddingBottom: 6 },
  sousTitre: { fontFamily: polices.titre, fontSize: 19, fontWeight: '800', color: couleurs.brun, marginTop: espace.s },
  bloc: { backgroundColor: couleurs.carte, borderRadius: arrondis.m, borderWidth: 1, borderColor: couleurs.ligne },
  lieu: { flexDirection: 'row', alignItems: 'center', gap: espace.m, padding: espace.l },
  separateur: { borderTopWidth: 1, borderTopColor: couleurs.ligne },
  puce: { width: 12, height: 12, borderRadius: 6, backgroundColor: couleurs.ligne },
  lieuNom: { fontSize: 15, fontWeight: '800', color: couleurs.brun },
  lieuEtat: { fontSize: 13, fontWeight: '600', color: couleurs.brunDoux, marginTop: 2 },
  note: { fontSize: 13.5, color: couleurs.brunDoux, lineHeight: 19, fontWeight: '600' },
});
