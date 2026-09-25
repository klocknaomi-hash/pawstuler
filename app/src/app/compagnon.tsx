/**
 * PROFIL DU COMPAGNON
 * Sa photo dans sa ville, son nom et ses pronoms, sa série 🐾, puis trois onglets
 * (À propos / Détails / Traits), sa collection (objets du Shop + souvenirs d'aventure)
 * et la section « Découverte » (lieux explorés dans sa ville).
 * Accessible depuis le badge de série de l'accueil et depuis l'onglet Compte.
 */
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Ecran, Pastille } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { BadgeSerie } from '@/components/Serie';
import { catalogueDe } from '@/config/boutique';
import { LIBELLES_PRONOMS, accorder, compagnonParId } from '@/config/compagnons';
import { OBJECTIFS_SERIE } from '@/config/serie';
import { arrondis, couleurs, espace, ombre, polices } from '@/config/theme';
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
  const [onglet, setOnglet] = useState<Onglet>('apropos');
  const [changerObjectif, setChangerObjectif] = useState(false);

  const compagnon = etat.compagnon;
  if (!compagnon || !etat.villeId) return null;
  const infos = compagnonParId(compagnon.espece);
  const ville = villeParId(etat.villeId);
  const decor = imageVille(ville.id, 'portrait');
  const joursEnsemble = joursEntre(compagnon.neLe) + 1;
  // Pronom sujet choisi par l'utilisateur (« il » par défaut)
  const sujet = accorder('{Il}', compagnon.pronoms);
  // Il ne « travaille » que pendant le chapitre professionnel (pas après une nouvelle recherche)
  const enPoste = etat.contexte === 'pro' && compagnon.metier;
  const metier = enPoste ? ville.lieux.find((l) => l.id === compagnon.metier?.lieuId) : undefined;

  // Collection : objets du Shop possédés + souvenirs des lieux découverts
  const decouverts = new Map(etat.decouvertes.filter((d) => d.villeId === ville.id).map((d) => [d.lieuId, d.le]));
  const objets = catalogueDe(compagnon.espece).map((o) => ({ id: o.id, nom: o.nom, emoji: o.emoji, possede: etat.inventaire.includes(o.id) }));
  const souvenirs = ville.lieux.map((l) => ({ id: l.id, nom: l.souvenir.nom, emoji: l.souvenir.emoji, possede: decouverts.has(l.id) }));
  const nbPossedes = [...objets, ...souvenirs].filter((x) => x.possede).length;

  return (
    <Ecran defilant avecEntete>
      {/* Photo du compagnon dans sa ville */}
      <View style={styles.photo}>
        {decor && <Image source={decor} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="bottom" />}
        <View style={styles.voile} />
        <Compagnon espece={compagnon.espece} pose="fier" taille={150} />
      </View>

      <View style={styles.identite}>
        <Text style={styles.nom}>{compagnon.nom}</Text>
        <Text style={styles.sousNom}>
          {infos.espece.replace(/^(le|la) /, '').replace(/^./, (c) => c.toUpperCase())}
          {compagnon.pronoms ? ` · ${LIBELLES_PRONOMS[compagnon.pronoms]}` : ''} · {ville.nom}
        </Text>
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
            <Detail libelle="Situation" valeur={enPoste && compagnon.metier ? compagnon.metier.intitule : 'En recherche'} />
            <Detail libelle="Collection" valeur={`${nbPossedes} sur ${objets.length + souvenirs.length}`} dernier />
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

      {/* Collection */}
      <View style={styles.section}>
        <View style={styles.sectionEntete}>
          <Text style={styles.sectionTitre}>Collection</Text>
          <Text style={styles.compte}>
            {nbPossedes}/{objets.length + souvenirs.length}
          </Text>
        </View>
        <Text style={styles.sousSection}>Objets du Shop</Text>
        <Grille elements={objets} />
        <Text style={styles.sousSection}>Souvenirs d’aventure</Text>
        <Grille elements={souvenirs} />
      </View>

      {/* Découverte */}
      <View style={styles.section}>
        <View style={styles.sectionEntete}>
          <Text style={styles.sectionTitre}>Découverte</Text>
          <Text style={styles.compte}>
            {decouverts.size}/{ville.lieux.length} lieux
          </Text>
        </View>
        <View style={styles.carte}>
          {ville.lieux.map((l, i) => {
            const le = decouverts.get(l.id);
            return (
              <View key={l.id} style={[styles.lieu, i > 0 && styles.separateur]}>
                <Text style={[styles.lieuEmoji, !le && { opacity: 0.35 }]}>{l.souvenir.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.lieuNom, !le && { color: couleurs.brunDoux }]}>{le ? l.nom : 'Lieu à découvrir'}</Text>
                  <Text style={styles.lieuDetail}>{le ? `Exploré le ${dateLisible(le)}` : 'Pars en aventure pour le découvrir'}</Text>
                </View>
                {le && <Ionicons name="checkmark-circle" size={20} color={couleurs.saugeFonce} />}
              </View>
            );
          })}
        </View>
      </View>
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

/** Grille de collection : les éléments obtenus en couleur, les autres en silhouette. */
function Grille({ elements }: { elements: { id: string; nom: string; emoji: string; possede: boolean }[] }) {
  return (
    <View style={styles.grille}>
      {elements.map((e) => (
        <View
          key={e.id}
          style={[styles.case, !e.possede && styles.caseVerrouillee]}
          accessibilityLabel={e.possede ? e.nom : `${e.nom}, pas encore obtenu`}>
          <Text style={[styles.caseEmoji, !e.possede && { opacity: 0.25 }]}>{e.emoji}</Text>
          <Text style={[styles.caseNom, !e.possede && { color: couleurs.brunDoux }]} numberOfLines={2}>
            {e.possede ? e.nom : '???'}
          </Text>
        </View>
      ))}
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
    borderWidth: 1,
    borderColor: couleurs.ligne,
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
  section: { gap: espace.s },
  sectionEntete: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sectionTitre: { fontFamily: polices.titre, fontSize: 19, fontWeight: '800', color: couleurs.brun },
  compte: { fontSize: 13, fontWeight: '700', color: couleurs.brunDoux },
  sousSection: { fontSize: 12.5, fontWeight: '800', color: couleurs.renardFonce, textTransform: 'uppercase', letterSpacing: 0.4 },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: espace.s },
  case: {
    width: '23%',
    flexGrow: 1,
    maxWidth: '24%',
    aspectRatio: 0.9,
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.m,
    borderWidth: 1,
    borderColor: couleurs.ligne,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    gap: 2,
  },
  caseVerrouillee: { backgroundColor: couleurs.creme, borderStyle: 'dashed' },
  caseEmoji: { fontSize: 28 },
  caseNom: { fontSize: 10.5, fontWeight: '700', color: couleurs.brun, textAlign: 'center' },
  lieu: { flexDirection: 'row', alignItems: 'center', gap: espace.m, paddingVertical: 6 },
  separateur: { borderTopWidth: 1, borderTopColor: couleurs.ligne },
  lieuEmoji: { fontSize: 22 },
  lieuNom: { fontWeight: '800', color: couleurs.brun, fontSize: 14.5 },
  lieuDetail: { fontSize: 12.5, fontWeight: '600', color: couleurs.brunDoux },
});
