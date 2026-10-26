/* ==========================================================================
   Stockage des compteurs (commandes par jour, clients, commandes)
   --------------------------------------------------------------------------
   Production : Upstash Redis (gratuit pour ce volume) via son API REST,
   variables UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN.
   (Une base « Redis » ajoutée depuis le Marketplace Vercel fournit aussi
   KV_REST_API_URL / KV_REST_API_TOKEN : elles sont acceptées.)
   Sans ces variables : mémoire du serveur, uniquement pour tester en local
   (les compteurs se perdent à chaque redémarrage).
   ========================================================================== */
'use strict';

const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const memory = new Map();

if (!URL_ || !TOKEN) {
  console.warn('[KiCroque] Aucun Redis configuré : stockage en mémoire (tests uniquement).');
}

async function command(args) {
  if (URL_ && TOKEN) {
    const res = await fetch(URL_, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error('Redis : ' + (data.error || res.status));
    return data.result;
  }
  // Repli mémoire : seulement les commandes utilisées par le site
  const [cmd, key, ...rest] = args;
  switch (cmd) {
    case 'GET': return memory.has(key) ? memory.get(key) : null;
    case 'MGET': return [key, ...rest].map((k) => (memory.has(k) ? memory.get(k) : null));
    case 'SET': {
      if (rest.includes('NX') && memory.has(key)) return null;
      memory.set(key, String(rest[0]));
      return 'OK';
    }
    case 'INCR': { const v = Number(memory.get(key) || 0) + 1; memory.set(key, String(v)); return v; }
    case 'EXPIRE': return 1;
    default: throw new Error('Commande non gérée en mémoire : ' + cmd);
  }
}

const DAY = 24 * 3600;

module.exports = {
  get: (key) => command(['GET', key]),
  mget: (keys) => (keys.length ? command(['MGET', ...keys]) : Promise.resolve([])),
  /** set(key, value, { ttl, nx }) — renvoie false si nx et la clé existe déjà */
  async set(key, value, opts) {
    const o = opts || {};
    const args = ['SET', key, typeof value === 'string' ? value : JSON.stringify(value)];
    if (o.nx) args.push('NX');
    if (o.ttl) args.push('EX', String(o.ttl));
    return (await command(args)) === 'OK';
  },
  async incr(key, ttl) {
    const v = await command(['INCR', key]);
    if (ttl) await command(['EXPIRE', key, String(ttl)]);
    return Number(v);
  },
  keys: {
    ordersOfDay: (iso) => `kc:orders:${iso}`,
    customer: (email) => `kc:customer:${String(email).toLowerCase()}`,
    order: (number) => `kc:order:${number}`,
    session: (id) => `kc:session:${id}`,
  },
  DAY,
};
