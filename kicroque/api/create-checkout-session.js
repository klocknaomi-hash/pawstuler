/* ==========================================================================
   POST /api/create-checkout-session
   Recalcule le panier côté serveur, vérifie le quota du jour, puis crée une
   session Stripe Checkout « intégrée » (Embedded Checkout).
   Réponse : { clientSecret, orderNumber }
   ========================================================================== */
'use strict';

const crypto = require('crypto');
const Stripe = require('stripe');
const KC = require('../js/shared.js');
const store = require('./_lib/store.js');
const { send, readJson, handleCors, siteUrl } = require('./_lib/http.js');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_manquante');
const cents = (n) => Math.round(n * 100);

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return send(res, 405, { error: 'Méthode non autorisée.' });
  if (!process.env.STRIPE_SECRET_KEY) return send(res, 500, { error: 'Paiement non configuré (STRIPE_SECRET_KEY).' });

  try {
    const body = await readJson(req);
    const now = new Date();
    const today = KC.parisParts(now).iso;

    // 1. Coordonnées
    const check = KC.validateCustomer(body.customer);
    if (!check.ok) return send(res, 400, { error: Object.values(check.errors)[0], fields: check.errors });
    const customer = check.value;

    // 2. Jour de livraison + quota (8 commandes max)
    const days = KC.getDeliveryDays(now).map((d) => d.iso);
    if (!days.includes(body.deliveryDate)) return send(res, 400, { error: 'Ce jour de livraison n’est plus disponible.' });
    const taken = Number(await store.get(store.keys.ordersOfDay(body.deliveryDate))) || 0;
    if (taken >= KC.RULES.maxOrdersPerDay) return send(res, 409, { error: 'Ce jour vient d’être complet 😢 Choisis un autre créneau.' });

    // 3. Livraison
    const method = KC.SHIPPING[body.shippingMethod];
    if (!method) return send(res, 400, { error: 'Mode de livraison invalide.' });
    if (method.id === 'stuart' && !KC.isStuartEligible(customer.postcode)) {
      return send(res, 400, { error: 'Stuart livre Paris et la petite couronne uniquement : choisis Colissimo.' });
    }

    // 4. Prix recalculés (première commande = e-mail jamais vu)
    const firstOrder = !(await store.get(store.keys.customer(customer.email)));
    const totals = KC.computeTotals({ items: body.items, shippingMethod: method.id, firstOrder, iso: today });
    if (!totals.lines.length) return send(res, 400, { error: 'Ton panier est vide.' });

    // 5. Numéro de commande unique KC-XXXXX
    let orderNumber;
    for (let i = 0; i < 10; i++) {
      const candidate = KC.generateOrderNumber((max) => crypto.randomInt(max));
      if (await store.set(store.keys.order(candidate), '{}', { nx: true, ttl: 90 * store.DAY })) { orderNumber = candidate; break; }
    }
    if (!orderNumber) throw new Error('Impossible de générer un numéro de commande.');

    // 6. Session Stripe
    const lineItems = totals.lines.map((l) => ({
      quantity: l.qty,
      price_data: {
        currency: 'eur',
        unit_amount: cents(l.unit),
        product_data: { name: `${l.emoji} ${l.name}`, description: l.detail || undefined },
      },
    }));
    if (totals.shipping > 0) {
      lineItems.push({
        quantity: 1,
        price_data: { currency: 'eur', unit_amount: cents(totals.shipping), product_data: { name: `Livraison ${method.label}`, description: method.zone } },
      });
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      locale: 'fr',
      line_items: lineItems,
      customer_email: customer.email,
      return_url: `${siteUrl(req)}/?session_id={CHECKOUT_SESSION_ID}`,
      payment_intent_data: { description: `Commande KiCroque ${orderNumber}` },
      metadata: {
        order_number: orderNumber,
        delivery_date: body.deliveryDate,
        shipping_method: method.id,
        first_name: customer.firstName,
        email: customer.email,
      },
    });

    // 7. On garde la commande complète pour le webhook (e-mails, stock)
    const order = {
      orderNumber, status: 'pending', createdAt: now.toISOString(), sessionId: session.id,
      deliveryDate: body.deliveryDate, shippingMethod: method.id, customer,
      lines: totals.lines.map(({ name, detail, emoji, unit, qty, total, item }) => ({ name, detail, emoji, unit, qty, total, item })),
      subtotal: totals.subtotal, shipping: totals.shipping, shippingBase: totals.shippingBase,
      freeReason: totals.freeReason, total: totals.total,
    };
    await store.set(store.keys.order(orderNumber), order, { ttl: 90 * store.DAY });

    return send(res, 200, { clientSecret: session.client_secret, orderNumber });
  } catch (err) {
    if (err.isUserError) return send(res, 400, { error: err.message });
    console.error('[KiCroque] create-checkout-session', err);
    return send(res, 500, { error: 'Le paiement n’a pas pu être préparé. Réessaie dans un instant.' });
  }
};
