/* Fallback minimalista para Chart.js (doughnut, line, bar) quando o CDN não carrega. */
(function () {
  if (window.Chart) return;
  function pick(v, i) { return Array.isArray(v) ? v[i % v.length] : v; }
  function Chart(ctx, cfg) {
    this.ctx = ctx; this.cfg = cfg; this.canvas = ctx.canvas;
    this._draw = this.draw.bind(this);
    window.addEventListener('resize', this._draw);
    this.draw();
  }
  Chart.prototype.destroy = function () {
    window.removeEventListener('resize', this._draw);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };
  Chart.prototype.draw = function () {
    var c = this.canvas, ctx = this.ctx, cfg = this.cfg, p = c.parentElement;
    var dpr = window.devicePixelRatio || 1;
    var w = Math.max(240, (p && p.clientWidth) || 320);
    var h = Math.max(180, (p && p.clientHeight > 120 ? p.clientHeight : 0) || Math.round(w * 0.6));
    c.style.width = w + 'px'; c.style.height = h + 'px';
    c.width = w * dpr; c.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    var fg = getComputedStyle(c).color || '#444';
    ctx.font = '12px sans-serif'; ctx.fillStyle = fg; ctx.strokeStyle = fg;
    var labels = cfg.data.labels || [], ds = cfg.data.datasets || [];
    if (cfg.type === 'doughnut' || cfg.type === 'pie') return this.donut(w, h, labels, ds[0], fg);
    this.axes(w, h, labels, ds, cfg.type, fg);
  };
  Chart.prototype.donut = function (w, h, labels, d, fg) {
    var ctx = this.ctx, vals = d.data, tot = vals.reduce(function (a, b) { return a + b; }, 0) || 1;
    var legendH = Math.ceil(labels.length / 2) * 18 + 6;
    var r = Math.min(w, h - legendH) / 2 - 6, cx = w / 2, cy = r + 6, a = -Math.PI / 2;
    vals.forEach(function (v, i) {
      var s = v / tot * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a, a + s); ctx.closePath();
      ctx.fillStyle = pick(d.backgroundColor, i); ctx.fill(); a += s;
    });
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.58, 0, 7); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.textBaseline = 'middle';
    labels.forEach(function (l, i) {
      var x = (i % 2) * (w / 2) + 10, y = cy + r + 20 + Math.floor(i / 2) * 18;
      ctx.fillStyle = pick(d.backgroundColor, i); ctx.fillRect(x, y - 5, 10, 10);
      ctx.fillStyle = fg; ctx.fillText(String(l).slice(0, 18), x + 16, y);
    });
    this.canvas.style.height = (cy + r + 14 + Math.ceil(labels.length / 2) * 18) + 'px';
  };
  Chart.prototype.axes = function (w, h, labels, ds, type, fg) {
    var ctx = this.ctx, L = 52, R = 10, T = 28, B = 26, pw = w - L - R, ph = h - T - B;
    var max = 0; ds.forEach(function (d) { d.data.forEach(function (v) { max = Math.max(max, v); }); });
    max = max || 1;
    var n = Math.max(labels.length, 1);
    ctx.textBaseline = 'middle'; ctx.textAlign = 'right';
    for (var g = 0; g <= 4; g++) {
      var y = T + ph - ph * g / 4;
      ctx.globalAlpha = .15; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(w - R, y); ctx.stroke(); ctx.globalAlpha = 1;
      var val = max * g / 4; ctx.fillText(val >= 1000 ? Math.round(val / 100) / 10 + 'k' : Math.round(val), L - 6, y);
    }
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    labels.forEach(function (l, i) { ctx.fillText(String(l), L + pw * (i + .5) / n, T + ph + 6); });
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    var lx = L;
    ds.forEach(function (d, k) {
      var col = pick(d.borderColor, 0) || pick(d.backgroundColor, 0);
      ctx.fillStyle = col; ctx.fillRect(lx, 8, 10, 10); ctx.fillStyle = fg;
      ctx.fillText(d.label || '', lx + 14, 13); lx += 24 + ctx.measureText(d.label || '').width;
      if (type === 'bar') {
        var bw = pw / n / (ds.length + 1);
        d.data.forEach(function (v, i) {
          var bh = ph * v / max, x = L + pw * i / n + bw * (k + .5);
          ctx.fillStyle = pick(d.backgroundColor, 0); ctx.fillRect(x, T + ph - bh, bw, bh);
        });
      } else {
        var pts = d.data.map(function (v, i) { return [L + pw * (i + .5) / n, T + ph - ph * v / max]; });
        if (!pts.length) return;
        ctx.beginPath(); pts.forEach(function (q, i) { i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); });
        ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.stroke();
        if (d.fill) { ctx.lineTo(pts[pts.length - 1][0], T + ph); ctx.lineTo(pts[0][0], T + ph); ctx.closePath(); ctx.globalAlpha = .12; ctx.fillStyle = col; ctx.fill(); ctx.globalAlpha = 1; }
        ctx.fillStyle = col; pts.forEach(function (q) { ctx.beginPath(); ctx.arc(q[0], q[1], 3.5, 0, 7); ctx.fill(); });
        ctx.lineWidth = 1;
      }
    });
  };
  window.Chart = Chart;
})();
