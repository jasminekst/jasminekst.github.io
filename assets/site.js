(function () {
  var NS = "http://www.w3.org/2000/svg";
  var money = function (v) { return "$" + v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function cssVar(name, elId) { var e = elId ? document.getElementById(elId) : document.documentElement; return getComputedStyle(e || document.documentElement).getPropertyValue(name).trim(); }

  /* ---------- Hero: shimmering data scene (charts, a platform network, AI sparkles) ---------- */
  var canvas = document.getElementById("hero-art");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var GOLD = [242, 184, 75], BLUE = [126, 162, 255], WHITE = [238, 242, 251];
  var rgba = function (c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; };
  var seed = 7, rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  // operations network: three hubs joined by curved routes, each serving its own cluster of points
  var NODES = [
    { x: 0.27, y: 0.25, r: 4.2, hub: 1 }, { x: 0.61, y: 0.15, r: 3.8, hub: 1 }, { x: 0.76, y: 0.38, r: 4.0, hub: 1 },
    { x: 0.11, y: 0.15, r: 1.9 }, { x: 0.09, y: 0.33, r: 1.7 }, { x: 0.20, y: 0.44, r: 2.1 }, { x: 0.38, y: 0.40, r: 1.8 }, { x: 0.37, y: 0.09, r: 2.0 },
    { x: 0.49, y: 0.05, r: 1.7 }, { x: 0.75, y: 0.06, r: 2.0 }, { x: 0.88, y: 0.18, r: 1.8 }, { x: 0.50, y: 0.27, r: 1.6 },
    { x: 0.92, y: 0.33, r: 1.9 }, { x: 0.62, y: 0.47, r: 1.8 }, { x: 0.85, y: 0.49, r: 1.7 }
  ];
  var LINKS = [[0, 1, 1], [1, 2, 1], [0, 2, 1],
    [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [1, 7], [1, 8], [1, 9], [1, 10], [1, 11], [2, 10], [2, 12], [2, 13], [2, 14], [11, 6]];
  NODES.forEach(function (d, i) { d.p = i * 0.9; d.x0 = d.x; d.y0 = d.y; });
  function bend(a, b) { // control point for a gentle arc between two hubs
    var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y;
    return { x: mx - dy * 0.35, y: my + dx * 0.35 };
  }
  // sparkles: four-point stars that twinkle
  var SPARKS = [];
  for (var q = 0; q < 14; q++) SPARKS.push({ x: rnd(), y: rnd() * 0.95, s: 3 + rnd() * 6, p: rnd() * 6.28, v: 0.6 + rnd() * 1.2 });
  // analytics: three flowing series drawn as particle streams
  var SERIES = [
    { c: GOLD, base: 0.62, amp: 0.07, f: 2.1, sp: 0.35, a: 0.95 },
    { c: BLUE, base: 0.72, amp: 0.05, f: 3.3, sp: -0.25, a: 0.75 },
    { c: WHITE, base: 0.82, amp: 0.035, f: 4.6, sp: 0.18, a: 0.45 }
  ];
  function star(ctx, x, y, s, a) {
    ctx.fillStyle = rgba(GOLD, a);
    ctx.beginPath();
    ctx.moveTo(x, y - s); ctx.quadraticCurveTo(x, y, x + s, y); ctx.quadraticCurveTo(x, y, x, y + s);
    ctx.quadraticCurveTo(x, y, x - s, y); ctx.quadraticCurveTo(x, y, x, y - s); ctx.fill();
  }
  function frame(t) {
    if (!canvas) return;
    var size = canvas.clientWidth, dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(size * dpr)) { canvas.width = Math.round(size * dpr); canvas.height = Math.round(size * dpr); }
    var ctx = canvas.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, size, size);
    var T = t / 1000;
    // faint chart grid
    ctx.strokeStyle = rgba(WHITE, 0.06); ctx.lineWidth = 1;
    for (var g = 1; g < 8; g++) { var gy = size * g / 8; ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(size, gy); ctx.stroke(); }
    // network links and nodes
    NODES.forEach(function (d) { // a slow drift so the network feels alive
      d.x = d.x0 + (reduce ? 0 : 0.006 * Math.sin(T * 0.5 + d.p)); d.y = d.y0 + (reduce ? 0 : 0.006 * Math.cos(T * 0.4 + d.p));
    });
    LINKS.forEach(function (l, li) {
      var a = NODES[l[0]], b = NODES[l[1]], m = (T * (l[2] ? 0.18 : 0.3) + li * 0.17) % 1, px, py;
      if (l[2]) {
        var c = bend(a, b);
        ctx.strokeStyle = rgba(GOLD, 0.35); ctx.lineWidth = 1.3; ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(a.x * size, a.y * size); ctx.quadraticCurveTo(c.x * size, c.y * size, b.x * size, b.y * size); ctx.stroke(); ctx.setLineDash([]);
        px = (1 - m) * (1 - m) * a.x + 2 * (1 - m) * m * c.x + m * m * b.x; py = (1 - m) * (1 - m) * a.y + 2 * (1 - m) * m * c.y + m * m * b.y;
        ctx.fillStyle = rgba(GOLD, 0.9); ctx.beginPath(); ctx.arc(px * size, py * size, 2.2, 0, 6.283); ctx.fill();
      } else {
        ctx.strokeStyle = rgba(BLUE, 0.2); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x * size, a.y * size); ctx.lineTo(b.x * size, b.y * size); ctx.stroke();
        px = a.x + (b.x - a.x) * m; py = a.y + (b.y - a.y) * m;
        ctx.fillStyle = rgba(WHITE, 0.45); ctx.beginPath(); ctx.arc(px * size, py * size, 1.1, 0, 6.283); ctx.fill();
      }
    });
    NODES.forEach(function (d) {
      var glow = 0.55 + 0.45 * Math.sin(T * 1.3 + d.p);
      if (d.hub) {
        ctx.strokeStyle = rgba(GOLD, 0.35 * glow); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(d.x * size, d.y * size, d.r * 3.2, 0, 6.283); ctx.stroke();
      }
      ctx.fillStyle = rgba(d.hub ? GOLD : BLUE, (d.hub ? 0.16 : 0.12) * glow); ctx.beginPath(); ctx.arc(d.x * size, d.y * size, d.r * 4, 0, 6.283); ctx.fill();
      ctx.fillStyle = d.hub ? rgba(GOLD, 0.95) : rgba(WHITE, 0.55 + 0.4 * glow); ctx.beginPath(); ctx.arc(d.x * size, d.y * size, d.r, 0, 6.283); ctx.fill();
    });
    // flowing series made of shimmering dots
    ctx.globalCompositeOperation = "lighter";
    SERIES.forEach(function (sr, si) {
      for (var i = 0; i <= 120; i++) {
        var u = i / 120, x = u * size;
        var y = (sr.base - sr.amp * Math.sin(u * sr.f * 3.14 + T * sr.sp) - 0.05 * u * (si === 0 ? 1 : 0.4)) * size;
        var tw = 0.45 + 0.55 * Math.abs(Math.sin(i * 0.7 + T * 2.2 + si));
        ctx.fillStyle = rgba(sr.c, sr.a * tw); ctx.beginPath(); ctx.arc(x, y, si === 0 ? 1.8 : 1.3, 0, 6.283); ctx.fill();
      }
    });
    // rising bars made of dots along the bottom
    for (var bi = 0; bi < 9; bi++) {
      var bx = size * (0.12 + bi * 0.095), h = 3 + Math.round(4 + 3 * Math.sin(T * 0.6 + bi * 0.9) + bi * 0.5);
      for (var k = 0; k < h; k++) { ctx.fillStyle = rgba(bi % 3 === 0 ? GOLD : BLUE, 0.22 + k / h * 0.4); ctx.fillRect(bx, size * 0.98 - k * size * 0.016, size * 0.03, size * 0.009); }
    }
    ctx.globalCompositeOperation = "source-over";
    // AI sparkles
    SPARKS.forEach(function (sp) {
      var a = Math.max(0, Math.sin(T * sp.v + sp.p)); if (a > 0.05) star(ctx, sp.x * size, sp.y * size, sp.s * (0.6 + 0.4 * a), 0.85 * a);
    });
  }
  var running = false, visible = true;
  function loop(t) { frame(t); if (running) requestAnimationFrame(loop); }
  function start() { if (reduce) { frame(4000); return; } if (!running && visible && !document.hidden) { running = true; requestAnimationFrame(loop); } }
  function stop() { running = false; }
  if (canvas) {
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; visible ? start() : stop(); }).observe(canvas);
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    window.addEventListener("resize", function () { if (reduce || !running) frame(4000); });
    frame(4000); // draw a still frame first, so the canvas is never empty
    start();
  }

  /* ---------- Horizontal bar chart ---------- */
  function hbar(id, rows, opts) {
    var host = document.getElementById(id); if (!host) return;
    var W = 380, row = 30, labelW = opts.labelW || 128, H = rows.length * row;
    var max = opts.max || Math.max.apply(null, rows.map(function (r) { return r[1]; }));
    var svg = el("svg", { viewBox: "0 0 " + W + " " + (H + 4), role: "img", "aria-label": opts.label }, host);
    var plot = W - labelW - 46;
    rows.forEach(function (r, i) {
      var y = i * row;
      el("text", { x: 0, y: y + 19 }, svg).textContent = r[0];
      el("rect", { x: labelW, y: y + 7, width: plot, height: 16, rx: 4, fill: opts.track }, svg);
      el("rect", { x: labelW, y: y + 7, width: Math.max(2, plot * r[1] / max), height: 16, rx: 4, fill: opts.color, opacity: r[2] ? 1 : 0.78 }, svg);
      el("text", { x: labelW + plot * r[1] / max + 6, y: y + 19, class: "val" }, svg).textContent = opts.fmt(r[1]);
    });
    if (opts.note) { var p = document.createElement("p"); p.className = "note"; p.textContent = opts.note; host.appendChild(p); }
  }
  function charts() {
    ["chart-visa", "chart-auto", "chart-la", "chart-ac"].forEach(function (id) { var n = document.getElementById(id); if (n) n.innerHTML = ""; });
    hbar("chart-visa", [["Buy on its own, no check-in", 6], ["Buy only after I review it", 44], ["Spend up to $100 on essentials", 69, 1]],
      { color: cssVar("--acc", "visa"), track: cssVar("--acc-soft", "visa"), fmt: function (v) { return v + "%"; }, max: 100, labelW: 190, label: "What shoppers would let an AI agent do",
        note: "Few shoppers would let an AI buy on its own, but most would let one handle a small grocery order. Figures come from Worldpay (2025) and Global Payments (2026) surveys, which asked different questions." });
    var M = window.AUTO_METRICS || { auto_total: 98, automation_rate: 0.8376, flagged_total: 35, updated: "2026-11-06", outcomes: { filed: 81, replaced: 8, duplicate: 6, zip: 3 } };
    hbar("chart-auto", [["Filed", M.outcomes.filed, 1], ["New version, old archived", M.outcomes.replaced, 1], ["Duplicate skipped", M.outcomes.duplicate, 1], ["Zip unpacked", M.outcomes.zip, 1], ["Sent for review", M.flagged_total]],
      { color: cssVar("--acc", "autopilot"), track: cssVar("--acc-soft", "autopilot"), fmt: function (v) { return v; }, max: Math.max(M.outcomes.filed, M.flagged_total) * 1.1, labelW: 175, label: "What happened to each file",
        note: "Counts come from the system's own log and refresh every evening. Almost half the files sent for review weren't course files at all." });
    var upd = new Date(M.updated + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
    [["m-auto", M.auto_total], ["m-rate", Math.round(M.automation_rate * 100) + "%"], ["m-updated", "(updated " + upd + ")"]].forEach(function (x) { var n = document.getElementById(x[0]); if (n) n.textContent = x[1]; });
    hbar("chart-la", [["Santa Monica", 327], ["West Hollywood", 309], ["Venice", 290], ["Pasadena", 241], ["Long Beach", 222], ["Downtown", 217], ["Hollywood", 171], ["Exposition Park", 48]],
      { color: cssVar("--acc", "dashboard"), track: cssVar("--acc-soft", "dashboard"), fmt: function (v) { return "$" + v; }, label: "Median nightly price by neighborhood",
        note: "Prices come from the Inside Airbnb Los Angeles snapshot and leave out listings with no price or an unusually high one." });
    hbar("chart-ac", [["Follow-up reminders", 48, 1], ["Referral tracking", 48, 1], ["Organized notes", 40], ["Thank-you drafts", 32], ["Searchable history", 22]],
      { color: cssVar("--acc", "afterchat"), track: cssVar("--acc-soft", "afterchat"), fmt: function (v) { return v + "%"; }, max: 50, labelW: 150, label: "What students most wanted after a coffee chat",
        note: "In our survey of 60 graduate students, these answers decided which features the app would have." });
    cardArt();
  }

  /* ---------- Card thumbnails: one small illustration per project ---------- */
  var ART = {
    // Visa case: a payment card with chip and contactless mark, plus an AI sparkle
    "art-0": '<rect x="62" y="30" width="92" height="58" rx="8" fill="currentColor" opacity=".25"/>' +
      '<rect x="48" y="20" width="92" height="58" rx="8" fill="currentColor"/>' +
      '<rect x="60" y="38" width="17" height="13" rx="2.5" style="fill:var(--acc-2)"/>' +
      '<g fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M113 38 a7 7 0 0 1 0 11"/><path d="M118 34 a12 12 0 0 1 0 19"/><path d="M123 30 a17 17 0 0 1 0 27"/></g>' +
      '<rect x="60" y="62" width="34" height="4" rx="2" fill="#fff" opacity=".75"/><rect x="99" y="62" width="14" height="4" rx="2" fill="#fff" opacity=".75"/>' +
      '<path d="M160 12 l3.5 9 9 3.5 -9 3.5 -3.5 9 -3.5 -9 -9 -3.5 9 -3.5 z" style="fill:var(--acc-2)"/>',
    // LA Stay: a simple map of the LA coast with three pins
    "art-1": '<path d="M0 0 H200 V96 C170 92 150 88 128 84 C112 82 98 90 86 92 C74 94 62 90 60 82 C58 74 66 68 70 60 C74 50 66 40 54 36 C36 30 18 30 0 28 Z" fill="currentColor" opacity=".16"/>' +
      '<path d="M0 28 C18 30 36 30 54 36 C66 40 74 50 70 60 C66 68 58 74 60 82 C62 90 74 94 86 92 C98 90 112 82 128 84 C150 88 170 92 200 96" fill="none" stroke="currentColor" stroke-width="2.2"/>' +
      '<g fill="none" stroke="currentColor" stroke-width="1.6" opacity=".45" stroke-linecap="round"><path d="M72 52 C100 48 140 46 200 42"/><path d="M78 30 C92 50 100 70 104 88"/><path d="M118 4 C120 30 122 60 126 82"/></g>' +
      '<g fill="currentColor"><path d="M74 52 c0-6 9-6 9 0 c0 4 -4.5 9 -4.5 9 s-4.5-5 -4.5-9z"/><path d="M116 42 c0-7 11-7 11 0 c0 5 -5.5 11 -5.5 11 s-5.5-6 -5.5-11z"/><path d="M127 75 c0-6 9-6 9 0 c0 4 -4.5 9 -4.5 9 s-4.5-5 -4.5-9z"/></g>' +
      '<g fill="#fff"><circle cx="78.5" cy="52" r="1.8"/><circle cx="121.5" cy="42" r="2.2"/><circle cx="131.5" cy="75" r="1.8"/></g>',
    // AfterChat: a cute coffee cup on a saucer
    "art-2": '<ellipse cx="98" cy="92" rx="44" ry="7" style="fill:var(--acc-2)"/>' +
      '<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".45"><path d="M88 30 c-6 -6 6 -10 0 -17"/><path d="M104 30 c-6 -6 6 -10 0 -17"/></g>' +
      '<path d="M126 48 a12 12 0 1 1 -3 24" fill="none" stroke="currentColor" stroke-width="6"/>' +
      '<path d="M68 38 H128 L122 80 A9 9 0 0 1 113 88 H83 A9 9 0 0 1 74 80 Z" fill="currentColor"/>' +
      '<g fill="#fff"><circle cx="89" cy="58" r="2.6"/><circle cx="107" cy="58" r="2.6"/></g>' +
      '<path d="M92 66 q6 5 12 0" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>' +
      '<g style="fill:var(--acc-2)" opacity=".85"><circle cx="83" cy="65" r="3.2"/><circle cx="113" cy="65" r="3.2"/></g>',
    // Jack's Customs: a stitched pillow with a needle and thread
    "art-3": '<path d="M52 24 Q100 14 148 24 Q158 55 148 86 Q100 96 52 86 Q42 55 52 24 Z" fill="currentColor"/>' +
      '<path d="M62 33 Q100 25 138 33 Q146 55 138 77 Q100 85 62 77 Q54 55 62 33 Z" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="5 4" opacity=".85"/>' +
      '<circle cx="100" cy="55" r="7" fill="#fff" opacity=".9"/><g fill="currentColor"><circle cx="97.5" cy="55" r="1.4"/><circle cx="102.5" cy="55" r="1.4"/></g>' +
      '<path d="M148 24 C162 30 170 18 182 12" fill="none" stroke="currentColor" stroke-width="1.8" opacity=".6"/>' +
      '<path d="M176 15 L194 5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="191.5" cy="6.5" r="1.4" fill="none" stroke="currentColor" stroke-width="1"/>'
  };
  // Course Files on Autopilot: files flowing into a folder, with a check mark
  ART["art-4"] = '<g fill="currentColor" opacity=".35"><rect x="30" y="20" width="22" height="28" rx="3" transform="rotate(-12 41 34)"/><rect x="58" y="10" width="22" height="28" rx="3" transform="rotate(6 69 24)"/></g>' +
    '<g fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 4" opacity=".6"><path d="M50 50 C60 62 72 64 86 62"/><path d="M76 40 C82 52 88 56 96 58"/></g>' +
    '<path d="M88 46 h22 l8 9 h40 a6 6 0 0 1 6 6 v34 a6 6 0 0 1 -6 6 h-70 a6 6 0 0 1 -6 -6 v-43 a6 6 0 0 1 6 -6 z" fill="currentColor"/>' +
    '<circle cx="152" cy="40" r="15" style="fill:var(--acc-2)"/><path d="M145 40 l5 5 9 -10" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>';
  function cardArt() {
    Object.keys(ART).forEach(function (id) { var n = document.getElementById(id); if (n) n.innerHTML = ART[id]; });
  }

  /* ---------- Jack's Customs integer program (same inputs as the Excel model) ---------- */
  // x pillows, y aprons, z bundles; margins from unit price minus unit cost
  var MARGIN = [15.39, 27.25, 32.64], MIN = [8, 8, 5];
  function solve(labor, piping) {
    var best = null;
    for (var z = MIN[2]; z <= 60; z++) {
      for (var y = MIN[1]; y <= 100; y++) {
        for (var x = MIN[0]; x <= 110; x++) {
          if (x + y + 2 * z > labor || 2 * x + 4 * y + 6 * z > piping) break;
          if (5 * x + 20 * y + 25 * z > 500 || 0.5 * x + 0.5 * z > 40) break;
          var v = MARGIN[0] * x + MARGIN[1] * y + MARGIN[2] * z;
          if (!best || v > best.profit + 1e-9) best = { profit: v, x: x, y: y, z: z };
        }
      }
    }
    if (best) {
      best.labor = best.x + best.y + 2 * best.z;
      best.piping = 2 * best.x + 4 * best.y + 6 * best.z;
    }
    return best;
  }
  var BASE = 750.56;
  var L = document.getElementById("w-labor"), P = document.getElementById("w-piping");
  function update() {
    var labor = +L.value, piping = +P.value, r = solve(labor, piping);
    document.getElementById("o-labor").textContent = labor;
    document.getElementById("o-piping").textContent = piping;
    var d = r.profit - BASE, delta = document.getElementById("w-delta");
    document.getElementById("w-profit").textContent = money(r.profit);
    delta.className = Math.abs(d) < 0.005 ? "" : d > 0 ? "up" : "down";
    delta.textContent = Math.abs(d) < 0.005 ? "Same as the recommended plan" : (d > 0 ? "+" : "−") + money(Math.abs(d)) + " vs. the recommended plan";
    var max = Math.max(r.x, r.y, r.z, 30);
    document.getElementById("w-mix").innerHTML = [["Pillows", r.x], ["Aprons", r.y], ["Bundles", r.z]].map(function (m) {
      return '<div class="mix-row"><span>' + m[0] + '</span><span class="mix-bar"><i style="width:' + (m[1] / max * 100).toFixed(1) + '%"></i></span><b>' + m[1] + "</b></div>";
    }).join("");
    var tight = [];
    if (piping - r.piping < 2) tight.push("piping");
    if (labor - r.labor < 1) tight.push("labor hours");
    document.getElementById("w-limit").textContent =
      "Uses " + r.piping + " of " + piping + " yards of piping and " + r.labor + " of " + labor + " hours. " +
      (tight.length ? "Limited by " + tight.join(" and ") + "." : "Neither limit is fully used.");
  }
  if (L && P) {
    L.addEventListener("input", update); P.addEventListener("input", update);
    document.getElementById("w-reset").addEventListener("click", function () { L.value = 42; P.value = 110; update(); });
    update();
  }

  charts();
  if (window.matchMedia) window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", charts);
  fetch("cases/course-autopilot/metrics.json?t=" + Date.now()).then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) { if (d && d.outcomes) { window.AUTO_METRICS = d; charts(); } }).catch(function () {});

  /* ---------- Copy email ---------- */
  var btn = document.getElementById("copy-email");
  if (btn) btn.addEventListener("click", function () {
    var email = btn.dataset.email;
    function done(msg) { btn.textContent = msg; setTimeout(function () { btn.textContent = "Copy email"; }, 1800); }
    if (navigator.clipboard) navigator.clipboard.writeText(email).then(function () { done("Copied"); }, function () { done(email); });
    else done(email);
  });
})();
