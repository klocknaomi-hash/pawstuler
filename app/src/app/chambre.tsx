/**
 * LA CHAMBRE DU COMPAGNON
 * Sa chambre dans sa ville (Clairebourg ou Sunnyville), vide au départ : on la remplit avec les
 * objets achetés au Shop (rayon « Chambre »). Toucher une place permet d'y poser un objet que l'on
 * possède, de le changer ou de le retirer. Les objets achetés se posent tout seuls sur une place libre.
 */
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Bouton, Ecran } from '@/components/base';
import { VueChambre } from '@/components/VueChambre';
import { CATALOGUE_BOUTIQUE } from '@/config/boutique';
import { CHAMBRES, LIBELLES_EMPLACEMENTS, type Emplacement } from '@/config/chambre';
import { arrondis, couleurs, espace, polices, relief } from '@/config/theme';
import { useMaintenant } from '@/hooks/useMaintenant';
import { compagnonAbsent } from '@/logique/missions';
import { estEndormi } from '@/logique/rythme';
import { useApp } from '@/store/etat';

export default function Chambre() {
  const { etat, dispatch } = useApp();
  const maintenant = useMaintenant();
  const [place, setPlace] = useState<Emplacement | null>(null);
  if (!etat.compagnon || !etat.villeId) return null;
  const ville = etat.villeId;
  const nom = etat.compagnon.nom;
  const absent = compagnonAbsent(etat, maintenant);
  const dort = estEndormi(etat.rythme);
  const chambre = etat.chambre ?? {};

  // Les objets de chambre possédés, et ceux qui vont à la place touchée
  const possedes = CATALOGUE_BOUTIQUE.filter((o) => o.emplacement && etat.inventaire.includes(o.id));
  const pourPlace = place ? possedes.filter((o) => o.emplacement === place.type) : [];
  const ouEst = (id: string) => CHAMBRES[ville].emplacements.find((p) => chambre[p.id] === id);
  const poses = Object.keys(chambre).length;

  function poser(objetId?: string) {
    if (place) dispatch({ type: 'PLACER_MEUBLE', emplacement: place.id, objetId });
    setPlace(null);
  }

  return (
    <Ecran defilant avecEntete>
      <Stack.Screen options={{ title: `La chambre de ${nom}` }} />
      <VueChambre
        ville={ville}
        chambre={chambre}
        compagnon={absent ? undefined : { espece: etat.compagnon.espece, pose: dort ? 'dort' : 'content', equipe: etat.equipe }}
        edition
        onToucher={setPlace}
      />
      <Text style={styles.aide}>
        {absent
          ? `${nom} est en aventure. Prépare-lui une jolie surprise pour son retour !`
          : 'Touche une place « + » pour y poser un objet, ou un objet pour le changer.'}
      </Text>

      <View style={styles.resume}>
        <Text style={styles.resumeTexte}>
          {poses === 0 ? 'La chambre est encore vide.' : `${poses} objet${poses > 1 ? 's' : ''} dans la chambre`}
          {possedes.length > poses ? ` · ${possedes.length - poses} de côté` : ''}
        </Text>
        <Bouton titre="Objets pour la chambre" variante="secondaire" onPress={() => router.push({ pathname: '/boutique', params: { rayon: 'chambre' } })} />
      </View>

      {/* Choisir un objet pour la place touchée */}
      <Modal visible={!!place} transparent animationType="fade" onRequestClose={() => setPlace(null)}>
        <Pressable style={styles.voile} onPress={() => setPlace(null)}>
          {place && (
            <Pressable style={styles.feuille} onPress={() => {}}>
              <Text style={styles.feuilleTitre}>{place.libelle}</Text>
              <Text style={styles.feuilleSous}>{LIBELLES_EMPLACEMENTS[place.type]}</Text>
              {pourPlace.length ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choix}>
                  {pourPlace.map((o) => {
                    const ici = chambre[place.id] === o.id;
                    const ailleurs = !ici ? ouEst(o.id) : undefined;
                    return (
                      <Pressable
                        key={o.id}
                        onPress={() => poser(o.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`Poser ${o.nom}`}
                        style={[styles.objet, ici && styles.objetIci]}>
                        <Text style={{ fontSize: 32 }}>{o.emoji}</Text>
                        <Text style={styles.objetNom} numberOfLines={2}>
                          {o.nom}
                        </Text>
                        {ici ? <Text style={styles.objetEtat}>Ici</Text> : ailleurs ? <Text style={styles.objetEtat}>Déplacer ici</Text> : null}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              ) : (
                <Text style={styles.vide}>Tu n’as pas encore d’objet pour cette place. Le Shop en propose plusieurs.</Text>
              )}
              {chambre[place.id] ? <Bouton titre="Retirer l’objet" variante="texte" onPress={() => poser(undefined)} /> : null}
              <Bouton
                titre="Voir le Shop"
                variante="secondaire"
                onPress={() => {
                  setPlace(null);
                  router.push({ pathname: '/boutique', params: { rayon: 'chambre' } });
                }}
              />
            </Pressable>
          )}
        </Pressable>
      </Modal>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  aide: { fontSize: 13.5, fontWeight: '600', color: couleurs.brunDoux, textAlign: 'center', lineHeight: 19 },
  resume: { backgroundColor: couleurs.carte, borderRadius: arrondis.l, padding: espace.l, gap: espace.m, ...relief },
  resumeTexte: { fontFamily: polices.titre, fontSize: 15, fontWeight: '800', color: couleurs.brun },
  voile: { flex: 1, backgroundColor: 'rgba(40,25,15,0.35)', justifyContent: 'flex-end' },
  feuille: {
    backgroundColor: couleurs.carte,
    borderTopLeftRadius: arrondis.l,
    borderTopRightRadius: arrondis.l,
    padding: espace.xl,
    paddingBottom: espace.xxl,
    gap: espace.m,
  },
  feuilleTitre: { fontFamily: polices.titre, fontSize: 19, fontWeight: '800', color: couleurs.brun },
  feuilleSous: { fontSize: 13, fontWeight: '700', color: couleurs.brunDoux, marginTop: -espace.s },
  choix: { gap: espace.s, paddingVertical: espace.xs },
  objet: {
    width: 96,
    alignItems: 'center',
    gap: 4,
    backgroundColor: couleurs.creme,
    borderRadius: arrondis.m,
    padding: espace.s,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  objetIci: { borderColor: couleurs.renardFonce, backgroundColor: couleurs.pecheClair },
  objetNom: { fontSize: 12.5, fontWeight: '700', color: couleurs.brun, textAlign: 'center' },
  objetEtat: { fontSize: 11, fontWeight: '800', color: couleurs.renardFonce },
  vide: { fontSize: 14, fontWeight: '600', color: couleurs.brunDoux, lineHeight: 20 },
});
