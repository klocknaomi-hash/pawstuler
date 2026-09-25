/** COMPTE › PROFIL — prénom, compagnon, ville et type de contrat recherché. */
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Champ, Ecran, Pastille, SousTitre } from '@/components/base';
import { Groupe, Ligne } from '@/components/Liste';
import { compagnonParId } from '@/config/compagnons';
import { couleurs, espace } from '@/config/theme';
import { villeParId } from '@/config/villes';
import { dateLisible } from '@/logique/dates';
import { useApp } from '@/store/etat';
import type { TypeContrat } from '@/store/types';

const CONTRATS: { id: TypeContrat; libelle: string }[] = [
  { id: 'cdi', libelle: 'CDI' },
  { id: 'cdd', libelle: 'CDD' },
  { id: 'stage', libelle: 'Stage' },
  { id: 'alternance', libelle: 'Alternance' },
  { id: 'freelance', libelle: 'Freelance' },
];

export default function Profil() {
  const { etat, dispatch } = useApp();
  const [prenom, setPrenom] = useState(etat.utilisateur?.prenom ?? '');
  const [nom, setNom] = useState(etat.compagnon?.nom ?? '');
  const contrats = etat.recherche.contrats;

  const basculer = (id: TypeContrat) =>
    dispatch({ type: 'DEFINIR_CONTRATS', contrats: contrats.includes(id) ? contrats.filter((c) => c !== id) : [...contrats, id] });

  return (
    <Ecran defilant avecEntete>
      <Champ
        label="Ton prénom"
        value={prenom}
        onChangeText={setPrenom}
        onBlur={() => prenom.trim() && dispatch({ type: 'DEFINIR_PRENOM', prenom: prenom.trim() })}
        autoCapitalize="words"
      />
      <Champ
        label="Prénom de ton compagnon"
        value={nom}
        onChangeText={setNom}
        onBlur={() => nom.trim() && dispatch({ type: 'NOMMER_COMPAGNON', nom: nom.trim() })}
        autoCapitalize="words"
        maxLength={16}
      />

      <Groupe>
        {etat.compagnon && (
          <Ligne premiere libelle="Animal" valeur={compagnonParId(etat.compagnon.espece).espece.replace(/^(le|la) /, '')} />
        )}
        {etat.compagnon && <Ligne libelle="Né le" valeur={dateLisible(etat.compagnon.neLe)} />}
        {etat.villeId && <Ligne libelle="Ville" valeur={villeParId(etat.villeId).nom} />}
        {etat.utilisateur?.email && <Ligne libelle="E-mail" valeur={etat.utilisateur.email} />}
        <Ligne
          libelle="Connexion"
          valeur={{ apple: 'Apple', google: 'Google', email: 'E-mail' }[etat.utilisateur?.fournisseur ?? 'email']}
        />
      </Groupe>

      <View style={{ gap: espace.s }}>
        <SousTitre>Contrat recherché</SousTitre>
        <Text style={styles.detail}>Sert à te proposer des tâches adaptées.</Text>
        <View style={styles.pastilles}>
          {CONTRATS.map((c) => (
            <Pastille key={c.id} libelle={c.libelle} choisi={contrats.includes(c.id)} onPress={() => basculer(c.id)} />
          ))}
        </View>
      </View>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  pastilles: { flexDirection: 'row', flexWrap: 'wrap', gap: espace.s },
  detail: { fontSize: 13.5, color: couleurs.brunDoux, fontWeight: '600' },
});
