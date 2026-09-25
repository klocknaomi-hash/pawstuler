/**
 * 💼 MON AVENTURE PROFESSIONNELLE
 * Le chapitre qui suit « J'ai décroché ! » : l'entreprise, le poste, le premier jour,
 * les objectifs personnels, la progression, et le compagnon qui avance en parallèle.
 * On peut à tout moment recommencer une recherche : l'historique est conservé.
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Bouton, Champ, Ecran, SousTitre, Titre } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { IconePiece } from '@/components/Pieces';
import { CATALOGUE_TACHES, PIECES_OBJECTIF } from '@/config/taches';
import { arrondis, couleurs, espace, polices } from '@/config/theme';
import { villeParId } from '@/config/villes';
import { dateEnSaisie, dateLisible, joursEntre, lireDateFr } from '@/logique/dates';
import { emploiActuel } from '@/logique/tachesDuJour';
import { useApp } from '@/store/etat';

export default function AventurePro() {
  const { etat, dispatch } = useApp();
  const emploi = emploiActuel(etat);
  const [nouvelObjectif, setNouvelObjectif] = useState('');
  const [edition, setEdition] = useState(false);
  const [entreprise, setEntreprise] = useState(emploi?.entreprise ?? '');
  const [poste, setPoste] = useState(emploi?.poste ?? '');
  const [premierJour, setPremierJour] = useState(dateEnSaisie(emploi?.premierJour));

  const anciens = etat.emplois.filter((e) => e.termineLe);

  if (!emploi) {
    return (
      <Ecran defilant>
        <Titre>Mon aventure professionnelle</Titre>
        <Text style={styles.texte}>
          Ce chapitre s’ouvre le jour où tu décroches un poste : touche « J’ai décroché ! » dans une candidature.
        </Text>
        {anciens.length > 0 && <AnciensPostes emplois={anciens} />}
        <Bouton titre="Retour" variante="secondaire" onPress={() => router.back()} />
      </Ecran>
    );
  }

  const compagnon = etat.compagnon;
  const lieu = compagnon?.metier && etat.villeId ? villeParId(etat.villeId).lieux.find((l) => l.id === compagnon.metier?.lieuId) : undefined;
  const depuis = emploi.premierJour && joursEntre(emploi.premierJour) >= 0 ? joursEntre(emploi.premierJour) : null;
  const avant = emploi.premierJour && joursEntre(emploi.premierJour) < 0 ? -joursEntre(emploi.premierJour) : null;
  const atteints = emploi.objectifs.filter((o) => o.atteint).length;
  const tachesPro = etat.modelesFaits.filter((id) => CATALOGUE_TACHES.find((m) => m.id === id)?.contexte === 'pro').length;

  function ajouterObjectif() {
    const titre = nouvelObjectif.trim();
    if (!titre) return;
    dispatch({ type: 'AJOUTER_OBJECTIF', titre });
    setNouvelObjectif('');
  }

  function enregistrer() {
    const date = premierJour.trim() ? lireDateFr(premierJour) : undefined;
    dispatch({
      type: 'MODIFIER_EMPLOI',
      modifs: { entreprise: entreprise.trim() || emploi!.entreprise, poste: poste.trim() || emploi!.poste, premierJour: date ?? emploi!.premierJour },
    });
    setEdition(false);
  }

  function recommencer() {
    const lancer = () => {
      dispatch({ type: 'NOUVELLE_RECHERCHE' });
      router.dismissTo('/accueil');
    };
    if (Platform.OS === 'web') return lancer();
    Alert.alert(
      'Recommencer une recherche ?',
      `Ce chapitre sera rangé dans ton historique. ${compagnon?.nom ?? 'Ton compagnon'}, tes pièces et toutes tes données restent avec toi.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Recommencer', onPress: lancer },
      ],
    );
  }

  return (
    <Ecran defilant>
      <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Fermer" hitSlop={12} style={{ alignSelf: 'flex-end' }}>
        <Ionicons name="close" size={26} color={couleurs.brun} />
      </Pressable>
      <Titre>💼 Mon aventure professionnelle</Titre>

      {/* Le poste */}
      <View style={styles.carte}>
        {edition ? (
          <View style={{ gap: espace.m }}>
            <Champ label="Mon entreprise" value={entreprise} onChangeText={setEntreprise} />
            <Champ label="Mon poste" value={poste} onChangeText={setPoste} />
            <Champ label="Mon premier jour" value={premierJour} onChangeText={setPremierJour} placeholder="Ex. 06/10" />
            <Bouton titre="Enregistrer" onPress={enregistrer} />
          </View>
        ) : (
          <>
            <Ligne icone="🏢" libelle="Mon entreprise" valeur={emploi.entreprise} />
            <Ligne icone="💼" libelle="Mon poste" valeur={emploi.poste} />
            <Ligne icone="📅" libelle="Mon premier jour" valeur={emploi.premierJour ? dateLisible(emploi.premierJour) : 'À préciser'} />
            <Pressable onPress={() => setEdition(true)} accessibilityRole="button" style={styles.modifier}>
              <Ionicons name="create-outline" size={16} color={couleurs.renardFonce} />
              <Text style={styles.modifierTexte}>Modifier</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Le compagnon, en parallèle */}
      {compagnon && (
        <View style={styles.parallele}>
          <Compagnon espece={compagnon.espece} pose="fier" taille={84} equipe={etat.equipe} />
          <Text style={styles.paralleleTexte}>
            {compagnon.metier && lieu
              ? `${compagnon.nom} a commencé lui aussi : ${compagnon.metier.intitule.toLowerCase()} à ${lieu.nom}.`
              : `${compagnon.nom} commence lui aussi une nouvelle aventure.`}
          </Text>
        </View>
      )}

      {/* Objectifs */}
      <View style={{ gap: espace.s }}>
        <SousTitre>🎯 Mes objectifs</SousTitre>
        {emploi.objectifs.length === 0 && (
          <Text style={styles.texte}>Ajoute ce que tu veux réussir dans ce poste. Chaque objectif atteint rapporte {PIECES_OBJECTIF} pièces.</Text>
        )}
        {emploi.objectifs.map((o) => (
          <Pressable
            key={o.id}
            onPress={() => dispatch({ type: 'BASCULER_OBJECTIF', id: o.id })}
            onLongPress={() => dispatch({ type: 'SUPPRIMER_OBJECTIF', id: o.id })}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: o.atteint }}
            accessibilityHint="Appui long pour supprimer"
            style={[styles.objectif, o.atteint && styles.objectifAtteint]}>
            <View style={[styles.coche, o.atteint && styles.cocheFaite]}>
              {o.atteint && <Ionicons name="checkmark" size={16} color={couleurs.blanc} />}
            </View>
            <Text style={[styles.objectifTexte, o.atteint && { color: couleurs.saugeFonce }]}>{o.titre}</Text>
            <View style={styles.gain}>
              <Text style={styles.gainTexte}>+{PIECES_OBJECTIF}</Text>
              <IconePiece taille={13} />
            </View>
          </Pressable>
        ))}
        <View style={styles.saisie}>
          <TextInput
            value={nouvelObjectif}
            onChangeText={setNouvelObjectif}
            onSubmitEditing={ajouterObjectif}
            placeholder="Ex. Prendre la parole en réunion"
            placeholderTextColor={couleurs.brunDoux}
            style={styles.champ}
            returnKeyType="done"
            accessibilityLabel="Nouvel objectif"
          />
          <Pressable onPress={ajouterObjectif} style={styles.valider} accessibilityRole="button" accessibilityLabel="Ajouter l’objectif">
            <Ionicons name="add" size={24} color={couleurs.blanc} />
          </Pressable>
        </View>
      </View>

      {/* Progression */}
      <View style={{ gap: espace.s }}>
        <SousTitre>📈 Ma progression</SousTitre>
        <View style={styles.stats}>
          <Stat
            valeur={depuis !== null ? String(depuis) : avant !== null ? `J-${avant}` : '—'}
            libelle={depuis !== null ? 'jours dans le poste' : 'avant le premier jour'}
          />
          <Stat valeur={`${atteints}/${emploi.objectifs.length}`} libelle="objectifs atteints" />
          <Stat valeur={String(tachesPro)} libelle="étapes franchies" />
        </View>
      </View>

      {anciens.length > 0 && <AnciensPostes emplois={anciens} />}

      <Bouton titre="Recommencer une recherche d’emploi" variante="secondaire" onPress={recommencer} />
      <Text style={styles.note}>Ton historique, ton compagnon et tes pièces sont toujours conservés.</Text>
    </Ecran>
  );
}

function Ligne({ icone, libelle, valeur }: { icone: string; libelle: string; valeur: string }) {
  return (
    <View style={styles.ligne}>
      <Text style={{ fontSize: 20 }}>{icone}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.libelle}>{libelle}</Text>
        <Text style={styles.valeur}>{valeur}</Text>
      </View>
    </View>
  );
}

function Stat({ valeur, libelle }: { valeur: string; libelle: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValeur}>{valeur}</Text>
      <Text style={styles.statLibelle}>{libelle}</Text>
    </View>
  );
}

function AnciensPostes({ emplois }: { emplois: { id: string; poste: string; entreprise: string; decrocheLe: string; termineLe?: string }[] }) {
  return (
    <View style={{ gap: espace.s }}>
      <SousTitre>Mes postes précédents</SousTitre>
      {emplois.map((e) => (
        <View key={e.id} style={styles.ancien}>
          <Text style={styles.valeur}>
            {e.poste} · {e.entreprise}
          </Text>
          <Text style={styles.libelle}>
            {dateLisible(e.decrocheLe)} → {e.termineLe ? dateLisible(e.termineLe) : 'aujourd’hui'}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  texte: { fontSize: 15, color: couleurs.brunDoux, lineHeight: 21, fontWeight: '600' },
  carte: {
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.l,
    borderWidth: 1,
    borderColor: couleurs.ligne,
    padding: espace.l,
    gap: espace.m,
  },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: espace.m },
  libelle: { fontSize: 12, fontWeight: '800', color: couleurs.brunDoux, textTransform: 'uppercase', letterSpacing: 0.5 },
  valeur: { fontSize: 16, fontWeight: '800', color: couleurs.brun, marginTop: 1 },
  modifier: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' },
  modifierTexte: { fontWeight: '800', color: couleurs.renardFonce },
  parallele: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.m,
    backgroundColor: couleurs.saugeClair,
    borderRadius: arrondis.l,
    padding: espace.m,
  },
  paralleleTexte: { flex: 1, fontWeight: '700', color: couleurs.brun, lineHeight: 20 },
  objectif: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espace.m,
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.m,
    borderWidth: 1,
    borderColor: couleurs.ligne,
    padding: espace.m,
  },
  objectifAtteint: { backgroundColor: couleurs.saugeClair, borderColor: 'transparent' },
  coche: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    borderColor: couleurs.ligne,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cocheFaite: { backgroundColor: couleurs.saugeFonce, borderColor: couleurs.saugeFonce },
  objectifTexte: { flex: 1, fontWeight: '700', color: couleurs.brun, fontSize: 15 },
  gain: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  gainTexte: { fontWeight: '800', fontSize: 12.5, color: '#9A6400' },
  saisie: { flexDirection: 'row', gap: espace.s },
  champ: {
    flex: 1,
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.m,
    borderWidth: 1.5,
    borderColor: couleurs.ligne,
    paddingHorizontal: espace.l,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
    color: couleurs.brun,
  },
  valider: {
    width: 48,
    borderRadius: arrondis.m,
    backgroundColor: couleurs.renardFonce,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: { flexDirection: 'row', gap: espace.s },
  stat: {
    flex: 1,
    backgroundColor: couleurs.carte,
    borderRadius: arrondis.m,
    borderWidth: 1,
    borderColor: couleurs.ligne,
    padding: espace.m,
    alignItems: 'center',
  },
  statValeur: { fontFamily: polices.titre, fontSize: 22, fontWeight: '800', color: couleurs.brun, fontVariant: ['tabular-nums'] },
  statLibelle: { fontSize: 11.5, fontWeight: '700', color: couleurs.brunDoux, textAlign: 'center' },
  ancien: { backgroundColor: couleurs.carte, borderRadius: arrondis.m, borderWidth: 1, borderColor: couleurs.ligne, padding: espace.m },
  note: { fontSize: 12.5, color: couleurs.brunDoux, textAlign: 'center' },
});
