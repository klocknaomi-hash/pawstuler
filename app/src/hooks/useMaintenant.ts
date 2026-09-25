/** L'heure actuelle, remise à jour régulièrement (pour les comptes à rebours affichés). */
import { useEffect, useState } from 'react';

export function useMaintenant(intervalle = 30_000): number {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    const minuterie = setInterval(() => setMaintenant(Date.now()), intervalle);
    return () => clearInterval(minuterie);
  }, [intervalle]);
  return maintenant;
}
