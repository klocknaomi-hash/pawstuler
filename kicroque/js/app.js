/* ==========================================================================
   KiCroque — logique du site (navigateur)
   --------------------------------------------------------------------------
   Sommaire
     1. Outils & état
     2. Stock du jour (jauge + overlay « complet »)
     3. Rendu : vitrine, cookies, coffrets, saisons
     4. Panier (ajout, quantités, totaux, tiroir)
     5. Commande (formulaire, Stripe ou démo)
     6. Confirmation, toasts, modales, thème
     7. Démarrage
   ========================================================================== */
(function () {
  'use strict';

  const KC = window.KC;
  const Art = window.KCArt;
  const CFG = window.KC_CONFIG || {};

  /* ======================================================================
     1. Outils & état
     ====================================================================== */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const price = (n) => KC.formatPrice(n);

  // localStorage peut être indisponible (navigation privée…) : on ne plante jamais.
  const local = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
    },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignoré */ } },
  };

  // ?date=2026-12-10 dans l'URL : prévisualiser les recettes de saison à une autre date (mode démo).
  const params = new URLSearchParams(location.search);
  const dateOverride = /^\d{4}-\d{2}-\d{2}$/.test(params.get('date') || '') ? params.get('date') : null;
  const now = () => (dateOverride ? new Date(dateOverride + 'T09:00:00Z') : new Date());

  const keyLooksReal = typeof CFG.stripePublishableKey === 'string'
    && /^pk_(test|live)_/.test(CFG.stripePublishableKey) && !/REMPLACER/.test(CFG.stripePublishableKey);
  const DEMO = CFG.demoMode === true
    || (CFG.demoMode !== false && (!keyLooksReal || location.protocol === 'file:'));
  const apiUrl = (path) => (CFG.apiBase || '/api') + path;

  const state = {
    today: KC.parisParts(now()).iso,
    days: KC.getDeliveryDays(now()),
    stock: {},                 // { 'AAAA-MM-JJ': nombre de commandes déjà prises }
    selectedDay: null,
    cart: [],                  // [{ item, qty }]
    firstOrderDone: local.get('kc_first_order_done', false),
    bannerDismissed: local.get('kc_banner_dismissed', false),
    embedded: null,            // instance Stripe Embedded Checkout
  };

  const MAX = KC.RULES.maxOrdersPerDay;
  const isFull = (iso) => (state.stock[iso] || 0) >= MAX;

  /* ======================================================================
     2. Stock du jour
     ====================================================================== */

  // Démo : quelques créneaux « déjà pris », stables pour une date donnée.
  function demoSeed(iso) {
    let h = 0;
    for (const c of iso) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h % 6;
  }

  async function loadStock() {
    if (!DEMO) {
      try {
        const res = await fetch(apiUrl('/stock'), { headers: { Accept: 'application/json' } });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.days) && data.days.length) {
            state.days = data.days.map((d) => Object.assign({}, KC.getDeliveryDays(now(), 7).find((x) => x.iso === d.iso) || {
              iso: d.iso, label: KC.formatDateFr(d.iso, { weekday: 'long', day: 'numeric', month: 'long' }),
              short: KC.formatDateFr(d.iso, { weekday: 'short', day: 'numeric', month: 'short' }),
            }));
            data.days.forEach((d) => { state.stock[d.iso] = Number(d.taken) || 0; });
            return;
          }
        }
      } catch (e) { /* on bascule sur l'affichage local */ }
    }
    const demo = local.get('kc_demo_orders', {});
    state.days.forEach((d) => {
      if (demo[d.iso] == null) demo[d.iso] = demoSeed(d.iso);
      state.stock[d.iso] = demo[d.iso];
    });
    local.set('kc_demo_orders', demo);
  }

  function renderStock() {
    const tabs = $('#stock-days');
    tabs.innerHTML = state.days.map((d) => {
      const left = Math.max(0, MAX - (state.stock[d.iso] || 0));
      return `<button type="button" role="tab" class="day-tab ${left === 0 ? 'full' : ''}" data-day="${d.iso}"
        aria-selected="${d.iso === state.selectedDay}">
        <strong>${d.isToday ? 'Aujourd’hui · ' : ''}${esc(d.short)}</strong>
        <small>${left === 0 ? 'Complet' : `${left} créneau${left > 1 ? 'x' : ''} libre${left > 1 ? 's' : ''}`}</small>
      </button>`;
    }).join('');

    const iso = state.selectedDay;
    const taken = Math.min(MAX, state.stock[iso] || 0);
    const left = MAX - taken;
    const day = state.days.find((d) => d.iso === iso);
    const slots = Array.from({ length: MAX }, (_, i) =>
      `<span class="slot ${i < taken ? 'taken' : 'free'}" title="${i < taken ? 'Commande prise' : 'Créneau disponible'}"></span>`).join('');
    $('#stock-gauge').innerHTML = `
      <div class="slots" role="img" aria-label="${taken} commandes prises sur ${MAX} pour ${esc(day ? day.label : '')}">${slots}</div>
      <div class="stock-legend">
        <span>🍪 ${taken} commande${taken > 1 ? 's' : ''} prise${taken > 1 ? 's' : ''}</span>
        <span class="left ${left === 0 ? 'none' : left <= 2 ? 'low' : ''}">${left === 0 ? 'Complet pour ce jour 😢' : left <= 2 ? `Vite, plus que ${left} !` : `${left} créneaux disponibles`}</span>
      </div>`;
    applySoldOut();
  }

  // Overlay « complet » sur les produits si le jour choisi est plein.
  function applySoldOut() {
    const full = isFull(state.selectedDay);
    const allFull = state.days.every((d) => isFull(d.iso));
    const other = state.days.find((d) => !isFull(d.iso));
    const msg = allFull
      ? 'Victimes de notre succès ! Tous les créneaux sont pris, revenez la semaine prochaine.'
      : other ? `Plus de créneau ce jour-là. Essayez ${other.label} !` : '';
    $$('.sellable').forEach((grid) => grid.classList.toggle('is-soldout', full));
    $$('[data-soldout-msg]').forEach((el) => { el.textContent = msg; });
    $$('.sellable [data-add]').forEach((btn) => { btn.disabled = full; });
  }

  function selectDay(iso) {
    if (!state.days.some((d) => d.iso === iso)) return;
    state.selectedDay = iso;
    renderStock();
  }

  /* ======================================================================
     3. Rendu des produits
     ====================================================================== */
  const SOLDOUT_HTML = '<div class="soldout" aria-hidden="true"><span>Complet</span><small data-soldout-msg></small></div>';

  function stepperHTML(qty, label) {
    return `<div class="qty" role="group" aria-label="${esc(label || 'Quantité')}">
      <button type="button" data-step="-1" aria-label="Retirer un">−</button>
      <output aria-live="polite">${qty}</output>
      <button type="button" data-step="1" aria-label="Ajouter un">+</button>
    </div>`;
  }

  function textureRadios(name, prices) {
    return `<fieldset class="texture-picker"><legend class="sr-only">Texture</legend>
      ${Object.values(KC.TEXTURES).map((t, i) => `
        <label class="texture-option">
          <input type="radio" name="${name}" value="${t.id}" ${i === 0 ? 'checked' : ''}>
          <span><strong>${t.label}</strong><small>${price(prices[t.id])}</small></span>
        </label>`).join('')}
    </fieldset>`;
  }

  function allergensHTML(list) {
    return `<details class="allergens"><summary>Allergènes</summary>${esc(list.join(', '))}. Fabriqué dans un atelier utilisant des fruits à coque.</details>`;
  }

  // Vitrine du hero : 4 cookies
  function renderShowcase() {
    const picks = [
      ['double-chocolat', 'epais'], ['matcha-white', 'plat'], ['pistache-gianduja', 'epais'], ['speculoos-cream', 'plat'],
    ];
    $('#hero-showcase').innerHTML = picks.map(([id, tex]) => {
      const f = KC.FLAVOR_BY_ID[id];
      return `<a class="showcase-item" href="#cookie-${id}" style="text-decoration:none">
        ${Art.cookie(f.colors, tex, f.id)}
        <strong>${esc(f.name)}</strong><small>${KC.TEXTURES[tex].short} · ${price(KC.TEXTURES[tex].price)}</small>
      </a>`;
    }).join('');
  }

  // Carte cookie (saveur permanente ou recette de saison)
  function cookieCard(p, opts) {
    const o = opts || {};
    const prices = o.prices || { plat: KC.TEXTURES.plat.price, epais: KC.TEXTURES.epais.price };
    const tag = o.tag ? `<span class="tag ${o.event ? 'event' : ''}">${esc(o.tag)}</span>` : '';
    return `<article class="card product" id="${o.idPrefix || 'cookie'}-${p.id}" data-type="${o.type || 'cookie'}" data-id="${p.id}" style="--tint:${p.tint}">
      <div class="product-visual" data-art>${Art.cookie(p.colors, 'plat', p.id)}<span class="emoji-badge" aria-hidden="true">${p.emoji}</span>${tag}</div>
      <div class="product-body">
        <h3>${esc(p.name)}</h3>
        ${o.until ? `<p class="until">${esc(o.until)}</p>` : ''}
        <p class="muted">${esc(p.desc)}</p>
        ${textureRadios(`tex-${p.id}`, prices)}
        ${allergensHTML(p.allergens)}
        <div class="product-foot">
          <p class="price" data-price>${price(prices.plat)}</p>
          ${stepperHTML(1)}
          <button class="btn btn-primary" type="button" data-add>Ajouter</button>
        </div>
      </div>
      ${SOLDOUT_HTML}
    </article>`;
  }

  function renderProducts() {
    $('#product-grid').innerHTML = KC.FLAVORS.map((f) => cookieCard(f)).join('');
  }

  function renderSeasonal() {
    const active = KC.activeSeasonal(state.today);
    const grid = $('#seasonal-grid');
    if (!active.length) {
      grid.classList.remove('sellable');
      grid.innerHTML = '<p class="card seasonal-empty">Entre deux saisons… la prochaine recette signature arrive très vite ! 👀</p>';
    } else {
      grid.innerHTML = active.map((s) => {
        const period = KC.seasonalPeriod(s, state.today);
        return cookieCard(s, {
          type: 'seasonal', idPrefix: 'saison', prices: KC.SEASONAL_PRICES, event: s.kind === 'event',
          tag: s.kind === 'event' ? `Édition ${s.label}` : `Recette d’${s.label.toLowerCase()}`.replace('d’printemps', 'de printemps'),
          until: `Disponible jusqu’au ${KC.formatDateFr(period.end, { day: 'numeric', month: 'long' })}`,
        });
      }).join('');
    }

    // Calendrier : recettes en cours puis à venir, par date de début
    const items = KC.SEASONAL.map((s) => ({ s, p: KC.seasonalPeriod(s, state.today) }))
      .sort((a, b) => (a.p.active === b.p.active ? (a.p.start < b.p.start ? -1 : 1) : a.p.active ? -1 : 1));
    const fmt = (iso) => KC.formatDateFr(iso, { day: 'numeric', month: 'short' });
    $('#seasonal-calendar').innerHTML = items.map(({ s, p }) => `
      <li class="cal-item ${p.active ? 'active' : ''}">
        <span class="cal-emoji" aria-hidden="true">${s.emoji}</span>
        <div>
          <span class="cal-status">${p.active ? 'En ce moment' : s.label}</span>
          <strong>${esc(s.name)}</strong>
          <small>${p.active ? 'Jusqu’au ' + fmt(p.end) : 'Du ' + fmt(p.start) + ' au ' + fmt(p.end)}</small>
        </div>
      </li>`).join('');
  }

  function renderBoxes() {
    const [disc, six, duo] = ['decouverte', 'six-saveurs', 'duo-textures'].map((id) => KC.BOX_BY_ID[id]);
    const season = KC.currentSeasonRecipe(state.today);
    const F = KC.FLAVOR_BY_ID;

    // Découverte
    const discCookies = disc.contents.map((c) => {
      const p = c.flavor === 'saison' ? (season || F['chocolat-caramel']) : F[c.flavor];
      return { p, t: c.texture };
    });
    const discHTML = `<article class="card box" data-type="box" data-id="decouverte">
      <div class="box-visual">${discCookies.map(({ p, t }) => Art.cookie(p.colors, t, p.id)).join('')}</div>
      <div class="box-body">
        <h3>${disc.emoji} ${esc(disc.name)}</h3>
        <p class="box-tagline">${esc(disc.tagline)}</p>
        <p class="muted">${esc(disc.desc)}</p>
        <ul class="box-contents">${discCookies.map(({ p, t }) => `<li>${p.emoji} ${esc(p.name)} · ${KC.TEXTURES[t].short}</li>`).join('')}</ul>
        <div class="product-foot">
          <p class="price" data-price>${price(disc.price)}</p>
          ${stepperHTML(1)}
          <button class="btn btn-primary" type="button" data-add>Ajouter</button>
        </div>
      </div>
      ${SOLDOUT_HTML}
    </article>`;

    // 6 saveurs
    const sixHTML = `<article class="card box" data-type="box" data-id="six-saveurs">
      <div class="box-visual" data-art>${sixArt('plat')}</div>
      <div class="box-body">
        <h3>${six.emoji} ${esc(six.name)}</h3>
        <p class="box-tagline">${esc(six.tagline)}</p>
        <p class="muted">${esc(six.desc)}</p>
        ${textureRadios('tex-box-six', six.prices)}
        <div class="product-foot">
          <p class="price" data-price>${price(six.prices.plat)}</p>
          ${stepperHTML(1)}
          <button class="btn btn-primary" type="button" data-add>Ajouter</button>
        </div>
      </div>
      ${SOLDOUT_HTML}
    </article>`;

    // Duo textures (mis en avant)
    const defaults = ['double-chocolat', 'vanille-pecan', 'pistache-gianduja'];
    const duoHTML = `<article class="card box featured" data-type="box" data-id="duo-textures" id="coffret-duo">
      <span class="box-ribbon">Le préféré ⭐</span>
      <div class="box-visual duo">
        <div class="duo-half">${Art.cookie(F['chocolat-caramel'].colors, 'plat', 'duo')}<small>Plat</small></div>
        <span class="duo-vs" aria-hidden="true">vs</span>
        <div class="duo-half">${Art.cookie(F['chocolat-caramel'].colors, 'epais', 'duo')}<small>Épais</small></div>
      </div>
      <div class="box-body">
        <h3>${duo.emoji} ${esc(duo.name)}</h3>
        <p class="box-tagline">${esc(duo.tagline)}</p>
        <p class="muted">${esc(duo.desc)}</p>
        <fieldset class="option-group">
          <legend>Taille du coffret</legend>
          <div class="texture-picker">
            ${Object.entries(duo.sizes).map(([size, cfg], i) => `
              <label class="texture-option">
                <input type="radio" name="duo-size" value="${size}" ${i === 0 ? 'checked' : ''}>
                <span><strong>${cfg.label}</strong><small>${cfg.count} cookies · ${price(cfg.price)}</small></span>
              </label>`).join('')}
          </div>
        </fieldset>
        <fieldset class="option-group" data-duo-flavors>
          <legend>Tes 3 saveurs</legend>
          <div class="flavor-chips">
            ${KC.FLAVORS.map((f) => `<label class="chip"><input type="checkbox" name="duo-flavor" value="${f.id}" ${defaults.includes(f.id) ? 'checked' : ''}><span>${f.emoji} ${esc(f.name)}</span></label>`).join('')}
          </div>
          <p class="pick-hint ok" data-pick-hint>3 saveurs choisies ✓</p>
        </fieldset>
        <div class="product-foot">
          <p class="price" data-price>${price(duo.sizes[3].price)}</p>
          ${stepperHTML(1)}
          <button class="btn btn-primary" type="button" data-add>Ajouter</button>
        </div>
      </div>
      ${SOLDOUT_HTML}
    </article>`;

    $('#box-grid').innerHTML = discHTML + duoHTML + sixHTML;
    updateDuoCard($('#coffret-duo'));
  }

  function sixArt(texture) {
    return KC.FLAVORS.slice(0, 5).map((f) => Art.cookie(f.colors, texture, f.id)).join('');
  }

  /** Lit les options choisies sur une carte et construit l'article du panier. */
  function readCardItem(card) {
    const type = card.dataset.type;
    const id = card.dataset.id;
    const tex = $('input[type="radio"][name^="tex-"]:checked', card);
    if (type === 'cookie' || type === 'seasonal') return { type, id, texture: tex ? tex.value : 'plat' };
    if (id === 'decouverte') return { type: 'box', id };
    if (id === 'six-saveurs') return { type: 'box', id, texture: tex ? tex.value : 'plat' };
    if (id === 'duo-textures') {
      const size = Number($('input[name="duo-size"]:checked', card).value);
      const flavors = $$('input[name="duo-flavor"]:checked', card).map((i) => i.value);
      return size === KC.FLAVORS.length ? { type: 'box', id, size } : { type: 'box', id, size, flavors };
    }
    return null;
  }

  function updateCardPrice(card) {
    try {
      const d = KC.describeItem(readCardItem(card), state.today);
      $('[data-price]', card).textContent = price(d.unit);
    } catch (e) { /* sélection incomplète (coffret duo) : on garde l'affichage */ }
  }

  function updateDuoCard(card) {
    const size = Number($('input[name="duo-size"]:checked', card).value);
    const group = $('[data-duo-flavors]', card);
    const boxes = $$('input[name="duo-flavor"]', card);
    const hint = $('[data-pick-hint]', card);
    const all = size === KC.FLAVORS.length;
    group.hidden = all;
    if (!all) {
      const checked = boxes.filter((b) => b.checked).length;
      boxes.forEach((b) => { b.disabled = !b.checked && checked >= size; });
      $('legend', group).textContent = `Tes ${size} saveurs`;
      hint.textContent = checked === size ? `${size} saveurs choisies ✓` : `Choisis encore ${size - checked} saveur${size - checked > 1 ? 's' : ''}`;
      hint.classList.toggle('ok', checked === size);
    }
    const cfg = KC.BOX_BY_ID['duo-textures'].sizes[size];
    $('[data-price]', card).textContent = price(cfg.price);
  }

  // Délégation d'événements pour toutes les cartes vendables
  function bindCards() {
    document.addEventListener('change', (e) => {
      const card = e.target.closest('.product, .box');
      if (!card) return;
      if (card.dataset.id === 'duo-textures') { updateDuoCard(card); return; }
      if (e.target.matches('input[type="radio"][name^="tex-"]')) {
        const tex = e.target.value;
        const art = $('[data-art]', card);
        if (card.dataset.id === 'six-saveurs') {
          art.innerHTML = sixArt(tex);
        } else {
          const p = KC.FLAVOR_BY_ID[card.dataset.id] || KC.SEASONAL_BY_ID[card.dataset.id];
          const svg = $('.cookie-svg', art);
          const tmp = document.createElement('div');
          tmp.innerHTML = Art.cookie(p.colors, tex, p.id);
          const fresh = tmp.firstElementChild;
          fresh.classList.add('swap');
          svg.replaceWith(fresh);
        }
        updateCardPrice(card);
      }
    });

    document.addEventListener('click', (e) => {
      const card = e.target.closest('.product, .box');
      if (!card) return;
      const step = e.target.closest('[data-step]');
      if (step) {
        const out = $('.qty output', card);
        const q = Math.max(1, Math.min(KC.RULES.maxQtyPerLine, Number(out.textContent) + Number(step.dataset.step)));
        out.textContent = q;
        return;
      }
      if (e.target.closest('[data-add]')) {
        if (isFull(state.selectedDay)) { toast('Ce jour est complet, choisis un autre créneau 📅', 'error'); return; }
        const item = readCardItem(card);
        const qtyEl = $('.qty output', card);
        try {
          KC.describeItem(item, state.today);
        } catch (err) { toast(err.message, 'error'); return; }
        addToCart(item, Number(qtyEl.textContent) || 1);
        qtyEl.textContent = '1';
      }
    });
  }

  /* ======================================================================
     4. Panier
     ====================================================================== */
  function loadCart() {
    const raw = local.get('kc_cart', []);
    state.cart = (Array.isArray(raw) ? raw : []).filter((l) => {
      try { KC.describeItem(l.item, state.today); return l.qty > 0; } catch (e) { return false; }
    });
  }
  const saveCart = () => local.set('kc_cart', state.cart);
  const cartItems = () => state.cart.map((l) => Object.assign({}, l.item, { qty: l.qty }));

  function totalsFor(shippingMethod) {
    return KC.computeTotals({ items: cartItems(), shippingMethod, firstOrder: !state.firstOrderDone, iso: state.today });
  }

  function addToCart(item, qty) {
    const d = KC.describeItem(item, state.today);
    const key = KC.lineKey(d.item);
    const line = state.cart.find((l) => KC.lineKey(l.item) === key);
    if (line) line.qty = Math.min(KC.RULES.maxQtyPerLine, line.qty + qty);
    else state.cart.push({ item: d.item, qty: Math.min(KC.RULES.maxQtyPerLine, qty) });
    saveCart();
    renderCart();
    toast(`${d.emoji} ${qty > 1 ? qty + ' × ' : ''}${d.name} ajouté au panier`, 'success');
    const btn = $('#cart-open');
    btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump');
  }

  function setLineQty(key, qty) {
    const idx = state.cart.findIndex((l) => KC.lineKey(l.item) === key);
    if (idx < 0) return;
    if (qty <= 0) {
      const d = KC.describeItem(state.cart[idx].item, state.today);
      state.cart.splice(idx, 1);
      toast(`${d.name} retiré du panier`);
    } else {
      state.cart[idx].qty = Math.min(KC.RULES.maxQtyPerLine, qty);
    }
    saveCart();
    renderCart();
  }

  function thumbHTML(line) {
    if (line.colors) return Art.cookie(line.colors, line.texture, line.item.id);
    return `<span aria-hidden="true">${line.emoji}</span>`;
  }

  function totalsHTML(t, opts) {
    const o = opts || {};
    const shipLabel = o.methodLabel ? `Livraison ${o.methodLabel}` : 'Livraison';
    let ship;
    if (t.freeReason) {
      ship = `<span class="strike">${price(t.shippingBase)}</span><span class="free">Offerte</span>`;
    } else {
      ship = o.estimate ? `dès ${price(t.shipping)}` : price(t.shipping);
    }
    const reason = t.freeReason === 'first-order' ? ' <small>· 1ʳᵉ commande 🎉</small>'
      : t.freeReason === 'threshold' ? ' <small>· dès 30 € 🎉</small>' : '';
    return `<dt>Sous-total</dt><dd>${price(t.subtotal)}</dd>
      <dt>${esc(shipLabel)}${reason}</dt><dd>${ship}</dd>
      <dt class="grand">Total${o.estimate && !t.freeReason ? ' estimé' : ''}</dt><dd class="grand">${price(t.total)}</dd>`;
  }

  function renderCart() {
    const t = totalsFor(null);
    $$('[data-cart-count]').forEach((el) => { el.textContent = t.count; el.hidden = t.count === 0; });
    $('#cart-open').setAttribute('aria-label', `Ouvrir le panier (${t.count} article${t.count > 1 ? 's' : ''})`);

    // Barre « livraison offerte »
    const prog = $('#free-progress');
    if (!t.lines.length) prog.innerHTML = '';
    else if (t.freeReason === 'first-order' && t.subtotal < KC.RULES.freeShippingThreshold) prog.innerHTML = '<p>🎉 Livraison offerte : c’est ta première commande !</p>';
    else if (t.remainingForFree > 0) {
      const pct = Math.min(100, (t.subtotal / KC.RULES.freeShippingThreshold) * 100);
      prog.innerHTML = `<p>Plus que <strong>${price(t.remainingForFree)}</strong> pour la livraison offerte 🛵</p>
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>`;
    } else prog.innerHTML = '<p>🎉 Livraison offerte, bien joué !</p><div class="progress-track"><div class="progress-fill" style="width:100%"></div></div>';

    const list = $('#cart-items');
    if (!t.lines.length) {
      list.innerHTML = `<li class="cart-empty"><span class="cart-empty-emoji" aria-hidden="true">🍪</span>
        <p><strong>Ton panier est vide.</strong><br><span class="muted">Un petit cookie pour commencer ?</span></p>
        <a class="btn btn-primary" href="#cookies" data-close-cart>Voir les cookies</a></li>`;
      $('#cart-footer').hidden = true;
      return;
    }
    list.innerHTML = t.lines.map((l) => `
      <li class="cart-line" data-key="${esc(l.key)}">
        <div class="cart-thumb">${thumbHTML(l)}</div>
        <div>
          <p class="cart-name">${l.emoji} ${esc(l.name)}</p>
          <p class="cart-detail">${esc(l.detail)} · ${price(l.unit)} / u.</p>
        </div>
        <div class="cart-row">
          ${stepperHTML(l.qty, 'Quantité de ' + l.name)}
          <button class="link-btn" type="button" data-remove>Retirer</button>
          <p class="cart-line-total">${price(l.total)}</p>
        </div>
      </li>`).join('');
    $('#cart-totals').innerHTML = totalsHTML(t, { estimate: true });
    $('#cart-footer').hidden = false;
  }

  function bindCart() {
    $('#cart-items').addEventListener('click', (e) => {
      const line = e.target.closest('.cart-line');
      if (!line) return;
      const key = line.dataset.key;
      const current = state.cart.find((l) => KC.lineKey(l.item) === key);
      if (!current) return;
      const step = e.target.closest('[data-step]');
      if (step) setLineQty(key, current.qty + Number(step.dataset.step));
      if (e.target.closest('[data-remove]')) setLineQty(key, 0);
    });
    $('#cart-open').addEventListener('click', openCart);
    document.addEventListener('click', (e) => { if (e.target.closest('[data-close-cart]')) closeCart(); });
    $('[data-overlay="cart"]').addEventListener('click', closeCart);
    $('#checkout-open').addEventListener('click', () => { closeCart(); openCheckout(); });
  }

  let lastFocus = null;
  function openCart() {
    lastFocus = document.activeElement;
    const overlay = $('[data-overlay="cart"]');
    const drawer = $('#cart-drawer');
    overlay.hidden = false;
    requestAnimationFrame(() => { overlay.classList.add('open'); drawer.classList.add('open'); });
    drawer.setAttribute('aria-hidden', 'false');
    $('#cart-open').setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
    drawer.focus();
  }
  function closeCart() {
    const overlay = $('[data-overlay="cart"]');
    const drawer = $('#cart-drawer');
    if (!drawer.classList.contains('open')) return;
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    $('#cart-open').setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
    setTimeout(() => { overlay.hidden = true; }, 250);
    if (lastFocus) lastFocus.focus();
  }

  /* ======================================================================
     5. Commande
     ====================================================================== */
  const form = () => $('#checkout-form');
  const formValue = (name) => (form().elements[name] ? form().elements[name].value : '');

  function selectedShipping() {
    const el = $('input[name="shipping"]:checked', form());
    return el ? el.value : null;
  }

  function renderCheckoutChoices() {
    // Jours
    if (!state.selectedDay || isFull(state.selectedDay)) {
      const free = state.days.find((d) => !isFull(d.iso));
      if (free) state.selectedDay = free.iso;
    }
    $('#checkout-days').innerHTML = state.days.map((d) => {
      const left = MAX - (state.stock[d.iso] || 0);
      return `<label class="choice"><input type="radio" name="deliveryDate" value="${d.iso}" ${d.iso === state.selectedDay && left > 0 ? 'checked' : ''} ${left <= 0 ? 'disabled' : ''}>
        <span><span class="choice-emoji" aria-hidden="true">📅</span>
          <span class="choice-main"><strong>${d.isToday ? 'Aujourd’hui, ' : ''}${esc(d.label)}</strong><small>${left <= 0 ? 'Complet' : `${left} créneau${left > 1 ? 'x' : ''} restant${left > 1 ? 's' : ''}`}</small></span>
        </span></label>`;
    }).join('');

    // Livraison
    const pc = formValue('postcode');
    const stuartOk = !/^\d{5}$/.test(pc) || KC.isStuartEligible(pc);
    const current = selectedShipping() || (stuartOk ? 'stuart' : 'colissimo');
    const chosen = current === 'stuart' && !stuartOk ? 'colissimo' : current;
    $('#checkout-shipping').innerHTML = Object.values(KC.SHIPPING).map((m) => {
      const disabled = m.id === 'stuart' && !stuartOk;
      return `<label class="choice"><input type="radio" name="shipping" value="${m.id}" ${m.id === chosen ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
        <span><span class="choice-emoji" aria-hidden="true">${m.emoji}</span>
          <span class="choice-main"><strong>${m.label} · ${m.zone}</strong><small>${disabled ? 'Pas disponible pour ce code postal' : m.delay}</small></span>
          <span class="choice-price">${price(m.price)}</span>
        </span></label>`;
    }).join('');
  }

  function renderSummary() {
    const method = selectedShipping();
    const t = totalsFor(method);
    $('#summary-lines').innerHTML = t.lines.map((l) => `<li><span>${l.qty} × ${esc(l.name)}${l.texture ? ' (' + KC.TEXTURES[l.texture].short + ')' : ''}</span><span>${price(l.total)}</span></li>`).join('');
    $('#summary-totals').innerHTML = totalsHTML(t, { methodLabel: method ? KC.SHIPPING[method].label : '' });
    $('#pay-btn').textContent = DEMO ? `Commander (démo) · ${price(t.total)}` : `Payer ${price(t.total)}`;
    $('#pay-note').textContent = DEMO
      ? 'Mode démo : aucun paiement réel. Branchez votre clé Stripe pour encaisser.'
      : (t.freeReason === 'first-order' ? 'Livraison offerte 1ʳᵉ commande, vérifiée avec ton e-mail. ' : '') + 'Paiement sécurisé par Stripe 🔒';
  }

  function openCheckout() {
    if (!state.cart.length) { toast('Ton panier est vide 🍪'); return; }
    if (state.days.every((d) => isFull(d.iso))) { toast('Tous les créneaux sont complets, désolé 😢', 'error'); return; }
    // Coordonnées mémorisées sur cet appareil
    const saved = local.get('kc_customer', null);
    if (saved) Object.entries(saved).forEach(([k, v]) => { if (form().elements[k] && !form().elements[k].value) form().elements[k].value = v; });
    renderCheckoutChoices();
    renderSummary();
    showCheckoutStep('form');
    openModal('#checkout-modal');
  }

  function showCheckoutStep(step) {
    form().hidden = step !== 'form';
    $('#stripe-step').hidden = step !== 'stripe';
    if (step === 'form' && state.embedded) { state.embedded.destroy(); state.embedded = null; }
  }

  function showErrors(errors) {
    $$('.field', form()).forEach((f) => { f.classList.remove('invalid'); const e = $('.field-error', f); if (e) e.remove(); });
    Object.entries(errors).forEach(([name, msg]) => {
      const input = form().elements[name];
      if (!input) return;
      const field = input.closest('.field');
      field.classList.add('invalid');
      field.insertAdjacentHTML('beforeend', `<span class="field-error">${esc(msg)}</span>`);
    });
    const first = Object.keys(errors)[0];
    if (first && form().elements[first]) form().elements[first].focus();
  }

  async function submitCheckout(e) {
    e.preventDefault();
    const fd = new FormData(form());
    const customer = {};
    ['firstName', 'lastName', 'email', 'phone', 'address', 'address2', 'postcode', 'city', 'notes'].forEach((k) => { customer[k] = fd.get(k) || ''; });
    const check = KC.validateCustomer(customer);
    const errors = Object.assign({}, check.errors);
    const deliveryDate = fd.get('deliveryDate');
    const shippingMethod = fd.get('shipping');
    if (!deliveryDate) { toast('Choisis un jour de livraison 📅', 'error'); return; }
    if (!shippingMethod) { toast('Choisis un mode de livraison 🚚', 'error'); return; }
    if (shippingMethod === 'stuart' && !KC.isStuartEligible(check.value.postcode)) errors.postcode = 'Stuart livre Paris et la petite couronne uniquement : choisis Colissimo.';
    showErrors(errors);
    if (Object.keys(errors).length) return;

    local.set('kc_customer', { firstName: check.value.firstName, lastName: check.value.lastName, email: check.value.email, phone: customer.phone, address: check.value.address, address2: check.value.address2, postcode: check.value.postcode, city: check.value.city });

    const btn = $('#pay-btn');
    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = 'Un instant…';
    try {
      if (DEMO) await demoCheckout(check.value, deliveryDate, shippingMethod);
      else await stripeCheckout(check.value, deliveryDate, shippingMethod);
    } catch (err) {
      toast(err.message || 'Oups, la commande n’a pas pu être envoyée.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  }

  // Mode démo : paiement simulé, stock local
  async function demoCheckout(customer, deliveryDate, shippingMethod) {
    await new Promise((r) => setTimeout(r, 900));
    const t = totalsFor(shippingMethod);
    const rnd = (max) => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % max; };
    const demo = local.get('kc_demo_orders', {});
    demo[deliveryDate] = (demo[deliveryDate] || 0) + 1;
    local.set('kc_demo_orders', demo);
    state.stock[deliveryDate] = demo[deliveryDate];
    orderSucceeded({
      orderNumber: KC.generateOrderNumber(rnd), firstName: customer.firstName, deliveryDate, shippingMethod, total: t.total,
    });
  }

  // Mode réel : session Stripe créée par /api, paiement intégré dans la modale
  async function stripeCheckout(customer, deliveryDate, shippingMethod) {
    if (typeof window.Stripe !== 'function') throw new Error('Le module de paiement n’a pas pu se charger. Vérifie ta connexion.');
    const res = await fetch(apiUrl('/create-checkout-session'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cartItems(), customer, deliveryDate, shippingMethod }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 409) { await loadStock(); renderStock(); renderCheckoutChoices(); }
      throw new Error(data.error || 'Impossible de préparer le paiement.');
    }
    sessionStorage.setItem('kc_pending_order', JSON.stringify({ orderNumber: data.orderNumber }));
    const stripe = window.Stripe(CFG.stripePublishableKey);
    showCheckoutStep('stripe');
    state.embedded = await stripe.initEmbeddedCheckout({ fetchClientSecret: () => Promise.resolve(data.clientSecret) });
    state.embedded.mount('#stripe-checkout');
  }

  // Retour depuis Stripe : ?session_id=... dans l'URL
  async function handleStripeReturn() {
    const sessionId = params.get('session_id');
    if (!sessionId) return;
    history.replaceState(null, '', location.pathname + location.hash);
    try {
      const res = await fetch(apiUrl('/order-status?session_id=' + encodeURIComponent(sessionId)));
      const data = await res.json();
      if (res.ok && data.status === 'complete') {
        orderSucceeded(data);
        loadStock().then(renderStock);
      } else {
        toast('Le paiement n’a pas abouti. Ton panier t’attend toujours 🍪', 'error');
      }
    } catch (e) {
      toast('Impossible de vérifier le paiement. Regarde tes e-mails ou écris-nous.', 'error');
    }
  }

  function orderSucceeded(order) {
    state.cart = [];
    saveCart();
    state.firstOrderDone = true;
    local.set('kc_first_order_done', true);
    sessionStorage.removeItem('kc_pending_order');
    renderCart();
    renderBanner();
    renderStock();
    closeModal('#checkout-modal');
    showConfirmation(order);
  }

  /* ======================================================================
     6. Confirmation, toasts, modales, thème
     ====================================================================== */
  function showConfirmation(o) {
    $('#confirm-title').textContent = o.firstName ? `Merci ${o.firstName} !` : 'Merci !';
    $('#confirm-text').textContent = 'Ta commande est confirmée. On s’occupe de tout 🍪';
    $('#confirm-number').textContent = o.orderNumber || 'KC-?????';
    const ship = KC.SHIPPING[o.shippingMethod];
    $('#confirm-details').innerHTML = [
      o.deliveryDate ? ['Livraison', KC.formatDateFr(o.deliveryDate, { weekday: 'long', day: 'numeric', month: 'long' })] : null,
      ship ? ['Mode', `${ship.emoji} ${ship.label}`] : null,
      o.total != null ? ['Total payé', price(o.total)] : null,
    ].filter(Boolean).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
    const conf = $('#confirm-modal .confetti');
    const colors = ['#4BA3E3', '#FFD46A', '#F7B7C7', '#9ED18B', '#FFA66E'];
    conf.innerHTML = Array.from({ length: 40 }, (_, i) =>
      `<i style="left:${Math.random() * 100}%;background:${colors[i % colors.length]};animation-delay:${Math.random() * 0.6}s"></i>`).join('');
    openModal('#confirm-modal');
  }

  function toast(message, type) {
    const el = document.createElement('div');
    el.className = `toast ${type || ''}`;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.textContent = message;
    const box = $('#toasts');
    box.appendChild(el);
    while (box.children.length > 3) box.firstElementChild.remove();
    setTimeout(() => { el.classList.add('leaving'); setTimeout(() => el.remove(), 260); }, 2600);
  }

  let modalFocus = null;
  function openModal(sel) {
    const m = $(sel);
    if (!m.hidden) return;
    modalFocus = document.activeElement;
    m.hidden = false;
    document.body.classList.add('no-scroll');
    const first = $('input:not([disabled]), button:not([disabled])', $('.modal-panel', m));
    if (first) setTimeout(() => first.focus(), 50);
  }
  function closeModal(sel) {
    const m = $(sel);
    if (m.hidden) return;
    m.hidden = true;
    if (sel === '#checkout-modal') showCheckoutStep('form');
    if (!$$('.modal').some((x) => !x.hidden)) document.body.classList.remove('no-scroll');
    if (modalFocus && document.contains(modalFocus)) modalFocus.focus();
  }

  function bindModals() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-close-modal]');
      if (btn) closeModal('#' + btn.closest('.modal').id);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const open = $$('.modal').filter((m) => !m.hidden).pop();
      if (open) closeModal('#' + open.id);
      else closeCart();
    });
    form().addEventListener('submit', submitCheckout);
    form().addEventListener('change', (e) => {
      if (e.target.name === 'deliveryDate') { state.selectedDay = e.target.value; renderStock(); }
      if (e.target.name === 'shipping') renderSummary();
    });
    form().addEventListener('input', (e) => {
      if (e.target.name === 'postcode') {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5);
        if (e.target.value.length === 5 || e.target.value.length === 0) { renderCheckoutChoices(); renderSummary(); }
      }
      const field = e.target.closest('.field.invalid');
      if (field) { field.classList.remove('invalid'); const err = $('.field-error', field); if (err) err.remove(); }
    });
    $('#stripe-back').addEventListener('click', () => showCheckoutStep('form'));
  }

  function renderBanner() {
    $('#top-banner').hidden = state.firstOrderDone || state.bannerDismissed;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const dark = theme === 'dark' || (theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    $('.theme-icon').textContent = dark ? '☀️' : '🌙';
    $('#theme-toggle').setAttribute('aria-label', dark ? 'Activer le thème clair' : 'Activer le thème sombre');
    $('meta[name="theme-color"]').setAttribute('content', dark ? '#13202E' : '#4BA3E3');
  }

  function bindChrome() {
    const saved = local.get('kc_theme', null);
    applyTheme(saved || CFG.defaultTheme || 'light');
    $('#theme-toggle').addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const isDark = current === 'dark' || (current === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
      const next = isDark ? 'light' : 'dark';
      local.set('kc_theme', next);
      applyTheme(next);
    });
    $('[data-dismiss-banner]').addEventListener('click', () => {
      state.bannerDismissed = true;
      local.set('kc_banner_dismissed', true);
      renderBanner();
    });
    $('#stock-days').addEventListener('click', (e) => {
      const tab = e.target.closest('[data-day]');
      if (tab) selectDay(tab.dataset.day);
    });
    const header = $('#site-header');
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (CFG.contactEmail) $$('[data-contact-email]').forEach((a) => { a.href = 'mailto:' + CFG.contactEmail; a.textContent = CFG.contactEmail; });
    if (CFG.instagramUrl) $$('[data-instagram]').forEach((a) => { a.href = CFG.instagramUrl; a.textContent = 'Instagram ' + (CFG.instagramHandle || ''); });
    $$('[data-year]').forEach((el) => { el.textContent = KC.parisParts(new Date()).iso.slice(0, 4); });
  }

  /* ======================================================================
     7. Démarrage
     ====================================================================== */
  async function init() {
    bindChrome();
    loadCart();
    renderBanner();
    renderShowcase();
    renderProducts();
    renderBoxes();
    renderSeasonal();
    bindCards();
    bindCart();
    bindModals();
    renderCart();

    state.selectedDay = state.days[0] ? state.days[0].iso : null;
    await loadStock();
    const firstFree = state.days.find((d) => !isFull(d.iso));
    state.selectedDay = (firstFree || state.days[0] || {}).iso || null;
    renderStock();

    if (DEMO) console.info('[KiCroque] Mode démo : paiement simulé. Renseignez la clé Stripe dans js/config.js pour encaisser.');
    handleStripeReturn();
  }

  init();
})();
