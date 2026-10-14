/**
 * LE DÉCOR D'UNE AVENTURE
 * L'illustration sur laquelle se joue une aventure : le lieu de la ville où il est allé,
 * le lac (ou la fontaine) pour se reposer et se baigner, la campagne pour un appel ou une réponse.
 */
import { imageDecor, imageVille } from '@/illustrations/registre';
import { lieuDeMission } from '@/logique/missions';
import type { EtatApp, Mission } from '@/store/types';

export function decorDeMission(etat: EtatApp, m: Mission) {
  const ville = etat.villeId ?? 'clairebourg';
  if (m.type === 'repos' || m.type === 'baignade') return imageVille(ville, 'portrait');
  if (m.type === 'relance' || m.type === 'refus') return imageVille(ville, 'paysage');
  return imageDecor(ville, lieuDeMission(etat, m)?.decor);
}
