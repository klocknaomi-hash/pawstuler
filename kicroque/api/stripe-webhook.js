/* ==========================================================================
   POST /api/stripe-webhook
   Appelé par Stripe quand un paiement réussit :
     • compte la commande dans la jauge du jour,
     • retient l'e-mail du client (livraison offerte = 1ʳᵉ commande seulement),
     • envoie la notification au propriétaire et la confirmation au client.
   À déclarer dans Stripe › Développeurs › Webhooks, événements :
     checkout.session.completed, checkout.session.async_payment_succeeded
   ========================================================================== */
'use strict';

const Stripe = require('stripe');
const KC = require('../js/shared.js');
const store = require('./_lib/store.js');
const { sendEmail, ownerEmail, customerEmail } = require('./_lib/email.js');
const { send, readRaw } = require('./_lib/http.js');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_manquante');

async function handlePaidSession(session) {
  // Idempotence : Stripe peut renvoyer le même événement plusieurs fois
  const first = await store.set(store.keys.session(session.id), '1', { nx: true, ttl: 30 * store.DAY });
  if (!first) return;

  const md = session.metadata || {};
  const raw = await store.get(store.keys.order(md.order_number));
  let order = raw ? JSON.parse(raw) : null;
  if (!order || !order.lines) {
    // Repli si la commande n'a pas été retrouvée (stockage mémoire en local, par ex.)
    const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
    order = {
      orderNumber: md.order_number, deliveryDate: md.delivery_date, shippingMethod: md.shipping_method,
      customer: { firstName: md.first_name, lastName: '', email: md.email, phone: (session.customer_details || {}).phone || '', address: '(voir Stripe)', postcode: '', city: '' },
      lines: items.data.map((li) => ({ name: li.description, detail: '', qty: li.quantity, total: li.amount_total / 100 })),
      subtotal: session.amount_subtotal / 100, shipping: 0, shippingBase: 0, total: session.amount_total / 100,
    };
  }

  const count = await store.incr(store.keys.ordersOfDay(order.deliveryDate), 30 * store.DAY);
  const overQuota = count > KC.RULES.maxOrdersPerDay;
  await store.set(store.keys.customer(order.customer.email), order.orderNumber);
  order.status = 'paid';
  order.paidAt = new Date().toISOString();
  await store.set(store.keys.order(order.orderNumber), order, { ttl: 90 * store.DAY });

  const mails = [customerEmail(order)];
  if (process.env.OWNER_EMAIL) mails.push(ownerEmail(order, { overQuota }));
  await Promise.all(mails.map((m) => sendEmail(m).catch((e) => console.error('[KiCroque] e-mail', e))));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Méthode non autorisée.' });
  let event;
  try {
    const raw = await readRaw(req);
    event = stripe.webhooks.constructEvent(raw, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[KiCroque] signature webhook invalide', err.message);
    return send(res, 400, { error: 'Signature invalide.' });
  }

  try {
    const s = event.data.object;
    if ((event.type === 'checkout.session.completed' && s.payment_status === 'paid')
      || event.type === 'checkout.session.async_payment_succeeded') {
      await handlePaidSession(s);
    }
    return send(res, 200, { received: true });
  } catch (err) {
    console.error('[KiCroque] webhook', err);
    return send(res, 500, { error: 'Erreur de traitement.' }); // Stripe réessaiera
  }
};

// Le corps doit rester brut pour vérifier la signature
module.exports.config = { api: { bodyParser: false } };
