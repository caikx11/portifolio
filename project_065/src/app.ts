import express, { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserStore, User } from './store';

export interface AppOptions { jwtSecret: string; store?: UserStore; bcryptRounds?: number; expiresIn?: string }
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const publicUser = (u: User) => ({ id: u.id, email: u.email, name: u.name, createdAt: u.createdAt });

export function createApp(opts: AppOptions) {
  if (!opts.jwtSecret || opts.jwtSecret.length < 16) throw new Error('JWT_SECRET precisa de ao menos 16 caracteres');
  const store = opts.store ?? new UserStore();
  const rounds = opts.bcryptRounds ?? 10;
  const sign = (u: User) => jwt.sign({ sub: String(u.id) }, opts.jwtSecret, { expiresIn: (opts.expiresIn ?? '1h') as any });
  const app = express();
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });
  app.use(express.json());

  app.post('/api/register', async (req, res) => {
    const { email, password, name } = req.body ?? {};
    if (typeof email !== 'string' || !EMAIL.test(email)) return res.status(400).json({ error: 'E-mail inválido' });
    if (typeof password !== 'string' || password.length < 8) return res.status(400).json({ error: 'A senha precisa de ao menos 8 caracteres' });
    if (typeof name !== 'string' || !name.trim()) return res.status(400).json({ error: 'Nome obrigatório' });
    if (store.findByEmail(email)) return res.status(409).json({ error: 'E-mail já cadastrado' });
    const user = store.create({ email, name: name.trim(), passwordHash: await bcrypt.hash(password, rounds) });
    res.status(201).json({ user: publicUser(user), token: sign(user) });
  });

  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body ?? {};
    const user = typeof email === 'string' ? store.findByEmail(email) : undefined;
    const ok = user && typeof password === 'string' && (await bcrypt.compare(password, user.passwordHash));
    if (!user || !ok) return res.status(401).json({ error: 'Credenciais inválidas' });
    res.json({ user: publicUser(user), token: sign(user) });
  });

  const auth = (req: Request, res: Response, next: NextFunction) => {
    const m = /^Bearer (.+)$/.exec(req.headers.authorization ?? '');
    if (!m) return res.status(401).json({ error: 'Token ausente' });
    try {
      const payload = jwt.verify(m[1], opts.jwtSecret) as jwt.JwtPayload;
      (req as any).userId = Number(payload.sub);
      next();
    } catch { res.status(401).json({ error: 'Token inválido ou expirado' }); }
  };

  app.get('/api/me', auth, (req, res) => {
    const user = store.findById((req as any).userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({ user: publicUser(user) });
  });

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  return app;
}
