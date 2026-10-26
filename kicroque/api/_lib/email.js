/* ==========================================================================
   E-mails via Resend (https://resend.com)
   Variables : RESEND_API_KEY, OWNER_EMAIL (reçoit les commandes),
   FROM_EMAIL (ex. « KiCroque <commandes@kicroque.fr> », domaine vérifié chez Resend).
   Sans clé : l'e-mail est seulement écrit dans les logs.
   ========================================================================== */
'use strict';

const KC = require('../../js/shared.js');

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function sendEmail({ to, subject, html, replyTo }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.log(`[KiCroque] (e-mail non envoyé, RESEND_API_KEY absente) → ${to} : ${subject}`); return; }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL || 'KiCroque <onboarding@resend.dev>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      reply_to: replyTo,
    }),
  });
  if (!res.ok) console.error('[KiCroque] Resend a refusé l’e-mail :', res.status, await res.text());
}

function linesTable(order) {
  const rows = order.lines.map((l) => `<tr>
      <td style="padding:6px 0">${l.qty} × ${esc(l.name)}<br><span style="color:#5B6B7F;font-size:13px">${esc(l.detail)}</span></td>
      <td style="padding:6px 0;text-align:right;white-space:nowrap">${KC.formatPrice(l.total)}</td></tr>`).join('');
  const ship = order.shipping === 0
    ? `<s>${KC.formatPrice(order.shippingBase)}</s> Offerte${order.freeReason === 'first-order' ? ' (1ʳᵉ commande)' : ' (dès 30 €)'}`
    : KC.formatPrice(order.shipping);
  return `<table style="width:100%;border-collapse:collapse;font-size:15px">${rows}
    <tr><td style="padding-top:10px;border-top:1px dashed #ccc">Sous-total</td><td style="padding-top:10px;border-top:1px dashed #ccc;text-align:right">${KC.formatPrice(order.subtotal)}</td></tr>
    <tr><td>Livraison ${esc(KC.SHIPPING[order.shippingMethod].label)}</td><td style="text-align:right">${ship}</td></tr>
    <tr><td style="font-weight:bold;font-size:17px;padding-top:6px">Total</td><td style="font-weight:bold;font-size:17px;text-align:right;padding-top:6px">${KC.formatPrice(order.total)}</td></tr>
  </table>`;
}

function layout(title, body) {
  return `<div style="background:#F2EAE4;padding:24px;font-family:Nunito,Arial,sans-serif;color:#22364E">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden">
      <div style="background:#4BA3E3;color:#F5EBE0;padding:18px 24px;font-size:28px;font-weight:bold;letter-spacing:-.5px">kicroque 🍪</div>
      <div style="padding:24px"><h1 style="font-size:22px;margin:0 0 12px">${title}</h1>${body}</div>
    </div></div>`;
}

/** Notification au propriétaire à chaque commande payée */
function ownerEmail(order, { overQuota } = {}) {
  const c = order.customer;
  const day = KC.formatDateFr(order.deliveryDate, { weekday: 'long', day: 'numeric', month: 'long' });
  return {
    to: process.env.OWNER_EMAIL,
    replyTo: c.email,
    subject: `🍪 Nouvelle commande ${order.orderNumber} · ${day} · ${KC.formatPrice(order.total)}`,
    html: layout(`Nouvelle commande ${esc(order.orderNumber)}`, `
      ${overQuota ? '<p style="background:#FDE2E3;color:#9B2A30;padding:10px;border-radius:10px"><b>⚠️ Quota dépassé</b> : cette commande a été payée alors que le jour était déjà complet (paiements simultanés). Contactez le client.</p>' : ''}
      <p><b>📅 ${esc(day)}</b> · ${esc(KC.SHIPPING[order.shippingMethod].emoji + ' ' + KC.SHIPPING[order.shippingMethod].label)}</p>
      ${linesTable(order)}
      <h2 style="font-size:17px;margin:20px 0 6px">Client</h2>
      <p style="margin:0;line-height:1.6">${esc(c.firstName)} ${esc(c.lastName)}<br>
      <a href="mailto:${esc(c.email)}">${esc(c.email)}</a> · <a href="tel:${esc(c.phone)}">${esc(c.phone)}</a><br>
      ${esc(c.address)}${c.address2 ? '<br>' + esc(c.address2) : ''}<br>${esc(c.postcode)} ${esc(c.city)}</p>
      ${c.notes ? `<p style="background:#FFF6D9;padding:10px;border-radius:10px"><b>Note :</b> ${esc(c.notes)}</p>` : ''}
    `),
  };
}

/** Confirmation au client */
function customerEmail(order) {
  const c = order.customer;
  const day = KC.formatDateFr(order.deliveryDate, { weekday: 'long', day: 'numeric', month: 'long' });
  return {
    to: c.email,
    replyTo: process.env.OWNER_EMAIL,
    subject: `Ta commande KiCroque ${order.orderNumber} est confirmée 🍪`,
    html: layout(`Merci ${esc(c.firstName)} !`, `
      <p>Ta commande <b style="background:#4BA3E3;color:#fff;padding:2px 8px;border-radius:6px">${esc(order.orderNumber)}</b> est bien confirmée.</p>
      <p>📅 <b>${esc(day)}</b><br>${order.shippingMethod === 'stuart' ? '🛵 Livraison par coursier Stuart dans la journée.' : '📦 Expédition Colissimo ce jour-là, livraison sous 48 h.'}</p>
      ${linesTable(order)}
      <p style="margin-top:20px">Une question ? Réponds simplement à cet e-mail.<br>À très vite,<br><b>L’équipe KiCroque</b></p>
    `),
  };
}

module.exports = { sendEmail, ownerEmail, customerEmail };
