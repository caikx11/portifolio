const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

function createApp(db, { secret = process.env.JWT_SECRET || 'dev-secret-troque-em-producao' } = {}) {
  const app = express();
  app.use(cors()); app.use(express.json());
  const sign = (u) => jwt.sign({ sub: u.id, email: u.email }, secret, { expiresIn: '2h' });

  function auth(req, res, next) {
    const h = req.get('authorization') || '';
    try { const p = jwt.verify(h.replace(/^Bearer /, ''), secret); req.user = { id: p.sub, email: p.email }; next(); }
    catch { res.status(401).json({ error: 'Não autenticado' }); }
  }
  const emailOk = (e) => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  app.get('/api/health', (_q, res) => res.json({ ok: true, service: 'notes-api' }));

  app.post('/api/auth/register', (req, res) => {
    const { email, password } = req.body || {};
    if (!emailOk(email)) return res.status(400).json({ error: 'E-mail inválido' });
    if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ error: 'A senha precisa ter ao menos 6 caracteres' });
    if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email.toLowerCase())) return res.status(409).json({ error: 'E-mail já cadastrado' });
    const id = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email.toLowerCase(), bcrypt.hashSync(password, 8)).lastInsertRowid;
    const u = { id: Number(id), email: email.toLowerCase() };
    res.status(201).json({ token: sign(u), user: { email: u.email } });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body || {};
    const u = typeof email === 'string' && db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!u || typeof password !== 'string' || !bcrypt.compareSync(password, u.password_hash)) return res.status(401).json({ error: 'Credenciais inválidas' });
    res.json({ token: sign(u), user: { email: u.email } });
  });

  app.get('/api/auth/me', auth, (req, res) => res.json({ email: req.user.email }));

  const cols = 'id, title, body, updated_at AS updatedAt';
  app.get('/api/notes', auth, (req, res) => {
    const q = typeof req.query.q === 'string' ? `%${req.query.q}%` : '%';
    res.json(db.prepare(`SELECT ${cols} FROM notes WHERE user_id = ? AND (title LIKE ? OR body LIKE ?) ORDER BY updated_at DESC, id DESC`).all(req.user.id, q, q));
  });
  app.post('/api/notes', auth, (req, res) => {
    const { title, body = '' } = req.body || {};
    if (typeof title !== 'string' || !title.trim() || title.length > 120) return res.status(400).json({ error: 'Título obrigatório (até 120 caracteres)' });
    if (typeof body !== 'string' || body.length > 10000) return res.status(400).json({ error: 'Texto inválido' });
    const id = db.prepare('INSERT INTO notes (user_id, title, body) VALUES (?, ?, ?)').run(req.user.id, title.trim(), body).lastInsertRowid;
    res.status(201).json(db.prepare(`SELECT ${cols} FROM notes WHERE id = ?`).get(id));
  });
  const own = (req) => db.prepare(`SELECT ${cols} FROM notes WHERE id = ? AND user_id = ?`).get(Number(req.params.id), req.user.id);
  app.get('/api/notes/:id', auth, (req, res) => { const n = own(req); n ? res.json(n) : res.status(404).json({ error: 'Nota não encontrada' }); });
  app.put('/api/notes/:id', auth, (req, res) => {
    const n = own(req); if (!n) return res.status(404).json({ error: 'Nota não encontrada' });
    const { title = n.title, body = n.body } = req.body || {};
    if (typeof title !== 'string' || !title.trim() || title.length > 120 || typeof body !== 'string') return res.status(400).json({ error: 'Dados inválidos' });
    db.prepare("UPDATE notes SET title = ?, body = ?, updated_at = datetime('now') WHERE id = ?").run(title.trim(), body, n.id);
    res.json(own(req));
  });
  app.delete('/api/notes/:id', auth, (req, res) => {
    const n = own(req); if (!n) return res.status(404).json({ error: 'Nota não encontrada' });
    db.prepare('DELETE FROM notes WHERE id = ?').run(n.id); res.status(204).end();
  });
  return app;
}
module.exports = { createApp };
