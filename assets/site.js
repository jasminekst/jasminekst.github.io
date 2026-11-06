(function () {
  var NS = "http://www.w3.org/2000/svg";
  var money = function (v) { return "$" + v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  /* ---------- Hero: LA listings dot map (real sampled coordinates) ---------- */
  var canvas = document.getElementById("la-map");
  var PLACES = [["Downtown", 34.047, -118.25], ["Santa Monica", 34.019, -118.49], ["Long Beach", 33.77, -118.19], ["Pasadena", 34.147, -118.14]];
  function drawMap() {
    var pts = window.LA_POINTS || [];
    if (!canvas || !pts.length) return;
    var size = canvas.clientWidth, dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr; canvas.height = size * dpr;
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    // focus on the dense core; a few outlying points simply fall outside
    var latMin = 33.70, latMax = 34.32, lonMin = -118.72, lonMax = -117.98;
    var k = Math.cos(34 * Math.PI / 180);
    var w = (lonMax - lonMin) * k, h = latMax - latMin, s = (size - 24) / Math.max(w, h);
    var ox = (size - w * s) / 2, oy = (size - h * s) / 2;
    var X = function (lon) { return ox + (lon - lonMin) * k * s; };
    var Y = function (lat) { return oy + (latMax - lat) * s; };
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(242, 184, 75, 0.42)";
    for (var i = 0; i < pts.length; i++) {
      var x = X(pts[i][1]), y = Y(pts[i][0]);
      if (x < 0 || y < 0 || x > size || y > size) continue;
      ctx.beginPath(); ctx.arc(x, y, size > 380 ? 1.7 : 1.3, 0, 6.283); ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.font = "500 12px 'IBM Plex Mono', monospace";
    PLACES.forEach(function (p) {
      var x = X(p[2]), y = Y(p[1]);
      ctx.fillStyle = "#eef2fb"; ctx.beginPath(); ctx.arc(x, y, 3, 0, 6.283); ctx.fill();
      ctx.fillStyle = "rgba(238, 242, 251, 0.85)";
      ctx.fillText(p[0], x + 7, y + 4);
    });
  }
  drawMap();
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(drawMap, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawMap);

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
    ["chart-visa", "chart-la", "chart-ac", "art-0", "art-1", "art-2", "art-3"].forEach(function (id) { var n = document.getElementById(id); if (n) n.innerHTML = ""; });
    hbar("chart-visa", [["Low", 83], ["Base", 190, 1], ["High", 380]],
      { color: cssVar("--navy"), track: cssVar("--band"), fmt: function (v) { return "$" + v + "B"; }, max: 400, labelW: 60, label: "US agentic spending in 2030 by scenario",
        note: "My model. Base and high match Morgan Stanley's 2030 cases. About half runs on Visa." });
    hbar("chart-la", [["Santa Monica", 327], ["West Hollywood", 309], ["Venice", 290], ["Pasadena", 241], ["Long Beach", 222], ["Downtown", 217], ["Hollywood", 171], ["Exposition Park", 48]],
      { color: cssVar("--blue"), track: cssVar("--blue-soft"), fmt: function (v) { return "$" + v; }, label: "Median nightly price by neighborhood",
        note: "Inside Airbnb, Los Angeles snapshot. Excludes listings with no price and flagged high prices." });
    hbar("chart-ac", [["Delay the follow-up", 38], ["Unsure what to write", 38], ["Forget details", 35], ["Forget advice", 28], ["Lose track of intros", 23]],
      { color: cssVar("--coral"), track: cssVar("--coral-soft"), fmt: function (v) { return v + "%"; }, max: 50, labelW: 150, label: "Biggest challenges after a coffee chat",
        note: "Survey of 60 graduate students. Select all that apply." });
    cardArt();
  }

  /* ---------- Card thumbnails (small charts from each project's data) ---------- */
  function cardArt() {
    // 0: trust gap, the four survey figures from the Visa case
    var a0 = document.getElementById("art-0");
    if (a0) {
      [6, 55, 51, 69].forEach(function (n, i) {
        var h = n / 69 * 84;
        el("rect", { x: 30 + i * 40, y: 100 - h, width: 24, height: Math.max(h, 3), rx: 4, fill: "currentColor", opacity: i === 3 ? 1 : 0.55 }, a0);
      });
      el("line", { x1: 0, x2: 200, y1: 100.5, y2: 100.5, stroke: "currentColor", "stroke-opacity": 0.35 }, a0);
    }
    // 1: neighborhood median prices as columns
    var a1 = document.getElementById("art-1");
    if (a1) {
      var v = [327, 309, 290, 241, 222, 217, 171, 48];
      v.forEach(function (n, i) { var h = n / 327 * 88; el("rect", { x: 8 + i * 24, y: 100 - h, width: 16, height: h, rx: 3, fill: "currentColor", opacity: i === 0 ? 1 : 0.55 }, a1); });
      el("line", { x1: 0, x2: 200, y1: 100.5, y2: 100.5, stroke: "currentColor", "stroke-opacity": 0.35 }, a1);
    }
    // 2: coffee chats in the last 3 months (survey distribution)
    var a2 = document.getElementById("art-2");
    if (a2) {
      var d = [28, 44, 23, 2, 3];
      d.forEach(function (n, i) { var h = n / 44 * 84; el("rect", { x: 14 + i * 36, y: 100 - h, width: 26, height: Math.max(h, 2), rx: 4, fill: "currentColor", opacity: i === 1 ? 1 : 0.5 }, a2); });
      el("line", { x1: 0, x2: 200, y1: 100.5, y2: 100.5, stroke: "currentColor", "stroke-opacity": 0.35 }, a2);
    }
    // 3: weekly profit as piping supply rises (from the model)
    var a3 = document.getElementById("art-3");
    if (a3) {
      var xs = [], pts = [];
      for (var p = 80; p <= 160; p += 5) xs.push(p);
      var prof = xs.map(function (p) { return solve(42, p).profit; });
      var lo = Math.min.apply(null, prof), hi = Math.max.apply(null, prof);
      xs.forEach(function (p, i) { pts.push((6 + i * (188 / (xs.length - 1))).toFixed(1) + "," + (96 - (prof[i] - lo) / (hi - lo) * 80).toFixed(1)); });
      el("polyline", { points: "6,100 " + pts.join(" ") + " 194,100", fill: "currentColor", opacity: 0.16 }, a3);
      el("polyline", { points: pts.join(" "), fill: "none", stroke: "currentColor", "stroke-width": 3, "stroke-linejoin": "round", "stroke-linecap": "round" }, a3);
      var bi = xs.indexOf(110), bp = pts[bi].split(",");
      el("circle", { cx: bp[0], cy: bp[1], r: 5, fill: "currentColor" }, a3);
      el("line", { x1: 0, x2: 200, y1: 100.5, y2: 100.5, stroke: "currentColor", "stroke-opacity": 0.35 }, a3);
    }
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

  /* ---------- Copy email ---------- */
  var btn = document.getElementById("copy-email");
  if (btn) btn.addEventListener("click", function () {
    var email = btn.dataset.email;
    function done(msg) { btn.textContent = msg; setTimeout(function () { btn.textContent = "Copy email"; }, 1800); }
    if (navigator.clipboard) navigator.clipboard.writeText(email).then(function () { done("Copied"); }, function () { done(email); });
    else done(email);
  });
})();
