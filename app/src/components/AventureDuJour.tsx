/**
 * AVENTURE DU JOUR (accueil)
 * Ce que vit le compagnon aujourd'hui, en miroir de ta recherche :
 *  - sa mission en cours (« Milo est chez Boulangerie Dupain · Retour à 20 h 16 ») ou son retour ;
 *  - les missions proposées aujourd'hui (2 au plus : entretien et relance d'abord), plus l'exploration de la ville ;
 *  - la prochaine mission prévue, puis le journal de la journée.
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { accorder } from '@/config/compagnons';
import { COUTS_MISSION, DUREES_MINUTES, PIECES_MISSION } from '@/config/missions';
import { arrondis, couleurs, espace, polices } from '@/config/theme';
import { villeParId } from '@/config/villes';
import { aventuresRestantes } from '@/logique/compagnon';
import {
  compagnonAbsent,
  heureLisible,
  iconeMission,
  journalDuJour,
  jourLisible,
  missionsAVenir,
  missionsDisponibles,
  ouEst,
  resultatADecouvrir,
  titreMission,
} from '@/logique/missions';
import type { EtatApp } from '@/store/types';

/** Nombre de lignes du journal montrées avant « Voir tout ». */
const JOURNAL_COURT = 3;

export function AventureDuJour({ etat, maintenant, dort }: { etat: EtatApp; maintenant: number; dort: boolean }) {
  const [journalOuvert, setJournalOuvert] = useState(false);
  if (!etat.compagnon || !etat.villeId) return null;
  const nom = etat.compagnon.nom;
  const ville = villeParId(etat.villeId);
  const absent = compagnonAbsent(etat, maintenant);
  const retour = resultatADecouvrir(etat, maintenant);
  const disponibles = missionsDisponibles(etat);
  const prochaine = missionsAVenir(etat)[0];
  const explorations = aventuresRestantes(etat);
  const journal = journalDuJour(etat);
  const visibles = journalOuvert ? journal : journal.slice(0, JOURNAL_COURT);
  const occupe = !!absent || !!retour;

  return (
    <View style={styles.bloc}>
      <Text style={styles.titre}>Aventure du jour</Text>

      {absent?.retour && (
        <Pressable style={[styles.statut, styles.statutAbsent]} onPress={() => router.push('/aventure')} accessibilityRole="button">
          <Text style={styles.emoji}>{iconeMission(absent)}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.statutTitre}>{ouEst(etat, absent)}</Text>
            <Text style={styles.statutSous}>Retour à {heureLisible(absent.retour)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={couleurs.blanc} />
        </Pressable>
      )}

      {retour && (
        <Pressable style={[styles.statut, styles.statutRetour]} onPress={() => router.push('/aventure')} accessibilityRole="button">
          <Text style={styles.emoji}>🎒</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.statutTitre}>{accorder(`${nom} est rentré{e} !`, etat.compagnon.pronoms)}</Text>
            <Text style={styles.statutSous}>Découvre ce qu’{accorder('{il}', etat.compagnon.pronoms)} a vécu</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={couleurs.blanc} />
        </Pressable>
      )}

      {disponibles.map((m) => (
        <LigneMission
          key={m.id}
          icone={iconeMission(m)}
          titre={titreMission(etat, m)}
          sous={`${DUREES_MINUTES[m.type]} min · ${COUTS_MISSION[m.type]} ⚡ · +${PIECES_MISSION[m.type]} pièces`}
          grisee={occupe || dort}
          onPress={() => router.push({ pathname: '/aventure', params: { id: m.id } })}
        />
      ))}

      {explorations > 0 ? (
        <LigneMission
          icone={etat.contexte === 'pro' ? '💼' : '🔎'}
          titre={etat.contexte === 'pro' ? `Une journée au travail` : `Explorer ${ville.nom}`}
          sous={`${DUREES_MINUTES[etat.contexte === 'pro' ? 'travail' : 'recherche']} min · ${COUTS_MISSION[etat.contexte === 'pro' ? 'travail' : 'recherche']} ⚡`}
          grisee={occupe || dort}
          onPress={() => router.push({ pathname: '/aventure', params: { explorer: '1' } })}
        />
      ) : (
        <View style={styles.demain}>
          <Ionicons name="moon" size={16} color={couleurs.brunDoux} />
          <Text style={styles.demainTexte}>Nouvelle exploration demain</Text>
        </View>
      )}

      {prochaine && (
        <Text style={styles.prochaine}>
          Prochaine mission {jourLisible(prochaine.disponibleLe)} : {iconeMission(prochaine)} {titreMission(etat, prochaine)}
        </Text>
      )}

      {journal.length > 0 && (
        <View style={styles.journal}>
          <Text style={styles.journalTitre}>Journal de {nom}</Text>
          {visibles.map((e) => (
            <View key={e.id} style={styles.entree}>
              <Text style={styles.entreeHeure}>{heureLisible(e.le)}</Text>
              <Text style={styles.entreeTexte}>
                {e.icone} {e.texte}
              </Text>
            </View>
          ))}
          {journal.length > JOURNAL_COURT && (
            <Pressable onPress={() => setJournalOuvert((o) => !o)} accessibilityRole="button" hitSlop={8}>
              <Text style={styles.voirTout}>{journalOuvert ? 'Voir moins' : `Voir tout (${journal.length})`}</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

function LigneMission({ icone, titre, sous, grisee, onPress }: { icone: string; titre: string; sous: string; grisee: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.mission, grisee && { opacity: 0.55 }]} onPress={onPress} accessibilityRole="button" accessibilityLabel={titre}>
      <Text style={styles.emoji}>{icone}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.missionTitre} numberOfLines={2}>
          {titre}
        </Text>
        <Text style={styles.missionSous} numberOfLines={1}>
          {sous}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={couleurs.brunDoux} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bloc: { gap: espace.s },
  titre: {
    fontFamily: polices.titre,
    fontSize: 19,
    fontWeight: '800',
    color: couleurs.brun,
    marginBottom: 2,
  },
  statut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.m,
    borderRadius: arrondis.m,
    padding: espace.l,
  },
  statutAbsent: { backgroundColor: couleurs.saugeFonce },
  statutRetour: { backgroundColor: couleurs.renardFonce },
  statutTitre: { color: couleurs.blanc, fontWeight: '800', fontSize: 15.5 },
  statutSous: {
    color: couleurs.blanc,
    opacity: 0.92,
    fontWeight: '600',
    fontSize: 13,
    marginTop: 2,
  },
  emoji: { fontSize: 24 },
  mission: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.m,
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.m,
    borderWidth: 1,
    borderColor: couleurs.ligne,
    padding: espace.m,
  },
  missionTitre: { fontWeight: '800', color: couleurs.brun, fontSize: 14.5 },
  missionSous: {
    fontWeight: '600',
    color: couleurs.brunDoux,
    fontSize: 12.5,
    marginTop: 2,
  },
  demain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.s,
    backgroundColor: couleurs.saugeClair,
    borderRadius: arrondis.m,
    padding: espace.m,
  },
  demainTexte: { fontWeight: '800', color: couleurs.saugeFonce },
  prochaine: {
    fontSize: 13,
    fontWeight: '600',
    color: couleurs.brunDoux,
    paddingHorizontal: 2,
  },
  journal: {
    backgroundColor: couleurs.pecheClair,
    borderRadius: arrondis.m,
    padding: espace.m,
    gap: 6,
    marginTop: 2,
  },
  journalTitre: {
    fontSize: 12,
    fontWeight: '800',
    color: couleurs.renardFonce,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  entree: { flexDirection: 'row', gap: espace.s },
  entreeHeure: {
    width: 48,
    fontSize: 12.5,
    fontWeight: '800',
    color: couleurs.brunDoux,
    fontVariant: ['tabular-nums'],
  },
  entreeTexte: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: couleurs.brun,
    lineHeight: 18,
  },
  voirTout: {
    fontSize: 13,
    fontWeight: '800',
    color: couleurs.renardFonce,
    marginTop: 2,
  },
});
