/**
 * LA CHAMBRE, DESSINÉE
 * L'illustration de la chambre (selon la ville), les objets posés sur leurs emplacements
 * et, s'il est à la maison, le compagnon. En mode « édition », chaque place vide montre un « + ».
 * Les objets sont des emojis en attendant leurs illustrations ; un tapis est dessiné en ovale de couleur.
 */
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import { objetParId } from '@/config/boutique';
import { CHAMBRES, TAILLE_OBJET, type Emplacement } from '@/config/chambre';
import type { EspeceId, Pose } from '@/config/compagnons';
import { arrondis, couleurs } from '@/config/theme';
import type { VilleId } from '@/config/villes';
import { imageObjet, imageVille } from '@/illustrations/registre';

import { Compagnon } from './Compagnon';

export function VueChambre({
  ville,
  chambre,
  compagnon,
  edition = false,
  onToucher,
}: {
  ville: VilleId;
  /** Emplacement → objet posé. */
  chambre: Record<string, string>;
  /** Le compagnon dans sa chambre (absent s'il est parti en aventure). */
  compagnon?: { espece: EspeceId; pose: Pose; equipe?: string[] };
  /** Montre les places vides (« + ») et rend les emplacements touchables. */
  edition?: boolean;
  onToucher?: (e: Emplacement) => void;
}) {
  const plan = CHAMBRES[ville];
  const [largeur, setLargeur] = useState(0);
  const hauteur = largeur / plan.ratio;
  const surLayout = (e: LayoutChangeEvent) => setLargeur(e.nativeEvent.layout.width);
  const tapis = plan.emplacements.filter((p) => p.type === 'tapis');
  const autres = plan.emplacements.filter((p) => p.type !== 'tapis');

  return (
    <View style={[styles.cadre, { aspectRatio: plan.ratio }]} onLayout={surLayout}>
      <Image source={imageVille(ville, 'chambre')} style={StyleSheet.absoluteFill} contentFit="cover" />
      {largeur > 0 && (
        <>
          {/* Le tapis d'abord (sous le compagnon), puis le compagnon, puis les autres objets */}
          {tapis.map((p) => (
            <Place key={p.id} place={p} objetId={chambre[p.id]} largeur={largeur} hauteur={hauteur} edition={edition} onToucher={onToucher} />
          ))}
          {compagnon && (
            <View
              pointerEvents="none"
              style={[
                styles.compagnon,
                { left: (plan.compagnon.x / 100) * largeur - largeur * 0.2, top: (plan.compagnon.y / 100) * hauteur - largeur * 0.4, width: largeur * 0.4 },
              ]}>
              <Compagnon espece={compagnon.espece} pose={compagnon.pose} taille={largeur * 0.36} equipe={compagnon.equipe} promenade={false} />
            </View>
          )}
          {autres.map((p) => (
            <Place key={p.id} place={p} objetId={chambre[p.id]} largeur={largeur} hauteur={hauteur} edition={edition} onToucher={onToucher} />
          ))}
        </>
      )}
    </View>
  );
}

/** Un emplacement : l'objet posé, une place vide « + » (en édition), ou rien. */
function Place({
  place,
  objetId,
  largeur,
  hauteur,
  edition,
  onToucher,
}: {
  place: Emplacement;
  objetId?: string;
  largeur: number;
  hauteur: number;
  edition: boolean;
  onToucher?: (e: Emplacement) => void;
}) {
  const objet = objetId ? objetParId(objetId) : undefined;
  if (!objet && !edition) return null;
  const taille = (TAILLE_OBJET[place.type] / 100) * largeur;
  const estTapis = place.type === 'tapis';
  const h = estTapis ? taille * 0.32 : taille;
  // x = centre ; y = bas de l'objet (là où il est posé)
  const position = { left: (place.x / 100) * largeur - taille / 2, top: (place.y / 100) * hauteur - h, width: taille, height: h };
  const image = objet ? imageObjet(objet.id) : undefined;
  return (
    <Pressable
      disabled={!edition}
      onPress={() => onToucher?.(place)}
      accessibilityRole={edition ? 'button' : undefined}
      accessibilityLabel={edition ? `${place.libelle} : ${objet ? objet.nom : 'place libre'}` : objet?.nom}
      style={[styles.place, position]}>
      {objet ? (
        estTapis ? (
          <View style={[styles.tapis, { backgroundColor: objet.couleur ?? couleurs.pecheClair, borderRadius: taille }]} />
        ) : image ? (
          <Image source={image} style={StyleSheet.absoluteFill} contentFit="contain" />
        ) : (
          <Text style={{ fontSize: taille * 0.82, lineHeight: taille }}>{objet.emoji}</Text>
        )
      ) : (
        <View style={[styles.vide, estTapis && { borderRadius: taille }]}>
          <Ionicons name="add" size={Math.max(14, Math.min(22, taille * 0.4))} color={couleurs.renardFonce} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cadre: { width: '100%', borderRadius: arrondis.l, overflow: 'hidden', backgroundColor: couleurs.creme },
  compagnon: { position: 'absolute', alignItems: 'center' },
  place: { position: 'absolute', alignItems: 'center', justifyContent: 'flex-end' },
  tapis: { width: '100%', height: '100%', borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)' },
  vide: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: couleurs.renardFonce,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
