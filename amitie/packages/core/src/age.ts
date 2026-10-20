import { REGLES } from './regles';

/**
 * Âge en années pleines à une date donnée.
 * Les dates sont des chaînes « AAAA-MM-JJ » : on évite les objets Date
 * pour ne pas dépendre du fuseau horaire du téléphone.
 */
export function calculerAge(dateNaissance: string, aujourdHui: string): number {
  const [an, mois, jour] = lireDate(dateNaissance);
  const [anJ, moisJ, jourJ] = lireDate(aujourdHui);
  let age = anJ - an;
  // Anniversaire pas encore passé cette année
  if (moisJ < mois || (moisJ === mois && jourJ < jour)) age -= 1;
  return age;
}

export type VerificationAge =
  | { ok: true; age: number }
  | { ok: false; age: number; raison: 'trop_jeune' | 'hors_tranche' };

/** La personne peut-elle s'inscrire ? (20 à 35 ans inclus par défaut) */
export function verifierAge(
  dateNaissance: string,
  aujourdHui: string,
  regles: { ageMin: number; ageMax: number } = REGLES,
): VerificationAge {
  const age = calculerAge(dateNaissance, aujourdHui);
  if (age < regles.ageMin) return { ok: false, age, raison: 'trop_jeune' };
  if (age > regles.ageMax) return { ok: false, age, raison: 'hors_tranche' };
  return { ok: true, age };
}

function lireDate(texte: string): [number, number, number] {
  const morceaux = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texte);
  if (!morceaux) throw new Error(`Date invalide : « ${texte} » (format attendu AAAA-MM-JJ)`);
  const [an, mois, jour] = [Number(morceaux[1]), Number(morceaux[2]), Number(morceaux[3])];
  // On vérifie que la date existe vraiment (pas de 31 février)
  const verif = new Date(Date.UTC(an, mois - 1, jour));
  if (verif.getUTCFullYear() !== an || verif.getUTCMonth() !== mois - 1 || verif.getUTCDate() !== jour) {
    throw new Error(`Date invalide : « ${texte} »`);
  }
  return [an, mois, jour];
}
