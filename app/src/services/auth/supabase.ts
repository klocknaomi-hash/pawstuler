/**
 * CLIENT SUPABASE
 * Supabase gère les comptes (Apple, Google, e-mail) et, plus tard, la sauvegarde en ligne.
 * La session est gardée sur le téléphone (AsyncStorage) et renouvelée automatiquement.
 */
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { CONFIG_AUTH, authReelle } from './config';

let client: SupabaseClient | null = null;

/** Le client Supabase, créé au premier besoin (null en mode démo). */
export function supabase(): SupabaseClient | null {
  if (!authReelle()) return null;
  if (!client) {
    client = createClient(CONFIG_AUTH.supabaseUrl, CONFIG_AUTH.supabaseCle, {
      auth: {
        storage: Platform.OS === 'web' ? undefined : AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
    });
    // La session n'est rafraîchie que lorsque l'app est ouverte (recommandation Supabase)
    AppState.addEventListener('change', (statut) => {
      if (statut === 'active') client?.auth.startAutoRefresh();
      else client?.auth.stopAutoRefresh();
    });
  }
  return client;
}
