/**
 * PAWSTULER PREMIUM — écran de présentation de l'abonnement (paywall).
 * Règles de l'offre :
 *  - essai gratuit de 7 jours réservé à l'abonnement annuel (proposé une seule fois) ;
 *  - le mensuel n'a pas d'essai ;
 *  - le prix après l'essai et le renouvellement automatique sont écrits en clair, sans ambiguïté.
 * L'achat App Store réel se branchera dans src/services/abonnement.ts.
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Bouton, Ecran, Texte, Titre } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import {
  FORMULES,
  INCLUS_GRATUIT,
  INCLUS_PREMIUM,
  JOURS_ESSAI,
  MENTION_RENOUVELLEMENT,
  NOM_OFFRE,
  formuleParId,
  type FormuleId,
} from '@/config/abonnement';
import { arrondis, couleurs, espace, polices } from '@/config/theme';
import { dateLisible, jourDe } from '@/logique/dates';
import { acheterFormule, aPremium, essaiDisponible, joursRestantsEssai, libelleAbonnement, restaurerAchats } from '@/services/abonnement';
import { useApp } from '@/store/etat';

/** Page de l'App Store où l'on gère ou résilie ses abonnements. */
const GERER_ABONNEMENT = 'https://apps.apple.com/account/subscriptions';

/** Date lisible dans n jours (« 2 oct. »). */
const dansNJours = (n: number) => dateLisible(jourDe(new Date(Date.now() + n * 86_400_000)));

export default function Premium() {
  const { etat, dispatch } = useApp();
  const [choix, setChoix] = useState<FormuleId>('annuel');
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState('');

  const dejaPremium = aPremium(etat);
  const restants = joursRestantsEssai(etat);
  const formule = formuleParId(choix);
  // L'essai ne s'applique qu'à l'annuel, et seulement s'il n'a jamais été utilisé
  const avecEssai = formule.essai && essaiDisponible(etat);

  async function acheter() {
    setMessage('');
    setEnCours(true);
    const resultat = await acheterFormule(choix);
    setEnCours(false);
    if (resultat.ok) {
      dispatch({ type: 'SOUSCRIRE', formule: choix, essai: avecEssai });
      // Essai : l'accueil ouvre ensuite l'écran « Jour 1 » (un seul déclencheur, pas de doublon)
      router.back();
    } else if (!resultat.annule) {
      setMessage(resultat.message ?? 'L’achat n’a pas abouti. Aucun montant n’a été débité.');
    }
  }

  async function restaurer() {
    setMessage('');
    const trouvee = await restaurerAchats();
    if (trouvee) {
      dispatch({ type: 'RESTAURER_ABONNEMENT', formule: trouvee });
      setMessage('Ton abonnement a bien été restauré.');
    } else {
      setMessage('Aucun abonnement trouvé sur ce compte Apple.');
    }
  }

  return (
    <Ecran
      defilant
      bas={
        dejaPremium ? (
          <View style={{ gap: espace.s }}>
            <Bouton titre="Fermer" variante="secondaire" onPress={() => router.back()} />
            <Bouton titre="Gérer mon abonnement" variante="texte" onPress={() => Linking.openURL(GERER_ABONNEMENT)} />
            {/* Version de test : la vraie résiliation se fait dans les réglages Apple */}
            {etat.abonnement.statut === 'essai' && (
              <Bouton
                titre={etat.abonnement.resiliationPrevue ? 'Annuler la résiliation (test)' : 'Simuler une résiliation (test)'}
                variante="texte"
                onPress={() => dispatch({ type: 'BASCULER_RESILIATION' })}
              />
            )}
          </View>
        ) : (
          <>
            <Bouton titre={avecEssai ? formule.bouton : `M’abonner pour ${formule.prix}`} chargement={enCours} onPress={acheter} />
            <Text style={styles.conditions}>
              {avecEssai
                ? formule.conditions
                : choix === 'annuel'
                  ? "39,99 € par an, prélevés dès la confirmation de l'achat. L'abonnement se renouvelle automatiquement chaque année. Résiliable à tout moment."
                  : formule.conditions}
            </Text>
          </>
        )
      }>
      <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Fermer" style={styles.fermer} hitSlop={12}>
        <Ionicons name="close" size={26} color={couleurs.brun} />
      </Pressable>

      <View style={styles.haut}>
        <Compagnon espece={etat.compagnon?.espece ?? 'renard'} pose="celebration" taille={130} />
        <Text style={styles.surtitre}>{NOM_OFFRE}</Text>
        <Titre style={{ textAlign: 'center' }}>
          {essaiDisponible(etat) ? `Essaie Premium gratuitement pendant ${JOURS_ESSAI} jours` : 'Va plus loin avec ton compagnon'}
        </Titre>
        {essaiDisponible(etat) && <Texte style={{ textAlign: 'center' }}>Essai gratuit inclus avec l’abonnement annuel.</Texte>}
        {dejaPremium && (
          <Texte style={{ textAlign: 'center', color: couleurs.renardFonce, fontWeight: '700' }}>
            {restants === null
              ? `${libelleAbonnement(etat)}. Merci !`
              : etat.abonnement.resiliationPrevue
                ? `${libelleAbonnement(etat)}. Résiliation prévue : ensuite, version gratuite.`
                : `${libelleAbonnement(etat)}. Ensuite : 39,99 €/an, sauf résiliation.`}
          </Texte>
        )}
      </View>

      <View style={styles.liste}>
        <Text style={styles.listeTitre}>Toujours gratuit</Text>
        {INCLUS_GRATUIT.map((t) => (
          <Ligne key={t} texte={t} couleur={couleurs.saugeFonce} />
        ))}
      </View>
      <View style={[styles.liste, { backgroundColor: couleurs.pecheClair, borderColor: 'transparent' }]}>
        <Text style={styles.listeTitre}>En plus avec Premium</Text>
        {INCLUS_PREMIUM.map((t) => (
          <Ligne key={t} texte={t} couleur={couleurs.renardFonce} icone="sparkles" />
        ))}
      </View>

      {!dejaPremium && (
        <>
          <View style={styles.formules} accessibilityRole="radiogroup">
            {FORMULES.map((f) => {
              const choisie = choix === f.id;
              const essai = f.essai && essaiDisponible(etat);
              return (
                <Pressable
                  key={f.id}
                  onPress={() => setChoix(f.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: choisie }}
                  accessibilityLabel={`${f.libelle}, ${f.prix}${essai ? `, ${JOURS_ESSAI} jours gratuits` : ', sans essai gratuit'}`}
                  style={[styles.formule, choisie && styles.formuleChoisie]}>
                  <View style={[styles.rond, choisie && styles.rondChoisi]}>{choisie && <View style={styles.rondPlein} />}</View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={styles.formuleLigne}>
                      <Text style={styles.formuleNom}>{f.libelle}</Text>
                      {essai && (
                        <View style={styles.badgeEssai}>
                          <Text style={styles.badgeEssaiTexte}>{JOURS_ESSAI} jours gratuits</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.formuleDetail}>{essai ? `Après l’essai · ${f.detail.toLowerCase()}` : f.detail}</Text>
                  </View>
                  <Text style={styles.formulePrix}>{f.prix}</Text>
                </Pressable>
              );
            })}
          </View>

          {avecEssai && (
            <View style={styles.frise}>
              <Etape icone="lock-open" titre="Aujourd’hui" texte="Premium débloqué. Tu ne paies rien." />
              <Etape icone="notifications" titre={`Le ${dansNJours(JOURS_ESSAI - 3)}`} texte="On te rappelle que l’essai se termine bientôt." />
              <Etape icone="card" titre={`Le ${dansNJours(JOURS_ESSAI)}`} texte="Premier paiement de 39,99 €, sauf si tu as résilié avant." dernier />
            </View>
          )}
        </>
      )}

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Text style={styles.mention}>{MENTION_RENOUVELLEMENT}</Text>
      <View style={styles.liens}>
        <Lien texte="Restaurer mes achats" onPress={restaurer} />
        <Lien texte="Conditions d’utilisation" onPress={() => router.push('/legal/conditions')} />
        <Lien texte="Confidentialité" onPress={() => router.push('/legal/confidentialite')} />
      </View>
    </Ecran>
  );
}

function Ligne({ texte, couleur, icone = 'checkmark-circle' }: { texte: string; couleur: string; icone?: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.ligne}>
      <Ionicons name={icone} size={18} color={couleur} />
      <Text style={styles.ligneTexte}>{texte}</Text>
    </View>
  );
}

/** Une étape de la frise de l'essai gratuit. */
function Etape({ icone, titre, texte, dernier }: { icone: keyof typeof Ionicons.glyphMap; titre: string; texte: string; dernier?: boolean }) {
  return (
    <View style={styles.etape}>
      <View style={{ alignItems: 'center' }}>
        <View style={styles.etapeIcone}>
          <Ionicons name={icone} size={15} color={couleurs.blanc} />
        </View>
        {!dernier && <View style={styles.etapeTrait} />}
      </View>
      <View style={{ flex: 1, paddingBottom: dernier ? 0 : espace.m }}>
        <Text style={styles.etapeTitre}>{titre}</Text>
        <Text style={styles.etapeTexte}>{texte}</Text>
      </View>
    </View>
  );
}

function Lien({ texte, onPress }: { texte: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" hitSlop={8}>
      <Text style={styles.lien}>{texte}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fermer: { alignSelf: 'flex-end' },
  haut: { alignItems: 'center', gap: espace.s },
  surtitre: {
    fontSize: 12.5,
    fontWeight: '800',
    color: couleurs.renardFonce,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  liste: {
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.l,
    borderWidth: 1,
    borderColor: couleurs.ligne,
    padding: espace.l,
    gap: espace.s,
  },
  listeTitre: { fontFamily: polices.titre, fontSize: 16, fontWeight: '800', color: couleurs.brun, marginBottom: 2 },
  ligne: { flexDirection: 'row', gap: espace.s, alignItems: 'flex-start' },
  ligneTexte: { flex: 1, fontSize: 14.5, color: couleurs.brun, fontWeight: '600', lineHeight: 19 },
  formules: { gap: espace.s },
  formule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.m,
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.m,
    borderWidth: 2,
    borderColor: couleurs.ligne,
    padding: espace.m,
  },
  formuleChoisie: { borderColor: couleurs.renardFonce, backgroundColor: couleurs.pecheClair },
  rond: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: couleurs.ligne, alignItems: 'center', justifyContent: 'center' },
  rondChoisi: { borderColor: couleurs.renardFonce },
  rondPlein: { width: 11, height: 11, borderRadius: 6, backgroundColor: couleurs.renardFonce },
  formuleLigne: { flexDirection: 'row', alignItems: 'center', gap: espace.s, flexWrap: 'wrap' },
  formuleNom: { fontFamily: polices.titre, fontWeight: '800', color: couleurs.brun, fontSize: 16 },
  badgeEssai: { backgroundColor: couleurs.renardFonce, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  badgeEssaiTexte: { color: couleurs.blanc, fontSize: 11.5, fontWeight: '800' },
  formulePrix: { fontFamily: polices.titre, fontWeight: '800', color: couleurs.brun, fontSize: 16 },
  formuleDetail: { fontSize: 12.5, color: couleurs.brunDoux, fontWeight: '600' },
  frise: { backgroundColor: couleurs.carte, borderRadius: arrondis.l, borderWidth: 1, borderColor: couleurs.ligne, padding: espace.l },
  etape: { flexDirection: 'row', gap: espace.m },
  etapeIcone: { width: 28, height: 28, borderRadius: 14, backgroundColor: couleurs.renardFonce, alignItems: 'center', justifyContent: 'center' },
  etapeTrait: { width: 2, flex: 1, backgroundColor: couleurs.ligne, marginVertical: 2 },
  etapeTitre: { fontWeight: '800', color: couleurs.brun, fontSize: 14 },
  etapeTexte: { color: couleurs.brunDoux, fontWeight: '600', fontSize: 13.5, lineHeight: 18 },
  conditions: { textAlign: 'center', fontSize: 12.5, color: couleurs.brunDoux, fontWeight: '600', lineHeight: 17 },
  message: { textAlign: 'center', color: couleurs.saugeFonce, fontWeight: '700' },
  mention: { fontSize: 11.5, color: couleurs.brunDoux, lineHeight: 16 },
  liens: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: espace.l },
  lien: { fontSize: 12.5, color: couleurs.brun, fontWeight: '700', textDecorationLine: 'underline' },
});
