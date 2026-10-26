/* ==========================================================================
   KiCroque — illustrations de cookies générées en SVG
   --------------------------------------------------------------------------
   En attendant les vraies photos : chaque saveur est dessinée à partir de ses
   couleurs (pâte, pépites, garniture). Le dessin est « figé » par saveur
   (même graine = même cookie), et change selon la texture :
     • plat  : large, fin, bord doré, petites pépites
     • épais : bombé, avec une tranche visible, gros morceaux et cœur garni
   Pour passer aux photos : remplacez l'appel KCArt.cookie(...) dans app.js
   par une balise <img>.
   ========================================================================== */
(function (root) {
  'use strict';

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  // Petit générateur pseudo-aléatoire déterministe (mulberry32)
  function rng(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Éclaircit (amt > 0) ou fonce (amt < 0) une couleur hexadécimale
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const ch = [n >> 16, (n >> 8) & 255, n & 255].map((c) =>
      Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt))));
    return '#' + ch.map((c) => c.toString(16).padStart(2, '0')).join('');
  }

  // Forme organique fermée et lissée autour d'un centre
  function blobPath(cx, cy, r, rand, opts) {
    const o = Object.assign({ points: 14, wobble: 0.05, squash: 1 }, opts);
    const pts = [];
    for (let i = 0; i < o.points; i++) {
      const a = (i / o.points) * Math.PI * 2;
      const rr = r * (1 + (rand() - 0.5) * 2 * o.wobble);
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * o.squash]);
    }
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    let d = '';
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length];
      const m = mid(p, q);
      if (i === 0) { const m0 = mid(pts[pts.length - 1], p); d += `M${m0[0].toFixed(1)},${m0[1].toFixed(1)}`; }
      d += `Q${p[0].toFixed(1)},${p[1].toFixed(1)} ${m[0].toFixed(1)},${m[1].toFixed(1)}`;
    }
    return d + 'Z';
  }

  function scatter(rand, n, maxR, cx, cy, squash, draw) {
    let out = '';
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * maxR;
      out += draw(cx + Math.cos(a) * d, cy + Math.sin(a) * d * squash, i);
    }
    return out;
  }

  /**
   * @param {{dough:string, chip:string, filling?:string}} colors
   * @param {'plat'|'epais'} texture
   * @param {string} seedKey  identifiant stable (ex. l'id de la saveur)
   */
  function cookie(colors, texture, seedKey) {
    const rand = rng(hash(String(seedKey) + texture));
    const dough = colors.dough, chip = colors.chip;
    const chipStroke = shade(chip, -0.3);
    let body = '';

    if (texture === 'epais') {
      const sq = 0.86;
      body += `<ellipse cx="60" cy="104" rx="40" ry="7" fill="#000" opacity=".14"/>`;
      body += `<path d="${blobPath(60, 70, 43, rand, { squash: sq, wobble: 0.06 })}" fill="${shade(dough, -0.28)}"/>`;
      body += `<path d="${blobPath(60, 58, 43, rand, { squash: sq, wobble: 0.07 })}" fill="${dough}"/>`;
      body += `<path d="${blobPath(52, 50, 26, rand, { squash: sq, wobble: 0.1 })}" fill="${shade(dough, 0.12)}" opacity=".55"/>`;
      if (colors.filling) {
        body += `<path d="${blobPath(64, 60, 11, rand, { points: 9, wobble: 0.22, squash: 0.8 })}" fill="${colors.filling}" stroke="${shade(colors.filling, -0.25)}" stroke-width="1"/>`;
        body += `<ellipse cx="61" cy="57" rx="3.5" ry="2" fill="#fff" opacity=".5"/>`;
      }
      body += scatter(rand, 9, 34, 60, 58, sq, (x, y) =>
        `<path d="${blobPath(x, y, 4.2 + rand() * 2.8, rand, { points: 6, wobble: 0.3 })}" fill="${chip}" stroke="${chipStroke}" stroke-width=".8"/>`);
    } else {
      const sq = 0.9;
      body += `<ellipse cx="60" cy="100" rx="46" ry="6" fill="#000" opacity=".12"/>`;
      body += `<path d="${blobPath(60, 61, 50, rand, { squash: sq, wobble: 0.045, points: 18 })}" fill="${shade(dough, -0.22)}"/>`;
      body += `<path d="${blobPath(60, 58, 50, rand, { squash: sq, wobble: 0.045, points: 18 })}" fill="${shade(dough, -0.08)}"/>`;
      body += `<path d="${blobPath(60, 58, 41, rand, { squash: sq, wobble: 0.06 })}" fill="${dough}"/>`;
      // petites craquelures du croustillant
      body += scatter(rand, 5, 30, 60, 58, sq, (x, y) =>
        `<path d="M${x.toFixed(1)},${y.toFixed(1)} q${(rand() * 8 - 4).toFixed(1)},${(rand() * 4 - 2).toFixed(1)} ${(rand() * 12 - 6).toFixed(1)},${(rand() * 6 - 3).toFixed(1)}" stroke="${shade(dough, -0.25)}" stroke-width="1" fill="none" stroke-linecap="round" opacity=".6"/>`);
      body += scatter(rand, 14, 40, 60, 58, sq, (x, y) =>
        `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(2.4 + rand() * 1.8).toFixed(1)}" ry="${(2 + rand() * 1.4).toFixed(1)}" fill="${chip}" stroke="${chipStroke}" stroke-width=".6"/>`);
    }
    body += `<ellipse cx="44" cy="40" rx="9" ry="4" fill="#fff" opacity=".18" transform="rotate(-25 44 40)"/>`;
    return `<svg class="cookie-svg" viewBox="0 0 120 120" aria-hidden="true" focusable="false">${body}</svg>`;
  }

  root.KCArt = { cookie, shade };
})(typeof self !== 'undefined' ? self : this);
