/**
 * LA VILLE DU COMPAGNON (Clairebourg par défaut)
 * Son univers : ses lieux, sa propre recherche d'emploi (miroir de celle de l'utilisateur),
 * son poste une fois embauché, et le souvenir de sa dernière aventure.
 * Base prévue pour la suite : déplacements, événements, rencontres, progression.
 */
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Compagnon } from '@/components/Compagnon';
import { arrondis, couleurs, espace, polices } from '@/config/theme';
import { villeParId } from '@/config/villes';
import { imageVille } from '@/illustrations/registre';
import { LIBELLES_ETAPES, rechercheDuCompagnon, type EtapeLieu } from '@/logique/compagnon';
import { dateLisible } from '@/logique/dates';
import { estEndormi } from '@/logique/rythme';
import { useApp } from '@/store/etat';

const COULEUR_ETAPE: Record<EtapeLieu, string> = {
  'a-visiter': couleurs.ligne,
  visite: couleurs.lac,
  candidature: couleurs.saugeFonce,
  entretien: couleurs.corail,
  embauche: couleurs.or,
};

export default function Ville() {
  const { etat } = useApp();
  if (!etat.villeId || !etat.compagnon) return null;
  const ville = villeParId(etat.villeId);
  const image = imageVille(ville.id, 'paysage');
  const nom = etat.compagnon.nom;
  const dort = estEndormi(etat.rythme);
  const suivi = rechercheDuCompagnon(etat);
  const derniere = etat.derniereAventure;
  const lieuAventure = ville.lieux.find((l) => l.id === derniere?.lieuId);

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

        {derniere && (
          <Pressable style={styles.souvenir} onPress={() => router.push('/aventure')} accessibilityRole="button">
            <Text style={styles.souvenirTitre}>
              Dernière aventure · {dateLisible(derniere.le)}
              {lieuAventure ? ` · ${lieuAventure.nom}` : ''}
            </Text>
            <Text style={styles.souvenirTexte} numberOfLines={3}>
              {derniere.texte}
            </Text>
          </Pressable>
        )}

        <Text style={styles.sousTitre}>{etat.contexte === 'pro' ? `La vie de ${nom}` : `La recherche de ${nom}`}</Text>
        <View style={styles.bloc}>
          {suivi.map(({ lieu, etape }, i) => (
            <View key={lieu.id} style={[styles.lieu, i > 0 && styles.separateur]}>
              <View style={[styles.puce, { backgroundColor: COULEUR_ETAPE[etape] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.lieuNom}>{lieu.nom}</Text>
                <Text style={[styles.lieuEtat, etape === 'entretien' && { color: couleurs.corail }]}>
                  {etape === 'embauche' && etat.compagnon?.metier ? etat.compagnon.metier.intitule : lieu.metier} · {LIBELLES_ETAPES[etape]}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <Text style={styles.note}>
          {etat.contexte === 'pro'
            ? `${nom} a commencé son nouveau travail le même jour que toi. Chaque aventure lui fait découvrir un peu plus sa ville.`
            : `Chaque candidature que tu envoies, ${nom} en dépose une aussi. Le jour où tu décroches ton poste, ${nom} décroche le sien.`}
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
  souvenir: { backgroundColor: couleurs.carte, borderRadius: arrondis.m, borderWidth: 1, borderColor: couleurs.ligne, padding: espace.l, gap: 4 },
  souvenirTitre: { fontSize: 12, fontWeight: '800', color: couleurs.renardFonce, textTransform: 'uppercase', letterSpacing: 0.4 },
  souvenirTexte: { fontSize: 14.5, fontWeight: '600', color: couleurs.brun, lineHeight: 20 },
  sousTitre: { fontFamily: polices.titre, fontSize: 19, fontWeight: '800', color: couleurs.brun, marginTop: espace.s },
  bloc: { backgroundColor: couleurs.carte, borderRadius: arrondis.m, borderWidth: 1, borderColor: couleurs.ligne },
  lieu: { flexDirection: 'row', alignItems: 'center', gap: espace.m, padding: espace.l },
  separateur: { borderTopWidth: 1, borderTopColor: couleurs.ligne },
  puce: { width: 12, height: 12, borderRadius: 6 },
  lieuNom: { fontSize: 15, fontWeight: '800', color: couleurs.brun },
  lieuEtat: { fontSize: 13, fontWeight: '600', color: couleurs.brunDoux, marginTop: 2 },
  note: { fontSize: 13.5, color: couleurs.brunDoux, lineHeight: 19, fontWeight: '600' },
});
