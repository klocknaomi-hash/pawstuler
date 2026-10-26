/* ==========================================================================
   KiCroque — catalogue, règles business et calculs PARTAGÉS
   --------------------------------------------------------------------------
   Ce fichier est chargé à la fois :
     • par le navigateur (window.KC)            → affichage, panier, estimations
     • par les fonctions serveur (require)       → prix réels, validation, Stripe
   Le serveur ne fait JAMAIS confiance aux prix envoyés par le navigateur :
   il recalcule tout à partir de ce catalogue.
   Pour modifier un prix, une saveur ou une recette de saison : c'est ici.
   ========================================================================== */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KC = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const TIMEZONE = 'Europe/Paris';

  /* ---------- Règles business ---------- */
  const RULES = {
    maxOrdersPerDay: 8,          // 8 commandes maximum par jour de vente
    deliveryWeekdays: [5, 6],    // 5 = vendredi, 6 = samedi (0 = dimanche)
    sameDayCutoffHour: 12,       // commander pour le jour même : avant midi (heure de Paris)
    deliveryDaysShown: 2,        // nombre de jours de vente proposés à la réservation
    freeShippingThreshold: 30,   // livraison gratuite dès 30 € de sous-total
    firstOrderFreeShipping: true,
    maxQtyPerLine: 24,
    minCookiesPerOrder: 4,       // pas de commande à 1 cookie : 4 cookies minimum (coffrets compris)
  };

  /* ---------- Textures (communes à toutes les saveurs) ---------- */
  const TEXTURES = {
    plat: { id: 'plat', label: 'Plat croustillant', short: 'Plat', price: 3.5, desc: 'Fin, doré, qui croque' },
    epais: { id: 'epais', label: 'Épais moelleux garni', short: 'Épais', price: 4.5, desc: 'Généreux, cœur fondant' },
  };

  /* ---------- Livraison ---------- */
  const SHIPPING = {
    stuart: {
      id: 'stuart', label: 'Stuart', emoji: '🛵', price: 5.9,
      zone: 'Paris & petite couronne',
      delay: 'Livré le jour même par coursier',
      // Codes postaux couverts (préfixes). Ajoutez '77', '78', '91', '95' si Stuart les couvre pour vous.
      postcodePrefixes: ['75', '92', '93', '94'],
    },
    colissimo: {
      id: 'colissimo', label: 'Colissimo', emoji: '📦', price: 7.5,
      zone: 'France entière',
      delay: 'Expédié le jour choisi, livré en 48 h',
      postcodePrefixes: null,
    },
  };

  /* ---------- Les 6 saveurs permanentes ---------- */
  // colors : utilisées pour dessiner le cookie (pâte, pépites, garniture) et teinter la carte.
  const ALLERGENS_BASE = ['gluten', 'lait', 'œufs'];
  const FLAVORS = [
    {
      id: 'double-chocolat', name: 'Double Chocolat', emoji: '🍫',
      desc: 'Pâte au cacao, pépites de chocolat noir et au lait. Le grand classique, en plus intense.',
      allergens: [...ALLERGENS_BASE, 'soja'],
      colors: { dough: '#6B3F27', chip: '#2B160C', filling: '#3E2114' }, tint: '#F3DCCB',
    },
    {
      id: 'chocolat-caramel', name: 'Chocolat Caramel', emoji: '🍯',
      desc: 'Chocolat au lait et caramel au beurre salé maison qui file à chaque bouchée.',
      allergens: [...ALLERGENS_BASE, 'soja'],
      colors: { dough: '#C68A4E', chip: '#4B2A17', filling: '#E3A33B' }, tint: '#FBE3C4',
    },
    {
      id: 'vanille-pecan', name: 'Vanille Pécan', emoji: '🤍',
      desc: 'Vanille de Madagascar et noix de pécan torréfiées. Doux, beurré, réconfortant.',
      allergens: [...ALLERGENS_BASE, 'fruits à coque (pécan)'],
      colors: { dough: '#E8C88E', chip: '#8B5A32', filling: '#FFF4DC' }, tint: '#FBF0DA',
    },
    {
      id: 'speculoos-cream', name: 'Spéculoos Cream', emoji: '🌸',
      desc: 'Biscuit spéculoos émietté et crème onctueuse au cœur. Saveur épicée de goûter.',
      allergens: [...ALLERGENS_BASE, 'soja'],
      colors: { dough: '#B9773F', chip: '#F5E6CC', filling: '#F7EAD3' }, tint: '#F9DCE4',
    },
    {
      id: 'matcha-white', name: 'Matcha White', emoji: '🍵',
      desc: 'Matcha japonais et gros morceaux de chocolat blanc fondant. Frais et gourmand.',
      allergens: [...ALLERGENS_BASE, 'soja'],
      colors: { dough: '#A3BE6E', chip: '#FFF8EA', filling: '#FFFDF5' }, tint: '#E2EFCF',
    },
    {
      id: 'pistache-gianduja', name: 'Pistache Gianduja', emoji: '💚',
      desc: 'Pistache de Sicile et gianduja noisette. Notre chouchou, croquant et fondant.',
      allergens: [...ALLERGENS_BASE, 'fruits à coque (pistache, noisette)'],
      colors: { dough: '#BFC478', chip: '#6B4428', filling: '#8BB04A' }, tint: '#E5EECB',
    },
  ];

  /* ---------- Recettes signature : saisons & événements ---------- */
  // window.from / window.to : 'MM-JJ' (bornes incluses, peut passer d'une année à l'autre)
  // window.easter : [début, fin] en jours relatifs au dimanche de Pâques (date calculée)
  // Elles existent aussi dans les 2 textures, au prix SEASONAL_PRICES.
  const SEASONAL_PRICES = { plat: 4.0, epais: 5.0 };
  const SEASONAL = [
    {
      id: 'automne-cannelle', kind: 'season', label: 'Automne', name: 'Cannelle Pomme Crumble', emoji: '🍂',
      desc: 'Cannelle de Ceylan, pomme caramélisée et éclats de crumble. L’automne en un cookie.',
      window: { from: '09-22', to: '12-20' }, allergens: [...ALLERGENS_BASE],
      colors: { dough: '#C9894B', chip: '#7A3E1D', filling: '#E7B26A' }, tint: '#F6D9BC',
    },
    {
      id: 'hiver-coco', kind: 'season', label: 'Hiver', name: 'Flocon Coco', emoji: '❄️',
      desc: 'Noix de coco râpée comme de la neige, chocolat blanc et une pointe de vanille.',
      window: { from: '12-21', to: '03-19' }, allergens: [...ALLERGENS_BASE, 'soja'],
      colors: { dough: '#E6D3B3', chip: '#FFFFFF', filling: '#F4EEE4' }, tint: '#E3EEF8',
    },
    {
      id: 'printemps-fraise', kind: 'season', label: 'Printemps', name: 'Fraise Rhubarbe', emoji: '🌷',
      desc: 'Fraises séchées, compotée de rhubarbe et chocolat blanc. Acidulé et fleuri.',
      window: { from: '03-20', to: '06-20' }, allergens: [...ALLERGENS_BASE, 'soja'],
      colors: { dough: '#EBC6A4', chip: '#E05C79', filling: '#F6A5B5' }, tint: '#FBDDE4',
    },
    {
      id: 'ete-citron', kind: 'season', label: 'Été', name: 'Citron Yuzu', emoji: '☀️',
      desc: 'Zestes de citron, crème de yuzu et chocolat blanc. Le cookie qui sent les vacances.',
      window: { from: '06-21', to: '09-21' }, allergens: [...ALLERGENS_BASE, 'soja'],
      colors: { dough: '#F1D27A', chip: '#FFF6D6', filling: '#F7E04B' }, tint: '#FCF1C4',
    },
    {
      id: 'halloween', kind: 'event', label: 'Halloween', name: 'Citrouille Épices', emoji: '🎃',
      desc: 'Purée de potiron rôti, épices à pumpkin pie et pépites de chocolat noir.',
      window: { from: '10-15', to: '10-31' }, allergens: [...ALLERGENS_BASE, 'soja'],
      colors: { dough: '#E08A3C', chip: '#3A2416', filling: '#F2A65A' }, tint: '#FAD6B5',
    },
    {
      id: 'noel', kind: 'event', label: 'Noël', name: 'Pain d’épices Orange', emoji: '🎄',
      desc: 'Épices de Noël, miel, écorces d’orange confites et chocolat noir.',
      window: { from: '12-01', to: '12-24' }, allergens: [...ALLERGENS_BASE, 'soja'],
      colors: { dough: '#A8642F', chip: '#F08A24', filling: '#5A2F17' }, tint: '#F4D6C2',
    },
    {
      id: 'epiphanie', kind: 'event', label: 'Épiphanie', name: 'Frangipane des Rois', emoji: '👑',
      desc: 'Crème d’amande façon galette, feuilletage caramélisé. Une fève cachée dans un coffret ?',
      window: { from: '01-02', to: '01-31' }, allergens: [...ALLERGENS_BASE, 'fruits à coque (amande)'],
      colors: { dough: '#E6C27F', chip: '#C99A4A', filling: '#F3DDA6' }, tint: '#F8EBC8',
    },
    {
      id: 'saint-valentin', kind: 'event', label: 'Saint-Valentin', name: 'Framboise Cœur Rubis', emoji: '💘',
      desc: 'Framboise, chocolat rubis et un cœur coulant. À partager… ou pas.',
      window: { from: '02-01', to: '02-14' }, allergens: [...ALLERGENS_BASE, 'soja'],
      colors: { dough: '#E8B9A9', chip: '#C21E4B', filling: '#F06A8A' }, tint: '#F9D3DC',
    },
    {
      id: 'paques', kind: 'event', label: 'Pâques', name: 'Praliné Œuf Coulant', emoji: '🐣',
      desc: 'Praliné noisette, petits œufs en chocolat et un cœur coulant au praliné.',
      window: { easter: [-14, 1] }, allergens: [...ALLERGENS_BASE, 'fruits à coque (noisette)', 'soja'],
      colors: { dough: '#B88352', chip: '#5A341C', filling: '#D6A15E' }, tint: '#F2E0C8',
    },
  ];

  /* ---------- Coffrets ---------- */
  const BOXES = [
    {
      id: 'decouverte', name: 'Coffret Découverte', emoji: '🎁',
      tagline: 'Le premier pas parfait',
      desc: '4 cookies pour tout goûter : 2 plats, 2 épais, dont la recette signature du moment.',
      price: 14.9,
      // 'saison' = la recette de saison active au moment de la commande
      contents: [
        { flavor: 'double-chocolat', texture: 'epais' },
        { flavor: 'vanille-pecan', texture: 'plat' },
        { flavor: 'pistache-gianduja', texture: 'epais' },
        { flavor: 'saison', texture: 'plat' },
      ],
    },
    {
      id: 'six-saveurs', name: 'Coffret 6 Saveurs', emoji: '🌈',
      tagline: 'Toute la gamme',
      desc: 'Les 6 saveurs permanentes réunies, dans la texture de votre choix.',
      prices: { plat: 19, epais: 24 },
    },
    {
      // Box signature : 4 cookies de la recette de saison ou d'événement (2 plats + 2 épais).
      // La recette est choisie automatiquement (voir featuredSignature).
      id: 'signature', name: 'Box signature', emoji: '✨',
      tagline: 'L’édition du moment',
      desc: '4 cookies de la recette signature, 2 plats croustillants et 2 épais moelleux.',
      price: 17,
    },
    {
      id: 'duo-textures', name: 'Coffret Duo Textures', emoji: '⚖️', featured: true,
      tagline: 'Le match : plat vs épais',
      desc: 'Chaque saveur en version plat croustillant ET épais moelleux. Goûtez, comparez, votez !',
      sizes: {
        3: { label: '3 saveurs', count: 6, price: 21 },
        6: { label: '6 saveurs', count: 12, price: 39 },
      },
    },
  ];

  const FLAVOR_BY_ID = Object.fromEntries(FLAVORS.map((f) => [f.id, f]));
  const SEASONAL_BY_ID = Object.fromEntries(SEASONAL.map((s) => [s.id, s]));
  const BOX_BY_ID = Object.fromEntries(BOXES.map((b) => [b.id, b]));

  /* ======================================================================
     Dates (toujours en heure de Paris)
     ====================================================================== */
  function pad(n) { return String(n).padStart(2, '0'); }

  /** Date du jour et heure à Paris : { iso: 'AAAA-MM-JJ', hour } */
  function parisParts(date) {
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
    });
    const p = {};
    fmt.formatToParts(date || new Date()).forEach((part) => { p[part.type] = part.value; });
    return { iso: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) };
  }

  function isoToUTC(iso) { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); }
  function utcToIso(dt) { return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`; }
  function addDays(iso, n) { const dt = isoToUTC(iso); dt.setUTCDate(dt.getUTCDate() + n); return utcToIso(dt); }
  function weekdayOf(iso) { return isoToUTC(iso).getUTCDay(); }

  function formatDateFr(iso, opts) {
    return isoToUTC(iso).toLocaleDateString('fr-FR', Object.assign({ timeZone: 'UTC' }, opts || { day: 'numeric', month: 'long' }));
  }

  /** Dimanche de Pâques (algorithme grégorien anonyme) */
  function easterDate(year) {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
    return `${year}-${pad(month)}-${pad(day)}`;
  }

  /**
   * Période d'une recette de saison qui contient `iso` ou, sinon, la prochaine.
   * Retourne { start, end, active }.
   */
  function seasonalPeriod(item, iso) {
    const year = Number(iso.slice(0, 4));
    const w = item.window;
    const candidates = [];
    for (const y of [year - 1, year, year + 1]) {
      if (w.easter) {
        const e = easterDate(y);
        candidates.push({ start: addDays(e, w.easter[0]), end: addDays(e, w.easter[1]) });
      } else {
        const wraps = w.from > w.to;
        candidates.push({ start: `${y}-${w.from}`, end: `${wraps ? y + 1 : y}-${w.to}` });
      }
    }
    const current = candidates.find((c) => c.start <= iso && iso <= c.end);
    if (current) return Object.assign({ active: true }, current);
    const next = candidates.filter((c) => c.start > iso).sort((a, b) => (a.start < b.start ? -1 : 1))[0];
    return Object.assign({ active: false }, next);
  }

  function isSeasonalActive(item, iso) { return seasonalPeriod(item, iso).active; }

  /**
   * Recette mise en avant dans la « Box signature » :
   *   1. l'événement en cours (sauf s'il se termine dans moins de 7 jours et qu'un autre arrive),
   *   2. sinon le prochain événement s'il commence dans moins de 45 jours (ex. Noël annoncé dès fin octobre),
   *   3. sinon la recette de saison.
   * Retourne { recipe, period, available } — available = commandable aujourd'hui.
   */
  function featuredSignature(iso) {
    const withPeriod = SEASONAL.map((s) => ({ recipe: s, period: seasonalPeriod(s, iso) }));
    const upcoming = withPeriod
      .filter((x) => x.recipe.kind === 'event' && !x.period.active && x.period.start <= addDays(iso, 45))
      .sort((a, b) => (a.period.start < b.period.start ? -1 : 1))[0];
    const activeEvent = withPeriod.find((x) => x.recipe.kind === 'event' && x.period.active);
    const season = withPeriod.find((x) => x.recipe.kind === 'season' && x.period.active);
    const endingSoon = activeEvent && activeEvent.period.end < addDays(iso, 7);
    const pick = (activeEvent && !(endingSoon && upcoming)) ? activeEvent : (upcoming || activeEvent || season);
    return pick ? Object.assign({ available: pick.period.active }, pick) : null;
  }
  function activeSeasonal(iso) { return SEASONAL.filter((s) => isSeasonalActive(s, iso)); }
  /** La recette de SAISON (pas événement) active, utilisée dans le coffret Découverte */
  function currentSeasonRecipe(iso) { return SEASONAL.find((s) => s.kind === 'season' && isSeasonalActive(s, iso)) || null; }

  /**
   * Prochains jours de vente (vendredi / samedi).
   * Le jour même n'est proposé que si on est avant l'heure limite.
   */
  function getDeliveryDays(now, count) {
    const p = parisParts(now || new Date());
    const out = [];
    for (let i = 0; out.length < (count || RULES.deliveryDaysShown) && i < 21; i++) {
      const iso = addDays(p.iso, i);
      if (!RULES.deliveryWeekdays.includes(weekdayOf(iso))) continue;
      if (i === 0 && p.hour >= RULES.sameDayCutoffHour) continue;
      out.push({
        iso,
        isToday: i === 0,
        label: formatDateFr(iso, { weekday: 'long', day: 'numeric', month: 'long' }),
        short: formatDateFr(iso, { weekday: 'short', day: 'numeric', month: 'short' }),
      });
    }
    return out;
  }

  /* ======================================================================
     Panier : description, prix et totaux
     ====================================================================== */
  function userError(message) { const e = new Error(message); e.isUserError = true; return e; }

  /** Clé unique d'une ligne de panier (même produit + mêmes options = même ligne) */
  function lineKey(item) {
    return [item.type, item.id, item.texture || '', item.size || '', (item.flavors || []).slice().sort().join('+'), item.recipe || ''].join('|');
  }

  /**
   * Décrit un article du panier et donne son prix unitaire.
   * Lève une erreur « utilisateur » si l'article n'est pas valide ou plus disponible.
   */
  function describeItem(item, iso) {
    if (!item || typeof item !== 'object') throw userError('Article invalide.');
    const texture = TEXTURES[item.texture];

    if (item.type === 'cookie') {
      const f = FLAVOR_BY_ID[item.id];
      if (!f || !texture) throw userError('Cookie inconnu.');
      return {
        item: { type: 'cookie', id: f.id, texture: texture.id },
        name: f.name, emoji: f.emoji, detail: texture.label, unit: texture.price,
        colors: f.colors, texture: texture.id, cookies: 1,
      };
    }

    if (item.type === 'seasonal') {
      const s = SEASONAL_BY_ID[item.id];
      if (!s || !texture) throw userError('Recette inconnue.');
      if (!isSeasonalActive(s, iso)) throw userError(`${s.name} n’est plus disponible.`);
      return {
        item: { type: 'seasonal', id: s.id, texture: texture.id },
        name: s.name, emoji: s.emoji,
        detail: `${texture.label} · ${s.kind === 'event' ? 'Édition ' + s.label : 'Recette de saison · ' + s.label}`,
        unit: SEASONAL_PRICES[texture.id], colors: s.colors, texture: texture.id, cookies: 1,
      };
    }

    if (item.type === 'box') {
      const b = BOX_BY_ID[item.id];
      if (!b) throw userError('Coffret inconnu.');

      if (b.id === 'decouverte') {
        const season = currentSeasonRecipe(iso);
        return {
          item: { type: 'box', id: b.id },
          name: b.name, emoji: b.emoji, unit: b.price, box: true, cookies: b.contents.length,
          detail: `4 cookies · ${b.contents.map((c) => (c.flavor === 'saison' ? (season ? season.name : 'Recette du moment') : FLAVOR_BY_ID[c.flavor].name)).join(', ')}`,
        };
      }

      if (b.id === 'signature') {
        const s = SEASONAL_BY_ID[item.recipe];
        if (!s) throw userError('Recette inconnue.');
        if (!isSeasonalActive(s, iso)) throw userError(`La box ${s.label} n’est pas encore disponible.`);
        return {
          item: { type: 'box', id: b.id, recipe: s.id },
          name: `Box signature ${s.label}`, emoji: s.emoji, unit: b.price, box: true, cookies: 4,
          detail: `4 cookies ${s.name} · 2 plats + 2 épais`, colors: s.colors,
        };
      }

      if (b.id === 'six-saveurs') {
        if (!texture) throw userError('Choisissez une texture.');
        return {
          item: { type: 'box', id: b.id, texture: texture.id },
          name: b.name, emoji: b.emoji, unit: b.prices[texture.id], box: true, cookies: 6,
          detail: `6 cookies · ${texture.label}`, texture: texture.id,
        };
      }

      if (b.id === 'duo-textures') {
        const size = Number(item.size);
        const cfg = b.sizes[size];
        if (!cfg) throw userError('Taille de coffret invalide.');
        let flavors;
        if (size === FLAVORS.length) {
          flavors = FLAVORS.map((f) => f.id);
        } else {
          flavors = Array.from(new Set(Array.isArray(item.flavors) ? item.flavors : [])).filter((id) => FLAVOR_BY_ID[id]);
          if (flavors.length !== size) throw userError(`Choisissez exactement ${size} saveurs.`);
        }
        flavors.sort();
        return {
          item: size === FLAVORS.length ? { type: 'box', id: b.id, size } : { type: 'box', id: b.id, size, flavors },
          name: `${b.name} · ${cfg.label}`, emoji: b.emoji, unit: cfg.price, box: true, cookies: cfg.count,
          detail: `${cfg.count} cookies (plat + épais) · ${size === FLAVORS.length ? 'toutes les saveurs' : flavors.map((id) => FLAVOR_BY_ID[id].name).join(', ')}`,
        };
      }
    }
    throw userError('Article invalide.');
  }

  function round2(n) { return Math.round(n * 100) / 100; }

  function clampQty(q) {
    const n = Math.floor(Number(q));
    if (!Number.isFinite(n) || n < 1) return 0;
    return Math.min(n, RULES.maxQtyPerLine);
  }

  /**
   * Calcule le panier complet.
   * items : [{ ...article, qty }] — shippingMethod : 'stuart' | 'colissimo' | null
   */
  function computeTotals({ items, shippingMethod, firstOrder, iso }) {
    const lines = [];
    (Array.isArray(items) ? items : []).forEach((raw) => {
      const qty = clampQty(raw && raw.qty);
      if (!qty) return;
      const d = describeItem(raw, iso);
      lines.push(Object.assign({}, d, { key: lineKey(d.item), qty, total: round2(d.unit * qty) }));
    });
    const subtotal = round2(lines.reduce((s, l) => s + l.total, 0));
    const method = SHIPPING[shippingMethod] || null;
    const shippingBase = method ? method.price : SHIPPING.stuart.price;
    let freeReason = null;
    if (subtotal >= RULES.freeShippingThreshold) freeReason = 'threshold';
    else if (firstOrder && RULES.firstOrderFreeShipping) freeReason = 'first-order';
    const shipping = lines.length && !freeReason ? shippingBase : 0;
    const cookieCount = lines.reduce((s, l) => s + l.qty * (l.cookies || 1), 0);
    return {
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      cookieCount,
      cookiesMissing: Math.max(0, RULES.minCookiesPerOrder - cookieCount),
      subtotal,
      shippingBase,
      shipping,
      shippingDiscount: lines.length && freeReason ? shippingBase : 0,
      freeReason,
      remainingForFree: round2(Math.max(0, RULES.freeShippingThreshold - subtotal)),
      total: round2(subtotal + shipping),
    };
  }

  function isStuartEligible(postcode) {
    const pc = String(postcode || '').trim();
    return /^\d{5}$/.test(pc) && SHIPPING.stuart.postcodePrefixes.some((p) => pc.startsWith(p));
  }

  /* ======================================================================
     Formulaire client
     ====================================================================== */
  function validateCustomer(c) {
    const v = {};
    const errors = {};
    const s = (k, max) => String((c && c[k]) || '').trim().slice(0, max);
    v.firstName = s('firstName', 50);
    v.lastName = s('lastName', 50);
    v.email = s('email', 120).toLowerCase();
    v.phone = s('phone', 20).replace(/[\s.\-()]/g, '');
    v.address = s('address', 140);
    v.address2 = s('address2', 140);
    v.postcode = s('postcode', 5);
    v.city = s('city', 60);
    v.notes = s('notes', 300);

    if (!v.firstName) errors.firstName = 'Ton prénom, s’il te plaît.';
    if (!v.lastName) errors.lastName = 'Ton nom, s’il te plaît.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) errors.email = 'Adresse e-mail invalide.';
    if (!/^(?:\+33|0033|0)[1-9]\d{8}$/.test(v.phone)) errors.phone = 'Numéro de téléphone français invalide.';
    if (v.address.length < 5) errors.address = 'Adresse de livraison incomplète.';
    if (!/^\d{5}$/.test(v.postcode)) errors.postcode = 'Code postal à 5 chiffres.';
    if (!v.city) errors.city = 'Ta ville, s’il te plaît.';
    return { ok: Object.keys(errors).length === 0, errors, value: v };
  }

  /* ======================================================================
     Divers
     ====================================================================== */
  function formatPrice(n) {
    return Number(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  }

  /** Numéro de commande KC-XXXXX (sans 0/O/1/I pour éviter les confusions) */
  const ORDER_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  function generateOrderNumber(randomInt) {
    const rnd = randomInt || ((max) => Math.floor(Math.random() * max));
    let s = 'KC-';
    for (let i = 0; i < 5; i++) s += ORDER_ALPHABET[rnd(ORDER_ALPHABET.length)];
    return s;
  }

  return {
    TIMEZONE, RULES, TEXTURES, SHIPPING, FLAVORS, SEASONAL, SEASONAL_PRICES, BOXES,
    FLAVOR_BY_ID, SEASONAL_BY_ID, BOX_BY_ID,
    parisParts, addDays, weekdayOf, formatDateFr, easterDate,
    seasonalPeriod, isSeasonalActive, activeSeasonal, featuredSignature, currentSeasonRecipe, getDeliveryDays,
    lineKey, describeItem, computeTotals, isStuartEligible, validateCustomer,
    formatPrice, generateOrderNumber, round2,
  };
});
