/**
 * AVENTURE DU JOUR (accueil) : une seule carte verte, juste sous la scène du compagnon.
 * Le titre « Aventure du jour » est dans la carte ; en dessous, une phrase qui change selon le moment :
 *  - « 10 ⚡ · Milo explore Clairebourg » (ou « Milo a un appel à passer », « Milo part à son entretien »…) ;
 *  - « Milo dort encore » ;
 *  - « Milo est allé déposer son CV chez Boulangerie du Lac » (pas d'heure ici : elle est déjà dans la scène) ;
 *  - « Milo est rentré ! Découvre son aventure » ;
 *  - « Nouvelle aventure demain », ou en Premium « Prochaine aventure à 14 h 43 ».
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { accorder } from '@/config/compagnons';
import { CARTE_DISPONIBLE, CARTE_PARTI, COUTS_MISSION } from '@/config/missions';
import { arrondis, couleurs, espace } from '@/config/theme';
import { aventureDuJour, compagnonAbsent, heureLisible, prochainDepart, remplir, resultatADecouvrir } from '@/logique/missions';
import type { EtatApp } from '@/store/types';

export function AventureDuJour({ etat, maintenant, dort }: { etat: EtatApp; maintenant: number; dort: boolean }) {
  if (!etat.compagnon) return null;
  const nom = etat.compagnon.nom;
  const absent = compagnonAbsent(etat, maintenant);
  const revenu = resultatADecouvrir(etat, maintenant);
  const depart = prochainDepart(etat, maintenant);
  const { mission, pasAvant } = aventureDuJour(etat, maintenant);
  const termine = depart === 'demain' && !absent && !revenu;

  let sous: string;
  if (absent) sous = remplir(etat, CARTE_PARTI[absent.type], absent);
  else if (revenu) sous = accorder(`${nom} est rentré{e} ! Découvre son aventure`, etat.compagnon.pronoms);
  else if (dort) sous = `${nom} dort encore`;
  else if (depart === 'demain') sous = 'Nouvelle aventure demain';
  else if (typeof depart === 'number') sous = `Prochaine aventure à ${heureLisible(depart)}`;
  else if (pasAvant) sous = `${nom} a un entretien à ${heureLisible(pasAvant)}`;
  else sous = remplir(etat, CARTE_DISPONIBLE[mission.type], mission, { cout: String(COUTS_MISSION[mission.type]) });
  const grisee = dort && !absent && !revenu;

  return (
    <Pressable
      style={[termine ? styles.faite : styles.carte, grisee && { opacity: 0.5 }]}
      onPress={() => router.push('/aventure')}
      disabled={grisee}
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
  sous: { color: couleurs.blanc, opacity: 0.9, fontWeight: '600', fontSize: 13, marginTop: 2 },
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
});
