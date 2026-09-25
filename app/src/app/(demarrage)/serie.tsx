/**
 * ONBOARDING 7/7 — Objectif de série 🐾
 * L'utilisateur choisit combien de jours d'affilée il aimerait ouvrir l'app.
 * Ton bienveillant : chaque petite série compte, et une pause ne fait jamais rien perdre.
 * Dernière étape : on arrive ensuite sur l'accueil.
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Bouton, CarteChoix, Ecran, Texte, Titre } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { EnteteEtape } from '@/components/EnteteEtape';
import { OBJECTIFS_SERIE } from '@/config/serie';
import { arrondis, couleurs, espace, polices } from '@/config/theme';
import { useApp } from '@/store/etat';

export default function Serie() {
  const { etat, dispatch } = useApp();
  const [choix, setChoix] = useState(etat.serie.objectif);
  const nom = etat.compagnon?.nom ?? 'Ton compagnon';

  function terminer() {
    dispatch({ type: 'DEFINIR_OBJECTIF_SERIE', jours: choix });
    dispatch({ type: 'TERMINER_ONBOARDING' });
    router.replace('/accueil');
  }

  return (
    <Ecran defilant bas={<Bouton titre="C’est parti !" onPress={terminer} />}>
      <EnteteEtape etape={7} />
      <View style={styles.haut}>
        {etat.compagnon && <Compagnon espece={etat.compagnon.espece} pose="content" taille={110} />}
        <Titre style={{ textAlign: 'center' }}>Ton petit objectif de série</Titre>
        <Texte style={{ textAlign: 'center' }}>
          Combien de jours d’affilée aimerais-tu passer voir {nom} ? Chaque petite série compte.
        </Texte>
      </View>

      <View style={{ gap: espace.m }}>
        {OBJECTIFS_SERIE.map((o) => (
          <CarteChoix
            key={o.jours}
            choisi={choix === o.jours}
            onPress={() => setChoix(o.jours)}
            libelle={`${o.jours} jours : ${o.titre}. ${o.texte}`}
            style={styles.carte}>
            <View style={[styles.pastille, choix === o.jours && styles.pastilleChoisie]}>
              <Text style={[styles.nombre, choix === o.jours && { color: couleurs.blanc }]}>{o.jours}</Text>
              <Text style={[styles.unite, choix === o.jours && { color: couleurs.blanc }]}>jours</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.titre}>{o.titre}</Text>
              <Text style={styles.texte}>{o.texte}</Text>
            </View>
          </CarteChoix>
        ))}
      </View>

      <View style={styles.rassurer}>
        <Ionicons name="heart" size={18} color={couleurs.renardFonce} />
        <Text style={styles.rassurerTexte}>
          Pas de pression : si tu fais une pause, ta série recommence simplement. Tu ne perds rien, et {nom} sera toujours content de te revoir.
        </Text>
      </View>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  haut: { alignItems: 'center', gap: espace.s },
  carte: { flexDirection: 'row', alignItems: 'center', gap: espace.m, padding: espace.m },
  pastille: {
    width: 58,
    height: 58,
    borderRadius: arrondis.m,
    backgroundColor: couleurs.pecheClair,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastilleChoisie: { backgroundColor: couleurs.renardFonce },
  nombre: { fontFamily: polices.titre, fontSize: 22, fontWeight: '800', color: couleurs.renardFonce, lineHeight: 24 },
  unite: { fontSize: 11, fontWeight: '700', color: couleurs.renardFonce },
  titre: { fontFamily: polices.titre, fontSize: 16, fontWeight: '800', color: couleurs.brun },
  texte: { fontSize: 13.5, color: couleurs.brunDoux, fontWeight: '600', lineHeight: 18 },
  rassurer: { flexDirection: 'row', gap: espace.s, alignItems: 'flex-start', paddingHorizontal: espace.xs },
  rassurerTexte: { flex: 1, fontSize: 13.5, color: couleurs.brunDoux, fontWeight: '600', lineHeight: 19 },
});
