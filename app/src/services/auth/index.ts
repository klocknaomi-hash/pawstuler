/**
 * AUTHENTIFICATION
 * L'écran de connexion appelle seulement `seConnecter(fournisseur)` : il ne sait pas
 * quel service tourne derrière.
 *
 * Deux modes :
 *  - **Réel** (clés Supabase renseignées dans app/.env) :
 *      Apple  → fenêtre Apple native (expo-apple-authentication) puis vérification par Supabase ;
 *      Google → page de connexion Google sécurisée (navigateur intégré) puis retour dans l'app ;
 *      E-mail → création de compte / connexion par mot de passe chez Supabase.
 *  - **Démo** (pas de clés) : chaque méthode crée un compte local sur le téléphone, comme avant.
 *
 * Ce qu'il faut configurer de son côté : docs/connexion-et-abonnement.md.
 */
import * as AppleAuthentication from 'expo-apple-authentication';
import { makeRedirectUri } from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { nouvelId } from '@/logique/dates';
import type { FournisseurAuth, Utilisateur } from '@/store/types';

import { authReelle } from './config';
import { supabase } from './supabase';

export { authReelle } from './config';

WebBrowser.maybeCompleteAuthSession();

export type ResultatConnexion = Omit<Utilisateur, 'prenom'>;

/** « creation » : nouveau compte ; « retour » : compte existant (sert à l'e-mail). */
export type ModeConnexion = 'creation' | 'retour';

export type Identifiants = { email: string; motDePasse: string; mode: ModeConnexion };

/** Erreur à montrer telle quelle à l'utilisateur (message déjà en français). */
export class ErreurConnexion extends Error {
  /** Vrai si l'utilisateur a simplement fermé la fenêtre : on n'affiche rien. */
  annulee: boolean;
  constructor(message: string, annulee = false) {
    super(message);
    this.annulee = annulee;
  }
}

const ANNULEE = () => new ErreurConnexion('', true);

/** Traduit les messages de Supabase en phrases simples. */
function traduire(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-mail ou mot de passe incorrect.';
  if (m.includes('already registered')) return 'Un compte existe déjà avec cet e-mail. Connecte-toi plutôt.';
  if (m.includes('email not confirmed')) return 'Confirme d’abord ton adresse e-mail : regarde tes messages.';
  if (m.includes('password')) return 'Ton mot de passe doit contenir au moins 8 caractères.';
  if (m.includes('rate limit')) return 'Trop de tentatives. Réessaie dans quelques minutes.';
  if (m.includes('network') || m.includes('fetch')) return 'Pas de connexion internet. Vérifie ton réseau et réessaie.';
  return 'La connexion n’a pas abouti. Réessaie dans un instant.';
}

function client() {
  const sb = supabase();
  if (!sb) throw new ErreurConnexion('La connexion n’est pas encore configurée.');
  return sb;
}

/* ---------- Mode réel ---------- */

async function connecterApple(): Promise<ResultatConnexion> {
  // Le « nonce » empêche qu'un jeton Apple volé soit réutilisé : Apple reçoit sa version chiffrée,
  // Supabase la version d'origine, et vérifie que les deux correspondent.
  const nonce = Crypto.randomUUID();
  const nonceChiffre = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);
  let identite: AppleAuthentication.AppleAuthenticationCredential;
  try {
    identite = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
      nonce: nonceChiffre,
    });
  } catch (e) {
    if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') throw ANNULEE();
    throw new ErreurConnexion('La connexion avec Apple n’a pas abouti.');
  }
  if (!identite.identityToken) throw new ErreurConnexion('Apple n’a pas renvoyé d’identité. Réessaie.');
  const { data, error } = await client().auth.signInWithIdToken({ provider: 'apple', token: identite.identityToken, nonce });
  if (error || !data.user) throw new ErreurConnexion(traduire(error?.message ?? ''));
  return { id: data.user.id, fournisseur: 'apple', email: data.user.email };
}

async function connecterGoogle(): Promise<ResultatConnexion> {
  const sb = client();
  // Adresse de retour : pawstuler://connexion dans l'app installée, exp://… dans Expo Go
  const retour = makeRedirectUri({ scheme: 'pawstuler', path: 'connexion' });
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: retour, skipBrowserRedirect: true },
  });
  if (error || !data.url) throw new ErreurConnexion(traduire(error?.message ?? ''));
  const resultat = await WebBrowser.openAuthSessionAsync(data.url, retour);
  if (resultat.type !== 'success') throw ANNULEE();
  const code = new URL(resultat.url).searchParams.get('code');
  if (!code) throw new ErreurConnexion('La connexion avec Google n’a pas abouti.');
  const session = await sb.auth.exchangeCodeForSession(code);
  if (session.error || !session.data.user) throw new ErreurConnexion(traduire(session.error?.message ?? ''));
  return { id: session.data.user.id, fournisseur: 'google', email: session.data.user.email };
}

async function connecterEmail(identifiants?: Identifiants): Promise<ResultatConnexion> {
  if (!identifiants) throw new ErreurConnexion('Saisis ton e-mail et ton mot de passe.');
  const sb = client();
  const email = identifiants.email.trim().toLowerCase();
  if (identifiants.mode === 'creation') {
    const { data, error } = await sb.auth.signUp({ email, password: identifiants.motDePasse });
    if (error) throw new ErreurConnexion(traduire(error.message));
    // Si la confirmation par e-mail est activée dans Supabase, il n'y a pas encore de session
    if (!data.session || !data.user)
      throw new ErreurConnexion('Presque fini ! Clique sur le lien reçu par e-mail, puis reviens te connecter.');
    return { id: data.user.id, fournisseur: 'email', email };
  }
  const { data, error } = await sb.auth.signInWithPassword({ email, password: identifiants.motDePasse });
  if (error || !data.user) throw new ErreurConnexion(traduire(error?.message ?? ''));
  return { id: data.user.id, fournisseur: 'email', email };
}

/* ---------- Mode démo (compte local) ---------- */

const demo = (fournisseur: FournisseurAuth) => async (identifiants?: Identifiants): Promise<ResultatConnexion> => {
  await new Promise((r) => setTimeout(r, 300));
  return { id: `local-${nouvelId()}`, fournisseur, email: identifiants?.email.trim().toLowerCase() };
};

/* ---------- Ce qu'utilisent les écrans ---------- */

const REEL: Record<FournisseurAuth, (i?: Identifiants) => Promise<ResultatConnexion>> = {
  apple: connecterApple,
  google: connecterGoogle,
  email: connecterEmail,
};

/** Apple n'est proposé que sur iPhone (et sur le web en mode démo, pour les tests). */
export function fournisseurDisponible(f: FournisseurAuth): boolean {
  if (f !== 'apple') return true;
  return Platform.OS === 'ios' || (!authReelle() && Platform.OS === 'web');
}

export function seConnecter(f: FournisseurAuth, identifiants?: Identifiants): Promise<ResultatConnexion> {
  return authReelle() ? REEL[f](identifiants) : demo(f)(identifiants);
}

/** Envoie un e-mail pour choisir un nouveau mot de passe. */
export async function reinitialiserMotDePasse(email: string): Promise<void> {
  if (!authReelle()) return;
  const { error } = await client().auth.resetPasswordForEmail(email.trim().toLowerCase());
  if (error) throw new ErreurConnexion(traduire(error.message));
}

/** Ferme la session chez Supabase (sans effet en mode démo). */
export async function fermerSession(): Promise<void> {
  await supabase()?.auth.signOut();
}

/**
 * Supprime le compte en ligne. Supabase interdit de le faire depuis l'app elle-même :
 * on appelle une petite fonction serveur « supprimer-compte » (code fourni dans
 * docs/connexion-et-abonnement.md).
 */
export async function supprimerCompteEnLigne(): Promise<void> {
  const sb = supabase();
  if (!sb) return;
  const { error } = await sb.functions.invoke('supprimer-compte', { method: 'POST' });
  if (error) throw new ErreurConnexion('La suppression en ligne n’a pas abouti. Réessaie avec une connexion internet.');
  await sb.auth.signOut();
}

/** Vérification simple d'une adresse e-mail avant l'envoi. */
export const emailValide = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
