/**
 * LA SEMAINE 🐾 (accueil) : les 7 jours de la semaine, de lundi à dimanche.
 * Une patte pleine pour chaque jour de la série en cours, aujourd'hui entouré.
 * À droite, la série et l'objectif. Toucher la carte ouvre le profil du compagnon.
 * Aucune culpabilisation : un jour sans patte est simplement vide, sans croix ni rouge.
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { arrondis, couleurs, espace, relief } from '@/config/theme';
import { jourDe } from '@/logique/dates';
import type { Serie } from '@/store/types';

const INITIALES = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/** Les 7 jours (AAAA-MM-JJ) de la semaine en cours, du lundi au dimanche. */
function joursDeLaSemaine(maintenant = new Date()): string[] {
  const lundi = new Date(maintenant);
  lundi.setHours(12, 0, 0, 0);
  lundi.setDate(lundi.getDate() - ((lundi.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lundi);
    d.setDate(lundi.getDate() + i);
    return jourDe(d);
  });
}

/** Les jours de la série en cours : les `actuelle` jours qui finissent au dernier jour compté. */
function joursDeLaSerie(serie: Serie): Set<string> {
  const jours = new Set<string>();
  if (!serie.dernierJour || serie.actuelle <= 0) return jours;
  const fin = new Date(`${serie.dernierJour}T12:00:00`);
  for (let i = 0; i < serie.actuelle; i++) {
    const d = new Date(fin);
    d.setDate(fin.getDate() - i);
    jours.add(jourDe(d));
  }
  return jours;
}

export function SemaineSerie({ serie, nomCompagnon }: { serie: Serie; nomCompagnon: string }) {
  const semaine = joursDeLaSemaine();
  const pattes = joursDeLaSerie(serie);
  const aujourdhui = jourDe();
  const jours = `${serie.actuelle} jour${serie.actuelle > 1 ? 's' : ''}`;
  return (
    <Pressable
      style={styles.carte}
      onPress={() => router.push('/milo')}
      accessibilityRole="button"
      accessibilityLabel={`Série de ${jours}. Objectif ${serie.objectif} jours. Voir le profil de ${nomCompagnon}`}>
      <View style={styles.jours}>
        {semaine.map((j, i) => {
          const fait = pattes.has(j);
          const estAujourdhui = j === aujourdhui;
          return (
            <View key={j} style={styles.jour}>
              <Text style={[styles.initiale, estAujourdhui && styles.initialeAujourdhui]}>{INITIALES[i]}</Text>
              <View style={[styles.rond, fait && styles.rondFait, estAujourdhui && styles.rondAujourdhui]}>
                {fait && <Ionicons name="paw" size={13} color={couleurs.blanc} />}
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.resume}>
        <Text style={styles.nombre}>{serie.actuelle}</Text>
        <Text style={styles.unite}>/{serie.objectif} j 🐾</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  carte: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.m,
    marginHorizontal: espace.l,
    marginBottom: espace.m,
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.l,
    paddingHorizontal: espace.m,
    paddingVertical: espace.s,
    ...relief,
  },
  jours: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  jour: { alignItems: 'center', gap: 3 },
  initiale: { fontSize: 11, fontWeight: '700', color: couleurs.brunDoux },
  initialeAujourdhui: { color: couleurs.renardFonce, fontWeight: '900' },
  rond: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: couleurs.creme,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rondFait: { backgroundColor: couleurs.saumon },
  rondAujourdhui: { borderWidth: 2, borderColor: couleurs.renardFonce },
  resume: { flexDirection: 'row', alignItems: 'baseline', paddingLeft: espace.s, borderLeftWidth: 1.5, borderLeftColor: couleurs.ligne },
  nombre: { fontSize: 20, fontWeight: '800', color: couleurs.renardFonce, fontVariant: ['tabular-nums'] },
  unite: { fontSize: 12, fontWeight: '700', color: couleurs.brunDoux },
});
