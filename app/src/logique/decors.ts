/**
 * LE DÉCOR D'UNE AVENTURE
 * L'illustration sur laquelle se joue une aventure : le lieu de la ville où il est allé,
 * sa chambre pour se reposer, la nature pour se baigner, la vue de la ville pour un appel ou une réponse.
 */
import { imageDecor, imageVille } from '@/illustrations/registre';
import { lieuDeMission } from '@/logique/missions';
import type { EtatApp, Mission } from '@/store/types';

export function decorDeMission(etat: EtatApp, m: Mission) {
  const ville = etat.villeId ?? 'clairebourg';
  // Se reposer : dans sa chambre ; se baigner : dans la nature (le dernier paysage du chemin)
  if (m.type === 'repos') return imageVille(ville, 'chambre');
  if (m.type === 'baignade') return imageDecor(ville, 'chemin-4');
  if (m.type === 'relance' || m.type === 'refus') return imageVille(ville, 'ville');
  return imageDecor(ville, lieuDeMission(etat, m)?.decor);
}
