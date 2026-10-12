/**
 * LA VILLE DU COMPAGNON (Clairebourg par défaut)
 * Son univers : ses lieux, sa propre recherche d'emploi (miroir de celle de l'utilisateur),
 * ses propres candidatures (mêmes entreprises que les tiennes), son poste une fois embauché,
 * sa chambre (à décorer avec les objets du Shop) et le souvenir de sa dernière aventure.
 * Base prévue pour la suite : déplacements, événements, rencontres, progression.
 */
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Compagnon } from '@/components/Compagnon';
import { VueChambre } from '@/components/VueChambre';
import { useMaintenant } from '@/hooks/useMaintenant';
import { arrondis, couleurs, espace, polices, relief } from '@/config/theme';
import { villeParId } from '@/config/villes';
import { useEspaceBarre } from '@/hooks/useEspaceBarre';
import { imageVille } from '@/illustrations/registre';
import { dateLisible } from '@/logique/dates';
import { compagnonAbsent, heureLisible, iconeMission, LIBELLES_ETAPES, lieuxDeMilo, ouEst, parcoursDuCompagnon, type EtapeLieu } from '@/logique/missions';
import { estEndormi } from '@/logique/rythme';
import { useApp } from '@/store/etat';

const COULEUR_ETAPE: Record<EtapeLieu, string> = {
  'a-visiter': couleurs.ligne,
  visite: couleurs.lac,
  candidature: couleurs.saugeFonce,
  embauche: couleurs.or,
};

export default function Ville() {
  const espaceBarre = useEspaceBarre();
  const { etat } = useApp();
  const maintenant = useMaintenant();
  if (!etat.villeId || !etat.compagnon) return null;
  const ville = villeParId(etat.villeId);
  const image = imageVille(ville.id, 'centre');
  const nom = etat.compagnon.nom;
  const dort = estEndormi(etat.rythme);
  // En mission, il n'est pas dans le centre-ville : on dit où il est
  const absent = compagnonAbsent(etat, maintenant);
  const suivi = lieuxDeMilo(etat);
  const derniere = etat.derniereAventure;
  const lieuAventure = ville.lieux.find((l) => l.id === derniere?.lieuId);
  // Ses propres candidatures, dans les lieux de sa ville
  const parcours = parcoursDuCompagnon(etat);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: couleurs.creme }} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.contenu, { paddingBottom: espaceBarre }]}>
        <Text style={styles.titre}>{ville.nom}</Text>

        <View style={[styles.carte, { backgroundColor: ville.couleur }]}>
          {image && <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" />}
          {absent?.retour ? (
            <Pressable style={styles.absent} onPress={() => router.push('/aventure')} accessibilityRole="button">
              <Text style={styles.absentTexte}>
                {iconeMission(absent)} {ouEst(etat, absent)} · Retour à {heureLisible(absent.retour)}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.compagnon}>
              <Compagnon espece={etat.compagnon.espece} pose={dort ? 'dort' : 'aventure'} taille={110} promenade={!dort} equipe={etat.equipe} />
            </View>
          )}
        </View>

        {/* Sa chambre : il y dort la nuit, on la décore avec les objets du Shop */}
        <Pressable onPress={() => router.push('/chambre')} accessibilityRole="button" accessibilityLabel={`La chambre de ${nom}`} style={styles.chambre}>
          <View style={styles.chambreEntete}>
            <Text style={styles.chambreTitre}>La chambre de {nom}</Text>
            <Text style={styles.chambreLien}>Décorer ›</Text>
          </View>
          <VueChambre
            ville={ville.id}
            chambre={etat.chambre ?? {}}
            compagnon={absent ? undefined : dort ? { espece: etat.compagnon.espece, pose: 'dort', equipe: etat.equipe } : undefined}
          />
        </Pressable>

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

        {parcours.length > 0 && (
          <>
            <Text style={styles.sousTitre}>Les candidatures de {nom}</Text>
            <View style={styles.bloc}>
              {parcours.map(({ candidature, icone, etape, accent }, i) => (
                <View key={candidature.id} style={[styles.lieu, i > 0 && styles.separateur]}>
                  <Text style={styles.icone}>{icone}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lieuNom}>{candidature.lieu}</Text>
                    <Text style={[styles.lieuEtat, accent && { color: couleurs.corail }]}>
                      {candidature.metier} · {etape}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sousTitre}>{etat.contexte === 'pro' ? `La vie de ${nom}` : `Les lieux de ${ville.nom}`}</Text>
        <View style={styles.bloc}>
          {suivi.map(({ lieu, etape }, i) => (
            <View key={lieu.id} style={[styles.lieu, i > 0 && styles.separateur]}>
              <View style={[styles.puce, { backgroundColor: COULEUR_ETAPE[etape] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.lieuNom}>{lieu.nom}</Text>
                <Text style={styles.lieuEtat}>
                  {etape === 'embauche' && etat.compagnon?.metier ? etat.compagnon.metier.intitule : lieu.metier} · {LIBELLES_ETAPES[etape]}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <Text style={styles.note}>
          {etat.contexte === 'pro'
            ? `${nom} a commencé son nouveau travail le même jour que toi. Chaque aventure lui fait découvrir un peu plus sa ville.`
            : `${nom} cherche son job en même temps que toi, dans les lieux de ${ville.nom}. Quand tu as des nouvelles (relance, entretien, réponse), il en a aussi, quelques jours après toi. Le jour où tu décroches ton poste, ${nom} décroche le sien.`}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenu: { padding: espace.l, gap: espace.m, paddingBottom: espace.xxl },
  chambre: { backgroundColor: couleurs.carte, borderRadius: arrondis.l, padding: espace.s, gap: espace.s, ...relief },
  chambreEntete: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: espace.s, paddingTop: 4 },
  chambreTitre: { fontFamily: polices.titre, fontSize: 16, fontWeight: '800', color: couleurs.brun },
  chambreLien: { fontSize: 13.5, fontWeight: '800', color: couleurs.renardFonce },
  titre: { fontFamily: polices.titre, fontSize: 26, fontWeight: '800', color: couleurs.brun },
  carte: { height: 330, borderRadius: arrondis.l, overflow: 'hidden', justifyContent: 'flex-end' },
  compagnon: { alignItems: 'center', paddingBottom: 6 },
  absent: { margin: espace.m, backgroundColor: couleurs.carte, borderRadius: arrondis.m, padding: espace.m },
  absentTexte: { fontWeight: '800', color: couleurs.brun, textAlign: 'center' },
  souvenir: { backgroundColor: couleurs.carte, borderRadius: arrondis.m, ...relief, padding: espace.l, gap: 4 },
  souvenirTitre: { fontSize: 12, fontWeight: '800', color: couleurs.renardFonce, textTransform: 'uppercase', letterSpacing: 0.4 },
  souvenirTexte: { fontSize: 14.5, fontWeight: '600', color: couleurs.brun, lineHeight: 20 },
  sousTitre: { fontFamily: polices.titre, fontSize: 18, fontWeight: '800', color: couleurs.brun, marginTop: espace.s },
  bloc: { backgroundColor: couleurs.carte, borderRadius: arrondis.m, ...relief },
  lieu: { flexDirection: 'row', alignItems: 'center', gap: espace.m, padding: espace.l },
  separateur: { borderTopWidth: 1, borderTopColor: couleurs.ligne },
  puce: { width: 12, height: 12, borderRadius: 6 },
  icone: { fontSize: 22 },
  lieuNom: { fontSize: 15, fontWeight: '800', color: couleurs.brun },
  lieuEtat: { fontSize: 13, fontWeight: '600', color: couleurs.brunDoux, marginTop: 2 },
  note: { fontSize: 13.5, color: couleurs.brunDoux, lineHeight: 19, fontWeight: '600' },
});
