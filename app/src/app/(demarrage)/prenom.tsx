/** ONBOARDING 1/7 — Le prénom de l'utilisateur. */
import { router } from 'expo-router';
import { useState } from 'react';

import { Bouton, Champ, Ecran, Texte, Titre } from '@/components/base';
import { EnteteEtape } from '@/components/EnteteEtape';
import { useApp } from '@/store/etat';

export default function Prenom() {
  const { etat, dispatch } = useApp();
  const [prenom, setPrenom] = useState(etat.utilisateur?.prenom ?? '');
  const pret = prenom.trim().length > 0;

  function continuer() {
    dispatch({ type: 'DEFINIR_PRENOM', prenom: prenom.trim() });
    router.push('/objectif');
  }

  return (
    <Ecran bas={<Bouton titre="Continuer" desactive={!pret} onPress={continuer} />}>
      <EnteteEtape etape={1} retour={false} />
      <Titre>Comment tu t’appelles ?</Titre>
      <Texte>Ton compagnon aimerait savoir comment t’appeler.</Texte>
      <Champ
        value={prenom}
        onChangeText={setPrenom}
        placeholder="Saisis ton prénom"
        autoFocus
        autoCapitalize="words"
        autoComplete="given-name"
        textContentType="givenName"
        returnKeyType="next"
        maxLength={30}
        onSubmitEditing={() => pret && continuer()}
        accessibilityLabel="Ton prénom"
      />
    </Ecran>
  );
}
