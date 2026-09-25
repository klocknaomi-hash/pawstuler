/**
 * LE RYTHME DU COMPAGNON
 * L'utilisateur choisit à quelle heure son compagnon se réveille et s'endort.
 * En dehors de ces heures, le compagnon dort (pose « dort »), mais on peut toujours
 * cocher ses tâches : il les découvrira au réveil. Il n'est jamais triste ni puni.
 */

export type Rythme = { reveil: number; coucher: number };

export function estEndormi(rythme: Rythme, date: Date = new Date()): boolean {
  const h = date.getHours();
  const { reveil, coucher } = rythme;
  if (reveil === coucher) return false;
  if (reveil < coucher) return h < reveil || h >= coucher;
  // Coucher après minuit (ex. réveil 9 h, coucher 1 h)
  return h >= coucher && h < reveil;
}

export const heureLisible = (h: number) => `${h % 24} h`;

export const HEURES_REVEIL = [6, 7, 8, 9, 10];
export const HEURES_COUCHER = [21, 22, 23, 0];
