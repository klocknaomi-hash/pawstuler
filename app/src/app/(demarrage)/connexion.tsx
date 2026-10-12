/**
 * CONNEXION / INSCRIPTION
 * Décor de Clairebourg et mascotte en haut, feuille blanche en bas.
 * Apple, Google ou e-mail. Tout passe par src/services/auth :
 * connexion réelle (Supabase) si les clés sont configurées, sinon mode démo local.
 * Inscription par e-mail : œil pour voir le mot de passe, barre de solidité,
 * case des conditions d'utilisation et de la politique de confidentialité (obligatoire).
 */
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bouton, Champ, Texte, Titre } from '@/components/base';
import { EcranFeuille } from '@/components/EcranFeuille';
import { BarreSolidite, CaseConditions, ChampMotDePasse } from '@/components/Formulaire';
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
  const [conditions, setConditions] = useState(false);
  const [erreur, setErreur] = useState('');
  const [info, setInfo] = useState('');
  // Création de compte, ou retour d'un utilisateur qui a déjà un compte
  const [modeEmail, setModeEmail] = useState<ModeConnexion>(mode === 'retour' ? 'retour' : 'creation');
  const creation = modeEmail === 'creation';

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

  // Inscription : l'acceptation des conditions est obligatoire ; connexion : e-mail + mot de passe suffisent
  const emailPret = emailValide(email) && motDePasse.length >= 8 && (!creation || conditions);

  return (
    <EcranFeuille pose={creation ? 'salut' : 'content'}>
      <View style={styles.entete}>
        <Titre style={styles.titre}>{creation ? 'Crée ton compte' : 'Content de te revoir'}</Titre>
        <Texte style={styles.centre}>
          {creation ? 'Pour garder ton compagnon et ta progression, même sur un autre téléphone.' : 'Ton compagnon t’attend 🐾'}
        </Texte>
      </View>

      {!avecEmail ? (
        <View style={{ gap: espace.m }}>
          {fournisseurDisponible('apple') && (
            <Bouton
              titre="Continuer avec Apple"
              variante="noir"
              chargement={enCours === 'apple'}
              onPress={() => connecter('apple')}
              icone={<Ionicons name="logo-apple" size={19} color={couleurs.blanc} />}
            />
          )}
          <Bouton
            titre="Continuer avec Google"
            variante="blanc"
            chargement={enCours === 'google'}
            onPress={() => connecter('google')}
            icone={<Ionicons name="logo-google" size={17} color={couleurs.brun} />}
          />
          <Bouton
            titre="Continuer avec un e-mail"
            variante="blanc"
            onPress={() => setAvecEmail(true)}
            icone={<Ionicons name="mail-outline" size={18} color={couleurs.brun} />}
          />
          {creation && (
            <Text style={styles.mention}>
              En continuant, tu acceptes nos{' '}
              <Text style={styles.lien} onPress={() => router.push('/legal/conditions')}>
                conditions d’utilisation
              </Text>{' '}
              et notre{' '}
              <Text style={styles.lien} onPress={() => router.push('/legal/confidentialite')}>
                politique de confidentialité
              </Text>
              .
            </Text>
          )}
        </View>
      ) : (
        <View style={{ gap: espace.m }}>
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
          <ChampMotDePasse
            label="Mot de passe"
            value={motDePasse}
            onChangeText={setMotDePasse}
            placeholder="8 caractères minimum"
            autoComplete={creation ? 'new-password' : 'current-password'}
            textContentType={creation ? 'newPassword' : 'password'}
          />
          {creation && <BarreSolidite motDePasse={motDePasse} />}
          {creation && <CaseConditions coche={conditions} onChange={setConditions} />}
          <Bouton
            titre={creation ? 'Créer mon compte' : 'Me connecter'}
            desactive={!emailPret}
            chargement={enCours === 'email'}
            onPress={() => connecter('email')}
          />
          {!creation && authReelle() && <Bouton titre="Mot de passe oublié ?" variante="texte" onPress={motDePasseOublie} />}
          <Pressable onPress={() => setAvecEmail(false)} accessibilityRole="button" style={styles.autres}>
            <Ionicons name="chevron-back" size={15} color={couleurs.brunDoux} />
            <Text style={styles.autresTexte}>Autres façons de continuer</Text>
          </Pressable>
        </View>
      )}

      {erreur ? <Text style={styles.erreur}>{erreur}</Text> : null}
      {info ? <Text style={styles.info}>{info}</Text> : null}

      {/* Passer de l'inscription à la connexion (et inversement) */}
      <Text style={styles.bascule}>
        {creation ? 'Déjà un compte ? ' : 'Pas encore de compte ? '}
        <Text
          style={styles.lien}
          accessibilityRole="button"
          onPress={() => {
            setErreur('');
            setModeEmail(creation ? 'retour' : 'creation');
          }}>
          {creation ? 'Me connecter' : 'Créer un compte'}
        </Text>
      </Text>

      {!authReelle() && <Text style={styles.note}>Version de test : ton compte reste sur ce téléphone pour l’instant.</Text>}
    </EcranFeuille>
  );
}

const styles = StyleSheet.create({
  entete: { gap: espace.xs, marginBottom: espace.xs },
  titre: { textAlign: 'center' },
  centre: { textAlign: 'center' },
  mention: { fontSize: 12.5, lineHeight: 18, color: couleurs.brunDoux, textAlign: 'center', fontWeight: '600' },
  lien: { color: couleurs.renardFonce, fontWeight: '800' },
  autres: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: espace.xs },
  autresTexte: { fontSize: 14, fontWeight: '700', color: couleurs.brunDoux },
  bascule: { fontSize: 14.5, color: couleurs.brunDoux, textAlign: 'center', fontWeight: '600', marginTop: espace.s },
  erreur: { color: couleurs.danger, fontWeight: '600', textAlign: 'center' },
  info: { color: couleurs.saugeFonce, fontWeight: '700', textAlign: 'center' },
  note: { fontSize: 12, color: couleurs.brunDoux, textAlign: 'center' },
});
