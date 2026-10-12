/**
 * AVENTURE DU JOUR (accueil) : une seule carte verte, juste sous la scène du compagnon.
 * Le titre « Aventure du jour » est dans la carte ; en dessous, une phrase qui change selon le moment :
 *  - « 10 ⚡ · Milo explore Clairebourg » (ou « Milo a un appel à passer », « Milo part à son entretien »…) ;
 *  - « Milo dort encore » ;
 *  - « Milo est allé déposer son CV chez Boulangerie du Lac » (pas d'heure ici : elle est déjà dans la scène) ;
 *  - « Milo est rentré ! Découvre son aventure » ;
 *  - « Nouvelle aventure demain », ou en Premium « Prochaine aventure à 14 h 43 ».
 * À droite, le compteur des aventures encore possibles aujourd'hui (« 1/1 », « 2/3 ») ;
 * en bas, l'énergie du compagnon en segments ⚡.
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { accorder } from '@/config/compagnons';
import { EnergieSegments } from '@/components/Energie';
import { CARTE_DISPONIBLE, CARTE_PARTI, COUTS_MISSION } from '@/config/missions';
import { AVENTURES_PAR_JOUR } from '@/config/energie';
import { arrondis, couleurs, espace } from '@/config/theme';
import { aventuresRestantes } from '@/logique/compagnon';
import { energieDisponible, energieMax, tempsAvantRecharge } from '@/logique/energie';
import { aventureDuJour, compagnonAbsent, heureLisible, prochainDepart, remplir, resultatADecouvrir } from '@/logique/missions';
import { aPremium } from '@/services/abonnement';
import type { EtatApp } from '@/store/types';

export function AventureDuJour({ etat, maintenant, dort }: { etat: EtatApp; maintenant: number; dort: boolean }) {
  if (!etat.compagnon) return null;
  const nom = etat.compagnon.nom;
  const absent = compagnonAbsent(etat, maintenant);
  const revenu = resultatADecouvrir(etat, maintenant);
  const depart = prochainDepart(etat, maintenant);
  const { mission, pasAvant } = aventureDuJour(etat, maintenant);
  const termine = depart === 'demain' && !absent && !revenu;
  const restantes = aventuresRestantes(etat);
  const maxAventures = aPremium(etat) ? AVENTURES_PAR_JOUR.premium : AVENTURES_PAR_JOUR.gratuit;

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
      <View style={styles.ligne}>
        <Ionicons name={termine ? 'moon' : 'map'} size={20} color={termine ? couleurs.saugeFonce : couleurs.blanc} />
        <View style={{ flex: 1 }}>
          <Text style={termine ? styles.titreFaite : styles.titre}>Aventure du jour</Text>
          <Text style={termine ? styles.sousFaite : styles.sous} numberOfLines={2}>
            {sous}
          </Text>
        </View>
        {/* Aventures encore possibles aujourd'hui */}
        <View style={[styles.compteur, termine && styles.compteurFait]} accessibilityLabel={`${restantes} aventure${restantes > 1 ? 's' : ''} sur ${maxAventures} aujourd’hui`}>
          <Ionicons name="compass" size={13} color={termine ? couleurs.saugeFonce : couleurs.blanc} />
          <Text style={[styles.compteurTexte, termine && { color: couleurs.saugeFonce }]}>
            {restantes}/{maxAventures}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={termine ? couleurs.saugeFonce : couleurs.blanc} />
      </View>
      <EnergieSegments
        energie={energieDisponible(etat, maintenant)}
        max={energieMax(etat)}
        recharge={tempsAvantRecharge(etat, maintenant)}
        clair={!termine}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ligne: { flexDirection: 'row', alignItems: 'center', gap: espace.m },
  compteur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  compteurFait: { backgroundColor: couleurs.carte },
  compteurTexte: { color: couleurs.blanc, fontWeight: '800', fontSize: 12.5, fontVariant: ['tabular-nums'] },
  carte: {
    gap: espace.m,
    backgroundColor: couleurs.saugeFonce,
    borderRadius: arrondis.l,
    padding: espace.l,
    // Relief : bord du bas plus foncé
    borderBottomWidth: 4,
    borderBottomColor: '#3D5A31',
  },
  titre: { color: couleurs.blanc, fontWeight: '800', fontSize: 16 },
  sous: { color: couleurs.blanc, opacity: 0.9, fontWeight: '600', fontSize: 13, marginTop: 2 },
  faite: {
    gap: espace.m,
    backgroundColor: couleurs.saugeClair,
    borderRadius: arrondis.l,
    padding: espace.l,
    borderBottomWidth: 4,
    borderBottomColor: '#D3E2C1',
  },
  titreFaite: { color: couleurs.saugeFonce, fontWeight: '800', fontSize: 16 },
  sousFaite: { color: couleurs.brunDoux, fontWeight: '600', fontSize: 13, marginTop: 2 },
});
