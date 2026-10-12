/**
 * La barre d'onglets flotte au-dessus du contenu : les écrans à onglets laissent cette place
 * en bas (sinon la fin de la page passerait dessous).
 */
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { barreOnglets, espace } from '@/config/theme';

/** Hauteur de la barre flottante + sa marge + la zone de sécurité de l'iPhone. */
export function useBasBarre(): number {
  const { bottom } = useSafeAreaInsets();
  return barreOnglets.hauteur + Math.max(bottom, barreOnglets.marge);
}

/** Marge à mettre en bas des pages défilantes des onglets. */
export function useEspaceBarre(): number {
  return useBasBarre() + espace.xl;
}
