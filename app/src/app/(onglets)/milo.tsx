/**
 * ONGLET DU COMPAGNON (sa carte d'identité)
 * Sa photo dans sa ville, son nom et ses pronoms, sa série 🐾, sa garde-robe (accès au Shop
 * et à sa chambre), puis trois onglets (À propos / Détails / Traits). Page courte : la collection
 * est dans le Shop, et les lieux découverts dans l'onglet de la ville.
 * En haut à droite : ⚙️ ouvre le Compte (profil, abonnement, paramètres…).
 * Accessible depuis la barre d'onglets et depuis la semaine 🐾 de l'accueil.
 */
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ecran, Pastille } from '@/components/base';
import { CompteurPieces } from '@/components/Pieces';
import { useEspaceBarre } from '@/hooks/useEspaceBarre';
import { objetParId } from '@/config/boutique';
import { Compagnon } from '@/components/Compagnon';
import { BadgeSerie } from '@/components/Serie';
import { LIBELLES_PRONOMS, accorder, compagnonParId } from '@/config/compagnons';
import { OBJECTIFS_SERIE } from '@/config/serie';
import { arrondis, couleurs, espace, ombre, polices, relief } from '@/config/theme';
import { villeParId } from '@/config/villes';
import { imageVille } from '@/illustrations/registre';
import { dateLisible, joursEntre } from '@/logique/dates';
import { useApp } from '@/store/etat';

type Onglet = 'apropos' | 'details' | 'traits';
const ONGLETS: { id: Onglet; libelle: string }[] = [
  { id: 'apropos', libelle: 'À propos' },
  { id: 'details', libelle: 'Détails' },
  { id: 'traits', libelle: 'Traits' },
];

export default function ProfilCompagnon() {
  const { etat, dispatch } = useApp();
  const espaceBarre = useEspaceBarre();
  const [onglet, setOnglet] = useState<Onglet>('apropos');
  const [changerObjectif, setChangerObjectif] = useState(false);

  const compagnon = etat.compagnon;
  if (!compagnon || !etat.villeId) return null;
  const infos = compagnonParId(compagnon.espece);
  const ville = villeParId(etat.villeId);
  const decor = imageVille(ville.id, 'ville');
  const joursEnsemble = joursEntre(compagnon.neLe) + 1;
  // Pronom sujet choisi par l'utilisateur (« il » par défaut)
  const sujet = accorder('{Il}', compagnon.pronoms);
  // Il ne « travaille » que pendant le chapitre professionnel (pas après une nouvelle recherche)
  const enPoste = etat.contexte === 'pro' && compagnon.metier;
  const metier = enPoste ? ville.lieux.find((l) => l.id === compagnon.metier?.lieuId) : undefined;


  return (
    <Ecran defilant style={{ paddingBottom: espaceBarre }}>
      {/* Photo du compagnon dans sa ville, avec ses pièces et l'accès au Compte */}
      <View style={styles.photo}>
        {decor && <Image source={decor} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="bottom" />}
        <View style={styles.voile} />
        <Compagnon espece={compagnon.espece} pose="fier" taille={150} equipe={etat.equipe} />
        <Pressable onPress={() => router.push('/compte/portefeuille')} accessibilityRole="button" accessibilityLabel="Mon portefeuille" style={styles.pieces}>
          <CompteurPieces pieces={etat.pieces} />
        </Pressable>
        <Pressable onPress={() => router.push('/compte')} accessibilityRole="button" accessibilityLabel="Compte et réglages" hitSlop={8} style={styles.reglages}>
          <Ionicons name="settings-outline" size={22} color={couleurs.brun} />
        </Pressable>
      </View>

      <View style={styles.identite}>
        <Text style={styles.nom}>{compagnon.nom}</Text>
        <Text style={styles.sousNom}>
          {infos.espece.replace(/^(le|la) /, '').replace(/^./, (c) => c.toUpperCase())}
          {compagnon.pronoms ? ` · ${LIBELLES_PRONOMS[compagnon.pronoms]}` : ''} · {ville.nom}
        </Text>
      </View>

      {/* Garde-robe : ce qu'il porte, le Shop et sa chambre */}
      <View style={styles.garderobe}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.sectionTitre}>Sa garde-robe</Text>
          <Text style={styles.lieuDetail}>
            {(() => {
              const portes = etat.equipe.map((id) => objetParId(id)?.nom).filter(Boolean);
              return portes.length ? `${sujet} porte : ${portes.join(', ')}` : `${sujet} porte sa tenue de tous les jours`;
            })()}
          </Text>
        </View>
      </View>
      <View style={styles.boutons}>
        <Pressable onPress={() => router.push('/boutique')} accessibilityRole="button" style={styles.bouton}>
          <Ionicons name="shirt-outline" size={18} color={couleurs.renardFonce} />
          <Text style={styles.boutonTexte}>Shop et tenues</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/chambre')} accessibilityRole="button" style={styles.bouton}>
          <Ionicons name="bed-outline" size={18} color={couleurs.renardFonce} />
          <Text style={styles.boutonTexte}>Sa chambre</Text>
        </Pressable>
      </View>

      {/* Série et chiffres clés */}
      <View style={styles.chiffres}>
        <Pressable onPress={() => setChangerObjectif((v) => !v)} accessibilityRole="button" accessibilityHint="Changer l’objectif de série">
          <BadgeSerie serie={etat.serie} grand />
        </Pressable>
        <Chiffre valeur={`${etat.serie.meilleure} j`} libelle="Meilleure série" />
        <Chiffre valeur={`${etat.aventuresTotal}`} libelle={`Aventure${etat.aventuresTotal > 1 ? 's' : ''}`} />
      </View>
      <Pressable onPress={() => setChangerObjectif((v) => !v)} accessibilityRole="button">
        <Text style={styles.objectif}>
          Objectif : {etat.serie.objectif} jours d’affilée{etat.serie.actuelle >= etat.serie.objectif ? ' · atteint 🎉' : ''} ·{' '}
          <Text style={styles.lien}>{changerObjectif ? 'Fermer' : 'Modifier'}</Text>
        </Text>
      </Pressable>
      {changerObjectif && (
        <View style={styles.pastilles}>
          {OBJECTIFS_SERIE.map((o) => (
            <Pastille
              key={o.jours}
              libelle={`${o.jours} jours`}
              choisi={etat.serie.objectif === o.jours}
              onPress={() => dispatch({ type: 'DEFINIR_OBJECTIF_SERIE', jours: o.jours })}
            />
          ))}
        </View>
      )}

      {/* Onglets À propos / Détails / Traits */}
      <View style={styles.onglets} accessibilityRole="tablist">
        {ONGLETS.map((o) => (
          <Pressable
            key={o.id}
            onPress={() => setOnglet(o.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: onglet === o.id }}
            style={[styles.onglet, onglet === o.id && styles.ongletChoisi]}>
            <Text style={[styles.ongletTexte, onglet === o.id && styles.ongletTexteChoisi]}>{o.libelle}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.carte}>
        {onglet === 'apropos' && (
          <>
            <Text style={styles.paragraphe}>{accorder(infos.description, compagnon.pronoms)}</Text>
            <Text style={styles.paragraphe}>
              {compagnon.nom} vit à {ville.nom} depuis {joursEnsemble} jour{joursEnsemble > 1 ? 's' : ''}.{' '}
              {metier && compagnon.metier ? `${sujet} travaille comme ${compagnon.metier.intitule.toLowerCase()} (${metier.nom}).` : `${sujet} y cherche son job, en même temps que toi.`}
            </Text>
          </>
        )}
        {onglet === 'details' && (
          <>
            <Detail libelle="Espèce" valeur={infos.espece.replace(/^(le|la) /, '')} />
            <Detail libelle="Pronoms" valeur={compagnon.pronoms ? LIBELLES_PRONOMS[compagnon.pronoms] : 'Non précisés'} />
            <Detail libelle="Né le" valeur={dateLisible(compagnon.neLe)} />
            <Detail libelle="Ville" valeur={ville.nom} />
            <Detail libelle="Situation" valeur={enPoste && compagnon.metier ? compagnon.metier.intitule : 'En recherche'} dernier />
          </>
        )}
        {onglet === 'traits' && (
          <>
            <View style={styles.traits}>
              {infos.traits.map((t) => (
                <View key={t} style={styles.trait}>
                  <Text style={styles.traitTexte}>{t}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.paragraphe}>
              <Text style={{ fontWeight: '800' }}>Ce qu’{sujet.toLowerCase()} aime : </Text>
              {infos.aime.charAt(0).toLowerCase() + infos.aime.slice(1)}.
            </Text>
          </>
        )}
      </View>
      <Pressable onPress={() => router.push('/compte/profil')} accessibilityRole="button" style={styles.modifier}>
        <Ionicons name="create-outline" size={16} color={couleurs.renardFonce} />
        <Text style={styles.lien}>Modifier son prénom ou ses pronoms</Text>
      </Pressable>

    </Ecran>
  );
}

function Chiffre({ valeur, libelle }: { valeur: string; libelle: string }) {
  return (
    <View style={styles.chiffre}>
      <Text style={styles.chiffreValeur}>{valeur}</Text>
      <Text style={styles.chiffreLibelle}>{libelle}</Text>
    </View>
  );
}

function Detail({ libelle, valeur, dernier }: { libelle: string; valeur: string; dernier?: boolean }) {
  return (
    <View style={[styles.detail, !dernier && styles.separateurBas]}>
      <Text style={styles.detailLibelle}>{libelle}</Text>
      <Text style={styles.detailValeur}>{valeur}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: {
    height: 230,
    borderRadius: arrondis.l,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: espace.s,
    backgroundColor: couleurs.pecheClair,
  },
  pieces: { position: 'absolute', top: espace.s, left: espace.s },
  reglages: {
    position: 'absolute',
    top: espace.s,
    right: espace.s,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  garderobe: { flexDirection: 'row', alignItems: 'center', gap: espace.s },
  boutons: { flexDirection: 'row', gap: espace.s },
  bouton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.m,
    paddingVertical: 11,
    ...relief,
  },
  boutonTexte: { fontSize: 14, fontWeight: '700', color: couleurs.renardFonce },
  voile: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(255, 246, 236, 0.15)' },
  identite: { alignItems: 'center', gap: 2 },
  nom: { fontFamily: polices.titre, fontSize: 30, fontWeight: '800', color: couleurs.brun },
  sousNom: { fontSize: 14, fontWeight: '700', color: couleurs.brunDoux },
  chiffres: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: espace.m },
  chiffre: { alignItems: 'center' },
  chiffreValeur: { fontFamily: polices.titre, fontSize: 17, fontWeight: '800', color: couleurs.brun },
  chiffreLibelle: { fontSize: 11.5, fontWeight: '700', color: couleurs.brunDoux },
  objectif: { textAlign: 'center', fontSize: 13, fontWeight: '600', color: couleurs.brunDoux },
  lien: { color: couleurs.renardFonce, fontWeight: '800' },
  pastilles: { flexDirection: 'row', flexWrap: 'wrap', gap: espace.s, justifyContent: 'center' },
  onglets: { flexDirection: 'row', backgroundColor: couleurs.pecheClair, borderRadius: 999, padding: 4 },
  onglet: { flex: 1, paddingVertical: 8, borderRadius: 999, alignItems: 'center' },
  ongletChoisi: { backgroundColor: couleurs.carte, ...ombre },
  ongletTexte: { fontWeight: '700', color: couleurs.brunDoux, fontSize: 14 },
  ongletTexteChoisi: { color: couleurs.brun, fontWeight: '800' },
  carte: {
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.m,
    ...relief,
    padding: espace.l,
    gap: espace.s,
  },
  paragraphe: { fontSize: 14.5, color: couleurs.brun, fontWeight: '600', lineHeight: 21 },
  detail: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  separateurBas: { borderBottomWidth: 1, borderBottomColor: couleurs.ligne },
  detailLibelle: { fontSize: 14, fontWeight: '600', color: couleurs.brunDoux },
  detailValeur: { fontSize: 14, fontWeight: '800', color: couleurs.brun, textTransform: 'capitalize' },
  traits: { flexDirection: 'row', flexWrap: 'wrap', gap: espace.s },
  trait: { backgroundColor: couleurs.saugeClair, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  traitTexte: { fontWeight: '800', color: couleurs.saugeFonce, fontSize: 13.5 },
  modifier: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  sectionTitre: { fontFamily: polices.titre, fontSize: 18, fontWeight: '800', color: couleurs.brun },
  lieuDetail: { fontSize: 12.5, fontWeight: '600', color: couleurs.brunDoux },
});
