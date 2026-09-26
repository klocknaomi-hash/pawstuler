/**
 * AVENTURE DU JOUR (accueil) : une seule carte verte, juste sous la scène du compagnon.
 * Elle change selon le moment :
 *  - disponible : ce que Milo va faire (« Milo part déposer son CV chez… ») et son coût en énergie ;
 *  - parti : « Milo est chez … · Retour à 11 h 05 » ;
 *  - revenu : « Milo est rentré ! Découvre son aventure » ;
 *  - entretien à heure précise : « Son entretien est à 11 h 30 » ;
 *  - quota atteint : « Nouvelle aventure demain », ou en Premium « Prochaine aventure à 14 h 43 ».
 * En dessous, si Milo a un entretien qui approche, un petit rappel (avec le Shop pour sa tenue).
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { accorder } from '@/config/compagnons';
import { COUTS_MISSION } from '@/config/missions';
import { arrondis, couleurs, espace } from '@/config/theme';
import {
  annonceEntretien,
  aventureDuJour,
  compagnonAbsent,
  heureLisible,
  ouEst,
  prochainDepart,
  resultatADecouvrir,
  titreMission,
} from '@/logique/missions';
import type { EtatApp } from '@/store/types';

export function AventureDuJour({ etat, maintenant, dort }: { etat: EtatApp; maintenant: number; dort: boolean }) {
  if (!etat.compagnon) return null;
  const nom = etat.compagnon.nom;
  const absent = compagnonAbsent(etat, maintenant);
  const revenu = resultatADecouvrir(etat, maintenant);
  const depart = prochainDepart(etat, maintenant);
  const { mission, pasAvant } = aventureDuJour(etat, maintenant);
  const annonce = annonceEntretien(etat);
  const ouvrir = () => router.push('/aventure');

  let sous: string;
  let disponible = false;
  if (absent?.retour) sous = `${ouEst(etat, absent)} · Retour à ${heureLisible(absent.retour)}`;
  else if (revenu) sous = accorder(`${nom} est rentré{e} ! Découvre son aventure`, etat.compagnon.pronoms);
  else if (dort) sous = `${nom} dort encore`;
  else if (depart === 'demain') sous = 'Nouvelle aventure demain';
  else if (typeof depart === 'number') sous = `Prochaine aventure à ${heureLisible(depart)}`;
  else if (pasAvant) sous = `Son entretien est à ${heureLisible(pasAvant)}`;
  else {
    sous = `${titreMission(etat, mission)} · ${COUTS_MISSION[mission.type]} ⚡`;
    disponible = true;
  }
  const termine = depart === 'demain' && !absent && !revenu;

  return (
    <View style={{ gap: espace.s }}>
      <Pressable
        style={[termine ? styles.faite : styles.carte, !disponible && !absent && !revenu && !termine && { opacity: 0.6 }]}
        onPress={ouvrir}
        accessibilityRole="button"
        accessibilityLabel={`Aventure du jour. ${sous}`}>
        <Ionicons name={termine ? 'moon' : 'map'} size={20} color={termine ? couleurs.saugeFonce : couleurs.blanc} />
        <View style={{ flex: 1 }}>
          <Text style={termine ? styles.titreFaite : styles.titre}>Aventure du jour</Text>
          <Text style={termine ? styles.sousFaite : styles.sous} numberOfLines={2}>
            {sous}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={termine ? couleurs.saugeFonce : couleurs.blanc} />
      </Pressable>

      {annonce && (
        <Pressable
          style={styles.annonce}
          onPress={() => annonce.versLeShop && router.push('/boutique')}
          disabled={!annonce.versLeShop}
          accessibilityRole={annonce.versLeShop ? 'button' : 'text'}>
          <Text style={styles.annonceTexte}>{annonce.texte}</Text>
          {annonce.versLeShop && <Text style={styles.annonceLien}>Voir les tenues au Shop ›</Text>}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  carte: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.m,
    backgroundColor: couleurs.saugeFonce,
    borderRadius: arrondis.m,
    padding: espace.l,
  },
  titre: { color: couleurs.blanc, fontWeight: '800', fontSize: 16 },
  sous: { color: couleurs.blanc, opacity: 0.92, fontWeight: '600', fontSize: 13, marginTop: 2 },
  faite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.m,
    backgroundColor: couleurs.saugeClair,
    borderRadius: arrondis.m,
    padding: espace.l,
  },
  titreFaite: { color: couleurs.saugeFonce, fontWeight: '800', fontSize: 15 },
  sousFaite: { color: couleurs.brunDoux, fontWeight: '600', fontSize: 13, marginTop: 2 },
  annonce: { backgroundColor: couleurs.pecheClair, borderRadius: arrondis.m, padding: espace.m, gap: 4 },
  annonceTexte: { fontWeight: '700', color: couleurs.brun, lineHeight: 19 },
  annonceLien: { fontWeight: '800', color: couleurs.renardFonce, fontSize: 13 },
});
