/* GET /api/order-status?session_id=cs_... — état d'un paiement au retour de Stripe */
'use strict';

const Stripe = require('stripe');
const { send, handleCors } = require('./_lib/http.js');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_manquante');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  const url = new URL(req.url, 'http://localhost');
  const id = url.searchParams.get('session_id') || '';
  if (!/^cs_[A-Za-z0-9_]+$/.test(id)) return send(res, 400, { error: 'Session invalide.' });
  try {
    const s = await stripe.checkout.sessions.retrieve(id);
    const md = s.metadata || {};
    return send(res, 200, {
      status: s.status,                 // 'complete' | 'open' | 'expired'
      paymentStatus: s.payment_status,  // 'paid' | 'unpaid' | ...
      orderNumber: md.order_number,
      firstName: md.first_name,
      deliveryDate: md.delivery_date,
      shippingMethod: md.shipping_method,
      total: s.amount_total / 100,
    });
  } catch (err) {
    console.error('[KiCroque] order-status', err.message);
    return send(res, 404, { error: 'Commande introuvable.' });
  }
};
