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
    texture: KC.TEXTURES[local.get('kc_texture', 'plat')] ? local.get('kc_texture', 'plat') : 'plat',
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
      `<span class="slot ${i < taken ? 'taken' : 'free'}" title="${i < taken ? 'Commande prise' : 'Créneau disponible'}">${i < taken ? Art.cookie(KC.FLAVORS[i % KC.FLAVORS.length].colors, i % 2 ? 'epais' : 'plat', 'slot' + i) : ''}</span>`).join('');
    $('#stock-gauge').innerHTML = `
      <div class="slots" role="img" aria-label="${taken} commandes prises sur ${MAX} pour ${esc(day ? day.label : '')}">${slots}</div>
      <div class="stock-legend">
        <span>${taken} commande${taken > 1 ? 's' : ''} prise${taken > 1 ? 's' : ''}</span>
        <span class="left ${left === 0 ? 'none' : left <= 2 ? 'low' : ''}">${left === 0 ? 'Complet pour ce jour' : left <= 2 ? `Vite, plus que ${left} !` : `${left} créneaux disponibles`}</span>
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
  const F = KC.FLAVOR_BY_ID;

  /* ---- Photos : détectées automatiquement ----
     Si le fichier existe (ex. assets/photos/double-chocolat-epais.jpg), il remplace
     l'illustration. Sinon, l'illustration SVG reste. Rien d'autre à modifier. */
  const PHOTOS = Object.assign({ enabled: true, folder: 'assets/photos', extension: 'jpg' }, CFG.photos);
  const probeCache = new Map();
  function probe(url) {
    if (!probeCache.has(url)) {
      probeCache.set(url, new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img.naturalWidth > 0);
        img.onerror = () => resolve(false);
        img.src = url;
      }));
    }
    return probeCache.get(url);
  }
  function photoUrl(name) {
    return `${PHOTOS.folder}/${name}${/\.[a-z0-9]+$/i.test(name) ? '' : '.' + PHOTOS.extension}`;
  }
  /** Emplacement d'image : l'illustration de secours, remplacée par la photo si elle existe. */
  function photoSlot(name, fallback, alt, cls) {
    return `<span class="visual ${cls || ''}" data-photo="${esc(name)}" data-alt="${esc(alt || '')}">${fallback}</span>`;
  }
  function hydratePhotos(root) {
    if (!PHOTOS.enabled) return;
    $$('[data-photo]:not([data-photo-done])', root || document).forEach((el) => {
      el.setAttribute('data-photo-done', '');
      const url = photoUrl(el.dataset.photo);
      probe(url).then((ok) => {
        if (!ok || !el.isConnected) return;
        el.innerHTML = `<img src="${esc(url)}" alt="${esc(el.dataset.alt || '')}" loading="lazy">`;
        el.classList.add('has-photo');
      });
    });
  }

  function cookieVisual(p, texture) {
    return photoSlot(`${p.id}-${texture}`, Art.cookie(p.colors, texture, p.id), `Cookie ${p.name}, ${KC.TEXTURES[texture].label.toLowerCase()}`);
  }

  function stepperHTML(qty, label) {
    return `<div class="qty" role="group" aria-label="${esc(label || 'Quantité')}">
      <button type="button" data-step="-1" aria-label="Retirer un">−</button>
      <output aria-live="polite">${qty}</output>
      <button type="button" data-step="1" aria-label="Ajouter un">+</button>
    </div>`;
  }

  function textureRadios(name, prices, checked, short) {
    return `<fieldset class="texture-picker"><legend class="sr-only">Texture</legend>
      ${Object.values(KC.TEXTURES).map((t) => `
        <label class="texture-option">
          <input type="radio" name="${name}" value="${t.id}" ${t.id === checked ? 'checked' : ''}>
          <span>${short ? t.short : t.label}<small> · ${price(prices[t.id])}</small></span>
        </label>`).join('')}
    </fieldset>`;
  }

  function allergensHTML(list) {
    return `<details class="allergens"><summary>Allergènes</summary>${esc(list.join(', '))}. Atelier utilisant des fruits à coque.</details>`;
  }

  // Photos plein cadre : hero, présentation, bandeau
  function renderMedia() {
    // Sans photo, le fond bleu dégradé reste
    $('#hero-media').innerHTML = photoSlot('hero', '', 'Deux amis croquent dans des cookies KiCroque');
    $('#intro-mark').innerHTML = Art.cookie(F['chocolat-caramel'].colors, 'plat', 'mark');
    $('#intro-photo-1').innerHTML = photoSlot('intro-1', Art.cookie(F['double-chocolat'].colors, 'epais', 'i1'), 'Cookie épais');
    $('#intro-photo-2').innerHTML = photoSlot('intro-2', Art.cookie(F['vanille-pecan'].colors, 'plat', 'i2'), 'Cookie plat');
    $('#banner-media').innerHTML = photoSlot('atelier',
      `<div class="banner-pattern">${KC.FLAVORS.concat(KC.FLAVORS).map((f, i) => Art.cookie(f.colors, i % 2 ? 'epais' : 'plat', 'b' + i)).join('')}</div>`, 'Notre atelier');
    $('#dome-cookies').innerHTML = Art.cookie(F['double-chocolat'].colors, 'epais', 'd1') + Art.cookie(F['matcha-white'].colors, 'plat', 'd2');
  }

  // Un cookie de la rangée (saveur permanente ou recette de saison)
  function cookieCard(p, opts) {
    const o = opts || {};
    const prices = o.prices || { plat: KC.TEXTURES.plat.price, epais: KC.TEXTURES.epais.price };
    const tex = state.texture;
    return `<article class="product" id="${o.idPrefix || 'cookie'}-${p.id}" data-type="${o.type || 'cookie'}" data-id="${p.id}" style="--tint:${p.tint}">
      <div class="product-visual" data-art>${cookieVisual(p, tex)}${o.tag ? `<span class="tag">${esc(o.tag)}</span>` : ''}</div>
      <h3>${esc(p.name)}</h3>
      ${o.until ? `<p class="until">${esc(o.until)}</p>` : ''}
      <p class="price" data-price>${price(prices[tex])}</p>
      ${textureRadios(`tex-${o.idPrefix || 'cookie'}-${p.id}`, prices, tex, true)}
      <p class="desc">${esc(p.desc)}</p>
      <button class="add-btn" type="button" data-add>Ajouter au panier</button>
      ${allergensHTML(p.allergens)}
      ${SOLDOUT_HTML}
    </article>`;
  }

  function renderProducts() {
    $('#product-grid').innerHTML = KC.FLAVORS.map((f) => cookieCard(f)).join('');
  }

  // Coffrets : trois cartes, le Duo Textures au centre
  function boxArt(cookies) {
    return cookies.map(([p, t], i) => Art.cookie(p.colors, t, p.id + i)).join('');
  }

  function renderBoxes() {
    const [disc, six, duo] = ['decouverte', 'six-saveurs', 'duo-textures'].map((id) => KC.BOX_BY_ID[id]);
    const season = KC.currentSeasonRecipe(state.today);
    const discCookies = disc.contents.map((c) => [c.flavor === 'saison' ? (season || F['chocolat-caramel']) : F[c.flavor], c.texture]);

    const discHTML = `<article class="box" data-type="box" data-id="decouverte">
      <p class="box-label">4 cookies</p>
      <h3>${esc(disc.name)}</h3>
      <p class="box-desc">${esc(disc.desc)}</p>
      <ul class="box-contents">${discCookies.map(([p, t]) => `<li>${esc(p.name)} · ${KC.TEXTURES[t].short.toLowerCase()}</li>`).join('')}</ul>
      <p class="price" data-price>${price(disc.price)}</p>
      <button class="add-btn" type="button" data-add>Ajouter au panier</button>
      <div class="box-visual">${photoSlot('coffret-decouverte', boxArt(discCookies), disc.name, 'box-photo')}</div>
      ${SOLDOUT_HTML}
    </article>`;

    const defaults = ['double-chocolat', 'vanille-pecan', 'pistache-gianduja'];
    const duoHTML = `<article class="box featured" data-type="box" data-id="duo-textures" id="coffret-duo">
      <span class="box-ribbon">Plat vs épais · le plus demandé</span>
      <h3>${esc(duo.name)}</h3>
      <p class="box-desc">${esc(duo.desc)}</p>
      <fieldset class="option-group">
        <legend>Taille du coffret</legend>
        <div class="texture-picker">
          ${Object.entries(duo.sizes).map(([size, cfg], i) => `
            <label class="texture-option">
              <input type="radio" name="duo-size" value="${size}" ${i === 0 ? 'checked' : ''}>
              <span>${cfg.label} · ${cfg.count} cookies</span>
            </label>`).join('')}
        </div>
      </fieldset>
      <fieldset class="option-group" data-duo-flavors>
        <legend>Tes 3 saveurs</legend>
        <div class="flavor-chips">
          ${KC.FLAVORS.map((f) => `<label class="chip"><input type="checkbox" name="duo-flavor" value="${f.id}" ${defaults.includes(f.id) ? 'checked' : ''}><span>${esc(f.name)}</span></label>`).join('')}
        </div>
        <p class="pick-hint" data-pick-hint></p>
      </fieldset>
      <p class="price" data-price>${price(duo.sizes[3].price)}</p>
      <button class="add-btn" type="button" data-add>Ajouter au panier</button>
      <div class="box-visual">${photoSlot('coffret-duo-textures', boxArt([[F['chocolat-caramel'], 'plat'], [F['chocolat-caramel'], 'epais'], [F['matcha-white'], 'plat'], [F['matcha-white'], 'epais']]), duo.name, 'box-photo')}</div>
      ${SOLDOUT_HTML}
    </article>`;

    const sixHTML = `<article class="box" data-type="box" data-id="six-saveurs">
      <p class="box-label">6 cookies</p>
      <h3>${esc(six.name)}</h3>
      <p class="box-desc">${esc(six.desc)}</p>
      ${textureRadios('tex-box-six', six.prices, state.texture, true)}
      <p class="price" data-price>${price(six.prices[state.texture])}</p>
      <button class="add-btn" type="button" data-add>Ajouter au panier</button>
      <div class="box-visual" data-art>${sixArt(state.texture)}</div>
      ${SOLDOUT_HTML}
    </article>`;

    $('#box-grid').innerHTML = discHTML + duoHTML + sixHTML;
    updateDuoCard($('#coffret-duo'));
  }

  function sixArt(texture) {
    return photoSlot(`coffret-six-saveurs-${texture}`, boxArt(KC.FLAVORS.slice(0, 5).map((f) => [f, texture])), 'Coffret 6 saveurs', 'box-photo');
  }

  // Box signature : prochaine fête (ex. Noël) ou recette du moment
  function renderSignature() {
    const feat = KC.featuredSignature(state.today);
    const el = $('#signature-inner');
    if (!feat) { el.innerHTML = ''; return; }
    const r = feat.recipe;
    const box = KC.BOX_BY_ID.signature;
    const fmt = (iso) => KC.formatDateFr(iso, { day: 'numeric', month: 'long' });
    const title = `La box signature ${r.kind === 'event' ? 'de ' + r.label : 'd’' + r.label.toLowerCase()}`.replace('de Épiphanie', 'de l’Épiphanie').replace('de Halloween', 'd’Halloween').replace('de Pâques', 'de Pâques').replace('d’printemps', 'de printemps');
    const when = feat.available ? `Jusqu’au ${fmt(feat.period.end)}` : `Disponible du ${fmt(feat.period.start)} au ${fmt(feat.period.end)}`;
    el.innerHTML = `
      <svg class="sig-arc" viewBox="0 0 760 200" aria-hidden="true">
        <defs><path id="sig-curve" d="M70,200 A320,170 0 0,1 690,200"/></defs>
        <text><textPath href="#sig-curve" startOffset="50%" text-anchor="middle">${esc(title)}</textPath></text>
      </svg>
      <div class="sig-stage">
        <div class="sig-visual">${photoSlot(`box-signature-${r.id}`, `<div class="sig-cookies">${Art.cookie(r.colors, 'plat', r.id + 'a')}${Art.cookie(r.colors, 'epais', r.id + 'b')}${Art.cookie(r.colors, 'epais', r.id + 'c')}${Art.cookie(r.colors, 'plat', r.id + 'd')}</div>`, `Box signature ${r.label}`)}</div>
        <span class="sig-feature f1"><b aria-hidden="true">4</b>cookies</span>
        <span class="sig-feature f2"><b aria-hidden="true">★</b>Édition limitée</span>
        <span class="sig-feature f3"><b aria-hidden="true">2</b>plats</span>
        <span class="sig-feature f4"><b aria-hidden="true">2</b>épais</span>
      </div>
      <div class="sig-copy">
        <span class="sig-date">${esc(when)}</span>
        <h2 class="title-md" id="signature-title">${esc(r.name)}</h2>
        <p>${esc(r.desc)} Une box de 4 cookies : 2 plats croustillants et 2 épais moelleux, pour goûter la recette dans ses deux textures.</p>
        <div class="sig-actions sellable" data-type="box" data-id="signature" data-recipe="${r.id}" id="signature-box">
          <p class="price">${price(box.price)}</p>
          ${feat.available
            ? '<button class="btn btn-primary" type="button" data-add>Ajouter la box au panier</button>'
            : `<button class="btn btn-primary" type="button" disabled>Bientôt disponible</button>`}
        </div>
      </div>`;
    if (!feat.available) $('#signature-box').classList.remove('sellable');
  }

  function renderSeasonal() {
    const active = KC.activeSeasonal(state.today);
    const grid = $('#seasonal-grid');
    if (!active.length) {
      $('#now-title').hidden = true;
      grid.hidden = true;
    } else {
      grid.innerHTML = active.map((s) => {
        const period = KC.seasonalPeriod(s, state.today);
        return cookieCard(s, {
          type: 'seasonal', idPrefix: 'saison', prices: KC.SEASONAL_PRICES,
          tag: s.kind === 'event' ? s.label : 'Saison',
          until: `Jusqu’au ${KC.formatDateFr(period.end, { day: 'numeric', month: 'long' })}`,
        });
      }).join('');
    }
    const items = KC.SEASONAL.map((s) => ({ s, p: KC.seasonalPeriod(s, state.today) }))
      .sort((a, b) => (a.p.active === b.p.active ? (a.p.start < b.p.start ? -1 : 1) : a.p.active ? -1 : 1));
    const fmt = (iso) => KC.formatDateFr(iso, { day: 'numeric', month: 'short' });
    $('#seasonal-calendar').innerHTML = items.map(({ s, p }) => `
      <li class="cal-item ${p.active ? 'active' : ''}"><strong>${esc(s.label)}</strong><span>${esc(s.name)} · ${p.active ? 'jusqu’au ' + fmt(p.end) : 'dès le ' + fmt(p.start)}</span></li>`).join('');
  }

  // Avis vidéo et citations (js/config.js › reviews)
  function renderReviews() {
    const list = Array.isArray(CFG.reviews) ? CFG.reviews : [];
    const track = $('#reviews-track');
    if (!list.length) {
      const handle = esc(CFG.instagramHandle || '@kicroque');
      track.innerHTML = KC.FLAVORS.slice(0, 4).map((f, i) => `
        <div class="review review-empty">
          ${Art.cookie(f.colors, i % 2 ? 'epais' : 'plat', 'r' + i)}
          <strong>Ta vidéo ici</strong>
          <p>Filme ta dégustation et identifie ${handle}</p>
        </div>`).join('');
      track.insertAdjacentHTML('afterend', `<p class="reviews-cta">Les premiers avis arrivent avec les premières fournées. Partage ta vidéo avec <a data-instagram href="${esc(CFG.instagramUrl || '#')}" target="_blank" rel="noopener">${handle}</a> pour apparaître ici.</p>`);
      return;
    }
    track.innerHTML = list.map((r) => {
      if (r.type === 'video') {
        return `<figure class="review review-video">
          <video src="${esc(r.src)}" ${r.poster ? `poster="${esc(r.poster)}"` : ''} muted loop playsinline preload="metadata"></video>
          <button class="play" type="button" aria-label="Lire la vidéo de ${esc(r.handle || 'notre client')}">▶</button>
          ${r.handle ? `<figcaption class="review-handle">${esc(r.handle)}</figcaption>` : ''}
        </figure>`;
      }
      return `<figure class="review review-quote">
        <blockquote>“${esc(r.text)}”</blockquote>
        <figcaption><cite>${esc(r.author || '')}</cite></figcaption>
      </figure>`;
    }).join('');
    track.addEventListener('click', (e) => {
      const card = e.target.closest('.review-video');
      if (!card) return;
      const video = $('video', card);
      if (video.paused) { $$('video', track).forEach((v) => { if (v !== video) { v.pause(); v.closest('.review-video').classList.remove('playing'); } }); video.muted = false; video.play(); card.classList.add('playing'); }
      else { video.pause(); card.classList.remove('playing'); }
    });
  }

  /** Lit les options choisies sur une carte et construit l'article du panier. */
  function readCardItem(card) {
    const type = card.dataset.type;
    const id = card.dataset.id;
    const tex = $('input[type="radio"][name^="tex-"]:checked', card);
    if (type === 'cookie' || type === 'seasonal') return { type, id, texture: tex ? tex.value : 'plat' };
    if (id === 'decouverte') return { type: 'box', id };
    if (id === 'signature') return { type: 'box', id, recipe: card.dataset.recipe };
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

  /** Change la texture affichée sur une carte : l'image et le prix suivent. */
  function applyCardTexture(card, tex, animate) {
    const radio = $(`input[type="radio"][name^="tex-"][value="${tex}"]`, card);
    if (!radio) return;
    radio.checked = true;
    const art = $('[data-art]', card);
    if (card.dataset.id === 'six-saveurs') {
      art.innerHTML = sixArt(tex);
    } else {
      const p = KC.FLAVOR_BY_ID[card.dataset.id] || KC.SEASONAL_BY_ID[card.dataset.id];
      const tmp = document.createElement('div');
      tmp.innerHTML = cookieVisual(p, tex);
      const fresh = tmp.firstElementChild;
      if (animate) fresh.classList.add('swap');
      $('.visual', art).replaceWith(fresh);
    }
    hydratePhotos(card);
    updateCardPrice(card);
  }

  /** Texture pour toute la carte (sélecteur « Plat / Épais ») */
  function setTexture(tex) {
    if (!KC.TEXTURES[tex]) return;
    state.texture = tex;
    local.set('kc_texture', tex);
    $$('.texture-switch [data-set-texture]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.setTexture === tex)));
    $$('.product, .box[data-id="six-saveurs"]').forEach((card) => applyCardTexture(card, tex, true));
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
      hint.textContent = checked === size ? `${size} saveurs choisies, chacune en plat et en épais` : `Choisis encore ${size - checked} saveur${size - checked > 1 ? 's' : ''}`;
    }
    $('[data-price]', card).textContent = price(KC.BOX_BY_ID['duo-textures'].sizes[size].price);
  }

  // Flèches de la rangée de saveurs
  function bindCarousel() {
    $$('[data-carousel]').forEach((wrap) => {
      const row = $('.flavor-row', wrap);
      const prev = $('[data-carousel-prev]', wrap);
      const next = $('[data-carousel-next]', wrap);
      const update = () => {
        prev.disabled = row.scrollLeft < 8;
        next.disabled = row.scrollLeft + row.clientWidth > row.scrollWidth - 8;
      };
      const step = () => (row.firstElementChild ? row.firstElementChild.getBoundingClientRect().width + 18 : 240);
      prev.addEventListener('click', () => row.scrollBy({ left: -step(), behavior: 'smooth' }));
      next.addEventListener('click', () => row.scrollBy({ left: step(), behavior: 'smooth' }));
      row.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
    });
  }

  // Délégation d'événements pour toutes les cartes vendables
  function bindCards() {
    document.addEventListener('change', (e) => {
      const card = e.target.closest('.product, .box');
      if (!card) return;
      if (card.dataset.id === 'duo-textures') { updateDuoCard(card); return; }
      if (e.target.matches('input[type="radio"][name^="tex-"]')) applyCardTexture(card, e.target.value, true);
    });

    document.addEventListener('click', (e) => {
      const setter = e.target.closest('[data-set-texture]');
      if (setter) { setTexture(setter.dataset.setTexture); return; }
      const card = e.target.closest('.product, .box, #signature-box');
      if (!card) return;
      const step = e.target.closest('[data-step]');
      if (step) {
        const out = $('.qty output', card);
        out.textContent = Math.max(1, Math.min(KC.RULES.maxQtyPerLine, Number(out.textContent) + Number(step.dataset.step)));
        return;
      }
      if (e.target.closest('[data-add]')) {
        if (isFull(state.selectedDay)) { toast('Ce jour est complet, choisis un autre créneau', 'error'); return; }
        const item = readCardItem(card);
        try { KC.describeItem(item, state.today); } catch (err) { toast(err.message, 'error'); return; }
        const qtyEl = $('.qty output', card);
        addToCart(item, qtyEl ? Number(qtyEl.textContent) || 1 : 1);
        if (qtyEl) qtyEl.textContent = '1';
      }
    });
  }

  // Newsletter
  function bindNewsletter() {
    const formEl = $('#newsletter-form');
    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = formEl.elements.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { toast('Adresse e-mail invalide', 'error'); formEl.elements.email.focus(); return; }
      const btn = $('button', formEl);
      btn.disabled = true;
      try {
        if (DEMO) {
          local.set('kc_newsletter', email);
        } else {
          const res = await fetch(apiUrl('/newsletter'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || 'Inscription impossible.');
        }
        formEl.reset();
        toast('C’est noté ! Tu recevras nos recettes en avant-première.', 'success');
      } catch (err) {
        toast(err.message, 'error');
      } finally { btn.disabled = false; }
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
    toast(`${qty > 1 ? qty + ' × ' : ''}${d.name} ajouté au panier`, 'success');
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
    if (line.colors) return photoSlot(`${line.item.id}-${line.texture}`, Art.cookie(line.colors, line.texture, line.item.id), line.name);
    return Art.cookie((KC.FLAVORS[0]).colors, 'epais', line.item.id);
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
    const reason = t.freeReason === 'first-order' ? ' <small>· 1ʳᵉ commande</small>'
      : t.freeReason === 'threshold' ? ' <small>· dès 30 €</small>' : '';
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
    else if (t.freeReason === 'first-order' && t.subtotal < KC.RULES.freeShippingThreshold) prog.innerHTML = '<p>Livraison offerte : c’est ta première commande.</p>';
    else if (t.remainingForFree > 0) {
      const pct = Math.min(100, (t.subtotal / KC.RULES.freeShippingThreshold) * 100);
      prog.innerHTML = `<p>Plus que <strong>${price(t.remainingForFree)}</strong> pour la livraison offerte</p>
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>`;
    } else prog.innerHTML = '<p>Livraison offerte.</p><div class="progress-track"><div class="progress-fill" style="width:100%"></div></div>';

    const list = $('#cart-items');
    if (!t.lines.length) {
      list.innerHTML = `<li class="cart-empty">${Art.cookie(F['chocolat-caramel'].colors, 'epais', 'empty')}
        <p><strong>Ton panier est vide.</strong><br><span class="muted">Un petit cookie pour commencer ?</span></p>
        <a class="btn btn-primary" href="#cookies" data-close-cart>Voir les cookies</a></li>`;
      $('#cart-footer').hidden = true;
      return;
    }
    list.innerHTML = t.lines.map((l) => `
      <li class="cart-line" data-key="${esc(l.key)}">
        <div class="cart-thumb">${thumbHTML(l)}</div>
        <div>
          <p class="cart-name">${esc(l.name)}</p>
          <p class="cart-detail">${esc(l.detail)} · ${price(l.unit)} / u.</p>
        </div>
        <div class="cart-row">
          ${stepperHTML(l.qty, 'Quantité de ' + l.name)}
          <button class="link-btn" type="button" data-remove>Retirer</button>
          <p class="cart-line-total">${price(l.total)}</p>
        </div>
      </li>`).join('');
    hydratePhotos(list);
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
        <span>
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
        <span>
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
    if (!state.cart.length) { toast('Ton panier est vide'); return; }
    if (state.days.every((d) => isFull(d.iso))) { toast('Tous les créneaux sont complets, désolé', 'error'); return; }
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
    if (!deliveryDate) { toast('Choisis un jour de livraison', 'error'); return; }
    if (!shippingMethod) { toast('Choisis un mode de livraison', 'error'); return; }
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
        toast('Le paiement n’a pas abouti. Ton panier t’attend toujours.', 'error');
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
    $('#confirm-text').textContent = 'Ta commande est confirmée. On s’occupe de tout.';
    $('#confirm-icon').innerHTML = Art.cookie(F['chocolat-caramel'].colors, 'epais', 'confirm');
    $('#confirm-number').textContent = o.orderNumber || 'KC-?????';
    const ship = KC.SHIPPING[o.shippingMethod];
    $('#confirm-details').innerHTML = [
      o.deliveryDate ? ['Livraison', KC.formatDateFr(o.deliveryDate, { weekday: 'long', day: 'numeric', month: 'long' })] : null,
      ship ? ['Mode', ship.label] : null,
      o.total != null ? ['Total payé', price(o.total)] : null,
    ].filter(Boolean).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
    const conf = $('#confirm-modal .confetti');
    const colors = ['#3A93DD', '#12355B', '#F5EBE0', '#D6E9F8', '#C68A4E'];
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
    $('#top-banner').hidden = state.firstOrderDone;
  }

  function bindChrome() {
    $('#stock-days').addEventListener('click', (e) => {
      const tab = e.target.closest('[data-day]');
      if (tab) selectDay(tab.dataset.day);
    });
    const header = $('#site-header');
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (CFG.contactEmail) $$('[data-contact-email]').forEach((a) => { a.href = 'mailto:' + CFG.contactEmail; a.textContent = CFG.contactEmail; });
    if (CFG.instagramUrl) $$('.site-footer [data-instagram]').forEach((a) => { a.href = CFG.instagramUrl; a.textContent = 'Instagram ' + (CFG.instagramHandle || ''); });
    $$('[data-year]').forEach((el) => { el.textContent = KC.parisParts(new Date()).iso.slice(0, 4); });
  }

  /* ======================================================================
     7. Démarrage
     ====================================================================== */
  async function init() {
    bindChrome();
    loadCart();
    renderBanner();
    renderMedia();
    renderProducts();
    renderBoxes();
    renderSignature();
    renderSeasonal();
    renderReviews();
    setTexture(state.texture);
    hydratePhotos();
    bindCarousel();
    bindNewsletter();
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
