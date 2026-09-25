/**
 * 🎉 J'AI DÉCROCHÉ ! — un nouveau chapitre commence
 * 1. La célébration (le compagnon décroche lui aussi un poste dans sa ville).
 * 2. Quelques infos sur le nouveau poste, et le choix pour les candidatures :
 *    les garder telles quelles ou les ranger dans l'historique. Rien n'est supprimé.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Bouton, CarteChoix, Champ, Ecran, SousTitre, Texte, Titre } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { Confettis } from '@/components/Confettis';
import { couleurs, espace } from '@/config/theme';
import { lieuEmbauche } from '@/logique/compagnon';
import { lireDateFr } from '@/logique/dates';
import { useApp } from '@/store/etat';

export default function Decroche() {
  const { candidatureId } = useLocalSearchParams<{ candidatureId?: string }>();
  const { etat, dispatch } = useApp();
  const origine = etat.candidatures.find((c) => c.id === candidatureId);

  const [etape, setEtape] = useState<'fete' | 'infos'>('fete');
  const [entreprise, setEntreprise] = useState(origine?.entreprise ?? '');
  const [poste, setPoste] = useState(origine?.poste ?? '');
  const [premierJour, setPremierJour] = useState('');
  const [archiver, setArchiver] = useState(false);
  const [erreur, setErreur] = useState('');

  const nom = etat.compagnon?.nom ?? 'Ton compagnon';
  const lieu = lieuEmbauche(etat);

  function commencer() {
    const date = premierJour.trim() ? lireDateFr(premierJour) : undefined;
    if (premierJour.trim() && !date) return setErreur('Date non reconnue. Exemple : 06/10 ou 06/10/2026.');
    dispatch({
      type: 'DECROCHER',
      emploi: { entreprise: entreprise.trim(), poste: poste.trim(), premierJour: date, candidatureId: origine?.id },
      archiverCandidatures: archiver,
    });
    router.dismissTo('/accueil');
    router.push('/aventure-pro');
  }

  if (etape === 'fete') {
    return (
      <Ecran fond={couleurs.corailClair} style={styles.fete} bas={<Bouton titre="Commencer mon nouveau chapitre" variante="victoire" onPress={() => setEtape('infos')} />}>
        <Confettis />
        <Compagnon espece={etat.compagnon?.espece ?? 'renard'} pose="celebration" taille={210} reaction={1} />
        <Titre style={{ textAlign: 'center' }}>Félicitations {etat.utilisateur?.prenom} !</Titre>
        <Texte style={{ textAlign: 'center', color: couleurs.brun }}>
          Tu as décroché ton poste. Et {nom} aussi : il commence comme {lieu?.metier?.toLowerCase() ?? 'nouveau venu'}
          {lieu ? ` à ${lieu.nom}` : ''}. Vous l’avez fait, ensemble.
        </Texte>
        <Text style={styles.bonus}>+50 pièces pour fêter ça 🪙</Text>
      </Ecran>
    );
  }

  const pret = entreprise.trim().length > 0 && poste.trim().length > 0;

  return (
    <Ecran defilant bas={<Bouton titre="C’est parti !" desactive={!pret} onPress={commencer} />}>
      <Titre>Ton nouveau poste</Titre>
      <Champ label="Entreprise" value={entreprise} onChangeText={setEntreprise} placeholder="Ex. Studio Ardoise" />
      <Champ label="Poste" value={poste} onChangeText={setPoste} placeholder="Ex. Chargé·e de communication" />
      <View style={{ gap: 4 }}>
        <Champ
          label="Premier jour (facultatif)"
          value={premierJour}
          onChangeText={setPremierJour}
          placeholder="Ex. 06/10"
          keyboardType="numbers-and-punctuation"
        />
        {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}
      </View>

      <View style={{ gap: espace.s }}>
        <SousTitre>Et tes candidatures ?</SousTitre>
        <Texte>Elles restent toujours consultables. Tu choisis seulement où les ranger.</Texte>
        <CarteChoix choisi={!archiver} onPress={() => setArchiver(false)} libelle="Les garder telles quelles">
          <Text style={styles.choixTitre}>Les garder telles quelles</Text>
          <Text style={styles.choixSous}>Elles restent visibles comme aujourd’hui.</Text>
        </CarteChoix>
        <CarteChoix choisi={archiver} onPress={() => setArchiver(true)} libelle="Les ranger dans l’historique">
          <Text style={styles.choixTitre}>Les ranger dans l’historique</Text>
          <Text style={styles.choixSous}>Elles sont archivées, jamais supprimées.</Text>
        </CarteChoix>
      </View>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  fete: { alignItems: 'center', justifyContent: 'center' },
  bonus: { fontWeight: '800', color: '#9A6400', fontSize: 15 },
  erreur: { color: couleurs.danger, fontWeight: '600', fontSize: 13 },
  choixTitre: { fontWeight: '800', color: couleurs.brun, fontSize: 15.5 },
  choixSous: { fontWeight: '600', color: couleurs.brunDoux, fontSize: 13.5, marginTop: 2 },
});
