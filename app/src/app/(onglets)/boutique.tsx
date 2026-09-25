/**
 * BOUTIQUE
 * Les pièces gagnées avec les tâches servent à personnaliser le compagnon.
 * Aucune pièce ne s'achète avec de l'argent.
 */
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { imageObjet } from '@/illustrations/registre';
import { Compagnon } from '@/components/Compagnon';
import { CompteurPieces, IconePiece } from '@/components/Pieces';
import { CATALOGUE_BOUTIQUE, type ObjetBoutique } from '@/config/boutique';
import { arrondis, couleurs, espace, polices } from '@/config/theme';
import { aZiggyPlus } from '@/services/abonnement';
import { useApp } from '@/store/etat';

export default function Boutique() {
  const { etat, dispatch } = useApp();
  const plus = aZiggyPlus(etat);
  const portes = CATALOGUE_BOUTIQUE.filter((o) => etat.equipe.includes(o.id));

  function toucher(o: ObjetBoutique) {
    if (etat.inventaire.includes(o.id)) return dispatch({ type: 'EQUIPER', objetId: o.id });
    if (o.premium && !plus) return router.push('/ziggy-plus');
    dispatch({ type: 'ACHETER', objetId: o.id });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: couleurs.creme }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <View style={styles.entete}>
          <Text style={styles.titre}>Boutique</Text>
          <CompteurPieces pieces={etat.pieces} />
        </View>

        <View style={styles.vitrine}>
          <Compagnon espece={etat.compagnon?.espece ?? 'renard'} pose="fier" taille={130} />
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.nom}>{etat.compagnon?.nom}</Text>
            <Text style={styles.detail}>
              {portes.length ? `Porte : ${portes.map((o) => o.nom.toLowerCase()).join(', ')}` : 'Touche un objet que tu possèdes pour le lui mettre.'}
            </Text>
            <Text style={styles.detail}>Gagne des pièces en faisant tes tâches du jour.</Text>
          </View>
        </View>

        <View style={styles.grille}>
          {CATALOGUE_BOUTIQUE.map((o) => {
            const possede = etat.inventaire.includes(o.id);
            const porte = etat.equipe.includes(o.id);
            const assez = etat.pieces >= o.prix;
            const verrou = o.premium && !plus;
            const image = imageObjet(o.id);
            return (
              <Pressable
                key={o.id}
                onPress={() => toucher(o)}
                disabled={!possede && !verrou && !assez}
                accessibilityRole="button"
                accessibilityLabel={`${o.nom}, ${possede ? (porte ? 'porté' : 'possédé') : `${o.prix} pièces`}`}
                style={[styles.objet, porte && styles.objetPorte, !possede && !assez && !verrou && { opacity: 0.55 }]}>
                <View style={styles.vignette}>
                  {image ? <Image source={image} style={{ width: 52, height: 52 }} contentFit="contain" /> : <Text style={{ fontSize: 34 }}>{o.emoji}</Text>}
                </View>
                <Text style={styles.objetNom} numberOfLines={2}>
                  {o.nom}
                </Text>
                {possede ? (
                  <Text style={styles.etat}>{porte ? 'Porté' : o.offert ? 'Offert · Porter' : 'Porter'}</Text>
                ) : verrou ? (
                  <Text style={[styles.etat, { color: couleurs.renardFonce }]}>Ziggy+</Text>
                ) : (
                  <View style={styles.prix}>
                    <IconePiece taille={14} />
                    <Text style={styles.prixTexte}>{o.prix}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenu: { padding: espace.l, gap: espace.l, paddingBottom: espace.xxl },
  entete: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titre: { fontFamily: polices.titre, fontSize: 28, fontWeight: '800', color: couleurs.brun },
  vitrine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.m,
    backgroundColor: couleurs.pecheClair,
    borderRadius: arrondis.l,
    padding: espace.m,
  },
  nom: { fontFamily: polices.titre, fontSize: 22, fontWeight: '800', color: couleurs.brun },
  detail: { fontSize: 13.5, color: couleurs.brunDoux, fontWeight: '600', lineHeight: 18 },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: espace.s },
  objet: {
    width: '31.8%',
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.m,
    borderWidth: 1,
    borderColor: couleurs.ligne,
    padding: espace.s,
    alignItems: 'center',
    gap: 4,
  },
  objetPorte: { borderWidth: 2, borderColor: couleurs.renardFonce },
  vignette: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: couleurs.creme,
    alignItems: 'center',
    justifyContent: 'center',
  },
  objetNom: { fontSize: 12.5, fontWeight: '800', color: couleurs.brun, textAlign: 'center', minHeight: 32 },
  etat: { fontSize: 12, fontWeight: '800', color: couleurs.saugeFonce },
  prix: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  prixTexte: { fontSize: 13, fontWeight: '800', color: '#9A6400', fontVariant: ['tabular-nums'] },
});
