/**
 * ONGLET « OUTILS » — l'aide à l'emploi (Pawstuler Premium V1, sans IA en temps réel)
 * Quatre outils : préparer un entretien, scripts d'appel, modèles de mails, checklist CV.
 * En gratuit, un avant-goût de chacun ; Premium débloque tout. Le contenu est dans config/outils.ts.
 */
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ecran, Texte, Titre } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { OUTILS } from '@/config/outils';
import { arrondis, couleurs, espace, relief } from '@/config/theme';
import { useEspaceBarre } from '@/hooks/useEspaceBarre';
import { aPremium } from '@/services/abonnement';
import { useApp } from '@/store/etat';

/** Ce que la version gratuite propose dans chaque outil. */
const AVANT_GOUT: Record<(typeof OUTILS)[number]['id'], string> = {
  entretien: '5 questions et les questions à poser',
  appel: 'Le script de relance',
  mail: 'Le mail de relance',
  cv: 'Les 5 points essentiels',
};

export default function Outils() {
  const { etat } = useApp();
  const espaceBarre = useEspaceBarre();
  const premium = aPremium(etat);
  const compagnon = etat.compagnon;

  return (
    <Ecran defilant style={{ paddingBottom: espaceBarre }}>
      <View style={styles.entete}>
        <View style={{ flex: 1, gap: 4 }}>
          <Titre>Tes outils</Titre>
          <Texte>Pour préparer tes candidatures, tes appels et tes entretiens, à ton rythme.</Texte>
        </View>
        {compagnon && <Compagnon espece={compagnon.espece} pose="content" taille={84} equipe={etat.equipe} />}
      </View>

      {OUTILS.map((o) => (
        <Pressable
          key={o.id}
          onPress={() => router.push(o.route as Href)}
          accessibilityRole="button"
          accessibilityLabel={o.titre}
          style={({ pressed }) => [styles.carte, pressed && { transform: [{ scale: 0.98 }] }]}>
          <View style={styles.icone}>
            <Text style={{ fontSize: 24 }}>{o.emoji}</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.titre}>{o.titre}</Text>
            <Text style={styles.texte}>{o.texte}</Text>
            {!premium && <Text style={styles.gratuit}>Gratuit : {AVANT_GOUT[o.id]} · le reste avec Premium</Text>}
          </View>
          <Ionicons name="chevron-forward" size={20} color={couleurs.brunDoux} />
        </Pressable>
      ))}

      {!premium && (
        <Pressable onPress={() => router.push('/premium')} accessibilityRole="button" style={styles.premium}>
          <Text style={styles.premiumTitre}>✨ Tout débloquer avec Pawstuler Premium</Text>
          <Text style={styles.texte}>Toutes les questions d’entretien, tous les scripts et modèles, la checklist complète. Tes candidatures et ton compagnon restent gratuits.</Text>
        </Pressable>
      )}
    </Ecran>
  );
}

const styles = StyleSheet.create({
  entete: { flexDirection: 'row', alignItems: 'center', gap: espace.m },
  carte: { flexDirection: 'row', alignItems: 'center', gap: espace.m, backgroundColor: couleurs.carte, borderRadius: arrondis.l, padding: espace.l, ...relief },
  icone: { width: 48, height: 48, borderRadius: 24, backgroundColor: couleurs.pecheClair, alignItems: 'center', justifyContent: 'center' },
  titre: { fontSize: 16, fontWeight: '700', color: couleurs.brun },
  texte: { fontSize: 13, lineHeight: 18, color: couleurs.brunDoux },
  gratuit: { fontSize: 12, fontWeight: '600', color: couleurs.saugeFonce, marginTop: 2 },
  premium: { backgroundColor: couleurs.pecheClair, borderRadius: arrondis.l, padding: espace.l, gap: 4 },
  premiumTitre: { fontSize: 15, fontWeight: '700', color: couleurs.renardFonce },
});
