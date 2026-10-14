/**
 * PREMIER ÉCRAN DE L'APP : CRÉER UN COMPTE OU SE CONNECTER
 * Plus d'écran de présentation : l'App Store présente le concept, l'app s'ouvre directement ici.
 * Direction artistique (références Yuppo et Finch) : un dégradé pêche très doux, Ziggy en grand
 * qui fait coucou, une phrase d'accueil, puis une carte blanche avec deux onglets :
 *  - « Créer un compte » (par défaut) : Apple, Google ou e-mail (œil, solidité du mot de passe,
 *    case obligatoire des conditions d'utilisation et de la politique de confidentialité) ;
 *  - « Se connecter » : Apple, Google ou e-mail + mot de passe oublié.
 * Tout passe par src/services/auth : connexion réelle (Supabase) si les clés sont configurées,
 * sinon mode démo local.
 */
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bouton, Champ } from '@/components/base';
import { Compagnon } from '@/components/Compagnon';
import { BarreSolidite, CaseConditions, ChampMotDePasse } from '@/components/Formulaire';
import { couleurs, espace, ombre, polices } from '@/config/theme';
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
  const { top, bottom } = useSafeAreaInsets();
  const [enCours, setEnCours] = useState<FournisseurAuth | null>(null);
  const [avecEmail, setAvecEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [conditions, setConditions] = useState(false);
  const [erreur, setErreur] = useState('');
  const [info, setInfo] = useState('');
  // Onglet choisi : création de compte (par défaut) ou connexion d'un compte existant
  const [modeEmail, setModeEmail] = useState<ModeConnexion>(mode === 'retour' ? 'retour' : 'creation');
  const creation = modeEmail === 'creation';

  function changerOnglet(m: ModeConnexion) {
    setModeEmail(m);
    setErreur('');
    setInfo('');
  }

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
    <View style={styles.ecran}>
      {/* Fond : dégradé pêche très doux, avec deux grandes bulles claires */}
      <LinearGradient colors={['#FFD8C2', '#FFEBDD', couleurs.creme]} locations={[0, 0.45, 0.85]} style={StyleSheet.absoluteFill} />
      <View style={[styles.bulle, styles.bulleGauche]} />
      <View style={[styles.bulle, styles.bulleDroite]} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.contenu, { paddingTop: top + espace.l, paddingBottom: Math.max(bottom, espace.l) + espace.m }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Accueil : Ziggy et sa phrase */}
          <View style={styles.haut}>
            <View style={styles.marque}>
              <Ionicons name="paw" size={13} color={couleurs.renardFonce} />
              <Text style={styles.marqueTexte}>Pawstuler</Text>
            </View>
            <Text style={styles.titre}>{creation ? 'Salut, moi c’est Ziggy !' : 'Content de te revoir !'}</Text>
            <Text style={styles.sousTitre}>
              {creation ? 'On cherche ton job ensemble,\nune petite étape à la fois.' : 'Ton compagnon t’attend dans sa ville 🐾'}
            </Text>
            <View style={styles.scene}>
              <Text style={[styles.etincelle, { left: '18%', top: 18 }]}>✨</Text>
              <Text style={[styles.etincelle, { right: '16%', top: 46, fontSize: 16 }]}>🐾</Text>
              <Compagnon espece="renard" pose={creation ? 'salut' : 'content'} taille={avecEmail ? 130 : 180} />
            </View>
          </View>

          {/* La carte : onglets puis les façons de continuer */}
          <View style={styles.carte}>
            <View style={styles.onglets} accessibilityRole="tablist">
              <Onglet libelle="Créer un compte" actif={creation} onPress={() => changerOnglet('creation')} />
              <Onglet libelle="Se connecter" actif={!creation} onPress={() => changerOnglet('retour')} />
            </View>

            {!avecEmail ? (
              <View style={{ gap: espace.s }}>
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
                <View style={styles.ou}>
                  <View style={styles.trait} />
                  <Text style={styles.ouTexte}>ou</Text>
                  <View style={styles.trait} />
                </View>
                <Bouton
                  titre={creation ? 'S’inscrire avec un e-mail' : 'Se connecter avec un e-mail'}
                  variante="secondaire"
                  onPress={() => setAvecEmail(true)}
                  icone={<Ionicons name="mail-outline" size={18} color={couleurs.renardFonce} />}
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
          </View>

          {!authReelle() && <Text style={styles.note}>Version de test : ton compte reste sur ce téléphone pour l’instant.</Text>}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/** Un onglet du sélecteur « Créer un compte / Se connecter ». */
function Onglet({ libelle, actif, onPress }: { libelle: string; actif: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: actif }} aria-selected={actif} style={[styles.onglet, actif && styles.ongletActif]}>
      <Text style={[styles.ongletTexte, actif && styles.ongletTexteActif]}>{libelle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.creme },
  bulle: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.35)' },
  bulleGauche: { width: 260, height: 260, top: -90, left: -110 },
  bulleDroite: { width: 200, height: 200, top: 150, right: -90 },
  contenu: { flexGrow: 1, paddingHorizontal: espace.xl, gap: espace.l },
  haut: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: espace.xs },
  marque: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: espace.m,
  },
  marqueTexte: { fontFamily: polices.titre, fontSize: 13, fontWeight: '800', color: couleurs.renardFonce, letterSpacing: 0.6 },
  titre: { fontFamily: polices.titre, fontSize: 28, fontWeight: '800', color: couleurs.renardFonce, textAlign: 'center' },
  sousTitre: { fontSize: 15.5, fontWeight: '600', color: couleurs.brunDoux, textAlign: 'center', lineHeight: 21 },
  scene: { alignItems: 'center', justifyContent: 'flex-end', marginTop: espace.s, alignSelf: 'stretch' },
  etincelle: { position: 'absolute', fontSize: 20 },
  carte: {
    backgroundColor: couleurs.carte,
    borderRadius: 28,
    padding: espace.l,
    gap: espace.m,
    ...ombre,
  },
  onglets: { flexDirection: 'row', backgroundColor: couleurs.creme, borderRadius: 999, padding: 4 },
  onglet: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 999 },
  ongletActif: { backgroundColor: couleurs.carte, ...ombre, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  ongletTexte: { fontSize: 14, fontWeight: '700', color: couleurs.brunDoux },
  ongletTexteActif: { color: couleurs.brun, fontWeight: '800' },
  ou: { flexDirection: 'row', alignItems: 'center', gap: espace.s, marginVertical: 2 },
  trait: { flex: 1, height: 1, backgroundColor: couleurs.ligne },
  ouTexte: { fontSize: 12.5, fontWeight: '700', color: couleurs.brunDoux },
  mention: { fontSize: 12, lineHeight: 17, color: couleurs.brunDoux, textAlign: 'center', fontWeight: '600', marginTop: 2 },
  lien: { color: couleurs.renardFonce, fontWeight: '800' },
  autres: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: espace.xs },
  autresTexte: { fontSize: 14, fontWeight: '700', color: couleurs.brunDoux },
  erreur: { color: couleurs.danger, fontWeight: '600', textAlign: 'center' },
  info: { color: couleurs.saugeFonce, fontWeight: '700', textAlign: 'center' },
  note: { fontSize: 12, color: couleurs.brunDoux, textAlign: 'center' },
});
