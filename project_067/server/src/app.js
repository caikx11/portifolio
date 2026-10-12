const express = require('express');
const cors = require('cors');
const crypto = require('node:crypto');

const ALPHABET = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const RESERVED = new Set(['api', 'health', 'favicon.ico']);

function randomSlug(n = 6) {
  return Array.from(crypto.randomBytes(n), (b) => ALPHABET[b % ALPHABET.length]).join('');
}
function validUrl(u) {
  try { const x = new URL(u); return x.protocol === 'http:' || x.protocol === 'https:'; } catch { return false; }
}

function createApp(db) {
  const app = express();
  app.use(cors()); app.use(express.json());
  const q = {
    insert: db.prepare('INSERT INTO links (slug, url) VALUES (?, ?)'),
    get: db.prepare('SELECT * FROM links WHERE slug = ?'),
    list: db.prepare(`SELECT l.slug, l.url, l.created_at AS createdAt, COUNT(c.id) AS clicks
      FROM links l LEFT JOIN clicks c ON c.slug = l.slug GROUP BY l.slug ORDER BY l.created_at DESC, l.rowid DESC`),
    click: db.prepare('INSERT INTO clicks (slug, referrer) VALUES (?, ?)'),
    count: db.prepare('SELECT COUNT(*) AS n FROM clicks WHERE slug = ?'),
    recent: db.prepare('SELECT at, referrer FROM clicks WHERE slug = ? ORDER BY id DESC LIMIT 10'),
    del: db.prepare('DELETE FROM links WHERE slug = ?'),
  };
  const view = (r, base) => ({ slug: r.slug, url: r.url, short: `${base}/${r.slug}`, createdAt: r.createdAt ?? r.created_at, clicks: r.clicks ?? q.count.get(r.slug).n });
  const base = (req) => `${req.protocol}://${req.get('host')}`;

  app.get('/api/health', (_q, res) => res.json({ ok: true, service: 'url-shortener' }));

  app.get('/api/links', (req, res) => res.json(q.list.all().map((r) => view(r, base(req)))));

  app.post('/api/links', (req, res) => {
    const { url, slug } = req.body || {};
    if (typeof url !== 'string' || !validUrl(url)) return res.status(400).json({ error: 'URL inválida (use http:// ou https://)' });
    if (slug !== undefined && slug !== '' && (typeof slug !== 'string' || !/^[\w-]{3,32}$/.test(slug) || RESERVED.has(slug)))
      return res.status(400).json({ error: 'Slug inválido (3 a 32 letras, números, _ ou -)' });
    let s = slug || null;
    if (s && q.get.get(s)) return res.status(409).json({ error: 'Esse slug já está em uso' });
    if (!s) { do { s = randomSlug(); } while (q.get.get(s)); }
    q.insert.run(s, url);
    res.status(201).json(view(q.get.get(s), base(req)));
  });

  app.get('/api/links/:slug', (req, res) => {
    const r = q.get.get(req.params.slug);
    if (!r) return res.status(404).json({ error: 'Link não encontrado' });
    res.json({ ...view(r, base(req)), recent: q.recent.all(r.slug) });
  });

  app.delete('/api/links/:slug', (req, res) => {
    if (!q.del.run(req.params.slug).changes) return res.status(404).json({ error: 'Link não encontrado' });
    res.status(204).end();
  });

  app.get('/:slug', (req, res) => {
    const r = q.get.get(req.params.slug);
    if (!r) return res.status(404).json({ error: 'Link não encontrado' });
    q.click.run(r.slug, req.get('referer') || null);
    res.redirect(302, r.url);
  });
  return app;
}
module.exports = { createApp };
