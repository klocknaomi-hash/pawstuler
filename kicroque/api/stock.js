/* GET /api/stock — créneaux pris pour les prochains jours de vente */
'use strict';

const KC = require('../js/shared.js');
const store = require('./_lib/store.js');
const { send, handleCors } = require('./_lib/http.js');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') return send(res, 405, { error: 'Méthode non autorisée.' });
  try {
    const days = KC.getDeliveryDays(new Date());
    const counts = await store.mget(days.map((d) => store.keys.ordersOfDay(d.iso)));
    return send(res, 200, {
      max: KC.RULES.maxOrdersPerDay,
      days: days.map((d, i) => ({ iso: d.iso, label: d.label, taken: Number(counts[i]) || 0 })),
    });
  } catch (err) {
    console.error('[KiCroque] stock', err);
    return send(res, 500, { error: 'Stock indisponible.' });
  }
};
