/**
 * ESSAI PREMIUM — « Jour X / 7 »
 * Un petit écran léger, montré une seule fois par jour d'essai (calculé sur la date de début,
 * pas sur le nombre d'ouvertures). Il fête la régularité plutôt que de vendre.
 *  - Jour 1 : bienvenue ; jours 2 à 6 : encouragements ; jour 7 : dernier jour, en toute transparence
 *    sur la suite (l'abonnement annuel démarre, sauf résiliation).
 *  - `fin=1` : l'essai s'est terminé après une résiliation → retour en gratuit, rien n'est perdu.
 * On peut toujours fermer et continuer.
 */
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Bouton, Ecran, Texte } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { JOURS_ESSAI } from '@/config/abonnement';
import { couleurs, espace, polices } from '@/config/theme';
import { jourEssai } from '@/services/abonnement';
import { useApp } from '@/store/etat';

/** Page de l'App Store où l'on gère (ou résilie) ses abonnements. */
const GERER_ABONNEMENT = 'https://apps.apple.com/account/subscriptions';

const MESSAGES: Record<number, { titre: string; texte: string }> = {
  1: { titre: 'Jour 1 🎉', texte: 'Bienvenue dans ton aventure ! Tu viens de commencer tes 7 jours d’essai Premium. Profite de tout.' },
  2: { titre: 'Jour 2 ✨', texte: 'Tu es déjà revenu pour ton deuxième jour !' },
  3: { titre: 'Jour 3 🐾', texte: 'Ton aventure continue !' },
  4: { titre: 'Jour 4 🐾', texte: 'Tu continues ton aventure, et ça se voit.' },
  5: { titre: 'Jour 5 ✨', texte: 'Cinq jours ensemble. Chaque petit pas compte.' },
  6: { titre: 'Jour 6 ✨', texte: 'Plus qu’un jour avant la fin de ton essai !' },
  7: { titre: 'Jour 7 🎉', texte: 'Déjà 7 jours d’aventure ! Profite bien de ton dernier jour avec toutes les fonctionnalités Premium.' },
};

export default function EssaiJour() {
  const { fin } = useLocalSearchParams<{ fin?: string }>();
  const { etat, dispatch } = useApp();
  const jour = jourEssai(etat) ?? JOURS_ESSAI;
  const estFin = fin === '1';
  const espece = etat.compagnon?.espece ?? 'renard';

  // L'écran du jour est marqué comme vu dès qu'il s'affiche (il ne reviendra que demain)
  useEffect(() => {
    if (estFin) dispatch({ type: 'VOIR_FIN_ESSAI' });
    else dispatch({ type: 'VOIR_JOUR_ESSAI', jour });
  }, [estFin, jour, dispatch]);

  const fermer = () => router.back();

  if (estFin) {
    return (
      <Ecran
        fond={couleurs.pecheClair}
        style={styles.contenu}
        bas={
          <View style={{ gap: espace.s }}>
            <Bouton titre="Découvrir Premium" onPress={() => router.replace('/premium')} />
            <Bouton titre="Continuer gratuitement" variante="secondaire" onPress={fermer} />
          </View>
        }>
        <Fermer onPress={fermer} />
        <Compagnon espece={espece} pose="content" taille={150} />
        <Text style={styles.titre}>Ton essai Premium est terminé 💛</Text>
        <Texte style={styles.centre}>
          Tu peux continuer à profiter de ton aventure gratuitement, avec certaines fonctionnalités Premium désormais verrouillées. Tu gardes tout : {etat.compagnon?.nom}, tes pièces, tes tenues et tes candidatures.
        </Texte>
        <Text style={styles.question}>Envie de retrouver l’expérience complète ?</Text>
      </Ecran>
    );
  }

  const message = MESSAGES[jour] ?? MESSAGES[1];
  const dernier = jour === JOURS_ESSAI;

  return (
    <Ecran
      fond={couleurs.pecheClair}
      style={styles.contenu}
      bas={
        dernier ? (
          <View style={{ gap: espace.s }}>
            <Bouton titre="Continuer avec Premium" onPress={fermer} />
            <Text style={styles.transparence}>
              {etat.abonnement.resiliationPrevue
                ? 'Tu as résilié : demain, tu repasses en version gratuite, sans rien perdre.'
                : 'Demain, ton abonnement annuel démarre (39,99 €/an), sauf si tu le résilies aujourd’hui.'}
            </Text>
            <Bouton titre="Gérer mon abonnement" variante="texte" onPress={() => Linking.openURL(GERER_ABONNEMENT)} />
          </View>
        ) : (
          <Bouton titre="C’est parti !" onPress={fermer} />
        )
      }>
      <Fermer onPress={fermer} />
      <Compagnon espece={espece} pose={dernier ? 'celebration' : 'content'} taille={140} reaction={1} />
      <Text style={styles.chiffre}>{jour}</Text>
      <Text style={styles.surtitre}>Jour d’essai Premium</Text>
      <View style={styles.points} accessibilityLabel={`Jour ${jour} sur ${JOURS_ESSAI}`}>
        {Array.from({ length: JOURS_ESSAI }, (_, i) => {
          const fait = i < jour;
          return (
            <View key={i} style={[styles.point, fait && styles.pointFait, i === jour - 1 && styles.pointDuJour]}>
              {fait && <Ionicons name="checkmark" size={14} color={couleurs.blanc} />}
            </View>
          );
        })}
      </View>
      <Text style={styles.jours}>
        Jour {jour} / {JOURS_ESSAI}
      </Text>
      <Text style={styles.titre}>{message.titre}</Text>
      <Texte style={styles.centre}>{message.texte}</Texte>
    </Ecran>
  );
}

function Fermer({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Fermer" hitSlop={12} style={styles.fermer}>
      <Ionicons name="close" size={26} color={couleurs.brun} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  contenu: { alignItems: 'center', justifyContent: 'center', gap: espace.s },
  fermer: { position: 'absolute', top: espace.s, right: espace.l },
  chiffre: { fontFamily: polices.titre, fontSize: 64, fontWeight: '800', color: couleurs.renardFonce, lineHeight: 70 },
  surtitre: { fontSize: 12.5, fontWeight: '800', color: couleurs.brunDoux, textTransform: 'uppercase', letterSpacing: 1 },
  points: { flexDirection: 'row', gap: 8, marginVertical: espace.s },
  point: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: couleurs.saumon, alignItems: 'center', justifyContent: 'center' },
  pointFait: { backgroundColor: couleurs.saumon },
  pointDuJour: { backgroundColor: couleurs.renardFonce, borderColor: couleurs.renardFonce },
  jours: { fontSize: 13.5, fontWeight: '800', color: couleurs.brun },
  titre: { fontFamily: polices.titre, fontSize: 24, fontWeight: '800', color: couleurs.brun, textAlign: 'center', marginTop: espace.s },
  centre: { textAlign: 'center' },
  question: { fontSize: 15, fontWeight: '800', color: couleurs.renardFonce, textAlign: 'center', marginTop: espace.s },
  transparence: { fontSize: 12.5, fontWeight: '600', color: couleurs.brunDoux, textAlign: 'center', lineHeight: 17 },
});
