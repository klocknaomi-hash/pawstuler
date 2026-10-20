import { describe, expect, it } from 'vitest';

import { calculerAge, verifierAge } from './age';

describe('calculerAge', () => {
  it("compte une année de plus le jour de l'anniversaire", () => {
    expect(calculerAge('2000-10-20', '2026-10-19')).toBe(25);
    expect(calculerAge('2000-10-20', '2026-10-20')).toBe(26);
  });

  it('gère les personnes nées un 29 février', () => {
    expect(calculerAge('2004-02-29', '2026-02-28')).toBe(21);
    expect(calculerAge('2004-02-29', '2026-03-01')).toBe(22);
  });

  it('refuse une date qui n’existe pas', () => {
    expect(() => calculerAge('2001-02-31', '2026-10-20')).toThrow();
    expect(() => calculerAge('20/10/2001', '2026-10-20')).toThrow();
  });
});

describe('verifierAge (tranche 20 à 35 ans)', () => {
  const aujourdHui = '2026-10-20';

  it('accepte 20 ans tout juste', () => {
    expect(verifierAge('2006-10-20', aujourdHui)).toEqual({ ok: true, age: 20 });
  });

  it('refuse la veille des 20 ans', () => {
    expect(verifierAge('2006-10-21', aujourdHui)).toEqual({ ok: false, age: 19, raison: 'trop_jeune' });
  });

  it('accepte jusqu’à la veille des 36 ans', () => {
    expect(verifierAge('1990-10-21', aujourdHui)).toEqual({ ok: true, age: 35 });
  });

  it('refuse à partir de 36 ans', () => {
    expect(verifierAge('1990-10-20', aujourdHui)).toEqual({ ok: false, age: 36, raison: 'hors_tranche' });
  });

  it('suit des règles personnalisées', () => {
    expect(verifierAge('2007-01-01', aujourdHui, { ageMin: 18, ageMax: 35 }).ok).toBe(true);
  });
});
