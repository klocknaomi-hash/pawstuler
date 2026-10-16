/**
 * OFFRE DE BIENVENUE (non-abonnés)
 * Un petit écran par jour pendant les 7 jours qui suivent l'inscription : le nombre de jours
 * restants pour profiter de l'annuel à −30 %, 7 ronds de progression et un petit mot du jour.
 * Toujours refermable (« Plus tard »), jamais insistant : la version gratuite reste complète.
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bouton, Ecran } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { MESSAGES_OFFRE, OFFRE_BIENVENUE } from '@/config/abonnement';
import { arrondis, couleurs, espace, polices, relief } from '@/config/theme';
import { dateLisible, jourDe } from '@/logique/dates';
import { jourOffreBienvenue } from '@/services/abonnement';
import { useApp } from '@/store/etat';

export default function Offre() {
  const { etat, dispatch } = useApp();
  const aujourdhui = jourDe();
  const jour = jourOffreBienvenue(etat, aujourdhui) ?? OFFRE_BIENVENUE.jours;
  const restants = OFFRE_BIENVENUE.jours - jour + 1;
  const debut = etat.offreBienvenue?.debut ?? aujourdhui;
  const mot = MESSAGES_OFFRE[jour] ?? MESSAGES_OFFRE[OFFRE_BIENVENUE.jours];

  // Vu pour aujourd'hui dès l'ouverture : il reviendra demain (tant que l'offre dure)
  useEffect(() => {
    dispatch({ type: 'VOIR_OFFRE_BIENVENUE', jour: aujourdhui });
  }, [dispatch, aujourdhui]);

  return (
    <Ecran
      fond={couleurs.pecheClair}
      style={styles.contenu}
      bas={
        <View style={{ gap: espace.s }}>
          <Bouton titre={`Profiter de −${OFFRE_BIENVENUE.remise} %`} onPress={() => router.replace('/premium')} />
          <Bouton titre="Plus tard" variante="texte" onPress={() => router.back()} />
        </View>
      }>
      <Pressable onPress={() => router.back()} style={styles.fermer} accessibilityRole="button" accessibilityLabel="Fermer" hitSlop={12}>
        <Ionicons name="close" size={24} color={couleurs.brun} />
      </Pressable>

      <View style={styles.haut}>
        <Text style={styles.surtitre}>Offre de bienvenue</Text>
        {/* Le gros compte à rebours */}
        <Text style={styles.chiffre} accessibilityLabel={`Plus que ${restants} jour${restants > 1 ? 's' : ''}`}>
          {restants}
        </Text>
        <Text style={styles.unite}>{restants > 1 ? `jours pour profiter de −${OFFRE_BIENVENUE.remise} %` : `dernier jour pour profiter de −${OFFRE_BIENVENUE.remise} %`}</Text>
        {/* À ne pas confondre avec la série 🐾 (jours d'affilée) : l'offre compte les jours du calendrier */}
        <Text style={styles.precision}>
          Offre valable {OFFRE_BIENVENUE.jours} jours à partir de ton inscription, le {dateLisible(debut)}.
        </Text>
        <View style={styles.ronds}>
          {Array.from({ length: OFFRE_BIENVENUE.jours }, (_, i) => (
            <View key={i} style={[styles.rond, i < jour && styles.rondPasse, i === jour - 1 && styles.rondAujourdhui]} />
          ))}
        </View>
      </View>

      {etat.compagnon && (
        <View style={{ alignItems: 'center' }}>
          <Compagnon espece={etat.compagnon.espece} pose="excite" taille={130} equipe={etat.equipe} />
        </View>
      )}

      <View style={styles.carte}>
        <Text style={styles.titre}>{mot.titre}</Text>
        <Text style={styles.texte}>{mot.texte}</Text>
        <View style={styles.prix}>
          <View style={styles.badge}>
            <Text style={styles.badgeTexte}>−{OFFRE_BIENVENUE.remise} %</Text>
          </View>
          <Text style={styles.prixNouveau}>{OFFRE_BIENVENUE.prixAn}</Text>
          <Text style={styles.prixBarre}>{OFFRE_BIENVENUE.prixNormal}</Text>
        </View>
        <Text style={styles.detail}>Abonnement annuel, la première année. Ensuite 39,99 €/an, résiliable à tout moment.</Text>
      </View>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  precision: { fontSize: 13, color: couleurs.brunDoux, textAlign: 'center', marginTop: 2 },
  contenu: { justifyContent: 'space-between' },
  fermer: { alignSelf: 'flex-end' },
  haut: { alignItems: 'center', gap: 2 },
  surtitre: { fontSize: 12.5, fontWeight: '800', color: couleurs.renardFonce, textTransform: 'uppercase', letterSpacing: 1 },
  chiffre: { fontFamily: polices.titre, fontSize: 84, fontWeight: '800', color: couleurs.renardFonce, lineHeight: 92 },
  unite: { fontSize: 16, fontWeight: '800', color: couleurs.brun, marginTop: -6 },
  ronds: { flexDirection: 'row', gap: 8, marginTop: espace.m },
  rond: { width: 14, height: 14, borderRadius: 7, backgroundColor: couleurs.carte, borderWidth: 2, borderColor: '#F6CDB8' },
  rondPasse: { backgroundColor: couleurs.saumon, borderColor: couleurs.saumon },
  rondAujourdhui: { borderColor: couleurs.renardFonce, transform: [{ scale: 1.25 }] },
  carte: { backgroundColor: couleurs.carte, borderRadius: arrondis.l, padding: espace.l, gap: espace.s, ...relief },
  titre: { fontFamily: polices.titre, fontSize: 18, fontWeight: '800', color: couleurs.brun },
  texte: { fontSize: 14.5, fontWeight: '600', color: couleurs.brunDoux, lineHeight: 20 },
  prix: { flexDirection: 'row', alignItems: 'center', gap: espace.s, marginTop: espace.xs },
  badge: { backgroundColor: couleurs.saugeFonce, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  badgeTexte: { color: couleurs.blanc, fontWeight: '800', fontSize: 12.5 },
  prixNouveau: { fontFamily: polices.titre, fontSize: 18, fontWeight: '800', color: couleurs.brun },
  prixBarre: { fontSize: 14, fontWeight: '700', color: couleurs.brunDoux, textDecorationLine: 'line-through' },
  detail: { fontSize: 12, fontWeight: '600', color: couleurs.brunDoux, lineHeight: 16 },
});
