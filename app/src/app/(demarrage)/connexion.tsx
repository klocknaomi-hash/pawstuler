/**
 * CONNEXION
 * Apple, Google ou e-mail. Tout passe par src/services/auth :
 * connexion réelle (Supabase) si les clés sont configurées, sinon mode démo local.
 */
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Bouton, Champ, Ecran, Texte, Titre } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { couleurs, espace } from '@/config/theme';
import {
  authReelle,
  emailValide,
  ErreurConnexion,
  fournisseurDisponible,
  reinitialiserMotDePasse,
  seConnecter,
  type ModeConnexion,
} from '@/services/auth';
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
  const [info, setInfo] = useState('');
  // Création de compte, ou retour d'un utilisateur qui a déjà un compte
  const [modeEmail, setModeEmail] = useState<ModeConnexion>(mode === 'retour' ? 'retour' : 'creation');

  async function connecter(f: FournisseurAuth) {
    setErreur('');
    setInfo('');
    setEnCours(f);
    try {
      const utilisateur = await seConnecter(f, f === 'email' ? { email, motDePasse, mode: modeEmail } : undefined);
      dispatch({ type: 'CONNECTER', utilisateur });
      // Compte déjà configuré → accueil ; sinon on commence l'onboarding
      router.replace(etat.onboardingTermine ? '/accueil' : '/prenom');
    } catch (e) {
      if (e instanceof ErreurConnexion) {
        if (!e.annulee) setErreur(e.message);
      } else {
        setErreur('La connexion n’a pas abouti. Vérifie ta connexion internet et réessaie.');
      }
    } finally {
      setEnCours(null);
    }
  }

  async function motDePasseOublie() {
    setErreur('');
    if (!emailValide(email)) return setErreur('Saisis d’abord ton adresse e-mail.');
    try {
      await reinitialiserMotDePasse(email);
      setInfo('C’est envoyé ! Regarde tes e-mails pour choisir un nouveau mot de passe.');
    } catch (e) {
      setErreur(e instanceof ErreurConnexion ? e.message : 'L’envoi n’a pas abouti. Réessaie.');
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
              autoComplete={modeEmail === 'retour' ? 'current-password' : 'new-password'}
              textContentType={modeEmail === 'retour' ? 'password' : 'newPassword'}
            />
            <Bouton
              titre={modeEmail === 'retour' ? 'Me connecter' : 'Créer mon compte'}
              desactive={!emailPret}
              chargement={enCours === 'email'}
              onPress={() => connecter('email')}
            />
            <Bouton
              titre={modeEmail === 'retour' ? 'Pas encore de compte ? En créer un' : 'Déjà un compte ? Me connecter'}
              variante="texte"
              onPress={() => setModeEmail(modeEmail === 'retour' ? 'creation' : 'retour')}
            />
            {modeEmail === 'retour' && authReelle() && (
              <Bouton titre="Mot de passe oublié ?" variante="texte" onPress={motDePasseOublie} />
            )}
          </View>
        )}

        {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}
        {info ? <Text style={styles.info}>{info}</Text> : null}
      </View>

      {!authReelle() && <Text style={styles.note}>Version de test : ton compte reste sur ce téléphone pour l’instant.</Text>}
    </Ecran>
  );
}

const styles = StyleSheet.create({
  haut: { alignItems: 'center', gap: espace.s, paddingTop: espace.l, paddingBottom: espace.s },
  email: { gap: espace.m, paddingTop: espace.s },
  erreur: { color: couleurs.danger, fontWeight: '600', textAlign: 'center' },
  info: { color: couleurs.saugeFonce, fontWeight: '700', textAlign: 'center' },
  note: { fontSize: 12, color: couleurs.brunDoux, textAlign: 'center' },
});
