/**
 * CONNEXION
 * Apple, Google ou e-mail. Les vrais services seront branchés dans src/services/auth.
 */
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Bouton, Champ, Ecran, Texte, Titre } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { couleurs, espace } from '@/config/theme';
import { emailValide, fournisseurDisponible, seConnecter } from '@/services/auth';
import { useApp } from '@/store/etat';
import type { FournisseurAuth } from '@/store/types';

export default function Connexion() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { etat, dispatch } = useApp();
  const [enCours, setEnCours] = useState<FournisseurAuth | null>(null);
  const [avecEmail, setAvecEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');

  async function connecter(f: FournisseurAuth) {
    setErreur('');
    setEnCours(f);
    try {
      const utilisateur = await seConnecter(f, f === 'email' ? { email, motDePasse } : undefined);
      dispatch({ type: 'CONNECTER', utilisateur });
      // Compte déjà configuré → accueil ; sinon on commence l'onboarding
      router.replace(etat.onboardingTermine ? '/accueil' : '/prenom');
    } catch {
      setErreur('La connexion n’a pas abouti. Vérifie ta connexion internet et réessaie.');
    } finally {
      setEnCours(null);
    }
  }

  const emailPret = emailValide(email) && motDePasse.length >= 8;

  return (
    <Ecran defilant>
      <View style={styles.haut}>
        <Compagnon espece="renard" pose="content" taille={130} />
        <Titre style={{ textAlign: 'center' }}>{mode === 'retour' ? 'Content de te revoir' : 'Crée ton compte'}</Titre>
        <Texte style={{ textAlign: 'center' }}>
          Pour garder ta progression et ton compagnon, même si tu changes de téléphone.
        </Texte>
      </View>

      <View style={{ gap: espace.m }}>
        {fournisseurDisponible('apple') && (
          <Bouton
            titre="Continuer avec Apple"
            variante="noir"
            chargement={enCours === 'apple'}
            onPress={() => connecter('apple')}
            icone={<Ionicons name="logo-apple" size={20} color={couleurs.blanc} />}
          />
        )}
        <Bouton
          titre="Continuer avec Google"
          variante="blanc"
          chargement={enCours === 'google'}
          onPress={() => connecter('google')}
          icone={<Ionicons name="logo-google" size={18} color={couleurs.brun} />}
        />

        {!avecEmail ? (
          <Bouton titre="Continuer avec un e-mail" variante="texte" onPress={() => setAvecEmail(true)} />
        ) : (
          <View style={styles.email}>
            <Champ
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="toi@exemple.fr"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />
            <Champ
              label="Mot de passe"
              value={motDePasse}
              onChangeText={setMotDePasse}
              placeholder="8 caractères minimum"
              secureTextEntry
              autoComplete={mode === 'retour' ? 'current-password' : 'new-password'}
              textContentType={mode === 'retour' ? 'password' : 'newPassword'}
            />
            <Bouton
              titre={mode === 'retour' ? 'Me connecter' : 'Créer mon compte'}
              desactive={!emailPret}
              chargement={enCours === 'email'}
              onPress={() => connecter('email')}
            />
          </View>
        )}

        {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}
      </View>

      <Text style={styles.note}>Version de test : ton compte reste sur ce téléphone pour l’instant.</Text>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  haut: { alignItems: 'center', gap: espace.s, paddingTop: espace.l, paddingBottom: espace.s },
  email: { gap: espace.m, paddingTop: espace.s },
  erreur: { color: couleurs.danger, fontWeight: '600', textAlign: 'center' },
  note: { fontSize: 12, color: couleurs.brunDoux, textAlign: 'center' },
});
