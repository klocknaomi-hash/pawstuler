/* ==========================================================================
   KiCroque — illustrations de cookies en SVG (en attendant les photos)
   --------------------------------------------------------------------------
   Inspirées des photos de référence :
     • plat  : grand cookie fin, anneaux ondulés concentriques (« pan-banging »),
               bords dorés caramélisés, flaques de chocolat fondu
     • épais : cookie bombé et généreux, dessus craquelé, gros morceaux,
               cœur coulant qui s'échappe d'une fissure
   Dégradés doux, pas de contours noirs. Même graine = même cookie.
   Dès qu'une photo existe (assets/photos/...), elle remplace l'illustration.
   ========================================================================== */
(function (root) {
  'use strict';

  let uid = 0;

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

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

  // Forme organique fermée et lissée
  function blobPath(cx, cy, r, rand, opts) {
    const o = Object.assign({ points: 16, wobble: 0.04, squash: 1 }, opts);
    const pts = [];
    for (let i = 0; i < o.points; i++) {
      const a = (i / o.points) * Math.PI * 2;
      const rr = r * (1 + (rand() - 0.5) * 2 * o.wobble);
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * o.squash]);
    }
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    let d = '';
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length], m = mid(p, q);
      if (i === 0) { const m0 = mid(pts[pts.length - 1], p); d += `M${m0[0].toFixed(1)},${m0[1].toFixed(1)}`; }
      d += `Q${p[0].toFixed(1)},${p[1].toFixed(1)} ${m[0].toFixed(1)},${m[1].toFixed(1)}`;
    }
    return d + 'Z';
  }

  function polar(rand, maxR, cx, cy, squash) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * maxR;
    return [cx + Math.cos(a) * d, cy + Math.sin(a) * d * (squash || 1)];
  }

  /** Cookie plat : grand, fin, anneaux ondulés et chocolat fondu */
  function flat(colors, rand, id) {
    const dough = colors.dough, chip = colors.chip;
    const cx = 60, cy = 60, R = 52;
    let s = `<defs>
      <radialGradient id="g${id}" cx="45%" cy="42%" r="62%">
        <stop offset="0" stop-color="${shade(dough, 0.22)}"/>
        <stop offset=".6" stop-color="${dough}"/>
        <stop offset="1" stop-color="${shade(dough, -0.28)}"/>
      </radialGradient>
    </defs>`;
    s += `<ellipse cx="61" cy="63" rx="52" ry="51" fill="#0B2540" opacity=".10"/>`;
    s += `<path d="${blobPath(cx, cy, R, rand, { points: 22, wobble: 0.035 })}" fill="url(#g${id})"/>`;
    // anneaux concentriques ondulés (bords qui ont « retombé » à la cuisson)
    [0.9, 0.76, 0.62, 0.47].forEach((k, i) => {
      s += `<path d="${blobPath(cx + (rand() - 0.5) * 3, cy + (rand() - 0.5) * 3, R * k, rand, { points: 26, wobble: 0.05 + i * 0.01 })}" fill="none" stroke="${shade(dough, -0.32)}" stroke-width="${(1.6 - i * 0.2).toFixed(1)}" opacity=".45"/>`;
      s += `<path d="${blobPath(cx, cy - 0.8, R * k - 1.2, rand, { points: 26, wobble: 0.05 })}" fill="none" stroke="${shade(dough, 0.35)}" stroke-width=".8" opacity=".35"/>`;
    });
    // flaques et traînées de chocolat
    for (let i = 0; i < 9; i++) {
      const [x, y] = polar(rand, R * 0.8, cx, cy);
      const r = 3 + rand() * 5;
      s += `<path d="${blobPath(x, y, r, rand, { points: 8, wobble: 0.35, squash: 0.6 + rand() * 0.5 })}" fill="${chip}" opacity="${(0.55 + rand() * 0.35).toFixed(2)}" transform="rotate(${Math.round(rand() * 180)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
    }
    // reflets beurrés et fleur de sel
    s += `<ellipse cx="44" cy="40" rx="16" ry="7" fill="#fff" opacity=".12" transform="rotate(-28 44 40)"/>`;
    for (let i = 0; i < 10; i++) {
      const [x, y] = polar(rand, R * 0.85, cx, cy);
      s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="1.6" height="1.6" fill="#fff" opacity=".7" transform="rotate(${Math.round(rand() * 90)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
    }
    return s;
  }

  /** Cookie épais : bombé, craquelé, gros morceaux, cœur coulant */
  function thick(colors, rand, id) {
    const dough = colors.dough, chip = colors.chip;
    const cx = 60, cy = 56, R = 44, sq = 0.86;
    let s = `<defs>
      <radialGradient id="g${id}" cx="40%" cy="32%" r="70%">
        <stop offset="0" stop-color="${shade(dough, 0.3)}"/>
        <stop offset=".55" stop-color="${dough}"/>
        <stop offset="1" stop-color="${shade(dough, -0.3)}"/>
      </radialGradient>
      <linearGradient id="s${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${shade(dough, -0.2)}"/>
        <stop offset="1" stop-color="${shade(dough, -0.45)}"/>
      </linearGradient>
    </defs>`;
    s += `<ellipse cx="61" cy="100" rx="44" ry="8" fill="#0B2540" opacity=".16"/>`;
    // tranche (épaisseur visible)
    s += `<path d="${blobPath(cx, cy + 14, R - 1, rand, { squash: sq, wobble: 0.05 })}" fill="url(#s${id})"/>`;
    // dessus bombé
    s += `<path d="${blobPath(cx, cy, R, rand, { squash: sq, wobble: 0.07, points: 14 })}" fill="url(#g${id})"/>`;
    // craquelures
    for (let i = 0; i < 6; i++) {
      const [x, y] = polar(rand, R * 0.62, cx, cy, sq);
      const dx = (rand() - 0.5) * 22, dy = (rand() - 0.5) * 12;
      s += `<path d="M${x.toFixed(1)},${y.toFixed(1)} q${(dx / 2 + (rand() - 0.5) * 6).toFixed(1)},${(dy / 2 + (rand() - 0.5) * 6).toFixed(1)} ${dx.toFixed(1)},${dy.toFixed(1)}" stroke="${shade(dough, -0.35)}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".55"/>`;
      s += `<path d="M${(x + 0.8).toFixed(1)},${(y - 1).toFixed(1)} q${(dx / 2).toFixed(1)},${(dy / 2).toFixed(1)} ${dx.toFixed(1)},${dy.toFixed(1)}" stroke="${shade(dough, 0.35)}" stroke-width=".7" fill="none" stroke-linecap="round" opacity=".5"/>`;
    }
    // cœur coulant qui s'échappe d'une fissure
    if (colors.filling) {
      const fx = cx + 6, fy = cy + 4;
      s += `<path d="${blobPath(fx, fy, 10, rand, { points: 10, wobble: 0.25, squash: 0.75 })}" fill="${colors.filling}"/>`;
      s += `<path d="M${fx - 3},${fy + 6} q2,9 -1,15 q4,1 5,-3 q1,-6 2,-12z" fill="${colors.filling}"/>`;
      s += `<ellipse cx="${fx - 3}" cy="${fy - 3}" rx="4" ry="2" fill="#fff" opacity=".35"/>`;
    }
    // gros morceaux (chocolat, noix…) avec reflet
    for (let i = 0; i < 8; i++) {
      const [x, y] = polar(rand, R * 0.78, cx, cy, sq);
      const r = 4 + rand() * 3.5;
      s += `<path d="${blobPath(x, y, r, rand, { points: 6, wobble: 0.28 })}" fill="${chip}"/>`;
      s += `<path d="${blobPath(x - r * 0.25, y - r * 0.3, r * 0.4, rand, { points: 5, wobble: 0.3 })}" fill="#fff" opacity=".18"/>`;
    }
    s += `<ellipse cx="42" cy="38" rx="13" ry="6" fill="#fff" opacity=".16" transform="rotate(-25 42 38)"/>`;
    return s;
  }

  /**
   * @param {{dough:string, chip:string, filling?:string}} colors
   * @param {'plat'|'epais'} texture
   * @param {string} seedKey  identifiant stable (ex. l'id de la saveur)
   */
  function cookie(colors, texture, seedKey) {
    const rand = rng(hash(String(seedKey) + texture));
    const id = 'kc' + (uid++);
    const body = texture === 'epais' ? thick(colors, rand, id) : flat(colors, rand, id);
    return `<svg class="cookie-svg" viewBox="0 0 120 120" aria-hidden="true" focusable="false">${body}</svg>`;
  }

  root.KCArt = { cookie, shade };
})(typeof self !== 'undefined' ? self : this);
