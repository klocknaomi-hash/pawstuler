/** ONBOARDING 2/6 — Ce que l'utilisateur recherche (emploi + type de contrat, facultatif). */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Bouton, CarteChoix, Ecran, Pastille, SousTitre, Texte, Titre } from '@/components/base';
import { EnteteEtape } from '@/components/EnteteEtape';
import { couleurs, espace } from '@/config/theme';
import { useApp } from '@/store/etat';
import type { TypeContrat } from '@/store/types';

const CONTRATS: { id: TypeContrat; libelle: string }[] = [
  { id: 'cdi', libelle: 'CDI' },
  { id: 'cdd', libelle: 'CDD' },
  { id: 'stage', libelle: 'Stage' },
  { id: 'alternance', libelle: 'Alternance' },
  { id: 'freelance', libelle: 'Freelance' },
];

export default function Objectif() {
  const { etat, dispatch } = useApp();
  const [contrats, setContrats] = useState<TypeContrat[]>(etat.recherche.contrats);

  const basculer = (id: TypeContrat) =>
    setContrats((liste) => (liste.includes(id) ? liste.filter((c) => c !== id) : [...liste, id]));

  function continuer() {
    dispatch({ type: 'DEFINIR_CONTRATS', contrats });
    router.push('/animal');
  }

  return (
    <Ecran defilant bas={<Bouton titre="Continuer" onPress={continuer} />}>
      <EnteteEtape etape={2} />
      <Titre>Qu’est-ce que tu recherches ?</Titre>

      <CarteChoix choisi onPress={() => {}} libelle="Un emploi">
        <View style={styles.ligne}>
          <View style={styles.icone}>
            <Ionicons name="briefcase-outline" size={22} color={couleurs.renardFonce} />
          </View>
          <View style={{ flex: 1 }}>
            <SousTitre>Un emploi</SousTitre>
            <Text style={styles.detail}>On t’accompagne jusqu’à ton prochain poste.</Text>
          </View>
          <Ionicons name="checkmark-circle" size={24} color={couleurs.renardFonce} />
        </View>
      </CarteChoix>

      <View style={{ gap: espace.s, marginTop: espace.s }}>
        <SousTitre>Quel type de contrat ?</SousTitre>
        <Texte>Facultatif, plusieurs choix possibles. Ça nous aide à te proposer les bonnes tâches.</Texte>
      </View>
      <View style={styles.pastilles}>
        {CONTRATS.map((c) => (
          <Pastille key={c.id} libelle={c.libelle} choisi={contrats.includes(c.id)} onPress={() => basculer(c.id)} />
        ))}
      </View>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  ligne: { flexDirection: 'row', alignItems: 'center', gap: espace.m },
  icone: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: couleurs.carte,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detail: { color: couleurs.brunDoux, fontSize: 14, marginTop: 2 },
  pastilles: { flexDirection: 'row', flexWrap: 'wrap', gap: espace.s },
});
