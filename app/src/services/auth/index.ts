/**
 * AUTHENTIFICATION
 * L'écran de connexion appelle seulement `seConnecter(fournisseur)`.
 * Aujourd'hui, chaque fournisseur est un « bouchon » : il crée un compte local sur le téléphone,
 * pour ne pas bloquer le développement.
 *
 * Pour brancher les vrais systèmes plus tard, il suffira de remplacer le contenu de chaque bouchon :
 *  - Apple  : expo-apple-authentication (signInAsync) → vérification du jeton côté serveur
 *  - Google : expo-auth-session / Google Sign-In → vérification du jeton côté serveur
 *  - E-mail : service d'authentification choisi (Supabase, Firebase…)
 * Les écrans, eux, ne changeront pas.
 */
import { Platform } from 'react-native';

import { nouvelId } from '@/logique/dates';
import type { FournisseurAuth, Utilisateur } from '@/store/types';

export type ResultatConnexion = Omit<Utilisateur, 'prenom'>;

export type Identifiants = { email: string; motDePasse: string };

interface Fournisseur {
  disponible: () => boolean;
  connecter: (identifiants?: Identifiants) => Promise<ResultatConnexion>;
}

const bouchon = (fournisseur: FournisseurAuth): Fournisseur['connecter'] => async (identifiants) => {
  // TODO(auth) : remplacer par la vraie connexion.
  await new Promise((r) => setTimeout(r, 300));
  return { id: `local-${nouvelId()}`, fournisseur, email: identifiants?.email };
};

const FOURNISSEURS: Record<FournisseurAuth, Fournisseur> = {
  apple: { disponible: () => Platform.OS === 'ios' || Platform.OS === 'web', connecter: bouchon('apple') },
  google: { disponible: () => true, connecter: bouchon('google') },
  email: { disponible: () => true, connecter: bouchon('email') },
};

export const fournisseurDisponible = (f: FournisseurAuth) => FOURNISSEURS[f].disponible();

export function seConnecter(f: FournisseurAuth, identifiants?: Identifiants): Promise<ResultatConnexion> {
  return FOURNISSEURS[f].connecter(identifiants);
}

/** Vérification simple d'une adresse e-mail avant l'envoi. */
export const emailValide = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
