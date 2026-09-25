/**
 * RÉGLAGES DE LA CONNEXION
 * Les clés ne sont jamais écrites dans le code : elles viennent du fichier `app/.env`
 * (voir `app/.env.exemple` et `docs/connexion-et-abonnement.md`).
 *
 * Tant que les clés Supabase ne sont pas renseignées, l'app reste en « mode démo » :
 * chaque connexion crée un compte local sur le téléphone, comme avant.
 */

export const CONFIG_AUTH = {
  /** Adresse du projet Supabase (Project Settings › API › Project URL). */
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  /** Clé publique du projet (Project Settings › API › anon / publishable key). Elle peut être dans l'app. */
  supabaseCle: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
};

/** Vrai quand les vraies connexions sont branchées (sinon : mode démo local). */
export const authReelle = () => Boolean(CONFIG_AUTH.supabaseUrl && CONFIG_AUTH.supabaseCle);
