/** Petits outils de dates, au format AAAA-MM-JJ (heure locale). */

export function jourDe(date: Date = new Date()): string {
  const a = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const j = String(date.getDate()).padStart(2, '0');
  return `${a}-${m}-${j}`;
}

export function joursEntre(debut: string, fin: string = jourDe()): number {
  const d1 = new Date(`${debut}T00:00:00`);
  const d2 = new Date(`${fin}T00:00:00`);
  return Math.round((d2.getTime() - d1.getTime()) / 86_400_000);
}

export function dateLisible(jour: string): string {
  return new Date(`${jour}T00:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export const nouvelId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
