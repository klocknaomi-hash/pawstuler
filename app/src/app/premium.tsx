/**
 * PAWSTULER PREMIUM — écran de présentation de l'abonnement (paywall).
 * Mise en page : le compagnon dans sa ville en haut, une feuille blanche en bas avec
 * 4 points forts, l'annuel mis en avant (« −44 % par rapport au mensuel »),
 * « Voir les autres formules » pour le mensuel, et un gros bouton d'essai.
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

import { Bouton, Texte, Titre } from '@/components/base';
import { EcranFeuille } from '@/components/EcranFeuille';
import {
  FORMULES,
  INCLUS_GRATUIT,
  INCLUS_PREMIUM,
  JOURS_ESSAI,
  MENTION_RENOUVELLEMENT,
  NOM_OFFRE,
  OFFRE_BIENVENUE,
  POINTS_FORTS_PREMIUM,
  REMISE_ANNUEL,
  RESUME_GRATUIT,
  formuleParId,
  type Formule,
  type FormuleId,
} from '@/config/abonnement';
import { arrondis, couleurs, espace, polices, relief } from '@/config/theme';
import { dateLisible, jourDe } from '@/logique/dates';
import {
  acheterFormule,
  aPremium,
  essaiDisponible,
  jourOffreBienvenue,
  joursRestantsEssai,
  libelleAbonnement,
  restaurerAchats,
} from '@/services/abonnement';
import { useApp } from '@/store/etat';

/** Page de l'App Store où l'on gère ou résilie ses abonnements. */
const GERER_ABONNEMENT = 'https://apps.apple.com/account/subscriptions';

/** Date lisible dans n jours (« 2 oct. »). */
const dansNJours = (n: number) => dateLisible(jourDe(new Date(Date.now() + n * 86_400_000)));

export default function Premium() {
  const { etat, dispatch } = useApp();
  const [choix, setChoix] = useState<FormuleId>('annuel');
  const [autresFormules, setAutresFormules] = useState(false);
  const [toutVoir, setToutVoir] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState('');

  const dejaPremium = aPremium(etat);
  const restants = joursRestantsEssai(etat);
  const formule = formuleParId(choix);
  const essaiPossible = essaiDisponible(etat);
  // L'essai ne s'applique qu'à l'annuel, et seulement s'il n'a jamais été utilisé
  const avecEssai = formule.essai && essaiPossible;

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

  // Offre de bienvenue (7 jours après l'inscription) : l'annuel à −30 % la première année
  const offre = !dejaPremium && jourOffreBienvenue(etat, jourDe()) !== null;
  const annuelBase = formuleParId('annuel');
  const annuel: Formule = offre
    ? {
        ...annuelBase,
        prix: OFFRE_BIENVENUE.prixAn,
        detail: `La 1re année, puis ${OFFRE_BIENVENUE.prixNormal}`,
        conditions: `Gratuit pendant ${JOURS_ESSAI} jours, puis ${OFFRE_BIENVENUE.prix} pour la première année, puis 39,99 € par an. L'abonnement se renouvelle automatiquement chaque année. Pour ne rien payer, résilie au moins 24 h avant la fin de l'essai.`,
      }
    : annuelBase;
  const formuleChoisie = choix === 'annuel' ? annuel : formule;
  const premierPaiement = offre ? OFFRE_BIENVENUE.prix : '39,99 €';
  const autres = FORMULES.filter((f) => f.id !== 'annuel');

  return (
    <EcranFeuille
      espece={etat.compagnon?.espece ?? 'renard'}
      ville={etat.villeId ?? 'clairebourg'}
      pose="celebration"
      hauteurDecor={190}
      tailleMascotte={130}
      onFermer={() => router.back()}
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
            <Bouton
              titre={avecEssai ? formule.bouton : `M’abonner pour ${formuleChoisie.prix}`}
              chargement={enCours}
              onPress={acheter}
              style={styles.grosBouton}
            />
            <Text style={styles.conditions}>
              {avecEssai
                ? formuleChoisie.conditions
                : choix === 'annuel'
                  ? offre
                    ? `${OFFRE_BIENVENUE.prix} pour la première année, prélevés dès la confirmation de l'achat, puis 39,99 € par an. L'abonnement se renouvelle automatiquement chaque année. Résiliable à tout moment.`
                    : "39,99 € par an, prélevés dès la confirmation de l'achat. L'abonnement se renouvelle automatiquement chaque année. Résiliable à tout moment."
                  : formule.conditions}
            </Text>
          </>
        )
      }>
      <View style={styles.haut}>
        <Text style={styles.surtitre}>{NOM_OFFRE}</Text>
        <Titre style={styles.centre}>
          {essaiPossible ? `${JOURS_ESSAI} jours offerts pour tout essayer` : 'Va plus loin avec ton compagnon'}
        </Titre>
        {dejaPremium && (
          <Texte style={[styles.centre, { color: couleurs.renardFonce, fontWeight: '700' }]}>
            {restants === null
              ? `${libelleAbonnement(etat)}. Merci !`
              : etat.abonnement.resiliationPrevue
                ? `${libelleAbonnement(etat)}. Résiliation prévue : ensuite, version gratuite.`
                : `${libelleAbonnement(etat)}. Ensuite : 39,99 €/an, sauf résiliation.`}
          </Texte>
        )}
      </View>

      {/* Les 4 points forts, en grille */}
      <View style={styles.points}>
        {POINTS_FORTS_PREMIUM.map((p) => (
          <View key={p.texte} style={styles.point}>
            <View style={styles.pointIcone}>
              <Ionicons name={p.icone} size={17} color={couleurs.renardFonce} />
            </View>
            <Text style={styles.pointTexte}>{p.texte}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.gratuit}>{RESUME_GRATUIT}</Text>

      {!dejaPremium && (
        <View style={styles.formules} accessibilityRole="radiogroup">
          {/* L'annuel, mis en avant */}
          <CarteFormule
            f={annuel}
            choisie={choix === 'annuel'}
            essai={essaiPossible}
            vedette
            offre={offre}
            onPress={() => setChoix('annuel')}
          />
          {autresFormules ? (
            autres.map((f) => (
              <CarteFormule key={f.id} f={f} choisie={choix === f.id} essai={false} onPress={() => setChoix(f.id)} />
            ))
          ) : (
            <Pressable onPress={() => setAutresFormules(true)} accessibilityRole="button" style={styles.voirAutres} hitSlop={6}>
              <Text style={styles.voirAutresTexte}>Voir les autres formules</Text>
              <Ionicons name="chevron-down" size={15} color={couleurs.brunDoux} />
            </Pressable>
          )}
        </View>
      )}

      {avecEssai && !dejaPremium && (
        <View style={styles.frise}>
          <Etape icone="lock-open" titre="Aujourd’hui" texte="Premium débloqué. Tu ne paies rien." />
          <Etape icone="notifications" titre={`Le ${dansNJours(JOURS_ESSAI - 3)}`} texte="On te rappelle que l’essai se termine bientôt." />
          <Etape icone="card" titre={`Le ${dansNJours(JOURS_ESSAI)}`} texte={`Premier paiement de ${premierPaiement}, sauf si tu as résilié avant.`} dernier />
        </View>
      )}

      {/* Tout le détail : ce qui reste gratuit et ce que Premium ajoute */}
      <Pressable onPress={() => setToutVoir(!toutVoir)} accessibilityRole="button" style={styles.voirAutres} hitSlop={6}>
        <Text style={styles.voirAutresTexte}>{toutVoir ? 'Masquer le détail' : 'Voir tout ce qui est inclus'}</Text>
        <Ionicons name={toutVoir ? 'chevron-up' : 'chevron-down'} size={15} color={couleurs.brunDoux} />
      </Pressable>
      {toutVoir && (
        <>
          <View style={styles.liste}>
            <Text style={styles.listeTitre}>Toujours gratuit</Text>
            {INCLUS_GRATUIT.map((t) => (
              <Ligne key={t} texte={t} couleur={couleurs.saugeFonce} />
            ))}
          </View>
          <View style={[styles.liste, { backgroundColor: couleurs.pecheClair }]}>
            <Text style={styles.listeTitre}>En plus avec Premium</Text>
            {INCLUS_PREMIUM.map((t) => (
              <Ligne key={t} texte={t} couleur={couleurs.renardFonce} icone="sparkles" />
            ))}
          </View>
        </>
      )}

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Text style={styles.mention}>{MENTION_RENOUVELLEMENT}</Text>
      <View style={styles.liens}>
        <Lien texte="Restaurer mes achats" onPress={restaurer} />
        <Lien texte="Conditions d’utilisation" onPress={() => router.push('/legal/conditions')} />
        <Lien texte="Confidentialité" onPress={() => router.push('/legal/confidentialite')} />
      </View>
    </EcranFeuille>
  );
}

/** Une formule à choisir. L'annuel (« vedette ») porte le badge de remise et l'essai. */
function CarteFormule({
  f,
  choisie,
  essai,
  vedette,
  offre,
  onPress,
}: {
  f: Formule;
  choisie: boolean;
  essai: boolean;
  vedette?: boolean;
  /** Offre de bienvenue en cours : badge « −30 % » à la place de l'économie sur le mensuel. */
  offre?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: choisie }}
      accessibilityLabel={`${f.libelle}, ${f.prix}${essai ? `, ${JOURS_ESSAI} jours gratuits` : ', sans essai gratuit'}${vedette ? `, moins ${REMISE_ANNUEL} % par rapport au mensuel` : ''}`}
      style={[styles.formule, choisie && styles.formuleChoisie, vedette && { marginTop: espace.s }]}>
      {vedette && (
        <View style={styles.badgeRemise}>
          <Text style={styles.badgeRemiseTexte}>
            {offre ? `−${OFFRE_BIENVENUE.remise} % · offre de bienvenue` : `−${REMISE_ANNUEL} % par rapport au mensuel`}
          </Text>
        </View>
      )}
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
  haut: { alignItems: 'center', gap: espace.xs },
  centre: { textAlign: 'center' },
  surtitre: {
    fontSize: 12,
    fontWeight: '800',
    color: couleurs.renardFonce,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  points: { flexDirection: 'row', flexWrap: 'wrap', gap: espace.s },
  point: {
    width: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.s,
    backgroundColor: couleurs.creme,
    borderRadius: arrondis.m,
    padding: espace.s,
  },
  pointIcone: { width: 30, height: 30, borderRadius: 10, backgroundColor: couleurs.pecheClair, alignItems: 'center', justifyContent: 'center' },
  pointTexte: { flex: 1, fontSize: 13, fontWeight: '700', color: couleurs.brun, lineHeight: 17 },
  gratuit: { fontSize: 12.5, color: couleurs.saugeFonce, fontWeight: '700', textAlign: 'center' },
  liste: {
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.l,
    ...relief,
    padding: espace.l,
    gap: espace.s,
  },
  listeTitre: { fontFamily: polices.titre, fontSize: 15, fontWeight: '800', color: couleurs.brun, marginBottom: 2 },
  ligne: { flexDirection: 'row', gap: espace.s, alignItems: 'flex-start' },
  ligneTexte: { flex: 1, fontSize: 14, color: couleurs.brun, fontWeight: '600', lineHeight: 19 },
  formules: { gap: espace.s },
  formule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.m,
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.m,
    ...relief,
    borderWidth: 2,
    padding: espace.m,
  },
  formuleChoisie: { borderColor: couleurs.renardFonce, borderBottomColor: couleurs.renardRelief, backgroundColor: couleurs.pecheClair },
  badgeRemise: {
    position: 'absolute',
    top: -11,
    right: espace.m,
    backgroundColor: couleurs.saugeFonce,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeRemiseTexte: { color: couleurs.blanc, fontSize: 11, fontWeight: '800' },
  rond: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: couleurs.ligne, alignItems: 'center', justifyContent: 'center' },
  rondChoisi: { borderColor: couleurs.renardFonce },
  rondPlein: { width: 11, height: 11, borderRadius: 6, backgroundColor: couleurs.renardFonce },
  formuleLigne: { flexDirection: 'row', alignItems: 'center', gap: espace.s, flexWrap: 'wrap' },
  formuleNom: { fontFamily: polices.titre, fontWeight: '800', color: couleurs.brun, fontSize: 16 },
  badgeEssai: { backgroundColor: couleurs.renardFonce, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  badgeEssaiTexte: { color: couleurs.blanc, fontSize: 11, fontWeight: '800' },
  formulePrix: { fontFamily: polices.titre, fontWeight: '800', color: couleurs.brun, fontSize: 15 },
  formuleDetail: { fontSize: 12.5, color: couleurs.brunDoux, fontWeight: '600' },
  voirAutres: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: espace.xs },
  voirAutresTexte: { fontSize: 13.5, fontWeight: '700', color: couleurs.brunDoux, textDecorationLine: 'underline' },
  frise: { backgroundColor: couleurs.creme, borderRadius: arrondis.l, padding: espace.l },
  etape: { flexDirection: 'row', gap: espace.m },
  etapeIcone: { width: 26, height: 26, borderRadius: 13, backgroundColor: couleurs.renardFonce, alignItems: 'center', justifyContent: 'center' },
  etapeTrait: { width: 2, flex: 1, backgroundColor: couleurs.ligne, marginVertical: 2 },
  etapeTitre: { fontWeight: '800', color: couleurs.brun, fontSize: 13.5 },
  etapeTexte: { color: couleurs.brunDoux, fontWeight: '600', fontSize: 13, lineHeight: 18 },
  grosBouton: { paddingVertical: 16 },
  conditions: { textAlign: 'center', fontSize: 12, color: couleurs.brunDoux, fontWeight: '600', lineHeight: 16 },
  message: { textAlign: 'center', color: couleurs.saugeFonce, fontWeight: '700' },
  mention: { fontSize: 11, color: couleurs.brunDoux, lineHeight: 15 },
  liens: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: espace.l },
  lien: { fontSize: 12.5, color: couleurs.brun, fontWeight: '700', textDecorationLine: 'underline' },
});
