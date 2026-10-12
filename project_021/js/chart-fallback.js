// Fallback minimalista: só entra em ação se o Chart.js (CDN) não carregar.
(function () {
  if (typeof window.Chart !== 'undefined') return;
  class MiniChart {
    constructor(ctx, cfg) {
      this.ctx = ctx; this.cfg = cfg; this.canvas = ctx.canvas;
      this._ro = () => this.draw();
      window.addEventListener('resize', this._ro);
      this.draw();
    }
    destroy() { window.removeEventListener('resize', this._ro); this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); }
    draw() {
      const c = this.canvas, p = c.parentElement, dpr = window.devicePixelRatio || 1;
      const w = Math.max(p.clientWidth, 200), h = Math.max(p.clientHeight, 220);
      c.width = w * dpr; c.height = h * dpr; c.style.width = w + 'px'; c.style.height = h + 'px';
      const g = this.ctx; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
      const { type, data } = this.cfg, css = getComputedStyle(document.documentElement);
      const ink = css.getPropertyValue('--gray-500').trim() || '#667';
      g.font = '11px sans-serif'; g.fillStyle = ink; g.strokeStyle = 'rgba(128,128,128,.2)';
      if (type === 'doughnut' || type === 'pie') return this.donut(g, w, h, data, ink);
      const ds = data.datasets, all = ds.flatMap(d => d.data), max = Math.max(...all) * 1.1;
      const min = type === 'bar' ? 0 : Math.min(...all) * 0.9;
      const L = 40, R = 10, T = 14, B = 26, pw = w - L - R, ph = h - T - B, n = data.labels.length;
      const y = v => T + ph - (v - min) / (max - min) * ph;
      for (let i = 0; i <= 4; i++) { const v = min + (max - min) * i / 4, yy = y(v);
        g.beginPath(); g.moveTo(L, yy); g.lineTo(w - R, yy); g.stroke(); g.fillText(Math.round(v * 10) / 10, 4, yy + 4); }
      const step = Math.ceil(n / Math.floor(pw / 50));
      data.labels.forEach((l, i) => { if (i % step === 0) g.fillText(l, L + (i + .5) * pw / n - 14, h - 8); });
      ds.forEach(d => {
        const col = Array.isArray(d.backgroundColor) ? null : (d.borderColor || d.backgroundColor);
        if (type === 'bar') {
          const bw = pw / n * 0.6;
          d.data.forEach((v, i) => { g.fillStyle = col || d.backgroundColor[i % d.backgroundColor.length];
            g.fillRect(L + (i + .5) * pw / n - bw / 2, y(v), bw, T + ph - y(v)); });
        } else {
          g.beginPath();
          d.data.forEach((v, i) => { const x = L + (i + .5) * pw / n; i ? g.lineTo(x, y(v)) : g.moveTo(x, y(v)); });
          g.strokeStyle = col; g.lineWidth = 2.5; g.stroke();
          g.lineTo(L + (n - .5) * pw / n, T + ph); g.lineTo(L + .5 * pw / n, T + ph); g.closePath();
          g.fillStyle = d.backgroundColor; g.fill(); g.lineWidth = 1; g.strokeStyle = 'rgba(128,128,128,.2)';
        }
      });
    }
    donut(g, w, h, data, ink) {
      const d = data.datasets[0], tot = d.data.reduce((a, b) => a + b, 0);
      const cx = Math.min(w * .35, h / 2), cy = h / 2, r = Math.min(cx, cy) - 8;
      let a = -Math.PI / 2;
      d.data.forEach((v, i) => { const s = v / tot * Math.PI * 2;
        g.beginPath(); g.arc(cx, cy, r, a, a + s); g.arc(cx, cy, r * .6, a + s, a, true); g.closePath();
        g.fillStyle = d.backgroundColor[i]; g.fill(); a += s; });
      g.font = '12px sans-serif';
      data.labels.forEach((l, i) => { const ly = 24 + i * 22, lx = cx * 2 + 16;
        g.fillStyle = d.backgroundColor[i]; g.fillRect(lx, ly - 9, 11, 11);
        g.fillStyle = ink; g.fillText(l + ' ' + Math.round(d.data[i] / tot * 100) + '%', lx + 16, ly); });
    }
  }
  window.Chart = MiniChart;
})();
