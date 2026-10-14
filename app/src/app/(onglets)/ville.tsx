/**
 * LA VILLE DU COMPAGNON (Clairebourg ou Sunnyville)
 * L'endroit où l'on suit Milo quand il explore — l'accueil, lui, montre sa chambre.
 *  - En haut, une grande scène animée qui montre ce qu'il fait en ce moment :
 *    il se promène près du lac (avant l'aventure), il dort chez lui (la nuit),
 *    il marche sur le chemin (le décor défile), il est sur place (dans le lieu visité),
 *    il rentre, puis il revient avec un récit à découvrir.
 *  - Pendant l'aventure, la progression du trajet en temps réel : départ → lieu → retour.
 *  - Les lieux de la ville, comme un parcours d'étapes (à la façon des voyages de Finch) :
 *    chacun avec son image, « à découvrir » ou découvert, et ce que Milo y a fait.
 *  - Ses propres candidatures (dans les lieux de sa ville, sans lien avec les tiennes).
 */
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AventureDuJour } from '@/components/AventureDuJour';
import { Compagnon } from '@/components/Compagnon';
import { SceneAventure } from '@/components/SceneAventure';
import { VueChambre } from '@/components/VueChambre';
import { arrondis, couleurs, espace, ombre, polices, relief } from '@/config/theme';
import { villeParId } from '@/config/villes';
import { useEspaceBarre } from '@/hooks/useEspaceBarre';
import { useMaintenant } from '@/hooks/useMaintenant';
import { imageDecor, imageVille } from '@/illustrations/registre';
import { dateLisible } from '@/logique/dates';
import { decorDeMission } from '@/logique/decors';
import {
  avanceeTrajet,
  compagnonAbsent,
  heureLisible,
  iconeMission,
  LIBELLES_ETAPES,
  lieuDeMission,
  ouEst,
  parcoursDeLaVille,
  parcoursDuCompagnon,
  resultatADecouvrir,
  type EtapeLieu,
} from '@/logique/missions';
import { estEndormi, heureLisible as heureRythme } from '@/logique/rythme';
import { useApp } from '@/store/etat';

/** Hauteur de la grande scène de la ville. */
const HAUTEUR_SCENE = 380;

const STYLE_ETAPE: Record<EtapeLieu, { fond: string; texte: string }> = {
  'a-visiter': { fond: couleurs.creme, texte: couleurs.brunDoux },
  visite: { fond: '#E1F1F5', texte: '#2E6A7A' },
  candidature: { fond: couleurs.saugeClair, texte: couleurs.saugeFonce },
  embauche: { fond: couleurs.orClair, texte: '#8A5A10' },
};

export default function Ville() {
  const espaceBarre = useEspaceBarre();
  const { etat } = useApp();
  // Rafraîchi toutes les 5 s : la progression du trajet avance en direct
  const maintenant = useMaintenant(5000);
  if (!etat.villeId || !etat.compagnon) return null;
  const ville = villeParId(etat.villeId);
  const compagnon = etat.compagnon;
  const nom = compagnon.nom;
  const dort = estEndormi(etat.rythme);
  const absent = compagnonAbsent(etat, maintenant);
  const revenu = resultatADecouvrir(etat, maintenant);
  const lieux = parcoursDeLaVille(etat, absent);
  const decouverts = lieux.filter((l) => l.etape !== 'a-visiter').length;
  const candidatures = parcoursDuCompagnon(etat);

  // Ce que dit la petite étiquette en haut de la scène
  let etiquette: string;
  if (absent) etiquette = `${iconeMission(absent)} ${ouEst(etat, absent)}`;
  else if (revenu) etiquette = `🎒 ${nom} est rentré${compagnon.pronoms === 'elle' ? 'e' : ''} : découvre son aventure !`;
  else if (dort) etiquette = `🌙 ${nom} dort chez lui · réveil à ${heureRythme(etat.rythme.reveil)}`;
  else etiquette = `🌿 ${nom} se promène ${ville.baignade.ou === 'au lac' ? 'près du lac' : 'près de la fontaine'}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: couleurs.creme }} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.contenu, { paddingBottom: espaceBarre }]}>
        <View style={styles.entete}>
          <Text style={styles.titre}>{ville.nom}</Text>
          <Text style={styles.decouverts}>
            {decouverts}/{lieux.length} lieux découverts
          </Text>
        </View>

        {/* La grande scène : ce que fait Milo, en ce moment */}
        <View style={styles.scene}>
          {absent ? (
            <SceneAventure
              mission={absent}
              espece={compagnon.espece}
              equipe={etat.equipe}
              decor={decorDeMission(etat, absent)}
              ville={etat.villeId}
              hauteur={HAUTEUR_SCENE}
              taille={100}
            />
          ) : dort ? (
            <>
              {/* La nuit, il dort chez lui */}
              <VueChambre ville={ville.id} chambre={etat.chambre ?? {}} hauteurFixe={HAUTEUR_SCENE} style={{ borderRadius: 0 }} />
              <View style={[StyleSheet.absoluteFill, styles.nuit]} />
              <View style={styles.sol} pointerEvents="none">
                <Compagnon espece={compagnon.espece} pose="dort" taille={130} equipe={etat.equipe} />
              </View>
            </>
          ) : (
            <>
              {/* Avant l'aventure (ou de retour) : il se promène dans sa ville, près du lac */}
              <Image source={imageVille(ville.id, 'portrait')} style={StyleSheet.absoluteFill} contentFit="cover" />
              <Pressable
                style={styles.sol}
                onPress={() => router.push('/aventure')}
                accessibilityRole="button"
                accessibilityLabel={revenu ? `${nom} est rentré : découvrir son aventure` : `${nom} dans sa ville`}>
                <Compagnon espece={compagnon.espece} pose={revenu ? 'content' : 'neutre'} taille={130} promenade={!revenu} equipe={etat.equipe} />
              </Pressable>
            </>
          )}
          <Pressable
            style={styles.etiquette}
            onPress={() => router.push('/aventure')}
            disabled={!absent && !revenu}
            accessibilityRole={absent || revenu ? 'button' : 'text'}>
            <Text style={styles.etiquetteTexte} numberOfLines={2}>
              {etiquette}
            </Text>
          </Pressable>
        </View>

        {/* Pendant l'aventure : où il en est, en direct ; sinon, la carte pour l'envoyer explorer */}
        {absent?.depart && absent.retour ? (
          <Trajet
            depart={absent.depart}
            retour={absent.retour}
            lieu={lieuDeMission(etat, absent)?.nom ?? absent.lieu}
            maintenant={maintenant}
            part={avanceeTrajet(absent, maintenant)}
          />
        ) : (
          <AventureDuJour etat={etat} maintenant={maintenant} dort={dort} />
        )}

        {/* Les lieux de la ville, comme un parcours */}
        <View style={styles.titreLigne}>
          <Text style={styles.sousTitre}>Son parcours à {ville.nom}</Text>
        </View>
        <View style={styles.barreDecouverte}>
          <View style={[styles.barreRemplie, { width: `${lieux.length ? (decouverts / lieux.length) * 100 : 0}%` }]} />
        </View>
        <View>
          {lieux.map(({ lieu, etape, decouvertLe, ici }, i) => (
            <View key={lieu.id} style={styles.etape}>
              {/* Le fil du parcours */}
              <View style={styles.fil}>
                <View style={[styles.point, etape !== 'a-visiter' && styles.pointFait, ici && styles.pointIci]} />
                {i < lieux.length - 1 && <View style={styles.trait} />}
              </View>
              <View style={[styles.lieu, ici && styles.lieuIci, etape === 'a-visiter' && !ici && { opacity: 0.75 }]}>
                <View style={styles.vignette}>
                  <Image source={imageDecor(ville.id, lieu.decor)} style={StyleSheet.absoluteFill} contentFit="cover" />
                  {etape === 'a-visiter' && !ici && (
                    <View style={styles.vignetteMystere}>
                      <Text style={styles.mystere}>?</Text>
                    </View>
                  )}
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={styles.lieuNom} numberOfLines={1}>
                    {lieu.nom}
                  </Text>
                  {lieu.metier ? <Text style={styles.lieuMetier}>{etape === 'embauche' && compagnon.metier ? compagnon.metier.intitule : lieu.metier}</Text> : null}
                  <View style={styles.puces}>
                    {ici ? (
                      <View style={[styles.puce, { backgroundColor: couleurs.pecheClair }]}>
                        <Text style={[styles.puceTexte, { color: couleurs.renardFonce }]}>📍 {nom} est ici</Text>
                      </View>
                    ) : (
                      <View style={[styles.puce, { backgroundColor: STYLE_ETAPE[etape].fond }]}>
                        <Text style={[styles.puceTexte, { color: STYLE_ETAPE[etape].texte }]}>{etape === 'a-visiter' ? 'À découvrir' : LIBELLES_ETAPES[etape]}</Text>
                      </View>
                    )}
                    {decouvertLe ? (
                      <Text style={styles.souvenir}>
                        {lieu.souvenir.emoji} {dateLisible(decouvertLe)}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Ses propres candidatures, dans sa ville */}
        {candidatures.length > 0 && (
          <>
            <Text style={styles.sousTitre}>Les candidatures de {nom}</Text>
            <View style={styles.bloc}>
              {candidatures.map(({ candidature, icone, etape, accent }, i) => (
                <View key={candidature.id} style={[styles.candidature, i > 0 && styles.separateur]}>
                  <Text style={styles.icone}>{icone}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lieuNom}>{candidature.lieu}</Text>
                    <Text style={[styles.lieuMetier, accent && { color: couleurs.corail }]}>
                      {candidature.metier} · {etape}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Sa chambre se décore depuis ici aussi */}
        <Pressable style={styles.lienChambre} onPress={() => router.push('/chambre')} accessibilityRole="button" accessibilityLabel={`La chambre de ${nom}`}>
          <Text style={{ fontSize: 22 }}>🛏️</Text>
          <Text style={styles.lienChambreTexte}>Décorer la chambre de {nom}</Text>
          <Ionicons name="chevron-forward" size={18} color={couleurs.brunDoux} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

/** La progression du trajet en direct : départ → lieu → retour, avec l'heure. */
function Trajet({
  depart,
  retour,
  lieu,
  maintenant,
  part,
}: {
  depart: number;
  retour: number;
  lieu: string;
  maintenant: number;
  part: { part: number; phase: 'aller' | 'sur-place' | 'retour' };
}) {
  const reste = Math.max(1, Math.ceil((retour - maintenant) / 60_000));
  const phrase = part.phase === 'aller' ? `En route vers ${lieu}` : part.phase === 'sur-place' ? `Sur place : ${lieu}` : 'Sur le chemin du retour';
  return (
    <View style={styles.trajet} accessibilityLabel={`${phrase}. Retour à ${heureLisible(retour)}, dans ${reste} minutes`}>
      <View style={styles.trajetEntete}>
        <Text style={styles.trajetPhrase} numberOfLines={1}>
          {phrase}
        </Text>
        <Text style={styles.trajetReste}>dans {reste} min</Text>
      </View>
      <View style={styles.piste}>
        <View style={[styles.pisteRemplie, { width: `${part.part * 100}%` }]} />
        {/* Les trois étapes : la maison, le lieu (au milieu du temps sur place), la maison */}
        {[0, 0.5, 1].map((x, i) => (
          <View key={x} style={[styles.borne, { left: `${x * 100}%` }, part.part >= x && styles.borneFaite]}>
            <Text style={styles.borneEmoji}>{i === 1 ? '📍' : '🏠'}</Text>
          </View>
        ))}
      </View>
      <View style={styles.trajetHeures}>
        <Text style={styles.heure}>Départ {heureLisible(depart)}</Text>
        <Text style={styles.heure}>Retour {heureLisible(retour)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenu: { padding: espace.l, gap: espace.m },
  entete: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  titre: { fontFamily: polices.titre, fontSize: 26, fontWeight: '800', color: couleurs.brun },
  decouverts: { fontSize: 13, fontWeight: '700', color: couleurs.brunDoux },
  scene: { height: HAUTEUR_SCENE, borderRadius: arrondis.l, overflow: 'hidden', backgroundColor: couleurs.ciel },
  nuit: { backgroundColor: 'rgba(40, 45, 90, 0.35)' },
  sol: { position: 'absolute', left: 0, right: 0, bottom: 18, alignItems: 'center' },
  etiquette: {
    position: 'absolute',
    top: espace.m,
    left: espace.m,
    right: espace.m,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
    ...ombre,
  },
  etiquetteTexte: { fontWeight: '800', fontSize: 14, color: couleurs.brun, lineHeight: 19 },
  trajet: { backgroundColor: couleurs.carte, borderRadius: arrondis.l, padding: espace.l, gap: espace.m, ...relief },
  trajetEntete: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: espace.s },
  trajetPhrase: { flex: 1, fontFamily: polices.titre, fontWeight: '800', fontSize: 15.5, color: couleurs.brun },
  trajetReste: { fontWeight: '800', fontSize: 13, color: couleurs.renardFonce },
  piste: { height: 8, borderRadius: 4, backgroundColor: couleurs.ligne, marginHorizontal: 14, marginVertical: 10 },
  pisteRemplie: { height: 8, borderRadius: 4, backgroundColor: couleurs.saugeFonce },
  borne: {
    position: 'absolute',
    top: -12,
    width: 32,
    height: 32,
    marginLeft: -16,
    borderRadius: 16,
    backgroundColor: couleurs.carte,
    borderWidth: 2,
    borderColor: couleurs.ligne,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borneFaite: { borderColor: couleurs.saugeFonce },
  borneEmoji: { fontSize: 15 },
  trajetHeures: { flexDirection: 'row', justifyContent: 'space-between' },
  heure: { fontSize: 12.5, fontWeight: '700', color: couleurs.brunDoux },
  titreLigne: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: espace.s },
  sousTitre: { fontFamily: polices.titre, fontSize: 18, fontWeight: '800', color: couleurs.brun, marginTop: espace.s },
  barreDecouverte: { height: 6, borderRadius: 3, backgroundColor: couleurs.ligne, overflow: 'hidden', marginBottom: espace.xs },
  barreRemplie: { height: 6, borderRadius: 3, backgroundColor: couleurs.lac },
  etape: { flexDirection: 'row', gap: espace.m },
  fil: { width: 16, alignItems: 'center', paddingTop: 30 },
  point: { width: 14, height: 14, borderRadius: 7, backgroundColor: couleurs.carte, borderWidth: 2, borderColor: couleurs.ligne },
  pointFait: { backgroundColor: couleurs.saugeFonce, borderColor: couleurs.saugeFonce },
  pointIci: { backgroundColor: couleurs.renardFonce, borderColor: couleurs.renardFonce, transform: [{ scale: 1.3 }] },
  trait: { flex: 1, width: 2, backgroundColor: couleurs.ligne, marginTop: 2 },
  lieu: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.m,
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.l,
    padding: espace.s,
    marginBottom: espace.s,
    ...relief,
  },
  lieuIci: { borderColor: couleurs.renardFonce, borderBottomColor: couleurs.renardRelief, backgroundColor: '#FFF8F3' },
  vignette: { width: 66, height: 66, borderRadius: 14, overflow: 'hidden', backgroundColor: couleurs.creme },
  vignetteMystere: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,246,236,0.75)', alignItems: 'center', justifyContent: 'center' },
  mystere: { fontSize: 24, fontWeight: '800', color: couleurs.brunDoux },
  lieuNom: { fontSize: 15, fontWeight: '800', color: couleurs.brun },
  lieuMetier: { fontSize: 12.5, fontWeight: '600', color: couleurs.brunDoux },
  puces: { flexDirection: 'row', alignItems: 'center', gap: espace.s, flexWrap: 'wrap' },
  puce: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  puceTexte: { fontSize: 11.5, fontWeight: '800' },
  souvenir: { fontSize: 12, fontWeight: '700', color: couleurs.brunDoux },
  bloc: { backgroundColor: couleurs.carte, borderRadius: arrondis.m, ...relief },
  candidature: { flexDirection: 'row', alignItems: 'center', gap: espace.m, padding: espace.l },
  separateur: { borderTopWidth: 1, borderTopColor: couleurs.ligne },
  icone: { fontSize: 22 },
  lienChambre: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.m,
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.m,
    paddingHorizontal: espace.l,
    paddingVertical: espace.m,
    marginTop: espace.s,
    ...relief,
  },
  lienChambreTexte: { flex: 1, fontWeight: '800', fontSize: 14.5, color: couleurs.brun },
});
