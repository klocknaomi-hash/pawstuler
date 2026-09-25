/**
 * SHOP
 * Les pièces gagnées avec les tâches servent à personnaliser le compagnon.
 * Deux rayons : « Tenues complètes » (le compagnon habillé en entier, une tenue à la fois,
 * seulement celles illustrées pour son espèce) et « Objets ».
 * On peut essayer une tenue avant de l'acheter : l'aperçu montre le compagnon habillé.
 * Le portefeuille est réellement débité à chaque achat, et le solde est le même partout.
 * Aucune pièce ne s'achète avec de l'argent.
 */
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Bouton } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { CompteurPieces, IconePiece } from '@/components/Pieces';
import { COLLECTIONS, LIBELLES_TYPES, RAYONS, estPremium, type ObjetBoutique, type TypeObjet } from '@/config/boutique';
import { objetsPour } from '@/logique/garderobe';
import { arrondis, couleurs, espace, polices } from '@/config/theme';
import { imageObjet, imageTenue } from '@/illustrations/registre';
import { aPremium } from '@/services/abonnement';
import { useApp } from '@/store/etat';

export default function Shop() {
  const { etat, dispatch } = useApp();
  const plus = aPremium(etat);
  const espece = etat.compagnon?.espece ?? 'renard';
  const [rayon, setRayon] = useState<keyof typeof RAYONS>('tenues');
  const [type, setType] = useState<TypeObjet | 'tout'>('tout');
  const [achat, setAchat] = useState<ObjetBoutique | null>(null);
  // Seuls les objets prévus pour cet animal (les tenues illustrées arrivent animal par animal)
  const disponibles = objetsPour(espece);
  const portes = disponibles.filter((o) => etat.equipe.includes(o.id));
  const duRayon = disponibles.filter((o) => (rayon === 'tenues' ? o.habit : !o.habit));
  const typesDuRayon = [...new Set(duRayon.map((o) => o.type))];
  const catalogue = duRayon.filter((o) => type === 'tout' || o.type === type);
  const apercu = achat ? imageTenue(espece, achat.id) : undefined;

  function toucher(o: ObjetBoutique) {
    if (etat.inventaire.includes(o.id)) return dispatch({ type: 'EQUIPER', objetId: o.id });
    if (estPremium(o) && !plus) return router.push('/premium');
    setAchat(o);
  }

  function confirmer() {
    if (achat) dispatch({ type: 'ACHETER', objetId: achat.id });
    setAchat(null);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: couleurs.creme }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenu}>
        <View style={styles.entete}>
          <Text style={styles.titre}>Shop</Text>
          <Pressable onPress={() => router.push('/compte/portefeuille')} accessibilityRole="button" accessibilityLabel="Mon portefeuille">
            <CompteurPieces pieces={etat.pieces} />
          </Pressable>
        </View>

        <View style={styles.vitrine}>
          <Compagnon espece={espece} pose="fier" taille={120} equipe={etat.equipe} />
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.nom}>{etat.compagnon?.nom}</Text>
            <Text style={styles.detail}>
              {portes.length ? `Porte : ${portes.map((o) => o.nom.toLowerCase()).join(', ')}` : 'Touche une tenue que tu possèdes pour la lui mettre.'}
            </Text>
            <Text style={styles.detail}>Tes tâches du jour te rapportent des pièces.</Text>
          </View>
        </View>

        <View style={styles.rayons} accessibilityRole="tablist">
          {(Object.keys(RAYONS) as (keyof typeof RAYONS)[]).map((r) => (
            <Pressable
              key={r}
              onPress={() => {
                setRayon(r);
                setType('tout');
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: rayon === r }}
              style={[styles.rayon, rayon === r && styles.rayonChoisi]}>
              <Text style={[styles.rayonTexte, rayon === r && styles.rayonTexteChoisi]}>{RAYONS[r]}</Text>
            </Pressable>
          ))}
        </View>
        {rayon === 'tenues' && espece !== 'chat' && espece !== 'crocodile' && (
          <Text style={styles.detail}>
            La garde-robe de {etat.compagnon?.nom} arrive bientôt. En attendant, voici les tenues déjà prêtes pour tous.
          </Text>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtres}>
          {(['tout', ...typesDuRayon] as (TypeObjet | 'tout')[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => setType(t)}
              accessibilityRole="button"
              accessibilityState={{ selected: type === t }}
              style={[styles.filtre, type === t && styles.filtreActif]}>
              <Text style={[styles.filtreTexte, type === t && { color: couleurs.blanc }]}>{t === 'tout' ? 'Tout' : LIBELLES_TYPES[t]}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.grille}>
          {catalogue.map((o) => {
            const possede = etat.inventaire.includes(o.id);
            const porte = etat.equipe.includes(o.id);
            const assez = etat.pieces >= o.prix;
            const verrou = estPremium(o) && !plus;
            const habille = imageTenue(espece, o.id);
            const image = habille ?? imageObjet(o.id);
            return (
              <Pressable
                key={o.id}
                onPress={() => toucher(o)}
                accessibilityRole="button"
                accessibilityLabel={`${o.nom}, ${possede ? (porte ? 'porté' : 'possédé') : `${o.prix} pièces`}`}
                style={[styles.objet, porte && styles.objetPorte, !possede && !assez && !verrou && { opacity: 0.55 }]}>
                <View style={[styles.vignette, !!habille && styles.vignetteTenue]}>
                  {image ? (
                    <Image
                      source={image}
                      style={StyleSheet.absoluteFill}
                      // On montre la partie du corps concernée : la tête pour un chapeau, les pieds pour des chaussures…
                      contentFit={habille && o.type !== 'tenue' && o.type !== 'saison' ? 'cover' : 'contain'}
                      contentPosition={CADRAGE[o.type]}
                    />
                  ) : (
                    <Text style={{ fontSize: 34 }}>{o.emoji}</Text>
                  )}
                </View>
                <Text style={styles.objetNom} numberOfLines={2}>
                  {o.nom}
                </Text>
                {o.collection ? <Text style={styles.collection}>{COLLECTIONS[o.collection]}</Text> : null}
                {possede ? (
                  <Text style={styles.etat}>{porte ? 'Porté' : o.offert ? 'Offert · Porter' : 'Porter'}</Text>
                ) : verrou ? (
                  <Text style={[styles.etat, { color: couleurs.renardFonce }]}>🔒 Premium</Text>
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

      {/* Confirmation d'achat : le solde avant et après */}
      <Modal visible={!!achat} transparent animationType="fade" onRequestClose={() => setAchat(null)}>
        <Pressable style={styles.voile} onPress={() => setAchat(null)}>
          {achat && (
            <Pressable style={styles.feuille} onPress={() => {}}>
              {apercu ? (
                // Essayage : le compagnon habillé avec la tenue, avant de l'acheter
                <Image source={apercu} style={styles.essayage} contentFit="contain" accessibilityLabel={`Aperçu : ${etat.compagnon?.nom} avec ${achat.nom}`} />
              ) : (
                <Text style={{ fontSize: 48 }}>{achat.emoji}</Text>
              )}
              <Text style={styles.feuilleTitre}>{achat.nom}</Text>
              <View style={styles.soldes}>
                <LigneSolde libelle="Ton solde" valeur={etat.pieces} />
                <LigneSolde libelle="Prix" valeur={-achat.prix} />
                {etat.pieces >= achat.prix && (
                  <>
                    <View style={styles.separateur} />
                    <LigneSolde libelle="Après achat" valeur={etat.pieces - achat.prix} fort />
                  </>
                )}
              </View>
              {etat.pieces >= achat.prix ? (
                <Bouton titre={`Acheter pour ${achat.prix} pièces`} onPress={confirmer} style={{ alignSelf: 'stretch' }} />
              ) : (
                <Text style={styles.manque}>
                  Il te manque {achat.prix - etat.pieces} pièces. Termine quelques tâches du jour pour les gagner.
                </Text>
              )}
              <Bouton titre="Annuler" variante="texte" onPress={() => setAchat(null)} />
            </Pressable>
          )}
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

/** Partie de l'image à montrer dans la vignette, selon le type de vêtement. */
const CADRAGE: Record<TypeObjet, 'top' | 'center' | 'bottom'> = {
  chapeau: 'top',
  cou: 'center',
  haut: 'center',
  bas: 'bottom',
  chaussures: 'bottom',
  tenue: 'center',
  saison: 'center',
  accessoire: 'center',
  objet: 'center',
};

function LigneSolde({ libelle, valeur, fort }: { libelle: string; valeur: number; fort?: boolean }) {
  return (
    <View style={styles.ligneSolde}>
      <Text style={[styles.soldeLibelle, fort && { color: couleurs.brun }]}>{libelle}</Text>
      <View style={styles.prix}>
        <Text style={[styles.soldeValeur, fort && { fontSize: 18 }, valeur < 0 && { color: couleurs.danger }]}>
          {valeur < 0 ? `−${-valeur}` : valeur}
        </Text>
        <IconePiece taille={15} />
      </View>
    </View>
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
  filtres: { gap: 6 },
  rayons: { flexDirection: 'row', backgroundColor: couleurs.pecheClair, borderRadius: 999, padding: 4 },
  rayon: { flex: 1, paddingVertical: 9, borderRadius: 999, alignItems: 'center' },
  rayonChoisi: { backgroundColor: couleurs.carte },
  rayonTexte: { fontWeight: '700', color: couleurs.brunDoux, fontSize: 14 },
  rayonTexteChoisi: { color: couleurs.brun, fontWeight: '800' },
  vignetteTenue: { width: '100%', height: 92, overflow: 'hidden' },
  essayage: { width: 170, height: 210 },
  filtre: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: couleurs.ligne,
    backgroundColor: couleurs.carte,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filtreActif: { backgroundColor: couleurs.brun, borderColor: couleurs.brun },
  filtreTexte: { fontSize: 13, fontWeight: '800', color: couleurs.brun },
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
  collection: { fontSize: 11, fontWeight: '700', color: couleurs.brunDoux },
  prix: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  prixTexte: { fontSize: 13, fontWeight: '800', color: '#9A6400', fontVariant: ['tabular-nums'] },
  voile: { flex: 1, backgroundColor: 'rgba(46,33,28,0.4)', justifyContent: 'flex-end' },
  feuille: {
    backgroundColor: couleurs.creme,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: espace.xl,
    paddingBottom: 40,
    alignItems: 'center',
    gap: espace.m,
  },
  feuilleTitre: { fontFamily: polices.titre, fontSize: 22, fontWeight: '800', color: couleurs.brun },
  soldes: {
    alignSelf: 'stretch',
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.m,
    borderWidth: 1,
    borderColor: couleurs.ligne,
    padding: espace.l,
    gap: espace.s,
  },
  ligneSolde: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  soldeLibelle: { fontWeight: '700', color: couleurs.brunDoux, fontSize: 15 },
  soldeValeur: { fontWeight: '800', color: couleurs.brun, fontSize: 15, fontVariant: ['tabular-nums'] },
  separateur: { height: 1, backgroundColor: couleurs.ligne },
  manque: { textAlign: 'center', fontWeight: '700', color: couleurs.renardFonce, lineHeight: 20 },
});
