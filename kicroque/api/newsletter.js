/* ==========================================================================
   POST /api/newsletter  { email }
   Inscrit une adresse à la liste « recettes en avant-première » (Redis).
   Le propriétaire reçoit un petit e-mail à chaque nouvelle inscription.
   Pour exporter la liste : commande Redis SMEMBERS kc:newsletter (console Upstash).
   ========================================================================== */
'use strict';

const store = require('./_lib/store.js');
const { sendEmail } = require('./_lib/email.js');
const { send, readJson, handleCors } = require('./_lib/http.js');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, { error: 'Méthode non autorisée.' });
  try {
    const body = await readJson(req);
    const email = String(body.email || '').trim().toLowerCase().slice(0, 120);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return send(res, 400, { error: 'Adresse e-mail invalide.' });
    const isNew = await store.sadd(store.keys.newsletter, email);
    if (isNew && process.env.OWNER_EMAIL) {
      await sendEmail({
        to: process.env.OWNER_EMAIL,
        subject: '💌 Nouvelle inscription à la newsletter KiCroque',
        html: `<p>Nouvelle inscription : <b>${email.replace(/[<>&"]/g, '')}</b></p>`,
      }).catch((e) => console.error('[KiCroque] e-mail newsletter', e));
    }
    return send(res, 200, { ok: true, alreadySubscribed: !isNew });
  } catch (err) {
    console.error('[KiCroque] newsletter', err);
    return send(res, 500, { error: 'Inscription impossible pour le moment.' });
  }
};
